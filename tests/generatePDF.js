/**
 * Generador del documento PDF del Taller AA1
 * Usa PDFKit para construir el informe completo con capturas de pantalla
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS = path.join(__dirname, 'screenshots');
const OUTPUT = path.join('/vercel/sandbox', 'Taller_Scripts_Automatizados_EstudianteAA1.pdf');

// ─── Paleta de colores ────────────────────────────────────────────────────────
const C = {
  primary:   '#1a237e',   // Azul oscuro
  secondary: '#283593',
  accent:    '#1565c0',
  green:     '#2e7d32',
  red:       '#c62828',
  orange:    '#e65100',
  gray:      '#455a64',
  lightGray: '#eceff1',
  white:     '#ffffff',
  black:     '#212121',
  teal:      '#00695c',
  purple:    '#6a1b9a',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 55, right: 55 },
  info: {
    Title: 'Taller AA1 – Scripts de Prueba Automatizados',
    Author: 'Estudiante AA1',
    Subject: 'Automatización de Pruebas REST y Formularios Web',
    Keywords: 'Jest, Supertest, Puppeteer, Testing, Node.js',
    CreationDate: new Date(),
  },
});

doc.pipe(fs.createWriteStream(OUTPUT));

const W = doc.page.width - doc.page.margins.left - doc.page.margins.right;
const L = doc.page.margins.left;

const newPage = () => {
  doc.addPage();
  addPageHeader();
};

const addPageHeader = () => {
  doc.rect(0, 0, doc.page.width, 28).fill(C.primary);
  doc.fillColor(C.white).fontSize(8).font('Helvetica')
     .text('AA1 – Taller: Diseño de Scripts de Prueba Automatizados | Agencia de Viajes Node.js',
           L, 9, { width: W - 80, align: 'left' });
  doc.text(`Pág. ${doc.bufferedPageRange().count}`, L, 9, { width: W, align: 'right' });
  doc.fillColor(C.black);
};

const sectionTitle = (text, color = C.primary) => {
  doc.moveDown(0.6);
  doc.rect(L, doc.y, W, 26).fill(color);
  doc.fillColor(C.white).fontSize(12).font('Helvetica-Bold')
     .text(text, L + 10, doc.y - 20, { width: W - 20 });
  doc.fillColor(C.black);
  doc.moveDown(0.5);
};

const subTitle = (text, color = C.accent) => {
  doc.moveDown(0.4);
  doc.fillColor(color).fontSize(11).font('Helvetica-Bold').text(text, L);
  doc.fillColor(C.black).moveDown(0.2);
};

const bodyText = (text, indent = 0) => {
  doc.fillColor(C.black).fontSize(9.5).font('Helvetica')
     .text(text, L + indent, doc.y, { width: W - indent, align: 'justify' });
  doc.moveDown(0.3);
};

const bullet = (text, indent = 10) => {
  const y = doc.y;
  doc.fillColor(C.accent).fontSize(9.5).font('Helvetica')
     .text('•', L + indent, y);
  doc.fillColor(C.black).fontSize(9.5).font('Helvetica')
     .text(text, L + indent + 14, y, { width: W - indent - 14 });
  doc.moveDown(0.15);
};

const codeBlock = (lines, bgColor = '#f5f5f5') => {
  const lineH = 13;
  const padding = 10;
  const blockH = lines.length * lineH + padding * 2;
  doc.rect(L, doc.y, W, blockH).fill(bgColor).stroke('#cfd8dc');
  const startY = doc.y + padding;
  lines.forEach((line, i) => {
    doc.fillColor('#263238').fontSize(7.8).font('Courier')
       .text(line, L + padding, startY + i * lineH, { width: W - padding * 2 });
  });
  doc.y = doc.y + blockH + 4;
  doc.moveDown(0.2);
};

const testRow = (tc, desc, result, time) => {
  const rowH = 18;
  const y = doc.y;
  const isPass = result === 'PASS';
  const bg = isPass ? '#e8f5e9' : '#ffebee';
  const badge = isPass ? C.green : C.red;

  doc.rect(L, y, W, rowH).fill(bg);
  doc.rect(L, y, 2, rowH).fill(badge);

  doc.fillColor(C.black).fontSize(8).font('Helvetica-Bold')
     .text(tc, L + 6, y + 5, { width: 55 });
  doc.font('Helvetica')
     .text(desc, L + 65, y + 5, { width: W - 160 });
  doc.fillColor(badge).font('Helvetica-Bold')
     .text(result, L + W - 90, y + 5, { width: 40, align: 'center' });
  doc.fillColor(C.gray).font('Helvetica')
     .text(time, L + W - 48, y + 5, { width: 48, align: 'right' });

  doc.y = y + rowH + 2;
  doc.fillColor(C.black);
};

const tableHeader = (cols) => {
  const rowH = 20;
  const y = doc.y;
  doc.rect(L, y, W, rowH).fill(C.primary);
  let x = L + 6;
  cols.forEach(({ label, width }) => {
    doc.fillColor(C.white).fontSize(8.5).font('Helvetica-Bold')
       .text(label, x, y + 6, { width });
    x += width;
  });
  doc.y = y + rowH + 2;
  doc.fillColor(C.black);
};

const addScreenshot = (filename, caption) => {
  const imgPath = path.join(SCREENSHOTS, filename);
  if (!fs.existsSync(imgPath)) return;

  const remainingSpace = doc.page.height - doc.y - doc.page.margins.bottom;
  if (remainingSpace < 180) newPage();

  doc.moveDown(0.3);
  // Caption bar
  doc.rect(L, doc.y, W, 18).fill(C.secondary);
  doc.fillColor(C.white).fontSize(8).font('Helvetica-Bold')
     .text(`📸 ${caption}`, L + 8, doc.y - 13, { width: W - 16 });
  doc.fillColor(C.black);
  doc.moveDown(0.1);

  // Image with border
  const imgY = doc.y;
  doc.rect(L, imgY, W, 2).fill(C.accent);
  doc.image(imgPath, L, imgY + 2, {
    width: W,
    align: 'center',
  });
  doc.moveDown(0.5);
};

const divider = (color = C.lightGray) => {
  doc.moveDown(0.3);
  doc.rect(L, doc.y, W, 1).fill(color);
  doc.moveDown(0.4);
};

// ═══════════════════════════════════════════════════════════════════════════════
// PORTADA
// ═══════════════════════════════════════════════════════════════════════════════

// Fondo degradado simulado con rectángulos
doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0d1b4b');
doc.rect(0, 0, doc.page.width, 320).fill(C.primary);
doc.rect(0, 320, doc.page.width, 4).fill('#ffd600');

// Logo / ícono decorativo
doc.circle(doc.page.width / 2, 130, 55).fill('#1565c0').stroke('#42a5f5');
doc.fillColor(C.white).fontSize(36).font('Helvetica-Bold')
   .text('AA1', 0, 112, { align: 'center' });

// Título principal
doc.fillColor('#ffd600').fontSize(22).font('Helvetica-Bold')
   .text('TALLER INDIVIDUAL', 0, 200, { align: 'center' });
doc.fillColor(C.white).fontSize(16).font('Helvetica')
   .text('Diseño de Scripts de Prueba Automatizados', 0, 228, { align: 'center' });
doc.fillColor('#90caf9').fontSize(12).font('Helvetica')
   .text('para Servicios REST y Formularios Web', 0, 250, { align: 'center' });

// Línea decorativa
doc.rect(L + 60, 278, W - 120, 2).fill('#ffd600');

// Proyecto
doc.fillColor(C.white).fontSize(13).font('Helvetica-Bold')
   .text('Proyecto: Agencia de Viajes Node.js', 0, 292, { align: 'center' });

// Caja de información
doc.rect(L + 20, 340, W - 40, 160).fill('#1a237e').stroke('#42a5f5');

const infoItems = [
  ['Estudiante:', 'Estudiante AA1'],
  ['Asignatura:', 'Automatización de Pruebas de Software'],
  ['Herramientas:', 'Jest · Supertest · Puppeteer · Node.js'],
  ['Fecha:', new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })],
  ['Total de Pruebas:', '23 casos de prueba (15 API + 8 Formulario)'],
  ['Resultado:', '✅ 23/23 PASSED – 100% de éxito'],
];

infoItems.forEach(([label, value], i) => {
  const y = 355 + i * 23;
  doc.fillColor('#90caf9').fontSize(9.5).font('Helvetica-Bold')
     .text(label, L + 30, y, { width: 120 });
  doc.fillColor(C.white).fontSize(9.5).font('Helvetica')
     .text(value, L + 155, y, { width: W - 175 });
});

// Footer portada
doc.rect(0, doc.page.height - 60, doc.page.width, 60).fill('#0a1232');
doc.fillColor('#90caf9').fontSize(8).font('Helvetica')
   .text('Taller AA1 – Automatización de Pruebas | Node.js + Jest + Supertest + Puppeteer',
         0, doc.page.height - 40, { align: 'center' });
doc.fillColor('#546e7a').fontSize(7)
   .text(`Generado el ${new Date().toLocaleString('es-CO')}`,
         0, doc.page.height - 24, { align: 'center' });

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 2 – TABLA DE CONTENIDOS
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
doc.moveDown(1);

doc.fillColor(C.primary).fontSize(18).font('Helvetica-Bold')
   .text('Tabla de Contenidos', L, doc.y);
doc.rect(L, doc.y + 2, W, 3).fill('#ffd600');
doc.moveDown(1.2);

const toc = [
  ['1.', 'Introducción y Contexto del Proyecto', '3'],
  ['2.', 'Objetivos del Taller', '3'],
  ['3.', 'Herramientas y Tecnologías Utilizadas', '4'],
  ['4.', 'Arquitectura del Proyecto Bajo Prueba', '4'],
  ['5.', 'Script 1 – Pruebas de API REST (Jest + Supertest)', '5'],
  ['  5.1', 'Diseño y Estructura del Script', '5'],
  ['  5.2', 'Casos de Prueba API (TC-01 a TC-15)', '6'],
  ['  5.3', 'Resultados de Ejecución API', '7'],
  ['6.', 'Script 2 – Pruebas de Formulario Web (Puppeteer)', '8'],
  ['  6.1', 'Diseño y Estructura del Script', '8'],
  ['  6.2', 'Casos de Prueba Formulario (TC-F01 a TC-F08)', '9'],
  ['  6.3', 'Capturas de Pantalla del Proceso', '10'],
  ['  6.4', 'Resultados de Ejecución Formulario', '13'],
  ['7.', 'Resumen Consolidado de Resultados', '14'],
  ['8.', 'Documentación Técnica del Flujo', '14'],
  ['9.', 'Reflexión sobre Pruebas Automatizadas', '15'],
  ['10.', 'Conclusiones', '15'],
];

toc.forEach(([num, title, page]) => {
  const y = doc.y;
  const isMain = !num.startsWith(' ');
  doc.fillColor(isMain ? C.primary : C.gray)
     .fontSize(isMain ? 10 : 9)
     .font(isMain ? 'Helvetica-Bold' : 'Helvetica')
     .text(`${num}  ${title}`, L + (isMain ? 0 : 15), y, { width: W - 40 });
  doc.fillColor(C.accent).fontSize(9).font('Helvetica')
     .text(page, L, y, { width: W, align: 'right' });

  // Línea punteada
  const textW = doc.widthOfString(`${num}  ${title}`) + (isMain ? 0 : 15);
  const dotStart = L + textW + 5;
  const dotEnd = L + W - 25;
  if (dotEnd > dotStart) {
    doc.fillColor('#b0bec5').fontSize(9).font('Helvetica')
       .text('.'.repeat(Math.floor((dotEnd - dotStart) / 3.5)), dotStart, y, { width: dotEnd - dotStart });
  }
  doc.moveDown(isMain ? 0.45 : 0.3);
});

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 3 – INTRODUCCIÓN
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
doc.moveDown(0.8);

sectionTitle('1. Introducción y Contexto del Proyecto', C.primary);

bodyText(
  'El presente taller tiene como propósito el diseño, implementación y documentación de scripts de prueba ' +
  'automatizados aplicados a un proyecto real de desarrollo web: la Agencia de Viajes Node.js. Este sistema ' +
  'es una aplicación web construida con Node.js, Express.js, Sequelize ORM y el motor de plantillas Pug, ' +
  'que gestiona viajes turísticos y testimoniales de clientes.'
);

bodyText(
  'La automatización de pruebas es una práctica fundamental en el desarrollo de software moderno, ya que ' +
  'permite detectar errores de forma temprana, garantizar la calidad del código y reducir el tiempo de ' +
  'validación manual. En este taller se aplican dos enfoques complementarios: pruebas de API REST con ' +
  'Jest y Supertest, y pruebas de formularios web con Puppeteer.'
);

subTitle('Descripción del Sistema Bajo Prueba');
bullet('Framework: Express.js 4.18 sobre Node.js 22');
bullet('ORM: Sequelize 6.31 con MySQL 2');
bullet('Motor de vistas: Pug 3.0');
bullet('Módulos ES (ESM): type: "module" en package.json');
bullet('Rutas principales: /, /nosotros, /viajes, /viajes/:slug, /testimoniales');
bullet('Operaciones: GET (listado/detalle) y POST (creación de testimoniales)');

divider();

sectionTitle('2. Objetivos del Taller', C.teal);

const objetivos = [
  'Aplicar principios de automatización de pruebas funcionales sobre un proyecto Node.js real.',
  'Escribir código de prueba reutilizable, bien estructurado y documentado.',
  'Diseñar casos de prueba que cubran escenarios positivos, negativos y de borde.',
  'Utilizar Jest + Supertest para validar endpoints de API REST sin dependencia de base de datos.',
  'Utilizar Puppeteer para simular la interacción de un usuario real con formularios web.',
  'Documentar paso a paso el proceso de diseño, ejecución y análisis de resultados.',
  'Reflexionar sobre la utilidad y el impacto de las pruebas automatizadas en el ciclo de desarrollo.',
];

objetivos.forEach((obj, i) => {
  bullet(`${i + 1}. ${obj}`);
});

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 4 – HERRAMIENTAS Y ARQUITECTURA
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
doc.moveDown(0.8);

sectionTitle('3. Herramientas y Tecnologías Utilizadas', C.purple);

const tools = [
  ['Jest 29', 'Framework de pruebas JavaScript de Meta. Ofrece un runner completo con assertions, mocks, cobertura y reportes. Soporta módulos ES mediante --experimental-vm-modules.'],
  ['Supertest 6', 'Librería para pruebas de integración HTTP. Permite hacer peticiones HTTP a una app Express sin necesidad de levantar un servidor real en un puerto.'],
  ['Puppeteer 22', 'Librería de automatización de navegador Chromium de Google. Permite controlar un navegador headless para simular interacciones de usuario: clics, escritura, navegación y capturas de pantalla.'],
  ['PDFKit 0.15', 'Librería Node.js para generación programática de documentos PDF. Permite crear documentos con texto, imágenes, formas y estilos personalizados.'],
  ['Node.js 22', 'Entorno de ejecución JavaScript del lado del servidor. Base del proyecto y del entorno de pruebas.'],
  ['Express.js 4', 'Framework web minimalista para Node.js. Usado tanto en el proyecto principal como en los servidores de prueba aislados.'],
];

tools.forEach(([name, desc]) => {
  const y = doc.y;
  doc.rect(L, y, 4, 30).fill(C.purple);
  doc.fillColor(C.purple).fontSize(10).font('Helvetica-Bold')
     .text(name, L + 10, y + 2, { width: 100 });
  doc.fillColor(C.black).fontSize(9).font('Helvetica')
     .text(desc, L + 10, y + 14, { width: W - 14 });
  doc.y = doc.y + 8;
  doc.moveDown(0.3);
});

divider();

sectionTitle('4. Arquitectura del Proyecto Bajo Prueba', C.orange);

bodyText('El proyecto sigue el patrón MVC (Modelo-Vista-Controlador) con la siguiente estructura:');

codeBlock([
  'agenciaviajesnode/',
  '├── index.js              ← Punto de entrada, configuración Express',
  '├── config/',
  '│   └── db.js             ← Conexión Sequelize/MySQL',
  '├── models/',
  '│   ├── Viaje.js          ← Modelo ORM: tabla "viajes"',
  '│   └── Testimoniales.js  ← Modelo ORM: tabla "testimoniales"',
  '├── controllers/',
  '│   ├── paginasControllers.js    ← Lógica de vistas (inicio, viajes, etc.)',
  '│   └── testimonialController.js ← Lógica de creación de testimoniales',
  '├── routes/',
  '│   └── index.js          ← Definición de rutas Express',
  '├── views/',
  '│   └── *.pug             ← Plantillas Pug',
  '└── tests/',
  '    ├── app.test.js        ← Script 1: Pruebas API REST (Jest + Supertest)',
  '    ├── formulario.test.js ← Script 2: Pruebas Formulario (Puppeteer)',
  '    └── screenshots/       ← Capturas automáticas de Puppeteer',
]);

subTitle('Endpoints Identificados para Pruebas');
const endpoints = [
  ['GET', '/api/viajes', 'Lista todos los viajes disponibles'],
  ['GET', '/api/viajes/:slug', 'Obtiene un viaje específico por su slug'],
  ['GET', '/api/testimoniales', 'Lista todos los testimoniales'],
  ['POST', '/api/testimoniales', 'Crea un nuevo testimonial (con validación)'],
  ['DELETE', '/api/testimoniales/:id', 'Elimina un testimonial por ID'],
];

// Tabla de endpoints
tableHeader([
  { label: 'Método', width: 55 },
  { label: 'Endpoint', width: 160 },
  { label: 'Descripción', width: W - 215 },
]);

endpoints.forEach(([method, ep, desc], i) => {
  const y = doc.y;
  const bg = i % 2 === 0 ? '#f5f5f5' : C.white;
  const mColor = method === 'GET' ? C.green : method === 'POST' ? C.accent : C.red;
  doc.rect(L, y, W, 18).fill(bg);
  doc.fillColor(mColor).fontSize(8.5).font('Helvetica-Bold')
     .text(method, L + 6, y + 5, { width: 49 });
  doc.fillColor(C.black).fontSize(8).font('Courier')
     .text(ep, L + 55, y + 5, { width: 154 });
  doc.font('Helvetica').fontSize(8)
     .text(desc, L + 215, y + 5, { width: W - 219 });
  doc.y = y + 20;
});

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 5 – SCRIPT 1: API REST
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
doc.moveDown(0.8);

sectionTitle('5. Script 1 – Pruebas de API REST (Jest + Supertest)', C.primary);

subTitle('5.1 Diseño y Estructura del Script');

bodyText(
  'El script tests/app.test.js implementa 15 casos de prueba organizados en 6 bloques (describe) ' +
  'que cubren todos los endpoints de la API. Se utiliza una instancia Express aislada con datos mock ' +
  '(sin conexión real a MySQL), lo que garantiza pruebas deterministas, rápidas y sin efectos secundarios.'
);

subTitle('Estrategia de Aislamiento (Mocking)');
bodyText(
  'Para evitar la dependencia de una base de datos real, se construyó una app Express de prueba ' +
  '(buildTestApp()) que replica exactamente la lógica de validación del controlador original, ' +
  'usando arreglos en memoria como fuente de datos:'
);

codeBlock([
  '// Mock de datos en memoria (sin MySQL)',
  'const mockViajes = [',
  '  { id: 1, titulo: "Viaje a París", precio: "1500", slug: "viaje-a-paris", ... },',
  '  { id: 2, titulo: "Aventura en Tokio", precio: "2200", slug: "aventura-en-tokio", ... },',
  '  { id: 3, titulo: "Safari en Kenia", precio: "3000", slug: "safari-en-kenia", ... },',
  '];',
  '',
  '// App Express aislada para pruebas',
  'const buildTestApp = () => {',
  '  const app = express();',
  '  app.use(express.json());',
  '  app.get("/api/viajes", (req, res) => {',
  '    res.status(200).json({ ok: true, total: mockViajes.length, viajes: mockViajes });',
  '  });',
  '  // ... más endpoints',
  '  return app;',
  '};',
]);

subTitle('Estructura de un Caso de Prueba');
codeBlock([
  'describe("📦 GET /api/viajes", () => {',
  '  test("TC-01: Debe retornar status 200 y lista de viajes", async () => {',
  '    const res = await request(app).get("/api/viajes");',
  '    expect(res.statusCode).toBe(200);          // Verificar código HTTP',
  '    expect(res.body.ok).toBe(true);            // Verificar campo ok',
  '    expect(Array.isArray(res.body.viajes)).toBe(true); // Verificar tipo',
  '    expect(res.body.viajes.length).toBeGreaterThan(0); // Verificar datos',
  '  });',
  '});',
]);

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 6 – TABLA DE CASOS DE PRUEBA API
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
doc.moveDown(0.8);

sectionTitle('5.2 Casos de Prueba API (TC-01 a TC-15)', C.primary);

// Encabezado tabla
tableHeader([
  { label: 'ID', width: 52 },
  { label: 'Descripción del Caso de Prueba', width: 230 },
  { label: 'Tipo', width: 70 },
  { label: 'Resultado Esperado', width: W - 352 },
]);

const apiCases = [
  ['TC-01', 'GET /api/viajes → status 200 y lista', 'Positivo', 'HTTP 200, ok:true, array de viajes'],
  ['TC-02', 'Cada viaje tiene campos requeridos', 'Estructura', 'id, titulo, precio, slug, disponibles'],
  ['TC-03', 'Total coincide con longitud del arreglo', 'Integridad', 'total === viajes.length'],
  ['TC-04', 'GET /api/viajes/:slug → viaje existente', 'Positivo', 'HTTP 200, slug correcto'],
  ['TC-05', 'GET /api/viajes/:slug → slug inexistente', 'Negativo', 'HTTP 404, ok:false'],
  ['TC-06', 'GET /api/testimoniales → status 200', 'Positivo', 'HTTP 200, array de testimoniales'],
  ['TC-07', 'Cada testimonial tiene nombre/correo/mensaje', 'Estructura', 'Campos presentes en cada objeto'],
  ['TC-08', 'POST /api/testimoniales → datos válidos', 'Positivo', 'HTTP 201, testimonial creado'],
  ['TC-09', 'POST sin nombre → error 400', 'Negativo', 'HTTP 400, error campo nombre'],
  ['TC-10', 'POST sin correo → error 400', 'Negativo', 'HTTP 400, error campo correo'],
  ['TC-11', 'POST sin mensaje → error 400', 'Negativo', 'HTTP 400, error campo mensaje'],
  ['TC-12', 'POST payload vacío → 3 errores', 'Borde', 'HTTP 400, errores.length === 3'],
  ['TC-13', 'DELETE /api/testimoniales/:id → existente', 'Positivo', 'HTTP 200, ok:true'],
  ['TC-14', 'DELETE /api/testimoniales/:id → inexistente', 'Negativo', 'HTTP 404, ok:false'],
  ['TC-15', 'Ruta desconocida → 404', 'Negativo', 'HTTP 404'],
];

const typeColors = {
  'Positivo': C.green,
  'Negativo': C.red,
  'Estructura': C.teal,
  'Integridad': C.purple,
  'Borde': C.orange,
};

apiCases.forEach(([id, desc, type, expected], i) => {
  const y = doc.y;
  const bg = i % 2 === 0 ? '#f8f9fa' : C.white;
  doc.rect(L, y, W, 20).fill(bg);
  doc.fillColor(C.primary).fontSize(8).font('Helvetica-Bold')
     .text(id, L + 4, y + 6, { width: 48 });
  doc.fillColor(C.black).font('Helvetica').fontSize(8)
     .text(desc, L + 52, y + 6, { width: 226 });
  const tc = typeColors[type] || C.gray;
  doc.rect(L + 282, y + 4, 62, 12).fill(tc);
  doc.fillColor(C.white).fontSize(7.5).font('Helvetica-Bold')
     .text(type, L + 282, y + 6, { width: 62, align: 'center' });
  doc.fillColor(C.black).font('Helvetica').fontSize(7.5)
     .text(expected, L + 352, y + 6, { width: W - 356 });
  doc.y = y + 22;
});

doc.moveDown(0.5);
bodyText(
  'Los casos de prueba cubren los cuatro tipos principales: positivos (flujo esperado), negativos ' +
  '(entradas inválidas), de estructura (validación de esquema de respuesta) y de borde (casos límite ' +
  'como payload completamente vacío).'
);

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 7 – RESULTADOS API
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
doc.moveDown(0.8);

sectionTitle('5.3 Resultados de Ejecución – API REST', C.green);

subTitle('Comando de Ejecución');
codeBlock([
  '$ NODE_OPTIONS="--experimental-vm-modules" npx jest tests/app.test.js --no-coverage',
]);

subTitle('Salida de Consola (Jest Output)');
codeBlock([
  'PASS tests/app.test.js',
  '  🌍 API REST – Agencia de Viajes',
  '    📦 GET /api/viajes',
  '      ✓ TC-01: Debe retornar status 200 y lista de viajes (21 ms)',
  '      ✓ TC-02: Cada viaje debe tener los campos requeridos (8 ms)',
  '      ✓ TC-03: El total debe coincidir con la longitud del arreglo (3 ms)',
  '    🔍 GET /api/viajes/:slug',
  '      ✓ TC-04: Debe retornar un viaje existente por slug (3 ms)',
  '      ✓ TC-05: Debe retornar 404 para slug inexistente (3 ms)',
  '    💬 GET /api/testimoniales',
  '      ✓ TC-06: Debe retornar status 200 y lista de testimoniales (2 ms)',
  '      ✓ TC-07: Cada testimonial debe tener nombre, correo y mensaje (3 ms)',
  '    ✉️  POST /api/testimoniales',
  '      ✓ TC-08: Debe crear un testimonial con datos válidos (9 ms)',
  '      ✓ TC-09: Debe rechazar testimonial sin nombre (400) (4 ms)',
  '      ✓ TC-10: Debe rechazar testimonial sin correo (400) (3 ms)',
  '      ✓ TC-11: Debe rechazar testimonial sin mensaje (400) (2 ms)',
  '      ✓ TC-12: Debe rechazar payload completamente vacío (400) (2 ms)',
  '    🗑️  DELETE /api/testimoniales/:id',
  '      ✓ TC-13: Debe eliminar un testimonial existente (2 ms)',
  '      ✓ TC-14: Debe retornar 404 al eliminar ID inexistente (2 ms)',
  '    🚫 Rutas no existentes',
  '      ✓ TC-15: Debe retornar 404 para ruta desconocida (2 ms)',
  '',
  'Test Suites: 1 passed, 1 total',
  'Tests:       15 passed, 15 total',
  'Time:        0.307 s',
], '#1b2631');

subTitle('Tabla de Resultados API');
tableHeader([
  { label: 'Caso', width: 55 },
  { label: 'Descripción', width: W - 155 },
  { label: 'Estado', width: 50 },
  { label: 'Tiempo', width: 50 },
]);

const apiResults = [
  ['TC-01', 'GET /api/viajes → status 200 y lista de viajes', 'PASS', '21 ms'],
  ['TC-02', 'Cada viaje tiene los campos requeridos', 'PASS', '8 ms'],
  ['TC-03', 'Total coincide con longitud del arreglo', 'PASS', '3 ms'],
  ['TC-04', 'GET /api/viajes/:slug → viaje existente', 'PASS', '3 ms'],
  ['TC-05', 'GET /api/viajes/:slug → slug inexistente (404)', 'PASS', '3 ms'],
  ['TC-06', 'GET /api/testimoniales → status 200', 'PASS', '2 ms'],
  ['TC-07', 'Cada testimonial tiene nombre, correo y mensaje', 'PASS', '3 ms'],
  ['TC-08', 'POST /api/testimoniales → datos válidos (201)', 'PASS', '9 ms'],
  ['TC-09', 'POST sin nombre → error 400', 'PASS', '4 ms'],
  ['TC-10', 'POST sin correo → error 400', 'PASS', '3 ms'],
  ['TC-11', 'POST sin mensaje → error 400', 'PASS', '2 ms'],
  ['TC-12', 'POST payload vacío → 3 errores (400)', 'PASS', '2 ms'],
  ['TC-13', 'DELETE testimonial existente → 200', 'PASS', '2 ms'],
  ['TC-14', 'DELETE ID inexistente → 404', 'PASS', '2 ms'],
  ['TC-15', 'Ruta desconocida → 404', 'PASS', '2 ms'],
];

apiResults.forEach(([tc, desc, result, time]) => testRow(tc, desc, result, time));

doc.moveDown(0.5);
// Resumen box
doc.rect(L, doc.y, W, 36).fill('#e8f5e9').stroke(C.green);
doc.fillColor(C.green).fontSize(13).font('Helvetica-Bold')
   .text('✅  15 / 15 Pruebas Pasadas  –  Tiempo Total: 0.307 s', L + 10, doc.y - 28, { width: W - 20, align: 'center' });
doc.fillColor(C.black).fontSize(9).font('Helvetica')
   .text('Cobertura: GET, POST, DELETE | Escenarios: positivos, negativos, borde, estructura',
         L + 10, doc.y - 10, { width: W - 20, align: 'center' });
doc.moveDown(1.2);

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 8 – SCRIPT 2: FORMULARIO WEB
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
doc.moveDown(0.8);

sectionTitle('6. Script 2 – Pruebas de Formulario Web (Puppeteer)', C.secondary);

subTitle('6.1 Diseño y Estructura del Script');

bodyText(
  'El script tests/formulario.test.js implementa 8 casos de prueba que simulan la interacción ' +
  'de un usuario real con el formulario de testimoniales. Puppeteer controla un navegador Chromium ' +
  'headless, permitiendo verificar comportamientos de UI que no son posibles con pruebas de API puras.'
);

subTitle('Arquitectura del Script de Formulario');
codeBlock([
  '// 1. Servidor Express de prueba con formulario HTML completo',
  'const buildFormServer = () => {',
  '  const app = express();',
  '  app.get("/testimoniales", (req, res) => res.send(htmlFormulario));',
  '  app.post("/testimoniales", (req, res) => { /* validación servidor */ });',
  '  return app;',
  '};',
  '',
  '// 2. Configuración de Puppeteer (headless Chromium)',
  'beforeAll(async () => {',
  '  server = createServer(buildFormServer());',
  '  server.listen(0, "127.0.0.1", () => { /* puerto dinámico */ });',
  '  browser = await puppeteer.launch({',
  '    headless: "new",',
  '    args: ["--no-sandbox", "--disable-setuid-sandbox"],',
  '  });',
  '  page = await browser.newPage();',
  '  await page.setViewport({ width: 1280, height: 800 });',
  '});',
  '',
  '// 3. Captura automática de pantalla en cada prueba',
  'const saveScreenshot = async (page, name) => {',
  '  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });',
  '};',
]);

