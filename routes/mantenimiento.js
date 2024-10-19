const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");

const multer = require('multer');
const fs = require('fs');


// Configuración de multer para manejar archivos
const storage = multer.memoryStorage(); // Guardar archivos en memoria

const fileFilter = (req, file, cb) => {
    // Filtrar solo archivos PDF, PNG y JPG
    const fileTypes = /pdf|png|jpg|jpeg/;
    const mimeType = file.mimetype.split('/')[1];

    if (fileTypes.test(mimeType)) {
        cb(null, true);
    } else {
        cb(new Error('Formato de archivo no permitido. Solo se aceptan PDF, PNG y JPG.'));
    }
};

// Configuración de Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Límite de 10 MB por archivo
});

// Ruta para subir el archivo PDF
router.post('/upload', upload.single('archivo'), (req, res) => {
    const prestamoId = req.body.prestamo_id; // Obteniendo el ID del préstamo
    const nombreArchivo = req.file.originalname;
    const archivo = req.file.buffer;
    const celular = req.body.celular;
    const tipo_documento = req.body.tipo_documento;

    const query = 'INSERT INTO archivos_prestamos (prestamo_id, celular, nombre_archivo, archivo, tipo_documento) VALUES (?, ?, ?, ?, ?)';
    pool.query(query, [prestamoId, celular, nombreArchivo, archivo, tipo_documento], (err, result) => {
        if (err) {
            console.error('Error al insertar el archivo en la base de datos:', err);
            res.status(500).send('Error al guardar el archivo');
        } else {
            res.redirect('/panel-administracion');
        }
    });
});

