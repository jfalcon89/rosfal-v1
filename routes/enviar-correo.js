// const nodemailer = require("nodemailer");
// const fetch = require("node-fetch");

// const { json } = require("body-parser");
// const express = require("express");
// const router = express.Router();
// const moment = require("moment");
// const pool = require("../database");

// const LocalStorage = require('node-localstorage').LocalStorage;
// const localStorage = LocalStorage('./localStorage');


// // Obtenemos la cadena de texto JSON desde localStorage
// var datosCorreoJSON = localStorage.getItem("datosCorreo");

// // Convertimos la cadena de texto JSON a un objeto JavaScript
// var datosCorreo = JSON.parse(datosCorreoJSON);

// // FUNCION QUE ENVIA AL CORREO NOTIFICACION DE SOLICITUD DE PRESTAMOS
// async function enviarCorreo() {
//     try {
//         const from = "contacto@rosfal.com"

//         const nombre = localStorage.getItem('nombreCorreo');
//         const apellido = localStorage.getItem('apellidoCorreo');
//         const email = localStorage.getItem('emailCorreo');

//         console.log(nombre + " en enviar correo");
//         console.log(apellido + " en enviar correo");

//         // Configurar la conexión SMTP con el servidor de correo personalizado
//         let transporter = nodemailer.createTransport({
//             host: "mail.privateemail.com",
//             port: 465, // El puerto puede variar según la configuración de su servidor
//             secure: true, // Si utiliza SSL/TLS, establezca este valor en true
//             tls: {
//                 rejectUnauthorized: false
//             },
//             auth: {
//                 user: process.env.USERCORREO,
//                 pass: process.env.PASSCORREO,
//             },
//         });

//         // Configurar los detalles del correo electrónico
//         let info = await transporter.sendMail({
//             from: `${from} ROSFAL SOLUCIONES DE PRESTAMOS`,
//             to: `${email}`,
//             subject: `Gracias por tu solicitud ${nombre} ${apellido}`,
//             text: "Este es un correo electrónico de prueba enviado desde Node.js",
//         });

//         console.log("Correo enviado: %s", info.messageId);

//     } catch (error) {
//         console.log(error);
//     }
// }




// module.exports = enviarCorreo;