// mira los estados de cada anuncio 
const estado_prestamos_quincenales = document.querySelector(".estado_prestamos_quincenales").value
const estado_prestamos_semanales = document.querySelector(".estado_prestamos_semanales").value
const estado_anuncios_generales = document.querySelector(".estado_anuncios_generales").value

// prestamos quincenales
const container_prestamos_quincenales = document.getElementById("container_prestamos_quincenales");
const modal_prestamos_quincenales = document.getElementById("modal_prestamos_quincenales");
const close_prestamos_quincenales = document.getElementById("close_prestamos_quincenales");

// prestamos semanales
const container_prestamos_semanales = document.getElementById("container_prestamos_semanales");
const modal_prestamos_semanales = document.getElementById("modal_prestamos_semanales");
const close_prestamos_semanales = document.getElementById("close_prestamos_semanales");

// anuncios generales
const container_anuncios_generales = document.getElementById("container_anuncios_generales");
const modal_anuncios_generales = document.getElementById("modal_anuncios_generales");
const close_anuncios_generales = document.getElementById("close_anuncios_generales");

// anuncio prestamos quincenales funcion
function anuncioQuincenalesFuncion() {
    console.log("¡anuncio en 5 segundos!");
    container_prestamos_quincenales.style.display = "block"
    modal_prestamos_quincenales.style.display = "block"
    modal_prestamos_quincenales.classList.add("modal-anuncio");
    modal_prestamos_quincenales.classList.add("animated-div");

}

close_prestamos_quincenales.addEventListener("click", () => {
    console.log("¡anuncio en 5 segundos CERRADO!");
    container_prestamos_quincenales.style.display = "none"
    modal_prestamos_quincenales.classList.remove("modal-anuncio");
    modal_prestamos_quincenales.style.display = "none"
})

if (estado_prestamos_quincenales == "Activo") {

    setTimeout(anuncioQuincenalesFuncion, 3000);
}

// anuncio prestamos semanales funcion
function anuncioSemanalesFuncion() {
    console.log("¡anuncio semanales en 5 segundos!");
    container_prestamos_semanales.style.display = "block"
    modal_prestamos_semanales.style.display = "block"
    modal_prestamos_semanales.classList.add("modal-anuncio");
    modal_prestamos_semanales.classList.add("animated-div");
}

close_prestamos_semanales.addEventListener("click", () => {
    console.log("¡anuncio en 5 segundos CERRADO!");
    container_prestamos_semanales.style.display = "none"
    modal_prestamos_semanales.classList.remove("modal-anuncio");
    modal_prestamos_semanales.style.display = "none"
})

if (estado_prestamos_semanales == "Activo") {

    setTimeout(anuncioSemanalesFuncion, 3000);
}

// anuncio generales funcion
function anuncioGeneralesFuncion() {
    console.log("¡anuncio generales en 5 segundos!");
    container_anuncios_generales.style.display = "block"
    modal_anuncios_generales.style.display = "block"
    modal_anuncios_generales.classList.add("modal-anuncio");
    modal_anuncios_generales.classList.add("animated-div");
}

close_anuncios_generales.addEventListener("click", () => {
    console.log("¡anuncio en 5 segundos CERRADO!");
    container_anuncios_generales.style.display = "none"
    modal_anuncios_generales.classList.remove("modal-anuncio");
    modal_anuncios_generales.style.display = "none"
})

if (estado_anuncios_generales == "Activo") {

    setTimeout(anuncioGeneralesFuncion, 3000);
}