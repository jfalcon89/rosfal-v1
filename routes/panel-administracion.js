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

        let i = 0



        const arraySolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
        const arrayMensajesNuevosDB = await pool.query('SELECT idMensaje FROM mensajes WHERE estadoMensaje="Nuevo"');
        const arrayRutasDB = await pool.query('SELECT idRuta FROM rutas ');
        const arrayTestimoniosNuevosDB = await pool.query('SELECT idTestimonio FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');

        const montoPrestadoDB = await pool.query("SELECT SUM(montoSolicitado) montoPrestado FROM solicitudes WHERE estadoSolicitud = 'Aprobada' OR estadoSolicitud = 'En Legal'")
        const montoLiquidadoDB = await pool.query("SELECT SUM(montoSolicitado) montoLiquidado FROM solicitudes WHERE estadoSolicitud = 'Liquidado'")
        const cantPrestamosDB = await pool.query("SELECT COUNT(idSolicitud) cantPrestamos FROM solicitudes WHERE estadoSolicitud = 'Aprobada' OR estadoSolicitud = 'En Legal'")
        const prestamosAtrasosDB = await pool.query("SELECT SUM(atraso) prestamosAtrasos FROM solicitudes WHERE estadoSolicitud = 'Aprobada' AND atraso > 0")
        const prestamosEnLegalDB = await pool.query("SELECT SUM(legalMonto) prestamosEnLegal FROM solicitudes WHERE estadoSolicitud = 'En Legal' AND legalMonto > 0")
        const cantAtrasosDB = await pool.query("SELECT COUNT(idSolicitud) cantAtrasos FROM solicitudes WHERE estadoSolicitud = 'Aprobada' AND atraso > 0")


        const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="Aprobada" OR estadoSolicitud = "En Legal" ORDER BY fechaSolicitud DESC');
        const arraySolicitudesAprobadasFirmadasDB = await pool.query('SELECT * FROM solicitudes WHERE firmaContrato="NO" AND (estadoSolicitud="Aprobada" OR estadoSolicitud ="En Legal")');
        const arraySolicitudesAtrasadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="Aprobada" AND atraso > 0');
        const arrayNotificacionAtrasoDB = await pool.query(`SELECT novedades_atrasos.idSolicitud, idNovedadAtraso, solicitudes.nombre, solicitudes.apellido, novedades_atrasos.celular, novedades_atrasos.ruta, novedades_atrasos.atraso, fechaNovedad  FROM novedades_atrasos, solicitudes WHERE novedades_atrasos.idSolicitud = solicitudes.idSolicitud ORDER BY fechaNovedad DESC`);
        const arraySolicitudesEnLegalDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Legal"');
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
            montoPrestado: montoPrestadoDB[0].montoPrestado,
            cantPrestamos: cantPrestamosDB[0].cantPrestamos,
            prestamosAtrasos: prestamosAtrasosDB[0].prestamosAtrasos,
            prestamosEnLegal: prestamosEnLegalDB[0].prestamosEnLegal,
            cantAtrasos: cantAtrasosDB[0].cantAtrasos,
            montoLiquidado: montoLiquidadoDB[0].montoLiquidado,
            arrayNotificacionAtraso: arrayNotificacionAtrasoDB,
            arraySolicitudesEnLegal: arraySolicitudesEnLegalDB,
            i,
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



router.post('/panel-administracion', async(req, res) => {
    const idSolicitud = req.body.idSolicitud;
    const celular = req.body.celular;
    const ruta = req.body.ruta;
    const atraso = req.body.atraso;

    const novedadAtraso = { idSolicitud, celular, ruta, atraso }
    console.log(novedadAtraso)

    await pool.query("INSERT INTO novedades_atrasos set ?", [novedadAtraso]);


    res.redirect(`panel-administracion`);
});



// function miFuncion() {
//     console.log("¡Hola en 5 segundos!");
// }

// setTimeout(miFuncion, 5000);








module.exports = router;