const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
// const empleado = require("../modelo/empleado");
const moment = require("moment");
const pool = require("../database");
const bcrypt = require('bcryptjs');
const ipapi = require('ipapi.co');
const nodemailer = require("nodemailer");

const useragent = require('express-useragent');


let datosCompartidos = '';

// VISTA APP INICIO
router.get('/app-inicio', (req, res) => {

    // const ipString = "201.229.238.223, 172.71.82.116";
    const ipString = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ip = ipString.split(',')[0];
    const device = req.useragent.isMobile ? 'Mobile' : 'Desktop';
    const bot = req.useragent.isBot ? 'true' : 'false';
    const browser = req.useragent.browser;
    const sistemaOperativo = req.useragent.os
    const plataforma = req.useragent.platform
    const fecha = new Date().toLocaleString('en-US', { timeZone: 'America/Santo_Domingo' });

    // const device = 'Mobile';
    console.log(device)

    var callback = function(res) {

        const pais = res.country_name;
        const ciudad = res.city;
        const latitud = res.latitude;
        const longitud = res.longitude;

        const nuevaVisita = {
            pais,
            ciudad,
            ip,
            device,
            browser,
            sistemaOperativo,
            plataforma,
            latitud,
            longitud,
            fecha,
            bot
        };

        console.log(nuevaVisita)

        pool.query('INSERT INTO visitas set ?', [nuevaVisita]);

    };

    ipapi.location(callback, `${ip}`)

    res.render('app-inicio');
})


// VISTA REGISTRO DE TELEFONO
router.get('/app-registro', (req, res) => {



    res.render('app-registro');
})

// GUARDAR EL TELEFONO Y EL TOKEN DEL CLIENTE
router.post('/app-registro', async(req, res) => {

    function generarNumeroAleatorio() {
        return Math.floor(100000 + Math.random() * 900000);
    };

    // const id_iteracion = generarIdIteracion();
    // const ipString = "201.229.238.223, 172.71.82.116";
    const ipString = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ip_app_cliente = ipString.split(',')[0];
    const telefono = req.body.telefono;
    const token_registro_sms = generarNumeroAleatorio();
    const origen = 'Movil App'
    const estado_cliente = 'Activo'

    // const data = id_iteracion; // Supone que envías un JSON con los datos
    datosCompartidos = telefono; // Almacena los datos en memoria

    // console.log('telefono post ' + telefono)
    // console.log('token_registro_sms post ' + token_registro_sms)
    // console.log('ip post' + ip_app_cliente);

    const nuevoCliente = {
        telefono,
        token_registro_sms,
        ip_app_cliente,
        estado_cliente,
        origen
    }
    const telefonoDB = await pool.query(`SELECT * FROM app_clientes WHERE telefono = "${telefono}"`);

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
            <P><strong>Latitud</strong>: ${res.latitude} <strong>longitud</strong>: ${res.longitude}</p><br>
            <P><strong>Fecha</strong>: ${fecha}</p>
            <P><strong>Token SMS</strong>: ${token_registro_sms}</p>
           
        
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

    if (telefonoDB.length > 0) {
        // Respuesta JSON para error
        return res.json({
            success: false,
            alertTitle: "Favor verificar",
            alertMessage: "¡Este número ya está registrado!",
            alertIcon: 'warning',
            showConfirmButton: true,
            confirmButtonText: "Reintentar",
            showCancelButton: true, // Mostrar el botón "Iniciar sesión"
            cancelButtonText: "Iniciar sesión",
            ruta: 'login'
        });
    } else {
        pool.query('INSERT INTO app_clientes set ?', [nuevoCliente]);
        // Respuesta JSON para éxito
        return res.json({
            success: true,
            alertTitle: "Excelente",
            alertMessage: "¡Registro exitoso! Revise el codigo enviado a su telefono",
            alertIcon: 'success',
            timer: 1500,
            ruta: `app-validacion-registro`
        });
    }

    // res.redirect('app-validacion-registro')

});


