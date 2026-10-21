import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

@Injectable({ providedIn: 'root' })
export class PdfExportService {
  private readonly pageWidth = 297;
  private readonly pageHeight = 210;

  public async exportElement(element: HTMLElement, fileName: string): Promise<void> {
    await document.fonts?.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const canvas = await html2canvas(element, {
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
      scrollY: -window.scrollY
    });

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
    const pageCanvasHeight = Math.ceil(canvas.width * this.pageHeight / this.pageWidth);
    const pageCount = Math.max(1, Math.ceil(canvas.height / pageCanvasHeight));

    for (let page = 0; page < pageCount; page += 1) {
      if (page > 0) pdf.addPage('a4', 'landscape');

      const sourceY = page * pageCanvasHeight;
      const sliceHeight = Math.min(pageCanvasHeight, canvas.height - sourceY);
      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = sliceHeight;
      const context = slice.getContext('2d');
      if (!context) continue;

      context.fillStyle = '#f7f8fa';
      context.fillRect(0, 0, slice.width, slice.height);
      context.drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, slice.width, sliceHeight);

      const imageHeight = sliceHeight * this.pageWidth / canvas.width;
      pdf.addImage(slice.toDataURL('image/jpeg', 0.96), 'JPEG', 0, 0, this.pageWidth, imageHeight, undefined, 'FAST');
    }

    pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
  }
}
