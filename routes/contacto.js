const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");
const nodemailer = require("nodemailer");
const { body, validationResult } = require('express-validator');



router.get('/contacto', (req, res) => {
    res.render('contacto');
})

// Añadimos el middleware de validación antes del callback (async)
// router.post("/contacto", [
//     body('nombre').notEmpty().withMessage('El nombre es obligatorio').trim().escape(),
//     body('email').isEmail().withMessage('Ingresa un email válido').normalizeEmail(),
//     body('telefono').notEmpty().withMessage('El teléfono es obligatorio'),
//     body('asunto').notEmpty().withMessage('El asunto es obligatorio').trim(),
//     body('mensaje').isLength({ min: 10 }).withMessage('El mensaje debe tener al menos 10 caracteres').trim()
// ], async(req, res) => {

//     // 1. Verificar si hay errores de validación
//     const errores = validationResult(req);
//     if (!errores.isEmpty()) {
//         // Si hay errores, volvemos a renderizar la vista con los mensajes de error
//         return res.render('contacto', {
//             alert: true,
//             alertTitle: "Error",
//             alertMessage: errores.array()[0].msg, // Muestra el primer error encontrado
//             alertIcon: 'error',
//             showConfirmButton: true,
//             ruta: 'contacto'
//         });
//     }

//     const { nombre, telefono, email, asunto, mensaje } = req.body;
//     const nuevoMensaje = { nombre, telefono, email, asunto, mensaje };

//     try {
//         // 2. Guardar en Base de Datos
//         await pool.query('INSERT INTO mensajes set ?', [nuevoMensaje]);

//         // 3. Función de envío de correo (Definida afuera o dentro, pero ejecutada con await)
//         await enviarCorreo(nombre, telefono, email, asunto, mensaje);

//         res.render('contacto', {
//             alert: true,
//             alertTitle: "Muchas Gracias",
//             alertMessage: "¡MENSAJE ENVIADO CORRECTAMENTE!",
//             alertIcon: 'success',
//             showConfirmButton: false,
//             timer: 2000,
//             ruta: 'contacto'
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Error interno del servidor");
//     }
// });

// Función de correo optimizada (Fuera de la ruta para limpieza)
// async function enviarCorreo(nombre, telefono, email, asunto, mensaje) {
//     try {
//         let transporter = nodemailer.createTransport({
//             host: "mail.privateemail.com",
//             port: 465,
//             secure: true,
//             auth: {
//                 user: process.env.USERCORREO,
//                 pass: process.env.PASSCORREO,
//             },
//             tls: { rejectUnauthorized: false }
//         });

//         await transporter.sendMail({
//             from: `"ROSFAL CONTACTO" <contacto@rosfal.com>`,
//             to: "jfalcon@rosfal.com",
//             subject: `NOTIFICACION MENSAJE CONTACTO: ${nombre}`,
//             html: `
//              <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>Confirmación de Solicitud de Préstamo</title>
//             <style>
//                 body {
//                     font-family: Arial, sans-serif;
//                     background-color: #f4f4f4;
//                     margin: 0;
//                     padding: 0;
//                 }

//                 .container {
//                     width: 80%;
//                     max-width: 600px;
//                     margin: 20px auto;
//                     background: #ffffff;
//                     padding: 20px;
//                     border-radius: 8px;
//                     box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
//                 }

//                 .header {
//                     background-color: #2D8DBD;
//                     color: #fff;
//                     text-align: center;
//                     padding: 15px;
//                     font-size: 20px;
//                     border-radius: 8px 8px 0 0;
//                 }

//                 .content {
//                     padding: 20px;
//                     color: #333;
//                     line-height: 1.6;
//                 }

//                 .footer {
//                     text-align: center;
//                     padding: 15px;
//                     font-size: 14px;
//                     color: #666;
//                 }

//                 .footer a {
//                     color: #2D8DBD;
//                     text-decoration: none;
//                     font-weight: bold;
//                 }
//             </style>
//         </head>