// app-validacion-registro
router.get('/app-validacion-registro', async(req, res) => {
    console.log('datos compartidos get ' + datosCompartidos)

    // const telefono = req.body.telefono
    // const token_registro_sms = req.body.token_registro_sms
    // const ipString = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // const ipString = "201.229.238.223, 172.71.82.116";
    // const ip_app_cliente = ipString.split(',')[0];
    const cliente_idDB = await pool.query(`SELECT * FROM app_clientes WHERE telefono = "${datosCompartidos}" order by cliente_id desc `);
    const app_clienteDB = await pool.query(`SELECT * FROM app_clientes WHERE cliente_id = "${cliente_idDB[0].cliente_id}" order by cliente_id desc `);

    console.log('dime quien eres token ' + cliente_idDB[0].token_registro_sms)
    console.log('dime quien eres cliente_id ' + app_clienteDB[0].cliente_id)

    res.render('app-validacion-registro', {
        app_cliente: app_clienteDB[0]

    })

})

router.post('/app-validacion-registro', async(req, res) => {
    const token_registro_sms = req.body.token_registro_sms;
    const telefono = req.body.telefono;

    const app_clienteDB = await pool.query(`SELECT * FROM app_clientes WHERE telefono = "${telefono}" order by cliente_id desc`);

    console.log('post dime quien eres cliente_id ' + app_clienteDB[0].cliente_id)

    if (app_clienteDB.length == 0 || app_clienteDB[0].token_registro_sms !== token_registro_sms) {
        // Respuesta JSON para error
        return res.json({
            success: false,
            alertTitle: "Error",
            alertMessage: "¡Código incorrecto!",
            alertIcon: 'error'
        });
    } else {
        // Respuesta JSON para éxito
        return res.json({
            success: true,
            alertTitle: "Validación Correcta",
            alertMessage: "¡Registro exitoso!",
            alertIcon: 'success',
            ruta: `app-validacion-registro-2/${app_clienteDB[0].cliente_id}`
        });
    }
});



// app-validacion-registro 2
router.get('/app-validacion-registro-2/:id', async(req, res) => {

    const cliente_id = req.params.id;

    const token_registro_sms = req.body.token_registro_sms

    // const ipString = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ipString = "201.229.238.223, 172.71.82.116";
    const ip_app_cliente = ipString.split(',')[0];
    const app_clienteDB = await pool.query(`SELECT * FROM app_clientes WHERE cliente_id = "${cliente_id}" `);

    // const telefono = req.body.telefono;
    // const token_registro_sms = '1234';

    // console.log('telefono ' + telefono)
    console.log('token_registro_sms capturado registro 2 ' + token_registro_sms)
        // console.log('ip ' + ip_app_cliente);
        // console.log('consulta BD ' + app_clienteDB[0])


    // res.render('app-validacion-registro-2', {
    //     app_cliente: app_clienteDB[0]
    // })

    // Validación del token: Si no coinciden, muestra alerta de error
    res.render('app-validacion-registro-2', {
        app_cliente: app_clienteDB[0]


    })
});

// app-validacion-registro 2
router.post('/app-validacion-registro-2/:id', async(req, res) => {

    const cliente_id = req.params.id;
    const pass = req.body.pass
    let passwordHash = await bcrypt.hash(pass, 8);
    const rol = 'Cliente App'
    const name = 'Usuario Externo'
    const estado_usuario = 'Activo';

    // Obtiene los datos del cliente
    const app_clienteDB = await pool.query(`SELECT * FROM app_clientes WHERE cliente_id = "${cliente_id}" `);

    const telefono = app_clienteDB[0].telefono;

    // Verifica si existe un usuario con el teléfono en `users`
    const userDB = await pool.query(`SELECT * FROM users WHERE user = ?`, [telefono]);

    // datos nuevos agregar
    const actualizacionCliente = {

        pass: passwordHash
    };

    // Si existe el usuario, lo actualiza
    if (userDB.length > 0) {
        await pool.query('UPDATE users SET ? WHERE user = ?', [actualizacionCliente, telefono]);
    } else {
        // Si no existe, lo crea
        await pool.query('INSERT INTO users SET ?', { user: telefono, name: name, pass: passwordHash, rol: rol, estado_usuario });
    }

    await pool.query('UPDATE app_clientes set ? WHERE cliente_id = ?', [actualizacionCliente, cliente_id], async(error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.render('login', {
                alert: true,
                alertTitle: "Listo !! Ya Estas Registrado",
                alertMessage: "¡Successful Registration!",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: 'login'
            });
            // res.redirect('panel-administracion');
        }
        // res.end();

    });

});


