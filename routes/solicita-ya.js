const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");

const useragent = require('express-useragent');

// no se esta usando
// const LocalStorage = require('node-localstorage').LocalStorage;
// const localStorage = LocalStorage('./localStorage');


//RENDERIZANDO LA VISTA SOLICITA YA
router.get('/solicita-ya', (req, res) => {


    res.render('solicita-ya');
})

//INSERTAR NUEVA SOLICITUD A MYSQL****************
router.post("/solicita-ya", async(req, res) => {
    const { cedula, nombre, apellido, sexo, estadoCivil, direccion, direccionNegocio, tiempoNegocio, email, telefono, celular, nacionadlidad, nombreFamilia, direccionFamilia, parentescoFamilia, telefonoFamilia, apodoFamilia, empresa, salario, puesto, dirEmpresa, telefonoEmpresa, departamento, tiempoEmpresa, nombreRefPers1, nombreRefPers2, telefonoRefPer1, telefonoRefPer2, tipoPrestamo, banco, numeroCuenta, montoSolicitado, frecuenciaPagos, cantidadPagosSemanales, cantidadPagosDiarios, cantidadPagosQuincenales, cantidadPagosMensuales } = req.body;

    // OBTENCION DE PARAMAMETROS CLIENTE
    // const ipString = "152.0.12.42, 172.71.82.116";
    const ipString = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ip = ipString.split(',')[0];

    const device = req.useragent.isMobile ? 'Mobile' : 'Desktop';
    const browser = req.useragent.browser;

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

    res.render('solicita-ya', {
        alert: true,
        alertTitle: "Muchas Gracias",
        alertMessage: "¡SOLICITUD ENVIADA CORRECTAMENTE!",
        alertIcon: 'success',
        showConfirmButton: false,
        timer: 2000,
        ruta: ''

    });

});




module.exports = router;