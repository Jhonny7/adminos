import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const docs = path.join(root, 'docs');
const assets = path.join(docs, 'assets', 'manual-sanidad');
const input = path.join(docs, 'manual-tecnico-pecuario.docx');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'manual-sanidad-'));
const output = path.join(temp, 'manual-tecnico-sanidad.docx');
fs.mkdirSync(assets, { recursive: true });

const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const C = { green: '#22685d', gold: '#ad8127', ink: '#182237', muted: '#697586', line: '#dfe5ea', bg: '#f7f8fa', gray: '#9d9da0', red: '#a1244e', pale: '#eef7f5' };
const text = (x, y, value, size = 16, fill = C.ink, weight = 400, anchor = 'start') => `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}">${esc(value)}</text>`;
const rect = (x, y, w, h, fill = '#fff', rx = 12, stroke = 'none') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>`;
const bar = (x, y, w, h, fill, rx = 5) => rect(x, y, w, h, fill, rx);
const svg = (width, height, content) => `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${C.bg}"/>${content}</svg>`;
const saveSvg = (name, width, height, content) => fs.writeFileSync(path.join(assets, name), svg(width, height, content));

function figure1() {
  let c = text(26, 38, 'Sanidad, Vacunación y Certificaciones', 25, C.green, 700) + text(26, 60, 'Estado de salud del hato y trazabilidad sanitaria — Visión nacional', 12, C.muted);
  c += rect(22, 82, 1236, 58, '#fff', 14, C.line);
  ['Buscar por UPP, rancho o folio...', 'Todos los estados', 'Todas las certificaciones', 'Todas las razas'].forEach((v, i) => c += rect(34 + i * 300, 97, 285, 30, '#fff', 8, C.line) + text(47 + i * 300, 117, v, 10, C.muted));
  c += rect(34, 145, 110, 28, C.red, 8) + text(89, 164, 'Exportar CSV', 10, '#fff', 700, 'middle');
  [['Cobertura de vacunación', '72%', '72% del hato vacunado', C.gold, '💉'], ['Ranchos con certificación vigente', '64%', '64% (2,350 ranchos)', C.gold, '✅'], ['Protocolos de sanidad implementados', '82%', '82% cumplimiento', C.green, '🏥'], ['Enfermedades bajo control', '4/8', '50% de cobertura', C.red, '⚠️']].forEach((item, i) => { const x = 22 + i * 310; c += rect(x, 190, 294, 108, '#fff', 14, C.line) + text(x + 18, 218, item[4], 20, item[3], 700) + text(x + 18, 244, item[0], 10, C.muted, 700) + text(x + 18, 278, item[1], 26, item[3], 700) + bar(x + 18, 289, 260, 8, '#e8ebee', 5) + bar(x + 18, 289, 260 * (i === 3 ? 0.5 : parseInt(item[1]) / 100), 8, C.gold, 5) + text(x + 274, 304, item[2], 9, item[3], 700, 'end'); });
  c += rect(22, 326, 600, 245, '#fff', 14, C.line) + rect(642, 326, 616, 245, '#fff', 14, C.line) + text(40, 359, 'Cartilla de Vacunación', 16, C.ink, 700) + text(660, 359, 'UPPs Certificadas', 16, C.ink, 700) + rect(40, 380, 560, 25, '#f5f7f8', 0) + text(52, 397, 'Enfermedad', 9, C.muted, 700) + text(280, 397, 'Última aplicación', 9, C.muted, 700) + text(430, 397, 'Clasificación NOM_MX', 9, C.muted, 700) + rect(660, 380, 580, 25, '#f5f7f8', 0) + text(672, 397, 'UPP', 9, C.muted, 700) + text(790, 397, 'Rancho', 9, C.muted, 700) + text(950, 397, 'Certificación', 9, C.muted, 700) + text(1110, 397, 'Estado', 9, C.muted, 700);
  [['Clostridiosis', '15/03/2025'], ['Leptospirosis', '10/03/2025'], ['Cochliomyia hominivorax', 'Pendiente'], ['Queratoconjuntivitis', 'Pendiente'], ['Neumonía bacteriana', '05/03/2025']].forEach((item, i) => { const y = 430 + i * 26; c += text(52, y, item[0], 9, C.ink) + text(280, y, item[1], 9, item[1] === 'Pendiente' ? C.red : C.green, 700); });
  [['UPP-14-0987', 'Los Fresnos', 'Vigente'], ['UPP-14-1024', 'El Mirador', 'Vigente'], ['UPP-14-1156', 'La Primavera', 'Vigente'], ['UPP-14-1289', 'Los Pinos', 'En proceso']].forEach((item, i) => { const y = 430 + i * 30; c += text(672, y, item[0], 9, C.green, 700) + text(790, y, item[1], 9, C.ink) + text(950, y, 'Libre de brucelosis', 9, C.ink) + text(1110, y, item[2], 9, item[2] === 'Vigente' ? C.green : C.gold, 700); });
  saveSvg('01-sanidad-kpis-tablas.svg', 1280, 600, c);
}

