const inputTipPrestamo = document.getElementById("inputTipPrestamo")
const labelDatosLaborales = document.getElementById("labelDatosLaborales")

const labelDireccionNegocio = document.getElementById("labelDireccionNegocio")
const labelTiempoNegocio = document.getElementById("labelTiempoNegocio")

const label_4 = document.getElementById("label_4")
const label_5 = document.getElementById("label_5")

inputTipPrestamo.addEventListener("change", () => {

    // console.log("hiciste un cambio en el paramentro de entrada");

    if (inputTipPrestamo.value == "Personal") {
        // console.log("seleccionaste tipo de prestamo Personal")
        labelDatosLaborales.style.display = "block"
        labelDireccionNegocio.style.display = "none"
        labelTiempoNegocio.style.display = "none"


        label_4.innerHTML = "PASO 4 - REFERENCIAS PERSONALES"
        label_5.innerHTML = "PASO 5 - DATOS DEL PRESTAMO"
    }
    if (inputTipPrestamo.value == "Comercial") {
        // console.log("seleccionaste tipo de prestamo comercial")
        labelDatosLaborales.style.display = "none"
        labelDireccionNegocio.style.display = "block"
        labelTiempoNegocio.style.display = "block"

        label_4.innerHTML = "PASO 3 - REFERENCIAS PERSONALES"
        label_5.innerHTML = "PASO 4 - DATOS DEL PRESTAMO"

    }

})


//function para la calculadora de prestamos 

const btnCalculo = document.getElementById("btn");
const btnLimpiar = document.getElementById("btnLimpiar");
const frecuenciaPago = document.getElementById("frecuenciaPago");


var rangeslider = document.getElementById("sliderRange");
var output = document.getElementById("demo");
output.innerHTML = rangeslider.value;

rangeslider.oninput = function() {
    output.innerHTML = this.value;
}


const labelSemanas = document.getElementById("labelSemanas")
const labelDias = document.getElementById("labelDias")
const labelQuincenas = document.getElementById("labelQuincenas")
const labelMeses = document.getElementById("labelMeses")

labelSemanas.style.display = "none"
labelDias.style.display = "none"
labelQuincenas.style.display = "none"
labelMeses.style.display = "none"

frecuenciaPago.addEventListener("change", () => {
    console.log("cambiaste el tipo de frecuenencia")

    if (frecuenciaPago.value == "pagos diarios") {

        labelSemanas.style.display = "none"
        labelDias.style.display = "block"
        labelQuincenas.style.display = "none"
        labelMeses.style.display = "none"
        labelResul.textContent = "";
        labelRespuesta.textContent = "";

    }

    if (frecuenciaPago.value == "pagos semanales") {

        labelSemanas.style.display = "block"
        labelDias.style.display = "none"
        labelQuincenas.style.display = "none"
        labelMeses.style.display = "none"
        labelResul.textContent = "";
        labelRespuesta.textContent = "";

    }
    if (frecuenciaPago.value == "pagos quincenales") {
        console.log("entraste a pagos quincenales")
        labelSemanas.style.display = "none"
        labelDias.style.display = "none"
        labelQuincenas.style.display = "block"
        labelMeses.style.display = "none"
        labelResul.textContent = "";
        labelRespuesta.textContent = "";

    }
    if (frecuenciaPago.value == "pagos mensuales") {

        labelSemanas.style.display = "none"
        labelDias.style.display = "none"
        labelQuincenas.style.display = "none"
        labelMeses.style.display = "block"
        labelResul.textContent = "";
        labelRespuesta.textContent = "";

    }

});


//     labelResul.textContent = "";
//     labelRespuesta.textContent = "";

btnCalculo.addEventListener("click", () => {
    event.preventDefault();

    let monto = parseInt(document.getElementById("sliderRange").value);
    let cuotaDias = parseInt(document.getElementById("cuotaDias").value);
    let cuotaSemanas = parseInt(document.getElementById("cuotaSemanas").value);
    let cuotaQuincenas = parseInt(document.getElementById("cuotaQuincenas").value);
    let cuotaMeses = parseInt(document.getElementById("cuotaMeses").value);
    // const interes = parseInt(document.getElementById("interes").value);

    let labelResul = document.getElementById("labelResul");
    let labelRespuesta = document.getElementById("labelRespuesta");

    

    if (frecuenciaPago.value == "pagos diarios") {
        const interes = 0.01
        const operacionInteres = monto * interes;
        const operacionCuota = operacionInteres * cuotaDias;
        // console.log(cuotaDias)

        const operacion = (operacionCuota + monto) / cuotaDias;
        labelResul.textContent = "Su cuota seria";
        labelRespuesta.textContent = `$${operacion.toFixed()} Pesos`;
        console.log(operacionInteres)
        console.log(operacionCuota)

        if(labelRespuesta.textContent == "$NaN Pesos"){
            alert("Indica la cantidad de dias")
            labelRespuesta.textContent = `$0 Pesos`;
        }

    }
    
    if (frecuenciaPago.value == "pagos semanales") {
        const interes = 0.035
        const operacionInteres = monto * interes;
        const operacionCuota = operacionInteres * cuotaSemanas;

        const operacion = (operacionCuota + monto) / cuotaSemanas;
        labelResul.textContent = "Su cuota seria";
        labelRespuesta.textContent = `$${operacion.toFixed()} Pesos`;
        console.log(operacionInteres)
        console.log(operacionCuota)

        if(labelRespuesta.textContent == "$NaN Pesos"){
            alert("Indica la cantidad de semanas")
            labelRespuesta.textContent = `$0 Pesos`;
        }

    }
    if (frecuenciaPago.value == "pagos quincenales") {
        const interes = 0.0625
        const operacionInteres = monto * interes;
        const operacionCuota = operacionInteres * cuotaQuincenas;

        const operacion = (operacionCuota + monto) / cuotaQuincenas;
        labelResul.textContent = "Su cuota seria";
        labelRespuesta.textContent = `$${operacion.toFixed()} Pesos`;
        console.log(operacionInteres)
        console.log(operacionCuota)

        if(labelRespuesta.textContent == "$NaN Pesos"){
            alert("Indica la cantidad de quincenas")
            labelRespuesta.textContent = `$0 Pesos`;
        }

    }
    if (frecuenciaPago.value == "pagos mensuales") {
        const interes = 0.08
        const operacionInteres = monto * interes;
        const operacionCuota = operacionInteres * cuotaMeses;

        const operacion = (operacionCuota + monto) / cuotaMeses;
        labelResul.textContent = "Su cuota seria";
        labelRespuesta.textContent = `$${operacion.toFixed()} Pesos`;
        console.log(operacionInteres)
        console.log(operacionCuota)

        if(labelRespuesta.textContent == "$NaN Pesos"){
            alert("Indica la cantidad de meses")
            labelRespuesta.textContent = `$0 Pesos`;
        }

    }
  

});




// btnLimpiar.addEventListener("click", () => {
//     event.preventDefault();

//     monto.value = "";
//     cuota.value = "";
//     interes.value = "";
//     labelResul.textContent = "";
//     labelRespuesta.textContent = "";


// });