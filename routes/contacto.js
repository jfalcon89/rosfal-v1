const express = require("express");
const router = express.Router();


router.get('/contacto', (req, res) => {
    res.render('contacto');
})









module.exports = router;