import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const docs = path.join(root, 'docs');
const assets = path.join(docs, 'assets', 'manual-uso-suelo');
const input = path.join(docs, 'manual-tecnico-pecuario.docx');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'manual-uso-suelo-'));
const output = path.join(temp, 'manual-tecnico-uso-suelo.docx');
fs.mkdirSync(assets, { recursive: true });

const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const C = { green: '#22685d', gold: '#ad8127', ink: '#182237', muted: '#697586', line: '#dfe5ea', bg: '#f7f8fa', gray: '#9d9da0', red: '#a1244e', orange: '#cf7436', mint: '#4d9d7e', dark: '#174d47' };
const text = (x, y, value, size = 16, fill = C.ink, weight = 400, anchor = 'start') => `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}">${esc(value)}</text>`;
const rect = (x, y, w, h, fill = '#fff', rx = 12, stroke = 'none') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>`;
const bar = (x, y, w, h, fill, rx = 5) => rect(x, y, w, h, fill, rx);
const svg = (width, height, content) => `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${C.bg}"/>${content}</svg>`;
const saveSvg = (name, width, height, content) => fs.writeFileSync(path.join(assets, name), svg(width, height, content));

function figure1() {
  let c = text(26, 38, 'Uso de Suelo y Vegetación', 25, C.green, 700) + text(26, 60, 'Monitoreo ambiental y manejo del suelo — Visión nacional por temporada', 12, C.muted);
  c += rect(22, 82, 1236, 58, '#fff', 14, C.line);
  ['Buscar por rancho, UPP o región', 'Todos los estados', 'Todos los municipios', 'Primavera 2025', '2025'].forEach((v, i) => c += rect(34 + i * 243, 97, 230, 30, '#fff', 8, C.line) + text(47 + i * 243, 117, v, 10, C.muted));
  c += rect(34, 145, 110, 28, C.red, 8) + text(89, 164, 'Exportar CSV', 10, '#fff', 700, 'middle');
  [['Vegetación nativa', '52%', '52% del total (650 ha)', C.green], ['Vegetación exótica', '18%', '18% del total (225 ha)', C.orange], ['Vegetación invasora', '12%', '12% del total (150 ha)', C.red], ['Vegetación inducida', '18%', '18% del total (225 ha)', C.mint]].forEach((item, i) => { const x = 22 + i * 310; c += rect(x, 190, 294, 108, '#fff', 14, C.line) + text(x + 16, 218, item[0], 11, C.muted, 700) + text(x + 16, 258, item[1], 25, item[3], 700) + text(x + 274, 282, item[2], 9, item[3], 700, 'end'); });
  c += rect(22, 316, 1236, 280, C.dark, 14) + text(40, 349, 'Condiciones Climáticas e Hidrológicas', 17, '#fff', 700) + text(40, 370, 'Comisión Nacional del Agua — datos de precipitación, sequía y recursos hídricos', 10, '#d7eeeb') + rect(40, 394, 80, 26, '#fff', 13) + text(80, 411, 'FILTROS', 9, C.dark, 700, 'middle') + rect(130, 394, 80, 26, '#fff', 8) + text(170, 411, '2026', 9, C.muted, 700, 'middle');
  c += rect(40, 432, 105, 27, C.green, 14) + text(92, 450, 'Precipitación', 9, '#fff', 700, 'middle') + rect(154, 432, 70, 27, '#fff', 14) + text(189, 450, 'Sequía', 9, C.muted, 700, 'middle') + rect(232, 432, 92, 27, '#fff', 14) + text(278, 450, 'Temperatura', 9, C.muted, 700, 'middle');
  [['Acumulado anual', '801 mm', '-14% vs normal'], ['Sep 2026', '98 mm', '-25.8% vs normal'], ['Días con lluvia', '18 días', '+2 vs normal'], ['Máx. diario (Jul)', '45 mm', 'Normal']].forEach((item, i) => { const x = 40 + i * 300; c += rect(x, 478, 280, 75, i < 2 ? '#fff2f3' : '#fbfcfd', 10, C.line) + text(x + 14, 502, item[0], 10, C.muted) + text(x + 14, 528, item[1], 20, C.ink, 700) + text(x + 14, 546, item[2], 9, i < 2 ? C.red : C.muted, 700); });
  saveSvg('01-uso-cobertura-clima.svg', 1280, 620, c);
}

