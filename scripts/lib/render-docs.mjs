/*
 * Renders a simple block model to both DOCX (docx library) and PDF (PDFKit),
 * so every document exists in two formats with identical content.
 *
 * Block types:
 *  { t: "title", text, sub? } | { t: "h1", text } | { t: "h2", text } | { t: "p", text, italic?, bold?, size? }
 *  { t: "bullets", items } | { t: "numbers", items } | { t: "table", head, rows, widths? } | { t: "note", text }
 *  { t: "kv", items: [[k, v], ...] } | { t: "spacer" } | { t: "pagebreak" }
 */
import fs from "node:fs";
import PDFDocument from "pdfkit";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType,
  BorderStyle, ShadingType, Footer, PageNumber, LevelFormat, PageBreak,
} from "docx";

const NAVY = "112144", GOLD = "B98B30", GRAY = "6B7485", LIGHT = "F1F3F6";
const CONTENT_DXA = 9360; // 8.5in - 2 x 1in margins

/** PDFKit's built-in fonts are WinAnsi only, so replace a few symbols. */
const pdfSafe = (s) => String(s)
  .replace(/→/g, "->").replace(/↔/g, "<->").replace(/[✓✔]/g, "Yes").replace(/■/g, "-").replace(/≥/g, ">=").replace(/≤/g, "<=").replace(/÷/g, "/")
  .replace(/[^\x00-\xFF–—‘’“”•…€™]/g, "");

/* ---------------- DOCX ---------------- */
function runs(text, opts = {}) {
  return [new TextRun({ text: String(text), ...opts })];
}

export async function toDocx(blocks, { footer, file, title }) {
  const children = [];
  let listInstance = 0;
  for (const b of blocks) {
    switch (b.t) {
      case "title":
        children.push(new Paragraph({ alignment: b.center ? AlignmentType.CENTER : AlignmentType.LEFT, spacing: { after: 60 }, children: runs(b.text, { bold: true, size: 36, color: NAVY, font: "Calibri" }) }));
        if (b.sub) children.push(new Paragraph({ alignment: b.center ? AlignmentType.CENTER : AlignmentType.LEFT, spacing: { after: 200 }, border: { bottom: { color: GOLD, style: BorderStyle.SINGLE, size: 12, space: 6 } }, children: runs(b.sub, { size: 22, color: GRAY }) }));
        break;
      case "h1":
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: runs(b.text) }));
        break;
      case "h2":
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: runs(b.text) }));
        break;
      case "p":
        children.push(new Paragraph({ spacing: { after: 120 }, alignment: b.center ? AlignmentType.CENTER : undefined, children: runs(b.text, { italics: !!b.italic, bold: !!b.bold, size: b.size ? b.size * 2 : undefined, color: b.color }) }));
        break;
      case "note":
        children.push(new Paragraph({ spacing: { before: 120, after: 160 }, shading: { type: ShadingType.CLEAR, fill: "FBF7EC", color: "auto" }, border: { left: { color: GOLD, style: BorderStyle.SINGLE, size: 18, space: 6 } }, children: runs(b.text, { italics: true, size: 19, color: "72521E" }) }));
        break;
      case "bullets":
        b.items.forEach((it) => children.push(new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: runs(it) })));
        break;
      case "numbers":
        listInstance++;
        b.items.forEach((it) => children.push(new Paragraph({ numbering: { reference: "numbers", level: 0, instance: listInstance }, spacing: { after: 60 }, children: runs(it) })));
        break;
      case "kv":
        b.items.forEach(([k, v]) => children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: `${k}: `, bold: true }), new TextRun({ text: String(v) })] })));
        break;
      case "table": {
        const n = b.head.length;
        const widths = (b.widths ?? Array(n).fill(1 / n)).map((w) => Math.round(w * CONTENT_DXA));
        const mk = (cells, header, zebra) => new TableRow({
          tableHeader: header,
          children: cells.map((c, i) => new TableCell({
            width: { size: widths[i], type: WidthType.DXA },
            shading: header ? { type: ShadingType.CLEAR, fill: NAVY, color: "auto" } : zebra ? { type: ShadingType.CLEAR, fill: LIGHT, color: "auto" } : undefined,
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({ children: runs(c, header ? { bold: true, color: "FFFFFF", size: 19 } : { size: 19 }) })],
          })),
        });
        children.push(new Table({
          width: { size: CONTENT_DXA, type: WidthType.DXA },
          columnWidths: widths,
          borders: { top: { style: BorderStyle.SINGLE, size: 4, color: "CFD4DC" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "CFD4DC" }, left: { style: BorderStyle.SINGLE, size: 4, color: "CFD4DC" }, right: { style: BorderStyle.SINGLE, size: 4, color: "CFD4DC" }, insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "CFD4DC" }, insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "CFD4DC" } },
          rows: [mk(b.head, true, false), ...b.rows.map((r, i) => mk(r, false, i % 2 === 1))],
        }));
        children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
        break;
      }
      case "spacer":
        children.push(new Paragraph({ children: [] }));
        break;
      case "pagebreak":
        children.push(new Paragraph({ children: [new PageBreak()] }));
        break;
    }
  }
  const doc = new Document({
    title: title ?? "Document",
    creator: "Maria Zha-Zha Cornillez Bio",
    styles: {
      default: { document: { run: { font: "Calibri", size: 21, color: "1B2440" } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, color: NAVY }, paragraph: { spacing: { before: 280, after: 100 }, border: { bottom: { color: GOLD, style: BorderStyle.SINGLE, size: 6, space: 2 } } } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 22, bold: true, color: "213B73" }, paragraph: { spacing: { before: 180, after: 60 } } },
      ],
    },
    numbering: {
      config: [
        { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 240 } } } }] },
        { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 300 } } } }] },
      ],
    },
    sections: [{
      properties: { page: { margin: { top: 1080, bottom: 1080, left: 1440, right: 1440 } } },
      footers: {
        default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: footer ? `${footer}  ·  Page ` : "Page ", size: 15, color: GRAY }), new TextRun({ children: [PageNumber.CURRENT], size: 15, color: GRAY }), new TextRun({ text: " of ", size: 15, color: GRAY }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 15, color: GRAY })] })] }),
      },
      children,
    }],
  });
  fs.writeFileSync(file, await Packer.toBuffer(doc));
}