function figure2() {
  let c = text(26, 38, 'Enfermedades, protocolos y cobertura', 22, C.ink, 700) + text(26, 60, 'Seguimiento sanitario por UPP, animal y enfermedad', 12, C.muted);
  c += rect(20, 78, 1240, 175, '#fff', 14, C.line) + text(40, 111, 'Registro de enfermedades por UPP, Lote y Animal (Arete SINIIGA)', 16, C.ink, 700) + rect(40, 130, 1195, 25, '#f5f7f8', 0) + text(52, 147, 'UPP', 9, C.muted, 700) + text(200, 147, 'Rancho', 9, C.muted, 700) + text(370, 147, 'Enfermedad', 9, C.muted, 700) + text(730, 147, 'Arete SINIIGA', 9, C.muted, 700) + text(1000, 147, 'Animal', 9, C.muted, 700) + text(1170, 147, 'Estado', 9, C.muted, 700);
  [['UPP-14-0987', 'Los Fresnos', 'Cochliomyia hominivorax', 'MXJAL0987A3-042', 'Vaca 042', 'En tratamiento'], ['UPP-14-1024', 'El Mirador', 'Mastitis', 'MXJAL1024B1-023', 'Vaca 023', 'Controlado'], ['UPP-14-1156', 'La Primavera', 'Queratoconjuntivitis', 'MXJAL1156C2-089', 'Toro 089', 'En tratamiento'], ['UPP-14-1289', 'Los Pinos', 'Cochliomyia hominivorax', 'MXVER1289D5-134', 'Vaca 134', 'En tratamiento']].forEach((item, i) => { const y = 177 + i * 25; c += text(52, y, item[0], 9, C.green, 700) + text(200, y, item[1], 9, C.ink) + text(370, y, item[2], 9, C.red, 700) + text(730, y, item[3], 8, C.ink) + text(1000, y, item[4], 9, C.ink) + text(1170, y, item[5], 9, item[5] === 'Controlado' ? C.green : C.red, 700); });
  c += rect(20, 273, 1240, 145, '#fff', 14, C.line) + text(40, 306, 'Protocolos de Sanidad', 16, C.ink, 700) + text(40, 340, 'Control de acceso y limpieza', 11, C.ink, 700) + text(40, 362, 'Acceso restringido: Sí  ·  Registro de visitantes: Sí', 10, C.muted) + text(40, 386, 'Limpieza diaria de instalaciones: 82%', 10, C.green, 700) + bar(370, 378, 235, 8, '#e8ebee', 5) + bar(370, 378, 193, 8, C.gold, 5) + text(650, 340, 'Protocolo de sanitización', 11, C.ink, 700) + text(650, 362, 'Limpieza de calzado: Implementado 76%', 10, C.muted) + text(650, 386, 'Desinfección vehículos: Implementado 68%', 10, C.muted) + text(960, 340, 'Observaciones generales', 11, C.ink, 700) + text(960, 365, 'Última auditoría: 10/04/2025', 10, C.gold, 700) + text(960, 389, '18 brotes de gusano barrenador detectados', 9, C.gold, 600);
  c += rect(20, 438, 1240, 265, '#fff', 14, C.line) + text(40, 471, 'Cobertura de vacunación por enfermedad', 16, C.ink, 700);
  [['Clostridiosis', 85, C.green], ['Leptospirosis', 82, C.green], ['Cochliomyia hominivorax', 38, C.red], ['Queratoconjuntivitis', 45, C.red], ['Neumonía bacteriana', 78, C.gold], ['Mastitis', 52, C.red], ['Pododermatitis bovina', 68, C.gold]].forEach((item, i) => { const y = 505 + i * 25; c += text(40, y + 10, item[0], 9, C.ink, 700) + bar(260, y, 930, 15, '#e8ebee', 8) + bar(260, y, 930 * item[1] / 100, 15, item[2], 8) + text(1180, y + 11, `${item[1]}%`, 9, '#fff', 700, 'end'); });
  saveSvg('02-sanidad-enfermedades-protocolos.svg', 1280, 735, c);
}

