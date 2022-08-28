const express = require("express");
const router = express.Router();



router.get('/preguntas-frecuentes', (req, res) => {
    res.render('preguntas-frecuentes');
})









module.exports = router;