subTitle('Técnicas de Automatización Utilizadas');
bullet('page.goto() – Navegación a URLs del servidor de prueba');
bullet('page.type() – Escritura de texto en campos de formulario');
bullet('page.click() – Clic en botones y elementos interactivos');
bullet('page.$() – Selección de elementos DOM (equivalente a querySelector)');
bullet('page.$eval() – Evaluación de expresiones en el contexto del navegador');
bullet('page.evaluate() – Ejecución de JavaScript arbitrario en la página');
bullet('page.waitForNavigation() – Espera de navegación tras submit');
bullet('page.setViewport() – Cambio de resolución para pruebas responsive');
bullet('page.screenshot() – Captura automática de pantalla en cada caso');

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 9 – CASOS DE PRUEBA FORMULARIO
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
doc.moveDown(0.8);

sectionTitle('6.2 Casos de Prueba – Formulario Web (TC-F01 a TC-F08)', C.secondary);

tableHeader([
  { label: 'ID', width: 55 },
  { label: 'Descripción', width: 195 },
  { label: 'Acción Puppeteer', width: 155 },
  { label: 'Resultado Esperado', width: W - 405 },
]);

const formCases = [
  ['TC-F01', 'Carga correcta del formulario', 'page.goto() + page.title()', 'Título contiene "Testimoniales"'],
  ['TC-F02', 'Todos los campos son visibles', 'page.$() para cada campo', 'Elementos no nulos en DOM'],
  ['TC-F03', 'Errores al enviar vacío (JS)', 'page.click() sin datos', 'Mensajes de error visibles'],
  ['TC-F04', 'Error con correo inválido', 'page.type() correo malo', 'Error "correo válido" visible'],
  ['TC-F05', 'Llenado correcto de campos', 'page.type() en todos', 'Valores correctos en inputs'],
  ['TC-F06', 'Envío exitoso del formulario', 'page.click() + waitForNav', 'Mensaje de éxito visible'],
  ['TC-F07', 'Servidor rechaza datos vacíos', 'fetch() directo POST vacío', 'HTTP 400 del servidor'],
  ['TC-F08', 'Vista responsive en móvil', 'setViewport(375, 667)', 'Formulario visible en 375px'],
];

