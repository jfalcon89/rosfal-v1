const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");
const sharp = require("sharp");


//-----------------------NUEVAS----------------------//
// RENDERIZANDO Y MOSTRANDO TODOS LAS SOLITUDES NUEVAS********************
router.get('/solicitudes-nuevas', async(req, res) => {
    if (req.session.loggedin) {


        const arraySolicitudesDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="nueva" ORDER BY fechaSolicitud DESC');
        const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="aprobada"');
        const arraySolicitudesDeclinadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada"');
        const arraySolicitudesEnRevisionDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision"');
        res.render("solicitudes-nuevas", {
            arraySolicitudes: arraySolicitudesDB,
            arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
            arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
            arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
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


//VER SOLICITUD EN ESTADO NUEVA ************
router.get("/Solicitudes-nuevas/ver-solicitud/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        console.log(req.params)

        try {

            const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="aprobada"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);

            console.log(solicitudDB[0]);
            res.render("ver-solicitud", {
                solicitud: solicitudDB[0],
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayRutas: arrayRutasDB,
                login: true,
                name: req.session.name
            });

        } catch (error) {
            console.log(error)
            res.render("ver-solicitud", {
                error: true,
                mensaje: "no se encuentra el id seleccionado"
            });
        }

    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
        });
    }
});


//EDITAR SOLICITUD EN ESTADO NUEVA ************
router.get("/Solicitudes-nuevas/editar-solicitud/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        console.log(req.params)

        try {

            const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="aprobada"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            console.log(solicitudDB[0]);
            res.render("editar-solicitud", {
                solicitud: solicitudDB[0],
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayRutas: arrayRutasDB,
                login: true,
                name: req.session.name
            });

        } catch (error) {
            console.log(error)
            res.render("editar-solicitud", {
                error: true,
                mensaje: "no se encuentra el id seleccionado"
            });
        }

    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
        });
    }
});


//GUARDAR ACTUALIZACION DE SOLICITUD DESDE NUEVAS
router.post('/Solicitudes-nuevas/editar-solicitud/:id', async(req, res) => {
    const id = req.params.id;
    console.log(req.params.id)

    const { cedula, nombre, apellido, sexo, estadoCivil, direccion, direccionNegocio, tiempoNegocio, email, telefono, celular, ocupacion, nacionadlidad, nombreFamilia, direccionFamilia, parentescoFamilia, telefonoFamilia, apodoFamilia, empresa, salario, puesto, dirEmpresa, telefonoEmpresa, departamento, tiempoEmpresa, nombreRefPers1, nombreRefPers2, telefonoRefPer1, telefonoRefPer2, tipoPrestamo, banco, numeroCuenta, montoSolicitado, estadoSolicitud, contrato, ruta, firmaContrato } = req.body;

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
        estadoSolicitud,
        contrato,
        ruta,
        firmaContrato
    };

    await pool.query("UPDATE solicitudes set ? WHERE idSolicitud = ?", [nuevaSolicitud, id]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect('/solicitudes-nuevas');
});


//ELIMINAR SOLICITUD EN ESTADO NUEVA
router.get("/solicitudes/eliminar-solicitud/:id", async(req, res) => {
    const { id } = req.params;

    console.log(id)

    try {

        await pool.query("DELETE FROM solicitudes WHERE idSolicitud = ?", [id]);
        // req.alert('success', 'Link eliminado correctamente');
        res.redirect("/solicitudes-nuevas");



    } catch (error) {
        console.log(error)
    }

});


//-----------------------APROBADAS----------------------//
// RENDERIZANDO Y MOSTRANDO TODOS LAS SOLITUDES APROBADAS********************
router.get('/solicitudes-aprobadas', async(req, res) => {
    if (req.session.loggedin) {

        const arraySolicitudesDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="aprobada" ORDER BY fechaSolicitud DESC');
        const arraySolicitudesNuevasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="nueva"');
        const arraySolicitudesDeclinadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada"');
        const arraySolicitudesEnRevisionDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision"');
        res.render("solicitudes-aprobadas", {
            arraySolicitudes: arraySolicitudesDB,
            arraySolicitudesNuevas: arraySolicitudesNuevasDB,
            arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
            arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
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

//VER SOLICITUD EN ESTADO APROBADAS************
router.get("/Solicitudes-aprobadas/ver-solicitud/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        console.log(req.params)

        try {

            const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="aprobada"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            console.log(solicitudDB[0]);
            res.render("ver-solicitud", {
                solicitud: solicitudDB[0],
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayRutas: arrayRutasDB,
                login: true,
                name: req.session.name
            });

        } catch (error) {
            console.log(error)
            res.render("editar-solicitud", {
                error: true,
                mensaje: "no se encuentra el id seleccionado"
            });
        }

    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
        });
    }
});

//IMPRIMIR SOLICITUD EN ESTADO APROBADAS************
router.get("/Solicitudes-aprobadas/imprimir-solicitud/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        console.log(req.params)

        try {

            const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="aprobada"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            console.log(solicitudDB[0]);
            res.render("imprimir-solicitud", {
                solicitud: solicitudDB[0],
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayRutas: arrayRutasDB,
                login: true,
                name: req.session.name
            });

        } catch (error) {
            console.log(error)
            res.render("imprimir-solicitud", {
                error: true,
                mensaje: "no se encuentra el id seleccionado"
            });
        }

    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
        });
    }
});

