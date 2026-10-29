import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const docs = path.join(root, 'docs');
const assets = path.join(docs, 'assets', 'manual-infraestructura');
const input = path.join(docs, 'manual-tecnico-pecuario.docx');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'manual-infraestructura-'));
const output = path.join(temp, 'manual-tecnico-infraestructura.docx');
fs.mkdirSync(assets, { recursive: true });

const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const C = { green: '#22685d', gold: '#ad8127', ink: '#182237', muted: '#697586', line: '#dfe5ea', bg: '#f7f8fa', gray: '#9d9da0', red: '#a1244e', pale: '#eef7f5' };
const text = (x, y, value, size = 16, fill = C.ink, weight = 400, anchor = 'start') => `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}">${esc(value)}</text>`;
const rect = (x, y, w, h, fill = '#fff', rx = 12, stroke = 'none') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>`;
const bar = (x, y, w, h, fill, rx = 5) => rect(x, y, w, h, fill, rx);
const svg = (width, height, content) => `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${C.bg}"/>${content}</svg>`;
const saveSvg = (name, width, height, content) => fs.writeFileSync(path.join(assets, name), svg(width, height, content));

function figure1() {
  let c = text(26, 38, 'Infraestructura del Rancho', 25, C.green, 700) + text(26, 60, 'Recursos físicos disponibles — Estado y funcionalidad a nivel nacional', 12, C.muted);
  c += rect(22, 82, 1236, 58, '#fff', 14, C.line);
  ['Buscar por nombre del rancho, UPP...', 'Todos los estados', 'Todos los municipios', 'Todos los tipos', 'Todos los estados'].forEach((v, i) => c += rect(34 + i * 243, 97, 230, 30, '#fff', 8, C.line) + text(47 + i * 243, 117, v, 10, C.muted));
  c += rect(34, 145, 110, 28, C.red, 8) + text(89, 164, 'Exportar CSV', 10, '#fff', 700, 'middle');
  [['Infraestructura en estado BUENO', '52%', '5,124 elementos', C.green, '✅'], ['Infraestructura en estado REGULAR', '34%', '3,329 elementos', C.gold, '⚠️'], ['Infraestructura en estado MALO', '15%', '1,437 elementos', C.red, '❌']].forEach((item, i) => { const x = 22 + i * 412; c += rect(x, 190, 396, 118, '#fff', 14, C.line) + text(x + 18, 220, item[4], 22, item[3], 700) + text(x + 18, 246, item[0], 11, C.muted, 700) + text(x + 18, 280, item[1], 27, item[3], 700) + bar(x + 18, 290, 350, 8, '#e8ebee', 5) + bar(x + 18, 290, 350 * parseInt(item[1]) / 100, 8, C.gold, 5) + text(x + 365, 304, `${item[1]} del total (${item[2]})`, 9, C.gold, 700, 'end'); });
  c += rect(22, 326, 1236, 280, '#fff', 14, C.line) + text(40, 359, 'Inventario de infraestructura por tipo', 16, C.ink, 700) + rect(40, 380, 1195, 26, '#f5f7f8', 0) + text(52, 398, 'Elemento', 10, C.muted, 700) + text(410, 398, 'Cantidad total', 10, C.muted, 700) + text(610, 398, 'Estado Bueno', 10, C.muted, 700) + text(785, 398, 'Estado Regular', 10, C.muted, 700) + text(970, 398, 'Estado Malo', 10, C.muted, 700) + text(1130, 398, '% Funcional', 10, C.muted, 700);
  [['Entrada / Salida', '1,240', '65%', '25%', '10%', '90%'], ['Corrales', '2,100', '52%', '38%', '10%', '90%'], ['Bodegas', '890', '48%', '32%', '20%', '80%'], ['Maquinaria', '1,560', '42%', '35%', '23%', '77%'], ['Comederos', '1,120', '55%', '30%', '15%', '85%'], ['Punto de carga', '980', '58%', '32%', '10%', '90%']].forEach((item, i) => { const y = 430 + i * 26; c += text(52, y, item[0], 10, C.ink, 700) + text(410, y, item[1], 10, C.ink) + text(635, y, item[2], 10, C.green, 700) + text(810, y, item[3], 10, C.gold, 700) + text(995, y, item[4], 10, C.red, 700) + bar(1080, y - 10, 140, 10, '#e8ebee', 5) + bar(1080, y - 10, 140 * parseInt(item[5]) / 100, 10, C.green, 5); });
  saveSvg('01-infraestructura-resumen.svg', 1280, 630, c);
}

