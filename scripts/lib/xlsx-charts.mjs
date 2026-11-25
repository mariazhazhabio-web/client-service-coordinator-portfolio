/*
 * ExcelJS cannot create charts, so this post-processes the saved XLSX (a ZIP of XML parts)
 * and injects native DrawingML charts that reference worksheet ranges. The charts stay live
 * and editable in Excel, Google Sheets and LibreOffice.
 */
import JSZip from "jszip";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function chartXml(spec) {
  const ax1 = 50010, ax2 = 50020;
  const sers = spec.series.map((s, i) => spec.type === "line"
    ? `<c:ser><c:idx val="${i}"/><c:order val="${i}"/><c:tx><c:v>${esc(s.name)}</c:v></c:tx><c:spPr><a:ln w="28575" cap="rnd"><a:solidFill><a:srgbClr val="${s.color}"/></a:solidFill><a:round/></a:ln></c:spPr><c:marker><c:symbol val="circle"/><c:size val="6"/></c:marker><c:cat><c:strRef><c:f>${esc(spec.cats)}</c:f></c:strRef></c:cat><c:val><c:numRef><c:f>${esc(s.ref)}</c:f></c:numRef></c:val><c:smooth val="0"/></c:ser>`
    : `<c:ser><c:idx val="${i}"/><c:order val="${i}"/><c:tx><c:v>${esc(s.name)}</c:v></c:tx><c:spPr><a:solidFill><a:srgbClr val="${s.color}"/></a:solidFill></c:spPr><c:invertIfNegative val="0"/><c:cat><c:strRef><c:f>${esc(spec.cats)}</c:f></c:strRef></c:cat><c:val><c:numRef><c:f>${esc(s.ref)}</c:f></c:numRef></c:val></c:ser>`).join("");
  const plot = spec.type === "line"
    ? `<c:lineChart><c:grouping val="standard"/><c:varyColors val="0"/>${sers}<c:marker val="1"/><c:axId val="${ax1}"/><c:axId val="${ax2}"/></c:lineChart>`
    : `<c:barChart><c:barDir val="col"/><c:grouping val="clustered"/><c:varyColors val="0"/>${sers}<c:gapWidth val="80"/><c:axId val="${ax1}"/><c:axId val="${ax2}"/></c:barChart>`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><c:roundedCorners val="0"/><c:chart><c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="1200" b="1"/></a:pPr><a:r><a:rPr lang="en-US" sz="1200" b="1"><a:solidFill><a:srgbClr val="112144"/></a:solidFill></a:rPr><a:t>${esc(spec.title)}</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title><c:autoTitleDeleted val="0"/><c:plotArea><c:layout/>${plot}<c:catAx><c:axId val="${ax1}"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="b"/><c:numFmt formatCode="General" sourceLinked="0"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/><c:txPr><a:bodyPr rot="-2700000"/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="800"/></a:pPr><a:endParaRPr lang="en-US"/></a:p></c:txPr><c:crossAx val="${ax2}"/><c:crosses val="autoZero"/><c:auto val="1"/><c:lblAlgn val="ctr"/><c:lblOffset val="100"/><c:noMultiLvlLbl val="0"/></c:catAx><c:valAx><c:axId val="${ax2}"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="l"/><c:majorGridlines><c:spPr><a:ln w="6350"><a:solidFill><a:srgbClr val="E4E7EC"/></a:solidFill></a:ln></c:spPr></c:majorGridlines><c:numFmt formatCode="General" sourceLinked="1"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/><c:crossAx val="${ax1}"/><c:crosses val="autoZero"/><c:crossBetween val="between"/></c:valAx></c:plotArea><c:legend><c:legendPos val="b"/><c:overlay val="0"/></c:legend><c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/></c:chart></c:chartSpace>`;
}

function anchorXml(a, idx, rid) {
  return `<xdr:twoCellAnchor editAs="oneCell"><xdr:from><xdr:col>${a.col}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${a.row}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:to><xdr:col>${a.col + a.w}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${a.row + a.h}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to><xdr:graphicFrame macro=""><xdr:nvGraphicFramePr><xdr:cNvPr id="${idx + 2}" name="Chart ${idx + 1}"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr><xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" r:id="${rid}"/></a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/></xdr:twoCellAnchor>`;
}

