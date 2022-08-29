const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");



router.get('/contacto', (req, res) => {
    res.render('contacto');
})

//INSERTAR NUEVA SOLICITUD A MYSQL****************
router.post("/contacto", async(req, res) => {
    const { nombre, telefono, email, asunto, mensaje } = req.body;

    const nuevoMensaje = {
        nombre,
        telefono,
        email,
        asunto,
        mensaje

    };

    await pool.query('INSERT INTO mensajes set ?', [nuevoMensaje]);
    // req.flash('success', 'Link guardado correctamente');
    res.redirect('/contacto');

});








module.exports = router;