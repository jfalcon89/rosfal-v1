const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");


// 1
// RENDERIZANDO Y MOSTRANDO TODOS LOS MENSAJES NUEVOS
router.get('/mensajes', async(req, res) => {
    if (req.session.loggedin) {

        const permiso_A = 'Administrador'
        const permiso_B = 'Representante'
        const permiso_C = 'Cliente App'
        const arrayUsuarios = await pool.query('SELECT idUsuario FROM users ');
        const arrayClientes = await pool.query('SELECT cliente_id FROM app_clientes ');
        const arraySolicitudes = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
        const arrayMensajesNuevos = await pool.query('SELECT idMensaje FROM mensajes WHERE estadoMensaje="Nuevo"');
        const arrayVisitas = await pool.query('SELECT idVisita FROM visitas ');
        const arrayTestimoniosNuevos = await pool.query('SELECT idTestimonio FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');

        const arrayMensajesDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Nuevo" ORDER BY fechaMensaje DESC');
        const arrayMensajesLeidosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Leido" ');
        const arrayMensajesNoLeidosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="No Leido" ');

        res.render("mensajes", {
            arrayMensajes: arrayMensajesDB,
            arrayMensajesLeidos: arrayMensajesLeidosDB,
            arrayMensajesNoLeidos: arrayMensajesNoLeidosDB,
            login: true,
            name: req.session.name,
            rol: req.session.rol,
            permiso_A,
            permiso_B,
            permiso_C,
            arrayUsuarios,
            arrayClientes,
            arraySolicitudes,
            arrayMensajesNuevos,
            arrayVisitas,
            arrayTestimoniosNuevos



        });

    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
        });
    }

});