function figure2() {
  let c = text(26, 38, 'Cercado del Rancho', 22, C.ink, 700) + text(26, 60, 'Tipo de cerco y porcentaje de superficie cercada por UPP', 12, C.muted);
  c += rect(20, 78, 1240, 170, '#fff', 14, C.line) + text(40, 111, 'Superficie cercada', 14, C.muted, 700) + text(270, 111, 'Superficie sin cercar', 14, C.muted, 700) + text(40, 151, '1,025 ha', 24, C.green, 700) + text(270, 151, '225 ha', 24, C.muted, 700) + text(40, 174, '82% del total', 10, C.green, 600) + text(270, 174, '18% del total', 10, C.muted, 600) + text(610, 112, 'Porcentaje de superficie cercada', 12, C.muted, 700) + text(1210, 134, '82%', 11, C.green, 700, 'end') + bar(610, 145, 600, 12, '#e8ebee', 6) + bar(610, 145, 492, 12, C.green, 6);
  c += text(40, 286, 'TIPO DE CERCO — PRODUCTORES QUE LO UTILIZAN', 12, C.muted, 700);
  [['Cerco vivo', '312 (39%)', C.green], ['Alambre de púas', '584 (73%)', C.gold], ['Piedra', '184 (23%)', C.gray], ['Cerco eléctrico', '128 (16%)', C.red]].forEach((item, i) => { const x = 40 + i * 300; c += rect(x, 310, 280, 145, '#fbfcfd', 12, C.line) + rect(x, 310, 280, 38, item[2], 12) + text(x + 16, 335, item[0], 12, '#fff', 700) + text(x + 16, 372, 'Usan este cerco', 10, C.muted, 600) + bar(x + 16, 382, 245, 8, '#e8ebee', 5) + bar(x + 16, 382, 245 * parseInt(item[1]) / 100, 8, item[2], 5) + text(x + 264, 390, item[1], 9, item[2], 700, 'end') + text(x + 16, 420, 'Superficie cubierta', 10, C.muted, 600) + bar(x + 16, 430, 245, 8, '#e8ebee', 5) + bar(x + 16, 430, 245 * [22, 45, 15, 8][i] / 50, 8, item[2], 5) + text(x + 264, 438, `${[22, 45, 15, 8][i]}%`, 9, item[2], 700, 'end'); });
  saveSvg('02-infraestructura-cercado.svg', 1280, 500, c);
}

