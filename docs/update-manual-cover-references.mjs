import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const docs = path.join(root, 'docs');
const input = path.join(docs, 'manual-tecnico-pecuario.docx');
const background = path.join(root, 'public/assets/imgs/login/template.png');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'manual-cover-'));
const output = path.join(temp, 'manual-tecnico-final.docx');

const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const runs = (value) => `<w:r><w:t xml:space="preserve">${esc(value)}</w:t></w:r>`;
const p = (value = '', style = 'Normal') => `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr>${runs(value)}</w:p>`;
const heading = (value, level = 1) => p(value, `Heading${level}`);
const bullet = (value) => p(value, 'ListBullet');
const code = (value) => p(value, 'Code');
const note = (value, style = 'Note') => p(value, style);
const pageBreak = () => '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';

const imageRelationship = (file, relId, widthCm, heightCm, name = file) => {
  const cx = Math.round(widthCm * 360000);
  const cy = Math.round(heightCm * 360000);
  const id = relId.replace(/\D/g, '');
  return `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${id}" name="${name}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${id}" name="${name}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="${relId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
};

function buildCoverSvg() {
  const image = fs.readFileSync(background).toString('base64');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1584" height="1123" viewBox="0 0 1584 1123">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0d504b" stop-opacity="0.82"/><stop offset="0.48" stop-color="#0d504b" stop-opacity="0.16"/><stop offset="1" stop-color="#0d504b" stop-opacity="0.05"/></linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#123d39" flood-opacity="0.28"/></filter>
  </defs>
  <image href="data:image/png;base64,${image}" x="0" y="0" width="1584" height="1123" preserveAspectRatio="xMidYMid slice"/>
  <rect width="1584" height="1123" fill="url(#shade)"/>
  <rect x="78" y="246" width="700" height="630" rx="26" fill="#ffffff" fill-opacity="0.90" filter="url(#shadow)"/>
  <rect x="78" y="246" width="16" height="630" rx="8" fill="#ad8127"/>
  <text x="136" y="360" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#22685d" font-weight="700">BioParcela</text>
  <text x="136" y="482" font-family="Arial, Helvetica, sans-serif" font-size="54" fill="#182237" font-weight="800">Manual Tecnico</text>
  <text x="136" y="550" font-family="Arial, Helvetica, sans-serif" font-size="54" fill="#182237" font-weight="800">de Funcionalidades</text>
  <line x1="136" y1="602" x2="650" y2="602" stroke="#ad8127" stroke-width="5"/>
  <text x="136" y="690" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#22685d" font-weight="700">Juan López Sarrelangue</text>
  <text x="136" y="752" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#536176">28 de octubre de 2026</text>
  <text x="136" y="814" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#536176" font-weight="600">Módulos administrativos BioParcela</text>
</svg>`;
}

