const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");
const sharp = require("sharp");

const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
const useragent = require('express-useragent');


// Inicializar la biblioteca SMS
const { Vonage } = require('@vonage/server-sdk')

// const permiso_A = 'Administrador'
// const permiso_B = 'Representante'
// const permiso_C = 'Cliente App'
// const arrayUsuarios = await pool.query('SELECT idUsuario FROM users ');
// const arrayClientes = await pool.query('SELECT cliente_id FROM app_clientes ');
// const arraySolicitudes = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
// const arrayMensajesNuevos = await pool.query('SELECT idMensaje FROM mensajes WHERE estadoMensaje="Nuevo"');
// const arrayVisitas = await pool.query('SELECT idVisita FROM visitas ');
// const arrayTestimoniosNuevos = await pool.query('SELECT idTestimonio FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');
// const arrayRutas = await pool.query('SELECT * FROM rutas ');



// ----------------------FUNCION PARA ENVIAR SMS POR CLIENTE--------------------

router.get('/notificacionSmsAtrasos/:id', async(req, res) => {

    const id = req.params.id
    console.log(id)


    async function notificacionSmsAtrasos() {

        // Coloca aquí el código que deseas que se ejecute cada minuto
        const solicitudDB = await pool.query(`SELECT * FROM solicitudes WHERE idSolicitud = ${id} AND estadoSolicitud = 'Aprobada' AND  solicitudes.atraso > 0; `);
        console.log(solicitudDB);
        // console.log("¡Ejecutando función cada minuto!");

        // iteracion de los resultados
        if (solicitudDB.length > 0) {
            solicitudDB.forEach(solicitud => {
                console.log(solicitud.atraso)

                // // ENVIO DE SMS MASIVO
                const vonage = new Vonage({
                    apiKey: process.env.APIKEYSMS,
                    apiSecret: process.env.APISECRETSMS
                })

                const from = "Rosfal Soluciones"
                const celularCliente = '1' + solicitud.celular;
                const to = celularCliente
                console.log(to)
                    // const text = 'Su préstamo en Rosfal Soluciones presenta atrasos, favor realizar su pago hoy para evitar mora. Mas inf. llamar al 829-432-0547. Si ya realizo el pago, Desestimar'
                const text = 'Su préstamo en Rosfal Soluciones presenta atrasos, favor realizar su pago hoy para evitar mora. Mas inf. llamar al 829-856-0203'

                async function sendSMS() {
                    await vonage.sms.send({ to, from, text })
                        .then(resp => {
                            console.log('Message sent successfully');
                            console.log(resp);
                        })
                        .catch(err => {
                            console.log('There was an error sending the messages.');
                            console.error(err);
                        });
                }

                sendSMS();

            })
        }

    }




    notificacionSmsAtrasos()
});


//FUNCION PARA ENVIAR NOTIFICACION DE ATRASO POR CORREO A CLIENTE

