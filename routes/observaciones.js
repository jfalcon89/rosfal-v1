const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");
const sharp = require("sharp");


// // RENDERIZANDO Y MOSTRANDO TODOS LAS SOLITUDES NUEVAS********************
// router.get('/Solicitudes-nuevas/ver-solicitud/:id', async(req, res) => {
//     if (req.session.loggedin) {


//         const arraySolicitudesDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="nueva" ORDER BY fechaSolicitud DESC');
//         const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="aprobada"');
//         const arraySolicitudesDeclinadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada"');
//         const arraySolicitudesEnRevisionDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision"');
//         res.render("ver-solicitud", {
//             arraySolicitudes: arraySolicitudesDB,
//             arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
//             arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
//             arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
//             login: true,
//             name: req.session.name

//         });

//     } else {
//         res.render('login', {
//             login: false,
//             name: 'Debe iniciar sesión',
//         });
//     }

// });

// router.post('/Solicitudes-nuevas/ver-solicitud/:id', async(req, res) => {
//     // const id = req.params.id;
//     console.log(req.params.id)

//     const { idObs_por_solicitud, observacion } = req.body;

//     const nuevaObservacion = {
//         idObs_por_solicitud,
//         observacion
        
//     };
                        
//     await pool.query("INSERT INTO obs_por_solicitudes set ?", [nuevaObservacion]);
//     // req.flash('success', 'Link actualizado correctamente');
//     res.redirect('/solicitudes-nuevas');
// });



module.exports = router;