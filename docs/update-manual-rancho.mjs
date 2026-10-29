import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const docs = path.join(root, 'docs');
const assets = path.join(docs, 'assets', 'manual-rancho');
const input = path.join(docs, 'manual-tecnico-pecuario.docx');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'manual-rancho-'));
const output = path.join(temp, 'manual-tecnico-rancho.docx');
const repairOnly = process.argv.includes('--repair-only');
fs.mkdirSync(assets, { recursive: true });

const esc = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const C = { green: '#22685d', gold: '#ad8127', ink: '#182237', muted: '#697586', line: '#dfe5ea', bg: '#f7f8fa', gray: '#9d9da0', red: '#a1244e', blue: '#3978e8' };
const text = (x, y, value, size = 16, fill = C.ink, weight = 400, anchor = 'start') => `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}">${esc(value)}</text>`;
const rect = (x, y, w, h, fill = '#fff', rx = 12, stroke = 'none') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>`;
const bar = (x, y, w, h, fill, rx = 5) => rect(x, y, w, h, fill, rx);
const svg = (width, height, content) => `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${C.bg}"/>${content}</svg>`;
const donut = (cx, cy, r, percent, primary, secondary) => { const circumference = 2 * Math.PI * r; const dash = `${(circumference * percent / 100).toFixed(1)} ${(circumference * (1 - percent / 100)).toFixed(1)}`; return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${secondary}" stroke-width="34"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${primary}" stroke-width="34" stroke-dasharray="${dash}" transform="rotate(-90 ${cx} ${cy})"/>`; };
const saveSvg = (name, width, height, content) => fs.writeFileSync(path.join(assets, name), svg(width, height, content));

function figure1() {
  let c = text(26, 38, 'Resumen del Rancho', 25, C.green, 700) + text(26, 60, 'Indicadores clave de superficie, producción y propiedad — Visión nacional para políticas públicas', 12, C.muted);
  c += rect(22, 82, 1236, 70, '#fff', 14, C.line);
  ['Buscar rancho, propietario o UPP', 'Todos los estados', 'Todos los municipios', 'Todas las localidades', 'Todos los tipos de producción'].forEach((v, i) => c += rect(34 + i * 243, 98, 230, 30, '#fff', 8, C.line) + text(47 + i * 243, 118, v, 10, C.muted));
  c += rect(34, 132, 110, 28, C.red, 8) + text(89, 151, 'Exportar CSV', 10, '#fff', 700, 'middle') + rect(154, 132, 108, 28, '#fff', 8, C.line) + text(208, 151, 'Aplicar búsqueda', 10, C.muted, 700, 'middle');
  const cards = [['Superficie total (ha)', '1,250 ha', '100% del total'], ['Área de pastoreo (ha)', '780 ha', '62.4% del total'], ['Área de cultivo/forraje (ha)', '320 ha', '25.6% del total'], ['Área de infraestructura (ha)', '150 ha', '12% del total']];
  cards.forEach((item, i) => { const x = 22 + i * 310; c += rect(x, 172, 294, 104, '#fff', 14, C.line) + text(x + 16, 198, item[0], 11, C.muted, 700) + text(x + 16, 235, item[1], 25, C.ink, 700) + bar(x + 16, 250, 260, 7, '#e8ebee', 5) + bar(x + 16, 250, 260 * (i === 0 ? 1 : [0.624, 0.256, 0.12][i - 1]), 7, C.gold, 5) + text(x + 274, 267, item[2], 9, C.gold, 700, 'end'); });
  c += rect(22, 294, 1236, 295, '#fff', 14, C.line) + text(40, 327, 'Tamaño del productor', 16, C.ink, 700) + text(40, 348, 'Distribución por número de animales', 11, C.muted);
  c += donut(145, 430, 58, 39, C.gold, C.gray) + text(145, 435, '39%', 20, C.ink, 700, 'middle');
  [['Micro', '6%', C.gray], ['Pequeño', '39%', C.gold], ['Mediano', '37.3%', C.green], ['Gran productor', '17.8%', '#171a1c']].forEach((item, i) => c += rect(236, 382 + i * 24, 12, 12, item[2], 6) + text(256, 392 + i * 24, `${item[0]}  ${item[1]}`, 11, C.muted, 600));
  [['Micro', 48, C.gray], ['Pequeño', 312, C.gold], ['Mediano', 298, C.green], ['Gran productor', 142, '#171a1c']].forEach((item, i) => { const x = 530 + i * 165; const h = item[1] / 1.4; c += bar(x, 508 - h, 90, h, item[2], 6) + text(x + 45, 530, item[0], 9, C.muted, 400, 'middle') + text(x + 45, 547, String(item[1]), 10, C.ink, 700, 'middle'); });
  c += rect(40, 555, 1190, 25, '#f5f7f8', 0) + text(52, 572, 'Tamaño', 10, C.muted, 700) + text(235, 572, 'Rango', 10, C.muted, 700) + text(500, 572, 'Productores', 10, C.muted, 700) + text(650, 572, 'Carne', 10, C.muted, 700) + text(750, 572, 'Leche', 10, C.muted, 700) + text(850, 572, 'Doble prop.', 10, C.muted, 700) + text(1080, 572, '% del total', 10, C.muted, 700);
  saveSvg('01-rancho-filtros-tamano.svg', 1280, 610, c);
}

function figure2() {
  let c = text(26, 38, 'Apoyos recibidos y tipo de producción', 22, C.ink, 700) + text(26, 60, 'Interconexión con SIAP y distribución productiva', 12, C.muted);
  c += rect(20, 78, 1240, 265, '#fff', 14, C.line) + text(40, 111, 'Apoyos recibidos', 16, C.ink, 700);
  [['Con apoyo', '552', '69% de productores', C.green], ['Sin apoyo', '248', '31% de productores', C.muted], ['Monto total estimado', '$20,320,000', 'apoyos registrados', C.gold]].forEach((item, i) => { const x = 40 + i * 400; c += rect(x, 132, 375, 78, i === 2 ? '#fff9ed' : '#f4fbf9', 12, C.line) + text(x + 187, 157, item[0], 11, C.muted, 600, 'middle') + text(x + 187, 184, item[1], 22, item[3], 700, 'middle') + text(x + 187, 202, item[2], 10, C.muted, 600, 'middle'); });
  [['PROGAN', 420, '$8,400,000'], ['FAPPA', 186, '$3,720,000'], ['PROCAMPO', 312, '$6,240,000'], ['Otro programa', 98, '$1,960,000']].forEach((item, i) => { const y = 235 + i * 22; c += text(40, y + 10, item[0], 10, C.muted, 600) + bar(40, y + 13, 540 * item[1] / 420, 9, [C.green, C.gold, C.red, C.gray][i], 5) + text(610, y + 10, `${item[2]}  ${item[1]} prod.`, 10, C.ink, 700, 'end'); });
  c += rect(20, 363, 1240, 180, '#fff', 14, C.line) + text(40, 397, 'Tipo de producción', 16, C.ink, 700);
  [['Pie de cría', '45%', C.green], ['Engorda', '38%', C.red], ['Leche', '52%', C.gold], ['Doble propósito', '28%', '#6e7074']].forEach((item, i) => { const x = 40 + i * 300; c += rect(x, 420, 280, 75, '#fbfcfd', 10, C.line) + text(x + 140, 452, item[0], 12, C.ink, 700, 'middle') + text(x + 140, 479, item[1], 22, C.gold, 700, 'middle'); });
  c += bar(40, 512, 1180, 18, '#e8ebee', 9); let start = 40; [[45, C.green], [38, C.red], [52, C.gold], [28, '#6e7074']].forEach(([pct, color]) => { c += bar(start, 512, 1180 * pct / 163, 18, color, 0); start += 1180 * pct / 163; });
  saveSvg('02-rancho-apoyos-produccion.svg', 1280, 570, c);
}

function figure3() {
  let c = text(26, 38, 'Carga animal y registro de propiedad', 22, C.ink, 700) + text(26, 60, 'Capacidad estimada, uso de suelo y documentos asociados al rancho', 12, C.muted);
  c += rect(20, 78, 1240, 180, '#fff', 14, C.line) + text(40, 111, 'Carga animal vs capacidad estimada', 16, C.ink, 700) + text(1155, 111, '1.09 cab/ha', 15, C.green, 700, 'middle');
  c += text(40, 148, 'Carga animal actual: 850 cabezas', 11, C.ink, 700) + bar(40, 160, 1180, 13, '#e8ebee', 7) + bar(40, 160, 835, 13, C.gold, 7) + text(1210, 171, '70.8%', 10, '#fff', 700, 'end');
  c += text(40, 195, 'Capacidad estimada: 1,200 cabezas', 11, C.ink, 700) + bar(40, 207, 1180, 13, '#bdcbd0', 7) + text(1210, 218, '100%', 10, '#fff', 700, 'end') + text(40, 247, 'Uso de capacidad: 70.8%', 11, C.muted, 700);
  c += rect(20, 280, 1240, 260, '#fff', 14, C.line) + text(40, 314, 'Registro de propiedad', 16, C.ink, 700) + text(700, 314, 'Documentos de propiedad (3)', 16, C.ink, 700);
  [['Propietario', 'Juan Pérez García'], ['Rancho', 'Los Fresnos'], ['Empresa', 'Ganadera Fresnos S.A. de C.V.'], ['Estado', 'Jalisco'], ['Municipio', 'Zapopan'], ['Localidad', 'El Salto'], ['Clave UPP', 'UPP-14-0987']].forEach((item, i) => { const y = 352 + i * 24; c += text(42, y, `${item[0]}:`, 10, C.muted, 700) + text(155, y, item[1], 10, C.ink); });
  ['Escritura pública.pdf', 'Plano catastral.dwg', 'Certificado uso de suelo.pdf'].forEach((v, i) => c += rect(700, 345 + i * 48, 510, 34, '#fafbfc', 8) + text(720, 366 + i * 48, v, 10, C.ink, 700) + text(1190, 366 + i * 48, 'ver', 9, C.muted, 600, 'end'));
  saveSvg('03-rancho-carga-propiedad.svg', 1280, 570, c);
}

function figure4() {
  let c = text(26, 38, 'Distribución de superficie por uso', 22, C.ink, 700) + text(26, 60, 'Superficie reportada por categoría', 12, C.muted);
  c += rect(20, 78, 1240, 145, '#fff', 14, C.line);
  [['Área de pastoreo:', '62.4% (780 ha)', C.green, 0.624], ['Área de cultivo/forraje:', '25.6% (320 ha)', C.gold, 0.256], ['Área de infraestructura:', '12% (150 ha)', C.red, 0.12]].forEach((item, i) => { const y = 112 + i * 34; c += text(40, y + 10, item[0], 12, C.ink, 700) + bar(250, y, 950, 17, '#e8ebee', 8) + bar(250, y, 950 * item[3], 17, item[2], 8) + text(1190, y + 12, item[1], 10, '#fff', 700, 'end'); });
  saveSvg('04-rancho-superficie-uso.svg', 1280, 250, c);
}

figure1(); figure2(); figure3(); figure4();

const runs = (value, opts = {}) => `<w:r>${opts.bold ? '<w:rPr><w:b/></w:rPr>' : ''}${opts.italic ? '<w:rPr><w:i/></w:rPr>' : ''}<w:t xml:space="preserve">${esc(value)}</w:t></w:r>`;
const p = (value = '', style = 'Normal') => `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr>${runs(value)}</w:p>`;
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
  const cx = Math.round(widthCm * 360000); const cy = Math.round(heightCm * 360000);
  return `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${relId.replace(/\D/g, '')}" name="${file}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${relId.replace(/\D/g, '')}" name="${file}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="${relId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>${p(caption, 'Caption')}`;
}