router.get('/notificacionCorreoAtrasosCliente/:id', async(req, res) => {

    const id = req.params.id

    async function notificacionCorreoAtrasosCliente() {

        // Coloca aquí el código que deseas que se ejecute cada minuto
        const solicitudDB = await pool.query(`SELECT * FROM solicitudes WHERE estadoSolicitud = 'Aprobada' AND  solicitudes.atraso > 0 AND solicitudes.idSolicitud = ${id} `);
        const solicitud = solicitudDB[0];
        console.log(solicitud);
        // console.log("¡Ejecutando función cada minuto!");

        // iteracion de los resultados

        console.log(solicitud.atraso)

        if (solicitud.email) {
            async function notificacionCorreo() {
                try {
                    const from = "cobros@rosfal.com"
                    const toNotificacion = solicitud.email + `,mrosario@rosfal.com`


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
                        subject: `Notificación Préstamo en Atraso ${solicitud.nombre} ${solicitud.apellido} `,
                        html: `

             <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notificación de Pago</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            background: #fff;
            padding: 20px;
            margin: auto;
            border-radius: 8px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .header {
            background-color: #d32f2f;
            color: white;
            padding: 15px;
            font-size: 18px;
            font-weight: bold;
            text-align: left;
        }
        .content {
            text-align: left;
            padding: 20px;
        }
        .highlight {
            font-weight: bold;
            color: #d32f2f;
        }
        .bank-details {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin-top: 10px;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #777;
        }
        .cta-button {
            display: inline-block;
            background: #d32f2f;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><strong>ROSFAL</strong> | NOTIFICACIÓN DE PAGO EN ATRASO</div>
        <div class="content">
            
            <p><strong>SEÑOR (A):</strong> ${solicitud.nombre} ${solicitud.apellido}</p>
            <p>Después de un cordial saludo, le informamos que su préstamo No. <strong>${solicitud.idSolicitud}</strong> realizado en fecha <strong>${solicitud.fechaSolicitud.toLocaleString('es-US').slice(0, 10)}</strong> presenta un atraso al día de hoy de <span class="highlight">${solicitud.atraso} Pesos</span>.</p>
            <p>Le solicitamos poner al día su préstamo para evitar mora por atraso.</p>
            <p>Si necesita ayuda, llámenos al <strong>829-856-0203</strong>.</p>
            
            <h3>¿Cómo realizar el pago?</h3>
            <p>Puedes realizar tu pago en cualquier sucursal del Banco Popular, BHD León o BanReservas. También puedes transferir desde tu banco a través de internet banking. Recuerda incluir tu número de cédula como referencia.</p>
            
            <div class="bank-details">
                <p><strong>Banco Popular</strong><br>Cuenta: 786408559<br>Titular: José Miguel Falcón</p>
                <p><strong>BHD León</strong><br>Cuenta: 12113510016<br>Titular: José Miguel Falcón</p>
                <p><strong>BanReservas</strong><br>Cuenta: 9606036287<br>Titular: Magdelin M. Rosario</p>
            </div>
            
            <p><strong>Nota:</strong> Es imprescindible colocar referencia de su cédula al realizar su pago.</p>
            
            <a href="www.rosfal.com" class="btn-danger btn"> Ir a app Rosfal</a>
        </div>
        <div class="footer">
            <p style="color: #2D8DBD;"><strong>ROSFAL SOLUCIONES DE PRÉSTAMOS</strong></p>
            <p><strong>T:</strong> 829-856-0203 | <strong>Email:</strong> contacto@rosfal.com</p>
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

            notificacionCorreo()
        }





    }




    notificacionCorreoAtrasosCliente()
});

//FUNCION PARA ENVIAR NOTIFICACION DE LEGAL POR CORREO A CLIENTE

router.get('/notificarLegalClienteBtnCorreo/:id', async(req, res) => {

    const id = req.params.id

    const fecha = new Date().toLocaleString('en-EN', { timeZone: 'America/Santo_Domingo' });

    async function notificarLegalClienteBtnCorreo() {

        // Coloca aquí el código que deseas que se ejecute como condicion para los clientes que aplican para este correo
        const solicitudDB = await pool.query(`SELECT * FROM solicitudes WHERE estadoSolicitud in ('Aprobada', 'En Legal') AND solicitudes.legalMonto > 0 AND solicitudes.idSolicitud = ${id} `);
        const solicitud = solicitudDB[0];
        console.log(solicitud);


        // iteracion de los resultados

        console.log(solicitud.legalMonto)

        if (solicitud.email) {
            async function notificacionCorreo() {
                try {
                    const from = "cobros@rosfal.com"
                    const toNotificacion = solicitud.email + `,mrosario@rosfal.com`


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
                        subject: `Requerimiento de Pago Préstamo en PRE-LEGAL ${solicitud.nombre} ${solicitud.apellido} `,
                        html: `

             <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Requerimiento de Pago Pre-Legal</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            
            .container {
                max-width: 600px;
                background: #fff;
                padding: 20px;
                margin: auto;
                border-radius: 8px;
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            
            .header {
                background-color: #d32f2f;
                color: white;
                padding: 15px;
                font-size: 18px;
                font-weight: bold;
                text-align: left;
            }
            
            .content {
                text-align: left;
                padding: 20px;
                color: #777;
            }
            
            .highlight {
                font-weight: bold;
                color: #d32f2f;
            }
            
            .footer {
                margin-top: 20px;
                font-size: 14px;
                color: #777;
            }
        </style>
    </head>

    <body>
        <div class="container">
            <div class="header"><strong>ROSFAL</strong> | REQUERIMIENTO DE PAGO PRE-LEGAL</div>
            <div style="color: #777;" class="content">

                <p style="text-align: right;">República Dominicana, <strong>${fecha.slice(0, 10)}</strong></p>
                <p><strong>Señor(a):</strong><br>${solicitud.nombre} ${solicitud.apellido}</p>

                <p>Le informamos que su crédito presenta incumplimientos de pagos, con un saldo pendiente a la fecha de <strong>RD$${solicitud.legalMonto}.00</strong></p>

                <p style="font-weight: bold; ">De no regularizar su situación de inmediato, su expediente será trasladado a nuestro <strong>BUFETE DE ABOGADOS</strong> externo para su respectivo cobro <strong>PRE-JURÍDICO</strong>. Adicionalmente, su información será reportada al <strong>BURÓ DE CRÉDITO.</strong></p>

                <p>Le recordamos que un mal récord crediticio puede afectar su acceso a financiamiento en cualquier entidad financiera o comercial, limitando su capacidad de crédito futuro. Para evitar estos inconvenientes, le instamos a realizar su pago
                    lo antes posible.</p>

                <p>Si tiene alguna duda o requiere más información, puede comunicarse con nosotros al teléfono <strong style="color: #2D8DBD;">(829) 856-0203</strong> de lunes a viernes en horario de 8:00 a.m. a 5:00 p.m.</p><br><br>

                <p><strong>Atentamente:</strong></p>
                <p><strong>Departamento de Cobros</strong></p>

            </div>
            <div class="footer">
                <p style="color: #2D8DBD;"><strong>ROSFAL SOLUCIONES DE PRÉSTAMOS</strong></p>
                <p><strong>T:</strong> 829-856-0203 | <strong>Email:</strong> contacto@rosfal.com</p>
                <p>Síguenos en <strong>FB:</strong> Rosfalrd | <strong>IG:</strong> @Rosfalrd</p>
                <p><a href="www.rosfal.com">www.rosfal.com</a></p>
            </div>
            <hr>
            <p style="font-size: 12px; color: #888; text-align: center;">Este correo puede contener información confidencial y/o protegida legalmente. Si usted no es el destinatario y ha recibido este mensaje por error, por favor notifíquelo al remitente y elimínelo inmediatamente para evitar violar las leyes aplicables.
                Agradecemos su atención y colaboración.</p>
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
        }





    }




    notificarLegalClienteBtnCorreo()
});



//FUNCION PARA ENVIAR NOTIFICACION DE ATRASO AUTOMATICO POR CORREO Y SMS 

router.get('/notificacionCorreoAtrasos', async(req, res) => {

    async function notificacionCorreoAtrasos() {

        // Coloca aquí el código que deseas que se ejecute cada minuto
        const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE estadoSolicitud = 'Aprobada' AND  solicitudes.atraso > 0; ");
        console.log(solicitudDB);
        console.log("¡Ejecutando función cada minuto!");

        // iteracion de los resultados
        if (solicitudDB.length > 0) {
            solicitudDB.forEach(solicitud => {
                console.log(solicitud.atraso)

                // // ENVIO DE SMS MASIVO
                const vonage = new Vonage({
                    apiKey: process.env.APIKEYSMS,
                    apiSecret: process.env.APISECRETSMS
                })

                const from = "Rosfal Soluciones"
                const celularCliente = '1' + solicitud.celular;
                const to = celularCliente
                console.log(to)
                    // const text = 'Su préstamo en Rosfal Soluciones presenta atrasos, favor realizar su pago hoy para evitar mora. Mas inf. llamar al 829-432-0547. Si ya realizo el pago, Desestimar'
                const text = 'Su préstamo en Rosfal Soluciones presenta atrasos, favor realizar su pago hoy para evitar mora. Mas inf. llamar al 829-856-0203'

                async function sendSMS() {
                    await vonage.sms.send({ to, from, text })
                        .then(resp => {
                            console.log('Message sent successfully');
                            console.log(resp);
                        })
                        .catch(err => {
                            console.log('There was an error sending the messages.');
                            console.error(err);
                        });
                }

                sendSMS();

                if (solicitud.email) {
                    async function notificacionCorreo() {
                        try {
                            const from = "cobros@rosfal.com"
                            const toNotificacion = solicitud.email + `,mrosario@rosfal.com`


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
                                subject: `Notificacion Préstamo en Atraso ${solicitud.nombre} ${solicitud.apellido} `,
                                html: `
            
            <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notificación de Pago</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            background: #fff;
            padding: 20px;
            margin: auto;
            border-radius: 8px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .header {
            background-color: #d32f2f;
            color: white;
            padding: 15px;
            font-size: 18px;
            font-weight: bold;
            text-align: left;
        }
        .content {
            text-align: left;
            padding: 20px;
        }
        .highlight {
            font-weight: bold;
            color: #d32f2f;
        }
        .bank-details {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin-top: 10px;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #777;
        }
        .cta-button {
            display: inline-block;
            background: #d32f2f;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><strong>ROSFAL</strong> | NOTIFICACIÓN DE PAGO EN ATRASO</div>
        <div class="content">
            
            <p><strong>SEÑOR (A):</strong> ${solicitud.nombre} ${solicitud.apellido}</p>
            <p>Después de un cordial saludo, le informamos que su préstamo No. <strong>${solicitud.idSolicitud}</strong> realizado en fecha <strong>${solicitud.fechaSolicitud.toLocaleString('es-US').slice(0, 10)}</strong> presenta un atraso al día de hoy de <span class="highlight">${solicitud.atraso} Pesos</span>.</p>
            <p>Le solicitamos poner al día su préstamo para evitar mora por atraso.</p>
            <p>Si necesita ayuda, llámenos al <strong>829-856-0203</strong>.</p>
            
            <h3>¿Cómo realizar el pago?</h3>
            <p>Puedes realizar tu pago en cualquier sucursal del Banco Popular, BHD León o BanReservas. También puedes transferir desde tu banco a través de internet banking. Recuerda incluir tu número de cédula como referencia.</p>
            
            <div class="bank-details">
                <p><strong>Banco Popular</strong><br>Cuenta: 786408559<br>Titular: José Miguel Falcón</p>
                <p><strong>BHD León</strong><br>Cuenta: 12113510016<br>Titular: José Miguel Falcón</p>
                <p><strong>BanReservas</strong><br>Cuenta: 9606036287<br>Titular: Magdelin M. Rosario</p>
            </div>
            
            <p><strong>Nota:</strong> Es imprescindible colocar referencia de su cédula al realizar su pago.</p>
            
            <a href="www.rosfal.com" class="btn-danger btn"> Ir a app Rosfal</a>
        </div>
        <div class="footer">
            <p style="color: #2D8DBD;"><strong>ROSFAL SOLUCIONES DE PRÉSTAMOS</strong></p>
            <p><strong>T:</strong> 829-856-0203 | <strong>Email:</strong> contacto@rosfal.com</p>
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

                    notificacionCorreo()
                }


            })
        }

    }




    notificacionCorreoAtrasos()
});


// -----------------------FIN---------------------------------


//-----------------------NUEVAS----------------------//
// RENDERIZANDO Y MOSTRANDO TODOS LAS SOLITUDES NUEVAS********************
router.get('/solicitudes-nuevas', async(req, res) => {
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


        // Vista
        const arraySolicitudesNuevasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="nueva" ORDER BY fechaSolicitud DESC');

        const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
        const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada" OR estadoSolicitud = "En Legal"');
        const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
        const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
        res.render("solicitudes-nuevas", {
            arraySolicitudesNuevas: arraySolicitudesNuevasDB,
            arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
            arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
            arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
            arrayTotalSolicitudes: arrayTotalSolicitudesDB,
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


//VER SOLICITUD EN ESTADO NUEVA *************
router.get("/Solicitudes-nuevas/ver-solicitud/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id

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

            const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
            const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada" OR estadoSolicitud = "En Legal"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayObservacionesDB = await pool.query(`SELECT observacion, name, fechaObservacion FROM obs_por_solicitudes, solicitudes WHERE solicitudes.idSolicitud = obs_por_solicitudes.idSolicitud and obs_por_solicitudes.idSolicitud = ${id} `);
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            const documentosClienteDB = await pool.query(`SELECT archivo_id, prestamo_id, celular, nombre_archivo, tipo_documento, fecha_subida FROM archivos_prestamos where prestamo_id = ${solicitudDB[0].idSolicitud} `);

            // console.log(solicitudDB[0]);
            res.render("ver-solicitud", {
                solicitud: solicitudDB[0],
                arrayTotalSolicitudes: arrayTotalSolicitudesDB,
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayObservaciones: arrayObservacionesDB,
                arrayRutas: arrayRutasDB,
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
                documentosCliente: documentosClienteDB
            });

        } catch (error) {
            console.log(error)
            res.render("ver-solicitud", {
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


//EDITAR SOLICITUD EN ESTADO NUEVA ************
router.get("/Solicitudes-nuevas/editar-solicitud/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
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

            const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
            const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada" OR estadoSolicitud = "En Legal"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayObservacionesDB = await pool.query(`SELECT observacion, name, fechaObservacion FROM obs_por_solicitudes, solicitudes WHERE solicitudes.idSolicitud = obs_por_solicitudes.idSolicitud and obs_por_solicitudes.idSolicitud = ${id} `);
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');
            const arrayNotificacionAtrasoDB = await pool.query(`SELECT * FROM novedades_atrasos WHERE idSolicitud = ${id}`);

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            const documentosClienteDB = await pool.query(`SELECT archivo_id, prestamo_id, celular, nombre_archivo, tipo_documento, fecha_subida FROM archivos_prestamos where prestamo_id = ${solicitudDB[0].idSolicitud} `);
            // console.log(solicitudDB[0]);
            res.render("editar-solicitud", {
                solicitud: solicitudDB[0],
                arrayTotalSolicitudes: arrayTotalSolicitudesDB,
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayObservaciones: arrayObservacionesDB,
                arrayRutas: arrayRutasDB,
                arrayNotificacionAtraso: arrayNotificacionAtrasoDB,
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
                documentosCliente: documentosClienteDB
            });

        } catch (error) {
            console.log(error)
            res.render("editar-solicitud", {
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
router.post('/Solicitudes-nuevas/editar-solicitud/:id', async(req, res) => {
    const id = req.params.id;
    // console.log(req.params.id)

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
        nacionadlidad,
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
        estadoSolicitud,
        contrato,
        ruta,
        firmaContrato,
        atraso,
        legalMonto,
        incobrableMonto,
        clasificacionCliente,
        saldoFinal,
        frecuenciaPagos,
        cantidadPagosSemanales,
        cantidadPagosDiarios,
        cantidadPagosQuincenales,
        cantidadPagosMensuales,
        cuotaPagos,
        fechaPago,
        montoCuota
    } = req.body;

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
        nacionadlidad,
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
        estadoSolicitud,
        contrato,
        ruta,
        firmaContrato,
        atraso,
        legalMonto,
        incobrableMonto,
        clasificacionCliente,
        saldoFinal,
        frecuenciaPagos,
        cantidadPagosSemanales,
        cantidadPagosDiarios,
        cantidadPagosQuincenales,
        cantidadPagosMensuales,
        cuotaPagos,
        fechaPago,
        montoCuota
    };

    await pool.query("UPDATE solicitudes set ? WHERE idSolicitud = ?", [nuevaSolicitud, id]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect(`/Solicitudes-nuevas/editar-solicitud/${req.params.id}`);
});

// INSERTAR OBSERVACIONES SOLICITUDES NUEVAS
router.post('/Solicitudes-nuevas/ver-solicitud/:id', async(req, res) => {
    // const id = req.params.id;
    //    console.log(req.params.id)

    const { idSolicitud, observacion, name } = req.body;

    const nuevaObservacion = {
        idSolicitud,
        observacion,
        name

    };

    await pool.query("INSERT INTO obs_por_solicitudes set ?", [nuevaObservacion]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect(`/Solicitudes-nuevas/ver-solicitud/${req.params.id}`);
});


//ELIMINAR SOLICITUD EN ESTADO NUEVA
router.get("/solicitudes/eliminar-solicitud/:id", async(req, res) => {
    const { id } = req.params;

    // console.log(id)

    try {

        await pool.query(`DELETE FROM obs_por_solicitudes WHERE obs_por_solicitudes.idSolicitud = ${id} `);
        await pool.query("DELETE FROM solicitudes WHERE idSolicitud = ?", [id]);
        // req.alert('success', 'Link eliminado correctamente');
        res.redirect("/solicitudes-nuevas");



    } catch (error) {
        console.log(error)
    }

});


//-----------------------APROBADAS----------------------//
// RENDERIZANDO Y MOSTRANDO TODOS LAS SOLITUDES APROBADAS********************
router.get('/solicitudes-aprobadas', async(req, res) => {
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

        const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="aprobada" OR estadoSolicitud = "En Legal" ORDER BY fechaSolicitud DESC');
        const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
        const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
        const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
        const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
        res.render("solicitudes-aprobadas", {
            arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
            arrayTotalSolicitudes: arrayTotalSolicitudesDB,
            arraySolicitudesNuevas: arraySolicitudesNuevasDB,
            arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
            arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
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



//VER SOLICITUD EN ESTADO APROBADAS************
router.get("/Solicitudes-aprobadas/ver-solicitud/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
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

            const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
            const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada" OR estadoSolicitud = "En Legal"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayObservacionesDB = await pool.query(`SELECT observacion, name, fechaObservacion FROM obs_por_solicitudes, solicitudes WHERE solicitudes.idSolicitud = obs_por_solicitudes.idSolicitud and obs_por_solicitudes.idSolicitud = ${id} `);
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            const documentosClienteDB = await pool.query(`SELECT archivo_id, prestamo_id, celular, nombre_archivo, tipo_documento, fecha_subida FROM archivos_prestamos where prestamo_id = ${solicitudDB[0].idSolicitud} `);
            // console.log(solicitudDB[0]);


            res.render("ver-solicitud", {
                solicitud: solicitudDB[0],
                arrayTotalSolicitudes: arrayTotalSolicitudesDB,
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayObservaciones: arrayObservacionesDB,
                arrayRutas: arrayRutasDB,
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
                documentosCliente: documentosClienteDB
            });

        } catch (error) {
            console.log(error)
            res.render("editar-solicitud", {
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

//IMPRIMIR SOLICITUD EN ESTADO APROBADAS************
router.get("/Solicitudes-aprobadas/imprimir-solicitud/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
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

            // const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada"');
            // const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
            // const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
            // const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            // console.log(solicitudDB[0]);
            res.render("imprimir-solicitud", {
                solicitud: solicitudDB[0],
                arrayRutas: arrayRutasDB,
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
            res.render("imprimir-solicitud", {
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

//IMPRIMIR CONTRATO EN ESTADO APROBADAS************
router.get("/Solicitudes-aprobadas/imprimir-contato/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
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

            // const arraySolicitudesAprobadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="aprobada"');
            // const arraySolicitudesNuevasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="nueva"');
            // const arraySolicitudesDeclinadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada"');
            // const arraySolicitudesEnRevisionDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            // console.log(solicitudDB[0]);
            res.render("imprimir-contrato", {
                solicitud: solicitudDB[0],
                arrayRutas: arrayRutasDB,
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
            res.render("imprimir-contrato", {
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


//EDITAR SOLICITUD EN ESTADO APROBADAS************
router.get("/Solicitudes-aprobadas/editar-solicitud/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
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

            const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
            const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="Aprobada" OR estadoSolicitud = "En Legal"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayObservacionesDB = await pool.query(`SELECT observacion, name, fechaObservacion FROM obs_por_solicitudes, solicitudes WHERE solicitudes.idSolicitud = obs_por_solicitudes.idSolicitud and obs_por_solicitudes.idSolicitud = ${id} `);
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');
            const arrayNotificacionAtrasoDB = await pool.query(`SELECT * FROM novedades_atrasos WHERE idSolicitud = ${id} ORDER BY fechaNovedad DESC`);

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            const documentosClienteDB = await pool.query(`SELECT archivo_id, prestamo_id, celular, nombre_archivo, tipo_documento, fecha_subida FROM archivos_prestamos where prestamo_id = ${solicitudDB[0].idSolicitud} `);
            // console.log(solicitudDB[0]);
            res.render("editar-solicitud", {
                solicitud: solicitudDB[0],
                arrayTotalSolicitudes: arrayTotalSolicitudesDB,
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayObservaciones: arrayObservacionesDB,
                arrayRutas: arrayRutasDB,
                arrayNotificacionAtraso: arrayNotificacionAtrasoDB,
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
                documentosCliente: documentosClienteDB
            });

        } catch (error) {
            console.log(error)
            res.render("editar-solicitud", {
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


//GUARDAR ACTUALIZACION DE SOLICITUD DESDE APROBADAS
router.post('/Solicitudes-aprobadas/editar-solicitud/:id', async(req, res) => {
    const id = req.params.id;
    // const idSolicitud = id;

    // const data = {};

    const {
        frecuenciaPagos,
        cantidadPagosSemanales,
        cantidadPagosDiarios,
        cantidadPagosQuincenales,
        cantidadPagosMensuales,
        cuotaPagos,
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
        nacionadlidad,
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
        estadoSolicitud,
        contrato,
        ruta,
        firmaContrato,
        atraso,
        legalMonto,
        incobrableMonto,
        clasificacionCliente,
        saldoFinal,
        fechaPago,
        montoCuota
    } = req.body;

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
        nacionadlidad,
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
        estadoSolicitud,
        contrato,
        ruta,
        firmaContrato,
        atraso,
        legalMonto,
        incobrableMonto,
        clasificacionCliente,
        saldoFinal,
        frecuenciaPagos,
        cantidadPagosSemanales,
        cantidadPagosDiarios,
        cantidadPagosQuincenales,
        cantidadPagosMensuales,
        cuotaPagos,
        fechaPago,
        montoCuota
    };


    const atrasoDB = await pool.query(`SELECT novedades_atrasos.atraso FROM novedades_atrasos WHERE novedades_atrasos.idSolicitud = ${id}`);



    await pool.query("UPDATE solicitudes set ? WHERE idSolicitud = ?", [nuevaSolicitud, id]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect(`/Solicitudes-aprobadas/editar-solicitud/${req.params.id}`);
});



// INSERTAR OBSERVACIONES SOLICITUDES APROBADAS
router.post('/Solicitudes-aprobadas/ver-solicitud/:id', async(req, res) => {
    // const id = req.params.id;
    // console.log(req.params.id)

    const { idSolicitud, observacion, name } = req.body;

    const nuevaObservacion = {
        idSolicitud,
        observacion,
        name

    };

    await pool.query("INSERT INTO obs_por_solicitudes set ?", [nuevaObservacion]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect(`/Solicitudes-aprobadas/ver-solicitud/${req.params.id}`);
});


//-----------------------DECLINADAS----------------------//
// RENDERIZANDO Y MOSTRANDO TODOS LAS SOLITUDES DECLINADAS********************
router.get('/solicitudes-declinadas', async(req, res) => {
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

        const arraySolicitudesDeclinadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="declinada" ORDER BY fechaSolicitud DESC');
        const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
        const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
        const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada" OR estadoSolicitud = "En Legal"');
        const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
        res.render("solicitudes-declinadas", {
            arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
            arrayTotalSolicitudes: arrayTotalSolicitudesDB,
            arraySolicitudesNuevas: arraySolicitudesNuevasDB,
            arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
            arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
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


//EDITAR SOLICITUD EN ESTADO DECLINADAS************
router.get("/Solicitudes-declinadas/ver-solicitud/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
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

            const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
            const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada" OR estadoSolicitud = "En Legal"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayObservacionesDB = await pool.query(`SELECT observacion, name, fechaObservacion FROM obs_por_solicitudes, solicitudes WHERE solicitudes.idSolicitud = obs_por_solicitudes.idSolicitud and obs_por_solicitudes.idSolicitud = ${id} `);
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            const documentosClienteDB = await pool.query(`SELECT archivo_id, prestamo_id, celular, nombre_archivo, tipo_documento, fecha_subida FROM archivos_prestamos where prestamo_id = ${solicitudDB[0].idSolicitud} `);
            // console.log(solicitudDB[0]);
            res.render("ver-solicitud", {
                solicitud: solicitudDB[0],
                arrayTotalSolicitudes: arrayTotalSolicitudesDB,
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayObservaciones: arrayObservacionesDB,
                arrayRutas: arrayRutasDB,
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
                documentosCliente: documentosClienteDB
            });

        } catch (error) {
            console.log(error)
            res.render("editar-solicitud", {
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



//EDITAR SOLICITUD EN ESTADO DECLINADAS************
router.get("/Solicitudes-declinadas/editar-solicitud/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
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

            const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
            const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada" OR estadoSolicitud = "En Legal"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayObservacionesDB = await pool.query(`SELECT observacion, name, fechaObservacion FROM obs_por_solicitudes, solicitudes WHERE solicitudes.idSolicitud = obs_por_solicitudes.idSolicitud and obs_por_solicitudes.idSolicitud = ${id} `);
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');
            const arrayNotificacionAtrasoDB = await pool.query(`SELECT * FROM novedades_atrasos WHERE idSolicitud = ${id}`);


            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            const documentosClienteDB = await pool.query(`SELECT archivo_id, prestamo_id, celular, nombre_archivo, tipo_documento, fecha_subida FROM archivos_prestamos where prestamo_id = ${solicitudDB[0].idSolicitud} `);
            // console.log(solicitudDB[0]);
            res.render("editar-solicitud", {
                solicitud: solicitudDB[0],
                arrayTotalSolicitudes: arrayTotalSolicitudesDB,
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayObservaciones: arrayObservacionesDB,
                arrayRutas: arrayRutasDB,
                arrayNotificacionAtraso: arrayNotificacionAtrasoDB,
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
                documentosCliente: documentosClienteDB

            });

        } catch (error) {
            console.log(error)
            res.render("404", {
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

//GUARDAR ACTUALIZACION DE SOLICITUD DESDE DECLINADAS
router.post('/Solicitudes-declinadas/editar-solicitud/:id', async(req, res) => {
    const id = req.params.id;
    // console.log(req.params.id)

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
        nacionadlidad,
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
        estadoSolicitud,
        contrato,
        ruta,
        firmaContrato,
        atraso,
        legalMonto,
        incobrableMonto,
        clasificacionCliente,
        saldoFinal,
        frecuenciaPagos,
        cantidadPagosSemanales,
        cantidadPagosDiarios,
        cantidadPagosQuincenales,
        cantidadPagosMensuales,
        cuotaPagos,
        fechaPago,
        montoCuota
    } = req.body;

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
        nacionadlidad,
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
        estadoSolicitud,
        contrato,
        ruta,
        firmaContrato,
        atraso,
        legalMonto,
        incobrableMonto,
        clasificacionCliente,
        saldoFinal,
        frecuenciaPagos,
        cantidadPagosSemanales,
        cantidadPagosDiarios,
        cantidadPagosQuincenales,
        cantidadPagosMensuales,
        cuotaPagos,
        fechaPago,
        montoCuota
    };

    await pool.query("UPDATE solicitudes set ? WHERE idSolicitud = ?", [nuevaSolicitud, id]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect(`/Solicitudes-declinadas/editar-solicitud/${req.params.id}`);
});

// INSERTAR OBSERVACIONES SOLICITUDES DECLINADAS
router.post('/Solicitudes-declinadas/ver-solicitud/:id', async(req, res) => {
    // const id = req.params.id;
    // console.log(req.params.id)

    const { idSolicitud, observacion, name } = req.body;

    const nuevaObservacion = {
        idSolicitud,
        observacion,
        name

    };

    await pool.query("INSERT INTO obs_por_solicitudes set ?", [nuevaObservacion]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect(`/Solicitudes-declinadas/ver-solicitud/${req.params.id}`);
});


//-----------------------EN REVISION----------------------//
// RENDERIZANDO Y MOSTRANDO TODOS LAS SOLITUDES NUEVAS********************
router.get('/solicitudes-en-revision', async(req, res) => {
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

        const arraySolicitudesEnRevisionDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Revision" ORDER BY fechaSolicitud DESC');
        const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
        const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
        const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada" OR estadoSolicitud = "En Legal"');
        const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
        res.render("solicitudes-en-revision", {
            arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
            arrayTotalSolicitudes: arrayTotalSolicitudesDB,
            arraySolicitudesNuevas: arraySolicitudesNuevasDB,
            arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
            arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
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

//VER SOLICITUD EN ESTADO EN REVISION************
router.get("/Solicitudes-en-revision/ver-solicitud/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
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

            const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
            const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada" OR estadoSolicitud = "En Legal"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayObservacionesDB = await pool.query(`SELECT observacion, name, fechaObservacion FROM obs_por_solicitudes, solicitudes WHERE solicitudes.idSolicitud = obs_por_solicitudes.idSolicitud and obs_por_solicitudes.idSolicitud = ${id} `);
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            const documentosClienteDB = await pool.query(`SELECT archivo_id, prestamo_id, celular, nombre_archivo, tipo_documento, fecha_subida FROM archivos_prestamos where prestamo_id = ${solicitudDB[0].idSolicitud} `);
            // console.log(solicitudDB[0]);
            res.render("ver-solicitud", {
                solicitud: solicitudDB[0],
                arrayTotalSolicitudes: arrayTotalSolicitudesDB,
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayObservaciones: arrayObservacionesDB,
                arrayRutas: arrayRutasDB,
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
                documentosCliente: documentosClienteDB
            });

        } catch (error) {
            console.log(error)
            res.render("editar-solicitud", {
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


//EDITAR SOLICITUD EN ESTADO EN REVISION************
router.get("/Solicitudes-en-revision/editar-solicitud/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
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

            const arrayTotalSolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes ');
            const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada" OR estadoSolicitud = "En Legal"');
            const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
            const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
            const arrayObservacionesDB = await pool.query(`SELECT observacion, name, fechaObservacion FROM obs_por_solicitudes, solicitudes WHERE solicitudes.idSolicitud = obs_por_solicitudes.idSolicitud and obs_por_solicitudes.idSolicitud = ${id} `);
            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');
            const arrayNotificacionAtrasoDB = await pool.query(`SELECT * FROM novedades_atrasos WHERE idSolicitud = ${id}`);


            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);
            const documentosClienteDB = await pool.query(`SELECT archivo_id, prestamo_id, celular, nombre_archivo, tipo_documento, fecha_subida FROM archivos_prestamos where prestamo_id = ${solicitudDB[0].idSolicitud} `);
            // console.log(solicitudDB[0]);
            res.render("editar-solicitud", {
                solicitud: solicitudDB[0],
                arrayTotalSolicitudes: arrayTotalSolicitudesDB,
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesNuevas: arraySolicitudesNuevasDB,
                arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
                arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
                arrayObservaciones: arrayObservacionesDB,
                arrayRutas: arrayRutasDB,
                arrayNotificacionAtraso: arrayNotificacionAtrasoDB,
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
                documentosCliente: documentosClienteDB
            });

        } catch (error) {
            console.log(error)
            res.render("editar-solicitud", {
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

//GUARDAR ACTUALIZACION DE SOLICITUD EN REVISION
router.post('/Solicitudes-en-revision/editar-solicitud/:id', async(req, res) => {
    const id = req.params.id;
    // console.log(req.params.id)

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
        nacionadlidad,
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
        estadoSolicitud,
        contrato,
        ruta,
        firmaContrato,
        atraso,
        legalMonto,
        incobrableMonto,
        clasificacionCliente,
        saldoFinal,
        frecuenciaPagos,
        cantidadPagosSemanales,
        cantidadPagosDiarios,
        cantidadPagosQuincenales,
        cantidadPagosMensuales,
        cuotaPagos,
        fechaPago,
        montoCuota
    } = req.body;

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
        nacionadlidad,
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
        estadoSolicitud,
        contrato,
        ruta,
        firmaContrato,
        atraso,
        legalMonto,
        incobrableMonto,
        clasificacionCliente,
        saldoFinal,
        frecuenciaPagos,
        cantidadPagosSemanales,
        cantidadPagosDiarios,
        cantidadPagosQuincenales,
        cantidadPagosMensuales,
        cuotaPagos,
        fechaPago,
        montoCuota
    };

    await pool.query("UPDATE solicitudes set ? WHERE idSolicitud = ?", [nuevaSolicitud, id]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect(`/Solicitudes-en-revision/editar-solicitud/${req.params.id}`);
});

// INSERTAR OBSERVACIONES SOLICITUDES EN REVISION
router.post('/Solicitudes-en-revision/ver-solicitud/:id', async(req, res) => {
    // const id = req.params.id;
    // console.log(req.params.id)

    const { idSolicitud, observacion, name } = req.body;

    const nuevaObservacion = {
        idSolicitud,
        observacion,
        name

    };

    await pool.query("INSERT INTO obs_por_solicitudes set ?", [nuevaObservacion]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect(`/Solicitudes-en-revision/ver-solicitud/${req.params.id}`);
});



// RENDERIZANDO Y MOSTRANDO TODOS LAS SOLITUDES ********************
router.get('/todas-las-solicitudes', async(req, res) => {
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

        const arrayTotalSolicitudesDB = await pool.query('SELECT * FROM solicitudes  ORDER BY fechaSolicitud DESC');
        const arraySolicitudesNuevasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva" ');
        const arraySolicitudesAprobadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="aprobada" OR estadoSolicitud = "En Legal"');
        const arraySolicitudesDeclinadasDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="declinada"');
        const arraySolicitudesEnRevisionDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="En Revision"');
        res.render("todas-las-solicitudes", {
            arrayTotalSolicitudes: arrayTotalSolicitudesDB,
            arraySolicitudesNuevas: arraySolicitudesNuevasDB,
            arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
            arraySolicitudesDeclinadas: arraySolicitudesDeclinadasDB,
            arraySolicitudesEnRevision: arraySolicitudesEnRevisionDB,
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





//-----------------------CLIENTES----------------------//
// RENDERIZANDO Y MOSTRANDO TODOS LAS SOLITUDES APROBADAS********************
router.get('/clientes', async(req, res) => {
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

        const arraySolicitudesClientesDB = await pool.query('SELECT * FROM solicitudes ');

        res.render("clientes", {
            arraySolicitudesClientes: arraySolicitudesClientesDB,
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

// -----------------------------VER CLIENTE--------------------------------

//IMPRIMIR SOLICITUD EN ESTADO APROBADAS************
router.get("/clientes/ver-cliente/:id", async(req, res) => {
    if (req.session.loggedin) {

        const id = req.params.id
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

            const arrayRutasDB = await pool.query('SELECT * FROM rutas ');
            const solicitudDB = await pool.query("SELECT * FROM solicitudes WHERE idSolicitud = ?", [id]);

            res.render("ver-cliente", {
                solicitud: solicitudDB[0],
                arrayRutas: arrayRutasDB,
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
            res.render("ver-cliente", {
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


//INSERTAR NUEVA SOLICITUD A MYSQL****************
router.post("/clientes/ver-cliente/:id", async(req, res) => {
    if (req.session.loggedin) {

        const { cedula, nombre, apellido, sexo, estadoCivil, direccion, direccionNegocio, tiempoNegocio, email, telefono, celular, nacionadlidad, nombreFamilia, direccionFamilia, parentescoFamilia, telefonoFamilia, apodoFamilia, empresa, salario, puesto, dirEmpresa, telefonoEmpresa, departamento, tiempoEmpresa, nombreRefPers1, nombreRefPers2, telefonoRefPer1, telefonoRefPer2, tipoPrestamo, banco, numeroCuenta, montoSolicitado, frecuenciaPagos, cantidadPagosSemanales, cantidadPagosDiarios, cantidadPagosQuincenales, cantidadPagosMensuales } = req.body;

        const arraySolicitudesClientesDB = await pool.query('SELECT * FROM solicitudes ');

        const permiso_A = 'Administrador'
        const permiso_B = 'Representante'
        const permiso_C = 'Cliente App'
        const arrayUsuarios = await pool.query('SELECT idUsuario FROM users ');
        const arrayClientes = await pool.query('SELECT cliente_id FROM app_clientes ');
        const arraySolicitudes = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
        const arrayMensajesNuevos = await pool.query('SELECT idMensaje FROM mensajes WHERE estadoMensaje="Nuevo"');
        const arrayVisitas = await pool.query('SELECT idVisita FROM visitas ');
        const arrayTestimoniosNuevos = await pool.query('SELECT idTestimonio FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');

        // OBTENCION DE PARAMAMETROS CLIENTE
        // const ipString = "152.0.12.42, 172.71.82.116";
        const ipString = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const ip = ipString.split(',')[0];

        const device = req.useragent.isMobile ? 'Mobile' : 'Desktop';
        const browser = req.useragent.browser;
        const sistemaOperativo = req.useragent.os
        const plataforma = req.useragent.platform
        const fecha = new Date().toLocaleString('en-US', { timeZone: 'America/Santo_Domingo' });

        fetch(`https://ipgeolocation.abstractapi.com/v1/?api_key=c48b62c0f8844a7c86cb0020ff90e0d3&ip_address=${ip}`)
            .then(response => response.json())
            .then(data => {

                // FUNCION QUE ENVIA AL CORREO NOTIFICACION DE SOLICITUD DE PRESTAMOS A ROSFAL

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
                            subject: `Nueva solicitud de prestamo cliente ${nombre} ${apellido}`,
                            html: `
            
            <P><strong>Asunto</strong>: Confirmación de solicitud de préstamo</p><br>

            <P><strong>Cliente</strong>: ${nombre} ${apellido}</p>
            <P><strong>Cedula</strong>: ${cedula}</p>
            <P><strong>Monto solicitado</strong>: ${montoSolicitado}</p>
            <P><strong>Direccion</strong>: ${direccion}</p>
            <P><strong>Email</strong>: ${email}</p>
            <P><strong>Celular</strong>: ${celular}</p>
            <P><strong>Pais</strong>: ${data.country}</p>
            <P><strong>Ciudad</strong>: ${data.city}</p>
            <P><strong>Direccion ip</strong>: ${ip}</p>
            <P><strong>Dispositivo</strong>: ${device}</p>
            <P><strong>Navegador</strong>: ${browser}</p>
            <P><strong>Sistema Operativo</strong>: ${sistemaOperativo}</p>
            <P><strong>Plataforma</strong>: ${plataforma}</p>
            <P><strong>Fecha</strong>: ${fecha}</p>
            <P><strong>Latitud</strong>: ${data.latitude} <strong>longitud</strong>: ${data.longitude}</p><br>
        
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


            })


        // FUNCION QUE ENVIA NOTIFICACION DE SOLICITUD DE PRESTAMOS AL CLIENTE
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
                        from: `${from} ROSFAL SOLUCIONES DE PRESTAMOS`,
                        to: `${email}`,
                        subject: `Gracias por tu solicitud ${nombre} ${apellido}`,
                        html: `
                
                <P>Asunto: Confirmación de solicitud de préstamo</p><br>

                <P>Estimado/a ${nombre} ${apellido},</p>
            
                <P>Esperamos que se encuentre bien. Le escribimos para confirmar que hemos recibido su solicitud de préstamo.</p>
            
                <P>Nos complace informarle que su solicitud estara siendo revisada. Nos pondremos en contacto con usted en breve para informarle si su solicitud ha sido aprobada.</p>
            
                <P>Mientras tanto, si tiene alguna pregunta o inquietud, no dude en ponerse en contacto con nosotros.</p><br>
            
                <P>Gracias por elegir nuestro servicio de préstamos.</p><br>
            
                <P>Atentamente,</p><br>
            
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
            nacionadlidad,
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

        await pool.query('INSERT INTO solicitudes set ?', [nuevaSolicitud]);
        // req.flash('success', 'Link guardado correctamente');
        // res.redirect('/');

        res.render('clientes', {
            alert: true,
            alertTitle: "Muchas Gracias",
            alertMessage: "¡SOLICITUD ENVIADA CORRECTAMENTE!",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 2000,
            ruta: '',
            login: true,
            name: req.session.name,
            rol: req.session.rol,
            arraySolicitudesClientes: arraySolicitudesClientesDB,
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






module.exports = router;