//IMPRIMIR SOLICITUD EN ESTADO APROBADAS************
router.get("/Solicitudes-aprobadas/imprimir-contato/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        console.log(req.params)

        try {

            const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="aprobada"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            console.log(solicitudDB[0]);
            res.render("imprimir-contrato", {
                solicitud: solicitudDB[0],
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayRutas: arrayRutasDB,
                login: true,
                name: req.session.name
            });

        } catch (error) {
            console.log(error)
            res.render("imprimir-contrato", {
                error: true,
                mensaje: "no se encuentra el id seleccionado"
            });
        }

    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
        });
    }
});


//EDITAR SOLICITUD EN ESTADO APROBADAS************
router.get("/Solicitudes-aprobadas/editar-solicitud/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        console.log(req.params)

        try {

            const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="Aprobada"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            console.log(solicitudDB[0]);
            res.render("editar-solicitud", {
                solicitud: solicitudDB[0],
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayRutas: arrayRutasDB,
                login: true,
                name: req.session.name
            });

        } catch (error) {
            console.log(error)
            res.render("editar-solicitud", {
                error: true,
                mensaje: "no se encuentra el id seleccionado"
            });
        }

    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
        });
    }
});


//GUARDAR ACTUALIZACION DE SOLICITUD DESDE APROBADAS
router.post('/Solicitudes-aprobadas/editar-solicitud/:id', async(req, res) => {
    const id = req.params.id;
    console.log(req.params.id)

    const { cedula, nombre, apellido, sexo, estadoCivil, direccion, direccionNegocio, tiempoNegocio, email, telefono, celular, ocupacion, nacionadlidad, nombreFamilia, direccionFamilia, parentescoFamilia, telefonoFamilia, apodoFamilia, empresa, salario, puesto, dirEmpresa, telefonoEmpresa, departamento, tiempoEmpresa, nombreRefPers1, nombreRefPers2, telefonoRefPer1, telefonoRefPer2, tipoPrestamo, banco, numeroCuenta, montoSolicitado, estadoSolicitud, contrato, ruta, firmaContrato } = req.body;

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
        estadoSolicitud,
        contrato,
        ruta,
        firmaContrato
    };

    await pool.query("UPDATE solicitudes set ? WHERE idSolicitud = ?", [nuevaSolicitud, id]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect('/solicitudes-aprobadas');
});


//-----------------------DECLINADAS----------------------//
// RENDERIZANDO Y MOSTRANDO TODOS LAS SOLITUDES DECLINADAS********************
router.get('/solicitudes-declinadas', async(req, res) => {
    if (req.session.loggedin) {

        const arraySolicitudesDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada" ORDER BY fechaSolicitud DESC');
        const arraySolicitudesNuevasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="nueva"');
        const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="aprobada"');
        const arraySolicitudesEnRevisionDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision"');
        res.render("solicitudes-declinadas", {
            arraySolicitudes: arraySolicitudesDB,
            arraySolicitudesNuevas: arraySolicitudesNuevasDB,
            arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
            arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
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


//EDITAR SOLICITUD EN ESTADO DECLINADAS************
router.get("/Solicitudes-declinadas/ver-solicitud/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        console.log(req.params)

        try {

            const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="aprobada"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            console.log(solicitudDB[0]);
            res.render("ver-solicitud", {
                solicitud: solicitudDB[0],
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayRutas: arrayRutasDB,
                login: true,
                name: req.session.name
            });

        } catch (error) {
            console.log(error)
            res.render("editar-solicitud", {
                error: true,
                mensaje: "no se encuentra el id seleccionado"
            });
        }

    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
        });
    }
});



//EDITAR SOLICITUD EN ESTADO DECLINADAS************
router.get("/Solicitudes-declinadas/editar-solicitud/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        console.log(req.params)

        try {

            const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="aprobada"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            console.log(solicitudDB[0]);
            res.render("editar-solicitud", {
                solicitud: solicitudDB[0],
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayRutas: arrayRutasDB,
                login: true,
                name: req.session.name
            });

        } catch (error) {
            console.log(error)
            res.render("editar-solicitud", {
                error: true,
                mensaje: "no se encuentra el id seleccionado"
            });
        }

    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
        });
    }
});

