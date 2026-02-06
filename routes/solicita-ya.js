const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
const ipapi = require('ipapi.co');
const useragent = require('express-useragent');

// no se esta usando
// const LocalStorage = require('node-localstorage').LocalStorage;
// const localStorage = LocalStorage('./localStorage');


//RENDERIZANDO LA VISTA SOLICITA YA
router.get('/solicita-ya', (req, res) => {
    const permiso_C = 'Cliente App'

    res.render('solicita-ya', {
        rol: req.session.rol,
        permiso_C
    });
})

//INSERTAR NUEVA SOLICITUD A MYSQL****************
router.post("/solicita-ya", async(req, res) => {
    const {
        cedula,
        nombre,
        apellido,
        sexo,
        estadoCivil,
        direccion,
        direccionNegocio,
        tiempoNegocio,
        email,
        telefono,
        celular,
        nacionalidad,
        nombreFamilia,
        direccionFamilia,
        parentescoFamilia,
        telefonoFamilia,
        apodoFamilia,
        empresa,
        salario,
        puesto,
        dirEmpresa,
        telefonoEmpresa,
        departamento,
        tiempoEmpresa,
        nombreRefPers1,
        nombreRefPers2,
        telefonoRefPer1,
        telefonoRefPer2,
        tipoPrestamo,
        banco,
        numeroCuenta,
        montoSolicitado,
        frecuenciaPagos,
        cantidadPagosSemanales,
        cantidadPagosDiarios,
        cantidadPagosQuincenales,
        cantidadPagosMensuales
    } = req.body;

    const permiso_C = 'Cliente App'

    // OBTENCION DE PARAMAMETROS CLIENTE
    // const ipString = "201.229.238.223, 172.71.82.116";
    const ipString = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ip = ipString.split(',')[0];

    const device = req.useragent.isMobile ? 'Mobile' : 'Desktop';
    const browser = req.useragent.browser;
    const sistemaOperativo = req.useragent.os
    const plataforma = req.useragent.platform
    const fecha = new Date().toLocaleString('en-US', { timeZone: 'America/Santo_Domingo' });

    // fetch(`https://ipgeolocation.abstractapi.com/v1/?api_key=174a3d4da2a14777ab66bef79388279b&ip_address=${ip}`)
    //     .then(response => response.json())
    //     .then(data => {

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
                    from: `${from} ROSFAL SOLUCIONES DE PRÉSTAMOS`,
                    to: `${toNotificacion}`,
                    subject: `Nueva solicitud de Préstamo cliente ${nombre} ${apellido}`,
                    html: `
            
            <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de solicitud de préstamo</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: #2D8DBD;
            color: #ffffff;
            text-align: center;
            padding: 10px;
            border-radius: 8px 8px 0 0;
            font-size: 18px;
            font-weight: bold;
        }
        .content {
            padding: 20px;
            line-height: 1.6;
            color: #333333;
        }
        .footer {
            text-align: center;
            font-size: 14px;
            color: #777777;
            padding: 10px;
            border-top: 1px solid #eeeeee;
        }
        .highlight {
            font-weight: bold;
            color: #2D8DBD;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Confirmación de solicitud de préstamo</div>
        <div class="content">
            <p><strong>Cliente:</strong> ${nombre} ${apellido}</p>
            <p><strong>Cédula:</strong> ${cedula}</p>
            <p><strong>Monto solicitado:</strong> ${montoSolicitado}</p>
            <p><strong>Dirección:</strong> ${direccion}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Celular:</strong> ${celular}</p>
            <p><strong>País:</strong> ${res.country_name}</p>
            <p><strong>Ciudad:</strong> ${res.city}</p>
            <p><strong>Dirección IP:</strong> ${ip}</p>
            <p><strong>Dispositivo:</strong> ${device}</p>
            <p><strong>Navegador:</strong> ${browser}</p>
            <p><strong>Sistema Operativo:</strong> ${sistemaOperativo}</p>
            <p><strong>Plataforma:</strong> ${plataforma}</p>
            <p><strong>Fecha:</strong> ${fecha}</p>
            <p><strong>Latitud:</strong> ${res.latitude} <strong>Longitud:</strong> ${res.longitude}</p>
        </div>
        <div class="footer">
            <p><strong>ROSFAL SOLUCIONES DE PRÉSTAMOS</strong></p>
            <p><strong>T.</strong> 829-856-0203 | <strong>Email:</strong> contacto@rosfal.com</p>
            <p>Síguenos en <strong>FB:</strong> Rosfalrd | <strong>IG:</strong> @Rosfalrd</p>
            <p><a href="https://www.rosfal.com" target="_blank">www.rosfal.com</a></p>
        </div>
    </div>
</body>
            `

                });

                console.log("Correo enviado: %s", info.messageId);

            } catch (error) {
                console.log(error);
            }
        }

        notificacionCorreo()


    };
    ipapi.location(callback, `${ip}`)


    // #2 FUNCION QUE ENVIA NOTIFICACION DE SOLICITUD DE PRESTAMOS AL CLIENTE
    if (email) {
        async function enviarCorreo() {
            try {
                const from = "contacto@rosfal.com"

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
                    from: `${from} ROSFAL SOLUCIONES DE PRÉSTAMOS`,
                    to: `${email}`,
                    subject: `Gracias por tu solicitud ${nombre} ${apellido}`,
                    html: `
                
                <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Solicitud de Préstamo</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            
            .container {
                width: 80%;
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                background-color: #2D8DBD;
                color: #fff;
                text-align: center;
                padding: 15px;
                font-size: 20px;
                border-radius: 8px 8px 0 0;
            }
            
            .content {
                padding: 20px;
                color: #333;
                line-height: 1.6;
            }
            
            .footer {
                text-align: center;
                padding: 15px;
                font-size: 14px;
                color: #666;
            }
            
            .footer a {
                color: #2D8DBD;
                text-decoration: none;
                font-weight: bold;
            }
        </style>
    </head>

    <body>
        <div class="container">
            <div class="header">Confirmación de Solicitud de Préstamo</div>
            <div class="content">
                <p>Estimado/a <strong>${nombre} ${apellido}</strong>,</p>
                <p>Esperamos que se encuentre bien. Le escribimos para confirmar que hemos recibido su solicitud de préstamo.</p>
                <p>Nos complace informarle que su solicitud está siendo revisada. Nos pondremos en contacto con usted en breve para informarle si su solicitud ha sido aprobada.</p>
                <p>Mientras tanto, si tiene alguna pregunta o inquietud, no dude en ponerse en contacto con nosotros.</p>
                <p>Gracias por elegir nuestro servicio de préstamos.</p>
            </div>
            <div class="footer">
                <h4 style="color: #2D8DBD;">ROSFAL SOLUCIONES DE PRÉSTAMOS</h4>
                <p><strong>T.</strong> 829-856-0203 | <strong>Email:</strong> contacto@rosfal.com</p>
                <p>Síguenos en <strong>FB:</strong> Rosfalrd | <strong>IG:</strong> @Rosfalrd</p>
                <p><a href="www.rosfal.com">www.rosfal.com</a></p>
            </div>
        </div>
    </body>
                `

                });

                console.log("Correo enviado: %s", info.messageId);

            } catch (error) {
                console.log(error);
            }
        }

        enviarCorreo()
    };


    // ----------------------------------


    const nuevaSolicitud = {
        cedula,
        nombre,
        apellido,
        sexo,
        estadoCivil,
        direccion,
        direccionNegocio,
        tiempoNegocio,
        email,
        telefono,
        celular,
        nacionalidad,
        nombreFamilia,
        direccionFamilia,
        parentescoFamilia,
        telefonoFamilia,
        apodoFamilia,
        empresa,
        salario,
        puesto,
        dirEmpresa,
        telefonoEmpresa,
        departamento,
        tiempoEmpresa,
        nombreRefPers1,
        nombreRefPers2,
        telefonoRefPer1,
        telefonoRefPer2,
        tipoPrestamo,
        banco,
        numeroCuenta,
        montoSolicitado,
        frecuenciaPagos,
        cantidadPagosSemanales,
        cantidadPagosDiarios,
        cantidadPagosQuincenales,
        cantidadPagosMensuales

    };

    const actualizaCliente = {
        cedula,
        nombre,
        apellido,
        sexo,
        estadoCivil,
        direccion,
        direccionNegocio,
        tiempoNegocio,
        email,
        celular,
        nacionalidad,
        nombreFamilia,
        direccionFamilia,
        parentescoFamilia,
        telefonoFamilia,
        apodoFamilia,
        empresa,
        salario,
        puesto,
        dirEmpresa,
        telefonoEmpresa,
        departamento,
        tiempoEmpresa,
        nombreRefPers1,
        nombreRefPers2,
        telefonoRefPer1,
        telefonoRefPer2,
        tipoPrestamo,
        banco,
        numeroCuenta,
        montoSolicitado
    };



    await pool.query('INSERT INTO solicitudes set ?', [nuevaSolicitud]);

    await pool.query("UPDATE app_clientes set ? WHERE telefono = ?", [actualizaCliente, celular]);

    const app_clientedDB = await pool.query("SELECT cliente_id FROM app_clientes WHERE telefono = ?", [celular]);
    console.log(app_clientedDB[0].cliente_id + " cliente id tab app_clientes")

    const solicitudDB = await pool.query(`SELECT idSolicitud, celular FROM solicitudes WHERE celular = ${celular} ORDER BY idSolicitud DESC LIMIT 1`)

    console.log(solicitudDB[0].celular + " Celular cliente solicitud")


    const actualizaCliente_id = { cliente_id: app_clientedDB[0].cliente_id }

    await pool.query("UPDATE solicitudes set ? WHERE idSolicitud = ?", [actualizaCliente_id, solicitudDB[0].idSolicitud]);

    // req.flash('success', 'Link guardado correctamente');
    // res.redirect('/');

    if (req.session.rol == 'Cliente App') {

        return res.render('solicita-ya', {
            alert: true,
            alertTitle: "Muchas Gracias",
            alertMessage: "¡SOLICITUD ENVIADA CORRECTAMENTE!",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 2000,
            ruta: 'panel-administracion',
            rol: req.session.rol,
            permiso_C

        });
    } else {


        return res.render('solicita-ya', {
            alert: true,
            alertTitle: "Muchas Gracias",
            alertMessage: "¡SOLICITUD ENVIADA CORRECTAMENTE!",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 2000,
            ruta: '',
            rol: req.session.rol,
            permiso_C

        });
    };


});




module.exports = router;