function figure3() {
  let c = text(26, 38, 'Recomendaciones para políticas públicas', 22, C.ink, 700) + text(26, 60, 'Prioridades derivadas de cobertura, brotes y certificaciones', 12, C.muted);
  c += rect(20, 78, 1240, 225, '#fff', 14, C.line);
  [['Prioridad alta', 'Cochliomyia hominivorax (Gusano barrenador) presenta la mayor incidencia actual con solo 38% de cobertura. Queratoconjuntivitis y mastitis requieren atención urgente.', C.gold, '⚠️'], ['Oportunidad', 'Incrementar certificación de Buenas Prácticas Pecuarias. Inversión estimada: $4.2M MXN.', C.gold, '📈'], ['Alertas', '18 brotes de gusano barrenador este mes. Reforzar bioseguridad: desinfección de calzado y cuarentena de ganado nuevo.', C.red, '🚨']].forEach((item, i) => { const x = 40 + i * 400; c += rect(x, 105, 375, 160, '#fbfcfd', 12, C.line) + text(x + 16, 137, `${item[3]} ${item[0]}`, 13, item[2], 700) + text(x + 16, 172, item[1].slice(0, 48), 10, C.muted, 600) + text(x + 16, 191, item[1].slice(48, 96), 10, C.muted, 600) + text(x + 16, 210, item[1].slice(96, 150), 10, C.muted, 600); });
  saveSvg('03-sanidad-recomendaciones.svg', 1280, 340, c);
}

figure1(); figure2(); figure3();

const escRuns = (value) => `<w:r><w:t xml:space="preserve">${esc(value)}</w:t></w:r>`;
const p = (value = '', style = 'Normal') => `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr>${escRuns(value)}</w:p>`;
const pageBreak = () => '<w:p><w:r><w:br w:type="page"/></w:r></p>';
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

let body = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
body += heading('15. Módulo Sanidad, Vacunación y Certificaciones');
body += p('El módulo Sanidad, Vacunación y Certificaciones presenta el estado sanitario del hato y la trazabilidad sanitaria. Se accede mediante /admin/sanidad-vacunacion y se renderiza en el componente SanidadVacunacion.');
body += bullet('KPIs de cobertura de vacunación, certificaciones, protocolos y enfermedades bajo control.');
body += bullet('Cartilla de vacunación y UPPs certificadas.');
body += bullet('Registro de enfermedades por UPP, lote, animal y arete SINIIGA.');
body += bullet('Protocolos de acceso, limpieza, sanitización y observaciones de auditoría.');
body += bullet('Cobertura por enfermedad y recomendaciones para políticas públicas.');
body += imageXml('image21.svg', 'rId25', 16.5, 7.75, 'Figura 17. KPIs sanitarios, cartilla de vacunación y UPPs certificadas. Lámina basada en la captura de referencia compartida.');

body += heading('15.1 Organización del código', 2);
body += code('src/app/pages/SanidadVacunacion/sanidad-vacunacion.component.ts   Lógica, contratos y consultas\nsrc/app/pages/SanidadVacunacion/sanidad-vacunacion.html             Vista, tablas y paneles\nsrc/app/pages/SanidadVacunacion/sanidad-vacunacion.scss              Estilos del módulo\nsrc/app/app.routes.ts                                                  Ruta /admin/sanidad-vacunacion\nsrc/environments/environment.prod.ts                                   URLs del servicio sanidad\nsrc/app/services/generic.service.ts                                   HTTP y Authorization Bearer\nsrc/app/services/pdf-export.service.ts                                Exportación DOM a PDF');
body += p('El componente usa ChangeDetectionStrategy.OnPush. No utiliza Chart.js en esta vista: presenta tarjetas, tablas, barras CSS, estados y recomendaciones a partir de respuestas HTTP.');

