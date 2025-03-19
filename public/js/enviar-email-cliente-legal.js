// LEGAL ENVIO DE CORREO EMAIL
// Asignar el evento click al botón
document.getElementById('notificarLegalClienteBtnCorreo').addEventListener('click', notificarLegalClienteBtnCorreo);

// Función que notifica los atrasos
async function notificarLegalClienteBtnCorreo() {
    console.log('entro a la function javascript')
    try {

        const id = document.getElementById('idSolicitud').textContent
        console.log("diste click enviar correo")
        console.log(id.slice(14))
            // alert('Enviara un correo masivo')
            // confirm("Seguro que desea enviar Notificacion de atrasos masivos")

        // Hacer una petición al servidor para notificar atrasos
        const response = await fetch(`/notificacionLegalClienteCorreo/${id.slice(14)}`, { method: 'GET' });
        const message = await response.text();
        alert('Su notificacion se han enviado correctamente');
        // console.log(message)

    } catch (error) {
        console.error('Error al enviar la notificacion:', error);
        // alert('Error al enviar la notificacion.');
    }
}