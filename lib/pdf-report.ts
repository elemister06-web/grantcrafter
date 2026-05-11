import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont, PDFString, PDFName } from "pdf-lib";

// Color constants
const GREEN = rgb(0.082, 0.502, 0.239); // #15803d
const DARK = rgb(0.067, 0.094, 0.153);  // #111827
const GRAY = rgb(0.424, 0.447, 0.502);  // #6b7280
const LIGHT_GRAY = rgb(0.96, 0.965, 0.97); // background for grant names
const WHITE = rgb(1, 1, 1);
const THIN_GRAY = rgb(0.878, 0.894, 0.914); // #e0e4e9 for dividers

// Page dimensions (Letter)
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN_LEFT = 50;
const MARGIN_RIGHT = 50;
const MARGIN_TOP = 50;
const MARGIN_BOTTOM = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const HEADER_HEIGHT = 80;
const SLIM_HEADER_HEIGHT = 40;
const FOOTER_HEIGHT = 20;
const BOTTOM_BOUNDARY = MARGIN_BOTTOM + FOOTER_HEIGHT + 20;

const LINK_BLUE = rgb(0.082, 0.502, 0.239); // use brand green for links

// Extract first URL from a string
function extractURL(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s)>]+/);
  return match ? match[0] : null;
}

// Add a clickable URI annotation over a rect on the page
function addLinkAnnotation(
  pdfDoc: PDFDocument,
  page: PDFPage,
  url: string,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const linkAnnot = pdfDoc.context.obj({
    Type: PDFName.of("Annot"),
    Subtype: PDFName.of("Link"),
    Rect: [x, y, x + width, y + height],
    Border: [0, 0, 0],
    A: pdfDoc.context.obj({
      Type: PDFName.of("Action"),
      S: PDFName.of("URI"),
      URI: PDFString.of(url),
    }),
  });
  const annotRef = pdfDoc.context.register(linkAnnot);
  const annotsKey = PDFName.of("Annots");
  const existing = page.node.get(annotsKey);
  if (existing && "push" in existing) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (existing as any).push(annotRef);
  } else {
    page.node.set(annotsKey, pdfDoc.context.obj([annotRef]));
  }
}

// Strip characters outside WinAnsi range (pdf-lib standard fonts only support Latin-1)
function sanitize(text: string): string {
  return text
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, "") // strip emoji
    .replace(/[\u{2700}-\u{27BF}]/gu, "")   // dingbats
    .replace(/[\u{2600}-\u{26FF}]/gu, "")   // misc symbols
    .replace(/[^\x00-\xFF]/g, "")           // anything outside Latin-1
    .replace(/\s{2,}/g, " ")               // collapse extra spaces
    .trim();
}

// Wrap text into lines that fit within maxWidth
function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// Draw footer on a page
function drawFooter(page: PDFPage, regularFont: PDFFont) {
  const text = "GrantCrafter · grantcrafter.com · For informational purposes only";
  const fontSize = 9;
  const textWidth = regularFont.widthOfTextAtSize(text, fontSize);
  page.drawText(sanitize(text), {
    x: (PAGE_WIDTH - textWidth) / 2,
    y: MARGIN_BOTTOM - 10,
    size: fontSize,
    font: regularFont,
    color: GRAY,
  });
}

// Draw slim header on subsequent pages
function drawSlimHeader(
  page: PDFPage,
  boldFont: PDFFont,
  regularFont: PDFFont,
  pageNum: number
) {
  // Green bar
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - SLIM_HEADER_HEIGHT,
    width: PAGE_WIDTH,
    height: SLIM_HEADER_HEIGHT,
    color: GREEN,
  });
  // GrantCrafter text
  page.drawText(sanitize("GrantCrafter"), {
    x: MARGIN_LEFT,
    y: PAGE_HEIGHT - SLIM_HEADER_HEIGHT + 13,
    size: 14,
    font: boldFont,
    color: WHITE,
  });
  // Page number
  const pageText = `Page ${pageNum}`;
  const pageTextWidth = regularFont.widthOfTextAtSize(pageText, 10);
  page.drawText(sanitize(pageText), {
    x: PAGE_WIDTH - MARGIN_RIGHT - pageTextWidth,
    y: PAGE_HEIGHT - SLIM_HEADER_HEIGHT + 15,
    size: 10,
    font: regularFont,
    color: WHITE,
  });
}