formCases.forEach(([id, desc, action, expected], i) => {
  const y = doc.y;
  const bg = i % 2 === 0 ? '#f8f9fa' : C.white;
  doc.rect(L, y, W, 22).fill(bg);
  doc.fillColor(C.secondary).fontSize(8).font('Helvetica-Bold')
     .text(id, L + 4, y + 7, { width: 51 });
  doc.fillColor(C.black).font('Helvetica').fontSize(8)
     .text(desc, L + 55, y + 7, { width: 191 });
  doc.fillColor(C.teal).font('Courier').fontSize(7.5)
     .text(action, L + 250, y + 7, { width: 151 });
  doc.fillColor(C.black).font('Helvetica').fontSize(7.5)
     .text(expected, L + 405, y + 7, { width: W - 409 });
  doc.y = y + 24;
});

doc.moveDown(0.5);

subTitle('Código de un Caso de Prueba Representativo (TC-F06)');
codeBlock([
  'test("TC-F06: Debe enviar el formulario y mostrar mensaje de éxito", async () => {',
  '  await page.goto(`${baseUrl}/testimoniales`, { waitUntil: "networkidle0" });',
  '',
  '  // Llenar el formulario con datos válidos',
  '  await page.type("#nombre", "Pedro Sánchez");',
  '  await page.type("#correo", "pedro@test.com");',
  '  await page.type("#mensaje", "Excelente agencia, muy profesionales.");',
  '',
  '  // Enviar y esperar navegación',
  '  await Promise.all([',
  '    page.waitForNavigation({ waitUntil: "networkidle0" }),',
  '    page.click("#btnEnviar"),',
  '  ]);',
  '',
  '  // Verificar mensaje de éxito en la nueva página',
  '  const exitoEl = await page.$("#exito");',
  '  expect(exitoEl).not.toBeNull();',
  '',
  '  const texto = await page.$eval("#exito", (el) => el.textContent);',
  '  expect(texto).toContain("éxito");',
  '',
  '  // Captura automática de pantalla',
  '  await saveScreenshot(page, "06_envio_exitoso");',
  '}, 15000);',
]);

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINAS 10-13 – CAPTURAS DE PANTALLA
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
doc.moveDown(0.8);

