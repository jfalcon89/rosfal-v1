const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");




router.get('/', async(req, res) => {

    const arrayNuevoTestimonioDB = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Activo" ');

    res.render('inicio', {
        arrayNuevoTestimonio: arrayNuevoTestimonioDB
    });

});


//INSERTAR NUEVA SOLICITUD A MYSQL****************
router.post("/", async(req, res) => {
    const { nombre, ciudad, testimonio } = req.body;

    const nuevoTestimonio = {
        nombre,
        ciudad,
        testimonio


    };

    const arrayNuevoTestimonioDB = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Activo"  ');

    await pool.query('INSERT INTO testimonios set ?', [nuevoTestimonio]);
    // req.flash('success', 'Link guardado correctamente');
    // res.redirect('/contacto');

    res.render('inicio', {
        arrayNuevoTestimonio: arrayNuevoTestimonioDB,
        alert: true,
        alertTitle: "Muchas Gracias",
        alertMessage: "¡TESTIMONIO ENVIADO CORRECTAMENTE!",
        alertIcon: 'success',
        showConfirmButton: false,
        timer: 2000,
        ruta: ''
    });

});










module.exports = router;