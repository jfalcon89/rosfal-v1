const btnConfirmacion = document.getElementById('btnConfirmacion').addEventListener('click', functionBtnConfirmacion);
const token_registro_sms = document.getElementById('token_registro_sms').value;



// Función bto confirmacion
async function functionBtnConfirmacion() {
    try {

        // const id = document.getElementById('idSolicitud').textContent
        console.log("diste click enviar correo")
        console.log(token_registro_sms)
            // console.log(id.slice(14))
            // alert('Enviara un correo masivo')
            // confirm("Seguro que desea enviar Notificacion de atrasos masivos")


    } catch (error) {
        // console.error('Error al enviar las notificaciones:', error);
        // alert('Error al enviar las notificaciones.');
    }
};