function figure3() {
  let c = text(26, 38, 'Detalle por UPP e infraestructura funcional', 22, C.ink, 700) + text(26, 60, 'Distribución de elementos por condición y brecha de mejora', 12, C.muted);
  c += rect(20, 78, 1240, 208, '#fff', 14, C.line) + text(40, 111, 'Detalle por UPP — tipos de cerco utilizados', 15, C.ink, 700) + rect(40, 130, 1195, 25, '#f5f7f8', 0) + text(52, 147, 'UPP', 9, C.muted, 700) + text(220, 147, 'Rancho', 9, C.muted, 700) + text(470, 147, 'Cerco vivo', 9, C.muted, 700) + text(650, 147, 'Alambre de púas', 9, C.muted, 700) + text(860, 147, 'Piedra', 9, C.muted, 700) + text(1020, 147, 'Cerco eléctrico', 9, C.muted, 700) + text(1180, 147, '% Cercado', 9, C.muted, 700);
  [['UPP-01-0001', 'La Primavera', 'Sí', 'Sí', 'No', 'No', '86%'], ['UPP-01-0002', 'Rancho Nuevo', 'Sí', 'Sí', 'No', 'No', '90%'], ['UPP-01-0003', 'El Roble', 'No', 'Sí', 'Sí', 'No', '66%'], ['UPP-01-0004', 'El Pitayo', 'No', 'Sí', 'No', 'No', '98%']].forEach((item, i) => { const y = 180 + i * 24; c += text(52, y, item[0], 9, C.green, 700) + text(220, y, item[1], 9, C.ink) + text(490, y, item[2], 9, item[2] === 'Sí' ? C.green : C.gray, 700) + text(680, y, item[3], 9, item[3] === 'Sí' ? C.green : C.gray, 700) + text(880, y, item[4], 9, item[4] === 'Sí' ? C.green : C.gray, 700) + text(1040, y, item[5], 9, item[5] === 'Sí' ? C.green : C.gray, 700) + bar(1120, y - 8, 100, 8, '#e8ebee', 5) + bar(1120, y - 8, 100 * parseInt(item[6]) / 100, 8, C.green, 5); });
  c += rect(20, 310, 1240, 215, '#fff', 14, C.line) + text(40, 343, 'Infraestructura funcional vs necesidad reportada', 15, C.ink, 700) + text(40, 374, 'Infraestructura funcional (Bueno + Regular)', 11, C.green, 700) + text(1210, 374, '85.5% del total nacional', 10, C.ink, 700, 'end') + bar(40, 386, 1170, 13, '#e8ebee', 7) + bar(40, 386, 1000, 13, C.green, 7) + text(40, 432, 'Necesidad reportada por agricultores', 11, C.red, 700) + text(1210, 432, '42% requieren mejoras', 10, C.ink, 700, 'end') + bar(40, 444, 1170, 13, '#e8ebee', 7) + bar(40, 444, 491, 13, C.red, 7) + text(625, 490, '44%', 30, C.red, 700, 'middle') + text(625, 510, 'Brecha de oportunidad de mejora', 11, C.ink, 700, 'middle');
  saveSvg('03-infraestructura-upp-brecha.svg', 1280, 550, c);
}

function figure4() {
  let c = text(26, 38, 'Distribución de estado por tipo de infraestructura', 22, C.ink, 700) + text(26, 60, 'Proporción Bueno, Regular y Malo por elemento', 12, C.muted);
  c += rect(20, 78, 1240, 315, '#fff', 14, C.line);
  [['Entrada / Salida', 65, 25, 10], ['Corrales', 52, 38, 10], ['Bodegas', 48, 32, 20], ['Maquinaria', 42, 35, 23], ['Comederos', 55, 30, 15], ['Punto de carga', 58, 32, 10], ['Bebederos', 50, 35, 15], ['Cercos', 45, 40, 15]].forEach((item, i) => { const y = 110 + i * 31; c += text(40, y + 10, item[0], 10, C.ink, 700) + bar(180, y, 1020, 15, '#e8ebee', 7) + bar(180, y, 1020 * item[1] / 100, 15, C.green, 0) + bar(180 + 1020 * item[1] / 100, y, 1020 * item[2] / 100, 15, C.gold, 0) + bar(180 + 1020 * (item[1] + item[2]) / 100, y, 1020 * item[3] / 100, 15, C.red, 0) + text(1210, y + 11, `Bueno ${item[1]}% | Regular ${item[2]}% | Malo ${item[3]}%`, 8, C.ink, 700, 'end'); });
  saveSvg('04-infraestructura-distribucion.svg', 1280, 430, c);
}

figure1(); figure2(); figure3(); figure4();

