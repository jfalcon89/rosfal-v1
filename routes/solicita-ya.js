const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");



router.get('/solicita-ya', (req, res) => {
    res.render('solicita-ya');
})

//INSERTAR NUEVA SOLICITUD A MYSQL****************
router.post("/solicita-ya", async(req, res) => {
    const { cedula, nombre, apellido, sexo, estadoCivil, direccion, direccionNegocio, tiempoNegocio, email, telefono, celular, nacionadlidad, nombreFamilia, direccionFamilia, parentescoFamilia, telefonoFamilia, apodoFamilia, empresa, salario, puesto, dirEmpresa, telefonoEmpresa, departamento, tiempoEmpresa, nombreRefPers1, nombreRefPers2, telefonoRefPer1, telefonoRefPer2, tipoPrestamo, banco, numeroCuenta, montoSolicitado, frecuenciaPagos, cantidadPagosSemanales, cantidadPagosDiarios, cantidadPagosQuincenales, cantidadPagosMensuales } = req.body;

    const nuevaSolicitud = {
        cedula,
        nombre,
        apellido,
        sexo,
        estadoCivil,
        direccion,
        direccionNegocio,
        tiempoNegocio,
        email,
        telefono,
        celular,
        nacionadlidad,
        nombreFamilia,
        direccionFamilia,
        parentescoFamilia,
        telefonoFamilia,
        apodoFamilia,
        empresa,
        salario,
        puesto,
        dirEmpresa,
        telefonoEmpresa,
        departamento,
        tiempoEmpresa,
        nombreRefPers1,
        nombreRefPers2,
        telefonoRefPer1,
        telefonoRefPer2,
        tipoPrestamo,
        banco,
        numeroCuenta,
        montoSolicitado,
        frecuenciaPagos,
        cantidadPagosSemanales,
        cantidadPagosDiarios,
        cantidadPagosQuincenales,
        cantidadPagosMensuales


    };

    await pool.query('INSERT INTO solicitudes set ?', [nuevaSolicitud]);
    // req.flash('success', 'Link guardado correctamente');
    // res.redirect('/');

    res.render('solicita-ya', {
        alert: true,
        alertTitle: "Muchas Gracias",
        alertMessage: "¡SOLICITUD ENVIADA CORRECTAMENTE!",
        alertIcon: 'success',
        showConfirmButton: false,
        timer: 2000,
        ruta: ''
    });

});









module.exports = router;