/* ---------------- PDF ---------------- */
export function toPdf(blocks, { footer, file, title }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "LETTER", margins: { top: 54, bottom: 64, left: 64, right: 64 }, bufferPages: true, info: { Title: title ?? "Document", Author: "Maria Zha-Zha Cornillez Bio" } });
    const out = fs.createWriteStream(file);
    doc.pipe(out);
    const W = doc.page.width - 128;
    const L = 64;
    const bottom = () => doc.page.height - 64;
    const ensure = (h) => { if (doc.y + h > bottom()) doc.addPage(); };
    const navy = "#112144", gold = "#B98B30", gray = "#6B7485";
    let num = 0;

    for (const b of blocks) {
      switch (b.t) {
        case "title":
          doc.font("Helvetica-Bold").fontSize(20).fillColor(navy).text(pdfSafe(b.text), L, doc.y, { width: W, align: b.center ? "center" : "left" });
          if (b.sub) {
            doc.moveDown(0.2).font("Helvetica").fontSize(10.5).fillColor(gray).text(pdfSafe(b.sub), { width: W, align: b.center ? "center" : "left" });
            doc.moveDown(0.3);
            doc.moveTo(L, doc.y).lineTo(L + W, doc.y).lineWidth(1.5).strokeColor(gold).stroke();
            doc.moveDown(0.6);
          }
          break;
        case "h1":
          ensure(40);
          doc.moveDown(0.5).font("Helvetica-Bold").fontSize(13).fillColor(navy).text(pdfSafe(b.text), L, doc.y, { width: W });
          doc.moveTo(L, doc.y + 1).lineTo(L + W, doc.y + 1).lineWidth(0.6).strokeColor(gold).stroke();
          doc.moveDown(0.4);
          break;
        case "h2":
          ensure(30);
          doc.moveDown(0.3).font("Helvetica-Bold").fontSize(11).fillColor("#213B73").text(pdfSafe(b.text), L, doc.y, { width: W });
          doc.moveDown(0.15);
          break;
        case "p":
          doc.font(b.bold ? "Helvetica-Bold" : b.italic ? "Helvetica-Oblique" : "Helvetica").fontSize(b.size ?? 10).fillColor(b.color ? `#${b.color}` : "#1B2440").text(pdfSafe(b.text), L, doc.y, { width: W, lineGap: 2, align: b.center ? "center" : "left" });
          doc.moveDown(0.45);
          break;
        case "note": {
          doc.font("Helvetica-Oblique").fontSize(9.5);
          const h = doc.heightOfString(pdfSafe(b.text), { width: W - 20 }) + 12;
          ensure(h + 6);
          const y = doc.y;
          doc.rect(L, y, W, h).fill("#FBF7EC");
          doc.rect(L, y, 3, h).fill(gold);
          doc.fillColor("#72521E").text(pdfSafe(b.text), L + 12, y + 6, { width: W - 20 });
          doc.y = y + h + 8;
          doc.x = L;
          break;
        }
        case "bullets":
        case "numbers":
          num = 0;
          for (const it of b.items) {
            num++;
            doc.font("Helvetica").fontSize(10);
            const h = doc.heightOfString(pdfSafe(it), { width: W - 18 });
            ensure(h + 2);
            const y = doc.y;
            doc.fillColor(b.t === "bullets" ? gold : navy).text(b.t === "bullets" ? "•" : `${num}.`, L + 2, y, { width: 16 });
            doc.fillColor("#1B2440").text(pdfSafe(it), L + 18, y, { width: W - 18, lineGap: 1.5 });
            doc.moveDown(0.2);
          }
          doc.x = L;
          doc.moveDown(0.3);
          break;
        case "kv":
          for (const [k, v] of b.items) {
            doc.font("Helvetica-Bold").fontSize(10).fillColor(navy).text(`${pdfSafe(k)}: `, L, doc.y, { continued: true, width: W }).font("Helvetica").fillColor("#1B2440").text(pdfSafe(v));
          }
          doc.moveDown(0.4);
          break;
        case "table": {
          const n = b.head.length;
          const ws = (b.widths ?? Array(n).fill(1 / n)).map((w) => w * W);
          const rowH = (cells, bold) => Math.max(...cells.map((c, i) => { doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(8.8); return doc.heightOfString(pdfSafe(c), { width: ws[i] - 8 }); })) + 8;
          const draw = (cells, header, zebra) => {
            const h = rowH(cells, header);
            if (doc.y + h > bottom()) { doc.addPage(); if (!header) draw(b.head, true, false); }
            const y = doc.y;
            let x = L;
            cells.forEach((c, i) => {
              if (header) doc.rect(x, y, ws[i], h).fill(navy);
              else if (zebra) doc.rect(x, y, ws[i], h).fill("#F1F3F6");
              doc.rect(x, y, ws[i], h).lineWidth(0.4).strokeColor("#CFD4DC").stroke();
              doc.font(header ? "Helvetica-Bold" : "Helvetica").fontSize(8.8).fillColor(header ? "#FFFFFF" : "#1B2440").text(pdfSafe(c), x + 4, y + 4, { width: ws[i] - 8 });
              x += ws[i];
            });
            doc.y = y + h;
          };
          ensure(40);
          draw(b.head, true, false);
          b.rows.forEach((r, i) => draw(r, false, i % 2 === 1));
          doc.x = L;
          doc.moveDown(0.8);
          break;
        }
        case "spacer":
          doc.moveDown(0.6);
          break;
        case "pagebreak":
          doc.addPage();
          break;
      }
    }
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      const oldBottom = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      doc.font("Helvetica").fontSize(7.5).fillColor(gray).text(pdfSafe(`${footer ? `${footer}  ·  ` : ""}Page ${i + 1} of ${range.count}`), 64, doc.page.height - 40, { width: doc.page.width - 128, align: "center", lineBreak: false });
      doc.page.margins.bottom = oldBottom;
    }
    doc.end();
    out.on("finish", resolve);
    out.on("error", reject);
  });
}

export async function renderBoth(blocks, base, opts = {}) {
  await toDocx(blocks, { ...opts, file: `${base}.docx` });
  await toPdf(blocks, { ...opts, file: `${base}.pdf` });
}
