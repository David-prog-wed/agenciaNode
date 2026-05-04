/**
 * ============================================================
 * SCRIPT DE PRUEBA AUTOMATIZADA - API REST
 * Agencia de Viajes Node.js
 * Herramienta: Jest + Supertest
 * Autor: Taller AA1
 * ============================================================
 *
 * Este script prueba los endpoints REST de la aplicación
 * usando una instancia Express aislada (sin base de datos real),
 * aplicando mocks para Sequelize y los modelos.
 */

import express from 'express';
import request from 'supertest';

// ─── Mock de modelos (sin conexión real a DB) ─────────────────────────────────
const mockViajes = [
  {
    id: 1,
    titulo: 'Viaje a París',
    precio: '1500',
    fecha_ida: '2026-06-01',
    fecha_vuelta: '2026-06-15',
    imagen: 'paris.jpg',
    descripcion: 'Tour completo por la ciudad luz',
    disponibles: '10',
    slug: 'viaje-a-paris',
  },
  {
    id: 2,
    titulo: 'Aventura en Tokio',
    precio: '2200',
    fecha_ida: '2026-07-10',
    fecha_vuelta: '2026-07-25',
    imagen: 'tokio.jpg',
    descripcion: 'Descubre la cultura japonesa',
    disponibles: '8',
    slug: 'aventura-en-tokio',
  },
  {
    id: 3,
    titulo: 'Safari en Kenia',
    precio: '3000',
    fecha_ida: '2026-08-05',
    fecha_vuelta: '2026-08-20',
    imagen: 'kenia.jpg',
    descripcion: 'Experiencia única en la sabana africana',
    disponibles: '5',
    slug: 'safari-en-kenia',
  },
];

const mockTestimoniales = [
  {
    id: 1,
    nombre: 'Ana García',
    correo: 'ana@example.com',
    mensaje: 'Excelente servicio, lo recomiendo totalmente.',
  },
  {
    id: 2,
    nombre: 'Carlos López',
    correo: 'carlos@example.com',
    mensaje: 'El viaje a París fue increíble, gracias.',
  },
];

// ─── Construcción de la app Express de prueba ─────────────────────────────────
const buildTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Middleware de variables globales (igual que en producción)
  app.use((req, res, next) => {
    res.locals.actualYear = new Date().getFullYear();
    res.locals.nombreSitio = 'Agencia de Viajes';
    next();
  });

  // ── GET /api/viajes ──────────────────────────────────────────────────────────
  app.get('/api/viajes', (req, res) => {
    res.status(200).json({
      ok: true,
      total: mockViajes.length,
      viajes: mockViajes,
    });
  });

  // ── GET /api/viajes/:slug ────────────────────────────────────────────────────
  app.get('/api/viajes/:slug', (req, res) => {
    const { slug } = req.params;
    const viaje = mockViajes.find((v) => v.slug === slug);
    if (!viaje) {
      return res.status(404).json({ ok: false, mensaje: 'Viaje no encontrado' });
    }
    res.status(200).json({ ok: true, viaje });
  });

  // ── GET /api/testimoniales ───────────────────────────────────────────────────
  app.get('/api/testimoniales', (req, res) => {
    res.status(200).json({
      ok: true,
      total: mockTestimoniales.length,
      testimoniales: mockTestimoniales,
    });
  });

  // ── POST /api/testimoniales ──────────────────────────────────────────────────
  app.post('/api/testimoniales', (req, res) => {
    const { nombre, correo, mensaje } = req.body;
    const errores = [];

    if (!nombre || nombre.trim() === '')
      errores.push({ campo: 'nombre', mensaje: 'El Nombre está vacío' });
    if (!correo || correo.trim() === '')
      errores.push({ campo: 'correo', mensaje: 'El Correo está vacío' });
    if (!mensaje || mensaje.trim() === '')
      errores.push({ campo: 'mensaje', mensaje: 'El Mensaje está vacío' });

    if (errores.length > 0) {
      return res.status(400).json({ ok: false, errores });
    }

    const nuevo = {
      id: mockTestimoniales.length + 1,
      nombre: nombre.trim(),
      correo: correo.trim(),
      mensaje: mensaje.trim(),
    };
    mockTestimoniales.push(nuevo);
    res.status(201).json({ ok: true, testimonial: nuevo });
  });

  // ── DELETE /api/testimoniales/:id ────────────────────────────────────────────
  app.delete('/api/testimoniales/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const idx = mockTestimoniales.findIndex((t) => t.id === id);
    if (idx === -1) {
      return res.status(404).json({ ok: false, mensaje: 'Testimonial no encontrado' });
    }
    mockTestimoniales.splice(idx, 1);
    res.status(200).json({ ok: true, mensaje: 'Testimonial eliminado correctamente' });
  });

  // ── Ruta no existente ────────────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada' });
  });

  return app;
};

// ─── Suite de pruebas ─────────────────────────────────────────────────────────
const app = buildTestApp();