let body = pageBreak();
body += heading('12. Módulo Resumen del Rancho');
body += p('El módulo Resumen del Rancho consolida indicadores de superficie, producción, apoyos, carga animal y propiedad. Se accede mediante /admin/resumen-rancho y se renderiza en el componente Rancho dentro del LayoutComponent.');
body += bullet('Superficie total y distribución por pastoreo, cultivo/forraje e infraestructura.');
body += bullet('Tamaño del productor, rangos de animales y finalidad productiva.');
body += bullet('Apoyos recibidos, programas, monto estimado e interconexión con SIAP.');
body += bullet('Tipo de producción, carga animal, capacidad estimada y uso de capacidad.');
body += bullet('Registro de propiedad y documentos asociados al rancho.');
body += imageXml('image10.svg', 'rId14', 16.5, 7.85, 'Figura 6. Filtros, KPIs de superficie y tamaño del productor. Lámina basada en la captura de referencia compartida.');

body += heading('12.1 Organización del código', 2);
body += code('src/app/pages/Rancho/rancho.component.ts   Lógica, contratos y carga de datos\nsrc/app/pages/Rancho/rancho.html             Estructura de la vista y bindings\nsrc/app/pages/Rancho/rancho.scss              Estilos del dashboard\nsrc/app/app.routes.ts                         Ruta /admin/resumen-rancho\nsrc/environments/environment.prod.ts          URLs ranchoSuperficie, ranchoApoyos, etc.\nsrc/app/services/generic.service.ts           HTTP y Authorization Bearer\nsrc/app/services/pdf-export.service.ts        Exportación DOM a PDF');
body += p('Rancho utiliza ChangeDetectionStrategy.OnPush, Chart.js/ng2-charts para gráficas y PdfExportService para exportación. La carga se coordina con forkJoin; cada respuesta se aplica solo cuando existe y el resto puede continuar si un endpoint falla.');

