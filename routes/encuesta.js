const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const pool = require("../database");
const bcrypt = require('bcryptjs');
const ipapi = require('ipapi.co');
const nodemailer = require("nodemailer");
const useragent = require('express-useragent');
const { obtenerConteos } = require("../services/conteosService");




router.get('/encuesta', async(req, res) => {
    if (req.session.loggedin) {

        const permiso_D = 'Encuestador'

        const arrayRutasDB = await pool.query('SELECT * FROM rutas ');
        const rows = await pool.query("SELECT parametro_clave, parametro_valor FROM configuracion_parametros WHERE vista_nombre = 'encuestas' AND descripcion = 'Activo'");


        // Resultado esperado: { pregunta_1: 'Valor1', pregunta_2: 'Valor2' }
        const config = rows.reduce((acc, row) => {
            acc[row.parametro_clave] = row.parametro_valor;
            return acc;
        }, {});

        console.log(config)

        res.render("encuesta", {
            login: true,
            name: req.session.name,
            rol: req.session.rol,
            permiso_D,
            arrayRutas: arrayRutasDB,
            config
        });
    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
            device: req.useragent.isMobile ? 'Mobile' : 'Desktop'
        });
    }

});
router.get('/mapa-rutas', async(req, res) => {
    if (req.session.loggedin) {


        const conteos = await obtenerConteos();

        const permiso_A = 'Administrador'
        const permiso_B = 'Representante'
        const permiso_D = 'Encuestador'

        const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

        console.log(arrayRutasDB)

        res.render("mapa-rutas", {
            login: true,
            name: req.session.name,
            rol: req.session.rol,
            permiso_D,
            permiso_A,
            permiso_B,
            conteos,
            arrayRutas: arrayRutasDB,
            rutaParaMostrar: [{ lat: 18.482183, lng: -69.974393 }, { lat: 18.479362516705706, lng: -69.96499775400336 }]
        });
    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
            device: req.useragent.isMobile ? 'Mobile' : 'Desktop'
        });
    }

});


//CREANDO NUEVA ENCUESTA ****************
router.post("/encuesta", async(req, res) => {
    const { ruta, fecha, encuestador, negocio_nombre, encargado_nombre, tipo_negocio, tipo_negocio_otro, ubicacion_calle, anos_operacion, flujo_clientes_score, frecuencia_capital, prioridad_inversion, modalidad_pago_preferida, satisfaccion_prestamos_actuales } = req.body;

    const permiso_A = 'Administrador'
    const permiso_B = 'Representante'
    const permiso_D = 'Encuestador'
    const permiso_C = 'Cliente App'

    const rows = await pool.query("SELECT parametro_clave, parametro_valor FROM configuracion_parametros WHERE vista_nombre = 'encuestas' AND descripcion = 'Activo'");


    // Resultado esperado: { pregunta_1: 'Valor1', pregunta_2: 'Valor2' }
    const config = rows.reduce((acc, row) => {
        acc[row.parametro_clave] = row.parametro_valor;
        return acc;
    }, {});

    const nuevaEncuenta = {
        ruta,
        fecha,
        encuestador,
        negocio_nombre,
        encargado_nombre,
        tipo_negocio,
        tipo_negocio_otro,
        ubicacion_calle,
        anos_operacion,
        flujo_clientes_score,
        frecuencia_capital,
        prioridad_inversion,
        modalidad_pago_preferida,
        satisfaccion_prestamos_actuales

    };

    const arrayRutasDB = await pool.query('SELECT * FROM rutas ');

    await pool.query('INSERT INTO encuestas set ?', [nuevaEncuenta]);
    // req.flash('success', 'Link guardado correctamente');
    // res.redirect('/');

    res.render('encuesta', {
        login: true,
        name: req.session.name,
        rol: req.session.rol,
        permiso_D,
        permiso_A,
        permiso_B,
        permiso_C,
        arrayRutas: arrayRutasDB,
        alert: true,
        alertTitle: "Excelente !!",
        alertMessage: "¡ENCUENTA CREADA CORRECTAMENTE!",
        alertIcon: 'success',
        showConfirmButton: false,
        timer: 2000,
        ruta: 'encuesta',
        config
    });

});

