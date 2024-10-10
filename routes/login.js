const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
// const empleado = require("../modelo/empleado");
const moment = require("moment");
const pool = require("../database");
const bcrypt = require('bcryptjs');
const useragent = require('express-useragent');

//9 - establecemos las rutas
router.get('/login', (req, res) => {
    const device = req.useragent.isMobile ? 'Mobile' : 'Desktop';
    res.render('login', {
        device
    });
})


//11 - Metodo para la autenticacion
router.post('/auth', async(req, res) => {
    const device = req.useragent.isMobile ? 'Mobile' : 'Desktop';
    const user = req.body.user;
    const pass = req.body.pass;
    let passwordHash = await bcrypt.hash(pass, 8);
    if (user && pass) {
        pool.query('SELECT * FROM users WHERE user = ?', [user], async(error, results, fields) => {
            if (results.length == 0 || !(await bcrypt.compare(pass, results[0].pass))) {
                res.render('login', {
                    device,
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "USUARIO y/o PASSWORD incorrectas",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });

                //Mensaje simple y poco vistoso
                //res.send('Incorrect Username and/or Password!');				
            } else {
                //creamos una var de session y le asignamos true si INICIO SESSION       
                req.session.loggedin = true;
                req.session.user = results[0].user;
                req.session.name = results[0].name;
                req.session.rol = results[0].rol;
                res.render('login', {
                    device,
                    alert: true,
                    alertTitle: "Conexión exitosa",
                    alertMessage: "¡LOGIN CORRECTO!",
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: 'panel-administracion'
                });
            }
            res.end();
        });
    } else {
        res.send('Please enter user and Password!');
        res.end();
    }
});








module.exports = router;