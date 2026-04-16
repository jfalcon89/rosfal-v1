const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
const ipapi = require('ipapi.co');
const useragent = require('express-useragent');

const pdf = require('html-pdf'); // Importar la nueva librería
const phantomjs = require('phantomjs-prebuilt'); // Importa esto

// no se esta usando
// const LocalStorage = require('node-localstorage').LocalStorage;
// const localStorage = LocalStorage('./localStorage');


//RENDERIZANDO LA VISTA SOLICITA YA
router.get('/solicita-ya', async(req, res) => {
    const permiso_C = 'Cliente App'

    const rows = await pool.query("SELECT parametro_clave, parametro_valor FROM configuracion_parametros WHERE vista_nombre in ('Roles', 'Solicitudes', 'Permisos-Solicitudes') AND descripcion = 'Activo'");

    const config = rows.reduce((acc, row) => {
        const clave = row.parametro_clave;
        const valor = row.parametro_valor;

        if (acc[clave]) {
            // Si ya existe la clave, verificamos si ya es un arreglo
            if (Array.isArray(acc[clave])) {
                acc[clave].push(valor); // Solo agregamos el valor al arreglo existente
            } else {
                // Si era un string único, lo convertimos en un arreglo con el valor viejo y el nuevo
                acc[clave] = [acc[clave], valor];
            }
        } else {
            // Si es la primera vez, lo guardamos como un valor simple (String)
            acc[clave] = valor;
        }
        return acc;
    }, {});

    // console.log(config)

    res.render('solicita-ya', {
        rol: req.session.rol,
        permiso_C,
        config
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

    const rows = await pool.query("SELECT parametro_clave, parametro_valor FROM configuracion_parametros WHERE vista_nombre in ('Roles', 'Solicitudes', 'Permisos-Solicitudes') AND descripcion = 'Activo'");

    const config = rows.reduce((acc, row) => {
        const clave = row.parametro_clave;
        const valor = row.parametro_valor;

        if (acc[clave]) {
            // Si ya existe la clave, verificamos si ya es un arreglo
            if (Array.isArray(acc[clave])) {
                acc[clave].push(valor); // Solo agregamos el valor al arreglo existente
            } else {
                // Si era un string único, lo convertimos en un arreglo con el valor viejo y el nuevo
                acc[clave] = [acc[clave], valor];
            }
        } else {
            // Si es la primera vez, lo guardamos como un valor simple (String)
            acc[clave] = valor;
        }
        return acc;
    }, {});

    // OBTENCION DE PARAMAMETROS CLIENTE
    // const ipString = "201.229.238.223, 172.71.82.116";
    const ipString = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ip = ipString.split(',')[0];

    const device = req.useragent.isMobile ? 'Mobile' : 'Desktop';
    const browser = req.useragent.browser;
    const sistemaOperativo = req.useragent.os
    const plataforma = req.useragent.platform
    const fecha = new Date().toLocaleString('en-US', { timeZone: 'America/Santo_Domingo' }).slice(0, 10);

    // fetch(`https://ipgeolocation.abstractapi.com/v1/?api_key=174a3d4da2a14777ab66bef79388279b&ip_address=${ip}`)
    //     .then(response => response.json())
    //     .then(data => {

    // 1. Definir el contenido del contrato (puedes usar un template literal)
    // Asegúrate de tener acceso al objeto 'solicitud' antes de esta variable
    const htmlContrato = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.5; padding: 30px; }
        .container { width: 100%; }
        .text-center { text-align: center; }
        .justify { text-align: justify; }
        .mt-5 { margin-top: 20px; }
        .mt-3 { margin-top: 20px; }
        .flex-container { display: flex; justify-content: space-between; align-items: center; margin-top: 30px; }
        .signature-box { text-align: center; width: 45%; }
        .logo { width: 180px; height: auto; }
        .sello { width: 250px; height: auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="text-center">
            <img src="https://1drv.ms/i/c/c31f9c66e8bcaac9/UQTJqrzoZpwfIIDDoAcAAAAAAP0_zNEg6T_KyMA?width=180" alt="Logo Rosfal" class="logo">
            <h3 style="margin-top: 10px;">CONTRATO DE PRÉSTAMO</h3>
        </div>

        <div class="mt-5">
            <h4 class="mt-3">
                <strong>Fecha de Solicitud:</strong> ${fecha}
               
                <strong> &nbsp; Referencia:</strong> 
            </h4>

            <p class="justify mt-3">
                <strong>ENTRE:</strong> De una parte <strong>ROSFAL SOLUCIONES DE PRÉSTAMOS</strong>, sociedad comercial organizada y existente de conformidad con las leyes de la República Dominicana, y Domicilio principal establecido en Sto Dgo. Oeste R.D.
            </p>

            <p class="justify mt-3">
                Quien en lo adelante de este contrato se denominará <strong>ROSFAL</strong>, o por su nombre completo; Y de la otra parte, el/la señor/a:
                <strong>${nombre} ${apellido}</strong>, dominicano/a, mayor de edad, portador de la cédula de identidad y electoral No.
                <strong>${cedula}</strong>, domiciliado y residente en
                <strong>${direccion}</strong>, persona que en lo adelante del presente contrato se denominará como <strong>EL DEUDOR</strong> o por su nombre completo;
            </p>

            <p class="justify mt-3">
                <strong>POR CUANTO: EL DEUDOR</strong> ha solicitado a <strong>ROSFAL</strong> el otorgamiento de un préstamo por la suma de <strong>(RD$ ${montoSolicitado})</strong> <strong>PESOS DOMINICANOS</strong>, moneda de curso legal.
            </p>

            <p class="justify mt-3">
                <strong>POR CUANTO: ROSFAL</strong> ha manifestado su intención de otorgarle a <strong>EL DEUDOR</strong> el préstamo solicitado, sujeto a los términos y condiciones que se establecen en el presente contrato.
            </p>

            <p class="justify mt-3">
                <strong>POR TANTO</strong>, y en el entendido de que el anterior preámbulo forma parte integrante del presente acto, las partes;
            </p>

            <p class="justify mt-3">
                <strong>HAN CONVENIDO Y PACTADO LO SIGUIENTE: ARTÍCULO 1. OBJETO</strong>.- Por medio del presente contrato, <strong>ROSFAL</strong> otorga a favor de <strong>EL DEUDOR</strong>, quien acepta conforme lo establecido un préstamo por la suma más arriba descrita, suma que <strong>EL DEUDOR</strong> declara haber recibido a su entera satisfacción a la firma del presente acuerdo.
            </p>

            <p class="justify mt-3">
                <strong>ARTÍCULO 2. FRECUENCIAS DE CUOTAS.- EL DEUDOR</strong> se compromete a pagar la cuota de su préstamo a <strong>ROSFAL</strong> en la frecuencia establecida por <strong>${frecuenciaPagos}</strong>.
            </p>

            <p class="justify mt-3">
                <strong>ARTÍCULO 3. PAGO.- EL DEUDOR</strong> se compromete a pagar a <strong>ROSFAL</strong> la cuota establecida en base a las condiciones del préstamo, cuota que se compromete a pagar <strong>EL DEUDOR</strong> por concepto de cada <strong>${frecuenciaPagos}</strong>, en el asiento social de <strong>ROSFAL</strong>, o en el medio de pago que se indique, sin necesidad de requerimientos.
            </p>

            <p class="justify mt-3">
                La falta de pago de tres (3) cuotas consecutivas, hará perder al <strong>EL DEUDOR</strong> el beneficio del término acordado y el pago de la obligación se hará exigible en su totalidad, después de <strong>ROSFAL</strong> haber cumplido con los procedimientos legales, judiciales o extrajudiciales establecidos por la ley para hacer exigible el pago de la deuda.
            </p>

            <p class="justify mt-3">
                <strong>ARTÍCULO 4:</strong> Queda expresamente convenido entre las partes, que en caso de incumplimiento o retraso en el pago de las obligaciones asumidas por <strong>EL DEUDOR</strong>, este último deberá pagar, en adición, una penalidad por mora equivalente al cinco por ciento (5%) por cada cuota vencida.
            </p>

        <table style="width: 100%; margin-top: 20px; border-collapse: collapse; border: none;">
            <tr>
            <td style="width: 50%; text-align: center; vertical-align: middle; border: none;">
            <img 
                src="https://1drv.ms/i/c/c31f9c66e8bcaac9/IQT07QITK79-SYWC821wCZYpAXmpWiFR_pHUpLJjznWUGcA" 
                alt="Sello Rosfal" 
                style="width: 200px; height: auto;"
            >
            </td>
        
            <td style="width: 50%; text-align: center; vertical-align: middle; border: none;">
            <div style="margin-top: 80px; font-family: Arial, sans-serif; color: #333;">
                <p style="margin: 0; font-size: 14px;">_________________________</p>
                <p style="margin: 5px 0 0 0; font-size: 14px;">
                    <strong style="font-weight: bold;">EL DEUDOR</strong><br>
                    ${nombre} ${apellido}
                </p>
            </div>
            </td>
            </tr>
        </table>
        </div>
    </div>
</body>
</html>
`;
    console.time("GenerarPDF");
    // 2. Generar el PDF
    let opciones = {

        width: '8.5in',
        height: '17in',
        phantomPath: phantomjs.path, // <--- ESTA ES LA LÍNEA CLAVE
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage', // Vital para servidores con poca RAM
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process' // Reduce el consumo de CPU
        ]
    };
    let archivo = { content: htmlContrato };
    console.timeEnd("GenerarPDF");

    console.time("pdfBuffer");
    // const pdfBuffer = await html_to_pdf.generatePdf(archivo, opciones);
    const pdfBuffer = await new Promise((resolve, reject) => {
        pdf.create(htmlContrato, opciones).toBuffer((err, buffer) => {
            if (err) reject(err);
            else resolve(buffer);
        });
    });

    console.log("PDF generado con html-pdf correctamente");
    console.timeEnd("pdfBuffer");

    // #1 FUNCION QUE ENVIA AL CORREO NOTIFICACION DE SOLICITUD DE PRESTAMOS A ROSFAL
    var callback = async function(res) {
        async function notificacionCorreo() {
            try {
                const from = "contacto@rosfal.com"
                const toNotificacion = "jfalcon@rosfal.com"

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
              .main-wrapper {
                max-width: 600px;
                margin: 0 auto;
                text-align: center;
                
            }
        .footer {
            text-align: center;
            font-size: 14px;
            padding: 10px;
            border-top: 1px solid #eeeeee;
            text-decoration: none;
        }
        .highlight {
            font-weight: bold;
            color: #2D8DBD;
        }
    </style>
</head>
<body>
    <div class="container">
         <div class="main-wrapper">

            <img src="cid:logo_rosfal" alt="Rosfal" class="" style="width: 150px;">
            

        </div>
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
            <h4 style="color: #2D8DBD;">ROSFAL SOLUCIONES DE PRÉSTAMOS</h4>
            <p><strong>T.</strong> 829-856-0203 | <strong>Email:</strong> contacto@rosfal.com</p>
            <p>Síguenos en <strong>FB:</strong> Rosfalrd | <strong>IG:</strong> @Rosfalrd</p>
            <p><a href="https://www.rosfal.com" target="_blank">www.rosfal.com</a></p>
        </div>
    </div>
</body>
            `,
                    attachments: [{
                        filename: `Contrato_Prestamo_Rosfal_${cedula}_${nombre}_${apellido}.pdf`,
                        content: pdfBuffer // Aquí pasamos el PDF generado
                    }, {

                        filename: 'LOGO-ROSFAL-2.png',
                        path: './public/img/LOGO-ROSFAL-2.png', // Verifica que esta ruta sea correcta en tu servidor
                        cid: 'logo_rosfal' // Este ID debe coincidir con el src del HTML
                    }]

                });

                console.log("Correo enviado a Rosfal: %s", info.messageId);

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

            .greeting {
            font-size: 28px;
            color: #4a4a4a;
            margin-bottom: 30px;
            font-weight: normal;
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
            .main-wrapper {
                max-width: 600px;
                margin: 0 auto;
                text-align: center;
                
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
        <div class="main-wrapper">

            <img src="cid:logo_rosfal" alt="Rosfal" class="" style="width: 150px;">
            <hr style="border: 0; border-top: 1px solid #495057; margin: 20px 0;">

            <h2 class="greeting">Hola ${nombre}</h2>
        </div>
        <div class="header">Gracias por confiar en Rosfal</div>
        <div class="content">

            <p>Esperamos que se encuentre bien. Le escribimos para confirmar que hemos recibido su <strong>solicitud de préstamo</strong>.</p>
            <p>Actualmente su solicitud está siendo revisada. Nos pondremos en contacto con usted para informarle si su solicitud ha sido aprobada, por lo que le recomendamos estar atento a su proceso.</p>
            <p>Mientras tanto, si tiene alguna pregunta o inquietud, no dude en ponerse en contacto con nosotros.</p>
            <p><strong>Horarios de atención:</strong> Lunes a viernes, de 8:00 a.m. a 6:00 p.m.</p>

            <p>Estamos aquí para acompañarte en cada paso hacia tus metas.</p>


        </div>
        <div class="footer">
            <h4 style="color: #2D8DBD;">ROSFAL SOLUCIONES DE PRÉSTAMOS</h4>
            <p><strong>T.</strong> 829-856-0203 | <strong>Email:</strong> contacto@rosfal.com</p>
            <p>Síguenos en <strong>FB:</strong> Rosfalrd | <strong>IG:</strong> @Rosfalrd</p>
            <p><a href="https://www.rosfal.com" target="_blank">www.rosfal.com</a></p>
        </div>
    </div>
    <div class="main-wrapper">
        <p>¿No reconoces esta actividad?<br> ¡Por favor contacta con nosotros!</p>
        <a href="mailto:contacto@rosfal.com">contacto@rosfal.com</a>
    </div>
    </body>
                `,
                    attachments: [{
                        filename: `Contrato_Prestamo_Rosfal_${cedula}_${nombre}_${apellido}.pdf`,
                        content: pdfBuffer // Aquí pasamos el PDF generado
                    }, {

                        filename: 'LOGO-ROSFAL-2.png',
                        path: './public/img/LOGO-ROSFAL-2.png', // Verifica que esta ruta sea correcta en tu servidor
                        cid: 'logo_rosfal' // Este ID debe coincidir con el src del HTML
                    }]
                });

                console.log("Correo enviado al cliente: %s", info.messageId);

            } catch (error) {
                console.log(error);
            }
        }

        enviarCorreo()
    };


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

    // console.log('actualiza cliente ', actualizaCliente)


    await pool.query('INSERT INTO solicitudes set ?', [nuevaSolicitud]);


    const app_clientedDB = await pool.query("SELECT cliente_id FROM app_clientes WHERE telefono = ?", [celular]);
    // console.log('app_clientedDB ', app_clientedDB)
    if (app_clientedDB[0]) {
        // console.log('entro porque hay un id del cliente ')
        await pool.query("UPDATE app_clientes set ? WHERE telefono = ?", [actualizaCliente, celular]);

        // console.log(app_clientedDB[0].cliente_id + " cliente id tab app_clientes")

        const solicitudDB = await pool.query(`SELECT idSolicitud, celular FROM solicitudes WHERE celular = ${celular} ORDER BY idSolicitud DESC LIMIT 1`)

        // console.log(solicitudDB[0].celular + " Celular cliente solicitud")


        const actualizaCliente_id = { cliente_id: app_clientedDB[0].cliente_id }

        await pool.query("UPDATE solicitudes set ? WHERE idSolicitud = ?", [actualizaCliente_id, solicitudDB[0].idSolicitud]);
    }

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
            permiso_C,
            config

        });
    } else {


        return res.render('solicita-ya', {
            alert: true,
            alertTitle: "Muchas Gracias",
            alertMessage: "¡SOLICITUD ENVIADA CORRECTAMENTE!",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 2000,
            ruta: 'solicita-ya',
            rol: req.session.rol,
            permiso_C,
            config

        });
    };


});




module.exports = router;