body += heading('15.2 Flujo de carga y filtros', 2);
body += p('ngOnInit carga catálogos y datos. loadCatalogs obtiene estados, certificaciones y razas. loadData construye filterParams y ejecuta siete consultas con forkJoin. Cada consulta tolera error individual con catchError(() => of(null)); si ninguna respuesta llega, se muestra el banner de error.');
body += table(['Control', 'Parámetro', 'Efecto'], [
  ['Búsqueda', 'q', 'Busca por UPP, rancho o folio.'],
  ['Estado', 'estado', 'Filtra todos los bloques sanitarios.'],
  ['Certificación', 'certificacion', 'Filtra UPPs certificadas y resultados relacionados.'],
  ['Raza', 'raza', 'Restringe los registros sanitarios por raza.'],
  ['Exportar CSV', 'filtros actuales', 'Descarga el padrón sanitario filtrado.'],
  ['Exportar PDF', '#pdfContent', 'Captura la vista completa con PdfExportService.']
]);

body += heading('15.3 Funcionalidades y visualización', 2);
body += table(['Panel', 'Contrato', 'Presentación'], [
  ['KPIs', 'kpis[]', 'Tarjetas con valor, unidad, progreso y detalle.'],
  ['Cartilla', 'total, pendientes, items[]', 'Enfermedad, fecha, NOM_MX y folio de receta.'],
  ['Certificaciones', 'total, items[]', 'UPP, rancho, certificación, fecha y estatus.'],
  ['Enfermedades', 'total, items[], alerta', 'UPP, lote, arete SINIIGA, animal, fecha y estatus.'],
  ['Protocolos', 'control_acceso_limpieza, sanitizacion, observaciones', 'Cumplimiento, productos y auditoría.'],
  ['Cobertura', 'items[], promedio_nacional', 'Barras de cobertura por enfermedad.'],
  ['Recomendaciones', 'items[]', 'Tarjetas de prioridad alta, oportunidad y alerta.']
]);
body += imageXml('image22.svg', 'rId26', 16.5, 9.45, 'Figura 18. Enfermedades por UPP, protocolos de sanidad y cobertura de vacunación.');
body += imageXml('image23.svg', 'rId27', 16.5, 4.4, 'Figura 19. Recomendaciones derivadas de los indicadores sanitarios.');

body += heading('15.4 Endpoints del módulo', 2);
body += table(['Endpoint', 'Método', 'Uso'], [
  ['/api/sanidad/catalogos', 'GET', 'Estados, certificaciones y razas.'],
  ['/api/sanidad/resumen', 'GET', 'KPIs sanitarios.'],
  ['/api/sanidad/cartilla-vacunacion', 'GET', 'Cartilla y pendientes de vacunación.'],
  ['/api/sanidad/upp-certificadas', 'GET', 'UPPs y certificaciones vigentes.'],
  ['/api/sanidad/enfermedades', 'GET', 'Casos por UPP, lote y animal.'],
  ['/api/sanidad/protocolos', 'GET', 'Protocolos, limpieza, sanitización y auditoría.'],
  ['/api/sanidad/cobertura-enfermedades', 'GET', 'Cobertura de vacunación por enfermedad.'],
  ['/api/sanidad/recomendaciones', 'GET', 'Recomendaciones para políticas públicas.'],
  ['/api/sanidad/export', 'GET Blob', 'Descarga sanidad-YYYYMMDD.csv.']
]);

body += heading('15.5 Estados sanitarios y recomendaciones', 2);
body += p('statusClass agrupa estados aplicada, vigente y controlado como verdes; en_proceso como dorado; el resto como rojo. formatDate transforma fechas ISO con guiones al formato dd/mm/yyyy y usa Pendiente cuando no existe fecha.');
body += p('Las recomendaciones se clasifican por tipo alta, oportunidad o alerta. recommendationIcon asigna un símbolo visual y la plantilla muestra título y texto entregados por el backend. El texto de recomendación debe considerarse salida de negocio, no lógica calculada localmente.');

