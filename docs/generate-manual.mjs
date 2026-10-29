import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const docs = path.join(root, 'docs');
const assets = path.join(docs, 'assets', 'manual-pecuario');
const output = path.join(docs, 'manual-tecnico-pecuario.docx');
fs.mkdirSync(assets, { recursive: true });

const esc = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&apos;');

const colors = { green: '#22685d', gold: '#ad8127', ink: '#182237', muted: '#697586', line: '#dfe5ea', bg: '#f7f8fa', gray: '#9d9da0', red: '#a1244e' };
const svgText = (x, y, text, size = 16, fill = colors.ink, weight = 400, anchor = 'start') => `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}">${esc(text)}</text>`;
const rect = (x, y, w, h, fill = '#fff', rx = 12, stroke = 'none') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>`;
const line = (x1, y1, x2, y2, stroke = colors.line, width = 1) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}"/>`;
const bar = (x, y, w, h, fill = colors.green, rx = 5) => rect(x, y, w, h, fill, rx);
const svgWrap = (width, height, content) => `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${colors.bg}"/>${content}</svg>`;

function donut(cx, cy, r, percent, primary, secondary) {
  const circumference = 2 * Math.PI * r;
  const dash = `${(circumference * percent / 100).toFixed(1)} ${(circumference * (1 - percent / 100)).toFixed(1)}`;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${secondary}" stroke-width="34"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${primary}" stroke-width="34" stroke-dasharray="${dash}" transform="rotate(-90 ${cx} ${cy})"/>`;
}

function saveFigure(name, width, height, content) {
  fs.writeFileSync(path.join(assets, name), svgWrap(width, height, content));
}

function figure1() {
  let c = svgText(34, 42, 'Resumen Pecuario', 25, colors.ink, 700) + svgText(34, 65, 'Vista general de la actividad ganadera bovina registrada', 13, colors.muted);
  ['Exportar CSV', 'Exportar PDF', 'Actualizar Datos'].forEach((v, i) => c += rect(965 + i * 126, 25, 115, 32, i === 1 ? colors.red : '#fff', 16, i === 1 ? colors.red : colors.red) + svgText(1022 + i * 126, 46, v, 11, i === 1 ? '#fff' : colors.red, 700, 'middle'));
  c += rect(24, 84, 1224, 48, '#fff', 13, colors.line) + svgText(42, 106, 'Ámbito geográfico', 13, colors.ink, 700) + svgText(42, 122, 'Filtra los indicadores pecuarios por región', 10, colors.muted) + rect(1110, 95, 112, 27, '#fff', 8, colors.line) + svgText(1166, 113, 'Nacional', 10, colors.muted, 400, 'middle');
  const cards = [['Total Productores', '800', '80%'], ['Total de UPP', '1,247', '74%'], ['Razas Registradas', '12', '75%'], ['Índice Trazabilidad', '72%', '72%']];
  cards.forEach((item, i) => { const x = 24 + i * 306; c += rect(x, 150, 290, 132, '#fff', 15, colors.line) + svgText(x + 18, 181, item[0], 12, colors.muted) + svgText(x + 18, 218, item[1], 28, colors.ink, 700) + svgText(x + 18, 244, 'Indicador pecuario', 10, colors.muted) + svgText(x + 18, 263, 'Progreso', 9, colors.muted) + svgText(x + 272, 263, item[2], 9, colors.ink, 700, 'end') + bar(x + 18, 269, 254, 6, '#edf0f2', 5) + bar(x + 18, 269, 254 * Number(item[2].replace('%', '')) / 100, 6, colors.gold, 5); });
  const panels = [['Perfil por Sexo', 24], ['Perfil por Edad', 424], ['Grupo Indígena', 824]];
  panels.forEach(([title, x], idx) => { c += rect(x, 300, 376, 245, '#fff', 15, colors.line) + svgText(x + 18, 329, title, 15, colors.ink, 700) + svgText(x + 18, 347, idx === 0 ? 'Distribución de productores' : idx === 1 ? 'Rangos etarios de productores' : 'Pertenencia a pueblos originarios', 10, colors.muted); });
  c += donut(142, 422, 53, 68, colors.green, '#ecd28d') + svgText(142, 503, 'Hombre 68%  ·  Mujer 32%', 10, colors.muted, 600, 'middle');
  [95, 280, 302, 118].forEach((h, i) => c += bar(470 + i * 68, 493 - h, 42, h, colors.green) + svgText(491 + i * 68, 514, ['<25', '25-40', '41-60', '>60'][i], 9, colors.muted, 400, 'middle'));
  c += donut(942, 422, 53, 23, colors.green, colors.gray) + svgText(942, 503, 'Sí 23%  ·  No 77%', 10, colors.muted, 600, 'middle');
  saveFigure('01-resumen-kpis.svg', 1280, 570, c);
}

function figure2() {
  let c = svgText(28, 36, 'Indicadores de inventario bovino', 22, colors.ink, 700) + svgText(28, 58, 'Distribución por finalidad zootécnica y raza', 12, colors.muted);
  c += rect(20, 78, 605, 420, '#fff', 15, colors.line) + rect(655, 78, 605, 420, '#fff', 15, colors.line);
  c += svgText(42, 111, 'Cabezas y Vientres', 16, colors.ink, 700) + svgText(42, 132, 'Distribución por finalidad zootécnica', 11, colors.muted) + svgText(58, 171, 'Total Cabezas', 11, colors.muted) + svgText(58, 198, '112,820', 24, colors.green, 700) + svgText(278, 171, 'Total Vientres', 11, colors.muted) + svgText(278, 198, '59,740', 24, colors.gold, 700);
  const vals = [45128, 28205, 39487]; const labels = ['Carne', 'Leche', 'Doble propósito']; vals.forEach((v, i) => { const x = 82 + i * 155; const h = v / 1100; c += bar(x, 420 - h, 74, h, colors.green) + svgText(x + 37, 445, labels[i], 10, colors.muted, 400, 'middle') + svgText(x + 37, 463, v.toLocaleString('en-US'), 10, colors.ink, 700, 'middle'); });
  c += svgText(677, 111, 'Razas Registradas', 16, colors.ink, 700) + svgText(677, 132, 'Razas bovinas registradas en el sistema', 11, colors.muted);
  const breeds = [['Brahman', 20307], ['Charolais', 15795], ['Angus', 13538], ['Holstein', 12410], ['Simmental', 10154], ['Suizo Pardo', 9026], ['Beefmaster', 7897], ['Hereford', 6769], ['Gyr', 5641], ['Indobrasil', 4513], ['Criollo', 3385], ['Jersey', 3385]];
  breeds.forEach(([name, v], i) => { const y = 164 + i * 24; c += svgText(680, y + 10, name, 10, colors.muted) + bar(758, y, 450 * v / 20307, 13, colors.green, 4) + svgText(1215, y + 10, v.toLocaleString('en-US'), 9, colors.ink, 700, 'end'); });
  saveFigure('02-inventario-razas.svg', 1280, 530, c);
}

function figure3() {
  let c = svgText(28, 36, 'Unidades de Producción Pecuaria', 22, colors.ink, 700) + svgText(28, 58, 'Desglose territorial y clasificación jurídica', 12, colors.muted);
  c += rect(20, 78, 605, 505, '#fff', 15, colors.line) + rect(655, 78, 605, 505, '#fff', 15, colors.line);
  c += svgText(42, 111, 'Total de UPP', 16, colors.ink, 700) + svgText(42, 132, 'UPP registradas en el sistema', 11, colors.muted) + donut(322, 188, 46, 100, colors.green, '#fff') + svgText(322, 193, '1,247', 22, colors.green, 700, 'middle') + svgText(322, 212, 'UPP totales', 10, colors.muted, 400, 'middle');
  const states = [['Sonora', 115], ['Chihuahua', 84], ['Veracruz', 84], ['Chiapas', 73], ['Jalisco', 73], ['Durango', 52], ['Michoacán', 52], ['Tamaulipas', 52], ['Coahuila', 42], ['Guerrero', 42], ['Oaxaca', 42], ['San Luis Potosí', 42], ['Sinaloa', 42], ['Zacatecas', 42]];
  states.forEach(([name, v], i) => { const y = 257 + i * 21; c += svgText(42, y + 10, name, 10, colors.muted) + bar(118, y, 480 * v / 115, 10, colors.green, 4) + svgText(600, y + 10, v, 9, colors.ink, 700, 'end'); });
  c += svgText(677, 111, 'Tipo de Persona de las UPP', 16, colors.ink, 700) + svgText(677, 132, 'Clasificación jurídica de las UPP registradas', 11, colors.muted) + donut(960, 240, 70, 78, colors.green, colors.gold) + svgText(960, 245, '78%', 24, colors.ink, 700, 'middle') + svgText(960, 267, 'Persona Física', 10, colors.muted, 400, 'middle') + svgText(730, 390, 'Persona Física', 11, colors.muted) + bar(730, 402, 430, 10, '#edf0f2', 5) + bar(730, 402, 335, 10, colors.green, 5) + svgText(1185, 411, '78%', 10, colors.ink, 700, 'end') + svgText(730, 445, 'Persona Moral', 11, colors.muted) + bar(730, 457, 430, 10, '#edf0f2', 5) + bar(730, 457, 95, 10, '#ecd28d', 5) + svgText(1185, 466, '22%', 10, colors.ink, 700, 'end');
  saveFigure('03-upp-persona.svg', 1280, 610, c);
}

function figure4() {
  let c = svgText(28, 36, 'Sanidad y propiedad', 22, colors.ink, 700) + svgText(28, 58, 'Indicadores sanitarios y comparación privada/comunal', 12, colors.muted);
  c += rect(20, 78, 1240, 190, '#fff', 15, colors.line) + svgText(42, 111, 'Sanidad', 16, colors.ink, 700);
  [['Vacunación', 86, 'Cumpliendo objetivo'], ['Halo libre', 65, 'Pendiente mejorar'], ['Baño garrapaticida', 71, 'Aceptable']].forEach((item, i) => { const x = 42 + i * 405; c += rect(x, 130, 380, 112, '#fbfcfd', 12, colors.line) + svgText(x + 16, 157, item[0], 11, colors.muted) + svgText(x + 16, 190, `${item[1]}%`, 26, colors.ink, 700) + bar(x + 16, 209, 345, 9, '#e6eaee', 5) + bar(x + 16, 209, 345 * item[1] / 100, 9, colors.green, 5) + svgText(x + 16, 231, item[2], 10, item[1] > 80 ? '#198754' : item[1] > 70 ? '#3674cc' : colors.gold, 700); });
  c += rect(20, 290, 1240, 300, '#fff', 15, colors.line) + svgText(42, 323, 'Productores, Producción y Tipo de Propiedad', 16, colors.ink, 700) + svgText(42, 344, 'Comparativa entre régimen privado y comunal', 11, colors.muted);
  [['Total Productores', '800', '624', '176'], ['Producción (ton)', '1,130', '848', '282'], ['Cabezas bovinas', '112,820', '78,974', '33,846'], ['Vientres', '59,740', '36,441', '23,299']].forEach((item, i) => { const x = 42 + i * 302; c += rect(x, 365, 282, 90, '#fbfcfd', 12, colors.line) + svgText(x + 14, 388, item[0], 10, colors.muted) + svgText(x + 14, 415, item[1], 19, colors.ink, 700) + svgText(x + 14, 437, `Privada  ${item[2]}`, 10, colors.green, 700) + svgText(x + 14, 451, `Comunal  ${item[3]}`, 10, colors.gold, 700); });
  [0.62, 0.72, 0.88, 0.73].forEach((ratio, i) => { const x = 92 + i * 280; c += bar(x, 535 - ratio * 130, 60, ratio * 130, colors.green) + bar(x + 68, 535 - (1 - ratio) * 130, 60, (1 - ratio) * 130, colors.gold); });
  saveFigure('04-sanidad-propiedad.svg', 1280, 620, c);
}

function figure5() {
  let c = svgText(28, 36, 'Integración con PGN', 22, colors.ink, 700) + svgText(28, 58, 'Organismos ganaderos, interconexión y cobertura mensual', 12, colors.muted);
  c += rect(20, 78, 605, 470, '#fff', 15, colors.line) + rect(655, 78, 605, 470, '#fff', 15, colors.line);
  c += svgText(42, 111, 'Organismos Ganaderos y PGN', 16, colors.ink, 700) + svgText(42, 132, 'Membresía e interconexión con PGN', 11, colors.muted) + donut(322, 230, 70, 63, colors.green, colors.gray) + svgText(322, 235, '63%', 23, colors.ink, 700, 'middle') + svgText(322, 255, 'Con organismo', 10, colors.muted, 400, 'middle') + svgText(60, 370, 'Con organismo ganadero', 11, colors.muted) + svgText(580, 370, '63%', 11, colors.ink, 700, 'end') + svgText(60, 400, 'Sin organismo ganadero', 11, colors.muted) + svgText(580, 400, '37%', 11, colors.ink, 700, 'end') + rect(42, 430, 560, 85, '#eef8f6', 12, '#c7e5df') + svgText(58, 455, 'Interconexión PGN', 12, colors.green, 700) + svgText(58, 478, 'Productores con perfil PGN', 10, colors.muted) + svgText(575, 478, '720', 16, colors.green, 700, 'end');
  c += svgText(677, 111, 'Comparación Bioparcela vs PGN', 16, colors.ink, 700) + svgText(677, 132, 'Usuarios registrados en ambas plataformas por mes', 11, colors.muted);
  [['Bioparcela', '800'], ['PGN', '720'], ['Coincidencia', '90%']].forEach((item, i) => { const x = 677 + i * 185; c += rect(x, 155, 170, 65, '#fbfcfd', 12, colors.line) + svgText(x + 85, 179, item[0], 10, colors.muted, 400, 'middle') + svgText(x + 85, 202, item[1], 20, i === 1 ? colors.gold : colors.green, 700, 'middle'); });
  for (let i = 0; i < 10; i += 1) { const x = 700 + i * 48; const h1 = 80 + i * 7; const h2 = 65 + i * 6; c += bar(x, 430 - h1, 18, h1, colors.green, 4) + bar(x + 20, 430 - h2, 18, h2, colors.gold, 4) + svgText(x + 19, 448, ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'][i], 8, colors.muted, 400, 'middle'); }
  c += svgText(677, 490, 'Cobertura PGN sobre Bioparcela (2026-10)', 10, colors.muted) + svgText(1210, 490, '90%', 10, colors.ink, 700, 'end') + bar(677, 500, 533, 9, '#e6eaee', 5) + bar(677, 500, 480, 9, colors.red, 5);
  saveFigure('05-pgn-comparacion.svg', 1280, 570, c);
}

figure1(); figure2(); figure3(); figure4(); figure5();

const runs = (text, opts = {}) => `<w:r>${opts.bold ? '<w:rPr><w:b/></w:rPr>' : ''}${opts.italic ? '<w:rPr><w:i/></w:rPr>' : ''}<w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
const p = (text = '', style = 'Normal', opts = {}) => `<w:p>${style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : ''}${opts.runs ? opts.runs : runs(text, opts)}</w:p>`;
const pageBreak = () => '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
const heading = (text, level = 1) => p(text, `Heading${level}`);
const bullet = (text) => p(text, 'ListBullet');
const code = (text) => p(text, 'Code');
const imageRel = new Map();
let relIndex = 1;
const addImageRel = (file) => { const id = `rId${relIndex++}`; imageRel.set(file, id); return id; };
const image = (file, widthCm = 16.5, heightCm = 7.2, caption = '') => {
  const rid = addImageRel(file);
  const cx = Math.round(widthCm * 360000); const cy = Math.round(heightCm * 360000);
  const xml = `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${relIndex + 10}" name="${file}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${relIndex + 10}" name="${file}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>${caption ? p(caption, 'Caption') : ''}`;
  return xml;
};

const table = (headers, rows, widths = []) => {
  const cols = headers.length;
  const grid = widths.length ? widths.map((w) => `<w:gridCol w:w="${w}"/>`).join('') : headers.map(() => '<w:gridCol w:w="2400"/>').join('');
  const cell = (value, header = false) => `<w:tc><w:tcPr><w:shd w:fill="${header ? '22685D' : 'F7F8FA'}"/><w:tcMar><w:top w:w="90" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:r><w:rPr>${header ? '<w:b/><w:color w:val="FFFFFF"/>' : ''}</w:rPr><w:t xml:space="preserve">${esc(value)}</w:t></w:r></w:p></w:tc>`;
  return `<w:tbl><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:color="D9E0E5"/><w:left w:val="single" w:sz="4" w:color="D9E0E5"/><w:bottom w:val="single" w:sz="4" w:color="D9E0E5"/><w:right w:val="single" w:sz="4" w:color="D9E0E5"/><w:insideH w:val="single" w:sz="4" w:color="D9E0E5"/><w:insideV w:val="single" w:sz="4" w:color="D9E0E5"/></w:tblBorders></w:tblPr><w:tblGrid>${grid}</w:tblGrid><w:tr>${headers.map((h) => cell(h, true)).join('')}</w:tr>${rows.map((row) => `<w:tr>${row.map((v) => cell(v)).join('')}</w:tr>`).join('')}</w:tbl>`;
};

let body = '';
body += p('MANUAL TÉCNICO', 'Title') + p('Módulo Pecuario — BioParcela', 'Subtitle') + p('Documentación de código y funcionalidades', 'Subtitle') + p('Frontend administrativo · Angular', 'Normal') + p('Fecha de revisión: 28 de octubre de 2026', 'Normal') + p('Ruta funcional: http://localhost:4200/admin/resumen-pecuario', 'Code') + pageBreak();
body += heading('Contenido', 1);
['1. Descripción general', '2. Tecnologías utilizadas', '3. Organización del código', '4. Funcionalidades', '5. Autenticación', '6. Visualización de datos', '7. Generación de PDF', '8. Integración con Trazabilidad', '9. Base de datos', '10. Configuración y ejecución', '11. Observaciones técnicas'].forEach((v) => body += p(v, 'TOC'));
body += p('Alcance: este manual cubre el frontend del módulo pecuario y sus contratos HTTP observables. El repositorio no contiene implementación de API, migraciones ni modelos físicos de base de datos.', 'Note') + pageBreak();

body += heading('1. Descripción general');
body += p('BioParcela es un panel administrativo para consultar indicadores agrícolas y pecuarios. El módulo Resumen Pecuario presenta una vista consolidada de actividad ganadera bovina registrada, con indicadores, gráficos, filtros geográficos y exportaciones.');
body += p('La pantalla se monta en el componente Pecuario y se accede por la ruta /admin/resumen-pecuario dentro del LayoutComponent. La vista es de consulta: no crea ni edita registros pecuarios desde este componente.');
body += bullet('Indicadores principales: productores, UPP, razas registradas e índice de trazabilidad.');
body += bullet('Perfiles demográficos: sexo, edad y pertenencia a pueblos originarios.');
body += bullet('Inventario: cabezas, vientres, finalidad zootécnica y razas.');
body += bullet('Unidades de producción: distribución territorial y tipo de persona.');
body += bullet('Gestión sanitaria, propiedad privada/comunal, organismos ganaderos y PGN.');
body += image('01-resumen-kpis.svg', 16.5, 7.35, 'Figura 1. Vista consolidada de KPIs y perfiles del módulo pecuario, basada en la captura de referencia proporcionada.');

body += heading('2. Tecnologías utilizadas');
body += table(['Tecnología', 'Versión / uso'], [
  ['Angular', '21.2.x; componentes, router, SSR/hydration y compilación.'],
  ['TypeScript', '~5.9.2; tipado de respuestas y lógica de presentación.'],
  ['Angular Material/CDK', '21.2.x; iconos, layout y controles visuales.'],
  ['Chart.js + ng2-charts', '4.5.1 / 10.0.0; gráficas doughnut y barras.'],
  ['RxJS', '~7.8.0; forkJoin, catchError y finalize.'],
  ['html2canvas + jsPDF', '1.4.1 / 4.2.1; captura DOM y PDF A4 horizontal.'],
  ['Capacitor / Electron', '8.3.x / 30.x; empaquetado móvil y escritorio.'],
  ['SweetAlert2 / CryptoJS', 'Alertas y utilidades de almacenamiento/sesión.']
], [2600, 7000]);
body += p('Las versiones se tomaron de package.json. No se documentan versiones de backend porque ese código no está en este repositorio.', 'Note');

body += heading('3. Organización del código');
body += code('src/app/pages/Pecuario/pecuario.component.ts   Lógica, contratos y carga de datos\nsrc/app/pages/Pecuario/pecuario.html             Estructura de la pantalla y bindings\nsrc/app/pages/Pecuario/pecuario.scss              Layout, colores y responsive\nsrc/app/app.routes.ts                             Ruta /admin/resumen-pecuario\nsrc/app/services/generic.service.ts               HTTP y Authorization Bearer\nsrc/app/services/pdf-export.service.ts             Captura HTML y composición PDF\nsrc/app/guards/auth.guard.ts                       Validación de sesión\nsrc/environments/environment.ts                    URLs base y paths de API');
body += p('Pecuario usa ChangeDetectionStrategy.OnPush. Los datos llegan como respuestas HTTP y se transforman en ChartData de Chart.js. La plantilla usa @if y @for para mostrar estados, listas y paneles.');
body += table(['Capa', 'Responsabilidad'], [
  ['Routing', 'Carga LayoutComponent y presenta Pecuario como hijo de /admin.'],
  ['Componente', 'Coordina filtros, peticiones, estado de carga y exportaciones.'],
  ['GenericService', 'Centraliza GET/POST y agrega Bearer si la petición es segura.'],
  ['PdfExportService', 'Oculta controles, captura DOM y divide el resultado en páginas.'],
  ['Chart.js', 'Dibuja barras horizontales/verticales y gráficas de dona.']
], [2600, 7000]);

body += heading('4. Funcionalidades');
body += heading('4.1 Ciclo de carga', 2);
body += p('ngOnInit obtiene el año desde ActivatedRoute, carga estados y llama loadAllData. loadAllData construye parámetros geográficos y ejecuta diez observables con forkJoin. Cada observable usa catchError(() => of(null)); por ello una falla parcial no cancela el resto. finalize libera loading, marca el componente para revisión y actualiza las gráficas.');
body += heading('4.2 Filtros geográficos', 2);
body += p('El nivel puede ser nacional, estado o municipio. Al cambiar nivel se limpian estado y municipio. Al elegir estado en modo municipio se consulta el catálogo de municipios y se normalizan códigos a dos dígitos para estado y tres para municipio.');
body += heading('4.3 Actualización', 2);
body += p('Actualizar Datos ejecuta POST /api/pecuario/cache/flush con cuerpo vacío. Al finalizar, incluso si el flush falla, el componente vuelve a cargar los datos. La interfaz deshabilita el botón mientras refreshing o loading.');
body += image('04-sanidad-propiedad.svg', 16.5, 8.0, 'Figura 2. Paneles de Sanidad y Propiedad; ilustran la lectura visual de indicadores porcentuales y comparativas.');

body += heading('5. Autenticación');
body += p('Login valida usuario y contraseña no vacíos, agrega información del navegador/dispositivo y envía POST a /api/v1/login. La respuesta esperada contiene token. El token se guarda en sessionStorage con la clave userSessionAdmonOS y luego se navega a /admin.');
body += p('GenericService recupera la sesión desde sessionStorage o localStorage. En llamadas marcadas isSecure=true agrega Authorization: Bearer <token>. Las llamadas del módulo pecuario usan isSecure=true.');
body += p('AuthGuard existe y redirige a /login cuando no hay sesión. Comportamiento actual importante: canActivate está comentado en la ruta admin dentro de src/app/app.routes.ts. Por tanto, el frontend no está imponiendo el guard en esa ruta; la protección efectiva debe existir también en API y debe revisarse antes de producción.', 'Warning');
body += code('POST https://giz-qa.encodingmx.com/api/v1/login\nBody: { access, password, device }\nRespuesta mínima: { token }\nSesión: userSessionAdmonOS');

body += heading('6. Visualización de datos');
body += p('Las gráficas se crean después de que afterNextRender marca chartsReady. Las gráficas de dona usan colores verde/dorado/gris. Las gráficas de barras usan ejes configurados desde ChartConfiguration y se redimensionan con refreshChartsSoon.');
body += table(['Endpoint', 'Método', 'Datos mostrados', 'Parámetros'], [
  ['/api/pecuario/resumen', 'GET', 'KPIs, sexo, edad, indígena', 'Sin parámetros en frontend actual'],
  ['/api/pecuario/cabezas-vientres', 'GET', 'Finalidad, cabezas y vientres', 'nivel, estado, municipio'],
  ['/api/pecuario/razas', 'GET', 'Razas y cantidades', 'nivel, estado, municipio'],
  ['/api/pecuario/upp', 'GET', 'Total y desglose de UPP', 'nivel, estado, municipio'],
  ['/api/pecuario/upp/tipo-persona', 'GET', 'Persona física/moral', 'nivel, estado, municipio'],
  ['/api/pecuario/trazabilidad', 'GET', 'Guías REEMO y detalle', 'nivel, estado, municipio'],
  ['/api/pecuario/sanidad', 'GET', 'Vacunación, halo, baño e índice', 'nivel, estado, municipio'],
  ['/api/pecuario/propiedad', 'GET', 'Privada/comunal', 'nivel, estado, municipio'],
  ['/api/pecuario/organismos-ganaderos', 'GET', 'Organismos y enlace PGN', 'nivel, estado, municipio'],
  ['/api/pecuario/comparacion-pgn', 'GET', 'Serie mensual BioParcela/PGN', 'anio']
], [2600, 1000, 4200, 1800]);
body += p('Exportar CSV llama /api/pecuario/export con los parámetros geográficos actuales y descarga el Blob como resumen-pecuario.csv. El selector Cabezas/Vientres cambia el dataset local y no requiere una nueva petición.', 'Note');
body += image('02-inventario-razas.svg', 16.5, 6.85, 'Figura 3. Indicadores de inventario: finalidad zootécnica y razas registradas.');
body += image('03-upp-persona.svg', 16.5, 7.75, 'Figura 4. UPP por territorio y clasificación de persona.');

body += heading('7. Generación de PDF');
body += p('El botón Exportar PDF envía el elemento #pdfContent a PdfExportService.exportElement. El servicio espera document.fonts.ready y un frame de renderizado para capturar las gráficas. Después oculta botones, enlaces y selectores de filtro/control mediante CSS e ignoreElements.');
body += bullet('Captura: html2canvas con useCORS, allowTaint=false y escala máxima 2.');
body += bullet('Formato: jsPDF A4 horizontal, 297 × 210 mm, margen de 10 mm.');
body += bullet('Paginación: busca límites naturales en header, section, article, panel, chart-box y listas.');
body += bullet('Salida: resumen-pecuario.pdf. La generación usa el DOM actual; no solicita un PDF al backend.');
body += p('Riesgo operativo: el PDF depende de que las gráficas ya estén renderizadas y de que las imágenes externas permitan CORS. El servicio restaura visibilidad y display de controles en finally.', 'Note');

body += heading('8. Integración con Trazabilidad');
body += p('La sección Trazabilidad consume /api/pecuario/trazabilidad. Presenta el porcentaje guias_emitidas_pct y detalle por tipo de guía. statusLabel traduce estados como cumpliendo_objetivo, pendiente_mejorar, aceptable y critico.');
body += p('La interconexión PGN se alimenta de /api/pecuario/organismos-ganaderos. El contrato puede entregar productores_con_perfil, total_productores y pgn_url. Comparación Bioparcela vs PGN consume /api/pecuario/comparacion-pgn con el año seleccionado y muestra bioparcela, pgn, coincidencia, cobertura_pct, sin_registro_pgn y serie_mensual.');
body += p('Si pgn_url existe, la plantilla abre el destino en una pestaña nueva con rel="noopener". No hay sincronización de escritura desde el frontend; la interconexión es de consulta y enlace externo.');
body += image('05-pgn-comparacion.svg', 16.5, 7.35, 'Figura 5. Organismos ganaderos, cobertura PGN y comparación mensual.');

body += heading('9. Base de datos');
body += p('El repositorio contiene únicamente el consumidor frontend. No contiene migraciones, entidades ORM, SQL ni definición física de base de datos. La siguiente tabla documenta el modelo lógico que el frontend espera de la API; no sustituye el esquema oficial del backend.');
body += table(['Entidad lógica', 'Campos observables', 'Relación funcional'], [
  ['Productor', 'total_productores; sexo; edad; indigena', 'Se agrupa por UPP, región y perfiles demográficos.'],
  ['UPP', 'total; desglose; tipo de persona', 'Pertenece al ámbito geográfico y concentra inventario.'],
  ['Inventario bovino', 'cabezas; vientres; finalidad; raza', 'Se relaciona con UPP y finalidad zootécnica.'],
  ['Trazabilidad / REEMO', 'guias_emitidas_pct; detalle', 'Resume movilizaciones asociadas al inventario/UPP.'],
  ['Sanidad', 'indicadores; indice_general', 'Indicadores sanitarios agregados por ámbito.'],
  ['Propiedad', 'privada; comunal; producción_ton', 'Compara régimen de tenencia para productores e inventario.'],
  ['Organismo ganadero', 'con_organismo; sin_organismo; PGN', 'Relaciona productor BioParcela con perfil PGN.'],
  ['Comparación PGN', 'bioparcela; pgn; cobertura; serie_mensual', 'Cruza usuarios activos por mes y año de corte.']
], [2500, 4100, 3800]);
body += p('Relación transversal: las consultas geográficas usan nivel nacional/estado/municipio; el frontend envía códigos normalizados. Para validar cardinalidades, índices, llaves y reglas de integridad se necesita el repositorio del backend o su contrato OpenAPI.', 'Warning');

body += heading('10. Configuración y ejecución');
body += table(['Elemento', 'Valor / instrucción'], [
  ['Node.js', 'Usar una versión compatible con Angular 21; desarrollo validado con Node 22.15.0.'],
  ['npm', 'packageManager npm@10.9.2. Ejecutar npm install.'],
  ['Desarrollo', 'npm start; servidor Angular en http://localhost:4200.'],
  ['Build', 'npm run build; salida dist/adminos.'],
  ['Pruebas', 'npm test.'],
  ['API', 'https://giz-qa.encodingmx.com/api/v1 y servicios /api/pecuario, /api/infraestructura, etc.'],
  ['CORS / red', 'El navegador debe alcanzar la API QA y la API debe permitir el origen local.'],
  ['Configuración', 'No hay .env en frontend; las URLs están en src/environments/environment.ts y environment.prod.ts.']
], [2500, 8000]);
body += code('npm install\nnpm start\n# abrir http://localhost:4200/admin/resumen-pecuario');
body += p('Para probar datos reales se requiere una sesión válida y disponibilidad de los endpoints QA. En una instalación nueva, validar primero login, menú y luego carga del módulo.', 'Note');

body += heading('11. Observaciones técnicas');
body += bullet('La ruta admin no aplica AuthGuard porque la línea canActivate está comentada. Revisar antes de liberar.');
body += bullet('El endpoint resumen se consume sin los parámetros geográficos que sí reciben los otros endpoints. Verificar si KPIs/perfiles deben cambiar por estado o municipio.');
body += bullet('Cada endpoint individual tolera fallo y mantiene datos parciales; la UI solo muestra el banner general cuando ninguna respuesta carga.');
body += bullet('El almacenamiento local/sessionStorage actualmente serializa la sesión en texto plano aunque el servicio se llama LocalStorageEncryptService. Revisar si el token debe persistir y aplicar protección XSS/CSP.');
body += bullet('El documento cubre frontend. Confirmar esquema, permisos de API, caché y trazabilidad con el equipo backend.');

const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="21"/><w:color w:val="182237"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:pPr><w:jc w:val="center"/><w:spacing w:after="240"/></w:pPr><w:rPr><w:b/><w:sz w:val="40"/><w:color w:val="22685D"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:pPr><w:jc w:val="center"/><w:spacing w:after="120"/></w:pPr><w:rPr><w:sz w:val="27"/><w:color w:val="697586"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="Heading 1"/><w:pPr><w:keepNext/><w:spacing w:before="300" w:after="130"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="29"/><w:color w:val="22685D"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="Heading 2"/><w:pPr><w:keepNext/><w:spacing w:before="220" w:after="100"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="AD8127"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="ListBullet"><w:name w:val="List Bullet"/><w:pPr><w:ind w:left="360" w:hanging="180"/></w:pPr><w:rPr><w:sz w:val="21"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Code"><w:name w:val="Code"/><w:pPr><w:shd w:fill="F1F4F6"/><w:spacing w:before="80" w:after="140"/></w:pPr><w:rPr><w:rFonts w:ascii="Courier New" w:hAnsi="Courier New"/><w:sz w:val="18"/><w:color w:val="405165"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Caption"><w:name w:val="Caption"/><w:pPr><w:jc w:val="center"/></w:pPr><w:rPr><w:i/><w:sz w:val="18"/><w:color w:val="697586"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="TOC"><w:name w:val="TOC"/><w:pPr><w:spacing w:after="70"/></w:pPr><w:rPr><w:sz w:val="22"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Note"><w:name w:val="Note"/><w:pPr><w:shd w:fill="EEF8F6"/><w:spacing w:before="100" w:after="140"/></w:pPr><w:rPr><w:color w:val="22685D"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Warning"><w:name w:val="Warning"/><w:pPr><w:shd w:fill="FFF5E3"/><w:spacing w:before="100" w:after="140"/></w:pPr><w:rPr><w:b/><w:color w:val="7D5A16"/></w:rPr></w:style></w:styles>`;

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="360" w:footer="360" w:gutter="0"/></w:sectPr></w:body></w:document>`;

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="svg" ContentType="image/svg+xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`;
const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`;
const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>${[...imageRel.entries()].map(([file, id]) => `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${file}"/>`).join('')}</Relationships>`;
const core = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/"><dc:title>Manual técnico — Módulo Pecuario BioParcela</dc:title><dc:creator>Equipo de desarrollo</dc:creator><dc:subject>Documentación técnica frontend</dc:subject><dcterms:created xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="dcterms:W3CDTF">2026-10-28T00:00:00Z</dcterms:created></cp:coreProperties>`;
const app = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>BioParcela</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop></Properties>`;

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'manual-pecuario-'));
const put = (relative, data, encoding = 'utf8') => { const target = path.join(temp, relative); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, data, encoding); };
put('[Content_Types].xml', contentTypes); put('_rels/.rels', rootRels); put('word/document.xml', documentXml); put('word/styles.xml', styles); put('word/_rels/document.xml.rels', docRels); put('docProps/core.xml', core); put('docProps/app.xml', app);
for (const file of imageRel.keys()) put(`word/media/${file}`, fs.readFileSync(path.join(assets, file)));
fs.rmSync(output, { force: true });
execFileSync('zip', ['-qr', output, '.'], { cwd: temp });
fs.rmSync(temp, { recursive: true, force: true });
console.log(`Generated ${output}`);
