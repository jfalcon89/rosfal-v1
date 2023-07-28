// Asignar el evento click al botón
document.getElementById('notificarAtrasosBtn').addEventListener('click', notificarAtrasos);

// Función que notifica los atrasos
async function notificarAtrasos() {
    try {
        console.log("diste click enviar correo")
            // alert('Enviara un correo masivo')
            // confirm("Seguro que desea enviar Notificacion de atrasos masivos")

        // Hacer una petición al servidor para notificar atrasos
        const response = await fetch('/notificacionCorreoAtrasos', { method: 'GET' });
        const message = await response.text();
        alert(message);
        // console.log(message)

    } catch (error) {
        console.error('Error al enviar las notificaciones:', error);
        // alert('Error al enviar las notificaciones.');
    }
}