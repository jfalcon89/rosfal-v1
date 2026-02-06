// services/conteosService.js

const { json } = require("body-parser");
const express = require("express");
const router = express.Router();

const pool = require("../database"); // importa tu conexión MySQL

async function obtenerConteos() {
    try {

        // console.log('entro al servicio de conteo')
        const conteos = await pool.query(`
      SELECT
        (SELECT COUNT(idUsuario) FROM users) AS totalUsuarios,
        (SELECT COUNT(cliente_id) FROM app_clientes) AS totalClientes,
        (SELECT COUNT(idSolicitud) FROM solicitudes WHERE estadoSolicitud="Nueva") AS totalSolicitudesNuevas,
        (SELECT COUNT(idSolicitud) FROM solicitudes WHERE estadoSolicitud="Aprobada" OR estadoSolicitud = 'En Legal') AS totalSolicitudesAprobadas,
        (SELECT COUNT(idSolicitud) FROM solicitudes WHERE estadoSolicitud="En Revision") AS totalSolicitudesEnRevision,
        (SELECT COUNT(idSolicitud) FROM solicitudes WHERE estadoSolicitud="Declinada") AS totalSolicitudesDeclinadas,
        (SELECT COUNT(idSolicitud) FROM solicitudes WHERE estadoSolicitud="En Legal") AS totalSolicitudesEnLegal,
        (SELECT COUNT(idSolicitud) FROM solicitudes) AS solicitudesTotales,
        (SELECT COUNT(idMensaje) FROM mensajes WHERE estadoMensaje="Nuevo") AS totalMensajesNuevos,
        (SELECT COUNT(idRuta) FROM rutas) AS totalRutas,
        (SELECT COUNT(idVisita) FROM visitas) AS totalVisitas,
        (SELECT COUNT(idTestimonio) FROM testimonios WHERE estadoTestimonio="Nuevo") AS totalTestimoniosNuevos,
        (SELECT COUNT(idSolicitud) FROM solicitudes WHERE estadoSolicitud = 'Aprobada' AND atraso > 0) AS totalAtrasos
    `);
        // console.log('conteos listado ', conteos[0])
        return conteos[0]; // devuelve solo el objeto con los totales
    } catch (error) {
        console.error("Error en conteosService:", error);
        throw error;
    }
}

module.exports = { obtenerConteos };