router.get('/encuestas-administracion', async(req, res) => {
    if (req.session.loggedin) {

        const conteos = await obtenerConteos();

        const permiso_A = 'Administrador'
        const permiso_B = 'Representante'
        const permiso_D = 'Encuestador'

        const rows = await pool.query("SELECT parametro_clave, parametro_valor FROM configuracion_parametros WHERE vista_nombre in ('Roles', 'Permisos-Encuestas') AND descripcion = 'Activo'");

        // console.log(rows)

        const config = rows.reduce((acc, row) => {
            const clave = row.parametro_clave;
            const valor = row.parametro_valor;

            if (acc[clave]) {
                // Si ya existe la clave, verificamos si ya es un arreglo
                if (Array.isArray(acc[clave])) {
                    acc[clave].push(valor); // Solo agregamos el valor al arreglo existente
                } else {
                    // Si era un string único, lo convertimos en un arreglo con el valor viejo y el nuevo
                    acc[clave] = [acc[clave], valor];
                }
            } else {
                // Si es la primera vez, lo guardamos como un valor simple (String)
                acc[clave] = valor;
            }
            return acc;
        }, {});

        console.log(config)

        const arrayEncuestasDB = await pool.query('SELECT * FROM encuestas ');
        const arrayClientesPotencialesDB = await pool.query(`
                        SELECT 
                        negocio_nombre,
                        encargado_nombre,
                        tipo_negocio, -- Columna solicitada agregada
                        ruta,
                        ubicacion_calle,
                        flujo_clientes_score,
                        prioridad_inversion,
                        tipo_negocio_otro,
                        creado_el,
                        
                        -- Cálculo del Score de Potencial
                        ( (flujo_clientes_score * 5) + 
                        (CASE WHEN anos_operacion = '>2' THEN 30 ELSE 15 END) +
                        (CASE WHEN prioridad_inversion = 'Inventario' THEN 20 ELSE 10 END)
                        ) AS score_potencial 

                    FROM encuestas 

                    -- Doble validación: Flujo real y Score mínimo de confianza
                    WHERE flujo_clientes_score > 5
                    AND (
                        (flujo_clientes_score * 5) + 
                        (CASE WHEN anos_operacion = '>2' THEN 30 ELSE 15 END) +
                        (CASE WHEN prioridad_inversion = 'Inventario' THEN 20 ELSE 10 END)
                    ) > 70

                    ORDER BY score_potencial DESC;
                    `);

        console.log(arrayClientesPotencialesDB)
        res.render("encuestas-administracion", {
            login: true,
            name: req.session.name,
            rol: req.session.rol,
            permiso_D,
            permiso_A,
            permiso_B,
            conteos,
            arrayClientesPotenciales: arrayClientesPotencialesDB,
            arrayEncuestas: arrayEncuestasDB,
            config
        });
    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
            device: req.useragent.isMobile ? 'Mobile' : 'Desktop'
        });
    }

});

