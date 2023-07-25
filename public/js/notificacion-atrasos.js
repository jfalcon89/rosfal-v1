// // const fetch = require("node-fetch");
// const nodemailer = require("nodemailer");

// // const useragent = require('express-useragent');




// async function notificacionCorreo() {
//     try {
//         const from = "contacto@rosfal.com"
//         const toNotificacion = "jfalcon@rosfal.com"

//         // console.log(nombre + " en enviar correo");
//         // console.log(apellido + " en enviar correo");

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
//             to: `${toNotificacion}`,
//             subject: `Nueva Notificacion de prestamo cliente `,
//             html: `

// <P><strong>Asunto</strong>: Confirmación de solicitud de préstamo</p><br>



// <P>Atentamente,</p>

// <h4 style="color: #2D8DBD;">ROSFAL SOLUCIONES DE PRESTAMOS</h4>
// <P><strong>T.</strong> 829-856-0203 <strong>EMAIL.</strong> contacto@rosfal.com </P>
// <P>Síguenos en <strong>FB:</strong> Rosfalrd <strong>IG:</strong> @Rosfalrd </P>
// <a href="www.rosfal.com">www.rosfal.com</a>
// `

//         });

//         console.log("Correo enviado: %s", info.messageId);

//     } catch (error) {
//         console.log(error);
//     }
// }

// // notificacionCorreo()

// setInterval(notificacionCorreo(), 30000);