const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");
const fetch = require("node-fetch");



router.get('/', async(req, res) => {


    const arrayNuevoTestimonioDB = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Activo" ');

    const modal_anuncio_salonDB = await pool.query("SELECT anuncio modal_anuncio_salon, estado FROM tab_anuncios WHERE idAnuncio = 1")
    const modal_anuncio_peluqueriaDB = await pool.query("SELECT anuncio modal_anuncio_peluqueria, estado FROM tab_anuncios WHERE idAnuncio = 2")


    // console.log(estadoAnuncioDB[0].estado)

    res.render('inicio', {
        arrayNuevoTestimonio: arrayNuevoTestimonioDB,
        modal_anuncio_salon: modal_anuncio_salonDB[0],
        modal_anuncio_peluqueria: modal_anuncio_peluqueriaDB[0]


    });

});


//INSERTAR NUEVO TESTIMONIO****************
// router.post("/", async(req, res) => {
//     const { nombre, ciudad, testimonio } = req.body;

//     const nuevoTestimonio = {
//         nombre,
//         ciudad,
//         testimonio


//     };

//     const arrayNuevoTestimonioDB = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Activo"  ');

//     await pool.query('INSERT INTO testimonios set ?', [nuevoTestimonio]);
//     // req.flash('success', 'Link guardado correctamente');
//     // res.redirect('/contacto');

//     res.render('inicio', {
//         arrayNuevoTestimonio: arrayNuevoTestimonioDB,
//         alert: true,
//         alertTitle: "Muchas Gracias",
//         alertMessage: "¡TESTIMONIO ENVIADO CORRECTAMENTE!",
//         alertIcon: 'success',
//         showConfirmButton: false,
//         timer: 2000,
//         ruta: ''
//     });

// });










module.exports = router;