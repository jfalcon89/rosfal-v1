const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");
const bcrypt = require('bcryptjs');
const ipapi = require('ipapi.co');
const nodemailer = require("nodemailer");
const useragent = require('express-useragent');
const { obtenerConteos } = require("../services/conteosService");




router.get('/promociones', async(req, res) => {
    if (req.session.loggedin) {

        // Aquí usas el servicio centralizado
        const conteos = await obtenerConteos();

        let i = 0

        const permiso_A = 'Administrador'
        const permiso_B = 'Representante'
        const permiso_C = 'Cliente App'
        const arrayUsuariosVDB = await pool.query('SELECT * FROM users ');
        const arrayClientesVDB = await pool.query(`SELECT c.*, COALESCE(s.nombre, '') AS nombre_solicitud, COALESCE(s.apellido, '') AS apellido_solicitud FROM app_clientes c LEFT JOIN (SELECT celular, nombre, apellido FROM solicitudes GROUP BY celular) s ON c.telefono = s.celular;`);
        const clienteDB = await pool.query('SELECT * FROM app_clientes ');
        const promocionesDB = await pool.query(`SELECT * FROM promociones `);
        res.render("promociones", {
            arrayClientesV: arrayClientesVDB,
            arrayUsuariosV: arrayUsuariosVDB,
            cliente: clienteDB[0],
            i,
            login: true,
            name: req.session.name,
            rol: req.session.rol,
            permiso_A,
            permiso_B,
            permiso_C,
            conteos,
            promociones: promocionesDB
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
router.get('/clientes-promociones-adm', async(req, res) => {
    if (req.session.loggedin) {
        let i = 0;

        // Aquí usas el servicio centralizado
        const conteos = await obtenerConteos();
        const permiso_A = 'Administrador'
        const permiso_B = 'Representante'
        const permiso_C = 'Cliente App'
        const arrayUsuariosVDB = await pool.query('SELECT * FROM users ');
        const arrayClientesVDB = await pool.query(`SELECT c.*, COALESCE(s.nombre, '') AS nombre_solicitud, COALESCE(s.apellido, '') AS apellido_solicitud FROM app_clientes c LEFT JOIN (SELECT celular, nombre, apellido FROM solicitudes GROUP BY celular) s ON c.telefono = s.celular;`);
        const promocionesClienteDB = await pool.query(`SELECT 
                                                            p.*, 
                                                            u.user AS usuario, 
                                                            CASE 
                                                                WHEN u.name = 'Usuario Externo' AND u.rol = 'Cliente App' THEN 'Credito' 
                                                                ELSE 'Debito' 
                                                            END AS tipo_bono
                                                        FROM 
                                                            promociones_clientes p
                                                        LEFT JOIN 
                                                            users u ON p.cliente_id = u.idUsuario;`);
        const pagosPromocionesDB = await pool.query(`SELECT 
                                                        SUM(CASE WHEN u.name = 'Usuario Externo' AND u.rol = 'Cliente App' AND p.estado_promocion = 'Aprobado' THEN p.valor_credito ELSE 0 END) AS creditos_aprobado,
                                                        SUM(CASE WHEN u.name = 'Usuario Externo' AND u.rol = 'Cliente App' AND p.estado_promocion = 'En revision' THEN p.valor_credito ELSE 0 END) AS creditos_en_revision,
                                                        SUM(CASE WHEN u.name = 'Usuario Externo' AND u.rol = 'Cliente App' AND p.estado_promocion = 'Liquidado' THEN p.valor_credito ELSE 0 END) AS creditos_liquidado,
                                                        SUM(CASE WHEN u.name = 'Usuario Externo' AND u.rol = 'Cliente App' AND p.estado_promocion = 'Declinado' THEN p.valor_credito ELSE 0 END) AS creditos_declinado,
                                                        SUM(CASE WHEN (u.name != 'Usuario Externo' OR u.rol != 'Cliente App') AND p.estado_promocion = 'Aprobado' THEN p.valor_credito ELSE 0 END) AS debitos_aprobado,
                                                        SUM(CASE WHEN (u.name != 'Usuario Externo' OR u.rol != 'Cliente App') AND p.estado_promocion = 'En revision' THEN p.valor_credito ELSE 0 END) AS debitos_en_revision,
                                                        SUM(CASE WHEN (u.name != 'Usuario Externo' OR u.rol != 'Cliente App') AND p.estado_promocion = 'Liquidado' THEN p.valor_credito ELSE 0 END) AS debitos_liquidado
                                                    FROM 
                                                        promociones_clientes p
                                                    LEFT JOIN 
                                                        users u ON p.cliente_id = u.idUsuario;`);

        res.render("clientes-promociones-adm", {
            i,
            arrayClientesV: arrayClientesVDB,
            arrayUsuariosV: arrayUsuariosVDB,
            login: true,
            name: req.session.name,
            rol: req.session.rol,
            permiso_A,
            permiso_B,
            permiso_C,
            conteos,
            promocionesCliente: promocionesClienteDB,
            pagosPromociones: pagosPromocionesDB

        });
    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
            device: req.useragent.isMobile ? 'Mobile' : 'Desktop'
        });
    }
})


//CREANDO NUEVO CLIENTE ****************
router.post("/promociones", async(req, res) => {
    const { codigo_promocion, valor_credito, inicio_vigencia, fin_vigencia, estado_promocion, origen_bono } = req.body;
    let i = 0;
    // Aquí usas el servicio centralizado
    const conteos = await obtenerConteos();
    const permiso_A = 'Administrador'
    const permiso_B = 'Representante'
    const permiso_C = 'Cliente App'
    const arrayUsuariosVDB = await pool.query('SELECT * FROM users ');
    const arrayClientesVDB = await pool.query(`SELECT c.*, COALESCE(s.nombre, '') AS nombre_solicitud, COALESCE(s.apellido, '') AS apellido_solicitud FROM app_clientes c LEFT JOIN (SELECT celular, nombre, apellido FROM solicitudes GROUP BY celular) s ON c.telefono = s.celular;`);
    const clienteDB = await pool.query('SELECT * FROM app_clientes ');
    const promocionesDB = await pool.query(`SELECT * FROM promociones `);


    // Verificar si el código de promoción existe
    const promocionesValidacionDB = await pool.query(`SELECT * FROM promociones WHERE codigo_promocion = "${codigo_promocion}" `);

    if (promocionesValidacionDB.length > 0) {
        // Parámetros para la alerta de código inválido
        return res.render('promociones', {
            i,
            arrayClientesV: arrayClientesVDB,
            arrayUsuariosV: arrayUsuariosVDB,
            cliente: clienteDB[0],
            login: true,
            name: req.session.name,
            rol: req.session.rol,
            permiso_A,
            permiso_B,
            permiso_C,
            conteos,
            promociones: promocionesDB,
            alert: true,
            alertTitle: "Código inválido",
            alertMessage: "El código de promoción ingresado esta cargado.",
            alertIcon: "error",
            showConfirmButton: true,
            timer: 4000, // 4 segundos
            ruta: `/promociones`
        });
    }


    const nuevaPromocion = {
        codigo_promocion,
        valor_credito,
        estado_promocion,
        origen_bono
    };

    await pool.query("INSERT INTO promociones SET ?", nuevaPromocion);

    if (promocionesValidacionDB.length === 0) {
        // Parámetros para la alerta de código inválido
        return res.render('promociones', {
            i,
            arrayClientesV: arrayClientesVDB,
            arrayUsuariosV: arrayUsuariosVDB,
            cliente: clienteDB[0],
            login: true,
            name: req.session.name,
            rol: req.session.rol,
            permiso_A,
            permiso_B,
            permiso_C,
            conteos,
            promociones: promocionesDB,
            alert: true,
            alertTitle: "Promoción Agregada",
            alertMessage: "Código de promoción agregado satisfactoriamente.",
            alertIcon: "success",
            showConfirmButton: true,
            timer: 4000, // 4 segundos
            ruta: `/promociones`
        });
    }

    // res.redirect('/promociones');

});

//ACTUALIZA PROMOCION ****************
router.post("/promociones/editar-promocion/:id", async(req, res) => {
    const { codigo_promocion, valor_credito, inicio_vigencia, fin_vigencia, estado_promocion, origen_bono } = req.body;
    const id = req.params.id;
    let i = 0;

    // Aquí usas el servicio centralizado
    const conteos = await obtenerConteos();
    const permiso_A = 'Administrador'
    const permiso_B = 'Representante'
    const permiso_C = 'Cliente App'
    const arrayUsuariosVDB = await pool.query('SELECT * FROM users ');
    const arrayClientesVDB = await pool.query(`SELECT c.*, COALESCE(s.nombre, '') AS nombre_solicitud, COALESCE(s.apellido, '') AS apellido_solicitud FROM app_clientes c LEFT JOIN (SELECT celular, nombre, apellido FROM solicitudes GROUP BY celular) s ON c.telefono = s.celular;`);
    const clienteDB = await pool.query('SELECT * FROM app_clientes ');
    const promocionesDB = await pool.query(`SELECT * FROM promociones `);


    const actualizacionPromocion = {
        codigo_promocion,
        valor_credito,
        estado_promocion,
        origen_bono
    };

    await pool.query("UPDATE promociones SET ? WHERE id_promocion = ?", [actualizacionPromocion, id]);

    // Parámetros para la alerta de código inválido
    return res.render('promociones', {
        i,
        arrayClientesV: arrayClientesVDB,
        arrayUsuariosV: arrayUsuariosVDB,
        cliente: clienteDB[0],
        login: true,
        name: req.session.name,
        rol: req.session.rol,
        permiso_A,
        permiso_B,
        permiso_C,
        conteos,
        promociones: promocionesDB,
        alert: true,
        alertTitle: "Promoción Actualizada",
        alertMessage: "Código de promoción actualizado satisfactoriamente.",
        alertIcon: "success",
        showConfirmButton: true,
        timer: 3000, // 3 segundos
        ruta: "/promociones"
    });


    // res.redirect('/promociones');

});

//ACTUALIZA PROMOCION CLIENTE ****************
router.post("/clientes-promociones-adm/editar-promocion-cliente/:id", async(req, res) => {
    const { codigo_promocion, valor_credito, inicio_vigencia, fin_vigencia, estado_promocion, origen_bono } = req.body;
    const id = req.params.id;
    let i = 0;
    // Aquí usas el servicio centralizado
    const conteos = await obtenerConteos();
    const permiso_A = 'Administrador'
    const permiso_B = 'Representante'
    const permiso_C = 'Cliente App'
    const arrayUsuariosVDB = await pool.query('SELECT * FROM users ');
    const arrayClientesVDB = await pool.query(`SELECT c.*, COALESCE(s.nombre, '') AS nombre_solicitud, COALESCE(s.apellido, '') AS apellido_solicitud FROM app_clientes c LEFT JOIN (SELECT celular, nombre, apellido FROM solicitudes GROUP BY celular) s ON c.telefono = s.celular;`);
    const clienteDB = await pool.query('SELECT * FROM app_clientes ');
    const promocionesDB = await pool.query(`SELECT * FROM promociones `);
    const promocionesClienteDB = await pool.query(`SELECT 
        p.*, 
        CASE 
            WHEN u.name = 'Usuario Externo' AND u.rol = 'Cliente App' THEN 'Credito' 
            ELSE 'Debito' 
        END AS tipo_bono
    FROM 
        promociones_clientes p
    LEFT JOIN 
        users u ON p.cliente_id = u.idUsuario;`);
    const pagosPromocionesDB = await pool.query(`SELECT 
        SUM(CASE WHEN u.name = 'Usuario Externo' AND u.rol = 'Cliente App' AND p.estado_promocion = 'Aprobado' THEN p.valor_credito ELSE 0 END) AS creditos_aprobado,
        SUM(CASE WHEN u.name = 'Usuario Externo' AND u.rol = 'Cliente App' AND p.estado_promocion = 'En revision' THEN p.valor_credito ELSE 0 END) AS creditos_en_revision,
        SUM(CASE WHEN u.name = 'Usuario Externo' AND u.rol = 'Cliente App' AND p.estado_promocion = 'Liquidado' THEN p.valor_credito ELSE 0 END) AS creditos_liquidado,
        SUM(CASE WHEN (u.name != 'Usuario Externo' OR u.rol != 'Cliente App') AND p.estado_promocion = 'Aprobado' THEN p.valor_credito ELSE 0 END) AS debitos_aprobado,
        SUM(CASE WHEN (u.name != 'Usuario Externo' OR u.rol != 'Cliente App') AND p.estado_promocion = 'En revision' THEN p.valor_credito ELSE 0 END) AS debitos_en_revision,
        SUM(CASE WHEN (u.name != 'Usuario Externo' OR u.rol != 'Cliente App') AND p.estado_promocion = 'Liquidado' THEN p.valor_credito ELSE 0 END) AS debitos_liquidado
    FROM 
        promociones_clientes p
    LEFT JOIN 
        users u ON p.cliente_id = u.idUsuario;`);


    const actualizacionPromocion = {
        codigo_promocion,
        valor_credito,
        estado_promocion,
        origen_bono
    };

    await pool.query("UPDATE promociones_clientes SET ? WHERE id_promocion = ?", [actualizacionPromocion, id]);

    // Parámetros para la alerta de código inválido
    return res.render('clientes-promociones-adm', {
        i,
        promocionesCliente: promocionesClienteDB,
        pagosPromociones: pagosPromocionesDB,
        arrayClientesV: arrayClientesVDB,
        arrayUsuariosV: arrayUsuariosVDB,
        cliente: clienteDB[0],
        login: true,
        name: req.session.name,
        rol: req.session.rol,
        permiso_A,
        permiso_B,
        permiso_C,
        conteos,
        promociones: promocionesDB,
        alert: true,
        alertTitle: "Promoción Actualizada",
        alertMessage: "Código de promoción actualizado satisfactoriamente.",
        alertIcon: "success",
        showConfirmButton: true,
        timer: 3000, // 3 segundos
        ruta: `/clientes-promociones-adm`
    });


    // res.redirect('/promociones');

});

//ELIMINAR PROMOCION SISTEMA 
router.get("/promociones/eliminar-promocion/:id", async(req, res) => {
    const { id } = req.params;

    console.log(id)

    try {

        await pool.query("DELETE FROM promociones WHERE id_promocion = ?", [id]);

        res.redirect("/promociones");

    } catch (error) {
        console.log(error)
    }
});
//ELIMINAR PROMOCION CLIENTES 
router.get("/clientes-promociones/eliminar-promocion-cliente/:id", async(req, res) => {
    const { id } = req.params;

    console.log(id)

    try {

        await pool.query("DELETE FROM promociones_clientes WHERE id_promocion = ?", [id]);

        res.redirect("/clientes-promociones-adm");

    } catch (error) {
        console.log(error)
    }
});





// ---------------------------------------------------------------------------------

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
            device: req.useragent.isMobile ? 'Mobile' : 'Desktop'
        });
    }
})

