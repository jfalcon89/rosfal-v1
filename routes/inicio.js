const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");
const fetch = require("node-fetch");

const useragent = require('express-useragent');

router.get('/', async(req, res) => {

    // const ipString = "152.0.12.42, 172.71.82.116";
    const ipString = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ip = ipString.split(',')[0];

    const device = req.useragent.isMobile ? 'Mobile' : 'Desktop';
    const bot = req.useragent.isBot ? 'true' : 'false';
    const browser = req.useragent.browser;
    const sistemaOperativo = req.useragent.os
    const plataforma = req.useragent.platform


    fetch(`https://ipgeolocation.abstractapi.com/v1/?api_key=c48b62c0f8844a7c86cb0020ff90e0d3&ip_address=${ip}`)
        .then(response => response.json())
        .then(data => {

            const pais = data.country;
            const ciudad = data.city;
            const latitud = data.latitude;
            const longitud = data.longitude;
            const fecha = new Date().toLocaleString('en-US', { timeZone: 'America/Santo_Domingo' });




            const nuevaVisita = {
                pais,
                ciudad,
                ip,
                device,
                browser,
                sistemaOperativo,
                plataforma,
                latitud,
                longitud,
                fecha,
                bot


            };

            console.log(nuevaVisita)


            pool.query('INSERT INTO visitas set ?', [nuevaVisita]);
        })


    // console.log(ip)
    // console.log(device)
    // console.log(browser)

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