router.get('/encuestas-general', async(req, res) => {
    if (req.session.loggedin) {

        const conteos = await obtenerConteos();

        const permiso_A = 'Administrador'
        const permiso_B = 'Representante'
        const permiso_D = 'Encuestador'

        const rows = await pool.query("SELECT parametro_clave, parametro_valor FROM configuracion_parametros WHERE vista_nombre in ('Roles', 'Permisos-Encuestas') AND descripcion = 'Activo'");

        // console.log(rows)

        const config = rows.reduce((acc, row) => {
            const clave = row.parametro_clave;
            const valor = row.parametro_valor;

            if (acc[clave]) {
                // Si ya existe la clave, verificamos si ya es un arreglo
                if (Array.isArray(acc[clave])) {
                    acc[clave].push(valor); // Solo agregamos el valor al arreglo existente
                } else {
                    // Si era un string único, lo convertimos en un arreglo con el valor viejo y el nuevo
                    acc[clave] = [acc[clave], valor];
                }
            } else {
                // Si es la primera vez, lo guardamos como un valor simple (String)
                acc[clave] = valor;
            }
            return acc;
        }, {});

        console.log(config)


        const arrayEncuestasDB = await pool.query(`
                                                SELECT 
                            id_encuesta,
                            negocio_nombre,
                            encargado_nombre,
                            tipo_negocio,
                            tipo_negocio_otro,
                            ruta,
                            ubicacion_calle,
                            anos_operacion,
                            encuestador,
                            flujo_clientes_score,
                            frecuencia_capital,
                            prioridad_inversion,
                            modalidad_pago_preferida,
                            satisfaccion_prestamos_actuales,
                            creado_el,
                        
                            
                            -- 1. Cálculo del Score de Potencial (Lo que usas para el ranking)
                            ( (flujo_clientes_score * 5) + 
                            (CASE WHEN anos_operacion = '>2' THEN 30 ELSE 15 END) +
                            (CASE WHEN prioridad_inversion = 'Inventario' THEN 20 ELSE 10 END)
                            ) AS score_potencial,

                            -- 2. Columna de Calificación (Muestra 'SI' o 'NO' basado en tus validaciones)
                            CASE 
                                WHEN flujo_clientes_score > 5 AND (
                                    (flujo_clientes_score * 5) + 
                                    (CASE WHEN anos_operacion = '>2' THEN 30 ELSE 15 END) +
                                    (CASE WHEN prioridad_inversion = 'Inventario' THEN 20 ELSE 10 END)
                                ) > 70 THEN 'SI'
                                ELSE 'NO'
                            END AS es_potencial

                        FROM encuestas 

                        -- Eliminamos el WHERE para que traiga TODOS los registros
                        ORDER BY score_potencial DESC;
                    `);


        res.render("encuestas-general", {
            login: true,
            name: req.session.name,
            rol: req.session.rol,
            permiso_D,
            permiso_A,
            permiso_B,
            conteos,
            arrayEncuestas: arrayEncuestasDB,
            config
        });
    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
            device: req.useragent.isMobile ? 'Mobile' : 'Desktop'
        });
    }

});


//ELIMINAR ENCUESTA
router.get("/encuestas-general/eliminar-encuesta/:id", async(req, res) => {
    if (req.session.loggedin) {
        const { id } = req.params;
        try {
            // 1. Borramos de verdad
            await pool.query("DELETE FROM encuestas WHERE id_encuesta = ?", [id]);

            // 2. Redireccionamos a la lista general 
            // Esto limpia la URL y evita que al refrescar se intente borrar de nuevo
            res.redirect("/encuestas-general");
        } catch (error) {
            console.log(error);
            res.redirect("/encuestas-general");
        }
    } else {
        res.render('login', { login: false, name: 'Debe iniciar sesión' });
    }
});





