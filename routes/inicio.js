const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");
const fetch = require("node-fetch");

const useragent = require('express-useragent');

router.get('/', async(req, res) => {

    // const ipString = "148.0.27.34, 172.71.82.116";
    const ipString = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ip = ipString.split(',')[0];

    console.log('ip ' + ip);

    const device = req.useragent.isMobile ? 'Mobile' : 'Desktop';
    const bot = req.useragent.isBot ? 'true' : 'false';
    const browser = req.useragent.browser;
    const sistemaOperativo = req.useragent.os
    const plataforma = req.useragent.platform


    fetch(`https://ipgeolocation.abstractapi.com/v1/?api_key=174a3d4da2a14777ab66bef79388279b&ip_address=${ip}`)
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

    const modal_prestamos_quincenalesDB = await pool.query("SELECT * FROM tab_anuncios WHERE idAnuncio = 1")
    const modal_prestamos_semanalesDB = await pool.query("SELECT * FROM tab_anuncios WHERE idAnuncio = 2")
    const modal_anuncios_generalesDB = await pool.query("SELECT * FROM tab_anuncios WHERE idAnuncio = 3")


    // console.log(estadoAnuncioDB[0].estado)

    res.render('inicio', {
        arrayNuevoTestimonio: arrayNuevoTestimonioDB,
        modal_prestamos_quincenales: modal_prestamos_quincenalesDB[0],
        modal_prestamos_semanales: modal_prestamos_semanalesDB[0],
        modal_anuncios_generales: modal_anuncios_generalesDB[0]


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