//EDITAR SOLICITUD EN ESTADO NUEVA ************
// router.get("/app-clientes/editar-cliente/:id", async(req, res) => {
//     if (req.session.loggedin) {

//         const id = req.params.id
//         console.log(req.params)


//         const permiso_A = 'Administrador'
//         const permiso_B = 'Representante'
//         const permiso_C = 'Cliente App'
//         const arrayUsuarios = await pool.query('SELECT idUsuario FROM users ');
//         const arrayClientes = await pool.query('SELECT cliente_id FROM app_clientes ');
//         const arraySolicitudes = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
//         const arrayMensajesNuevos = await pool.query('SELECT idMensaje FROM mensajes WHERE estadoMensaje="Nuevo"');
//         const arrayVisitas = await pool.query('SELECT idVisita FROM visitas ');
//         const arrayTestimoniosNuevos = await pool.query('SELECT idTestimonio FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');

//         try {
//             const arrayUsuariosVDB = await pool.query('SELECT * FROM users ');
//             const arrayClientesVDB = await pool.query(`SELECT c.*, COALESCE(s.nombre, '') AS nombre_solicitud, COALESCE(s.apellido, '') AS apellido_solicitud FROM app_clientes c LEFT JOIN (SELECT celular, nombre, apellido FROM solicitudes GROUP BY celular) s ON c.telefono = s.celular;`);
//             const clienteDB = await pool.query("SELECT * FROM app_clientes WHERE cliente_id = ?", [id]);
//             // Verifica si existe un usuario con el teléfono en `users`
//             const userDB = await pool.query(`SELECT * FROM users WHERE user = ?`, [clienteDB[0].telefono]);
//             // busca los archivos asociados al cliente
//             const arrayArchivosClienteDB = await pool.query(`SELECT archivo_id, prestamo_id, celular, nombre_archivo, tipo_documento, fecha_subida FROM archivos_prestamos where celular = '${clienteDB[0].telefono}'`);

