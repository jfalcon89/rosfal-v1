const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");




// RENDERIZANDO Y MOSTRANDO TODAS LAS VISITAS
router.get('/visitas-web', async(req, res) => {
    if (req.session.loggedin) {


        const arrayVisitasDB = await pool.query('SELECT * FROM visitas ');
        const pcDB = await pool.query('SELECT count(device) pc FROM visitas where device = "Desktop";');
        const androidDB = await pool.query('SELECT count(device) android FROM visitas where device = "Mobile" and plataforma = "Android";');
        const iphoneDB = await pool.query('SELECT count(device) iphone FROM visitas where device = "Mobile" and plataforma = "iPhone";');
        const ipadDB = await pool.query('SELECT count(device) ipad FROM visitas where device = "Mobile" and plataforma = "iPad";');
        const visitasPorMesDB = await pool.query("SELECT MONTHNAME(STR_TO_DATE(fecha, '%c/%e/%Y')) AS mes, COUNT(*) AS total_visitas FROM visitas GROUP BY MONTH(STR_TO_DATE(fecha, '%c/%e/%Y')) ORDER BY MONTH(STR_TO_DATE(fecha, '%c/%e/%Y'));");



        console.log(pcDB[0])
        console.log(visitasPorMesDB)

        res.render("visitas-web", {
            arrayVisitas: arrayVisitasDB,
            pc: pcDB[0],
            android: androidDB[0],
            iphone: iphoneDB[0],
            ipad: ipadDB[0],
            visitasPorMes: visitasPorMesDB,
            login: true,
            name: req.session.name


        });

    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
            device: req.useragent.isMobile ? 'Mobile' : 'Desktop'
        });
    }

});






















module.exports = router;