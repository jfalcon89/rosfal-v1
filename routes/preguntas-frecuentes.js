const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");



router.get('/preguntas-frecuentes', (req, res) => {

    const info = req.params;

    // const inputTipPrestamo

    // console.log(info);

    res.render('preguntas-frecuentes');
});









module.exports = router;