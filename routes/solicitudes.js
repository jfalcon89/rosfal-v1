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
        
        const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
        const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada"');
        const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
        const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
        res.render("solicitudes-nuevas", {
            arraySolicitudes: arraySolicitudesDB,
            arrayTotalSolicitudes: arrayTotalSolicitudesDB,
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


//VER SOLICITUD EN ESTADO NUEVA *************
router.get("/Solicitudes-nuevas/ver-solicitud/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        

        try {

            const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
            const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayObservacionesDB = await pool.query(`SELECT observacion, name, fechaObservacion FROM obs_por_solicitudes, solicitudes WHERE solicitudes.idSolicitud = obs_por_solicitudes.idSolicitud and obs_por_solicitudes.idSolicitud = ${id} `);
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);

            // console.log(solicitudDB[0]);
            res.render("ver-solicitud", {
                solicitud: solicitudDB[0],
                arrayTotalSolicitudes: arrayTotalSolicitudesDB,
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayObservaciones: arrayObservacionesDB,
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
        // console.log(req.params)

        try {

            const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
            const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayObservacionesDB = await pool.query(`SELECT observacion, name, fechaObservacion FROM obs_por_solicitudes, solicitudes WHERE solicitudes.idSolicitud = obs_por_solicitudes.idSolicitud and obs_por_solicitudes.idSolicitud = ${id} `);
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            // console.log(solicitudDB[0]);
            res.render("editar-solicitud", {
                solicitud: solicitudDB[0],
                arrayTotalSolicitudes: arrayTotalSolicitudesDB,
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayObservaciones: arrayObservacionesDB,
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
    // console.log(req.params.id)

    const { cedula, nombre, apellido, sexo, estadoCivil, direccion, direccionNegocio, tiempoNegocio, email, telefono, celular, nacionadlidad, nombreFamilia, direccionFamilia, parentescoFamilia, telefonoFamilia, apodoFamilia, empresa, salario, puesto, dirEmpresa, telefonoEmpresa, departamento, tiempoEmpresa, nombreRefPers1, nombreRefPers2, telefonoRefPer1, telefonoRefPer2, tipoPrestamo, banco, numeroCuenta, montoSolicitado, estadoSolicitud, contrato, ruta, firmaContrato } = req.body;

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
        estadoSolicitud,
        contrato,
        ruta,
        firmaContrato
    };

    await pool.query("UPDATE solicitudes set ? WHERE idSolicitud = ?", [nuevaSolicitud, id]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect(`/Solicitudes-nuevas/editar-solicitud/${req.params.id}`);
});

// INSERTAR OBSERVACIONES SOLICITUDES NUEVAS
router.post('/Solicitudes-nuevas/ver-solicitud/:id', async(req, res) => {
       // const id = req.params.id;
    //    console.log(req.params.id)

       const { idSolicitud, observacion,name } = req.body;
   
       const nuevaObservacion = {
        idSolicitud,
           observacion,
           name
           
       };
                           
       await pool.query("INSERT INTO obs_por_solicitudes set ?", [nuevaObservacion]);
       // req.flash('success', 'Link actualizado correctamente');
       res.redirect(`/Solicitudes-nuevas/ver-solicitud/${req.params.id}`);
   });


//ELIMINAR SOLICITUD EN ESTADO NUEVA
router.get("/solicitudes/eliminar-solicitud/:id", async(req, res) => {
    const { id } = req.params;

    // console.log(id)

    try {

        await pool.query(`DELETE FROM obs_por_solicitudes WHERE obs_por_solicitudes.idSolicitud = ${id} `);
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
        
        const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
        const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
        const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
        const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
        res.render("solicitudes-aprobadas", {
            arraySolicitudes: arraySolicitudesDB,
            arrayTotalSolicitudes: arrayTotalSolicitudesDB,
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
        // console.log(req.params)
       

        try {

            const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
            const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayObservacionesDB = await pool.query(`SELECT observacion, name, fechaObservacion FROM obs_por_solicitudes, solicitudes WHERE solicitudes.idSolicitud = obs_por_solicitudes.idSolicitud and obs_por_solicitudes.idSolicitud = ${id} `);
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            // console.log(solicitudDB[0]);
            res.render("ver-solicitud", {
                solicitud: solicitudDB[0],
                arrayTotalSolicitudes: arrayTotalSolicitudesDB,
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayObservaciones: arrayObservacionesDB,
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
        // console.log(req.params)

        try {

            // const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada"');
            // const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
            // const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
            // const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            // console.log(solicitudDB[0]);
            res.render("imprimir-solicitud", {
                solicitud: solicitudDB[0],
                // arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                // arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                // arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                // arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
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

//IMPRIMIR CONTRATO EN ESTADO APROBADAS************
router.get("/Solicitudes-aprobadas/imprimir-contato/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        // console.log(req.params)

        try {

            // const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="aprobada"');
            // const arraySolicitudesNuevasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="nueva"');
            // const arraySolicitudesDeclinadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada"');
            // const arraySolicitudesEnRevisionDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            // console.log(solicitudDB[0]);
            res.render("imprimir-contrato", {
                solicitud: solicitudDB[0],
                // arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                // arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                // arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                // arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
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
        // console.log(req.params)

        try {

            const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
            const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="Aprobada"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayObservacionesDB = await pool.query(`SELECT observacion, name, fechaObservacion FROM obs_por_solicitudes, solicitudes WHERE solicitudes.idSolicitud = obs_por_solicitudes.idSolicitud and obs_por_solicitudes.idSolicitud = ${id} `);
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            // console.log(solicitudDB[0]);
            res.render("editar-solicitud", {
                solicitud: solicitudDB[0],
                arrayTotalSolicitudes: arrayTotalSolicitudesDB,
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayObservaciones: arrayObservacionesDB,
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
    // console.log(req.params.id)

    const { cedula, nombre, apellido, sexo, estadoCivil, direccion, direccionNegocio, tiempoNegocio, email, telefono, celular, nacionadlidad, nombreFamilia, direccionFamilia, parentescoFamilia, telefonoFamilia, apodoFamilia, empresa, salario, puesto, dirEmpresa, telefonoEmpresa, departamento, tiempoEmpresa, nombreRefPers1, nombreRefPers2, telefonoRefPer1, telefonoRefPer2, tipoPrestamo, banco, numeroCuenta, montoSolicitado, estadoSolicitud, contrato, ruta, firmaContrato } = req.body;

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
        estadoSolicitud,
        contrato,
        ruta,
        firmaContrato
    };

    await pool.query("UPDATE solicitudes set ? WHERE idSolicitud = ?", [nuevaSolicitud, id]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect(`/Solicitudes-aprobadas/editar-solicitud/${req.params.id}`);
});

// INSERTAR OBSERVACIONES SOLICITUDES APROBADAS
router.post('/Solicitudes-aprobadas/ver-solicitud/:id', async(req, res) => {
    // const id = req.params.id;
    // console.log(req.params.id)

    const { idSolicitud, observacion,name } = req.body;
   
    const nuevaObservacion = {
     idSolicitud,
        observacion,
        name
        
    };
                        
    await pool.query("INSERT INTO obs_por_solicitudes set ?", [nuevaObservacion]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect(`/Solicitudes-aprobadas/ver-solicitud/${req.params.id}`);
});


//-----------------------DECLINADAS----------------------//
// RENDERIZANDO Y MOSTRANDO TODOS LAS SOLITUDES DECLINADAS********************
router.get('/solicitudes-declinadas', async(req, res) => {
    if (req.session.loggedin) {

        const arraySolicitudesDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada" ORDER BY fechaSolicitud DESC');
        
        const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
        const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
        const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada"');
        const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
        res.render("solicitudes-declinadas", {
            arraySolicitudes: arraySolicitudesDB,
            arrayTotalSolicitudes: arrayTotalSolicitudesDB,
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
        // console.log(req.params)

        try {

            const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
            const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayObservacionesDB = await pool.query(`SELECT observacion, name, fechaObservacion FROM obs_por_solicitudes, solicitudes WHERE solicitudes.idSolicitud = obs_por_solicitudes.idSolicitud and obs_por_solicitudes.idSolicitud = ${id} `);
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            // console.log(solicitudDB[0]);
            res.render("ver-solicitud", {
                solicitud: solicitudDB[0],
                arrayTotalSolicitudes: arrayTotalSolicitudesDB,
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayObservaciones: arrayObservacionesDB,
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
        // console.log(req.params)

        try {

            const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
            const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayObservacionesDB = await pool.query(`SELECT observacion, name, fechaObservacion FROM obs_por_solicitudes, solicitudes WHERE solicitudes.idSolicitud = obs_por_solicitudes.idSolicitud and obs_por_solicitudes.idSolicitud = ${id} `);
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            // console.log(solicitudDB[0]);
            res.render("editar-solicitud", {
                solicitud: solicitudDB[0],
                arrayTotalSolicitudes: arrayTotalSolicitudesDB,
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayObservaciones: arrayObservacionesDB,
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
    // console.log(req.params.id)

    const { cedula, nombre, apellido, sexo, estadoCivil, direccion, direccionNegocio, tiempoNegocio, email, telefono, celular,  nacionadlidad, nombreFamilia, direccionFamilia, parentescoFamilia, telefonoFamilia, apodoFamilia, empresa, salario, puesto, dirEmpresa, telefonoEmpresa, departamento, tiempoEmpresa, nombreRefPers1, nombreRefPers2, telefonoRefPer1, telefonoRefPer2, tipoPrestamo, banco, numeroCuenta, montoSolicitado, estadoSolicitud, contrato, ruta, firmaContrato } = req.body;

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
        estadoSolicitud,
        contrato,
        ruta,
        firmaContrato
    };

    await pool.query("UPDATE solicitudes set ? WHERE idSolicitud = ?", [nuevaSolicitud, id]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect(`/Solicitudes-declinadas/editar-solicitud/${req.params.id}`);
});

// INSERTAR OBSERVACIONES SOLICITUDES DECLINADAS
router.post('/Solicitudes-declinadas/ver-solicitud/:id', async(req, res) => {
    // const id = req.params.id;
    // console.log(req.params.id)

    const { idSolicitud, observacion,name } = req.body;
   
    const nuevaObservacion = {
     idSolicitud,
        observacion,
        name
        
    };
                        
    await pool.query("INSERT INTO obs_por_solicitudes set ?", [nuevaObservacion]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect(`/Solicitudes-declinadas/ver-solicitud/${req.params.id}`);
});


//-----------------------EN REVISION----------------------//
// RENDERIZANDO Y MOSTRANDO TODOS LAS SOLITUDES NUEVAS********************
router.get('/solicitudes-en-revision', async(req, res) => {
    if (req.session.loggedin) {

        const arraySolicitudesDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision" ORDER BY fechaSolicitud DESC');
        
        const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
        const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
        const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada"');
        const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
        res.render("solicitudes-en-revision", {
            arraySolicitudes: arraySolicitudesDB,
            arrayTotalSolicitudes: arrayTotalSolicitudesDB,
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

//VER SOLICITUD EN ESTADO EN REVISION************
router.get("/Solicitudes-en-revision/ver-solicitud/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        // console.log(req.params)

        try {

            const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
            const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayObservacionesDB = await pool.query(`SELECT observacion, name, fechaObservacion FROM obs_por_solicitudes, solicitudes WHERE solicitudes.idSolicitud = obs_por_solicitudes.idSolicitud and obs_por_solicitudes.idSolicitud = ${id} `);
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            // console.log(solicitudDB[0]);
            res.render("ver-solicitud", {
                solicitud: solicitudDB[0],
                arrayTotalSolicitudes: arrayTotalSolicitudesDB,
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayObservaciones: arrayObservacionesDB,
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
        // console.log(req.params)

        try {

            const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
            const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayObservacionesDB = await pool.query(`SELECT observacion, name, fechaObservacion FROM obs_por_solicitudes, solicitudes WHERE solicitudes.idSolicitud = obs_por_solicitudes.idSolicitud and obs_por_solicitudes.idSolicitud = ${id} `);
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            // console.log(solicitudDB[0]);
            res.render("editar-solicitud", {
                solicitud: solicitudDB[0],
                arrayTotalSolicitudes: arrayTotalSolicitudesDB,
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayObservaciones: arrayObservacionesDB,
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

//GUARDAR ACTUALIZACION DE SOLICITUD EN REVISION
router.post('/Solicitudes-en-revision/editar-solicitud/:id', async(req, res) => {
    const id = req.params.id;
    // console.log(req.params.id)

    const { cedula, nombre, apellido, sexo, estadoCivil, direccion, direccionNegocio, tiempoNegocio, email, telefono, celular, nacionadlidad, nombreFamilia, direccionFamilia, parentescoFamilia, telefonoFamilia, apodoFamilia, empresa, salario, puesto, dirEmpresa, telefonoEmpresa, departamento, tiempoEmpresa, nombreRefPers1, nombreRefPers2, telefonoRefPer1, telefonoRefPer2, tipoPrestamo, banco, numeroCuenta, montoSolicitado, estadoSolicitud, contrato, ruta, firmaContrato } = req.body;

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
        estadoSolicitud,
        contrato,
        ruta,
        firmaContrato
    };

    await pool.query("UPDATE solicitudes set ? WHERE idSolicitud = ?", [nuevaSolicitud, id]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect(`/Solicitudes-en-revision/editar-solicitud/${req.params.id}`);
});

// INSERTAR OBSERVACIONES SOLICITUDES EN REVISION
router.post('/Solicitudes-en-revision/ver-solicitud/:id', async(req, res) => {
    // const id = req.params.id;
    // console.log(req.params.id)

    const { idSolicitud, observacion,name } = req.body;
   
    const nuevaObservacion = {
     idSolicitud,
        observacion,
        name
        
    };
                        
    await pool.query("INSERT INTO obs_por_solicitudes set ?", [nuevaObservacion]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect(`/Solicitudes-en-revision/ver-solicitud/${req.params.id}`);
});



// RENDERIZANDO Y MOSTRANDO TODOS LAS SOLITUDES ********************
router.get('/todas-las-solicitudes', async(req, res) => {
    if (req.session.loggedin) {

        const arrayTotalSolicitudesDB = await pool.query('SELECT * FROM solicitudes  ORDER BY fechaSolicitud DESC');

        const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva" ');
        const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada"');
        const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
        const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
        res.render("todas-las-solicitudes", {
            arrayTotalSolicitudes: arrayTotalSolicitudesDB,
            arraySolicitudesNuevas: arraySolicitudesNuevasDB,
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











module.exports = router;