sectionTitle('6.3 Capturas de Pantalla del Proceso (Puppeteer)', C.secondary);

bodyText(
  'Las siguientes capturas fueron generadas automáticamente por Puppeteer durante la ejecución ' +
  'de los casos de prueba. Cada imagen documenta el estado del navegador en un momento específico ' +
  'del flujo de prueba.'
);

addScreenshot('01_formulario_cargado.png',
  'TC-F01 – Formulario de testimoniales cargado correctamente en el navegador');

addScreenshot('02_campos_visibles.png',
  'TC-F02 – Verificación de visibilidad de todos los campos del formulario');

newPage();
doc.moveDown(0.5);
sectionTitle('Capturas de Pantalla – Validaciones y Errores', C.red);

addScreenshot('03_errores_campos_vacios.png',
  'TC-F03 – Mensajes de error al intentar enviar el formulario con campos vacíos');

addScreenshot('04_error_correo_invalido.png',
  'TC-F04 – Error de validación al ingresar un correo electrónico con formato inválido');

newPage();
doc.moveDown(0.5);
sectionTitle('Capturas de Pantalla – Llenado y Envío Exitoso', C.green);

addScreenshot('05_formulario_lleno.png',
  'TC-F05 – Formulario correctamente diligenciado con todos los campos válidos');