function figure2() {
  let c = text(26, 38, 'Disponibilidad de agua y pastoreo', 22, C.ink, 700) + text(26, 60, 'Fuentes de agua y tipos de pastoreo por época del año', 12, C.muted);
  c += rect(20, 78, 605, 470, '#fff', 14, C.line) + rect(655, 78, 605, 470, '#fff', 14, C.line);
  c += text(40, 111, 'Disponibilidad de agua', 16, C.ink, 700) + text(40, 139, 'Ranchos con toma de agua', 11, C.muted) + text(40, 180, '78%', 29, C.green, 700) + bar(40, 195, 540, 9, '#e8ebee', 5) + bar(40, 195, 421, 9, C.gold, 5) + text(580, 212, '78% del total de ranchos', 9, C.gold, 700, 'end') + text(40, 246, 'Fuentes de agua principales', 11, C.muted, 700);
  [['Pozo profundo', 45, C.green], ['Río / Arroyo', 32, C.gold], ['Ojo de agua', 15, C.mint], ['Bordo / Represa', 8, C.orange]].forEach((item, i) => { const y = 275 + i * 47; c += text(40, y, item[0], 10, C.muted, 700) + text(580, y, `${item[1]}%`, 10, C.gold, 700, 'end') + bar(40, y + 9, 540, 18, '#e8ebee', 9) + bar(40, y + 9, 540 * item[1] / 45, 18, item[2], 9) + text(570, y + 22, `${item[1]}%`, 9, '#fff', 700, 'end'); });
  c += text(675, 111, 'Tipos de pastoreo por época del año', 16, C.ink, 700);
  const seasons = ['Primavera', 'Verano', 'Otoño', 'Invierno']; seasons.forEach((season, i) => { const x = 690 + i * 132; c += text(x + 45, 454, season, 9, C.muted, 600, 'middle') + bar(x, 220 - [42, 38, 45, 40][i] * 3, 35, [42, 38, 45, 40][i] * 3, C.green) + bar(x + 40, 220 - [35, 40, 32, 38][i] * 3, 35, [35, 40, 32, 38][i] * 3, C.gold) + bar(x + 80, 220 - [23, 22, 23, 22][i] * 3, 35, [23, 22, 23, 22][i] * 3, C.red); });
  c += text(675, 493, 'Intensivo  ·  Continuo  ·  Alta densidad', 9, C.muted, 600);
  saveSvg('02-uso-agua-pastoreo.svg', 1280, 570, c);
}

function figure3() {
  let c = text(26, 38, 'Evolución histórica de cobertura vegetal', 22, C.ink, 700) + text(26, 60, 'Comparativa de vegetación nativa, exótica, invasora e inducida', 12, C.muted);
  c += rect(20, 78, 1240, 315, '#fff', 14, C.line);
  const labels = ['Primavera 2024', 'Verano 2024', 'Otoño 2024', 'Invierno 2025']; const values = [[56, 17, 9, 18], [54, 18, 10, 18], [52, 18, 11, 19], [48, 19, 14, 19]];
  labels.forEach((label, i) => { const x = 130 + i * 280; values[i].forEach((v, j) => c += bar(x + j * 40, 330 - v * 3, 28, v * 3, [C.green, C.orange, C.red, C.mint][j], 3)); c += text(x + 60, 360, label, 9, C.muted, 600, 'middle'); });
  c += text(45, 120, '100%', 9, C.muted) + text(45, 230, '50%', 9, C.muted) + text(45, 340, '0%', 9, C.muted);
  [['Nativa', C.green], ['Exótica', C.orange], ['Invasora', C.red], ['Inducida', C.mint]].forEach((item, i) => c += rect(480 + i * 115, 375, 12, 12, item[1], 3) + text(498 + i * 115, 385, item[0], 9, C.muted));
  c += rect(20, 418, 1240, 78, '#fff', 14, C.line) + text(40, 451, 'Alerta de tendencia', 16, C.ink, 700) + text(40, 476, 'La vegetación invasora aumentó 5% en el último año. Priorizar control y monitoreo ambiental.', 11, C.muted);
  saveSvg('03-uso-evolucion-alerta.svg', 1280, 530, c);
}

figure1(); figure2(); figure3();

const runs = (value) => `<w:r><w:t xml:space="preserve">${esc(value)}</w:t></w:r>`;
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
  const cx = Math.round(widthCm * 360000); const cy = Math.round(heightCm * 360000); const id = relId.replace(/\D/g, '');
  return `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${id}" name="${file}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${id}" name="${file}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="${relId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>${p(caption, 'Caption')}`;
}

let body = pageBreak();
body += heading('13. Módulo Uso de Suelo y Vegetación');
body += p('El módulo Uso de Suelo y Vegetación monitorea cobertura vegetal, condiciones climáticas e hidrológicas, disponibilidad de agua y tipos de pastoreo. Se accede mediante /admin/uso-suelo-vegetacion y se renderiza en el componente UsoSuelo.');
body += bullet('Cobertura: vegetación nativa, exótica, invasora e inducida.');
body += bullet('Clima CONAGUA: precipitación, sequía, temperatura, escurrimiento y humedad/ETP.');
body += bullet('Agua: porcentaje de ranchos con toma y fuentes principales.');
body += bullet('Pastoreo: distribución por época del año y tipo de manejo.');
body += bullet('Evolución histórica y alerta de tendencia de vegetación invasora.');
body += imageXml('image14.svg', 'rId18', 16.5, 8.0, 'Figura 10. Filtros, cobertura vegetal y condiciones climáticas. Lámina basada en la captura de referencia compartida.');