//             // console.log(clienteDB[0]);
//             res.render("editar-cliente", {
//                 cliente: clienteDB[0],
//                 user: userDB[0],
//                 arrayArchivosCliente: arrayArchivosClienteDB,
//                 arrayClientesV: arrayClientesVDB,
//                 arrayUsuariosV: arrayUsuariosVDB,
//                 login: true,
//                 name: req.session.name,
//                 rol: req.session.rol,
//                 permiso_A,
//                 permiso_B,
//                 permiso_C,
//                 arrayUsuarios,
//                 arrayClientes,
//                 arraySolicitudes,
//                 arrayMensajesNuevos,
//                 arrayVisitas,
//                 arrayTestimoniosNuevos
//             });

//         } catch (error) {
//             console.log(error)
//             res.render("editar-cliente", {
//                 error: true,
//                 mensaje: "no se encuentra el id seleccionado"
//             });
//         }

//     } else {
//         res.render('login', {
//             login: false,
//             name: 'Debe iniciar sesión',
//             device: req.useragent.isMobile ? 'Mobile' : 'Desktop'
//         });
//     }
// });


//GUARDAR ACTUALIZACION DE SOLICITUD DESDE NUEVAS
// router.post('/app-clientes/editar-cliente/:id', async(req, res) => {
//     const id = req.params.id;
//     console.log('Cliente ID:', id);