// Ruta para descargar un archivo PDF
router.get('/download/:id', (req, res) => {
    const archivoId = req.params.id;

    const query = 'SELECT nombre_archivo, archivo FROM archivos_prestamos WHERE archivo_id = ?';
    pool.query(query, [archivoId], (err, result) => {
        if (err) {
            console.error('Error al obtener el archivo de la base de datos:', err);
            res.status(500).send('Error al obtener el archivo');
        } else if (result.length === 0) {
            res.status(404).send('Archivo no encontrado');
        } else {
            const archivo = result[0];
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${archivo.nombre_archivo}`);
            res.send(archivo.archivo);
        }
    });
});

// 1
// RENDERIZANDO Y MOSTRANDO TODOS LOS DATOS DE REPORTES
router.get('/mantenimiento', async(req, res) => {
    if (req.session.loggedin) {

        const permiso_A = 'Administrador'
        const permiso_B = 'Representante'
        const permiso_C = 'Cliente App'


        if (req.session.rol == 'Cliente App') {

            try {

                const usuarioDB = await pool.query('SELECT * FROM users WHERE user = ?', [req.session.user]);

                const arrayArchivosDB = await pool.query('SELECT archivo_id, celular, prestamo_id, nombre_archivo, tipo_documento, tamano_archivo_kb, fecha_subida FROM archivos_prestamos WHERE celular = ? ORDER BY fecha_subida DESC', [req.session.user]);


                // Total monto prestado para el usuario logueado
                const montoPrestadoDB = await pool.query(
                    "SELECT SUM(saldoFinal) montoPrestado FROM solicitudes WHERE estadoSolicitud IN ('Aprobada',  'En Legal')  AND celular = ?", [req.session.user]
                );

                // Total monto liquidado para el usuario logueado
                const montoLiquidadoDB = await pool.query(
                    "SELECT SUM(saldoFinal) montoLiquidado FROM solicitudes WHERE estadoSolicitud = 'Liquidado' AND celular = ?", [req.session.user]
                );

                // Cantidad de préstamos aprobados para el usuario logueado
                const cantPrestamosDB = await pool.query(
                    "SELECT COUNT(idSolicitud) cantPrestamos FROM solicitudes WHERE estadoSolicitud IN ('Aprobada',  'En Legal') AND celular = ?", [req.session.user]
                );

                // Total de atrasos en los préstamos aprobados para el usuario logueado
                const prestamosAtrasosDB = await pool.query(
                    "SELECT SUM(atraso) prestamosAtrasos FROM solicitudes WHERE estadoSolicitud = 'Aprobada' AND atraso > 0 AND celular = ?", [req.session.user]
                );

                // Cantidad de solicitudes con atraso para el usuario logueado
                const cantAtrasosDB = await pool.query(
                    "SELECT COUNT(idSolicitud) cantAtrasos FROM solicitudes WHERE estadoSolicitud = 'Aprobada' AND atraso > 0 AND celular = ?", [req.session.user]
                );

                // Solicitudes aprobadas, en revisión, nuevas o en legal para el usuario logueado
                const arraySolicitudesAprobadasDB = await pool.query(
                    `SELECT idSolicitud, nombre, apellido, celular 
                        FROM solicitudes 
                        WHERE estadoSolicitud IN ("Aprobada", 'En Legal', 'Nueva', 'En Revision') 
                        AND celular = ? 
                        ORDER BY fechaSolicitud DESC`, [req.session.user]
                );

                // Solicitudes aprobadas y pendientes de firma de contrato para el usuario logueado
                const arraySolicitudesAprobadasFirmadasDB = await pool.query(
                    'SELECT * FROM solicitudes WHERE estadoSolicitud = "Aprobada" AND firmaContrato = "NO" AND celular = ? ORDER BY fechaSolicitud DESC', [req.session.user]
                );

                // Solicitudes aprobadas con atrasos para el usuario logueado
                const arraySolicitudesAtrasadasDB = await pool.query(
                    'SELECT * FROM solicitudes WHERE estadoSolicitud = "Aprobada" AND atraso > 0 AND celular = ?', [req.session.user]
                );

                // Novedades de atrasos para el usuario logueado
                const arrayNotificacionAtrasoDB = await pool.query(
                    `SELECT novedades_atrasos.idSolicitud, idNovedadAtraso, solicitudes.nombre, solicitudes.apellido, novedades_atrasos.celular, novedades_atrasos.ruta, novedades_atrasos.atraso, fechaNovedad  
                        FROM novedades_atrasos, solicitudes 
                        WHERE novedades_atrasos.idSolicitud = solicitudes.idSolicitud 
                        AND solicitudes.celular = ? 
                         ORDER BY fechaNovedad DESC`, [req.session.user]
                );

                // Solicitudes liquidadas para el usuario logueado
                const arraySolicitudesLiquidadasDB = await pool.query(
                    'SELECT * FROM solicitudes WHERE estadoSolicitud = "Liquidado" AND celular = ?', [req.session.user]
                );

                const SolicitudesClienteDB = await pool.query(`SELECT  nombre, apellido, celular FROM solicitudes WHERE celular = '${req.session.user}' limit 1`);

                res.render("mantenimiento", {
                    arrayArchivos: arrayArchivosDB,

                    arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                    arraySolicitudesAprobadasFirmadas: arraySolicitudesAprobadasFirmadasDB,
                    arraySolicitudesAtrasadas: arraySolicitudesAtrasadasDB,
                    arraySolicitudesLiquidadas: arraySolicitudesLiquidadasDB,
                    SolicitudesCliente: SolicitudesClienteDB,
                    montoPrestado: montoPrestadoDB[0].montoPrestado,
                    cantPrestamos: cantPrestamosDB[0].cantPrestamos,
                    prestamosAtrasos: prestamosAtrasosDB[0].prestamosAtrasos,
                    cantAtrasos: cantAtrasosDB[0].cantAtrasos,
                    montoLiquidado: montoLiquidadoDB[0].montoLiquidado,
                    arrayNotificacionAtraso: arrayNotificacionAtrasoDB,
                    login: true,
                    name: req.session.name,
                    rol: req.session.rol,
                    permiso_A,
                    permiso_B,
                    permiso_C,
                    usuario: usuarioDB[0]

                });

            } catch (error) {
                console.log(error)
                res.render("404", {
                    error: true,
                    mensaje: error
                });
            }

        } else {

            try {

                const arrayArchivosDB = await pool.query('SELECT archivo_id, celular, prestamo_id, nombre_archivo, tipo_documento, tamano_archivo_kb, fecha_subida FROM archivos_prestamos ORDER BY fecha_subida DESC');
                const arrayUsuariosDB = await pool.query('SELECT idUsuario FROM users ');
                const arrayClientesDB = await pool.query('SELECT cliente_id FROM app_clientes ');
                const arraySolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
                const arrayMensajesNuevosDB = await pool.query('SELECT idMensaje FROM mensajes WHERE estadoMensaje="Nuevo"');
                const arrayRutasDB = await pool.query('SELECT idRuta FROM rutas ');
                const arrayVisitasDB = await pool.query('SELECT idVisita FROM visitas ');
                const arrayTestimoniosNuevosDB = await pool.query('SELECT idTestimonio FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');


                const montoPrestadoDB = await pool.query("SELECT SUM(saldoFinal) montoPrestado FROM solicitudes WHERE estadoSolicitud IN ('Aprobada',  'En Legal') ")
                const montoLiquidadoDB = await pool.query("SELECT SUM(saldoFinal) montoLiquidado FROM solicitudes WHERE estadoSolicitud = 'Liquidado'")
                const cantPrestamosDB = await pool.query("SELECT COUNT(idSolicitud) cantPrestamos FROM solicitudes WHERE estadoSolicitud IN ('Aprobada',  'En Legal') ")
                const prestamosAtrasosDB = await pool.query("SELECT SUM(atraso) prestamosAtrasos FROM solicitudes WHERE estadoSolicitud = 'Aprobada' AND atraso > 0")
                const cantAtrasosDB = await pool.query("SELECT COUNT(idSolicitud) cantAtrasos FROM solicitudes WHERE estadoSolicitud = 'Aprobada' AND atraso > 0")
                const SolicitudesCliente = ''

                const arraySolicitudesAprobadasDB = await pool.query(`SELECT idSolicitud, nombre, apellido, celular FROM solicitudes WHERE estadoSolicitud IN ("Aprobada" , 'En Legal', 'Nueva', 'En Revision') ORDER BY fechaSolicitud DESC`);
                const arraySolicitudesAprobadasFirmadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="Aprobada" AND firmaContrato= "NO" ORDER BY fechaSolicitud DESC');
                const arraySolicitudesAtrasadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="Aprobada" AND atraso > 0');
                const arrayNotificacionAtrasoDB = await pool.query(`SELECT novedades_atrasos.idSolicitud, idNovedadAtraso, solicitudes.nombre, solicitudes.apellido, novedades_atrasos.celular, novedades_atrasos.ruta, novedades_atrasos.atraso, fechaNovedad  FROM novedades_atrasos, solicitudes WHERE novedades_atrasos.idSolicitud = solicitudes.idSolicitud ORDER BY fechaNovedad DESC`);
                const arraySolicitudesLiquidadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="Liquidado"');
                res.render("mantenimiento", {
                    arrayArchivos: arrayArchivosDB,
                    arraySolicitudes: arraySolicitudesDB,
                    arrayMensajesNuevos: arrayMensajesNuevosDB,
                    SolicitudesCliente,
                    arrayRutas: arrayRutasDB,
                    arrayUsuarios: arrayUsuariosDB,
                    arrayClientes: arrayClientesDB,
                    arrayVisitas: arrayVisitasDB,
                    arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                    arraySolicitudesAprobadasFirmadas: arraySolicitudesAprobadasFirmadasDB,
                    arraySolicitudesAtrasadas: arraySolicitudesAtrasadasDB,
                    arraySolicitudesLiquidadas: arraySolicitudesLiquidadasDB,
                    arrayTestimoniosNuevos: arrayTestimoniosNuevosDB,
                    montoPrestado: montoPrestadoDB[0].montoPrestado,
                    cantPrestamos: cantPrestamosDB[0].cantPrestamos,
                    prestamosAtrasos: prestamosAtrasosDB[0].prestamosAtrasos,
                    cantAtrasos: cantAtrasosDB[0].cantAtrasos,
                    montoLiquidado: montoLiquidadoDB[0].montoLiquidado,
                    arrayNotificacionAtraso: arrayNotificacionAtrasoDB,
                    login: true,
                    name: req.session.name,
                    rol: req.session.rol,
                    permiso_A,
                    permiso_B,
                    permiso_C


                });

            } catch (error) {
                console.log(error)
                res.render("404", {
                    error: true,
                    mensaje: error
                });
            }

        };


    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
        });
    }

});



module.exports = router;