body += heading('13.1 Organización del código', 2);
body += code('src/app/pages/UsoSuelo/uso-suelo.component.ts   Lógica, contratos y consultas\nsrc/app/pages/UsoSuelo/uso-suelo.html             Estructura de la vista y bindings\nsrc/app/pages/UsoSuelo/uso-suelo.scss              Estilos del dashboard\nsrc/app/app.routes.ts                              Ruta /admin/uso-suelo-vegetacion\nsrc/environments/environment.prod.ts               URLs del servicio uso-suelo\nsrc/app/services/generic.service.ts                HTTP y Authorization Bearer\nsrc/app/services/pdf-export.service.ts             Exportación DOM a PDF');
body += p('El componente usa ChangeDetectionStrategy.OnPush, Chart.js/ng2-charts, señales de renderizado y PdfExportService. La vista separa filtros de cobertura/temporada y controles climáticos de año, variable y periodo.');

body += heading('13.2 Flujo de carga y filtros', 2);
body += p('ngOnInit carga catálogos y datos. loadCatalogs obtiene estados, municipios, temporadas, años, variables climáticas y periodos. loadData construye filterParams y climateParams, ejecuta cinco peticiones con forkJoin y aplica las respuestas disponibles. Cada petición tolera error con catchError(() => of(null)).');
body += table(['Control', 'Parámetro', 'Comportamiento'], [
  ['Búsqueda', 'q', 'Busca por rancho, UPP o región.'],
  ['Estado', 'estado', 'Actualiza municipios y datos del módulo.'],
  ['Municipio', 'municipio', 'Filtra cobertura, evolución, agua y pastoreo.'],
  ['Temporada / año', 'temporada, anio', 'Filtra cobertura y evolución vegetal.'],
  ['Año climático', 'anio', 'Selecciona año de la consulta climática.'],
  ['Variable', 'variable', 'Precipitación, sequía, temperatura, escurrimiento o humedad/ETP.'],
  ['Periodo', 'periodo', 'Mensual o trimestral.']
]);
body += p('El clima recibe estado cuando existe, pero no municipio. La cobertura, evolución, agua y pastoreo reciben los filtros de temporada/año y también estado, municipio y q.', 'Note');

body += heading('13.3 Funcionalidades y visualización', 2);
body += table(['Panel', 'Contrato', 'Presentación'], [
  ['Cobertura', 'superficie_total_ha, tipos[]', 'Tarjetas por tipo con porcentaje y hectáreas.'],
  ['Clima', 'fuente, conectado, actualizado_en, kpis[], serie[]', 'Estado de conexión, KPIs y barras Actual vs Normal histórica.'],
  ['Agua', 'total_ranchos, con_toma_agua_pct, fuentes[]', 'Indicador total y barras por fuente.'],
  ['Pastoreo', 'total_ranchos, epocas[]', 'Barras agrupadas y desglose por temporada.'],
  ['Evolución', 'periodos[] con tipos', 'Barras porcentuales por temporada histórica.'],
  ['Alerta', 'evolutionChange()', 'Calcula cambio de invasora entre primer y último periodo.']
]);
body += imageXml('image15.svg', 'rId19', 16.5, 7.35, 'Figura 11. Disponibilidad de agua y tipos de pastoreo por época.');
body += imageXml('image16.svg', 'rId20', 16.5, 6.85, 'Figura 12. Evolución histórica de cobertura vegetal y alerta de tendencia.');

body += heading('13.4 Endpoints del módulo', 2);
body += table(['Endpoint', 'Método', 'Uso'], [
  ['/api/uso-suelo/catalogos', 'GET', 'Catálogos de filtros y variables climáticas.'],
  ['/api/uso-suelo/cobertura', 'GET', 'Cobertura actual por tipo vegetal.'],
  ['/api/uso-suelo/cobertura/evolucion', 'GET', 'Serie histórica por temporada.'],
  ['/api/uso-suelo/clima', 'GET', 'KPIs y serie climática.'],
  ['/api/uso-suelo/agua', 'GET', 'Tomas de agua y fuentes.'],
  ['/api/uso-suelo/pastoreo', 'GET', 'Tipos de pastoreo por época.'],
  ['/api/uso-suelo/export', 'GET Blob', 'Descarga uso-suelo-{año}-{temporada}.csv.'],
  ['/api/uso-suelo/clima/sincronizar', 'POST', 'Sincroniza datos climáticos.'],
  ['/api/uso-suelo/cache/flush', 'POST', 'Path definido en configuración; no lo invoca este componente.']
]);