const escRuns = (value) => `<w:r><w:t xml:space="preserve">${esc(value)}</w:t></w:r>`;
const p = (value = '', style = 'Normal') => `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr>${escRuns(value)}</w:p>`;
const pageBreak = () => '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
const heading = (value, level = 1) => p(value, `Heading${level}`);
const bullet = (value) => p(value, 'ListBullet');
const code = (value) => p(value, 'Code');
const note = (value, style = 'Note') => p(value, style);

function table(headers, rows) {
  const cell = (value, header = false) => `<w:tc><w:tcPr><w:shd w:fill="${header ? '22685D' : 'F7F8FA'}"/><w:tcMar><w:top w:w="90" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:r><w:rPr>${header ? '<w:b/><w:color w:val="FFFFFF"/>' : ''}</w:rPr><w:t xml:space="preserve">${esc(value)}</w:t></w:r></w:p></w:tc>`;
  return `<w:tbl><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:color="D9E0E5"/><w:left w:val="single" w:sz="4" w:color="D9E0E5"/><w:bottom w:val="single" w:sz="4" w:color="D9E0E5"/><w:right w:val="single" w:sz="4" w:color="D9E0E5"/><w:insideH w:val="single" w:sz="4" w:color="D9E0E5"/><w:insideV w:val="single" w:sz="4" w:color="D9E0E5"/></w:tblBorders></w:tblPr><w:tr>${headers.map((v) => cell(v, true)).join('')}</w:tr>${rows.map((row) => `<w:tr>${row.map((v) => cell(v)).join('')}</w:tr>`).join('')}</w:tbl>`;
}

function imageXml(file, relId, widthCm, heightCm, caption) {
  const cx = Math.round(widthCm * 360000); const cy = Math.round(heightCm * 360000); const id = relId.replace(/\D/g, '');
  return `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${id}" name="${file}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${id}" name="${file}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="${relId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>${p(caption, 'Caption')}`;
}

let body = pageBreak();
body += heading('14. Módulo Infraestructura del Rancho');
body += p('El módulo Infraestructura del Rancho presenta el inventario físico, su condición funcional, el cercado y la necesidad de mejora a nivel nacional o por filtros geográficos. Se accede mediante /admin/infraestructura-rancho y se renderiza en el componente Infraestructura.');
body += bullet('Resumen de infraestructura en estado bueno, regular y malo.');
body += bullet('Inventario por tipo con cantidades, condición y porcentaje funcional.');
body += bullet('Cercado del rancho por tipo, uso y superficie cubierta.');
body += bullet('Detalle paginado por UPP y distribución de estado por tipo.');
body += bullet('Comparación entre infraestructura funcional y necesidad reportada.');
body += imageXml('image17.svg', 'rId21', 16.5, 8.15, 'Figura 13. Filtros, estados e inventario de infraestructura. Lámina basada en la captura de referencia compartida.');

body += heading('14.1 Organización del código', 2);
body += code('src/app/pages/Infraestructura/infraestructura.component.ts   Lógica, contratos y carga de datos\nsrc/app/pages/Infraestructura/infraestructura.html             Vista, tablas y controles\nsrc/app/pages/Infraestructura/infraestructura.scss              Estilos del módulo\nsrc/app/app.routes.ts                                           Ruta /admin/infraestructura-rancho\nsrc/environments/environment.prod.ts                            URLs del servicio infraestructura\nsrc/app/services/generic.service.ts                             HTTP y Authorization Bearer\nsrc/app/services/pdf-export.service.ts                          Exportación DOM a PDF');
body += p('El componente usa ChangeDetectionStrategy.OnPush, Chart.js/ng2-charts y PdfExportService. La vista combina tarjetas de estado, tablas de inventario, gráficas de cercado y tablas paginadas por UPP.');

