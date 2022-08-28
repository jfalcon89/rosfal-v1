const express = require("express");
const router = express.Router();



router.get('/panel-administracion', (req, res) => {
    res.render('panel-administracion');
})









module.exports = router;