body += heading('13.5 Integración climática con CONAGUA', 2);
body += p('La respuesta climática identifica fuente, conexión, fecha de actualización, región, variable, periodo, KPIs y serie. El botón Sincronizar llama POST /api/uso-suelo/clima/sincronizar; al terminar, recarga los cinco bloques de datos. La interfaz muestra Conectado o Sin conexión según climate.conectado.');
body += p('Los datasets climáticos comparan actual contra normal histórica. formatValue combina valor y unidad; vs_normal_pct o diferencia_vs_normal se muestran como referencia de desviación.', 'Note');

body += heading('13.6 Exportaciones y PDF', 2);
body += p('Exportar CSV llama /api/uso-suelo/export con filterParams y descarga uso-suelo-{selectedYear}-{selectedSeason}.csv. Exportar PDF envía #pdfContent a PdfExportService con nombre uso-suelo-vegetacion.pdf. El servicio común oculta filtros y controles durante la captura, conserva las gráficas renderizadas y divide el DOM en páginas A4 horizontal.');

body += heading('13.7 Base de datos lógica', 2);
body += p('El repositorio frontend no contiene SQL, migraciones ni entidades físicas. Los contratos observables permiten documentar estas entidades lógicas: cobertura vegetal, periodo/temporada, serie climática, rancho con agua, fuente de agua y manejo de pastoreo.');
body += table(['Entidad lógica', 'Campos observables', 'Relación funcional'], [
  ['Cobertura vegetal', 'tipo, ha, pct, superficie_total_ha', 'Se agrupa por temporada, año y región.'],
  ['Periodo histórico', 'anio, temporada, etiqueta, tipos', 'Compara coberturas nativa, exótica, invasora e inducida.'],
  ['Serie climática', 'periodo, etiqueta, actual, normal', 'Se filtra por variable, año, periodo y estado.'],
  ['Fuente de agua', 'clave, etiqueta, ranchos, pct', 'Pertenece al resumen de disponibilidad de agua.'],
  ['Manejo de pastoreo', 'época, tipo, ranchos, pct', 'Relaciona temporada con tipo de pastoreo.']
]);
body += note('Validar llaves, agregaciones, origen CONAGUA, periodicidad, caché y permisos con el backend. Esta sección describe contratos frontend, no el esquema físico.', 'Warning');

body += heading('13.8 Configuración y observaciones', 2);
body += code('npm install\nnpm start\n# abrir http://localhost:4200/admin/uso-suelo-vegetacion');
body += bullet('La base del servicio está en usoSueloPath: https://giz-qa.encodingmx.com/api/uso-suelo.');
body += bullet('Las llamadas usan isSecure=true y requieren sesión válida con Bearer.');
body += bullet('selectedYear inicia en 2025; climateYear inicia en 2026. Son filtros independientes.');
body += bullet('formatNumber usa locale en-US en este componente, distinto de otros módulos que usan es-MX.');
body += bullet('usoSueloCacheFlush está configurado, pero el botón actual sincroniza clima mediante usoSueloClimaSincronizar.');

const extracted = path.join(temp, 'package');
execFileSync('unzip', ['-q', input, '-d', extracted]);
const docPath = path.join(extracted, 'word', 'document.xml');
let doc = fs.readFileSync(docPath, 'utf8');
if (doc.includes('13. Módulo Uso de Suelo y Vegetación')) {
  fs.rmSync(temp, { recursive: true, force: true });
  console.log('Uso de Suelo ya existe; no se modificó el documento.');
  process.exit(0);
}
doc = doc.replace('<w:sectPr', body + '<w:sectPr');
fs.writeFileSync(docPath, doc);

const relPath = path.join(extracted, 'word', '_rels', 'document.xml.rels');
let rels = fs.readFileSync(relPath, 'utf8');
rels = rels.replace('</Relationships>', '<Relationship Id="rId18" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image14.svg"/><Relationship Id="rId19" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image15.svg"/><Relationship Id="rId20" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image16.svg"/></Relationships>');
fs.writeFileSync(relPath, rels);
for (const [source, target] of [['01-uso-cobertura-clima.svg', 'image14.svg'], ['02-uso-agua-pastoreo.svg', 'image15.svg'], ['03-uso-evolucion-alerta.svg', 'image16.svg']]) fs.copyFileSync(path.join(assets, source), path.join(extracted, 'word', 'media', target));

execFileSync('zip', ['-qr', output, '.'], { cwd: extracted });
fs.copyFileSync(output, input);
fs.rmSync(temp, { recursive: true, force: true });
console.log(`Appended Uso de Suelo to ${input}`);