body += heading('12.2 Carga, filtros y estado', 2);
body += p('ngOnInit llama loadCatalogs y loadData. Los catálogos alimentan tipos de producción, estados, municipios y localidades. Los cambios de estado y municipio limpian filtros dependientes, recargan catálogos y vuelven a consultar los indicadores.');
body += p('filterParams construye únicamente los criterios seleccionados: estado, municipio, localidad, tipo_produccion y q. La búsqueda libre se envía como q después de quitar espacios al inicio y al final. Aplicar búsqueda y cambios de filtros llaman loadData.');
body += table(['Control', 'Propiedad / parámetro', 'Efecto'], [
  ['Búsqueda', 'q', 'Filtra por rancho, propietario o UPP.'],
  ['Estado', 'estado', 'Actualiza municipios y todos los indicadores.'],
  ['Municipio', 'municipio', 'Actualiza localidades y todos los indicadores.'],
  ['Localidad', 'localidad', 'Restringe resultados del rancho.'],
  ['Tipo de producción', 'tipo_produccion', 'Restringe por actividad productiva.'],
  ['Actualizar datos', 'POST cache/flush', 'Limpia caché del módulo y recarga.']
]);

body += heading('12.3 Funcionalidades y visualización', 2);
body += table(['Panel', 'Respuesta / fuente', 'Presentación'], [
  ['Superficie', 'superficie_total_ha, usos[]', 'KPI y barras porcentuales por uso.'],
  ['Tamaño del productor', 'total_productores, tamanos[]', 'Dona, barras y tabla con rangos/finalidad.'],
  ['Apoyos', 'con_apoyo, sin_apoyo, monto_total_mxn, programas[]', 'Tarjetas, barras de programas y monto MXN.'],
  ['Tipo de producción', 'tipos[]', 'Tarjetas de porcentaje y barra segmentada.'],
  ['Carga animal', 'cabezas, capacidad_cabezas, carga_cab_ha', 'Barras de carga actual/capacidad y uso.'],
  ['Propiedad', 'propietario, rancho, empresa, ubicación, documentos[]', 'Ficha de propiedad y lista de documentos.']
]);
body += imageXml('image11.svg', 'rId15', 16.5, 7.35, 'Figura 7. Apoyos recibidos, programas activos y tipo de producción.');
body += imageXml('image12.svg', 'rId16', 16.5, 7.35, 'Figura 8. Carga animal, capacidad estimada y registro de propiedad.');
body += imageXml('image13.svg', 'rId17', 16.5, 3.25, 'Figura 9. Distribución de superficie por uso.');