//     const { telefono, pass, estado_cliente, origen } = req.body;
//     const actualizacionCliente = { telefono, estado_cliente, origen };
//     const name = 'Usuario Externo';
//     const rol = 'Cliente App';

//     try {
//         // Verifica si el cliente existe
//         const clienteDB = await pool.query("SELECT * FROM app_clientes WHERE cliente_id = ?", [id]);

//         if (clienteDB.length === 0) {
//             return res.status(404).send('Cliente no encontrado');
//         }

//         const telefono = clienteDB[0].telefono;

//         // Verifica si existe un usuario con el teléfono en `users`
//         const userDB = await pool.query("SELECT * FROM users WHERE user = ?", [telefono]);

//         // Si hay contraseña, actualiza tanto en `app_clientes` como en `users`
//         if (pass) {
//             const passwordHash = await bcrypt.hash(pass, 8); // Hash de contraseña

//             // Actualiza el campo `pass` en `app_clientes`
//             await pool.query("UPDATE app_clientes SET pass = ? WHERE cliente_id = ?", [passwordHash, id]);

//             // Si existe el usuario en `users`, actualiza la contraseña
//             if (userDB.length > 0) {
//                 console.log('Actualizando contraseña del usuario existente');
//                 await pool.query("UPDATE users SET pass = ? WHERE user = ?", [passwordHash, telefono]);
//             } else {
//                 // Si no existe, lo crea
//                 console.log('Creando nuevo usuario');

