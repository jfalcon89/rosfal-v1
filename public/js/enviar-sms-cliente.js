// Asignar el evento click al botón
document.getElementById('notificarAtrasosClienteBtn').addEventListener('click', notificarAtrasosClienteBtn);

// Función que notifica los atrasos
async function notificarAtrasosClienteBtn() {
    try {

        const id = document.getElementById('idSolicitud').textContent
        console.log("diste click enviar correo")
        console.log(id.slice(14))
            // alert('Enviara un correo masivo')
            // confirm("Seguro que desea enviar Notificacion de atrasos masivos")

        // Hacer una petición al servidor para notificar atrasos
        const response = await fetch(`/notificacionSmsAtrasos/${id.slice(14)}`, { method: 'GET' });
        const message = await response.text();
        alert('Sus notificaciones se han enviado correctamente');
        // console.log(message)

    } catch (error) {
        console.error('Error al enviar las notificaciones:', error);
        // alert('Error al enviar las notificaciones.');
    }
}