body += heading('12.4 Endpoints del módulo', 2);
body += table(['Endpoint', 'Método', 'Uso'], [
  ['/api/rancho/catalogos', 'GET', 'Tipos de producción, estados, municipios y localidades.'],
  ['/api/rancho/superficie', 'GET', 'Superficie total y usos.'],
  ['/api/rancho/tamano-productor', 'GET', 'Tamaños, rangos, productores y finalidad.'],
  ['/api/rancho/apoyos', 'GET', 'Apoyos, programas, montos y URL SIAP.'],
  ['/api/rancho/tipo-produccion', 'GET', 'Distribución por tipo productivo.'],
  ['/api/rancho/carga-animal', 'GET', 'Cabezas, capacidad y carga por hectárea.'],
  ['/api/rancho/registro-propiedad', 'GET', 'Datos del propietario y documentos.'],
  ['/api/rancho/export', 'GET Blob', 'Descarga resumen-rancho.csv con filtros actuales.'],
  ['/api/rancho/cache/flush', 'POST', 'Solicita actualización de caché.']
]);
body += p('Todas las peticiones de datos y catálogo se envían con isSecure=true. Los filtros viajan como query parameters. La vista no persiste cambios de negocio; es de consulta y exportación.', 'Note');

body += heading('12.5 Exportaciones', 2);
body += p('Exportar CSV llama ranchoExport con filterParams y descarga el Blob como resumen-rancho.csv. Exportar PDF entrega #pdfContent al mismo PdfExportService usado por el módulo pecuario; el nombre de salida es resumen-rancho.pdf.');
body += bullet('La exportación CSV conserva búsqueda, estado, municipio, localidad y tipo de producción.');
body += bullet('La exportación PDF captura los paneles visibles del estado actual.');
body += bullet('Los controles interactivos se ocultan durante la captura y se restauran al finalizar.');

