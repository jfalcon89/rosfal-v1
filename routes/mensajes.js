const express = require("express");
const router = express.Router();



router.get('/mensajes', (req, res) => {
    res.render('mensajes');
})









module.exports = router;