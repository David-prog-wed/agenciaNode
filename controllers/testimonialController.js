import { Testimonial } from "../models/Testimoniales.js";

const guardarTestimonial = async (req, res) => {
  //? Validar que todos los campos esten llenos;
  const nombre = (req.body.nombre || "").trim();
  const correo = (req.body.correo || "").trim();
  const mensaje = (req.body.mensaje || "").trim();

  const errores = [];

  if (nombre === "") {
    errores.push({ mensaje: "El Nombre esta vacio" });
  }

  if (correo === "") {
    errores.push({ mensaje: "El Correo esta vacio" });
  }

  if (mensaje === "") {
    errores.push({ mensaje: "El Mensaje esta vacio" });
  }

  if (errores.length > 0) {
    //? Consultar testimoniales existentes
    let testimoniales = [];
    try {
      testimoniales = await Testimonial.findAll();
    } catch (error) {
      console.log(error);
    }

    //? Mostrar la vista con errores
    return res.status(400).render("testimoniales", {
      pagina: "Testimoniales",
      errores,
      nombre,
      correo,
      mensaje,
      testimoniales,
    });
  }

  //? Almacenar en la base de datos
  try {
    await Testimonial.create({
      nombre,
      correo,
      mensaje,
    });
    return res.redirect("/testimoniales");
  } catch (error) {
    console.log(error);

    let testimoniales = [];
    try {
      testimoniales = await Testimonial.findAll();
    } catch (dbError) {
      console.log(dbError);
    }

    return res.status(500).render("testimoniales", {
      pagina: "Testimoniales",
      errores: [
        {
          mensaje:
            "No fue posible guardar tu testimonial en este momento. Intenta más tarde.",
        },
      ],
      nombre,
      correo,
      mensaje,
      testimoniales,
    });
  }
};

export { guardarTestimonial };
