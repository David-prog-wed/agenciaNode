import express from 'express';
import router from './routes/index.js';
import db from './config/db.js';

const app = express();

//? Conectar a la base de datos
db.authenticate()
  .then(() => console.log('DB Conectada'))
  .catch((error) => console.log(error));

//? Definir el puerto
const port = process.env.PORT || 3000;

//? Habilitar PUG
app.set('view engine', 'pug');

//? Obtener el año actual
//? res.locals - es una variable que se puede utilizar en cualquier vista
app.use((req, res, next) => {
  const year = new Date();
  res.locals.actualYear = year.getFullYear();
  res.locals.nombreSitio = 'Agencia de Viajes';
  return next(); //? next() - para que continue con la siguiente funcion y return para forzar que no siga ejecutando el codigo y pase a la siguiente funcion o middleware
});

//? Agregar body parser para leer los datos del formulario
app.use(express.urlencoded({ extended: true }));

//? Definir la carpeta publica
app.use(express.static('public'));

//? Agregar Router
app.use('/', router); //? use se usa para soportar cualquier tipo de peticion http

app.listen(port, () =>
  console.log(`El servidor esta funcionado en el puerto ${port}`)
);