//RENDERIZANDO Y MOSTRANDO TODAS LAS RUTAS CREADAS VISTA CREAR RUTA
router.get('/clientes-promociones-adm', async(req, res) => {
    if (req.session.loggedin) {
        let i = 0;

        // Aquí usas el servicio centralizado
        const conteos = await obtenerConteos();
        const permiso_A = 'Administrador'
        const permiso_B = 'Representante'
        const permiso_C = 'Cliente App'
        const arrayUsuariosVDB = await pool.query('SELECT * FROM users ');
        const arrayClientesVDB = await pool.query(`SELECT c.*, COALESCE(s.nombre, '') AS nombre_solicitud, COALESCE(s.apellido, '') AS apellido_solicitud FROM app_clientes c LEFT JOIN (SELECT celular, nombre, apellido FROM solicitudes GROUP BY celular) s ON c.telefono = s.celular;`);
        const promocionesClienteDB = await pool.query(`SELECT 
                                                            p.*, 
                                                            u.user AS usuario, 
                                                            CASE 
                                                                WHEN u.name = 'Usuario Externo' AND u.rol = 'Cliente App' THEN 'Credito' 
                                                                ELSE 'Debito' 
                                                            END AS tipo_bono
                                                        FROM 
                                                            promociones_clientes p
                                                        LEFT JOIN 
                                                            users u ON p.cliente_id = u.idUsuario;`);
        const pagosPromocionesDB = await pool.query(`SELECT 
                                                        SUM(CASE WHEN u.name = 'Usuario Externo' AND u.rol = 'Cliente App' AND p.estado_promocion = 'Aprobado' THEN p.valor_credito ELSE 0 END) AS creditos_aprobado,
                                                        SUM(CASE WHEN u.name = 'Usuario Externo' AND u.rol = 'Cliente App' AND p.estado_promocion = 'En revision' THEN p.valor_credito ELSE 0 END) AS creditos_en_revision,
                                                        SUM(CASE WHEN u.name = 'Usuario Externo' AND u.rol = 'Cliente App' AND p.estado_promocion = 'Liquidado' THEN p.valor_credito ELSE 0 END) AS creditos_liquidado,
                                                        SUM(CASE WHEN u.name = 'Usuario Externo' AND u.rol = 'Cliente App' AND p.estado_promocion = 'Declinado' THEN p.valor_credito ELSE 0 END) AS creditos_declinado,
                                                        SUM(CASE WHEN (u.name != 'Usuario Externo' OR u.rol != 'Cliente App') AND p.estado_promocion = 'Aprobado' THEN p.valor_credito ELSE 0 END) AS debitos_aprobado,
                                                        SUM(CASE WHEN (u.name != 'Usuario Externo' OR u.rol != 'Cliente App') AND p.estado_promocion = 'En revision' THEN p.valor_credito ELSE 0 END) AS debitos_en_revision,
                                                        SUM(CASE WHEN (u.name != 'Usuario Externo' OR u.rol != 'Cliente App') AND p.estado_promocion = 'Liquidado' THEN p.valor_credito ELSE 0 END) AS debitos_liquidado
                                                    FROM 
                                                        promociones_clientes p
                                                    LEFT JOIN 
                                                        users u ON p.cliente_id = u.idUsuario;`);

        res.render("clientes-promociones-adm", {
            i,
            arrayClientesV: arrayClientesVDB,
            arrayUsuariosV: arrayUsuariosVDB,
            login: true,
            name: req.session.name,
            rol: req.session.rol,
            permiso_A,
            permiso_B,
            permiso_C,
            conteos,
            promocionesCliente: promocionesClienteDB,
            pagosPromociones: pagosPromocionesDB

        });
    } else {
        res.render('login', {
            login: false,
            name: 'Debe iniciar sesión',
            device: req.useragent.isMobile ? 'Mobile' : 'Desktop'
        });
    }
})


//CREANDO NUEVO CLIENTE ****************
router.post("/promociones", async(req, res) => {
    const { codigo_promocion, valor_credito, inicio_vigencia, fin_vigencia, estado_promocion, origen_bono } = req.body;
    let i = 0;
    // Aquí usas el servicio centralizado
    const conteos = await obtenerConteos();
    const permiso_A = 'Administrador'
    const permiso_B = 'Representante'
    const permiso_C = 'Cliente App'
    const arrayUsuariosVDB = await pool.query('SELECT * FROM users ');
    const arrayClientesVDB = await pool.query(`SELECT c.*, COALESCE(s.nombre, '') AS nombre_solicitud, COALESCE(s.apellido, '') AS apellido_solicitud FROM app_clientes c LEFT JOIN (SELECT celular, nombre, apellido FROM solicitudes GROUP BY celular) s ON c.telefono = s.celular;`);
    const clienteDB = await pool.query('SELECT * FROM app_clientes ');
    const promocionesDB = await pool.query(`SELECT * FROM promociones `);


    // Verificar si el código de promoción existe
    const promocionesValidacionDB = await pool.query(`SELECT * FROM promociones WHERE codigo_promocion = "${codigo_promocion}" `);

    if (promocionesValidacionDB.length > 0) {
        // Parámetros para la alerta de código inválido
        return res.render('promociones', {
            i,
            arrayClientesV: arrayClientesVDB,
            arrayUsuariosV: arrayUsuariosVDB,
            cliente: clienteDB[0],
            login: true,
            name: req.session.name,
            rol: req.session.rol,
            permiso_A,
            permiso_B,
            permiso_C,
            conteos,
            promociones: promocionesDB,
            alert: true,
            alertTitle: "Código inválido",
            alertMessage: "El código de promoción ingresado esta cargado.",
            alertIcon: "error",
            showConfirmButton: true,
            timer: 4000, // 4 segundos
            ruta: `/promociones`
        });
    }


    const nuevaPromocion = {
        codigo_promocion,
        valor_credito,
        estado_promocion,
        origen_bono
    };

    await pool.query("INSERT INTO promociones SET ?", nuevaPromocion);

    if (promocionesValidacionDB.length === 0) {
        // Parámetros para la alerta de código inválido
        return res.render('promociones', {
            i,
            arrayClientesV: arrayClientesVDB,
            arrayUsuariosV: arrayUsuariosVDB,
            cliente: clienteDB[0],
            login: true,
            name: req.session.name,
            rol: req.session.rol,
            permiso_A,
            permiso_B,
            permiso_C,
            conteos,
            promociones: promocionesDB,
            alert: true,
            alertTitle: "Promoción Agregada",
            alertMessage: "Código de promoción agregado satisfactoriamente.",
            alertIcon: "success",
            showConfirmButton: true,
            timer: 4000, // 4 segundos
            ruta: `/promociones`
        });
    }

    // res.redirect('/promociones');

});