//VER MENSAJE NUEVO ************
router.get("/mensajes/ver-mensaje-nuevo/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        console.log(req.params)

        try {

            const permiso_A = 'Administrador'
            const permiso_B = 'Representante'
            const permiso_C = 'Cliente App'
            const arrayUsuarios = await pool.query('SELECT idUsuario FROM users ');
            const arrayClientes = await pool.query('SELECT cliente_id FROM app_clientes ');
            const arraySolicitudes = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arrayMensajesNuevos = await pool.query('SELECT idMensaje FROM mensajes WHERE estadoMensaje="Nuevo"');
            const arrayVisitas = await pool.query('SELECT idVisita FROM visitas ');
            const arrayTestimoniosNuevos = await pool.query('SELECT idTestimonio FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');

            const arrayMensajesLeidosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Leido" ');
            const arrayMensajesNoLeidosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="No Leido" ');

            const arrayMensajesDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Nuevo" ORDER BY fechaMensaje DESC');
            const mensajeDB = await pool.query("SELECT * FROM mensajes WHERE idMensaje = ?", [id]);
            console.log(mensajeDB[0]);
            res.render("ver-mensaje-nuevo", {
                mensaje: mensajeDB[0],
                arrayMensajes: arrayMensajesDB,
                arrayMensajesLeidos: arrayMensajesLeidosDB,
                arrayMensajesNoLeidos: arrayMensajesNoLeidosDB,
                login: true,
                name: req.session.name,
                rol: req.session.rol,
                permiso_A,
                permiso_B,
                permiso_C,
                arrayUsuarios,
                arrayClientes,
                arraySolicitudes,
                arrayMensajesNuevos,
                arrayVisitas,
                arrayTestimoniosNuevos
            });

        } catch (error) {
            console.log(error)
            res.render("ver-mensaje-nuevo", {
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


//GUARDAR ACTUALIZACION DE MENSAJE NUEVO
router.post('/mensajes/ver-mensaje-nuevo/:id', async(req, res) => {
    const id = req.params.id;
    console.log(req.params.id)

    const { estadoMensaje } = req.body;

    const nuevoMensaje = {
        estadoMensaje

    };

    await pool.query("UPDATE mensajes set ? WHERE idMensaje = ?", [nuevoMensaje, id]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect('/mensajes');
});

//ELIMINAR MENSAJE NUEVO
router.get("/mensajes/eliminar-mensaje/:id", async(req, res) => {
    const { id } = req.params;

    console.log(id)

    try {

        await pool.query("DELETE FROM mensajes WHERE idMensaje = ?", [id]);
        // req.flash('success', 'Link eliminado correctamente');
        res.redirect("/mensajes");



    } catch (error) {
        console.log(error)
    }

});


// 2
// RENDERIZANDO Y MOSTRANDO MENSAJES NO LEIDOS 
router.get('/mensajes-no-leidos', async(req, res) => {
    if (req.session.loggedin) {



        const permiso_A = 'Administrador'
        const permiso_B = 'Representante'
        const permiso_C = 'Cliente App'
        const arrayUsuarios = await pool.query('SELECT idUsuario FROM users ');
        const arrayClientes = await pool.query('SELECT cliente_id FROM app_clientes ');
        const arraySolicitudes = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
        const arrayMensajesNuevos = await pool.query('SELECT idMensaje FROM mensajes WHERE estadoMensaje="Nuevo"');
        const arrayVisitas = await pool.query('SELECT idVisita FROM visitas ');
        const arrayTestimoniosNuevos = await pool.query('SELECT idTestimonio FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');

        const arrayMensajesDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="No Leido" ORDER BY fechaMensaje DESC');
        const arrayMensajesLeidosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Leido" ');

        res.render("mensajes-no-leidos", {
            arrayMensajes: arrayMensajesDB,
            arrayMensajesLeidos: arrayMensajesLeidosDB,
            login: true,
            name: req.session.name,
            rol: req.session.rol,
            permiso_A,
            permiso_B,
            permiso_C,
            arrayUsuarios,
            arrayClientes,
            arraySolicitudes,
            arrayMensajesNuevos,
            arrayVisitas,
            arrayTestimoniosNuevos

        });

    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
        });
    }

});


//VER MENSAJE NO LEIDO ************
router.get("/mensajes-no-leidos/ver-mensaje-no-leido/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        console.log(req.params)

        try {

            const permiso_A = 'Administrador'
            const permiso_B = 'Representante'
            const permiso_C = 'Cliente App'
            const arrayUsuarios = await pool.query('SELECT idUsuario FROM users ');
            const arrayClientes = await pool.query('SELECT cliente_id FROM app_clientes ');
            const arraySolicitudes = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arrayMensajesNuevos = await pool.query('SELECT idMensaje FROM mensajes WHERE estadoMensaje="Nuevo"');
            const arrayVisitas = await pool.query('SELECT idVisita FROM visitas ');
            const arrayTestimoniosNuevos = await pool.query('SELECT idTestimonio FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');

            const arrayMensajesLeidosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Leido" ');
            const arrayMensajesNoLeidosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="No Leido" ');

            const arrayMensajesDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="No Leido" ');
            const mensajeDB = await pool.query(`SELECT * FROM mensajes WHERE idMensaje =${id} AND estadoMensaje="No Leido"  `);
            console.log(mensajeDB[0]);
            res.render("ver-mensaje-no-leido", {
                mensaje: mensajeDB[0],
                arrayMensajes: arrayMensajesDB,
                arrayMensajesLeidos: arrayMensajesLeidosDB,
                arrayMensajesNoLeidos: arrayMensajesNoLeidosDB,
                login: true,
                name: req.session.name,
                rol: req.session.rol,
                permiso_A,
                permiso_B,
                permiso_C,
                arrayUsuarios,
                arrayClientes,
                arraySolicitudes,
                arrayMensajesNuevos,
                arrayVisitas,
                arrayTestimoniosNuevos
            });

        } catch (error) {
            console.log(error)
            res.render("ver-mensaje-no-leido", {
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


//GUARDAR ACTUALIZACION DE MENSAJE NO LEIDO
router.post('/mensajes-no-leidos/ver-mensaje-no-leido/:id', async(req, res) => {
    const id = req.params.id;
    console.log(req.params.id)

    const { estadoMensaje } = req.body;

    const nuevoMensaje = {
        estadoMensaje

    };

    await pool.query("UPDATE mensajes set ? WHERE idMensaje = ?", [nuevoMensaje, id]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect('/mensajes-no-leidos');
});

//ELIMINAR MENSAJE NO LEIDO
router.get("/mensajes-no-leidos/eliminar-mensaje/:id", async(req, res) => {
    const { id } = req.params;

    console.log(id)

    try {

        await pool.query("DELETE FROM mensajes WHERE idMensaje = ?", [id]);
        // req.flash('success', 'Link eliminado correctamente');
        res.redirect("/mensajes-no-leidos");

    } catch (error) {
        console.log(error)
    }

});


// 3
// RENDERIZANDO Y MOSTRANDO MENSAJES LEIDOS 
router.get('/mensajes-leidos', async(req, res) => {
    if (req.session.loggedin) {

        const permiso_A = 'Administrador'
        const permiso_B = 'Representante'
        const permiso_C = 'Cliente App'
        const arrayUsuarios = await pool.query('SELECT idUsuario FROM users ');
        const arrayClientes = await pool.query('SELECT cliente_id FROM app_clientes ');
        const arraySolicitudes = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
        const arrayMensajesNuevos = await pool.query('SELECT idMensaje FROM mensajes WHERE estadoMensaje="Nuevo"');
        const arrayVisitas = await pool.query('SELECT idVisita FROM visitas ');
        const arrayTestimoniosNuevos = await pool.query('SELECT idTestimonio FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');

        const arrayMensajesDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Leido" ORDER BY fechaMensaje DESC');
        const arrayMensajesNoLeidosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="No Leido" ');

        res.render("mensajes-leidos", {
            arrayMensajes: arrayMensajesDB,
            arrayMensajesNoLeidos: arrayMensajesNoLeidosDB,
            login: true,
            name: req.session.name,
            rol: req.session.rol,
            permiso_A,
            permiso_B,
            permiso_C,
            arrayUsuarios,
            arrayClientes,
            arraySolicitudes,
            arrayMensajesNuevos,
            arrayVisitas,
            arrayTestimoniosNuevos

        });

    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
        });
    }

});


//VER MENSAJE LEIDO ************
router.get("/mensajes-leidos/ver-mensaje-leido/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        console.log(req.params)

        try {

            const permiso_A = 'Administrador'
            const permiso_B = 'Representante'
            const permiso_C = 'Cliente App'
            const arrayUsuarios = await pool.query('SELECT idUsuario FROM users ');
            const arrayClientes = await pool.query('SELECT cliente_id FROM app_clientes ');
            const arraySolicitudes = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arrayMensajesNuevos = await pool.query('SELECT idMensaje FROM mensajes WHERE estadoMensaje="Nuevo"');
            const arrayVisitas = await pool.query('SELECT idVisita FROM visitas ');
            const arrayTestimoniosNuevos = await pool.query('SELECT idTestimonio FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');

            const arrayMensajesLeidosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Leido" ');
            const arrayMensajesNoLeidosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="No Leido" ');

            const arrayMensajesDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Leido" ');
            const mensajeDB = await pool.query(`SELECT * FROM mensajes WHERE idMensaje =${id} AND estadoMensaje="Leido"  `);
            console.log(mensajeDB[0]);
            res.render("ver-mensaje-leido", {
                mensaje: mensajeDB[0],
                arrayMensajes: arrayMensajesDB,
                arrayMensajesLeidos: arrayMensajesLeidosDB,
                arrayMensajesNoLeidos: arrayMensajesNoLeidosDB,
                login: true,
                name: req.session.name,
                rol: req.session.rol,
                permiso_A,
                permiso_B,
                permiso_C,
                arrayUsuarios,
                arrayClientes,
                arraySolicitudes,
                arrayMensajesNuevos,
                arrayVisitas,
                arrayTestimoniosNuevos
            });

        } catch (error) {
            console.log(error)
            res.render("ver-mensaje-leido", {
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


//GUARDAR ACTUALIZACION DE MENSAJE LEIDO
router.post('/mensajes-leidos/ver-mensaje-leido/:id', async(req, res) => {
    const id = req.params.id;
    console.log(req.params.id)

    const { estadoMensaje } = req.body;

    const nuevoMensaje = {
        estadoMensaje

    };

    await pool.query("UPDATE mensajes set ? WHERE idMensaje = ?", [nuevoMensaje, id]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect('/mensajes-leidos');
});

//ELIMINAR MENSAJE LEIDO
router.get("/mensajes-leidos/eliminar-mensaje/:id", async(req, res) => {
    const { id } = req.params;
    console.log(id)

    try {


        await pool.query("DELETE FROM mensajes WHERE idMensaje = ?", [id]);

        res.redirect("/mensajes-leidos");


    } catch (error) {
        console.log(error)
    }

});




module.exports = router;