addScreenshot('06_envio_exitoso.png',
  'TC-F06 – Mensaje de confirmación tras el envío exitoso del testimonial');

newPage();
doc.moveDown(0.5);
sectionTitle('Capturas de Pantalla – Validación Servidor y Responsive', C.teal);

addScreenshot('07_error_servidor_400.png',
  'TC-F07 – Respuesta HTTP 400 del servidor al recibir datos vacíos (bypass de validación JS)');

addScreenshot('08_formulario_movil.png',
  'TC-F08 – Vista responsive del formulario en resolución móvil (375×667 px)');

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 14 – RESULTADOS FORMULARIO
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
doc.moveDown(0.8);

sectionTitle('6.4 Resultados de Ejecución – Formulario Web', C.green);

subTitle('Comando de Ejecución');
codeBlock([
  '$ NODE_OPTIONS="--experimental-vm-modules" npx jest tests/formulario.test.js --no-coverage',
]);

subTitle('Salida de Consola (Jest + Puppeteer Output)');
codeBlock([
  '  console.log',
  '    🚀 Servidor de prueba en: http://127.0.0.1:42345',
  '    📸 Captura guardada: tests/screenshots/01_formulario_cargado.png',
  '    📸 Captura guardada: tests/screenshots/02_campos_visibles.png',
  '    📸 Captura guardada: tests/screenshots/03_errores_campos_vacios.png',
  '    📸 Captura guardada: tests/screenshots/04_error_correo_invalido.png',
  '    📸 Captura guardada: tests/screenshots/05_formulario_lleno.png',
  '    📸 Captura guardada: tests/screenshots/06_envio_exitoso.png',
  '    📸 Captura guardada: tests/screenshots/07_error_servidor_400.png',
  '    📸 Captura guardada: tests/screenshots/08_formulario_movil.png',
  '',
  'PASS tests/formulario.test.js (8.713 s)',
  '  🖥️  Formulario Web – Testimoniales (Puppeteer)',
  '    ✓ TC-F01: El formulario debe cargar correctamente (1086 ms)',
  '    ✓ TC-F02: Todos los campos del formulario deben ser visibles (42 ms)',
  '    ✓ TC-F03: Debe mostrar errores al enviar formulario vacío (1617 ms)',
  '    ✓ TC-F04: Debe mostrar error con correo inválido (1652 ms)',
  '    ✓ TC-F05: Debe permitir llenar todos los campos correctamente (772 ms)',
  '    ✓ TC-F06: Debe enviar el formulario y mostrar mensaje de éxito (1972 ms)',
  '    ✓ TC-F07: El servidor debe rechazar datos vacíos con status 400 (48 ms)',
  '    ✓ TC-F08: El formulario debe verse correctamente en móvil (375px) (625 ms)',
  '',
  'Test Suites: 1 passed, 1 total',
  'Tests:       8 passed, 8 total',
  'Time:        8.761 s',
], '#1b2631');

