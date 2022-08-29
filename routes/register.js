const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
// const empleado = require("../modelo/empleado");
const moment = require("moment");
const pool = require("../database");
const bcrypt = require('bcryptjs');



router.get('/register', (req, res) => {
    res.render('register');
})

//10 - Método para la REGISTRACIÓN
router.post('/register', async(req, res) => {
    const user = req.body.user;
    const name = req.body.name;
    // const rol = req.body.rol;
    const pass = req.body.pass;
    let passwordHash = await bcrypt.hash(pass, 8);
    pool.query('INSERT INTO users SET ?', { user: user, name: name, pass: passwordHash }, async(error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.render('register', {
                alert: true,
                alertTitle: "Registration",
                alertMessage: "¡Successful Registration!",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: 'login'
            });
            // res.redirect('panel-administracion');
        }
        res.end();
    });
})









module.exports = router;