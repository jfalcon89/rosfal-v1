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