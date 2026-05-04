# AgenciaViajesNode

Aplicación web de agencia de viajes con Node.js, Express, Pug, Sequelize y MySQL.

## Requisitos

- Node.js 18+
- npm
- Docker Desktop (para levantar MySQL con `docker compose`)

## Ejecución correcta de la app (Windows PowerShell)

Ejecuta estos comandos dentro de `d:\agenciaViajesNode`:

```powershell
npm install
docker compose up -d
npm run dev
```

La app quedará disponible en:

- `http://127.0.0.1:3000/`

## Alternativas de arranque

### Modo desarrollo (reinicio automático)

```powershell
npm run dev
```

### Modo producción/local simple

```powershell
npm start
```

## Verificar funcionamiento

### Verificar home

```powershell
curl -i http://127.0.0.1:3000/
```

### Verificar páginas principales

```powershell
curl -i http://127.0.0.1:3000/nosotros
curl -i http://127.0.0.1:3000/viajes
```

## Abrir en navegador

```powershell
start http://127.0.0.1:3000/
```

## Tests

```powershell
npm test
```
