const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");
const { obtenerConteos } = require("../services/conteosService");

const permiso_A = 'Administrador'
const permiso_B = 'Representante'
const permiso_C = 'Cliente App'


// VISTA PRINCIPAL
router.get('/mantenedor-parametros', async(req, res) => {
    if (req.session.loggedin) {
        try {
            const modulosRaw = await pool.query('SELECT DISTINCT modulo FROM configuracion_parametros');
            // Normalizar modulos (compatibilidad con mysql2)
            const modulos = Array.isArray(modulosRaw[0]) ? modulosRaw[0] : modulosRaw;

            const conteos = await obtenerConteos();

            res.render('mantenedor-parametros', {
                modulos,
                user: req.session.user,
                title: 'Mantenedor de Parámetros',
                permiso_A,
                permiso_B,
                permiso_C,
                conteos,
                login: true,
                name: req.session.name,
                rol: req.session.rol
            });
        } catch (error) {
            console.error(error);
            res.render("404", {
                error: true,
                mensaje: error
            });
        }
    } else {
        res.render('login', { login: false, name: 'Debe iniciar sesión' });
    }
});

// NUEVA API: OBTENER VISTAS POR MÓDULO (Esto corregirá el 404)
router.get('/api/vistas/:modulo', async(req, res) => {
    try {
        const { modulo } = req.params;
        const vistasRaw = await pool.query(
            'SELECT DISTINCT vista_nombre FROM configuracion_parametros WHERE modulo = ?', [modulo]
        );
        const vistas = Array.isArray(vistasRaw[0]) ? vistasRaw[0] : vistasRaw;
        res.json(vistas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener vistas" });
    }
});

// API: OBTENER PARÁMETROS POR VISTA
router.get('/api/parametros/:vista', async(req, res) => {
    try {
        const { vista } = req.params;
        const paramsRaw = await pool.query(
            'SELECT * FROM configuracion_parametros WHERE vista_nombre = ?', [vista]
        );
        const parametros = Array.isArray(paramsRaw[0]) ? paramsRaw[0] : paramsRaw;
        res.json(parametros);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener parámetros" });
    }
});

// CRUD: ACTUALIZAR O CREAR
router.post('/api/parametros/guardar', async(req, res) => {
    const { id, modulo, vista_nombre, parametro_clave, parametro_valor, estado } = req.body;

    try {
        if (id) {
            // Actualizamos valor y usamos el campo descripcion como 'estado'
            await pool.query(
                'UPDATE configuracion_parametros SET parametro_valor = ?, descripcion = ? WHERE id = ?', [parametro_valor, estado, id]
            );
        } else {
            // Inserción de nuevo registro con estado inicial
            await pool.query('INSERT INTO configuracion_parametros SET ?', {
                modulo,
                vista_nombre,
                parametro_clave,
                parametro_valor,
                descripcion: estado || 'Activo'
            });
        }
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

// API RÁPIDA: SOLO CAMBIAR ESTADO (Para el Switch)
router.post('/api/parametros/update-status', async(req, res) => {
    const { id, estado } = req.body;
    try {
        await pool.query('UPDATE configuracion_parametros SET descripcion = ? WHERE id = ?', [estado, id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// CRUD: ELIMINAR
router.delete('/api/parametros/eliminar/:id', async(req, res) => {
    await pool.query('DELETE FROM configuracion_parametros WHERE id = ?', [req.params.id]);
    res.json({ success: true });
});



//RENDERIZANDO Y MOSTRANDO TODAS LAS RUTAS CREADAS VISTA RUTAS
router.get('/rutas', async(req, res) => {
    if (req.session.loggedin) {

        const conteos = await obtenerConteos();

        const arrayRutasDB = await pool.query('SELECT * FROM rutas ');
        const rutaDB = await pool.query('SELECT * FROM rutas ');
        console.log(arrayRutasDB)
        res.render("rutas", {
            arrayRutas: arrayRutasDB,
            ruta: rutaDB[0],
            login: true,
            name: req.session.name,
            rol: req.session.rol,
            permiso_A,
            permiso_B,
            permiso_C,
            conteos
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

        const conteos = await obtenerConteos();



        const arrayRutasDB = await pool.query('SELECT * FROM rutas ');
        res.render("crear-ruta", {
            arrayRutas: arrayRutasDB,
            conteos,
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
    const { nombreRuta, fechaCreacion, estadoRuta, localizacion_map } = req.body;
    const conteos = await obtenerConteos();
    const nuevaRuta = {
        nombreRuta,
        fechaCreacion,
        estadoRuta,
        localizacion_map

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
        conteos,
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
        const conteos = await obtenerConteos();


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
            permiso_C,
            conteos

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
        const conteos = await obtenerConteos();
        const id = req.params.id
        console.log(req.params)

        try {

            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const rutaDB = await pool.query("SELECT * FROM rutas WHERE idRuta = ?", [id]);
            // const eliminarRutaDB = await pool.query("DELETE * FROM rutas WHERE idRuta = ?", [id]);
            console.log(rutaDB[0]);
            res.render("editar-ruta", {
                ruta: rutaDB[0],
                arrayRutas: arrayRutasDB,
                login: true,
                name: req.session.name,
                rol: req.session.rol,
                permiso_A,
                permiso_B,
                permiso_C,
                conteos
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
    const conteos = await obtenerConteos();
    const { nombreRuta, fechaCreacion, estadoRuta, localizacion_map } = req.body;

    const nuevaRuta = {
        nombreRuta,
        fechaCreacion,
        estadoRuta,
        localizacion_map

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