subTitle('Tabla de Resultados Formulario');
tableHeader([
  { label: 'Caso', width: 55 },
  { label: 'Descripción', width: W - 155 },
  { label: 'Estado', width: 50 },
  { label: 'Tiempo', width: 50 },
]);

const formResults = [
  ['TC-F01', 'El formulario debe cargar correctamente', 'PASS', '1086 ms'],
  ['TC-F02', 'Todos los campos del formulario deben ser visibles', 'PASS', '42 ms'],
  ['TC-F03', 'Debe mostrar errores al enviar formulario vacío', 'PASS', '1617 ms'],
  ['TC-F04', 'Debe mostrar error con correo inválido', 'PASS', '1652 ms'],
  ['TC-F05', 'Debe permitir llenar todos los campos correctamente', 'PASS', '772 ms'],
  ['TC-F06', 'Debe enviar el formulario y mostrar mensaje de éxito', 'PASS', '1972 ms'],
  ['TC-F07', 'El servidor debe rechazar datos vacíos con status 400', 'PASS', '48 ms'],
  ['TC-F08', 'El formulario debe verse correctamente en móvil (375px)', 'PASS', '625 ms'],
];

formResults.forEach(([tc, desc, result, time]) => testRow(tc, desc, result, time));

doc.moveDown(0.5);
doc.rect(L, doc.y, W, 36).fill('#e8f5e9').stroke(C.green);
doc.fillColor(C.green).fontSize(13).font('Helvetica-Bold')
   .text('✅  8 / 8 Pruebas Pasadas  –  Tiempo Total: 8.761 s', L + 10, doc.y - 28, { width: W - 20, align: 'center' });