// VISTA REGISTRO DE TELEFONO
router.get('/app-update-pass', (req, res) => {



    res.render('app-update-pass');
})


// ACTUALIZA LA CONTRASEÑA
router.post('/app-update-pass', async(req, res) => {

    function generarNumeroAleatorio() {
        return Math.floor(100000 + Math.random() * 900000);
    };


    // const ipString = "201.229.238.223, 172.71.82.116";
    const ipString = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ip_app_cliente = ipString.split(',')[0];
    const telefono = req.body.telefono;
    const token_registro_sms = generarNumeroAleatorio();


    datosCompartidos = telefono; // Almacena los datos en memoria

    console.log('telefono post ' + telefono)
    console.log('token_registro_sms post ' + token_registro_sms)
    console.log('ip post' + ip_app_cliente);


    const nuevoCliente = {
        telefono,
        token_registro_sms,
        ip_app_cliente

    };

    const updateToken = {
        token_registro_sms
    };

    const telefonoDB = await pool.query(`SELECT * FROM app_clientes WHERE telefono = "${telefono}"`);

    if (telefonoDB.length > 0) {
        pool.query('UPDATE app_clientes set ? WHERE telefono = ?', [updateToken, telefonoDB[0].telefono]);

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
                        subject: `Actualizacion de password cliente app ${telefono} `,
                        html: `
         
         <P><strong>Asunto</strong>: Confirmación actualizacion de password cliente</p><br>

        
         <P><strong>Direccion ip</strong>: ${ip_app_cliente}</p>
         <P><strong>Dispositivo</strong>: ${device}</p>
         <P><strong>Navegador</strong>: ${browser}</p>
         <P><strong>Sistema Operativo</strong>: ${sistemaOperativo}</p>
         <P><strong>Plataforma</strong>: ${plataforma}</p>
         <P><strong>Pais</strong>: ${res.country_name}</p>
         <P><strong>Ciudad</strong>: ${res.city}</p>
         <P><strong>Fecha</strong>: ${fecha}</p>
         <P><strong>Token SMS</strong>: ${token_registro_sms}</p>
         <P><strong>Latitud</strong>: ${res.latitude} <strong>longitud</strong>: ${res.longitude}</p><br>
        
     
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

        // Respuesta JSON para error
        return res.json({
            success: true,
            alertTitle: "Excelente",
            alertMessage: "Revise el codigo enviado a su telefono",
            alertIcon: 'success',
            timer: 1500,
            ruta: `app-update-pass-validacion`
        });
    } else {

        // Respuesta JSON para éxito
        return res.json({
            success: false,
            alertTitle: "Favor verificar",
            alertMessage: "¡Este número NO está registrado!",
            alertIcon: 'warning',
            showConfirmButton: true,
            confirmButtonText: "Reintentar",
            showCancelButton: true, // Mostrar el botón "Iniciar sesión"
            cancelButtonText: "Registrarse",
            ruta: 'app-registro'
        });
    }

});


// app-update-pass-validacion
router.get('/app-update-pass-validacion', async(req, res) => {
    console.log('datos compartidos get ' + datosCompartidos)

    // const telefono = req.body.telefono
    // const token_registro_sms = req.body.token_registro_sms
    // const ipString = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // const ipString = "201.229.238.223, 172.71.82.116";
    // const ip_app_cliente = ipString.split(',')[0];
    const cliente_idDB = await pool.query(`SELECT * FROM app_clientes WHERE telefono = "${datosCompartidos}" order by cliente_id desc `);
    const app_clienteDB = await pool.query(`SELECT * FROM app_clientes WHERE cliente_id = "${cliente_idDB[0].cliente_id}" order by cliente_id desc `);

    console.log('dime quien eres token ' + cliente_idDB[0].token_registro_sms)
    console.log('dime quien eres cliente_id ' + app_clienteDB[0].cliente_id)

    res.render('app-update-pass-validacion', {
        app_cliente: app_clienteDB[0]

    })

})

router.post('/app-update-pass-validacion', async(req, res) => {
    const token_registro_sms = req.body.token_registro_sms;
    const telefono = req.body.telefono;

    const app_clienteDB = await pool.query(`SELECT * FROM app_clientes WHERE telefono = "${telefono}" order by cliente_id desc`);

    console.log('post dime quien eres cliente_id ' + app_clienteDB[0].cliente_id)

    if (app_clienteDB.length == 0 || app_clienteDB[0].token_registro_sms !== token_registro_sms) {
        // Respuesta JSON para error
        return res.json({
            success: false,
            alertTitle: "Error",
            alertMessage: "¡Código incorrecto!",
            alertIcon: 'error'
        });
    } else {
        // Respuesta JSON para éxito
        return res.json({
            success: true,
            alertTitle: "Validación Correcta",
            alertMessage: "¡Registro exitoso!",
            alertIcon: 'success',
            ruta: `app-update-pass-validacion-registro-2/${app_clienteDB[0].cliente_id}`
        });
    }
});


// app-validacion-registro 2
router.get('/app-update-pass-validacion-registro-2/:id', async(req, res) => {

    const cliente_id = req.params.id;

    const token_registro_sms = req.body.token_registro_sms

    // const ipString = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ipString = "201.229.238.223, 172.71.82.116";
    const ip_app_cliente = ipString.split(',')[0];
    const app_clienteDB = await pool.query(`SELECT * FROM app_clientes WHERE cliente_id = "${cliente_id}" `);

    // const telefono = req.body.telefono;
    // const token_registro_sms = '1234';

    // console.log('telefono ' + telefono)
    console.log('token_registro_sms capturado registro 2 ' + token_registro_sms)
        // console.log('ip ' + ip_app_cliente);
        // console.log('consulta BD ' + app_clienteDB[0])


    // res.render('app-validacion-registro-2', {
    //     app_cliente: app_clienteDB[0]
    // })

    // Validación del token: Si no coinciden, muestra alerta de error
    res.render('app-update-pass-validacion-registro-2', {
        app_cliente: app_clienteDB[0]


    })
});

// app-validacion-registro 2
router.post('/app-update-pass-validacion-registro-2/:id', async(req, res) => {
    const cliente_id = req.params.id;
    const pass = req.body.pass;
    let passwordHash = await bcrypt.hash(pass, 8);
    const rol = 'Cliente App';
    const name = 'Usuario Externo';
    const origen = 'Movil App';
    const estado_usuario = 'Activo';

    try {
        // Obtiene los datos del cliente
        const app_clienteDB = await pool.query(`SELECT * FROM app_clientes WHERE cliente_id = ?`, [cliente_id]);

        if (app_clienteDB.length === 0) {
            return res.status(404).send('Cliente no encontrado');
        }

        const telefono = app_clienteDB[0].telefono;

        // Verifica si existe un usuario con el teléfono en `users`
        const userDB = await pool.query(`SELECT * FROM users WHERE user = ?`, [telefono]);

        // Datos nuevos para actualizar o crear
        const actualizacionCliente = { pass: passwordHash };

        // Si existe el usuario, lo actualiza
        if (userDB.length > 0) {
            await pool.query('UPDATE users SET ? WHERE user = ?', [actualizacionCliente, telefono]);
        } else {
            // Si no existe, lo crea
            await pool.query('INSERT INTO users SET ?', { user: telefono, name: name, pass: passwordHash, rol: rol, estado_usuario });
        }

        // Actualiza el campo `pass` en `app_clientes`
        await pool.query('UPDATE app_clientes SET ? WHERE cliente_id = ?', [actualizacionCliente, cliente_id]);

        // Renderiza la respuesta
        res.render('login', {
            alert: true,
            alertTitle: "¡Listo! Contraseña actualizada",
            alertMessage: "¡Successful Registration!",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 1500,
            ruta: 'login'
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error al procesar la solicitud');
    }
});




module.exports = router;