//         <body>
//             <div class="container">
//                 <div class="header">NOTIFICACION MENSAJE CONTACTO AL CLIENTE</div>
//                 <div class="content">
//                    <div class="container-fluid p-4 mt-5 vh-100" style="background-color: #e8e7e7;">
//                     <h3 class="text-secondary"><strong>Asunto:</strong>
//                         ${asunto}
//                     </h3>


//                     <div class="container-fluid p-4">

//                         <div class="">
//                             <h5>
//                                 <strong>Nombre:</strong>
//                                 ${nombre} 
//                             </h5>
//                             <h5>
//                                 <strong>Email:</strong>
//                                 ${email}
//                             </h5>
//                             <h5>
//                                 <strong>Telefono:</strong>
//                                 ${telefono}
//                             </h5>
//                             <h5>
//                                 <strong>Asunto:</strong>
//                                 ${asunto}
//                             </h5>

//                         </div>
//                         <hr>

//                         <h5 class="text-secondary mt-4 mb-3">MENSAJE:</h5>
//                         <div class="container-fluid container-mensaje">
//                             <h5>
//                                 ${mensaje}
//                             </h5>
//                         </div>

//                     </div>
//                 </div>
//                 </div>
//                 <div class="footer">
//                     <h4 style="color: #2D8DBD;">ROSFAL SOLUCIONES DE PRÉSTAMOS</h4>
//                     <p><strong>T.</strong> 829-856-0203 | <strong>Email:</strong> contacto@rosfal.com</p>
//                     <p>Síguenos en <strong>FB:</strong> Rosfalrd | <strong>IG:</strong> @Rosfalrd</p>
//                     <p><a href="www.rosfal.com">www.rosfal.com</a></p>
//                 </div>
//             </div>
//         </body>

//             `
//         });

//         // console.log("Correo enviado: %s", info.messageId);

//     } catch (error) {
//         console.log("Error enviando correo:", error);
//         // No bloqueamos el flujo principal si el correo falla pero la DB funcionó
//     }
// }

//INSERTAR NUEVO MENSAJE CONTACTO****************
router.post("/contacto", async(req, res) => {
    const { nombre, telefono, email, asunto, mensaje } = req.body;

    const nuevoMensaje = {
        nombre,
        telefono,
        email,
        asunto,
        mensaje

    };

    await pool.query('INSERT INTO mensajes set ?', [nuevoMensaje]);
    // req.flash('success', 'Link guardado correctamente');
    // res.redirect('/contacto');

    // #2 FUNCION QUE ENVIA NOTIFICACION DE ENVIO DE MENSAJE CONTACTO CLIENTE

    async function enviarCorreo() {
        try {
            const from = "contacto@rosfal.com"
            const to = "jfalcon@rosfal.com"

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
                to: `${to}`,
                subject: `NOTIFICACION MENSAJE CONTACTO AL CLIENTE ${nombre}`,
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
                <div class="header">NOTIFICACION MENSAJE CONTACTO AL CLIENTE</div>
                <div class="content">
                   <div class="container-fluid p-4 mt-5 vh-100" style="background-color: #e8e7e7;">
                    <h3 class="text-secondary"><strong>Asunto:</strong>
                        ${asunto}
                    </h3>


                    <div class="container-fluid p-4">

                        <div class="">
                            <h5>
                                <strong>Nombre:</strong>
                                ${nombre} 
                            </h5>
                            <h5>
                                <strong>Email:</strong>
                                ${email}
                            </h5>
                            <h5>
                                <strong>Telefono:</strong>
                                ${telefono}
                            </h5>
                            <h5>
                                <strong>Asunto:</strong>
                                ${asunto}
                            </h5>

                        </div>
                        <hr>

                        <h5 class="text-secondary mt-4 mb-3">MENSAJE:</h5>
                        <div class="container-fluid container-mensaje">
                            <h5>
                                ${mensaje}
                            </h5>
                        </div>

                    </div>
                </div>
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


    res.render('contacto', {
        alert: true,
        alertTitle: "Muchas Gracias",
        alertMessage: "¡MENSAJE ENVIADO CORRECTAMENTE!",
        alertIcon: 'success',
        showConfirmButton: false,
        timer: 2000,
        ruta: 'contacto'
    });

});








module.exports = router;