//ACTUALIZA PROMOCION ****************
router.post("/promociones/editar-promocion/:id", async(req, res) => {
    const { codigo_promocion, valor_credito, inicio_vigencia, fin_vigencia, estado_promocion, origen_bono } = req.body;
    const id = req.params.id;
    let i = 0;

    // Aquí usas el servicio centralizado
    const conteos = await obtenerConteos();
    const permiso_A = 'Administrador'
    const permiso_B = 'Representante'
    const permiso_C = 'Cliente App'
    const arrayUsuariosVDB = await pool.query('SELECT * FROM users ');
    const arrayClientesVDB = await pool.query(`SELECT c.*, COALESCE(s.nombre, '') AS nombre_solicitud, COALESCE(s.apellido, '') AS apellido_solicitud FROM app_clientes c LEFT JOIN (SELECT celular, nombre, apellido FROM solicitudes GROUP BY celular) s ON c.telefono = s.celular;`);
    const clienteDB = await pool.query('SELECT * FROM app_clientes ');
    const promocionesDB = await pool.query(`SELECT * FROM promociones `);


    const actualizacionPromocion = {
        codigo_promocion,
        valor_credito,
        estado_promocion,
        origen_bono
    };

    await pool.query("UPDATE promociones SET ? WHERE id_promocion = ?", [actualizacionPromocion, id]);

    // Parámetros para la alerta de código inválido
    return res.render('promociones', {
        i,
        arrayClientesV: arrayClientesVDB,
        arrayUsuariosV: arrayUsuariosVDB,
        cliente: clienteDB[0],
        login: true,
        name: req.session.name,
        rol: req.session.rol,
        permiso_A,
        permiso_B,
        permiso_C,
        conteos,
        promociones: promocionesDB,
        alert: true,
        alertTitle: "Promoción Actualizada",
        alertMessage: "Código de promoción actualizado satisfactoriamente.",
        alertIcon: "success",
        showConfirmButton: true,
        timer: 3000, // 3 segundos
        ruta: "/promociones"
    });


    // res.redirect('/promociones');

});