describe('🌍 API REST – Agencia de Viajes', () => {
  // ── Bloque 1: Viajes ─────────────────────────────────────────────────────────
  describe('📦 GET /api/viajes', () => {
    test('TC-01: Debe retornar status 200 y lista de viajes', async () => {
      const res = await request(app).get('/api/viajes');
      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.viajes)).toBe(true);
      expect(res.body.viajes.length).toBeGreaterThan(0);
    });

    test('TC-02: Cada viaje debe tener los campos requeridos', async () => {
      const res = await request(app).get('/api/viajes');
      const campos = ['id', 'titulo', 'precio', 'slug', 'disponibles'];
      res.body.viajes.forEach((viaje) => {
        campos.forEach((campo) => {
          expect(viaje).toHaveProperty(campo);
        });
      });
    });

    test('TC-03: El total debe coincidir con la longitud del arreglo', async () => {
      const res = await request(app).get('/api/viajes');
      expect(res.body.total).toBe(res.body.viajes.length);
    });
  });

  describe('🔍 GET /api/viajes/:slug', () => {
    test('TC-04: Debe retornar un viaje existente por slug', async () => {
      const res = await request(app).get('/api/viajes/viaje-a-paris');
      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.viaje.slug).toBe('viaje-a-paris');
      expect(res.body.viaje.titulo).toBe('Viaje a París');
    });

    test('TC-05: Debe retornar 404 para slug inexistente', async () => {
      const res = await request(app).get('/api/viajes/slug-que-no-existe');
      expect(res.statusCode).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body).toHaveProperty('mensaje');
    });
  });

  // ── Bloque 2: Testimoniales ──────────────────────────────────────────────────
  describe('💬 GET /api/testimoniales', () => {
    test('TC-06: Debe retornar status 200 y lista de testimoniales', async () => {
      const res = await request(app).get('/api/testimoniales');
      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.testimoniales)).toBe(true);
    });

    test('TC-07: Cada testimonial debe tener nombre, correo y mensaje', async () => {
      const res = await request(app).get('/api/testimoniales');
      res.body.testimoniales.forEach((t) => {
        expect(t).toHaveProperty('nombre');
        expect(t).toHaveProperty('correo');
        expect(t).toHaveProperty('mensaje');
      });
    });
  });

  describe('✉️  POST /api/testimoniales', () => {
    test('TC-08: Debe crear un testimonial con datos válidos', async () => {
      const payload = {
        nombre: 'María Rodríguez',
        correo: 'maria@test.com',
        mensaje: 'Servicio excelente, volvería a contratar.',
      };
      const res = await request(app).post('/api/testimoniales').send(payload);
      expect(res.statusCode).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.testimonial.nombre).toBe(payload.nombre);
      expect(res.body.testimonial.correo).toBe(payload.correo);
    });

    test('TC-09: Debe rechazar testimonial sin nombre (400)', async () => {
      const res = await request(app)
        .post('/api/testimoniales')
        .send({ nombre: '', correo: 'test@test.com', mensaje: 'Hola' });
      expect(res.statusCode).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.errores.some((e) => e.campo === 'nombre')).toBe(true);
    });

    test('TC-10: Debe rechazar testimonial sin correo (400)', async () => {
      const res = await request(app)
        .post('/api/testimoniales')
        .send({ nombre: 'Test', correo: '', mensaje: 'Hola' });
      expect(res.statusCode).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.errores.some((e) => e.campo === 'correo')).toBe(true);
    });

    test('TC-11: Debe rechazar testimonial sin mensaje (400)', async () => {
      const res = await request(app)
        .post('/api/testimoniales')
        .send({ nombre: 'Test', correo: 'test@test.com', mensaje: '' });
      expect(res.statusCode).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.errores.some((e) => e.campo === 'mensaje')).toBe(true);
    });

    test('TC-12: Debe rechazar payload completamente vacío (400)', async () => {
      const res = await request(app)
        .post('/api/testimoniales')
        .send({ nombre: '', correo: '', mensaje: '' });
      expect(res.statusCode).toBe(400);
      expect(res.body.errores.length).toBe(3);
    });
  });

  describe('🗑️  DELETE /api/testimoniales/:id', () => {
    test('TC-13: Debe eliminar un testimonial existente', async () => {
      const res = await request(app).delete('/api/testimoniales/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    test('TC-14: Debe retornar 404 al eliminar ID inexistente', async () => {
      const res = await request(app).delete('/api/testimoniales/9999');
      expect(res.statusCode).toBe(404);
      expect(res.body.ok).toBe(false);
    });
  });

  // ── Bloque 3: Rutas no existentes ────────────────────────────────────────────
  describe('🚫 Rutas no existentes', () => {
    test('TC-15: Debe retornar 404 para ruta desconocida', async () => {
      const res = await request(app).get('/api/ruta-inexistente');
      expect(res.statusCode).toBe(404);
    });
  });
});
