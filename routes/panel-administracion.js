const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");



// router.get('/panel-administracion', (req, res) => {
//     res.render('panel-administracion');
// })

// RENDERIZANDO Y MOSTRANDO TODOS LAS SOLITUDES NUEVAS********************
router.get('/panel-administracion', async(req, res) => {
    if (req.session.loggedin) {


        const arraySolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
        const arrayMensajesNuevosDB = await pool.query('SELECT idMensaje FROM mensajes WHERE estadoMensaje="Nuevo"');
        const arrayRutasDB = await pool.query('SELECT idRuta FROM rutas ');
        const arrayTestimoniosNuevosDB = await pool.query('SELECT idTestimonio FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');


        const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="Aprobada" ORDER BY fechaSolicitud DESC');
        const arraySolicitudesAprobadasFirmadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="Aprobada" AND firmaContrato= "SI" ORDER BY fechaSolicitud DESC');
        const arraySolicitudesAtrasadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="Aprobada" AND atraso > 0');
        const arraySolicitudesLiquidadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="Liquidado"');
        res.render("panel-administracion", {
            arraySolicitudes: arraySolicitudesDB,
            arrayMensajesNuevos: arrayMensajesNuevosDB,
            arrayRutas: arrayRutasDB,
            arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
            arraySolicitudesAprobadasFirmadas: arraySolicitudesAprobadasFirmadasDB,
            arraySolicitudesAtrasadas: arraySolicitudesAtrasadasDB,
            arraySolicitudesLiquidadas: arraySolicitudesLiquidadasDB,
            arrayTestimoniosNuevos: arrayTestimoniosNuevosDB,
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