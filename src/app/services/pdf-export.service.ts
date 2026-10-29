import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

@Injectable({ providedIn: 'root' })
export class PdfExportService {
  private readonly pageWidth = 297;
  private readonly pageHeight = 210;
  private readonly pagePadding = 10;
  private readonly pdfFilterSelector = '.global-filters, .geo-filters, .filters-card, .filters-actions, .climate-controls, .climate-tabs, .controls, .with-filter label, .usage-toggle, .pagination';

  public async exportElement(element: HTMLElement, fileName: string): Promise<void> {
    await document.fonts?.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const interactiveElements = Array.from(element.querySelectorAll<HTMLElement>('button, a, [role="button"]'));
    const filterElements = Array.from(element.querySelectorAll<HTMLElement>(this.pdfFilterSelector));
    const previousVisibility = interactiveElements.map((interactiveElement) => ({
      interactiveElement,
      visibility: interactiveElement.style.visibility,
      opacity: interactiveElement.style.opacity
    }));
    interactiveElements.forEach((interactiveElement) => {
      interactiveElement.style.visibility = 'hidden';
      interactiveElement.style.opacity = '0';
    });
    const previousFilterDisplay = filterElements.map((filterElement) => ({
      filterElement,
      display: filterElement.style.display
    }));
    filterElements.forEach((filterElement) => {
      filterElement.style.display = 'none';
    });

    let canvas: HTMLCanvasElement;
    let breakPositions: number[];
    try {
      canvas = await html2canvas(element, {
        backgroundColor: '#f7f8fa',
        scale: Math.min(window.devicePixelRatio || 1, 2),
        useCORS: true,
        allowTaint: false,
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        scrollX: 0,
        scrollY: -window.scrollY,
        ignoreElements: (candidate) => {
          const candidateElement = candidate as HTMLElement;
          return candidateElement.matches(`button, a, [role="button"], ${this.pdfFilterSelector}`)
            || Boolean(candidateElement.closest(`button, a, [role="button"], ${this.pdfFilterSelector}`));
        },
        onclone: (clonedDocument) => {
          const style = clonedDocument.createElement('style');
          style.textContent = `
            button, a, [role="button"] {
              visibility: hidden !important;
              opacity: 0 !important;
              color: transparent !important;
              background: transparent !important;
              border-color: transparent !important;
              box-shadow: none !important;
            }
          `;
          clonedDocument.head.appendChild(style);
        }
      });
      breakPositions = this.getNaturalBreaks(element, canvas, Math.ceil(canvas.width * (this.pageHeight - (this.pagePadding * 2)) / (this.pageWidth - (this.pagePadding * 2))));
    } finally {
      previousVisibility.forEach(({ interactiveElement, visibility, opacity }) => {
        interactiveElement.style.visibility = visibility;
        interactiveElement.style.opacity = opacity;
      });
      previousFilterDisplay.forEach(({ filterElement, display }) => {
        filterElement.style.display = display;
      });
    }

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
    const contentWidth = this.pageWidth - (this.pagePadding * 2);
    const contentHeight = this.pageHeight - (this.pagePadding * 2);
    const pageCanvasHeight = Math.ceil(canvas.width * contentHeight / contentWidth);

    for (let page = 0; page < breakPositions.length - 1; page += 1) {
      if (page > 0) pdf.addPage('a4', 'landscape');

      const sourceY = breakPositions[page];
      const sliceHeight = breakPositions[page + 1] - sourceY;
      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = sliceHeight;
      const context = slice.getContext('2d');
      if (!context) continue;

      context.fillStyle = '#f7f8fa';
      context.fillRect(0, 0, slice.width, slice.height);
      context.drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, slice.width, sliceHeight);

      pdf.setFillColor(247, 248, 250);
      pdf.rect(0, 0, this.pageWidth, this.pageHeight, 'F');
      const imageHeight = sliceHeight * contentWidth / canvas.width;
      pdf.addImage(slice.toDataURL('image/jpeg', 0.96), 'JPEG', this.pagePadding, this.pagePadding, contentWidth, imageHeight, undefined, 'FAST');
    }

    pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
  }

  private getNaturalBreaks(element: HTMLElement, canvas: HTMLCanvasElement, pageCanvasHeight: number): number[] {
    const scale = canvas.width / Math.max(element.scrollWidth, 1);
    const rootRect = element.getBoundingClientRect();
    const candidates = Array.from(element.querySelectorAll<HTMLElement>(
      'header, section, article, .panel, .kpi-grid, .coverage-kpis, .three-column-grid, .two-column-grid, .two-column, .table-scroll, .chart-box, .detail-list, .detail-row, .metric-cards, .property-cards, .comparison-cards, .sanidad-grid, .recommendation, .recommendation-card, .protocol-card, [class*="-card"]'
    ));
    const breaks = candidates
      .map((candidate) => {
        const rect = candidate.getBoundingClientRect();
        return Math.round((rect.bottom - rootRect.top) * scale);
      })
      .filter((position) => position > 24 && position < canvas.height - 24);

    const naturalPositions = Array.from(new Set([0, ...breaks, canvas.height])).sort((a, b) => a - b);
    const result = [0];
    let current = 0;
    const minimumChunk = Math.min(pageCanvasHeight * 0.18, pageCanvasHeight - 1);

    while (current < canvas.height) {
      const target = Math.min(current + pageCanvasHeight, canvas.height);
      if (target >= canvas.height) {
        result.push(canvas.height);
        break;
      }

      const eligible = naturalPositions.filter((position) =>
        position > current + minimumChunk && position <= target
      );
      const next = eligible.length ? eligible[eligible.length - 1] : target;
      result.push(next);
      current = next;
    }

    return result;
  }
}