body += heading('15.6 Exportaciones y PDF', 2);
body += p('Exportar CSV llama /api/sanidad/export con estado, certificacion, raza y q. El archivo se descarga como sanidad-{fecha actual YYYYMMDD}.csv. Exportar PDF envía #pdfContent a PdfExportService con nombre sanidad-vacunacion.pdf.');
body += note('Diferencia frente a otros módulos: las peticiones de SanidadVacunacion no pasan explícitamente isSecure=true en GenericService. La autorización efectiva depende de la configuración de HttpClient/interceptores o del backend; revisar antes de producción.', 'Warning');

body += heading('15.7 Base de datos lógica', 2);
body += p('El frontend no contiene SQL, migraciones ni entidades físicas. Los contratos observables permiten identificar estas entidades lógicas: cartilla de vacunación, certificación UPP, enfermedad/animal, protocolo sanitario, cobertura y recomendación.');
body += table(['Entidad lógica', 'Campos observables', 'Relación funcional'], [
  ['Vacunación', 'enfermedad, ultima_aplicacion, NOM_MX, folio_receta', 'Registra aplicaciones y pendientes por enfermedad.'],
  ['Certificación UPP', 'upp, rancho, certificacion, fecha, estatus', 'Relaciona unidad productiva con certificación sanitaria.'],
  ['Caso de enfermedad', 'upp, lote, arete_siniiga, animal, fecha_deteccion, estatus', 'Relaciona enfermedad con lote y animal trazable.'],
  ['Protocolo', 'acceso, visitantes, limpieza, sanitizacion, auditoria', 'Resume medidas de bioseguridad y revisión.'],
  ['Cobertura', 'enfermedad, porcentaje, nivel', 'Agrega cobertura nacional por enfermedad.'],
  ['Recomendación', 'clave, tipo, titulo, texto', 'Deriva acciones para políticas públicas.']
]);
body += note('Validar llaves, trazabilidad SINIIGA, normas NOM_MX, origen de casos, permisos y retención de expedientes con el backend. Esta sección describe contratos frontend, no el esquema físico.', 'Warning');

body += heading('15.8 Configuración y observaciones', 2);
body += code('npm install\nnpm start\n# abrir http://localhost:4200/admin/sanidad-vacunacion');
body += bullet('La base del servicio está en sanidadPath: https://giz-qa.encodingmx.com/api/sanidad.');
body += bullet('El módulo no implementa sincronización ni limpieza de caché en su componente actual.');
body += bullet('Las listas vacías muestran mensajes específicos para los filtros seleccionados.');
body += bullet('Los registros de enfermedad pueden activar una alerta operativa mediante diseases.alerta.');

const extracted = path.join(temp, 'package');
execFileSync('unzip', ['-q', input, '-d', extracted]);
const docPath = path.join(extracted, 'word', 'document.xml');
let doc = fs.readFileSync(docPath, 'utf8');
if (doc.includes('15. Módulo Sanidad, Vacunación y Certificaciones')) {
  fs.rmSync(temp, { recursive: true, force: true });
  console.log('Sanidad ya existe; no se modificó el documento.');
  process.exit(0);
}
doc = doc.replace('<w:sectPr', body + '<w:sectPr');
fs.writeFileSync(docPath, doc);

const relPath = path.join(extracted, 'word', '_rels', 'document.xml.rels');
let rels = fs.readFileSync(relPath, 'utf8');
rels = rels.replace('</Relationships>', '<Relationship Id="rId25" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image21.svg"/><Relationship Id="rId26" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image22.svg"/><Relationship Id="rId27" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image23.svg"/></Relationships>');
fs.writeFileSync(relPath, rels);
for (const [source, target] of [['01-sanidad-kpis-tablas.svg', 'image21.svg'], ['02-sanidad-enfermedades-protocolos.svg', 'image22.svg'], ['03-sanidad-recomendaciones.svg', 'image23.svg']]) fs.copyFileSync(path.join(assets, source), path.join(extracted, 'word', 'media', target));

execFileSync('zip', ['-qr', output, '.'], { cwd: extracted });
fs.copyFileSync(output, input);
fs.rmSync(temp, { recursive: true, force: true });
console.log(`Appended Sanidad to ${input}`);
