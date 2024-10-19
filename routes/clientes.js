const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");
const bcrypt = require('bcryptjs');
const ipapi = require('ipapi.co');
const nodemailer = require("nodemailer");
const useragent = require('express-useragent');


router.get('/app-clientes', async(req, res) => {
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


        const arrayUsuariosVDB = await pool.query('SELECT * FROM users ');
        const arrayClientesVDB = await pool.query(`SELECT c.*, COALESCE(s.nombre, '') AS nombre_solicitud, COALESCE(s.apellido, '') AS apellido_solicitud FROM app_clientes c LEFT JOIN (SELECT celular, nombre, apellido FROM solicitudes GROUP BY celular) s ON c.telefono = s.celular;`);
        const clienteDB = await pool.query('SELECT * FROM app_clientes ');
        res.render("app-clientes", {
            arrayClientesV: arrayClientesVDB,
            arrayUsuariosV: arrayUsuariosVDB,
            cliente: clienteDB[0],

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


//RENDERIZANDO Y MOSTRANDO TODAS LAS RUTAS CREADAS VISTA CREAR RUTA
router.get('/app-clientes/crear-cliente', async(req, res) => {
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

        const arrayUsuariosVDB = await pool.query('SELECT * FROM users ');
        const arrayClientesVDB = await pool.query(`SELECT c.*, COALESCE(s.nombre, '') AS nombre_solicitud, COALESCE(s.apellido, '') AS apellido_solicitud FROM app_clientes c LEFT JOIN (SELECT celular, nombre, apellido FROM solicitudes GROUP BY celular) s ON c.telefono = s.celular;`);
        res.render("crear-cliente", {
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


//CREANDO NUEVO CLIENTE ****************
router.post("/app-clientes/crear-cliente", async(req, res) => {
    const { telefono, pass, estado_cliente } = req.body;

    // Validación básica
    if (!telefono || !pass || !estado_cliente) {
        return res.status(400).json({
            success: false,
            alertTitle: "Error",
            alertMessage: "Datos incompletos.",
            alertIcon: 'error'
        });
    }

    // Función para generar número aleatorio
    function generarNumeroAleatorio() {
        return Math.floor(100000 + Math.random() * 900000);
    }

    // const ipString = "201.229.238.223, 172.71.82.116"; // Cambiar por IP real en producción
    const ipString = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ip_app_cliente = ipString.split(',')[0];
    const token_registro_sms = generarNumeroAleatorio();

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

    const rol = 'Cliente App';
    const name = 'Usuario Externo';
    const origen = 'Aplicacion Web';
    const estado_usuario = 'Activo';

    const nuevoCliente = {
        telefono,
        pass: passwordHash,
        estado_cliente,
        token_registro_sms,
        ip_app_cliente,
        origen
    };

    console.log('este es el telefono ' + telefono)

    try {
        // Verificación de existencia del teléfono en app_clientes
        const telefonoDB = await pool.query('SELECT * FROM app_clientes WHERE telefono = ?', [telefono]);
        // Verificación si el usuario ya está en la tabla 'users'
        const userDB = await pool.query('SELECT * FROM users WHERE user = ?', [telefono]);

        // Si ya existe el teléfono, mostrar alerta de que el número está registrado
        if (telefonoDB.length > 0 && userDB.length > 0) {
            return res.json({
                success: false,
                alertTitle: "Favor verificar",
                alertMessage: "¡Este número ya está registrado!",
                alertIcon: 'warning',
                showConfirmButton: true,
                confirmButtonText: "Reintentar",
                showCancelButton: true, // Mostrar botón "Iniciar sesión"
                cancelButtonText: "Ver Clientes",
                ruta: '/app-clientes'
            });
        }

        // Si no existe, procede con la inserción
        // Inserción en app_clientes
        if (telefonoDB.length == 0) {
            console.log('cliente no existe, creandolo ')
            await pool.query('INSERT INTO app_clientes SET ?', [nuevoCliente]);
        }

        // Si no existe el usuario en la tabla 'users', crear uno nuevo
        if (userDB.length == 0) {
            console.log('usuario no existe, creandolo ')
            await pool.query('INSERT INTO users SET ?', { user: telefono, name: name, pass: passwordHash, rol: rol, estado_usuario });
        }

        // inicio envio de correo
        const device = req.useragent.isMobile ? 'Mobile' : 'Desktop';
        const browser = req.useragent.browser;
        const sistemaOperativo = req.useragent.os
        const plataforma = req.useragent.platform
        const fecha = new Date().toLocaleString('en-US', { timeZone: 'America/Santo_Domingo' });

        var callback = function(res) {

            // #1 FUNCION QUE ENVIA AL CORREO NOTIFICACION DE SOLICITUD DE PRESTAMOS A ROSFAL
            async function notificacionCorreo() {
                try {
                    const from = "contacto@rosfal.com"
                    const toNotificacion = "jfalcon@rosfal.com"

                    // console.log(nombre + " en enviar correo");
                    // console.log(apellido + " en enviar correo");

                    // Configurar la conexión SMTP con el servidor de correo personalizado
                    let transporter = nodemailer.createTransport({
                        host: "mail.privateemail.com",
                        port: 465, // El puerto puede variar según la configuración de su servidor
                        secure: true, // Si utiliza SSL/TLS, establezca este valor en true
                        tls: {
                            rejectUnauthorized: false
                        },
                        auth: {
                            user: process.env.USERCORREO,
                            pass: process.env.PASSCORREO,
                        },
                    });

                    // Configurar los detalles del correo electrónico
                    let info = await transporter.sendMail({
                        from: `${from} ROSFAL SOLUCIONES DE PRESTAMOS`,
                        to: `${toNotificacion}`,
                        subject: `Nuevo registro de cliente ${telefono} ${origen}`,
                        html: `
            
            <P><strong>Asunto</strong>: Confirmación registro de cliente</p><br>

           
            <P><strong>Direccion ip</strong>: ${ip_app_cliente}</p>
            <P><strong>Dispositivo</strong>: ${device}</p>
            <P><strong>Navegador</strong>: ${browser}</p>
            <P><strong>Sistema Operativo</strong>: ${sistemaOperativo}</p>
            <P><strong>Plataforma</strong>: ${plataforma}</p>
            <P><strong>Pais</strong>: ${res.country_name}</p>
            <P><strong>Ciudad</strong>: ${res.city}</p>
            <P><strong>Latitud</strong>: ${res.latitude} <strong>longitud</strong>: ${res.longitude}</p>
            <P><strong>Origen</strong>: ${origen}</p>
            <P><strong>Token SMS</strong>: ${token_registro_sms}</p>
            <P><strong>Fecha</strong>: ${fecha}</p><br>
           
        
            <P>Atentamente,</p>
        
            <h4 style="color: #2D8DBD;">ROSFAL SOLUCIONES DE PRESTAMOS</h4>
            <P><strong>T.</strong> 829-856-0203 <strong>EMAIL.</strong> contacto@rosfal.com </P>
            <P>Síguenos en <strong>FB:</strong> Rosfalrd <strong>IG:</strong> @Rosfalrd </P>
            <a href="www.rosfal.com">www.rosfal.com</a>
            `

                    });

                    console.log("Correo enviado: %s", info.messageId);

                } catch (error) {
                    console.log(error);
                }
            }
            notificacionCorreo()
        };
        ipapi.location(callback, `${ip_app_cliente}`)
            // fin envio de correo

        // Respuesta de éxito
        return res.json({
            success: true,
            alertTitle: "Excelente",
            alertMessage: "¡CLIENTE CREADO CORRECTAMENTE!",
            alertIcon: 'success',
            timer: 1500,
            ruta: '/app-clientes'
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


//RENDERIZANDO Y MOSTRANDO TODAS LAS RUTAS CREADAS VISTA EDITAR RUTA
router.get('/app-clientes/editar-cliente', async(req, res) => {
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

        const arrayUsuariosVDB = await pool.query('SELECT * FROM users ');
        const arrayClientesVDB = await pool.query(`SELECT c.*, COALESCE(s.nombre, '') AS nombre_solicitud, COALESCE(s.apellido, '') AS apellido_solicitud FROM app_clientes c LEFT JOIN (SELECT celular, nombre, apellido FROM solicitudes GROUP BY celular) s ON c.telefono = s.celular;`);
        res.render('editar-cliente', {
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

//EDITAR SOLICITUD EN ESTADO NUEVA ************
router.get("/app-clientes/editar-cliente/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
        console.log(req.params)


        const permiso_A = 'Administrador'
        const permiso_B = 'Representante'
        const permiso_C = 'Cliente App'
        const arrayUsuarios = await pool.query('SELECT idUsuario FROM users ');
        const arrayClientes = await pool.query('SELECT cliente_id FROM app_clientes ');
        const arraySolicitudes = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
        const arrayMensajesNuevos = await pool.query('SELECT idMensaje FROM mensajes WHERE estadoMensaje="Nuevo"');
        const arrayVisitas = await pool.query('SELECT idVisita FROM visitas ');
        const arrayTestimoniosNuevos = await pool.query('SELECT idTestimonio FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');

        try {
            const arrayUsuariosVDB = await pool.query('SELECT * FROM users ');
            const arrayClientesVDB = await pool.query(`SELECT c.*, COALESCE(s.nombre, '') AS nombre_solicitud, COALESCE(s.apellido, '') AS apellido_solicitud FROM app_clientes c LEFT JOIN (SELECT celular, nombre, apellido FROM solicitudes GROUP BY celular) s ON c.telefono = s.celular;`);
            const clienteDB = await pool.query("SELECT * FROM app_clientes WHERE cliente_id = ?", [id]);
            // Verifica si existe un usuario con el teléfono en `users`
            const userDB = await pool.query(`SELECT * FROM users WHERE user = ?`, [clienteDB[0].telefono]);
            // busca los archivos asociados al cliente
            const arrayArchivosClienteDB = await pool.query(`SELECT archivo_id, prestamo_id, celular, nombre_archivo, tipo_documento, fecha_subida FROM archivos_prestamos where celular = '${clienteDB[0].telefono}'`);

            // console.log(clienteDB[0]);
            res.render("editar-cliente", {
                cliente: clienteDB[0],
                user: userDB[0],
                arrayArchivosCliente: arrayArchivosClienteDB,
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

        } catch (error) {
            console.log(error)
            res.render("editar-cliente", {
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
router.post('/app-clientes/editar-cliente/:id', async(req, res) => {
    const id = req.params.id;
    console.log('Cliente ID:', id);

    const { telefono, pass, estado_cliente, origen } = req.body;
    const actualizacionCliente = { telefono, estado_cliente, origen };
    const name = 'Usuario Externo';
    const rol = 'Cliente App';

    try {
        // Verifica si el cliente existe
        const clienteDB = await pool.query("SELECT * FROM app_clientes WHERE cliente_id = ?", [id]);

        if (clienteDB.length === 0) {
            return res.status(404).send('Cliente no encontrado');
        }

        const telefono = clienteDB[0].telefono;

        // Verifica si existe un usuario con el teléfono en `users`
        const userDB = await pool.query("SELECT * FROM users WHERE user = ?", [telefono]);

        // Si hay contraseña, actualiza tanto en `app_clientes` como en `users`
        if (pass) {
            const passwordHash = await bcrypt.hash(pass, 8); // Hash de contraseña

            // Actualiza el campo `pass` en `app_clientes`
            await pool.query("UPDATE app_clientes SET pass = ? WHERE cliente_id = ?", [passwordHash, id]);

            // Si existe el usuario en `users`, actualiza la contraseña
            if (userDB.length > 0) {
                console.log('Actualizando contraseña del usuario existente');
                await pool.query("UPDATE users SET pass = ? WHERE user = ?", [passwordHash, telefono]);
            } else {
                // Si no existe, lo crea
                console.log('Creando nuevo usuario');

                const nuevoUsuario = {
                    user: telefono,
                    name: name,
                    pass: passwordHash,
                    rol: rol,
                    estado_usuario: 'Activo'
                };

                const resultadoInsercion = await pool.query("INSERT INTO users SET ?", nuevoUsuario);

                if (resultadoInsercion.affectedRows > 0) {
                    console.log('Usuario creado exitosamente');
                } else {
                    console.log('Error al crear el usuario');
                }
            }

            // inicio envio de correo
            const device = req.useragent.isMobile ? 'Mobile' : 'Desktop';
            const browser = req.useragent.browser;
            const sistemaOperativo = req.useragent.os
            const plataforma = req.useragent.platform
            const fecha = new Date().toLocaleString('en-US', { timeZone: 'America/Santo_Domingo' });

            var callback = function(res) {

                // #1 FUNCION QUE ENVIA AL CORREO NOTIFICACION DE SOLICITUD DE PRESTAMOS A ROSFAL
                async function notificacionCorreo() {
                    try {
                        const from = "contacto@rosfal.com"
                        const toNotificacion = "jfalcon@rosfal.com"

                        // console.log(nombre + " en enviar correo");
                        // console.log(apellido + " en enviar correo");

                        // Configurar la conexión SMTP con el servidor de correo personalizado
                        let transporter = nodemailer.createTransport({
                            host: "mail.privateemail.com",
                            port: 465, // El puerto puede variar según la configuración de su servidor
                            secure: true, // Si utiliza SSL/TLS, establezca este valor en true
                            tls: {
                                rejectUnauthorized: false
                            },
                            auth: {
                                user: process.env.USERCORREO,
                                pass: process.env.PASSCORREO,
                            },
                        });

                        // Configurar los detalles del correo electrónico
                        let info = await transporter.sendMail({
                            from: `${from} ROSFAL SOLUCIONES DE PRESTAMOS`,
                            to: `${toNotificacion}`,
                            subject: `Actualizacion de password cliente app en aplicacion web ${telefono} `,
                            html: `
         
         <P><strong>Asunto</strong>: Confirmación actualizacion de password cliente desde la aplicacion web.</p><br>

        
            <P><strong>Direccion ip</strong>: ${ip_app_cliente}</p>
            <P><strong>Dispositivo</strong>: ${device}</p>
            <P><strong>Navegador</strong>: ${browser}</p>
            <P><strong>Sistema Operativo</strong>: ${sistemaOperativo}</p>
            <P><strong>Plataforma</strong>: ${plataforma}</p>
            <P><strong>Pais</strong>: ${res.country_name}</p>
            <P><strong>Ciudad</strong>: ${res.city}</p>
            <P><strong>Latitud</strong>: ${res.latitude} <strong>longitud</strong>: ${res.longitude}</p>
            <P><strong>Origen</strong>: ${origen}</p>
            <P><strong>Token SMS</strong>: ${token_registro_sms}</p>
            <P><strong>Fecha</strong>: ${fecha}</p><br>
        
     
         <P>Atentamente,</p>
     
         <h4 style="color: #2D8DBD;">ROSFAL SOLUCIONES DE PRESTAMOS</h4>
         <P><strong>T.</strong> 829-856-0203 <strong>EMAIL.</strong> contacto@rosfal.com </P>
         <P>Síguenos en <strong>FB:</strong> Rosfalrd <strong>IG:</strong> @Rosfalrd </P>
         <a href="www.rosfal.com">www.rosfal.com</a>
         `

                        });

                        console.log("Correo enviado: %s", info.messageId);

                    } catch (error) {
                        console.log(error);
                    }
                }
                notificacionCorreo()
            };
            ipapi.location(callback, `${ip_app_cliente}`)
                // fin envio de correo

            // Redirige y termina la ejecución
            return res.redirect('/app-clientes');
        }

        // Si no hay contraseña, actualiza solo los demás campos en `app_clientes`
        await pool.query("UPDATE app_clientes SET ? WHERE cliente_id = ?", [actualizacionCliente, id]);

        // Redirige después de la actualización
        res.redirect('/app-clientes');
    } catch (error) {
        console.error('Error durante la actualización:', error);
        res.status(500).send('Hubo un error actualizando el cliente.');
    }
});

//ELIMINAR CLIENTE 
router.get("/app-clientes/eliminar-cliente/:id", async(req, res) => {
    const { id } = req.params;

    console.log(id)

    const clienteDB = await pool.query("SELECT * FROM app_clientes WHERE cliente_id = ?", [id]);

    // Verifica si existe un usuario con el teléfono en `users`
    const userDB = await pool.query("SELECT * FROM users WHERE user = ?", [clienteDB[0].telefono]);

    try {
        if (userDB.length > 0) {
            await pool.query("DELETE FROM users WHERE user = ?", [userDB[0].user]);
            await pool.query("DELETE FROM app_clientes WHERE cliente_id = ?", [id]);
            return res.redirect('/app-clientes');
        } else {
            await pool.query("DELETE FROM app_clientes WHERE cliente_id = ?", [id]);
            res.redirect("/app-clientes");
        }
    } catch (error) {
        console.log(error)
    }
});







module.exports = router;