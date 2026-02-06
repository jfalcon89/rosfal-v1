// services/conteosService.js

// const { json } = require("body-parser");
// const express = require("express");
// const router = express.Router();

// const pool = require("../database"); // importa tu conexión MySQL

// async function obtenerPrestamosCliente() {
//     try {

//         // console.log('entro al servicio de conteo')
//         const obtenerPrestamo = await pool.query(`SELECT * FROM prestamos where prestamos.idSolicitud = ${req.params.id}`);
//         // console.log('conteos listado ', conteos[0])
//         return obtenerPrestamo[0]; // devuelve solo el objeto con los totales
//     } catch (error) {
//         console.error("Error en obtenerPrestamosCliente:", error);
//         throw error;
//     }
// }

// module.exports = { obtenerPrestamosCliente };