body += heading('14.2 Flujo de carga y filtros', 2);
body += p('ngOnInit carga catálogos y llama loadData. loadData construye filterParams y ejecuta cinco peticiones con forkJoin: resumen, necesidad, cercado, desglose por UPP y cercado por UPP. Cada respuesta tolera error de forma independiente con catchError(() => of(null)).');
body += table(['Control', 'Parámetro', 'Efecto'], [
  ['Búsqueda', 'q', 'Filtra por nombre de rancho o UPP.'],
  ['Estado', 'estado', 'Actualiza municipios y reinicia páginas.'],
  ['Municipio', 'municipio', 'Restringe resultados territoriales.'],
  ['Tipo', 'tipo', 'Filtra el tipo de infraestructura.'],
  ['Condición', 'condicion', 'Filtra estado bueno, regular o malo.'],
  ['Paginación', 'page, per_page', 'Consulta detalle UPP en páginas de cinco registros.']
]);
body += p('Al cambiar estado se limpian municipio y catálogo dependiente. Cualquier cambio de filtro reinicia las páginas de desglose UPP y cercado UPP a la primera página.', 'Note');

body += heading('14.3 Funcionalidades y visualización', 2);
body += table(['Panel', 'Contrato', 'Presentación'], [
  ['Resumen', 'total_elementos, estados[], inventario[]', 'Tarjetas bueno/regular/malo e inventario por tipo.'],
  ['Necesidad', 'funcional, necesidad, brecha_pct', 'Barras de funcionalidad, necesidad y brecha.'],
  ['Cercado', 'superficie cercada/sin cercar, tipos[]', 'Dona, tarjetas por cerco y superficie cubierta.'],
  ['Desglose UPP', 'total, page, per_page, last_page, data[]', 'Tabla paginada con municipio y condición.'],
  ['Cercado UPP', 'data[] con booleanos por tipo', 'Detalle de tipos de cerco usados por UPP.'],
  ['Estado por tipo', 'bueno, regular, malo', 'Barras apiladas por elemento.']
]);
body += imageXml('image18.svg', 'rId22', 16.5, 6.5, 'Figura 14. Cercado del rancho, tipos de cerco y superficie cubierta.');
body += imageXml('image19.svg', 'rId23', 16.5, 6.65, 'Figura 15. Detalle por UPP e infraestructura funcional frente a necesidad.');
body += imageXml('image20.svg', 'rId24', 16.5, 5.55, 'Figura 16. Distribución de estado por tipo de infraestructura.');

body += heading('14.4 Endpoints del módulo', 2);
body += table(['Endpoint', 'Método', 'Uso'], [
  ['/api/infraestructura/catalogos', 'GET', 'Tipos, condiciones, cercos, estados y municipios.'],
  ['/api/infraestructura/resumen', 'GET', 'Estados e inventario agregado.'],
  ['/api/infraestructura/necesidad', 'GET', 'Funcionalidad, necesidad, porcentaje y monto estimado.'],
  ['/api/infraestructura/cercado', 'GET', 'Superficie cercada y tipos de cerco.'],
  ['/api/infraestructura/desglose-upp', 'GET', 'Detalle paginado de infraestructura por UPP.'],
  ['/api/infraestructura/cercado/upp', 'GET', 'Detalle paginado de cercos utilizados por UPP.'],
  ['/api/infraestructura/export', 'GET Blob', 'Descarga infraestructura-rancho.csv.'],
  ['/api/infraestructura/cache/flush', 'POST', 'Actualiza la caché del módulo.']
]);

body += heading('14.5 Cercado y paginación', 2);
body += p('El panel Cercado del Rancho construye una dona con superficie cercada y sin cercar. También construye una gráfica de barras horizontales apiladas con los productores que usan o no usan cada tipo de cerco.');
body += p('setFenceUsage permite filtrar el detalle UPP por tipo de cerco y uso: todos, si o no. El filtro reinicia la página y envía tipo_cerco, uso, page y per_page. goToUppPage y goToFencePage limitan la página entre 1 y last_page.');