const appendix = [
  pageBreak(),
  heading('Referencias de scaffolding y código'),
  p('Apéndice de ubicación del código fuente que implementa los cinco submódulos documentados. Los bloques siguientes usan formato de código para facilitar navegación y mantenimiento. El apéndice se agrega al final; no reemplaza ni reordena contenido anterior.'),
  heading('Scaffolding común', 2),
  code('src/\n├── main.ts                                  Bootstrap Angular\n├── environments/\n│   ├── environment.ts                         Configuración de desarrollo\n│   └── environment.prod.ts                    URLs API y paths por módulo\n└── app/\n    ├── app.routes.ts                          Rutas de navegación\n    ├── app.module.ts                          Módulos Angular, Material y Charts\n    ├── app.config.ts                          Providers del router e hidratación\n    ├── components/\n    │   ├── organisms/layout/                  Layout, header y router-outlet\n    │   └── molecules/sidebar/                 Menú lateral y rutas visuales\n    ├── guards/auth.guard.ts                   Validación de sesión\n    ├── services/generic.service.ts            Cliente HTTP y Bearer\n    ├── services/pdf-export.service.ts         HTML → canvas → PDF\n    ├── services/local-storage-encrypt.service.ts  Sesión y almacenamiento\n    └── pages/                                 Pantallas por submódulo'),
  heading('Rutas documentadas', 2),
  code("{ path: 'admin/resumen-pecuario', component: Pecuario }\n{ path: 'admin/resumen-rancho', component: Rancho }\n{ path: 'admin/uso-suelo-vegetacion', component: UsoSuelo }\n{ path: 'admin/infraestructura-rancho', component: Infraestructura }\n{ path: 'admin/sanidad-vacunacion', component: SanidadVacunacion }"),
  heading('Pecuario', 2),
  code('src/app/pages/Pecuario/pecuario.component.ts\nsrc/app/pages/Pecuario/pecuario.html\nsrc/app/pages/Pecuario/pecuario.scss\n\nAPI base:\npecuarioPath = https://giz-qa.encodingmx.com/api/pecuario\n\nPaths principales:\npecuarioResumen\npecuarioCabezasVientres\npecuarioRazas\npecuarioUpp\npecuarioTipoPersona\npecuarioTrazabilidad\npecuarioSanidad\npecuarioPropiedad\npecuarioOrganismos\npecuarioComparacionPgn\npecuarioExport\npecuarioCacheFlush'),
  p('Responsabilidad: coordina filtros nacional/estado/municipio, diez respuestas en forkJoin, KPIs, Chart.js, exportación CSV, actualización de caché y PDF. Contratos principales: ResumenResponse, CabezasVientresResponse, RazasResponse, UPPResponse, TrazabilidadResponse, SanidadResponse, PropiedadResponse y ComparacionResponse.'),
  heading('Resumen del Rancho', 2),
  code('src/app/pages/Rancho/rancho.component.ts\nsrc/app/pages/Rancho/rancho.html\nsrc/app/pages/Rancho/rancho.scss\n\nAPI base:\nranchoPath = https://giz-qa.encodingmx.com/api/rancho\n\nPaths principales:\nranchoCatalogos\nranchoSuperficie\nranchoTamanoProductor\nranchoApoyos\nranchoTipoProduccion\nranchoCargaAnimal\nranchoRegistroPropiedad\nranchoExport\nranchoCacheFlush'),
  p('Responsabilidad: filtra por q, estado, municipio, localidad y tipo de producción; carga seis bloques en forkJoin; presenta superficie, productor, apoyos SIAP, producción, carga animal y propiedad. Contratos principales: SurfaceResponse, ProducerSizeResponse, SupportsResponse, ProductionResponse, AnimalLoadResponse y PropertyResponse.'),
  heading('Uso de Suelo y Vegetación', 2),
  code('src/app/pages/UsoSuelo/uso-suelo.component.ts\nsrc/app/pages/UsoSuelo/uso-suelo.html\nsrc/app/pages/UsoSuelo/uso-suelo.scss\n\nAPI base:\nusoSueloPath = https://giz-qa.encodingmx.com/api/uso-suelo\n\nPaths principales:\nusoSueloCatalogos\nusoSueloCobertura\nusoSueloCoberturaEvolucion\nusoSueloClima\nusoSueloAgua\nusoSueloPastoreo\nusoSueloExport\nusoSueloClimaSincronizar\nusoSueloCacheFlush'),
  p('Responsabilidad: gestiona temporada/año y clima por variable/periodo; carga cinco respuestas en forkJoin; presenta cobertura vegetal, CONAGUA, agua, pastoreo, evolución y alertas. Contratos principales: CoverageResponse, EvolutionResponse, ClimateResponse, WaterResponse y GrazingResponse.'),
  heading('Infraestructura del Rancho', 2),
  code('src/app/pages/Infraestructura/infraestructura.component.ts\nsrc/app/pages/Infraestructura/infraestructura.html\nsrc/app/pages/Infraestructura/infraestructura.scss\n\nAPI base:\ninfraestructuraPath = https://giz-qa.encodingmx.com/api/infraestructura\n\nPaths principales:\ninfraestructuraCatalogos\ninfraestructuraResumen\ninfraestructuraNecesidad\ninfraestructuraCercado\ninfraestructuraDesgloseUpp\ninfraestructuraCercadoUpp\ninfraestructuraExport\ninfraestructuraCacheFlush'),
  p('Responsabilidad: filtra por q, estado, municipio, tipo y condición; carga cinco respuestas en forkJoin; presenta inventario, cercado, desglose paginado por UPP y brecha de necesidad. Contratos principales: SummaryResponse, NeedResponse, FenceResponse, UppBreakdownResponse y FenceUppResponse.'),
  heading('Sanidad, Vacunación y Certificaciones', 2),
  code('src/app/pages/SanidadVacunacion/sanidad-vacunacion.component.ts\nsrc/app/pages/SanidadVacunacion/sanidad-vacunacion.html\nsrc/app/pages/SanidadVacunacion/sanidad-vacunacion.scss\n\nAPI base:\nsanidadPath = https://giz-qa.encodingmx.com/api/sanidad\n\nPaths principales:\nsanidadCatalogos\nsanidadResumen\nsanidadCartillaVacunacion\nsanidadUppCertificadas\nsanidadEnfermedades\nsanidadProtocolos\nsanidadCoberturaEnfermedades\nsanidadRecomendaciones\nsanidadExport'),
  p('Responsabilidad: filtra por q, estado, certificación y raza; carga siete respuestas en forkJoin; presenta KPIs, cartilla, certificaciones, enfermedades, protocolos, cobertura y recomendaciones. Contratos principales: KpiResponse, VaccinationResponse, CertificationResponse, DiseaseResponse, ProtocolResponse, CoverageResponse y RecommendationResponse.'),
  heading('Servicios transversales de ejecución', 2),
  code('GenericService.sendGetParams(url, params, isSecure)\nGenericService.sendGetRequest(url, options, isSecure)\nGenericService.sendPostRequest(url, body, isSecure)\n\nPdfExportService.exportElement(element, fileName)\n  ├── espera fuentes y renderizado\n  ├── oculta botones, enlaces y filtros\n  ├── captura con html2canvas\n  ├── divide por límites naturales\n  └── genera PDF A4 horizontal con jsPDF\n\npackage.json\nangular.json\ntsconfig.app.json'),
  note('La documentación describe el frontend disponible en este repositorio. El esquema físico de base de datos, API backend, permisos y contratos OpenAPI deben validarse en su repositorio correspondiente.', 'Warning')
].join('');