body += heading('12.6 Integración con SIAP', 2);
body += p('La respuesta de apoyos puede incluir siap_url. La vista ofrece Consultar en SIAP para abrir la fuente externa y muestra una nota de interconexión con el Sistema de Información Agroalimentaria y Pesquera. El frontend no edita el padrón SIAP; consulta indicadores y ofrece el enlace de origen.');

body += heading('12.7 Base de datos lógica', 2);
body += p('El frontend no contiene SQL, migraciones ni entidades físicas. Los contratos permiten identificar estas entidades lógicas: Rancho/UPP, superficie por uso, productor, apoyo SIAP, tipo de producción, inventario/carga animal y documento de propiedad.');
body += table(['Entidad lógica', 'Campos observables', 'Relación funcional'], [
  ['Rancho / UPP', 'rancho, clave_upp, propietario, empresa, ubicación', 'Unidad central del resumen y filtro de consulta.'],
  ['Superficie', 'superficie_total_ha, usos, ha, pct', 'Se distribuye por uso del suelo del rancho.'],
  ['Productor', 'productores, tamanos, rango_animales', 'Se agrupa por tamaño y finalidad.'],
  ['Apoyo SIAP', 'programa, monto_mxn, productores, pct_productores', 'Relaciona productores con programas y montos.'],
  ['Carga animal', 'cabezas, capacidad_cabezas, carga_cab_ha', 'Compara inventario actual con capacidad.'],
  ['Documento', 'nombre, extension, subido_el, url', 'Pertenece al registro de propiedad del rancho.']
]);
body += note('Validar llaves, cardinalidades, permisos, caché y retención de documentos con el backend. Esta sección describe el contrato observable, no el esquema físico.', 'Warning');

body += heading('12.8 Configuración y observaciones', 2);
body += code('npm install\nnpm start\n# abrir http://localhost:4200/admin/resumen-rancho');
body += bullet('Las URLs del módulo están en environment.ts y environment.prod.ts bajo ranchoPath.');
body += bullet('La API QA debe estar disponible y permitir CORS desde localhost:4200.');
body += bullet('El login y Authorization Bearer siguen el flujo documentado en la sección 5.');
body += bullet('El backend debe documentar el origen de datos SIAP y el manejo de documentos de propiedad.');
body += bullet('La ruta admin mantiene el mismo comportamiento de AuthGuard documentado previamente.');

const extracted = path.join(temp, 'package');
execFileSync('unzip', ['-q', input, '-d', extracted]);
const docPath = path.join(extracted, 'word', 'document.xml');
let doc = fs.readFileSync(docPath, 'utf8');
if (repairOnly) {
  const tocEntry = /<w:p>[\s\S]*?<w:pStyle w:val="TOC"\/>[\s\S]*?<w:t>12\. Módulo Resumen del Rancho<\/w:t>[\s\S]*?<\/w:p>/;
  doc = doc.replace(tocEntry, '');
  fs.writeFileSync(docPath, doc);
  execFileSync('zip', ['-qr', output, '.'], { cwd: extracted });
  fs.copyFileSync(output, input);
  fs.rmSync(temp, { recursive: true, force: true });
  console.log(`Repaired ${input} without changing existing layout`);
  process.exit(0);
}
doc = doc.replace('<w:sectPr', body + '<w:sectPr');
fs.writeFileSync(docPath, doc);

const relPath = path.join(extracted, 'word', '_rels', 'document.xml.rels');
let rels = fs.readFileSync(relPath, 'utf8');
rels = rels.replace('</Relationships>', '<Relationship Id="rId14" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image10.svg"/><Relationship Id="rId15" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image11.svg"/><Relationship Id="rId16" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image12.svg"/><Relationship Id="rId17" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image13.svg"/></Relationships>');
fs.writeFileSync(relPath, rels);
for (const [source, target] of [['01-rancho-filtros-tamano.svg', 'image10.svg'], ['02-rancho-apoyos-produccion.svg', 'image11.svg'], ['03-rancho-carga-propiedad.svg', 'image12.svg'], ['04-rancho-superficie-uso.svg', 'image13.svg']]) fs.copyFileSync(path.join(assets, source), path.join(extracted, 'word', 'media', target));

execFileSync('zip', ['-qr', output, '.'], { cwd: extracted });
fs.copyFileSync(output, input);
fs.rmSync(temp, { recursive: true, force: true });
console.log(`Updated ${input}`);
