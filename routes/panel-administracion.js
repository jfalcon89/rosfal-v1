const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");
const { format } = require('date-fns');
const { es } = require('date-fns/locale');



// router.get('/panel-administracion/:id', async(req, res) => {
//     const id = req.params.id
//     const documentosClienteDB = await pool.query(`SELECT archivo_id, prestamo_id, celular, nombre_archivo, fecha_subida FROM archivos_prestamos where prestamo_id = '${id}'`);

//     res.render('panel-administracion', {
//         documentosCliente: documentosClienteDB
//     });
// })

// RENDERIZANDO Y MOSTRANDO TODOS LAS SOLITUDES NUEVAS********************
router.get('/panel-administracion', async(req, res) => {

    let device = '';

    if (req.session.loggedin) {


        const permiso_A = 'Administrador'
        const permiso_B = 'Representante'
        const permiso_C = 'Cliente App'

        if (req.session.rol == 'Cliente App') {

            try {

                let i = 0
                let a = 0;
                a++

                const id = req.params.id

                console.log(id)

                const usuarioDB = await pool.query('SELECT * FROM users WHERE user = ?', [req.session.user]);
                const clienteDB = await pool.query('SELECT * FROM app_clientes WHERE telefono = ?', [req.session.user]);
                const documentosClienteDB = await pool.query(`SELECT archivo_id, prestamo_id, celular, nombre_archivo, tipo_documento, fecha_subida FROM archivos_prestamos where celular = '${req.session.user}'`);
                const arrayArchivosDB = await pool.query('SELECT archivo_id, celular, prestamo_id, nombre_archivo, tipo_documento, fecha_subida FROM archivos_prestamos');

                console.log(req.session)
                console.log(usuarioDB[0])

                const arrayUsuariosDB = await pool.query('SELECT idUsuario FROM users ');
                const arrayClientesDB = await pool.query('SELECT cliente_id FROM app_clientes ');
                const arraySolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
                const arrayMensajesNuevosDB = await pool.query('SELECT idMensaje FROM mensajes WHERE estadoMensaje="Nuevo"');
                const arrayRutasDB = await pool.query('SELECT idRuta FROM rutas ');
                const arrayTestimoniosNuevosDB = await pool.query('SELECT idTestimonio FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');

                const montoPrestadoDB = await pool.query(
                    "SELECT SUM(saldoFinal) montoPrestado FROM solicitudes WHERE (estadoSolicitud = 'Aprobada' OR estadoSolicitud = 'En Legal') AND celular = ?", [req.session.user]
                );
                const solicitudPendienteDB = await pool.query(
                    `SELECT COALESCE( (SELECT idSolicitud FROM solicitudes WHERE (estadoSolicitud = 'Nueva' OR estadoSolicitud = 'En Revision') AND celular = ${req.session.user} LIMIT 1), 0) AS idSolicitud`
                );

                const montoLiquidadoDB = await pool.query(
                    "SELECT SUM(saldoFinal) montoLiquidado FROM solicitudes WHERE estadoSolicitud = 'Liquidado' AND celular = ?", [req.session.user]
                );

                const cantPrestamosDB = await pool.query(
                    "SELECT COUNT(idSolicitud) cantPrestamos FROM solicitudes WHERE (estadoSolicitud = 'Aprobada' OR estadoSolicitud = 'En Legal') AND celular = ?", [req.session.user]
                );

                const prestamosAtrasosDB = await pool.query(
                    "SELECT SUM(atraso) prestamosAtrasos FROM solicitudes WHERE estadoSolicitud = 'Aprobada' AND atraso > 0 AND celular = ?", [req.session.user]
                );

                const prestamosIncobrablesDB = await pool.query(
                    "SELECT SUM(incobrableMonto) prestamosIncobrables FROM solicitudes WHERE estadoSolicitud = 'Incobrable' AND incobrableMonto > 0 AND celular = ?", [req.session.user]
                );

                const prestamosEnLegalDB = await pool.query(
                    "SELECT SUM(legalMonto) prestamosEnLegal FROM solicitudes WHERE estadoSolicitud = 'En Legal' AND legalMonto > 0 AND celular = ?", [req.session.user]
                );
                const creditosAcumuladosDB = await pool.query(
                    `SELECT SUM(valor_credito) valor_credito FROM promociones_clientes WHERE cliente_id = '${usuarioDB[0].idUsuario}' AND estado_promocion = 'Aprobado'`
                );

                const cantAtrasosDB = await pool.query(
                    "SELECT COUNT(idSolicitud) cantAtrasos FROM solicitudes WHERE estadoSolicitud = 'Aprobada' AND atraso > 0 AND celular = ?", [req.session.user]
                );

                // Porcentajes
                const porcentajeAprobacionesDB = await pool.query(
                    "SELECT LEFT((SUM(CASE WHEN estadoSolicitud IN ('Aprobada', 'En Legal') THEN montoSolicitado ELSE 0 END) / SUM(montoSolicitado)) * 100, 5) AS porcentajeAprobaciones FROM solicitudes WHERE celular = ?", [req.session.user]
                );

                const porcentajeDeclinacionesDB = await pool.query(
                    "SELECT LEFT((SUM(CASE WHEN estadoSolicitud IN ('Declinada') THEN montoSolicitado ELSE 0 END) / SUM(montoSolicitado)) * 100, 5) AS porcentajeDeclinaciones FROM solicitudes WHERE celular = ?", [req.session.user]
                );

                const porcentajeEnRevisionDB = await pool.query(
                    "SELECT LEFT((SUM(CASE WHEN estadoSolicitud IN ('En Revision') THEN montoSolicitado ELSE 0 END) / SUM(montoSolicitado)) * 100, 5) AS porcentajeEnRevision FROM solicitudes WHERE celular = ?", [req.session.user]
                );

                const porcentajeNuevasDB = await pool.query(
                    "SELECT LEFT((SUM(CASE WHEN estadoSolicitud IN ('Nueva') THEN montoSolicitado ELSE 0 END) / SUM(montoSolicitado)) * 100, 5) AS porcentajeNuevas FROM solicitudes WHERE celular = ?", [req.session.user]
                );

                const porcentajeLiquidadoDB = await pool.query(
                    "SELECT LEFT((SUM(CASE WHEN estadoSolicitud IN ('Liquidado') THEN montoSolicitado ELSE 0 END) / SUM(CASE WHEN estadoSolicitud IN ('Aprobada', 'Incobrable', 'En Legal', 'Liquidado') THEN montoSolicitado ELSE 0 END)) * 100, 5) AS porcentajeLiquidado FROM solicitudes WHERE celular = ?", [req.session.user]
                );

                const porcentajeEnLegalDB = await pool.query(
                    "SELECT LEFT((SUM(CASE WHEN legalMonto > 0 THEN legalMonto ELSE 0 END) / SUM(CASE WHEN estadoSolicitud IN ('Aprobada', 'En Legal') THEN montoSolicitado ELSE 0 END)) * 100, 5) AS porcentajeEnLegal FROM solicitudes WHERE celular = ?", [req.session.user]
                );

                const porcentajeAtrasoDB = await pool.query(
                    "SELECT LEFT((SUM(CASE WHEN atraso > 0 THEN atraso ELSE 0 END) / SUM(CASE WHEN estadoSolicitud IN ('Aprobada', 'En Legal', 'Incobrable') THEN montoSolicitado ELSE 0 END)) * 100, 5) AS porcentajeAtraso FROM solicitudes WHERE celular = ?", [req.session.user]
                );

                const porcentajeIncobrableDB = await pool.query(
                    "SELECT LEFT((SUM(CASE WHEN incobrableMonto > 0 THEN incobrableMonto ELSE 0 END) / SUM(CASE WHEN estadoSolicitud IN ('Aprobada', 'En Legal') THEN montoSolicitado ELSE 0 END)) * 100, 5) AS porcentajeIncobrable FROM solicitudes WHERE celular = ?", [req.session.user]
                );

                // Arrays
                const arraySolicitudesAprobadasDB = await pool.query(
                    'SELECT * FROM solicitudes WHERE (estadoSolicitud="Aprobada" OR estadoSolicitud = "En Legal") AND celular = ? ORDER BY fechaSolicitud DESC', [req.session.user]
                );

                const arraySolicitudesAprobadasFirmadasDB = await pool.query(
                    'SELECT * FROM solicitudes WHERE firmaContrato="NO" AND (estadoSolicitud="Aprobada" OR estadoSolicitud ="En Legal") AND celular = ?', [req.session.user]
                );

                const arraySolicitudesAtrasadasDB = await pool.query(
                    'SELECT * FROM solicitudes WHERE estadoSolicitud="Aprobada" AND atraso > 0 AND celular = ?', [req.session.user]
                );

                const arrayNotificacionAtrasoDB = await pool.query(
                    `SELECT novedades_atrasos.idSolicitud, idNovedadAtraso, solicitudes.nombre, solicitudes.apellido, novedades_atrasos.celular, novedades_atrasos.ruta, novedades_atrasos.atraso, fechaNovedad 
            FROM novedades_atrasos, solicitudes 
            WHERE novedades_atrasos.idSolicitud = solicitudes.idSolicitud AND solicitudes.celular = ? 
            ORDER BY fechaNovedad DESC`, [req.session.user]
                );

                const arraySolicitudesEnLegalDB = await pool.query(
                    'SELECT * FROM solicitudes WHERE estadoSolicitud="En Legal" AND celular = ?', [req.session.user]
                );

                const arraySolicitudesLiquidadasDB = await pool.query(
                    'SELECT * FROM solicitudes WHERE estadoSolicitud="Liquidado" AND celular = ?', [req.session.user]
                );

                const arraySolicitudesIncobrablesDB = await pool.query(
                    'SELECT * FROM solicitudes WHERE estadoSolicitud="Incobrable" AND celular = ?', [req.session.user]
                );

                const SolicitudesClienteDB = await pool.query(`SELECT  nombre, apellido, celular FROM solicitudes WHERE celular = '${req.session.user}' limit 1`);

                const SolicitudesClientePagosDB = await pool.query(`SELECT idSolicitud, montoCuota, fechaPago, celular, fechaSolicitud FROM solicitudes WHERE celular = '${req.session.user}'  AND (estadoSolicitud="Aprobada" OR estadoSolicitud ="En Legal") ORDER BY fechaSolicitud DESC limit 1`);

                // Obtener la fecha de hoy
                const hoy = new Date();



                // console.log(SolicitudesClientePagosDB.length > 0)
                // console.log(SolicitudesClientePagosDB[0].fechaPago.length > 0)

                if (SolicitudesClientePagosDB.length > 0) {
                    // Convierte la fecha en un objeto Date
                    var fechaPago = new Date(SolicitudesClientePagosDB[0].fechaPago);

                    if (SolicitudesClientePagosDB[0].fechaPago) {

                        // Formatea la fecha
                        var fechaFormateada = format(fechaPago, "d 'de' MMMM, yyyy", { locale: es });
                        var fechaHoyFormateada = format(hoy, "d 'de' MMMM, yyyy", { locale: es });
                    } else {
                        fechaFormateada = 0;
                        fechaHoyFormateada = 0;
                    }
                }

                return res.render("panel-administracion", {
                    arrayUsuarios: arrayUsuariosDB,
                    arrayClientes: arrayClientesDB,
                    arraySolicitudes: arraySolicitudesDB,
                    arrayMensajesNuevos: arrayMensajesNuevosDB,
                    arrayRutas: arrayRutasDB,
                    SolicitudesCliente: SolicitudesClienteDB,
                    arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                    arraySolicitudesAprobadasFirmadas: arraySolicitudesAprobadasFirmadasDB,
                    arraySolicitudesAtrasadas: arraySolicitudesAtrasadasDB,
                    arraySolicitudesLiquidadas: arraySolicitudesLiquidadasDB,
                    arrayTestimoniosNuevos: arrayTestimoniosNuevosDB,
                    montoPrestado: montoPrestadoDB[0].montoPrestado,
                    cantPrestamos: cantPrestamosDB[0].cantPrestamos,
                    prestamosAtrasos: prestamosAtrasosDB[0].prestamosAtrasos,
                    prestamosEnLegal: prestamosEnLegalDB[0].prestamosEnLegal,
                    prestamosEnLegalValidacion: prestamosEnLegalDB[0].prestamosEnLegal,
                    prestamosIncobrables: prestamosIncobrablesDB[0].prestamosIncobrables,
                    cantAtrasos: cantAtrasosDB[0].cantAtrasos,
                    montoLiquidado: montoLiquidadoDB[0].montoLiquidado,
                    arrayNotificacionAtraso: arrayNotificacionAtrasoDB,
                    arraySolicitudesEnLegal: arraySolicitudesEnLegalDB,
                    arraySolicitudesIncobrables: arraySolicitudesIncobrablesDB,
                    porcentajeAprobaciones: porcentajeAprobacionesDB[0].porcentajeAprobaciones,
                    porcentajeDeclinaciones: porcentajeDeclinacionesDB[0].porcentajeDeclinaciones,
                    porcentajeEnRevision: porcentajeEnRevisionDB[0].porcentajeEnRevision,
                    porcentajeNuevas: porcentajeNuevasDB[0].porcentajeNuevas,
                    porcentajeLiquidado: porcentajeLiquidadoDB[0].porcentajeLiquidado,
                    porcentajeEnLegal: porcentajeEnLegalDB[0].porcentajeEnLegal,
                    porcentajeAtraso: porcentajeAtrasoDB[0].porcentajeAtraso,
                    porcentajeIncobrable: porcentajeIncobrableDB[0].porcentajeIncobrable,
                    solicitudPendiente: solicitudPendienteDB[0].idSolicitud,
                    SolicitudMontoCuota: SolicitudesClientePagosDB[0],
                    SolicitudFechaPago: fechaFormateada,
                    fechaHoyFormateada,
                    hoy,
                    fechaPago,
                    i,
                    a,
                    login: true,
                    name: req.session.name,
                    rol: req.session.rol,
                    user: req.session.user,
                    permiso_A,
                    permiso_B,
                    permiso_C,
                    usuario: usuarioDB[0],
                    cliente: clienteDB[0],
                    documentosCliente: documentosClienteDB,
                    arrayArchivos: arrayArchivosDB,
                    creditosAcumulados: creditosAcumuladosDB[0].valor_credito

                });

            } catch (error) {
                console.log('este es el error' + error)
                res.render("404", {
                    error: true,
                    mensaje: "no se encuentra el id seleccionado"
                });
            }

        } else {

            let device = '';

            let i = 0
            let a = 0
            console.log(req.session)

            const documentosClienteDB = await pool.query(`SELECT archivo_id, prestamo_id, celular, nombre_archivo, tipo_documento, fecha_subida FROM archivos_prestamos `);


            const arrayUsuariosDB = await pool.query('SELECT idUsuario FROM users ');
            const arrayClientesDB = await pool.query('SELECT cliente_id FROM app_clientes ');
            const arraySolicitudesDB = await pool.query('SELECT idSolicitud FROM solicitudes WHERE estadoSolicitud="nueva"');
            const arrayMensajesNuevosDB = await pool.query('SELECT idMensaje FROM mensajes WHERE estadoMensaje="Nuevo"');
            const arrayRutasDB = await pool.query('SELECT idRuta FROM rutas ');
            const arrayVisitasDB = await pool.query('SELECT idVisita FROM visitas ');
            const arrayTestimoniosNuevosDB = await pool.query('SELECT idTestimonio FROM testimonios WHERE estadoTestimonio="Nuevo" ORDER BY fechaTestimonio DESC');

            const montoPrestadoDB = await pool.query("SELECT SUM(saldoFinal) montoPrestado FROM solicitudes WHERE estadoSolicitud = 'Aprobada' OR estadoSolicitud = 'En Legal' ")
            const montoLiquidadoDB = await pool.query("SELECT SUM(saldoFinal) montoLiquidado FROM solicitudes WHERE estadoSolicitud = 'Liquidado'")
            const cantPrestamosDB = await pool.query("SELECT COUNT(idSolicitud) cantPrestamos FROM solicitudes WHERE estadoSolicitud = 'Aprobada' OR estadoSolicitud = 'En Legal'")
            const prestamosAtrasosDB = await pool.query("SELECT SUM(atraso) prestamosAtrasos FROM solicitudes WHERE estadoSolicitud = 'Aprobada' AND atraso > 0")
            const prestamosIncobrablesDB = await pool.query("SELECT SUM(incobrableMonto) prestamosIncobrables FROM solicitudes WHERE estadoSolicitud = 'Incobrable' AND incobrableMonto > 0")
            const prestamosEnLegalDB = await pool.query("SELECT SUM(legalMonto) prestamosEnLegal FROM solicitudes WHERE estadoSolicitud = 'En Legal' AND legalMonto > 0")
            const cantAtrasosDB = await pool.query("SELECT COUNT(idSolicitud) cantAtrasos FROM solicitudes WHERE estadoSolicitud = 'Aprobada' AND atraso > 0")

            // porcentajes
            const porcentajeAprobacionesDB = await pool.query("SELECT LEFT((SUM(CASE WHEN estadoSolicitud IN ('Aprobada', 'En Legal') THEN montoSolicitado ELSE 0 END) / SUM(montoSolicitado)) * 100, 5) AS porcentajeAprobaciones FROM solicitudes;")
            const porcentajeDeclinacionesDB = await pool.query("SELECT LEFT((SUM(CASE WHEN estadoSolicitud IN ('Declinada') THEN montoSolicitado ELSE 0 END) / SUM(montoSolicitado)) * 100, 5) AS porcentajeDeclinaciones FROM solicitudes;")
            const porcentajeEnRevisionDB = await pool.query("SELECT LEFT((SUM(CASE WHEN estadoSolicitud IN ('En Revision') THEN montoSolicitado ELSE 0 END) / SUM(montoSolicitado)) * 100, 5) AS porcentajeEnRevision FROM solicitudes;")
            const porcentajeNuevasDB = await pool.query("SELECT LEFT((SUM(CASE WHEN estadoSolicitud IN ('Nueva') THEN montoSolicitado ELSE 0 END) / SUM(montoSolicitado)) * 100, 5) AS porcentajeNuevas FROM solicitudes;")
            const porcentajeLiquidadoDB = await pool.query("SELECT left((SUM(CASE WHEN estadoSolicitud IN ('Liquidado') THEN montoSolicitado ELSE 0 END) / SUM(CASE WHEN estadoSolicitud IN ('Aprobada', 'Incobrable', 'En Legal', 'Liquidado') THEN montoSolicitado ELSE 0 END)) * 100, 5 ) AS porcentajeLiquidado FROM solicitudes;")
            const porcentajeEnLegalDB = await pool.query("SELECT left((SUM(CASE WHEN legalMonto > 0 THEN legalMonto ELSE 0 END) / SUM(CASE WHEN estadoSolicitud IN ('Aprobada', 'En Legal') THEN montoSolicitado ELSE 0 END)) * 100, 5) AS porcentajeEnLegal FROM solicitudes;")
            const porcentajeAtrasoDB = await pool.query("SELECT left((SUM(CASE WHEN atraso > 0 THEN atraso ELSE 0 END) / SUM(CASE WHEN estadoSolicitud IN ('Aprobada', 'En Legal', 'Incobrable') THEN montoSolicitado ELSE 0 END)) * 100, 5) AS porcentajeAtraso FROM solicitudes;")
            const porcentajeIncobrableDB = await pool.query("SELECT left((SUM(CASE WHEN incobrableMonto > 0 THEN incobrableMonto ELSE 0 END) / SUM(CASE WHEN estadoSolicitud IN ('Aprobada', 'En Legal') THEN montoSolicitado ELSE 0 END)) * 100, 5) AS porcentajeIncobrable FROM solicitudes;")
            const SolicitudesCliente = ''

            const arraySolicitudesAprobadasDB = await pool.query(`SELECT  s.*, (SELECT SUM(s2.saldoFinal) FROM solicitudes s2 WHERE s2.cedula = s.cedula AND s2.estadoSolicitud = "Liquidado" AND s2.cedula IS NOT NULL AND s2.cedula != '' ) AS prestamosLiquidadosCliente FROM solicitudes s WHERE s.estadoSolicitud = "Aprobada" OR s.estadoSolicitud = "En Legal" ORDER BY s.fechaSolicitud DESC;`)
            const arraySolicitudesAprobadasFirmadasDB = await pool.query('SELECT * FROM solicitudes WHERE firmaContrato="NO" AND (estadoSolicitud="Aprobada" OR estadoSolicitud ="En Legal")');
            const arraySolicitudesAtrasadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="Aprobada" AND atraso > 0');
            const arrayNotificacionAtrasoDB = await pool.query(`SELECT novedades_atrasos.idSolicitud, idNovedadAtraso, solicitudes.nombre, solicitudes.apellido, novedades_atrasos.celular, novedades_atrasos.ruta, novedades_atrasos.atraso, fechaNovedad  FROM novedades_atrasos, solicitudes WHERE novedades_atrasos.idSolicitud = solicitudes.idSolicitud ORDER BY fechaNovedad DESC`);
            const arraySolicitudesEnLegalDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="En Legal"');
            const arraySolicitudesLiquidadasDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="Liquidado"');
            const arraySolicitudesIncobrablesDB = await pool.query('SELECT * FROM solicitudes WHERE estadoSolicitud="Incobrable"');

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

            return res.render("panel-administracion", {
                arrayUsuarios: arrayUsuariosDB,
                arrayClientes: arrayClientesDB,
                arraySolicitudes: arraySolicitudesDB,
                arrayMensajesNuevos: arrayMensajesNuevosDB,
                arrayRutas: arrayRutasDB,
                arrayVisitas: arrayVisitasDB,
                SolicitudesCliente,
                arraySolicitudesAprobadas: arraySolicitudesAprobadasDB,
                arraySolicitudesAprobadasFirmadas: arraySolicitudesAprobadasFirmadasDB,
                arraySolicitudesAtrasadas: arraySolicitudesAtrasadasDB,
                arraySolicitudesLiquidadas: arraySolicitudesLiquidadasDB,
                arrayTestimoniosNuevos: arrayTestimoniosNuevosDB,
                montoPrestado: montoPrestadoDB[0].montoPrestado,
                cantPrestamos: cantPrestamosDB[0].cantPrestamos,
                prestamosAtrasos: prestamosAtrasosDB[0].prestamosAtrasos,
                prestamosEnLegal: prestamosEnLegalDB[0].prestamosEnLegal,
                prestamosEnLegalValidacion: prestamosEnLegalDB[0].prestamosEnLegal,
                prestamosIncobrables: prestamosIncobrablesDB[0].prestamosIncobrables,
                cantAtrasos: cantAtrasosDB[0].cantAtrasos,
                montoLiquidado: montoLiquidadoDB[0].montoLiquidado,
                arrayNotificacionAtraso: arrayNotificacionAtrasoDB,
                arraySolicitudesEnLegal: arraySolicitudesEnLegalDB,
                arraySolicitudesIncobrables: arraySolicitudesIncobrablesDB,
                porcentajeAprobaciones: porcentajeAprobacionesDB[0].porcentajeAprobaciones,
                porcentajeDeclinaciones: porcentajeDeclinacionesDB[0].porcentajeDeclinaciones,
                porcentajeEnRevision: porcentajeEnRevisionDB[0].porcentajeEnRevision,
                porcentajeNuevas: porcentajeNuevasDB[0].porcentajeNuevas,
                porcentajeLiquidado: porcentajeLiquidadoDB[0].porcentajeLiquidado,
                porcentajeEnLegal: porcentajeEnLegalDB[0].porcentajeEnLegal,
                porcentajeAtraso: porcentajeAtrasoDB[0].porcentajeAtraso,
                porcentajeIncobrable: porcentajeIncobrableDB[0].porcentajeIncobrable,
                i,
                a,
                login: true,
                name: req.session.name,
                rol: req.session.rol,
                user: req.session.user,
                permiso_A,
                permiso_B,
                permiso_C,
                documentosCliente: documentosClienteDB,
                pagosPromociones: pagosPromocionesDB,
                device


            });
        };

    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
            device: req.useragent.isMobile ? 'Mobile' : 'Desktop'
        });
    }

});



router.post('/panel-administracion', async(req, res) => {
    const idSolicitud = req.body.idSolicitud;
    const celular = req.body.celular;
    const ruta = req.body.ruta;
    const atraso = req.body.atraso;

    const novedadAtraso = { idSolicitud, celular, ruta, atraso }
    console.log(novedadAtraso)

    await pool.query("INSERT INTO novedades_atrasos set ?", [novedadAtraso]);


    res.redirect(`panel-administracion`);
});



// function miFuncion() {
//     console.log("¡Hola en 5 segundos!");
// }

// setTimeout(miFuncion, 5000);








module.exports = router;