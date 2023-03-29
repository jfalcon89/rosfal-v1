const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");


// 1
// RENDERIZANDO Y MOSTRANDO TODOS LOS MENSAJES NUEVOS
router.get('/mensajes', async(req, res) => {
    if (req.session.loggedin) {


        const arrayMensajesDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Nuevo" ORDER BY fechaMensaje DESC');
        const arrayMensajesLeidosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Leido" ');
        const arrayMensajesNoLeidosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="No Leido" ');
        // const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="aprobada"');
        // const arraySolicitudesDeclinadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada"');
        // const arraySolicitudesEnRevisionDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision"');
        res.render("mensajes", {
            arrayMensajes: arrayMensajesDB,
            arrayMensajesLeidos: arrayMensajesLeidosDB,
            arrayMensajesNoLeidos: arrayMensajesNoLeidosDB,
            login: true,
            name: req.session.name


        });

    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
        });
    }

});



module.exports = router;