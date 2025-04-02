const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");



//RENDERIZANDO Y MOSTRANDO TODOS LOS ANUNCIOS
router.get('/controles-anuncios', async(req, res) => {
    if (req.session.loggedin) {

        let i = 0

        const anuncioDB = await pool.query('SELECT * FROM tab_anuncios');

        res.render("controles-anuncios", {
            anuncio: anuncioDB,
            i,
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

// //GUARDAR ACTUALIZACION ANUNCIO 
router.post('/controles-anuncios', async(req, res) => {
    const id = req.body.idAnuncio;
    const estado = req.body.estado;
    const anuncio = req.body.anuncio;
    const url_imagen = req.body.url_imagen;

    const actualizacion_anuncio = {
        estado,
        anuncio,
        url_imagen
    }


    console.log(id)
    console.log(estado)
    console.log(anuncio)
    console.log(url_imagen)

    await pool.query("UPDATE tab_anuncios set ? WHERE idAnuncio = ?", [actualizacion_anuncio, id]);
    // req.flash('success', 'Link actualizado correctamente');
    res.redirect('/controles-anuncios');
});




module.exports = router;