const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");
const bcrypt = require('bcryptjs');
const ipapi = require('ipapi.co');


router.get('/adm-usuarios', async(req, res) => {
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

        const arrayClientesVDB = await pool.query('SELECT * FROM app_clientes ');
        const arrayUsuariosVDB = await pool.query('SELECT * FROM users ');
        const usuarioDB = await pool.query('SELECT * FROM users ');
        res.render("adm-usuarios", {
            arrayUsuariosV: arrayUsuariosVDB,
            arrayClientesV: arrayClientesVDB,
            usuario: usuarioDB[0],
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



router.get('/adm-usuarios/crear-usuario', async(req, res) => {
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

        const arrayClientesVDB = await pool.query('SELECT * FROM app_clientes ');
        const arrayUsuariosVDB = await pool.query('SELECT * FROM users ');
        res.render("crear-usuario", {
            arrayUsuariosV: arrayUsuariosVDB,
            arrayClientesV: arrayClientesVDB,
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
})


// //CREANDO NUEVO USUARIO POST ****************
router.post("/adm-usuarios/crear-usuario", async(req, res) => {
    const { user, name, estado_usuario, rol, pass } = req.body;

    // Validación básica
    if (!user || !pass || !estado_usuario || !name || !rol || !estado_usuario) {
        return res.status(400).json({
            success: false,
            alertTitle: "Error",
            alertMessage: "Datos incompletos.",
            alertIcon: 'error'
        });
    };

    let passwordHash;
    try {
        passwordHash = await bcrypt.hash(pass, 8); // Hash de contraseña
    } catch (error) {
        return res.status(500).json({
            success: false,
            alertTitle: "Error",
            alertMessage: "Error al encriptar la contraseña.",
            alertIcon: 'error'
        });
    }

    const nuevoCliente = {
        user,
        name,
        pass: passwordHash,
        estado_usuario,
        rol
    };

    try {
        // Verificación si el usuario ya está en la tabla 'users'
        const userDB = await pool.query('SELECT * FROM users WHERE user = ?', [user]);

        // Si ya existe el teléfono, mostrar alerta de que el número está registrado
        if (userDB.length > 0) {
            return res.json({
                success: false,
                alertTitle: "Favor verificar",
                alertMessage: "¡Este usuario ya está registrado!",
                alertIcon: 'warning',
                showConfirmButton: true,
                confirmButtonText: "Reintentar",
                showCancelButton: true, // Mostrar botón "Iniciar sesión"
                cancelButtonText: "Ver Usuarios",
                ruta: '/adm-usuarios'
            });
        }

        // Si no existe, procede con la inserción
        // Inserción en users

        await pool.query('INSERT INTO users SET ?', [nuevoCliente]);

        // Respuesta de éxito
        return res.json({
            success: true,
            alertTitle: "Excelente",
            alertMessage: "USUARIO CREADO CORRECTAMENTE!",
            alertIcon: 'success',
            timer: 1500,
            ruta: '/adm-usuarios'
        });

    } catch (error) {
        console.error('Error en la base de datos:', error);
        return res.status(500).json({
            success: false,
            alertTitle: "Error",
            alertMessage: "Error en el servidor, intenta más tarde.",
            alertIcon: 'error'
        });
    }

});


// //RENDERIZANDO Y MOSTRANDO TODAS LAS RUTAS CREADAS VISTA EDITAR RUTA
router.get('/adm-usuarios/editar-usuario', async(req, res) => {
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

        const arrayClientesVDB = await pool.query('SELECT * FROM app_clientes ');
        const arrayUsuariosVDB = await pool.query('SELECT * FROM users ');
        res.render('editar-usuario', {
            arrayClientesV: arrayClientesVDB,
            arrayUsuariosV: arrayUsuariosVDB,
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
})

// //EDITAR USUARIO EN ESTADO NUEVA ************
router.get("/adm-usuarios/editar-usuario/:id", async(req, res) => {
    if (req.session.loggedin) {
        const id = req.params.id;
        console.log(req.params);

        const permiso_A = 'Administrador'
        const permiso_B = 'Representante'
        const permiso_C = 'Cliente App'
        const arrayUsuarios = await pool.query('SELECT idUsuario FROM users ');
        const arrayClientes = await pool.query('SELECT cliente_id FROM app_clientes ');
        const arraySolicitudes = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
        const arrayMensajesNuevos = await pool.query('SELECT idMensaje FROM mensajes WHERE estadoMensaje="Nuevo"');
        const arrayVisitas = await pool.query('SELECT idVisita FROM visitas ');
        const arrayTestimoniosNuevos = await pool.query('SELECT idTestimonio FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');

        const arrayClientesVDB = await pool.query('SELECT * FROM app_clientes ');
        const arrayUsuariosVDB = await pool.query("SELECT * FROM users");
        const usuarioDB = await pool.query("SELECT * FROM users WHERE idUsuario = ?", [id]);
        const clienteDB = await pool.query("SELECT * FROM app_clientes WHERE telefono = ?", [usuarioDB[0].user]);
        try {


            if (!usuarioDB.length) {
                throw new Error("Usuario no encontrado");
            }

            res.render("editar-usuario", {
                cliente: clienteDB[0],
                usuario: usuarioDB[0],
                arrayUsuariosV: arrayUsuariosVDB,
                arrayClientesV: arrayClientesVDB,
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
            console.log(error);
            res.render("editar-usuario", {
                error: true,
                mensaje: "No se encuentra el ID seleccionado o hubo un error en la base de datos",
                arrayUsuariosV: arrayUsuariosVDB,
                arrayClientesV: arrayClientesVDB,
                cliente: clienteDB[0],
                usuario: usuarioDB[0],
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
        }

    } else {
        res.render("login", {
            login: false,
            name: "Debe iniciar sesión",

        });
    }
});



// //GUARDAR ACTUALIZACION DE SOLICITUD DESDE NUEVAS
router.post('/adm-usuarios/editar-usuario/:id', async(req, res) => {
    const id = req.params.id;
    console.log('Usuario ID:', id);

    const { user, name, estado_usuario, rol, pass } = req.body;
    const actualizacionUsuario = { user, name, estado_usuario, rol };

    try {
        // Verifica si el usuario existe en la tabla `users`
        const usuarioDB = await pool.query("SELECT * FROM users WHERE idUsuario = ?", [id]);

        if (usuarioDB.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }

        const telefono = usuarioDB[0].user;

        // Verifica si existe un cliente en `app_clientes` con el teléfono del usuario
        const clienteDB = await pool.query("SELECT * FROM app_clientes WHERE telefono = ?", [telefono]);

        // Si hay contraseña, actualiza tanto en `users` como en `app_clientes` (si existe)
        if (pass) {
            const passwordHash = await bcrypt.hash(pass, 8); // Hash de la contraseña

            // Actualiza la contraseña en `users`
            await pool.query("UPDATE users SET pass = ? WHERE idUsuario = ?", [passwordHash, id]);

            // Solo actualiza la contraseña en `app_clientes` si el cliente ya existe
            if (clienteDB.length > 0) {
                console.log('Actualizando contraseña del cliente existente');
                await pool.query("UPDATE app_clientes SET pass = ? WHERE telefono = ?", [passwordHash, telefono]);
            } else {
                console.log('El cliente no existe en app_clientes, no se actualiza');
            }

            // Redirige después de la actualización de la contraseña
            return res.redirect('/adm-usuarios');
        }

        // Si no hay contraseña, actualiza solo los demás campos en `users`
        await pool.query("UPDATE users SET ? WHERE idUsuario = ?", [actualizacionUsuario, id]);

        // Redirige después de la actualización
        res.redirect('/adm-usuarios');
    } catch (error) {
        console.error('Error durante la actualización:', error);
        res.status(500).send('Hubo un error actualizando el usuario.');
    }
});


// //EDITAR USUARIO EN ESTADO NUEVA ************
router.get("/adm-usuarios/editar-usuario-app/:id", async(req, res) => {
    if (req.session.loggedin) {
        const id = req.params.id;
        console.log(req.params);


        const permiso_A = 'Administrador'
        const permiso_B = 'Representante'
        const permiso_C = 'Cliente App'
        const arrayUsuarios = await pool.query('SELECT idUsuario FROM users ');
        const arrayClientes = await pool.query('SELECT cliente_id FROM app_clientes ');
        const arraySolicitudes = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
        const arrayMensajesNuevos = await pool.query('SELECT idMensaje FROM mensajes WHERE estadoMensaje="Nuevo"');
        const arrayVisitas = await pool.query('SELECT idVisita FROM visitas ');
        const arrayTestimoniosNuevos = await pool.query('SELECT idTestimonio FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');


        const arrayClientesVDB = await pool.query('SELECT * FROM app_clientes ');
        const arrayUsuariosVDB = await pool.query("SELECT * FROM users");
        const usuarioDB = await pool.query("SELECT * FROM users WHERE idUsuario = ?", [id]);
        const clienteDB = await pool.query("SELECT * FROM app_clientes WHERE telefono = ?", [usuarioDB[0].user]);
        const arrayArchivosDB = await pool.query(`SELECT archivo_id, celular, prestamo_id, nombre_archivo, tipo_documento, fecha_subida FROM archivos_prestamos where celular = '${usuarioDB[0].user}'`);
        const arraySolicitudesAprobadasDB = await pool.query(`SELECT idSolicitud, nombre, apellido, celular FROM solicitudes WHERE estadoSolicitud IN ("Aprobada" , 'En Legal', 'Nueva', 'En Revision') AND celular = '${usuarioDB[0].user}' ORDER BY fechaSolicitud DESC`);
        const SolicitudesClienteDB = await pool.query(`SELECT  nombre, apellido, celular FROM solicitudes WHERE celular = '${usuarioDB[0].user}' limit 1`);
        try {

            if (!usuarioDB.length) {
                throw new Error("Usuario no encontrado");
            }

            res.render("editar-usuario-app", {
                cliente: clienteDB[0],
                SolicitudesCliente: SolicitudesClienteDB,
                usuario: usuarioDB[0],
                arrayUsuariosV: arrayUsuariosVDB,
                arrayClientesV: arrayClientesVDB,
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
                arrayTestimoniosNuevos,
                arrayArchivos: arrayArchivosDB,
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB
            });

        } catch (error) {
            console.log(error);
            res.render("editar-usuario-app", {
                error: true,
                mensaje: "No se encuentra el ID seleccionado o hubo un error en la base de datos",
                arrayUsuariosV: arrayUsuariosVDB,
                arrayClientesV: arrayClientesVDB,
                cliente: clienteDB[0],
                usuario: usuarioDB[0],
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
                arrayTestimoniosNuevos,
                arrayArchivos: arrayArchivosDB,
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB
            });
        }

    } else {
        res.render("login", {
            login: false,
            name: "Debe iniciar sesión",

        });
    }
});



// //GUARDAR ACTUALIZACION DE SOLICITUD DESDE NUEVAS
router.post('/adm-usuarios/editar-usuario-app/:id', async(req, res) => {
    const id = req.params.id;
    console.log('Usuario ID:', id);

    const { name, pass } = req.body;
    const actualizacionUsuario = { name };

    try {
        // Verifica si el usuario existe en la tabla `users`
        const usuarioDB = await pool.query("SELECT * FROM users WHERE idUsuario = ?", [id]);

        if (usuarioDB.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }

        const telefono = usuarioDB[0].user;

        // Verifica si existe un cliente en `app_clientes` con el teléfono del usuario
        const clienteDB = await pool.query("SELECT * FROM app_clientes WHERE telefono = ?", [telefono]);

        // Si hay contraseña, actualiza tanto en `users` como en `app_clientes` (si existe)
        if (pass) {
            const passwordHash = await bcrypt.hash(pass, 8); // Hash de la contraseña

            // Actualiza la contraseña en `users`
            await pool.query("UPDATE users SET pass = ? WHERE idUsuario = ?", [passwordHash, id]);

            // Solo actualiza la contraseña en `app_clientes` si el cliente ya existe
            if (clienteDB.length > 0) {
                console.log('Actualizando contraseña del cliente existente');
                await pool.query("UPDATE app_clientes SET pass = ? WHERE telefono = ?", [passwordHash, telefono]);
            } else {
                console.log('El cliente no existe en app_clientes, no se actualiza');
            }

            // Redirige después de la actualización de la contraseña
            return res.redirect('/panel-administracion');
        }

        // Si no hay contraseña, actualiza solo los demás campos en `users`
        await pool.query("UPDATE users SET ? WHERE idUsuario = ?", [actualizacionUsuario, id]);

        // Redirige después de la actualización
        res.redirect('/panel-administracion');
    } catch (error) {
        console.error('Error durante la actualización:', error);
        res.status(500).send('Hubo un error actualizando el usuario.');
    }
});


// //ELIMINAR USUARIO 
router.get("/adm-usuarios/eliminar-usuario/:id", async(req, res) => {
    const { id } = req.params;

    console.log(id)

    const usuarioDB = await pool.query("SELECT * FROM users WHERE idUsuario = ?", [id]);

    // Verifica si existe un usuario con el teléfono en `users`
    // const userDB = await pool.query("SELECT * FROM users WHERE user = ?", [clienteDB[0].telefono]);

    try {

        await pool.query("DELETE FROM users WHERE idUsuario = ?", [id]);

        res.redirect("/adm-usuarios");

    } catch (error) {
        console.log(error)
    }
});







module.exports = router;