//ACTUALIZA PROMOCION CLIENTE ****************
router.post("/clientes-promociones-adm/editar-promocion-cliente/:id", async(req, res) => {
    const { codigo_promocion, valor_credito, inicio_vigencia, fin_vigencia, estado_promocion, origen_bono } = req.body;
    const id = req.params.id;
    let i = 0;
    // Aquí usas el servicio centralizado
    const conteos = await obtenerConteos();
    const permiso_A = 'Administrador'
    const permiso_B = 'Representante'
    const permiso_C = 'Cliente App'
    const arrayUsuariosVDB = await pool.query('SELECT * FROM users ');
    const arrayClientesVDB = await pool.query(`SELECT c.*, COALESCE(s.nombre, '') AS nombre_solicitud, COALESCE(s.apellido, '') AS apellido_solicitud FROM app_clientes c LEFT JOIN (SELECT celular, nombre, apellido FROM solicitudes GROUP BY celular) s ON c.telefono = s.celular;`);
    const clienteDB = await pool.query('SELECT * FROM app_clientes ');
    const promocionesDB = await pool.query(`SELECT * FROM promociones `);
    const promocionesClienteDB = await pool.query(`SELECT 
        p.*, 
        CASE 
            WHEN u.name = 'Usuario Externo' AND u.rol = 'Cliente App' THEN 'Credito' 
            ELSE 'Debito' 
        END AS tipo_bono
    FROM 
        promociones_clientes p
    LEFT JOIN 
        users u ON p.cliente_id = u.idUsuario;`);
    const pagosPromocionesDB = await pool.query(`SELECT 
        SUM(CASE WHEN u.name = 'Usuario Externo' AND u.rol = 'Cliente App' AND p.estado_promocion = 'Aprobado' THEN p.valor_credito ELSE 0 END) AS creditos_aprobado,
        SUM(CASE WHEN u.name = 'Usuario Externo' AND u.rol = 'Cliente App' AND p.estado_promocion = 'En revision' THEN p.valor_credito ELSE 0 END) AS creditos_en_revision,
        SUM(CASE WHEN u.name = 'Usuario Externo' AND u.rol = 'Cliente App' AND p.estado_promocion = 'Liquidado' THEN p.valor_credito ELSE 0 END) AS creditos_liquidado,
        SUM(CASE WHEN (u.name != 'Usuario Externo' OR u.rol != 'Cliente App') AND p.estado_promocion = 'Aprobado' THEN p.valor_credito ELSE 0 END) AS debitos_aprobado,
        SUM(CASE WHEN (u.name != 'Usuario Externo' OR u.rol != 'Cliente App') AND p.estado_promocion = 'En revision' THEN p.valor_credito ELSE 0 END) AS debitos_en_revision,
        SUM(CASE WHEN (u.name != 'Usuario Externo' OR u.rol != 'Cliente App') AND p.estado_promocion = 'Liquidado' THEN p.valor_credito ELSE 0 END) AS debitos_liquidado
    FROM 
        promociones_clientes p
    LEFT JOIN 
        users u ON p.cliente_id = u.idUsuario;`);


    const actualizacionPromocion = {
        codigo_promocion,
        valor_credito,
        estado_promocion,
        origen_bono
    };

    await pool.query("UPDATE promociones_clientes SET ? WHERE id_promocion = ?", [actualizacionPromocion, id]);

    // Parámetros para la alerta de código inválido
    return res.render('clientes-promociones-adm', {
        i,
        promocionesCliente: promocionesClienteDB,
        pagosPromociones: pagosPromocionesDB,
        arrayClientesV: arrayClientesVDB,
        arrayUsuariosV: arrayUsuariosVDB,
        cliente: clienteDB[0],
        login: true,
        name: req.session.name,
        rol: req.session.rol,
        permiso_A,
        permiso_B,
        permiso_C,
        conteos,
        promociones: promocionesDB,
        alert: true,
        alertTitle: "Promoción Actualizada",
        alertMessage: "Código de promoción actualizado satisfactoriamente.",
        alertIcon: "success",
        showConfirmButton: true,
        timer: 3000, // 3 segundos
        ruta: `/clientes-promociones-adm`
    });


    // res.redirect('/promociones');

});

//ELIMINAR PROMOCION SISTEMA 
router.get("/promociones/eliminar-promocion/:id", async(req, res) => {
    const { id } = req.params;

    console.log(id)

    try {

        await pool.query("DELETE FROM promociones WHERE id_promocion = ?", [id]);

        res.redirect("/promociones");

    } catch (error) {
        console.log(error)
    }
});
//ELIMINAR PROMOCION CLIENTES 
router.get("/clientes-promociones/eliminar-promocion-cliente/:id", async(req, res) => {
    const { id } = req.params;

    console.log(id)

    try {

        await pool.query("DELETE FROM promociones_clientes WHERE id_promocion = ?", [id]);

        res.redirect("/clientes-promociones-adm");

    } catch (error) {
        console.log(error)
    }
});




module.exports = router;