export async function injectCharts(buffer, specs) {
  const zip = await JSZip.loadAsync(buffer);
  const wbXml = await zip.file("xl/workbook.xml").async("string");
  const wbRels = await zip.file("xl/_rels/workbook.xml.rels").async("string");
  let ct = await zip.file("[Content_Types].xml").async("string");

  const sheetTarget = (name) => {
    const m = wbXml.match(new RegExp(`<sheet[^>]*name="${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*r:id="(rId\\d+)"`)) || wbXml.match(new RegExp(`<sheet[^>]*r:id="(rId\\d+)"[^>]*name="${name}"`));
    if (!m) throw new Error(`Sheet not found: ${name}`);
    const t = wbRels.match(new RegExp(`<Relationship[^>]*Id="${m[1]}"[^>]*Target="([^"]+)"`)) || wbRels.match(new RegExp(`<Relationship[^>]*Target="([^"]+)"[^>]*Id="${m[1]}"`));
    return `xl/${t[1].replace(/^\/?xl\//, "")}`;
  };

  const bySheet = new Map();
  specs.forEach((s) => { if (!bySheet.has(s.sheet)) bySheet.set(s.sheet, []); bySheet.get(s.sheet).push(s); });
  let chartNo = 0, drawingNo = 0;
  for (const [sheet, list] of bySheet) {
    drawingNo++;
    const sheetPath = sheetTarget(sheet);
    const sheetFile = sheetPath.split("/").pop();
    const relsPath = `xl/worksheets/_rels/${sheetFile}.rels`;
    const anchors = [];
    const dRels = [];
    list.forEach((spec, i) => {
      chartNo++;
      zip.file(`xl/charts/chart${chartNo}.xml`, chartXml(spec));
      ct = ct.replace("</Types>", `<Override PartName="/xl/charts/chart${chartNo}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/></Types>`);
      dRels.push(`<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart${chartNo}.xml"/>`);
      anchors.push(anchorXml(spec.anchor, i, `rId${i + 1}`));
    });
    zip.file(`xl/drawings/drawing${drawingNo}.xml`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${anchors.join("")}</xdr:wsDr>`);
    zip.file(`xl/drawings/_rels/drawing${drawingNo}.xml.rels`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${dRels.join("")}</Relationships>`);
    ct = ct.replace("</Types>", `<Override PartName="/xl/drawings/drawing${drawingNo}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>`);

    const drawRid = "rIdChartDrawing1";
    const relEntry = `<Relationship Id="${drawRid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing${drawingNo}.xml"/>`;
    if (zip.file(relsPath)) {
      const r = await zip.file(relsPath).async("string");
      zip.file(relsPath, r.replace("</Relationships>", `${relEntry}</Relationships>`));
    } else {
      zip.file(relsPath, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relEntry}</Relationships>`);
    }
    let sx = await zip.file(sheetPath).async("string");
    if (!/xmlns:r=/.test(sx.slice(0, 600))) sx = sx.replace("<worksheet ", '<worksheet xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ');
    const tag = `<drawing r:id="${drawRid}"/>`;
    const before = ["<legacyDrawing", "<legacyDrawingHF", "<picture", "<oleObjects", "<controls", "<webPublishItems", "<tableParts", "<extLst", "</worksheet>"];
    const pos = Math.min(...before.map((b) => sx.indexOf(b)).filter((i) => i >= 0));
    sx = sx.slice(0, pos) + tag + sx.slice(pos);
    zip.file(sheetPath, sx);
  }
  zip.file("[Content_Types].xml", ct);
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}
