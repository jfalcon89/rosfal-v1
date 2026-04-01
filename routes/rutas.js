const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");
const { obtenerConteos } = require("../services/conteosService");

const permiso_A = 'Administrador'
const permiso_B = 'Representante'
const permiso_C = 'Cliente App'

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
// router.get('/rutas/editar-ruta', async(req, res) => {
//     if (req.session.loggedin) {
//         const conteos = await obtenerConteos();

//         const rows = await pool.query("SELECT parametro_clave, parametro_valor FROM configuracion_parametros WHERE vista_nombre in ('Roles', 'Permisos-Rutas') AND descripcion = 'Activo'");

//         // console.log(rows)

//         const config = rows.reduce((acc, row) => {
//             const clave = row.parametro_clave;
//             const valor = row.parametro_valor;

//             if (acc[clave]) {
//                 // Si ya existe la clave, verificamos si ya es un arreglo
//                 if (Array.isArray(acc[clave])) {
//                     acc[clave].push(valor); // Solo agregamos el valor al arreglo existente
//                 } else {
//                     // Si era un string único, lo convertimos en un arreglo con el valor viejo y el nuevo
//                     acc[clave] = [acc[clave], valor];
//                 }
//             } else {
//                 // Si es la primera vez, lo guardamos como un valor simple (String)
//                 acc[clave] = valor;
//             }
//             return acc;
//         }, {});

//         console.log(config)


//         const arrayRutasDB = await pool.query('SELECT * FROM rutas ');
//         res.render('editar-ruta', {
//             arrayUsuarios: arrayUsuariosDB,
//             arrayClientes: arrayClientesDB,
//             arraySolicitudes: arraySolicitudesDB,
//             arrayMensajesNuevos: arrayMensajesNuevosDB,
//             arrayVisitas: arrayVisitasDB,
//             arrayTestimoniosNuevos: arrayTestimoniosNuevosDB,
//             arrayRutas: arrayRutasDB,
//             login: true,
//             name: req.session.name,
//             rol: req.session.rol,
//             permiso_A,
//             permiso_B,
//             permiso_C,
//             conteos,
//             config

//         });


//     } else {
//         res.render('login', {
//             login: false,
//             name: 'Debe iniciar sesión',
//             device: req.useragent.isMobile ? 'Mobile' : 'Desktop'
//         });
//     }

// })

//EDITAR SOLICITUD EN ESTADO NUEVA ************
router.get("/rutas/editar-ruta/:id", async(req, res) => {
    if (req.session.loggedin) {
        const conteos = await obtenerConteos();
        const id = req.params.id
        console.log(req.params)

        try {

            const rows = await pool.query("SELECT parametro_clave, parametro_valor FROM configuracion_parametros WHERE vista_nombre in ('Roles', 'Permisos-Rutas') AND descripcion = 'Activo'");

            // console.log(rows)

            const config = rows.reduce((acc, row) => {
                const clave = row.parametro_clave;
                const valor = row.parametro_valor;

                if (acc[clave]) {
                    // Si ya existe la clave, verificamos si ya es un arreglo
                    if (Array.isArray(acc[clave])) {
                        acc[clave].push(valor); // Solo agregamos el valor al arreglo existente
                    } else {
                        // Si era un string único, lo convertimos en un arreglo con el valor viejo y el nuevo
                        acc[clave] = [acc[clave], valor];
                    }
                } else {
                    // Si es la primera vez, lo guardamos como un valor simple (String)
                    acc[clave] = valor;
                }
                return acc;
            }, {});

            console.log(config)

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
                conteos,
                config
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