const extracted = path.join(temp, 'package');
execFileSync('unzip', ['-q', input, '-d', extracted]);
const docPath = path.join(extracted, 'word', 'document.xml');
let doc = fs.readFileSync(docPath, 'utf8');
if (doc.includes('Referencias de scaffolding y código')) {
  fs.rmSync(temp, { recursive: true, force: true });
  console.log('Portada y referencias ya existen; no se modificó el documento.');
  process.exit(0);
}

const coverSvg = buildCoverSvg();
const coverPath = path.join(temp, 'cover.svg');
fs.writeFileSync(coverPath, coverSvg);
const cover = imageRelationship('image33.svg', 'rId39', 29.7, 21.0, 'Portada BioParcela');
const coverSection = '<w:p><w:pPr><w:sectPr><w:type w:val="nextPage"/><w:pgSz w:w="15840" w:h="12240"/><w:pgMar w:top="0" w:right="0" w:bottom="0" w:left="0" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr></w:pPr></w:p>';
doc = doc.replace('<w:body>', `<w:body>${cover}${coverSection}`);
doc = doc.replace('<w:sectPr', appendix + '<w:sectPr');
fs.writeFileSync(docPath, doc);

const relPath = path.join(extracted, 'word', '_rels', 'document.xml.rels');
let rels = fs.readFileSync(relPath, 'utf8');
rels = rels.replace('</Relationships>', '<Relationship Id="rId39" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image33.svg"/></Relationships>');
fs.writeFileSync(relPath, rels);
fs.copyFileSync(coverPath, path.join(extracted, 'word', 'media', 'image33.svg'));

execFileSync('zip', ['-qr', output, '.'], { cwd: extracted });
fs.copyFileSync(output, input);
fs.rmSync(temp, { recursive: true, force: true });
console.log(`Added cover and references to ${input}`);
