const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");


// 1
// RENDERIZANDO Y MOSTRANDO TODOS LOS MENSAJES NUEVOS
router.get('/mensajes', async(req, res) => {
    if (req.session.loggedin) {


        const arrayMensajesDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Nuevo" ORDER BY fechaMensaje DESC');
        const arrayMensajesLeidosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Leido" ');
        const arrayMensajesNoLeidosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="No Leido" ');
        // const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="aprobada"');
        // const arraySolicitudesDeclinadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada"');
        // const arraySolicitudesEnRevisionDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision"');
        res.render("mensajes", {
            arrayMensajes: arrayMensajesDB,
            arrayMensajesLeidos: arrayMensajesLeidosDB,
            arrayMensajesNoLeidos: arrayMensajesNoLeidosDB,
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



//VER MENSAJE NUEVO ************
router.get("/mensajes/ver-mensaje/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        console.log(req.params)

        try {

            const arrayMensajesLeidosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Leido" ');
            const arrayMensajesNuevosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Nuevo" ');
            const arrayMensajesNoLeidosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="No Leido" ');

            const arrayMensajesDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Nuevo" ORDER BY fechaMensaje DESC');
            const mensajeDB = await pool.query("SELECT * FROM mensajes WHERE idMensaje = ?", [id]);
            console.log(mensajeDB[0]);
            res.render("ver-mensaje", {
                mensaje: mensajeDB[0],
                arrayMensajes: arrayMensajesDB,
                arrayMensajesLeidos: arrayMensajesLeidosDB,
                arrayMensajesNuevos: arrayMensajesNuevosDB,
                arrayMensajesNoLeidos: arrayMensajesNoLeidosDB,
                login: true,
                name: req.session.name
            });

        } catch (error) {
            console.log(error)
            res.render("ver-mensaje", {
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
router.post('/mensajes/ver-mensaje/:id', async(req, res) => {
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
router.get("/mensajes/:id", async(req, res) => {
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


        const arrayMensajesDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="No Leido" ORDER BY fechaMensaje DESC');
        const arrayMensajesNuevosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Nuevo" ');
        const arrayMensajesLeidosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Leido" ');

        res.render("mensajes-no-leidos", {
            arrayMensajes: arrayMensajesDB,
            arrayMensajesNuevos: arrayMensajesNuevosDB,
            arrayMensajesLeidos: arrayMensajesLeidosDB,
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


//VER MENSAJE NO LEIDO ************
router.get("/mensajes-no-leidos/ver-mensaje/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        console.log(req.params)

        try {

            const arrayMensajesLeidosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Leido" ');
            const arrayMensajesNuevosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Nuevo" ');
            const arrayMensajesNoLeidosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="No Leido" ');

            const arrayMensajesDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="No Leido" ');
            const mensajeDB = await pool.query(`SELECT * FROM mensajes WHERE idMensaje =${id} AND estadoMensaje="No Leido"  `);
            console.log(mensajeDB[0]);
            res.render("ver-mensaje", {
                mensaje: mensajeDB[0],
                arrayMensajes: arrayMensajesDB,
                arrayMensajesLeidos: arrayMensajesLeidosDB,
                arrayMensajesNuevos: arrayMensajesNuevosDB,
                arrayMensajesNoLeidos: arrayMensajesNoLeidosDB,
                login: true,
                name: req.session.name
            });

        } catch (error) {
            console.log(error)
            res.render("ver-mensaje", {
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
router.post('/mensajes-no-leidos/ver-mensaje/:id', async(req, res) => {
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
router.get("/mensajes-no-leidos/:id", async(req, res) => {
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


        const arrayMensajesDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Leido" ORDER BY fechaMensaje DESC');
        const arrayMensajesNuevosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Nuevo" ');
        const arrayMensajesNoLeidosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="No Leido" ');

        res.render("mensajes-leidos", {
            arrayMensajes: arrayMensajesDB,
            arrayMensajesNuevos: arrayMensajesNuevosDB,
            arrayMensajesNoLeidos: arrayMensajesNoLeidosDB,
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


//VER MENSAJE LEIDO ************
router.get("/mensajes-leidos/ver-mensaje/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        console.log(req.params)

        try {

            const arrayMensajesLeidosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Leido" ');
            const arrayMensajesNuevosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Nuevo" ');
            const arrayMensajesNoLeidosDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="No Leido" ');

            const arrayMensajesDB = await pool.query('SELECT * FROM mensajes WHERE estadoMensaje="Leido" ');
            const mensajeDB = await pool.query(`SELECT * FROM mensajes WHERE idMensaje =${id} AND estadoMensaje="Leido"  `);
            console.log(mensajeDB[0]);
            res.render("ver-mensaje", {
                mensaje: mensajeDB[0],
                arrayMensajes: arrayMensajesDB,
                arrayMensajesLeidos: arrayMensajesLeidosDB,
                arrayMensajesNuevos: arrayMensajesNuevosDB,
                arrayMensajesNoLeidos: arrayMensajesNoLeidosDB,
                login: true,
                name: req.session.name
            });

        } catch (error) {
            console.log(error)
            res.render("ver-mensaje", {
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
router.post('/mensajes-leidos/ver-mensaje/:id', async(req, res) => {
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
router.get("/mensajes-leidos/:id", async(req, res) => {
    const { id } = req.params;

    console.log(id)

    try {

        await pool.query("DELETE FROM mensajes WHERE idMensaje = ?", [id]);
        // req.flash('success', 'Link eliminado correctamente');
        res.redirect("/mensajes-leidos");

    } catch (error) {
        console.log(error)
    }

});









module.exports = router;