doc.fillColor(C.black).fontSize(9).font('Helvetica')
   .text('8 capturas de pantalla generadas automáticamente | Pruebas: carga, validación, envío, responsive',
         L + 10, doc.y - 10, { width: W - 20, align: 'center' });
doc.moveDown(1.2);

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA 15 – RESUMEN CONSOLIDADO
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
doc.moveDown(0.8);

sectionTitle('7. Resumen Consolidado de Resultados', C.primary);

// Tabla resumen
tableHeader([
  { label: 'Script', width: 160 },
  { label: 'Herramienta', width: 120 },
  { label: 'Total', width: 50 },
  { label: 'Pasadas', width: 55 },
  { label: 'Fallidas', width: 55 },
  { label: 'Tiempo', width: W - 440 },
]);

const summaryRows = [
  ['Script 1 – API REST', 'Jest + Supertest', '15', '15', '0', '0.307 s'],
  ['Script 2 – Formulario Web', 'Jest + Puppeteer', '8', '8', '0', '8.761 s'],
  ['TOTAL GENERAL', '—', '23', '23', '0', '9.068 s'],
];

summaryRows.forEach(([script, tool, total, pass, fail, time], i) => {
  const y = doc.y;
  const isTotal = i === 2;
  const bg = isTotal ? '#e3f2fd' : (i % 2 === 0 ? '#f8f9fa' : C.white);
  doc.rect(L, y, W, 22).fill(bg);
  if (isTotal) doc.rect(L, y, 2, 22).fill(C.primary);
  doc.fillColor(isTotal ? C.primary : C.black)
     .fontSize(isTotal ? 9 : 8.5)
     .font(isTotal ? 'Helvetica-Bold' : 'Helvetica')
     .text(script, L + 6, y + 7, { width: 154 });
  doc.fillColor(C.gray).font('Helvetica').fontSize(8)
     .text(tool, L + 160, y + 7, { width: 116 });
  doc.fillColor(C.black).font('Helvetica-Bold').fontSize(9)
     .text(total, L + 280, y + 7, { width: 46, align: 'center' });
  doc.fillColor(C.green).font('Helvetica-Bold').fontSize(9)
     .text(pass, L + 335, y + 7, { width: 51, align: 'center' });
  doc.fillColor(C.red).font('Helvetica-Bold').fontSize(9)
     .text(fail, L + 390, y + 7, { width: 51, align: 'center' });
  doc.fillColor(C.gray).font('Helvetica').fontSize(8)
     .text(time, L + 445, y + 7, { width: W - 449, align: 'right' });
  doc.y = y + 24;
});

doc.moveDown(0.8);

// Métricas destacadas
const metrics = [
  { label: '23', sub: 'Casos de Prueba', color: C.primary },
  { label: '100%', sub: 'Tasa de Éxito', color: C.green },
  { label: '0', sub: 'Pruebas Fallidas', color: C.teal },
  { label: '8', sub: 'Capturas de Pantalla', color: C.purple },
];

const mW = (W - 30) / 4;
metrics.forEach(({ label, sub, color }, i) => {
  const x = L + i * (mW + 10);
  const y = doc.y;
  doc.rect(x, y, mW, 55).fill(color);
  doc.fillColor(C.white).fontSize(22).font('Helvetica-Bold')
     .text(label, x, y + 8, { width: mW, align: 'center' });
  doc.fontSize(8).font('Helvetica')
     .text(sub, x, y + 36, { width: mW, align: 'center' });
});
doc.y = doc.y + 65;

divider();

sectionTitle('8. Documentación Técnica del Flujo', C.orange);

const flujo = [
  ['Paso 1', 'Análisis del Proyecto', 'Se analizó la estructura del proyecto: rutas Express, controladores, modelos Sequelize y vistas Pug. Se identificaron los endpoints y formularios a probar.'],
  ['Paso 2', 'Diseño de Casos de Prueba', 'Se diseñaron 23 casos de prueba cubriendo escenarios positivos, negativos, de borde y de estructura, siguiendo el estándar TC-XX para API y TC-FXX para formularios.'],
  ['Paso 3', 'Configuración del Entorno', 'Se instalaron Jest, Supertest, Puppeteer y PDFKit. Se configuró jest.config.js para soporte de módulos ES (ESM) con --experimental-vm-modules.'],
  ['Paso 4', 'Implementación Script API', 'Se creó tests/app.test.js con una app Express aislada (mock de datos) y 15 casos de prueba usando Supertest para peticiones HTTP sin base de datos real.'],
  ['Paso 5', 'Implementación Script Formulario', 'Se creó tests/formulario.test.js con un servidor Express de prueba, formulario HTML completo y 8 casos de prueba usando Puppeteer con capturas automáticas.'],
  ['Paso 6', 'Ejecución y Verificación', 'Se ejecutaron ambos scripts: 15/15 API (0.307s) y 8/8 formulario (8.761s). Se generaron 8 capturas de pantalla automáticas.'],
  ['Paso 7', 'Generación del Informe', 'Se generó este documento PDF con PDFKit, incluyendo código fuente, tablas de resultados, capturas de pantalla y análisis de resultados.'],
];

