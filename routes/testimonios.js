const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");


// 1
// RENDERIZANDO Y MOSTRANDO TODOS LOS TESTIMONIOS NUEVOS
router.get('/testimonios', async(req, res) => {
    if (req.session.loggedin) {


        const arrayTestimoniosNuevosDB = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');
        // const arrayTestimoniosNuevosDB2 = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');
        const arrayTestimoniosActivosDB = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Activo" ORDER BY fechaTestimonio DESC');
        const arrayTestimoniosInactivosDB = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Inactivo" ORDER BY fechaTestimonio DESC');

        res.render("testimonios", {
            arrayTestimoniosNuevos: arrayTestimoniosNuevosDB,
            // arrayTestimoniosNuevos2: arrayTestimoniosNuevosDB2[0],
            arrayTestimoniosActivos: arrayTestimoniosActivosDB,
            arrayTestimoniosInactivos: arrayTestimoniosInactivosDB,
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
router.get("/testimonios/ver-testimonio/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        console.log(req.params)

        try {

            const arrayTestimoniosNuevosDB = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');
            const arrayTestimoniosActivosDB = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Activo" ORDER BY fechaTestimonio DESC');
            const arrayTestimoniosInactivosDB = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Inactivo" ORDER BY fechaTestimonio DESC');

            const arrayTestimoniosDB = await pool.query(`SELECT * FROM testimonios WHERE estadoTestimonio="Nuevo"  `);
            const testimonioDB = await pool.query(`SELECT * FROM testimonios WHERE idTestimonio =${id} AND estadoTestimonio="Nuevo" `);
            console.log(arrayTestimoniosDB[0]);
            res.render("ver-testimonio", {
                arrayTestimonios: arrayTestimoniosDB,
                testimonio: testimonioDB[0],
                arrayTestimoniosNuevos: arrayTestimoniosNuevosDB,
                arrayTestimoniosActivos: arrayTestimoniosActivosDB,
                arrayTestimoniosInactivos: arrayTestimoniosInactivosDB,
                login: true,
                name: req.session.name

            });

        } catch (error) {
            console.log(error)
            res.render("ver-testimonio", {
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


//GUARDAR ACTUALIZACION DE TESTIMONIOS NUEVOS
router.post('/testimonios/ver-testimonio/:id', async(req, res) => {
    const id = req.params.id;
    console.log(req.params.id)

    const { estadoTestimonio } = req.body;

    const nuevoTestimonio = {
        estadoTestimonio

    };

    await pool.query("UPDATE testimonios set ? WHERE idTestimonio = ?", [nuevoTestimonio, id]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect('/testimonios');
});

//ELIMINAR TESTIMONIO NUEVO
router.get("/testimonios/eliminar-testimonio/:id", async(req, res) => {
    const { id } = req.params;

    console.log(id)

    try {


        await pool.query("DELETE FROM testimonios WHERE idTestimonio = ?", [id]);

        // req.flash('success', 'Link eliminado correctamente');
        res.redirect("/testimonios");



    } catch (error) {
        console.log(error)
    }

});


// 2
// RENDERIZANDO Y MOSTRANDO TESTIMONIOS ACTIVOS 
router.get('/testimonios-activos', async(req, res) => {
    if (req.session.loggedin) {


        const arrayTestimoniosNuevosDB = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');
        const arrayTestimoniosActivosDB = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Activo" ORDER BY fechaTestimonio DESC');
        const arrayTestimoniosInactivosDB = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Inactivo" ORDER BY fechaTestimonio DESC');

        res.render("testimonios-activos", {
            arrayTestimoniosNuevos: arrayTestimoniosNuevosDB,
            arrayTestimoniosActivos: arrayTestimoniosActivosDB,
            arrayTestimoniosInactivos: arrayTestimoniosInactivosDB,
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


//VER TESTIMONIOS ACTIVOS ************
router.get("/testimonios-activos/ver-testimonio-activo/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        console.log(req.params)

        try {

            const arrayTestimoniosNuevosDB = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');
            const arrayTestimoniosActivosDB = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Activo" ORDER BY fechaTestimonio DESC');
            const arrayTestimoniosInactivosDB = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Inactivo" ORDER BY fechaTestimonio DESC');

            const arrayTestimoniosDB = await pool.query(`SELECT * FROM testimonios WHERE estadoTestimonio="Activo"  `);
            const testimonioDB = await pool.query(`SELECT * FROM testimonios WHERE idTestimonio =${id} AND estadoTestimonio="Activo" `);
            console.log(testimonioDB[0]);
            res.render("ver-testimonio-activo", {
                testimonio: testimonioDB[0],
                arrayTestimonios: arrayTestimoniosDB,
                arrayTestimoniosNuevos: arrayTestimoniosNuevosDB,
                arrayTestimoniosActivos: arrayTestimoniosActivosDB,
                arrayTestimoniosInactivos: arrayTestimoniosInactivosDB,
                login: true,
                name: req.session.name
            });

        } catch (error) {
            console.log(error)
            res.render("ver-testimonio-activo", {
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


//GUARDAR ACTUALIZACION DE TESTIMONIOS ACTIVOS
router.post('/testimonios-activos/ver-testimonio-activo/:id', async(req, res) => {
    const id = req.params.id;
    console.log(req.params.id)

    const { estadoTestimonio } = req.body;

    const nuevoTestimonio = {
        estadoTestimonio

    };

    await pool.query("UPDATE testimonios set ? WHERE idTestimonio = ?", [nuevoTestimonio, id]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect('/testimonios-activos');
});


//ELIMINAR MENSAJE NO LEIDO
router.get("/testimonios-activos/eliminar-testimonio:id", async(req, res) => {
    const { id } = req.params;

    console.log(id)

    try {

        await pool.query("DELETE FROM testimonios WHERE idTestimonio = ?", [id]);
        // req.flash('success', 'Link eliminado correctamente');
        res.redirect("/testimonios-activos");



    } catch (error) {
        console.log(error)
    }

});


// 3
// RENDERIZANDO Y MOSTRANDO TESTIMONIO INACTIVO 
router.get('/testimonios-inactivos', async(req, res) => {
    if (req.session.loggedin) {


        const arrayTestimoniosNuevosDB = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');
        const arrayTestimoniosActivosDB = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Activo" ORDER BY fechaTestimonio DESC');
        const arrayTestimoniosInactivosDB = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Inactivo" ORDER BY fechaTestimonio DESC');

        res.render("testimonios-inactivos", {
            arrayTestimoniosNuevos: arrayTestimoniosNuevosDB,
            arrayTestimoniosActivos: arrayTestimoniosActivosDB,
            arrayTestimoniosInactivos: arrayTestimoniosInactivosDB,
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


//VER MENSAJE TESTIMONIO INACTIVO ************
router.get("/testimonios-inactivos/ver-testimonio-inactivo/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        console.log(req.params)

        try {

            const arrayTestimoniosNuevosDB = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');
            const arrayTestimoniosActivosDB = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Activo" ORDER BY fechaTestimonio DESC');
            const arrayTestimoniosInactivosDB = await pool.query('SELECT * FROM testimonios WHERE estadoTestimonio="Inactivo" ORDER BY fechaTestimonio DESC');

            const arrayTestimoniosDB = await pool.query(`SELECT * FROM testimonios WHERE  estadoTestimonio="Inactivo"  `);
            const testimonioDB = await pool.query(`SELECT * FROM testimonios WHERE idTestimonio =${id} AND estadoTestimonio="Inactivo"  `);
            console.log(testimonioDB[0]);
            res.render("ver-testimonio-inactivo", {
                testimonio: testimonioDB[0],
                arrayTestimonios: arrayTestimoniosDB,
                arrayTestimoniosNuevos: arrayTestimoniosNuevosDB,
                arrayTestimoniosActivos: arrayTestimoniosActivosDB,
                arrayTestimoniosInactivos: arrayTestimoniosInactivosDB,
                login: true,
                name: req.session.name
            });

        } catch (error) {
            console.log(error)
            res.render("ver-testimonio-inactivo", {
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


//GUARDAR ACTUALIZACION DE TESTIMONIO INACTIVO
router.post('/testimonios-inactivos/ver-testimonio-inactivo/:id', async(req, res) => {
    const id = req.params.id;
    console.log(req.params.id)

    const { estadoTestimonio } = req.body;

    const nuevoTestimonio = {
        estadoTestimonio

    };

    await pool.query("UPDATE testimonios set ? WHERE idTestimonio = ?", [nuevoTestimonio, id]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect('/testimonios-inactivos');
});

//ELIMINAR TESTIMONIO INACTIVO
router.get("/testimonios-inactivos/eliminar-testimonio:id", async(req, res) => {
    const { id } = req.params;

    console.log(id)

    try {

        await pool.query("DELETE FROM testimonios WHERE idTestimonio = ?", [id]);
        // req.flash('success', 'Link eliminado correctamente');
        res.redirect("/testimonios-inactivos");



    } catch (error) {
        console.log(error)
    }

});









module.exports = router;