//                 const nuevoUsuario = {
//                     user: telefono,
//                     name: name,
//                     pass: passwordHash,
//                     rol: rol,
//                     estado_usuario: 'Activo'
//                 };

//                 const resultadoInsercion = await pool.query("INSERT INTO users SET ?", nuevoUsuario);

//                 if (resultadoInsercion.affectedRows > 0) {
//                     console.log('Usuario creado exitosamente');
//                 } else {
//                     console.log('Error al crear el usuario');
//                 }
//             }

//             // inicio envio de correo
//             const device = req.useragent.isMobile ? 'Mobile' : 'Desktop';
//             const browser = req.useragent.browser;
//             const sistemaOperativo = req.useragent.os
//             const plataforma = req.useragent.platform
//             const fecha = new Date().toLocaleString('en-US', { timeZone: 'America/Santo_Domingo' });

//             var callback = function(res) {

//                 // #1 FUNCION QUE ENVIA AL CORREO NOTIFICACION DE SOLICITUD DE PRESTAMOS A ROSFAL
//                 async function notificacionCorreo() {
//                     try {
//                         const from = "contacto@rosfal.com"
//                         const toNotificacion = "jfalcon@rosfal.com"

//                         // console.log(nombre + " en enviar correo");
//                         // console.log(apellido + " en enviar correo");

