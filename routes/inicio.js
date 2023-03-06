const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");
const fetch = require("node-fetch");

const ipapi = require('ipapi.co');

const useragent = require('express-useragent');

router.get('/', async(req, res) => {
    // console.log(res)
    // console.log(res.hasHeader)

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // const ip = "8.8.8.8";
    const device = req.useragent.isMobile ? 'Mobile' : 'Desktop';
    const browser = req.useragent.browser;

    console.log(ip)
    console.log(device)
    console.log(browser)


    try {
        const response = await fetch(`https://ipapi.co/${ip}/json`);
        const data = await response.json();
        const { latitude, longitude, country_name, city, postal } = data;

        console.log(data)

        console.log(`Latitude: ${latitude}, Longitude: ${longitude}, Country: ${country_name}, City: ${city}, Postal: ${postal}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener la ubicación');
    }



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