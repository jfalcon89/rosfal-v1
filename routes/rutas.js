const express = require("express");
const router = express.Router();



router.get('/rutas', (req, res) => {
    res.render('rutas');
})









module.exports = router;