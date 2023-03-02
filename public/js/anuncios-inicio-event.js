// console.log('estoy en el inicio');

// function miFuncion() {
//     console.log("¡Hola cada 3 segundos!");
// }

// setInterval(miFuncion, 3000);

// const anuncio = addEventListener("load", () => {

// })

const estado_anuncio_salon = document.querySelector(".estado_anuncio_salon").value
const estado_anuncio_peluqueria = document.querySelector(".estado_anuncio_peluqueria").value

console.log(estado_anuncio_salon + " salon")
console.log(estado_anuncio_peluqueria + " peluqueria")

const container_anuncio_salon = document.getElementById("container_anuncio_salon");
const modal_anuncio_salon = document.getElementById("modal_anuncio_salon");
const close_anuncio_salon = document.getElementById("close_anuncio_salon");

const container_anuncio_peluqueria = document.getElementById("container_anuncio_peluqueria");
const modal_anuncio_peluqueria = document.getElementById("modal_anuncio_peluqueria");
const close_anuncio_peluqueria = document.getElementById("close_anuncio_peluqueria");

// anuncio salon
function anuncioSalonFuncion() {
    console.log("¡anuncio en 5 segundos!");
    container_anuncio_salon.style.display = "block"
    modal_anuncio_salon.style.display = "block"
    modal_anuncio_salon.classList.add("modal-anuncio");
    modal_anuncio_salon.classList.add("animated-div");

}

close_anuncio_salon.addEventListener("click", () => {
    console.log("¡anuncio en 5 segundos CERRADO!");
    container_anuncio_salon.style.display = "none"
    modal_anuncio_salon.classList.remove("modal-anuncio");
    modal_anuncio_salon.style.display = "none"
})

if (estado_anuncio_salon == "Activo") {

    setTimeout(anuncioSalonFuncion, 3000);
}

// anuncio peluqueria
function anuncioPeluqueriaFuncion() {
    console.log("¡anuncio peluqueria en 5 segundos!");
    container_anuncio_peluqueria.style.display = "block"
    modal_anuncio_peluqueria.style.display = "block"
    modal_anuncio_peluqueria.classList.add("modal-anuncio");
    modal_anuncio_peluqueria.classList.add("animated-div");
    // container_anuncio_peluqueria.setAttribute("data-aos", "fade-down");

}

close_anuncio_peluqueria.addEventListener("click", () => {
    console.log("¡anuncio en 5 segundos CERRADO!");
    container_anuncio_peluqueria.style.display = "none"
    modal_anuncio_peluqueria.classList.remove("modal-anuncio");
    modal_anuncio_peluqueria.style.display = "none"
})

if (estado_anuncio_peluqueria == "Activo") {

    setTimeout(anuncioPeluqueriaFuncion, 3000);
}