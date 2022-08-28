const express = require("express");
const router = express.Router();



router.get('/quienes-somos', (req, res) => {
    res.render('quienes-somos');
})









module.exports = router;