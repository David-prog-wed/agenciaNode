import { Viaje } from "../models/Viaje.js";
import { Testimonial } from "../models/Testimoniales.js";

const arreglarTexto = (texto) => {
  if (typeof texto !== "string") return texto;
  return texto
    .replaceAll("Ã¡", "á")
    .replaceAll("Ã©", "é")
    .replaceAll("Ã­", "í")
    .replaceAll("Ã³", "ó")
    .replaceAll("Ãº", "ú")
    .replaceAll("Ã", "Á")
    .replaceAll("Ã‰", "É")
    .replaceAll("Ã", "Í")
    .replaceAll("Ã“", "Ó")
    .replaceAll("Ãš", "Ú")
    .replaceAll("Ã±", "ñ")
    .replaceAll("Ã‘", "Ñ")
    .replaceAll("Ã¼", "ü")
    .replaceAll("Ãœ", "Ü")
    .replaceAll("Â¿", "¿")
    .replaceAll("Â¡", "¡")
    .replaceAll("â€™", "’")
    .replaceAll("â€˜", "‘")
    .replaceAll("â€œ", "“")
    .replaceAll("â€", "”")
    .replaceAll("â€“", "–")
    .replaceAll("â€”", "—")
    .replaceAll("Â", "");
};

const normalizarViaje = (viaje) => {
  if (!viaje) return viaje;
  const viajeJSON = viaje.toJSON ? viaje.toJSON() : viaje;
  return {
    ...viajeJSON,
    titulo: arreglarTexto(viajeJSON.titulo),
    descripcion: arreglarTexto(viajeJSON.descripcion),
  };
};

const normalizarTestimonial = (testimonial) => {
  if (!testimonial) return testimonial;
  const testimonialJSON = testimonial.toJSON
    ? testimonial.toJSON()
    : testimonial;
  return {
    ...testimonialJSON,
    nombre: arreglarTexto(testimonialJSON.nombre),
    correo: arreglarTexto(testimonialJSON.correo),
    mensaje: arreglarTexto(testimonialJSON.mensaje),
  };
};

const paginaInicio = async (req, res) => {
  //? Consultar 3 viajes del modelo viaje

  const promiseDB = [];

  promiseDB.push(Viaje.findAll({ limit: 3 }));
  promiseDB.push(Testimonial.findAll({ limit: 3 }));

  try {
    const resultado = await Promise.all(promiseDB);
    //? req - lo que enviamos : res - lo que express nos responde
    const viajes = resultado[0].map(normalizarViaje);
    const testimoniales = resultado[1].map(normalizarTestimonial);

    res.render("inicio", {
      pagina: "Inicio",
      clase: "home",
      viajes,
      testimoniales,
    });
  } catch (error) {
    console.log(error);
  }
};

const paginaNosotros = (req, res) => {
  res.render("nosotros", {
    pagina: "Nosotros",
  });
};

const paginaViajes = async (req, res) => {
  //? Consultar base de datos
  const viajesDB = await Viaje.findAll();
  const viajes = viajesDB.map(normalizarViaje);

  res.render("viajes", {
    pagina: "Próximos Viajes",
    viajes,
  });
};

const paginaTestimoniales = async (req, res) => {
  try {
    const testimonialesDB = await Testimonial.findAll();
    const testimoniales = testimonialesDB.map(normalizarTestimonial);

    res.render("testimoniales", {
      pagina: "Testimoniales",
      testimoniales,
    });
  } catch (error) {
    console.log(error);
  }
};

//? Muestra un viaje por su slug
const paginaDetalleViaje = async (req, res) => {
  const { slug } = req.params;
  try {
    const viajeDB = await Viaje.findOne({ where: { slug } });
    const viaje = normalizarViaje(viajeDB);

    res.render("viaje", {
      pagina: "Información Viaje",
      viaje,
    });
  } catch (error) {
    console.log(error);
  }
};

export {
  paginaInicio,
  paginaNosotros,
  paginaViajes,
  paginaTestimoniales,
  paginaDetalleViaje,
};