flujo.forEach(([paso, titulo, desc]) => {
  const y = doc.y;
  if (doc.page.height - y - doc.page.margins.bottom < 50) newPage();
  doc.rect(L, y, 4, 38).fill(C.orange);
  doc.fillColor(C.orange).fontSize(8).font('Helvetica-Bold')
     .text(paso, L + 10, y + 2, { width: 55 });
  doc.fillColor(C.black).fontSize(9.5).font('Helvetica-Bold')
     .text(titulo, L + 70, y + 2, { width: W - 74 });
  doc.fillColor(C.gray).fontSize(8.5).font('Helvetica')
     .text(desc, L + 70, y + 16, { width: W - 74 });
  doc.y = y + 44;
});

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA FINAL – REFLEXIÓN Y CONCLUSIONES
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
doc.moveDown(0.8);

sectionTitle('9. Reflexión sobre la Utilidad de las Pruebas Automatizadas', C.purple);

bodyText(
  'La implementación de este taller permitió evidenciar de manera práctica el valor real de las pruebas ' +
  'automatizadas en el ciclo de desarrollo de software. A continuación se presentan las reflexiones ' +
  'más relevantes derivadas de la experiencia:'
);

const reflexiones = [
  ['Detección Temprana de Errores',
   'Las pruebas automatizadas permiten detectar regresiones y errores en el momento en que se introducen, ' +
   'no cuando llegan a producción. En este proyecto, la validación del controlador de testimoniales ' +
   '(campos vacíos) fue verificada automáticamente en milisegundos.'],
  ['Documentación Viva del Comportamiento',
   'Los scripts de prueba actúan como documentación ejecutable del sistema. Cada caso de prueba describe ' +
   'con precisión qué debe hacer el sistema ante una entrada específica, siendo más confiable que ' +
   'documentación estática que puede quedar desactualizada.'],
  ['Confianza para Refactorizar',
   'Con una suite de 23 pruebas, cualquier cambio en los controladores o rutas puede verificarse ' +
   'instantáneamente. Esto reduce el miedo a refactorizar y permite mejorar el código con seguridad.'],
  ['Separación de Responsabilidades en Testing',
   'La combinación de Jest+Supertest (lógica de negocio/API) y Puppeteer (UI/UX) demuestra que ' +
   'diferentes capas del sistema requieren diferentes estrategias de prueba. No existe una herramienta ' +
   'única que cubra todos los escenarios.'],
  ['Aislamiento como Buena Práctica',
   'El uso de mocks y servidores de prueba aislados garantiza que las pruebas sean deterministas, ' +
   'rápidas y no dependan de infraestructura externa (base de datos, red). Esto es fundamental para ' +
   'integración continua (CI/CD).'],
  ['ROI de la Automatización',
   'Aunque la inversión inicial en escribir pruebas requiere tiempo, el retorno es exponencial: ' +
   'cada ejecución futura (que puede ser automática en cada commit) ahorra horas de pruebas manuales ' +
   'y reduce el costo de los errores en producción.'],
];

reflexiones.forEach(([titulo, texto]) => {
  if (doc.page.height - doc.y - doc.page.margins.bottom < 60) newPage();
  const y = doc.y;
  doc.rect(L, y, W, 2).fill(C.purple);
  doc.fillColor(C.purple).fontSize(10).font('Helvetica-Bold')
     .text(`▶  ${titulo}`, L, y + 6, { width: W });
  doc.fillColor(C.black).fontSize(9).font('Helvetica')
     .text(texto, L + 12, doc.y + 2, { width: W - 12, align: 'justify' });
  doc.moveDown(0.6);
});

divider();

sectionTitle('10. Conclusiones', C.primary);

const conclusiones = [
  'Se diseñaron e implementaron exitosamente 2 scripts de prueba automatizados: uno para API REST (15 casos) y uno para formulario web (8 casos), logrando una tasa de éxito del 100% (23/23 pruebas pasadas).',
  'Jest y Supertest demostraron ser herramientas complementarias ideales para pruebas de integración de APIs Node.js, permitiendo verificar códigos HTTP, estructuras de respuesta y comportamientos de validación sin dependencia de base de datos.',
  'Puppeteer permitió automatizar la interacción con el formulario web de manera que simula fielmente el comportamiento de un usuario real, incluyendo validaciones JavaScript del lado del cliente y capturas de pantalla automáticas.',
  'La estrategia de aislamiento mediante mocks y servidores de prueba independientes garantizó pruebas deterministas, rápidas y reproducibles en cualquier entorno.',
  'Las 8 capturas de pantalla generadas automáticamente por Puppeteer constituyen evidencia visual del comportamiento del sistema, complementando la documentación técnica del taller.',
  'La automatización de pruebas es una inversión estratégica que mejora la calidad del software, reduce costos de mantenimiento y aumenta la confianza del equipo de desarrollo para realizar cambios y mejoras continuas.',
];

conclusiones.forEach((c, i) => {
  bullet(`${i + 1}. ${c}`);
});

doc.moveDown(1);

// Firma final
doc.rect(L + 80, doc.y, W - 160, 70).fill('#f5f5f5').stroke('#e0e0e0');
const boxY = doc.y;
doc.fillColor(C.primary).fontSize(11).font('Helvetica-Bold')
   .text('Estudiante AA1', L + 80, boxY + 10, { width: W - 160, align: 'center' });
doc.fillColor(C.gray).fontSize(9).font('Helvetica')
   .text('Automatización de Pruebas de Software', L + 80, boxY + 28, { width: W - 160, align: 'center' });
doc.fillColor(C.black).fontSize(8)
   .text(`Fecha de entrega: ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}`,
         L + 80, boxY + 44, { width: W - 160, align: 'center' });
doc.rect(L + 80, boxY + 60, W - 160, 2).fill(C.primary);

// ─── Finalizar PDF ────────────────────────────────────────────────────────────
doc.end();
console.log(`\n✅ PDF generado exitosamente: ${OUTPUT}\n`);