//GUARDAR ACTUALIZACION DE SOLICITUD DESDE DECLINADAS
router.post('/Solicitudes-declinadas/editar-solicitud/:id', async(req, res) => {
    const id = req.params.id;
    console.log(req.params.id)

    const { cedula, nombre, apellido, sexo, estadoCivil, direccion, direccionNegocio, tiempoNegocio, email, telefono, celular, ocupacion, nacionadlidad, nombreFamilia, direccionFamilia, parentescoFamilia, telefonoFamilia, apodoFamilia, empresa, salario, puesto, dirEmpresa, telefonoEmpresa, departamento, tiempoEmpresa, nombreRefPers1, nombreRefPers2, telefonoRefPer1, telefonoRefPer2, tipoPrestamo, banco, numeroCuenta, montoSolicitado, estadoSolicitud, contrato, ruta, firmaContrato } = req.body;

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
        estadoSolicitud,
        contrato,
        ruta,
        firmaContrato
    };

    await pool.query("UPDATE solicitudes set ? WHERE idSolicitud = ?", [nuevaSolicitud, id]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect('/solicitudes-declinadas');
});


//-----------------------EN REVISION----------------------//
// RENDERIZANDO Y MOSTRANDO TODOS LAS SOLITUDES NUEVAS********************
router.get('/solicitudes-en-revision', async(req, res) => {
    if (req.session.loggedin) {

        const arraySolicitudesDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision" ORDER BY fechaSolicitud DESC');
        const arraySolicitudesNuevasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="nueva"');
        const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="aprobada"');
        const arraySolicitudesDeclinadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada"');
        res.render("solicitudes-en-revision", {
            arraySolicitudes: arraySolicitudesDB,
            arraySolicitudesNuevas: arraySolicitudesNuevasDB,
            arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
            arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
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

//VER SOLICITUD EN ESTADO DECLINADAS************
router.get("/Solicitudes-en-revision/ver-solicitud/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        console.log(req.params)

        try {

            const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="aprobada"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            console.log(solicitudDB[0]);
            res.render("ver-solicitud", {
                solicitud: solicitudDB[0],
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayRutas: arrayRutasDB,
                login: true,
                name: req.session.name
            });

        } catch (error) {
            console.log(error)
            res.render("editar-solicitud", {
                error: true,
                mensaje: "no se encuentra el id seleccionado"
            });
        }

    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
        });
    }
});


//EDITAR SOLICITUD EN ESTADO EN REVISION************
router.get("/Solicitudes-en-revision/editar-solicitud/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        console.log(req.params)

        try {

            const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="aprobada"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            console.log(solicitudDB[0]);
            res.render("editar-solicitud", {
                solicitud: solicitudDB[0],
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayRutas: arrayRutasDB,
                login: true,
                name: req.session.name
            });

        } catch (error) {
            console.log(error)
            res.render("editar-solicitud", {
                error: true,
                mensaje: "no se encuentra el id seleccionado"
            });
        }

    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
        });
    }
});

//GUARDAR ACTUALIZACION DE SOLICITUD DESDE EN REVISION
router.post('/Solicitudes-en-revision/editar-solicitud/:id', async(req, res) => {
    const id = req.params.id;
    console.log(req.params.id)

    const { cedula, nombre, apellido, sexo, estadoCivil, direccion, direccionNegocio, tiempoNegocio, email, telefono, celular, ocupacion, nacionadlidad, nombreFamilia, direccionFamilia, parentescoFamilia, telefonoFamilia, apodoFamilia, empresa, salario, puesto, dirEmpresa, telefonoEmpresa, departamento, tiempoEmpresa, nombreRefPers1, nombreRefPers2, telefonoRefPer1, telefonoRefPer2, tipoPrestamo, banco, numeroCuenta, montoSolicitado, estadoSolicitud, contrato, ruta, firmaContrato } = req.body;

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
        estadoSolicitud,
        contrato,
        ruta,
        firmaContrato
    };

    await pool.query("UPDATE solicitudes set ? WHERE idSolicitud = ?", [nuevaSolicitud, id]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect('/solicitudes-en-revision');
});












module.exports = router;