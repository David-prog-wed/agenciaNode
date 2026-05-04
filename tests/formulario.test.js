/**
 * ============================================================
 * SCRIPT DE PRUEBA AUTOMATIZADA - FORMULARIO WEB
 * Agencia de Viajes Node.js
 * Herramienta: Puppeteer (Headless Browser)
 * Autor: Taller AA1
 * ============================================================
 *
 * Este script simula la interacción de un usuario real con el
 * formulario de testimoniales de la Agencia de Viajes,
 * validando comportamiento de UI, mensajes de error y envío.
 */

import puppeteer from 'puppeteer';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Servidor Express de prueba con formulario HTML ───────────────────────────
const buildFormServer = () => {
  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Página del formulario de testimoniales
  app.get('/testimoniales', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Testimoniales – Agencia de Viajes</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 40px; }
    h1 { color: #2c3e50; margin-bottom: 24px; }
    .form-container { background: white; padding: 32px; border-radius: 8px;
                      box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 500px; }
    .form-group { margin-bottom: 16px; }
    label { display: block; font-weight: bold; margin-bottom: 6px; color: #555; }
    input, textarea {
      width: 100%; padding: 10px; border: 1px solid #ddd;
      border-radius: 4px; font-size: 14px;
    }
    textarea { height: 100px; resize: vertical; }
    button {
      background: #3498db; color: white; padding: 12px 24px;
      border: none; border-radius: 4px; cursor: pointer; font-size: 16px;
      width: 100%;
    }
    button:hover { background: #2980b9; }
    .error { color: #e74c3c; font-size: 13px; margin-top: 4px; }
    .error-box {
      background: #fdecea; border: 1px solid #e74c3c;
      border-radius: 4px; padding: 12px; margin-bottom: 16px;
    }
    .success-box {
      background: #eafaf1; border: 1px solid #27ae60;
      border-radius: 4px; padding: 12px; margin-bottom: 16px; color: #27ae60;
    }
    .testimonial-card {
      background: white; border-radius: 8px; padding: 16px;
      margin-bottom: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
  </style>
</head>
<body>
  <h1>Testimoniales</h1>
  <div class="form-container">
    <form id="testimonialForm" action="/testimoniales" method="POST" novalidate>
      <div class="form-group">
        <label for="nombre">Nombre</label>
        <input type="text" id="nombre" name="nombre" placeholder="Tu nombre completo">
        <span class="error" id="error-nombre"></span>
      </div>
      <div class="form-group">
        <label for="correo">Correo Electrónico</label>
        <input type="email" id="correo" name="correo" placeholder="tu@correo.com">
        <span class="error" id="error-correo"></span>
      </div>
      <div class="form-group">
        <label for="mensaje">Mensaje</label>
        <textarea id="mensaje" name="mensaje" placeholder="Escribe tu experiencia..."></textarea>
        <span class="error" id="error-mensaje"></span>
      </div>
      <button type="submit" id="btnEnviar">Enviar Testimonial</button>
    </form>
  </div>

  <script>
    // Validación del lado del cliente
    document.getElementById('testimonialForm').addEventListener('submit', function(e) {
      let valid = true;
      const nombre = document.getElementById('nombre').value.trim();
      const correo = document.getElementById('correo').value.trim();
      const mensaje = document.getElementById('mensaje').value.trim();

      document.getElementById('error-nombre').textContent = '';
      document.getElementById('error-correo').textContent = '';
      document.getElementById('error-mensaje').textContent = '';

      if (!nombre) {
        document.getElementById('error-nombre').textContent = 'El nombre es obligatorio';
        valid = false;
      }
      if (!correo) {
        document.getElementById('error-correo').textContent = 'El correo es obligatorio';
        valid = false;
      } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(correo)) {
        document.getElementById('error-correo').textContent = 'Ingresa un correo válido';
        valid = false;
      }
      if (!mensaje) {
        document.getElementById('error-mensaje').textContent = 'El mensaje es obligatorio';
        valid = false;
      }
      if (!valid) e.preventDefault();
    });
  </script>
</body>
</html>`);
  });

  // Procesar el formulario
  app.post('/testimoniales', (req, res) => {
    const { nombre, correo, mensaje } = req.body;
    const errores = [];

    if (!nombre || nombre.trim() === '') errores.push('El Nombre está vacío');
    if (!correo || correo.trim() === '') errores.push('El Correo está vacío');
    if (!mensaje || mensaje.trim() === '') errores.push('El Mensaje está vacío');

    if (errores.length > 0) {
      return res.status(400).send(`<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>Error</title>
<style>body{font-family:Arial;padding:40px;background:#f5f5f5;}
.error-box{background:#fdecea;border:1px solid #e74c3c;border-radius:4px;padding:12px;color:#e74c3c;}
a{color:#3498db;}</style></head>
<body>
  <div class="error-box" id="errores">
    ${errores.map((e) => `<p>⚠️ ${e}</p>`).join('')}
  </div>
  <a href="/testimoniales">← Volver al formulario</a>
</body></html>`);
    }

    res.status(200).send(`<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>Éxito</title>
<style>body{font-family:Arial;padding:40px;background:#f5f5f5;}
.success-box{background:#eafaf1;border:1px solid #27ae60;border-radius:4px;padding:20px;color:#27ae60;}
a{color:#3498db;}</style></head>
<body>
  <div class="success-box" id="exito">
    <h2>✅ ¡Testimonial enviado con éxito!</h2>
    <p>Gracias, <strong>${nombre}</strong>. Tu mensaje ha sido registrado.</p>
  </div>
  <a href="/testimoniales">← Enviar otro testimonial</a>
</body></html>`);
  });

  return app;
};

// ─── Utilidades ───────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const saveScreenshot = async (page, name) => {
  const dir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`  📸 Captura guardada: ${filePath}`);
  return filePath;
};

// ─── Suite de pruebas ─────────────────────────────────────────────────────────
describe('🖥️  Formulario Web – Testimoniales (Puppeteer)', () => {
  let browser;
  let page;
  let server;
  let baseUrl;

  beforeAll(async () => {
    // Levantar servidor de prueba
    const app = buildFormServer();
    await new Promise((resolve) => {
      server = createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const { port } = server.address();
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`\n  🚀 Servidor de prueba en: ${baseUrl}`);
        resolve();
      });
    });

    // Lanzar Puppeteer
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
  }, 30000);

  afterAll(async () => {
    if (browser) await browser.close();
    if (server) server.close();
  });

  // ── TC-F01: Carga del formulario ─────────────────────────────────────────────
  test('TC-F01: El formulario debe cargar correctamente', async () => {
    await page.goto(`${baseUrl}/testimoniales`, { waitUntil: 'networkidle0' });
    const title = await page.title();
    expect(title).toContain('Testimoniales');

    const form = await page.$('#testimonialForm');
    expect(form).not.toBeNull();

    await saveScreenshot(page, '01_formulario_cargado');
  }, 15000);

  // ── TC-F02: Campos visibles ──────────────────────────────────────────────────
  test('TC-F02: Todos los campos del formulario deben ser visibles', async () => {
    const nombre = await page.$('#nombre');
    const correo = await page.$('#correo');
    const mensaje = await page.$('#mensaje');
    const boton = await page.$('#btnEnviar');

    expect(nombre).not.toBeNull();
    expect(correo).not.toBeNull();
    expect(mensaje).not.toBeNull();
    expect(boton).not.toBeNull();

    await saveScreenshot(page, '02_campos_visibles');
  }, 15000);

  // ── TC-F03: Validación campos vacíos ────────────────────────────────────────
  test('TC-F03: Debe mostrar errores al enviar formulario vacío', async () => {
    await page.goto(`${baseUrl}/testimoniales`, { waitUntil: 'networkidle0' });

    // Limpiar campos y enviar vacío
    await page.$eval('#nombre', (el) => (el.value = ''));
    await page.$eval('#correo', (el) => (el.value = ''));
    await page.$eval('#mensaje', (el) => (el.value = ''));

    // Interceptar el submit para evitar navegación (validación JS)
    await page.evaluate(() => {
      document.getElementById('testimonialForm').addEventListener(
        'submit',
        (e) => e.preventDefault(),
        { once: false }
      );
    });

    await page.click('#btnEnviar');
    await sleep(500);

    const errorNombre = await page.$eval('#error-nombre', (el) => el.textContent);
    const errorCorreo = await page.$eval('#error-correo', (el) => el.textContent);
    const errorMensaje = await page.$eval('#error-mensaje', (el) => el.textContent);

    expect(errorNombre).toContain('obligatorio');
    expect(errorCorreo).toContain('obligatorio');
    expect(errorMensaje).toContain('obligatorio');

    await saveScreenshot(page, '03_errores_campos_vacios');
  }, 15000);

  // ── TC-F04: Validación correo inválido ──────────────────────────────────────
  test('TC-F04: Debe mostrar error con correo inválido', async () => {
    await page.goto(`${baseUrl}/testimoniales`, { waitUntil: 'networkidle0' });

    await page.evaluate(() => {
      document.getElementById('testimonialForm').addEventListener(
        'submit',
        (e) => e.preventDefault(),
        { once: false }
      );
    });

    await page.type('#nombre', 'Juan Pérez');
    await page.type('#correo', 'correo-invalido');
    await page.type('#mensaje', 'Mi mensaje de prueba');
    await page.click('#btnEnviar');
    await sleep(500);

    const errorCorreo = await page.$eval('#error-correo', (el) => el.textContent);
    expect(errorCorreo).toContain('válido');

    await saveScreenshot(page, '04_error_correo_invalido');
  }, 15000);

  // ── TC-F05: Llenado correcto del formulario ──────────────────────────────────
  test('TC-F05: Debe permitir llenar todos los campos correctamente', async () => {
    await page.goto(`${baseUrl}/testimoniales`, { waitUntil: 'networkidle0' });

    await page.type('#nombre', 'Laura Martínez');
    await page.type('#correo', 'laura@agenciaviajes.com');
    await page.type('#mensaje', 'El viaje a París fue una experiencia inolvidable. ¡100% recomendado!');

    await saveScreenshot(page, '05_formulario_lleno');

    const nombre = await page.$eval('#nombre', (el) => el.value);
    const correo = await page.$eval('#correo', (el) => el.value);
    const mensaje = await page.$eval('#mensaje', (el) => el.value);

    expect(nombre).toBe('Laura Martínez');
    expect(correo).toBe('laura@agenciaviajes.com');
    expect(mensaje).toContain('París');
  }, 15000);

  // ── TC-F06: Envío exitoso del formulario ────────────────────────────────────
  test('TC-F06: Debe enviar el formulario y mostrar mensaje de éxito', async () => {
    await page.goto(`${baseUrl}/testimoniales`, { waitUntil: 'networkidle0' });

    await page.type('#nombre', 'Pedro Sánchez');
    await page.type('#correo', 'pedro@test.com');
    await page.type('#mensaje', 'Excelente agencia, muy profesionales.');

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('#btnEnviar'),
    ]);

    const exitoEl = await page.$('#exito');
    expect(exitoEl).not.toBeNull();

    const texto = await page.$eval('#exito', (el) => el.textContent);
    expect(texto).toContain('éxito');

    await saveScreenshot(page, '06_envio_exitoso');
  }, 15000);

  // ── TC-F07: Envío con campos vacíos (validación servidor) ───────────────────
  test('TC-F07: El servidor debe rechazar datos vacíos con status 400', async () => {
    // Usar fetch directo para bypassear validación JS del cliente
    const response = await page.evaluate(async (url) => {
      const res = await fetch(`${url}/testimoniales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'nombre=&correo=&mensaje=',
      });
      return { status: res.status, text: await res.text() };
    }, baseUrl);

    expect(response.status).toBe(400);
    expect(response.text).toContain('vacío');

    await saveScreenshot(page, '07_error_servidor_400');
  }, 15000);

  // ── TC-F08: Responsividad del formulario ────────────────────────────────────
  test('TC-F08: El formulario debe verse correctamente en móvil (375px)', async () => {
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(`${baseUrl}/testimoniales`, { waitUntil: 'networkidle0' });

    const form = await page.$('#testimonialForm');
    expect(form).not.toBeNull();

    await saveScreenshot(page, '08_formulario_movil');

    // Restaurar viewport
    await page.setViewport({ width: 1280, height: 800 });
  }, 15000);
});
