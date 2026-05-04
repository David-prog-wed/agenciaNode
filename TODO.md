# TODO - Estabilización app Agencia Viajes

- [x] Revisar configuración actual de conexión DB (`config/db.js` y `.env`)
- [x] Crear `.env` local base para MySQL
- [x] Ajustar `config/db.js` con valores por defecto seguros

## Plan aprobado: DB completa con Docker + vistas

- [ ] Crear `docker-compose.yml` para MySQL 8
- [ ] Levantar contenedor MySQL
- [ ] Inicializar schema/tablas (`viajes`, `testimoniales`) y datos semilla
- [ ] Verificar conexión Sequelize (`DB Conectada`)
- [ ] Validar rutas de vistas: `/`, `/viajes`, `/viajes/:slug`, `/testimoniales`
- [ ] Validar envío de formulario `POST /testimoniales`
- [ ] Ejecutar `npm test`
- [ ] Dejar resumen final de estado
