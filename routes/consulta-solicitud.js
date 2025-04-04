const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");




router.get('/consulta-solicitud', async(req, res) => {
    const permiso_C = 'Cliente App'

    // try {
    let id = req.url.slice(23)

    if (id == "") {
        id = "Vacio"
    };
    console.log(id)
    console.log(req.url.slice(23))
    const arraySolicitudDB = await pool.query("SELECT tipoPrestamo, montoSolicitado, fechaSolicitud, estadoSolicitud, nombre, apellido, idSolicitud, cedula FROM solicitudes WHERE cedula= ?", [id]);
    const ClienteDB = await pool.query("SELECT telefono, estado_cliente FROM app_clientes WHERE telefono= ?", [req.session.user]);


    console.log(arraySolicitudDB)
    console.log(ClienteDB[0])
    res.render('consulta-solicitud', {
        arraySolicitud: arraySolicitudDB,
        id,
        rol: req.session.rol,
        permiso_C,
        Cliente: ClienteDB[0]
    });

    // } catch (error) {

    //     // const cedula = req.params

    //     // const arraySolicitudDB = await pool.query(`SELECT * FROM solicitudes WHERE cedula=${cedula} `);
    //     console.log(error)
    //     res.render('consulta-solicitud', {
    //         error: true,
    //         mensaje: "no se encuentra el id seleccionado",

    //     });
    // }


});

// router.get('/resul-consulta-solicitud/:cedula', async(req, res) => {

//     const cedula = req.params

//     const arraySolicitudDB = await pool.query(`SELECT * FROM solicitudes WHERE cedula=${cedula} `);

//     res.render('resul-consulta-solicitud', {
//         arraySolicitud: arraySolicitudDB[0]

//     });

// });









module.exports = router;