body += heading('14.6 Exportaciones y PDF', 2);
body += p('Exportar CSV llama /api/infraestructura/export con los filtros actuales y descarga infraestructura-rancho.csv. Exportar PDF entrega #pdfContent a PdfExportService con nombre infraestructura-rancho.pdf. Actualizar datos ejecuta POST /api/infraestructura/cache/flush y después recarga el módulo.');

body += heading('14.7 Base de datos lógica', 2);
body += p('El frontend no contiene SQL, migraciones ni entidades físicas. Los contratos observables permiten identificar estas entidades lógicas: infraestructura, condición, inventario UPP, cercado, tipo de cerco y necesidad de mejora.');
body += table(['Entidad lógica', 'Campos observables', 'Relación funcional'], [
  ['Elemento de infraestructura', 'tipo, etiqueta, total, bueno, regular, malo, funcional', 'Se agrupa por tipo y condición.'],
  ['Inventario UPP', 'upp, rancho, municipio, total_elementos, estados', 'Relaciona unidad productiva con infraestructura.'],
  ['Cercado', 'superficie cercada, sin cercar, pct, tipos[]', 'Resume cobertura de superficie por tipo de cerco.'],
  ['Tipo de cerco', 'usan, no_usan, superficie_ha, superficie_pct', 'Se relaciona con productores y UPP.'],
  ['Necesidad', 'elementos, ranchos, pct, inversion_estimada_mxn', 'Calcula brecha entre funcionalidad y mejora requerida.']
]);
body += note('Validar llaves, cardinalidades, criterios de condición, origen de inversión estimada, caché y permisos con el backend. Esta sección describe contratos frontend, no el esquema físico.', 'Warning');

body += heading('14.8 Configuración y observaciones', 2);
body += code('npm install\nnpm start\n# abrir http://localhost:4200/admin/infraestructura-rancho');
body += bullet('La base del servicio está en infraestructuraPath: https://giz-qa.encodingmx.com/api/infraestructura.');
body += bullet('Las peticiones usan isSecure=true y requieren sesión válida con Bearer.');
body += bullet('Los endpoints de detalle reciben page y per_page, con cinco registros por página en el componente.');
body += bullet('Los errores parciales no cancelan el resto de consultas; solo se muestra banner general si ninguna respuesta carga.');

const extracted = path.join(temp, 'package');
execFileSync('unzip', ['-q', input, '-d', extracted]);
const docPath = path.join(extracted, 'word', 'document.xml');
let doc = fs.readFileSync(docPath, 'utf8');
if (doc.includes('14. Módulo Infraestructura del Rancho')) {
  fs.rmSync(temp, { recursive: true, force: true });
  console.log('Infraestructura ya existe; no se modificó el documento.');
  process.exit(0);
}
doc = doc.replace('<w:sectPr', body + '<w:sectPr');
fs.writeFileSync(docPath, doc);

const relPath = path.join(extracted, 'word', '_rels', 'document.xml.rels');
let rels = fs.readFileSync(relPath, 'utf8');
rels = rels.replace('</Relationships>', '<Relationship Id="rId21" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image17.svg"/><Relationship Id="rId22" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image18.svg"/><Relationship Id="rId23" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image19.svg"/><Relationship Id="rId24" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image20.svg"/></Relationships>');
fs.writeFileSync(relPath, rels);
for (const [source, target] of [['01-infraestructura-resumen.svg', 'image17.svg'], ['02-infraestructura-cercado.svg', 'image18.svg'], ['03-infraestructura-upp-brecha.svg', 'image19.svg'], ['04-infraestructura-distribucion.svg', 'image20.svg']]) fs.copyFileSync(path.join(assets, source), path.join(extracted, 'word', 'media', target));

execFileSync('zip', ['-qr', output, '.'], { cwd: extracted });
fs.copyFileSync(output, input);
fs.rmSync(temp, { recursive: true, force: true });
console.log(`Appended Infrastructure to ${input}`);