export async function buildReportPDF(
  reportContent: string,
  businessName: string,
  periodLabel: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let pageNum = 1;
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  // ─── Cover / Page 1 Header ───────────────────────────────────────────────

  // Full green header bar
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - HEADER_HEIGHT,
    width: PAGE_WIDTH,
    height: HEADER_HEIGHT,
    color: GREEN,
  });
  // "GrantCrafter" left
  page.drawText(sanitize("GrantCrafter"), {
    x: MARGIN_LEFT,
    y: PAGE_HEIGHT - HEADER_HEIGHT + 30,
    size: 24,
    font: boldFont,
    color: WHITE,
  });
  // "Grant Report" right
  const headerSubText = "Grant Report";
  const headerSubWidth = regularFont.widthOfTextAtSize(headerSubText, 12);
  page.drawText(sanitize(headerSubText), {
    x: PAGE_WIDTH - MARGIN_RIGHT - headerSubWidth,
    y: PAGE_HEIGHT - HEADER_HEIGHT + 34,
    size: 12,
    font: regularFont,
    color: WHITE,
  });

  // Current Y position after header
  let y = PAGE_HEIGHT - HEADER_HEIGHT - 30;

  // Business name
  page.drawText(sanitize(businessName), {
    x: MARGIN_LEFT,
    y,
    size: 18,
    font: boldFont,
    color: DARK,
  });
  y -= 24;

  // Period label
  page.drawText(sanitize(periodLabel), {
    x: MARGIN_LEFT,
    y,
    size: 12,
    font: regularFont,
    color: GRAY,
  });
  y -= 20;

  // Green rule line
  page.drawLine({
    start: { x: MARGIN_LEFT, y },
    end: { x: PAGE_WIDTH - MARGIN_RIGHT, y },
    thickness: 2,
    color: GREEN,
  });
  y -= 18;

  // Disclaimer text
  const disclaimer =
    "This report identifies grant opportunities based on your business profile. Awards are determined solely by each granting organization. For informational purposes only.";
  const disclaimerLines = wrapText(disclaimer, regularFont, 10, CONTENT_WIDTH);
  for (const line of disclaimerLines) {
    page.drawText(sanitize(line), {
      x: MARGIN_LEFT,
      y,
      size: 10,
      font: regularFont,
      color: GRAY,
    });
    y -= 14;
  }
  y -= 10;

  drawFooter(page, regularFont);

  // ─── Helper: add new page ────────────────────────────────────────────────
  function addPage() {
    pageNum++;
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawSlimHeader(page, boldFont, regularFont, pageNum);
    drawFooter(page, regularFont);
    y = PAGE_HEIGHT - SLIM_HEADER_HEIGHT - 30;
  }

  function ensureSpace(needed: number) {
    if (y - needed < BOTTOM_BOUNDARY) {
      addPage();
    }
  }

  // ─── Parse and render markdown lines ────────────────────────────────────
  const lines = reportContent.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];

    // ## Section Header
    if (/^## (.+)$/.test(raw)) {
      const title = raw.replace(/^## /, "");
      ensureSpace(36);
      y -= 16; // top padding
      page.drawText(sanitize(title), {
        x: MARGIN_LEFT,
        y,
        size: 14,
        font: boldFont,
        color: GREEN,
      });
      y -= 18;
      // underline
      page.drawLine({
        start: { x: MARGIN_LEFT, y: y + 2 },
        end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: y + 2 },
        thickness: 1,
        color: GREEN,
      });
      y -= 6;
      continue;
    }

    // **Grant Name** standalone line
    if (/^\*\*([^*]+)\*\*$/.test(raw)) {
      const name = raw.replace(/\*\*/g, "").trim();
      const nameLines = wrapText(name, boldFont, 13, CONTENT_WIDTH - 8);
      const blockHeight = 20 + (nameLines.length - 1) * 16;
      ensureSpace(12 + blockHeight);
      y -= 12; // top padding
      // Light gray background rectangle
      page.drawRectangle({
        x: MARGIN_LEFT,
        y: y - blockHeight + 16,
        width: CONTENT_WIDTH,
        height: blockHeight,
        color: LIGHT_GRAY,
      });
      for (let li = 0; li < nameLines.length; li++) {
        page.drawText(sanitize(nameLines[li]), {
          x: MARGIN_LEFT + 4,
          y: y - li * 16,
          size: 13,
          font: boldFont,
          color: DARK,
        });
      }
      y -= blockHeight;
      continue;
    }

    // - Field: Value bullet
    if (/^- (.+)$/.test(raw)) {
      const content = raw.replace(/^- /, "");
      const colonIdx = content.indexOf(":");
      let fieldText = "";
      let valueText = "";
      if (colonIdx > 0) {
        fieldText = content.slice(0, colonIdx + 1);
        valueText = content.slice(colonIdx + 1).trim();
      } else {
        valueText = content;
      }

      // Detect URL in value
      const detectedURL = extractURL(valueText);

      const bullet = "• ";
      const fullLine = bullet + (fieldText ? fieldText + " " : "") + valueText;
      const wrappedLines = wrapText(fullLine, regularFont, 10, CONTENT_WIDTH - 10);
      const totalHeight = wrappedLines.length * 14 + 4;
      ensureSpace(totalHeight);

      for (let li = 0; li < wrappedLines.length; li++) {
        const lineText = wrappedLines[li];
        if (li === 0 && fieldText) {
          // Draw bullet + field in bold, then value in regular
          const bulletAndField = bullet + fieldText + " ";
          const bfWidth = boldFont.widthOfTextAtSize(bulletAndField, 10);
          page.drawText(sanitize(bulletAndField), {
            x: MARGIN_LEFT + 8,
            y,
            size: 10,
            font: boldFont,
            color: DARK,
          });
          // Draw value — check if it contains a URL
          const remainingValue = lineText.slice(bulletAndField.length);
          if (remainingValue) {
            const urlInValue = extractURL(remainingValue);
            if (urlInValue && li === 0) {
              // Split: text before URL, URL, text after URL
              const urlStart = remainingValue.indexOf(urlInValue);
              const beforeURL = remainingValue.slice(0, urlStart);
              const afterURL = remainingValue.slice(urlStart + urlInValue.length);
              let xCursor = MARGIN_LEFT + 8 + bfWidth;
              if (beforeURL) {
                page.drawText(sanitize(beforeURL), { x: xCursor, y, size: 10, font: regularFont, color: GRAY });
                xCursor += regularFont.widthOfTextAtSize(beforeURL, 10);
              }
              const urlDisplay = urlInValue.length > 50 ? urlInValue.slice(0, 47) + "..." : urlInValue;
              const urlWidth = regularFont.widthOfTextAtSize(urlDisplay, 10);
              page.drawText(sanitize(urlDisplay), { x: xCursor, y, size: 10, font: regularFont, color: LINK_BLUE });
              page.drawLine({ start: { x: xCursor, y: y - 1 }, end: { x: xCursor + urlWidth, y: y - 1 }, thickness: 0.5, color: LINK_BLUE });
              addLinkAnnotation(pdfDoc, page, urlInValue, xCursor, y - 2, urlWidth, 12);
              if (afterURL) {
                page.drawText(sanitize(afterURL), { x: xCursor + urlWidth, y, size: 10, font: regularFont, color: GRAY });
              }
            } else {
              page.drawText(sanitize(remainingValue), { x: MARGIN_LEFT + 8 + bfWidth, y, size: 10, font: regularFont, color: GRAY });
            }
          }
        } else {
          // Continuation lines or plain bullets — check for URL
          const urlInLine = extractURL(lineText);
          if (urlInLine) {
            const urlStart = lineText.indexOf(urlInLine);
            const before = lineText.slice(0, urlStart);
            const after = lineText.slice(urlStart + urlInLine.length);
            let xCursor = MARGIN_LEFT + 8;
            if (before) {
              page.drawText(sanitize(before), { x: xCursor, y, size: 10, font: regularFont, color: li === 0 ? DARK : GRAY });
              xCursor += regularFont.widthOfTextAtSize(before, 10);
            }
            const urlDisplay = urlInLine.length > 55 ? urlInLine.slice(0, 52) + "..." : urlInLine;
            const urlWidth = regularFont.widthOfTextAtSize(urlDisplay, 10);
            page.drawText(sanitize(urlDisplay), { x: xCursor, y, size: 10, font: regularFont, color: LINK_BLUE });
            page.drawLine({ start: { x: xCursor, y: y - 1 }, end: { x: xCursor + urlWidth, y: y - 1 }, thickness: 0.5, color: LINK_BLUE });
            addLinkAnnotation(pdfDoc, page, urlInLine, xCursor, y - 2, urlWidth, 12);
            if (after) {
              page.drawText(sanitize(after), { x: xCursor + urlWidth, y, size: 10, font: regularFont, color: GRAY });
            }
          } else {
            page.drawText(sanitize(lineText), { x: MARGIN_LEFT + 8, y, size: 10, font: regularFont, color: li === 0 ? DARK : GRAY });
          }
        }
        y -= 14;
      }
      y -= 4; // bottom padding
      continue;
    }

    // --- horizontal rule
    if (/^---$/.test(raw)) {
      ensureSpace(20);
      y -= 8;
      page.drawLine({
        start: { x: MARGIN_LEFT, y },
        end: { x: PAGE_WIDTH - MARGIN_RIGHT, y },
        thickness: 0.5,
        color: THIN_GRAY,
      });
      y -= 12;
      continue;
    }

    // Blank line
    if (raw.trim() === "") {
      y -= 6;
      continue;
    }

    // Strip single-# headings
    if (/^# /.test(raw)) {
      continue;
    }

    // ### subheadings
    if (/^### (.+)$/.test(raw)) {
      const title = raw.replace(/^### /, "");
      ensureSpace(20);
      page.drawText(sanitize(title), {
        x: MARGIN_LEFT,
        y,
        size: 11,
        font: boldFont,
        color: DARK,
      });
      y -= 16;
      continue;
    }

    // Strip inline markdown for regular text
    const cleaned = raw
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`(.+?)`/g, "$1");

    if (!cleaned.trim()) {
      y -= 4;
      continue;
    }

    const textLines = wrapText(cleaned, regularFont, 10, CONTENT_WIDTH);
    for (const tl of textLines) {
      ensureSpace(14);
      page.drawText(sanitize(tl), {
        x: MARGIN_LEFT,
        y,
        size: 10,
        font: regularFont,
        color: DARK,
      });
      y -= 14;
    }
  }

  return pdfDoc.save();
}
