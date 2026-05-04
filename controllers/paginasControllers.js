import { Viaje } from "../models/Viaje.js";
import { Testimonial } from "../models/Testimoniales.js";

const paginaInicio = async (req, res) => {
  //? Consultar 3 viajes del modelo viaje

  const promiseDB = [];

  promiseDB.push(Viaje.findAll({ limit: 3 }));
  promiseDB.push(Testimonial.findAll({ limit: 3 }));

  try {
    const resultado = await Promise.all(promiseDB);
    //? req - lo que enviamos : res - lo que express nos responde
    res.render("inicio", {
      pagina: "Inicio",
      clase: "home",
      viajes: resultado[0],
      testimoniales: resultado[1],
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
  try {
    //? Consultar base de datos
    const viajes = await Viaje.findAll();
    res.render("viajes", {
      pagina: "Próximos Viajes",
      viajes,
    });
  } catch (error) {
    console.log(error);
    res.status(200).render("viajes", {
      pagina: "Próximos Viajes",
      viajes: [],
      errores: [
        { mensaje: "No se pudieron cargar los viajes en este momento." },
      ],
    });
  }
};

const paginaTestimoniales = async (req, res) => {
  try {
    const testimoniales = await Testimonial.findAll();
    res.render("testimoniales", {
      pagina: "Testimoniales",
      testimoniales,
    });
  } catch (error) {
    console.log(error);
    res.status(200).render("testimoniales", {
      pagina: "Testimoniales",
      testimoniales: [],
      errores: [
        { mensaje: "No se pudieron cargar los testimoniales en este momento." },
      ],
    });
  }
};

//? Muestra un viaje por su slug
const paginaDetalleViaje = async (req, res) => {
  const { slug } = req.params;
  try {
    const viaje = await Viaje.findOne({ where: { slug } });

    if (!viaje) {
      return res.status(404).render("viaje", {
        pagina: "Información Viaje",
        viaje: null,
        errores: [{ mensaje: "El viaje solicitado no existe." }],
      });
    }

    return res.render("viaje", {
      pagina: "Información Viaje",
      viaje,
    });
  } catch (error) {
    console.log(error);
    return res.status(200).render("viaje", {
      pagina: "Información Viaje",
      viaje: null,
      errores: [
        {
          mensaje:
            "No se pudo cargar la información del viaje en este momento.",
        },
      ],
    });
  }
};

export {
  paginaInicio,
  paginaNosotros,
  paginaViajes,
  paginaTestimoniales,
  paginaDetalleViaje,
};
