const express = require("express");
const app = express(); //asignacion de express en app
const ejs = require("ejs");
const bodyParser = require("body-parser");
const path = require("path");
const dotenv = require('dotenv').config()
const moment = require("moment");
const bcrypt = require('bcryptjs');

// conexcion a la base de datos MySql
const pool = require("./database");
const { database } = require('./keys');

//rutas requiere
const inicioRoutes = require("./routes/inicio");
const quienes_somosRoutes = require("./routes/quienes-somos");
const solicita_yaRoutes = require("./routes/solicita-ya");
const preguntas_frecuentesRoutes = require("./routes/preguntas-frecuentes");
const contactoRoutes = require("./routes/contacto");
const loginRoutes = require("./routes/login");
const registerRoutes = require("./routes/register");
const panel_administracionRoutes = require("./routes/panel-administracion");
const solicitudesRoutes = require("./routes/solicitudes");
const mensajesRoutes = require("./routes/mensajes");
const usuariosRoutes = require("./routes/usuarios");
const rutasRoutes = require("./routes/rutas");

//--------------CONEXION AL SERVIDOR-----------------//
app.set("port", process.env.PORT || 3003);

app.listen(app.get("port"), () => {
    console.log("servidor funcionando en el puerto", app.get("port"))
});



//CONFIGURACION PARA LEER EL BODY
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//----------CONFIGURACION RUTAS ESTATICA-------------//
app.use(express.static(path.join(__dirname, "public")));


//----------RUTAS WEB DE LOS HANDLERS----------------//

app.use("/", inicioRoutes);
app.use("/", quienes_somosRoutes);
app.use("/", solicita_yaRoutes);
app.use("/", preguntas_frecuentesRoutes);
app.use("/", contactoRoutes);
app.use("/", loginRoutes);
app.use("/", registerRoutes);
app.use("/", panel_administracionRoutes);
app.use("/", solicitudesRoutes);
app.use("/", mensajesRoutes);
app.use("/", usuariosRoutes);
app.use("/", rutasRoutes);


//motor de plantilla 
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));