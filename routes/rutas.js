const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");


const permiso_A = 'Administrador'
const permiso_B = 'Representante'
const permiso_C = 'Cliente App'

//RENDERIZANDO Y MOSTRANDO TODAS LAS RUTAS CREADAS VISTA RUTAS
router.get('/rutas', async(req, res) => {
    if (req.session.loggedin) {

        const arrayUsuariosDB = await pool.query('SELECT idUsuario FROM users ');
        const arrayClientesDB = await pool.query('SELECT cliente_id FROM app_clientes ');
        const arraySolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
        const arrayMensajesNuevosDB = await pool.query('SELECT idMensaje FROM mensajes WHERE estadoMensaje="Nuevo"');
        const arrayVisitasDB = await pool.query('SELECT idVisita FROM visitas ');
        const arrayTestimoniosNuevosDB = await pool.query('SELECT idTestimonio FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');


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
            name: req.session.name,
            rol: req.session.rol,
            permiso_A,
            permiso_B,
            permiso_C,
            arrayUsuarios: arrayUsuariosDB,
            arrayClientes: arrayClientesDB,
            arraySolicitudes: arraySolicitudesDB,
            arrayMensajesNuevos: arrayMensajesNuevosDB,
            arrayVisitas: arrayVisitasDB,
            arrayTestimoniosNuevos: arrayTestimoniosNuevosDB

        });

    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
            device: req.useragent.isMobile ? 'Mobile' : 'Desktop'
        });
    }

});


//RENDERIZANDO Y MOSTRANDO TODAS LAS RUTAS CREADAS VISTA CREAR RUTA
router.get('/rutas/crear-ruta', async(req, res) => {
    if (req.session.loggedin) {

        const arrayUsuariosDB = await pool.query('SELECT idUsuario FROM users ');
        const arrayClientesDB = await pool.query('SELECT cliente_id FROM app_clientes ');
        const arraySolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
        const arrayMensajesNuevosDB = await pool.query('SELECT idMensaje FROM mensajes WHERE estadoMensaje="Nuevo"');
        const arrayVisitasDB = await pool.query('SELECT idVisita FROM visitas ');
        const arrayTestimoniosNuevosDB = await pool.query('SELECT idTestimonio FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');

        const arrayRutasDB = await pool.query('SELECT * FROM rutas ');
        res.render("crear-ruta", {
            arrayRutas: arrayRutasDB,
            arrayUsuarios: arrayUsuariosDB,
            arrayClientes: arrayClientesDB,
            arraySolicitudes: arraySolicitudesDB,
            arrayMensajesNuevos: arrayMensajesNuevosDB,
            arrayVisitas: arrayVisitasDB,
            arrayTestimoniosNuevos: arrayTestimoniosNuevosDB,
            login: true,
            name: req.session.name,
            rol: req.session.rol,
            permiso_A,
            permiso_B,
            permiso_C

        });


    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
            device: req.useragent.isMobile ? 'Mobile' : 'Desktop'
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
        rol: req.session.rol,
        permiso_A,
        permiso_B,
        permiso_C,
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

        const arrayUsuariosDB = await pool.query('SELECT idUsuario FROM users ');
        const arrayClientesDB = await pool.query('SELECT cliente_id FROM app_clientes ');
        const arraySolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
        const arrayMensajesNuevosDB = await pool.query('SELECT idMensaje FROM mensajes WHERE estadoMensaje="Nuevo"');
        const arrayVisitasDB = await pool.query('SELECT idVisita FROM visitas ');
        const arrayTestimoniosNuevosDB = await pool.query('SELECT idTestimonio FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');

        const arrayRutasDB = await pool.query('SELECT * FROM rutas ');
        res.render('editar-ruta', {
            arrayUsuarios: arrayUsuariosDB,
            arrayClientes: arrayClientesDB,
            arraySolicitudes: arraySolicitudesDB,
            arrayMensajesNuevos: arrayMensajesNuevosDB,
            arrayVisitas: arrayVisitasDB,
            arrayTestimoniosNuevos: arrayTestimoniosNuevosDB,
            arrayRutas: arrayRutasDB,
            login: true,
            name: req.session.name,
            rol: req.session.rol,
            permiso_A,
            permiso_B,
            permiso_C

        });


    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
            device: req.useragent.isMobile ? 'Mobile' : 'Desktop'
        });
    }

})

//EDITAR SOLICITUD EN ESTADO NUEVA ************
router.get("/rutas/editar-ruta/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        console.log(req.params)

        const arrayUsuariosDB = await pool.query('SELECT idUsuario FROM users ');
        const arrayClientesDB = await pool.query('SELECT cliente_id FROM app_clientes ');
        const arraySolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
        const arrayMensajesNuevosDB = await pool.query('SELECT idMensaje FROM mensajes WHERE estadoMensaje="Nuevo"');
        const arrayVisitasDB = await pool.query('SELECT idVisita FROM visitas ');
        const arrayTestimoniosNuevosDB = await pool.query('SELECT idTestimonio FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');

        try {

            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const rutaDB = await pool.query("SELECT * FROM rutas WHERE idRuta = ?", [id]);
            // const eliminarRutaDB = await pool.query("DELETE * FROM rutas WHERE idRuta = ?", [id]);
            console.log(rutaDB[0]);
            res.render("editar-ruta", {
                ruta: rutaDB[0],
                arrayRutas: arrayRutasDB,
                arrayUsuarios: arrayUsuariosDB,
                arrayClientes: arrayClientesDB,
                arraySolicitudes: arraySolicitudesDB,
                arrayMensajesNuevos: arrayMensajesNuevosDB,
                arrayVisitas: arrayVisitasDB,
                arrayTestimoniosNuevos: arrayTestimoniosNuevosDB,
                login: true,
                name: req.session.name,
                rol: req.session.rol,
                permiso_A,
                permiso_B,
                permiso_C
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
            device: req.useragent.isMobile ? 'Mobile' : 'Desktop'
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