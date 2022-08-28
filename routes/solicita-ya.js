const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");



router.get('/solicita-ya', (req, res) => {
    res.render('solicita-ya');
})

//INSERTAR NUEVO EMPLEADO A MYSQL****************
router.post("/solicita-ya", async(req, res) => {
    const { cedula, nombre, apellido, sexo, estadoCivil, direccion, direccionNegocio, email, telefono, celular, ocupacion, nacionadlidad, nombreFamilia, direccionFamilia, parentescoFamilia, telefonoFamilia, apodoFamilia, empresa, salario, puesto, dirEmpresa, telefonoEmpresa, departamento, tiempoEmpresa, nombreRefPers1, nombreRefPers2, telefonoRefPer1, telefonoRefPer2, tipoPrestamo, banco, numeroCuenta, montoSolicitado, estadoSolicitud } = req.body;

    const nuevaSolicitud = {
        cedula,
        nombre,
        apellido,
        sexo,
        estadoCivil,
        direccion,
        direccionNegocio,
        email,
        telefono,
        celular,
        ocupacion,
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
        estadoSolicitud
    };

    await pool.query('INSERT INTO solicitudes set ?', [nuevaSolicitud]);
    // req.flash('success', 'Link guardado correctamente');
    res.redirect('/');

});









module.exports = router;