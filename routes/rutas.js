const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");


//RENDERIZANDO Y MOSTRANDO TODAS LAS RUTAS CREADAS VISTA RUTAS
// router.get('/rutas', (req, res) => {
//     res.render('rutas');
// })
//RENDERIZANDO Y MOSTRANDO TODAS LAS RUTAS CREADAS VISTA RUTAS
router.get('/rutas', async(req, res) => {
    if (req.session.loggedin) {


        const arrayRutasDB = await pool.query('SELECT * FROM rutas ');
        const rutaDB = await pool.query('SELECT * FROM rutas ');
        // const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="aprobada"');
        // const arraySolicitudesDeclinadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada"');
        // const arraySolicitudesEnRevisionDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision"');
        console.log(arrayRutasDB)
        res.render("rutas", {
            arrayRutas: arrayRutasDB,
            ruta: rutaDB[0],
            // arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
            // arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
            // arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
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


//RENDERIZANDO Y MOSTRANDO TODAS LAS RUTAS CREADAS VISTA CREAR RUTA
router.get('/rutas/crear-ruta', async(req, res) => {
    if (req.session.loggedin) {

        // res.render("crear-ruta")

        const arrayRutasDB = await pool.query('SELECT * FROM rutas ');
        res.render("crear-ruta", {
            arrayRutas: arrayRutasDB,
            login: true,
            name: req.session.name

        });


    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
        });
    }

})


//CREANDO NUEVA RUTA ****************
router.post("/rutas/crear-ruta", async(req, res) => {
    const { nombreRuta, fechaCreacion, estadoRuta } = req.body;

    const nuevaRuta = {
        nombreRuta,
        fechaCreacion,
        estadoRuta

    };

    const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

    await pool.query('INSERT INTO rutas set ?', [nuevaRuta]);
    // req.flash('success', 'Link guardado correctamente');
    // res.redirect('/');

    res.render('crear-ruta', {
        login: true,
        name: req.session.name,
        arrayRutas: arrayRutasDB,
        alert: true,
        alertTitle: "Excelente !!",
        alertMessage: "¡RUTA CREADA CORRECTAMENTE!",
        alertIcon: 'success',
        showConfirmButton: false,
        timer: 2000,
        ruta: 'rutas'
    });

});



//RENDERIZANDO Y MOSTRANDO TODAS LAS RUTAS CREADAS VISTA EDITAR RUTA
router.get('/rutas/editar-ruta', async(req, res) => {
    if (req.session.loggedin) {



        const arrayRutasDB = await pool.query('SELECT * FROM rutas ');
        res.render('editar-ruta', {
            arrayRutas: arrayRutasDB,
            login: true,
            name: req.session.name

        });


    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
        });
    }

})

//EDITAR SOLICITUD EN ESTADO NUEVA ************
router.get("/rutas/editar-ruta/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        console.log(req.params)

        try {

            // const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="aprobada"');
            // const arraySolicitudesNuevasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="nueva"');
            // const arraySolicitudesDeclinadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada"');
            // const arraySolicitudesEnRevisionDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision"');

            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const rutaDB = await pool.query("SELECT * FROM rutas WHERE idRuta = ?", [id]);
            // const eliminarRutaDB = await pool.query("DELETE * FROM rutas WHERE idRuta = ?", [id]);
            console.log(rutaDB[0]);
            res.render("editar-ruta", {
                ruta: rutaDB[0],
                arrayRutas: arrayRutasDB,
                // eliminarRuta: eliminarRutaDB[0],
                // arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                // arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                // arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                // arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                login: true,
                name: req.session.name
            });

        } catch (error) {
            console.log(error)
            res.render("editar-ruta", {
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
router.post('/rutas/editar-ruta/:id', async(req, res) => {
    const id = req.params.id;
    console.log(req.params.id)

    const { nombreRuta, fechaCreacion, estadoRuta } = req.body;

    const nuevaRuta = {
        nombreRuta,
        fechaCreacion,
        estadoRuta

    };

    await pool.query("UPDATE rutas set ? WHERE idRuta = ?", [nuevaRuta, id]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect('/rutas');
});


//ELIMINAR RUTA 
router.get("/rutas/eliminar-ruta/:id", async(req, res) => {
    const { id } = req.params;

    console.log(id)

    try {

        await pool.query("DELETE FROM rutas WHERE idRuta = ?", [id]);
        // req.flash('success', 'Link eliminado correctamente');
        res.redirect("/rutas");

    } catch (error) {
        console.log(error)
    }

});










module.exports = router;