//                         // Configurar la conexión SMTP con el servidor de correo personalizado
//                         let transporter = nodemailer.createTransport({
//                             host: "mail.privateemail.com",
//                             port: 465, // El puerto puede variar según la configuración de su servidor
//                             secure: true, // Si utiliza SSL/TLS, establezca este valor en true
//                             tls: {
//                                 rejectUnauthorized: false
//                             },
//                             auth: {
//                                 user: process.env.USERCORREO,
//                                 pass: process.env.PASSCORREO,
//                             },
//                         });

//                         // Configurar los detalles del correo electrónico
//                         let info = await transporter.sendMail({
//                             from: `${from} ROSFAL SOLUCIONES DE PRESTAMOS`,
//                             to: `${toNotificacion}`,
//                             subject: `Actualizacion de password cliente app en aplicacion web ${telefono} `,
//                             html: `

//          <P><strong>Asunto</strong>: Confirmación actualizacion de password cliente desde la aplicacion web.</p><br>


//             <P><strong>Direccion ip</strong>: ${ip_app_cliente}</p>
//             <P><strong>Dispositivo</strong>: ${device}</p>
//             <P><strong>Navegador</strong>: ${browser}</p>
//             <P><strong>Sistema Operativo</strong>: ${sistemaOperativo}</p>
//             <P><strong>Plataforma</strong>: ${plataforma}</p>
//             <P><strong>Pais</strong>: ${res.country_name}</p>
//             <P><strong>Ciudad</strong>: ${res.city}</p>
//             <P><strong>Latitud</strong>: ${res.latitude} <strong>longitud</strong>: ${res.longitude}</p>
//             <P><strong>Origen</strong>: ${origen}</p>
//             <P><strong>Token SMS</strong>: ${token_registro_sms}</p>
//             <P><strong>Fecha</strong>: ${fecha}</p><br>


//          <P>Atentamente,</p>

//          <h4 style="color: #2D8DBD;">ROSFAL SOLUCIONES DE PRESTAMOS</h4>
//          <P><strong>T.</strong> 829-856-0203 <strong>EMAIL.</strong> contacto@rosfal.com </P>
//          <P>Síguenos en <strong>FB:</strong> Rosfalrd <strong>IG:</strong> @Rosfalrd </P>
//          <a href="www.rosfal.com">www.rosfal.com</a>
//          `

//                         });

//                         console.log("Correo enviado: %s", info.messageId);

//                     } catch (error) {
//                         console.log(error);
//                     }
//                 }
//                 notificacionCorreo()
//             };
//             ipapi.location(callback, `${ip_app_cliente}`)
//                 // fin envio de correo

//             // Redirige y termina la ejecución
//             return res.redirect('/app-clientes');
//         }

//         // Si no hay contraseña, actualiza solo los demás campos en `app_clientes`
//         await pool.query("UPDATE app_clientes SET ? WHERE cliente_id = ?", [actualizacionCliente, id]);

//         // Redirige después de la actualización
//         res.redirect('/app-clientes');
//     } catch (error) {
//         console.error('Error durante la actualización:', error);
//         res.status(500).send('Hubo un error actualizando el cliente.');
//     }
// });

//ELIMINAR CLIENTE 
// router.get("/app-clientes/eliminar-cliente/:id", async(req, res) => {
//     const { id } = req.params;

//     console.log(id)

//     const clienteDB = await pool.query("SELECT * FROM app_clientes WHERE cliente_id = ?", [id]);

//     // Verifica si existe un usuario con el teléfono en `users`
//     const userDB = await pool.query("SELECT * FROM users WHERE user = ?", [clienteDB[0].telefono]);

//     try {
//         if (userDB.length > 0) {
//             await pool.query("DELETE FROM users WHERE user = ?", [userDB[0].user]);
//             await pool.query("DELETE FROM app_clientes WHERE cliente_id = ?", [id]);
//             return res.redirect('/app-clientes');
//         } else {
//             await pool.query("DELETE FROM app_clientes WHERE cliente_id = ?", [id]);
//             res.redirect("/app-clientes");
//         }
//     } catch (error) {
//         console.log(error)
//     }
// });







module.exports = router;