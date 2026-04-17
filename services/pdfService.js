// // ContractService.js
// const API_URL = "/Solicitudes/imprimir-contrato/:id";

// const ContractService = {
//     // Función para descargar el PDF
//     downloadContract: async(clienteId) => {
//         try {
//             const response = await fetch(`${API_URL}/descargar/${clienteId}`);
//             const blob = await response.blob();
//             const url = window.URL.createObjectURL(blob);
//             const a = document.createElement('a');
//             a.href = url;
//             a.download = `Contrato_Cliente_${clienteId}.pdf`;
//             document.body.appendChild(a);
//             a.click();
//             a.remove();
//         } catch (error) {
//             console.error("Error al descargar el contrato:", error);
//             alert("No se pudo descargar el contrato.");
//         }
//     },

//     // Función para enviar por correo
//     sendContractByEmail: async(clienteId) => {
//         try {
//             const response = await fetch(`${API_URL}/enviar-correo`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ clienteId })
//             });

//             if (response.ok) {
//                 alert("¡Contrato enviado con éxito al correo del cliente!");
//             } else {
//                 throw new Error("Error en el envío");
//             }
//         } catch (error) {
//             console.error("Error al enviar el contrato:", error);
//             alert("Hubo un fallo al enviar el correo.");
//         }
//     }
// };

const pdf = require('html-pdf');

// Opción A: Exportar un objeto con la función
const pdfService = {
    crearBufferPDF: (htmlContent) => {
        return new Promise((resolve, reject) => {
            const options = {
                format: 'Letter',
                border: '10mm',
                // html-pdf a veces necesita el ejecutable de phantomjs explícito en Windows
                // phantomPath: "./node_modules/phantomjs-prebuilt/bin/phantomjs" 
            };
            pdf.create(htmlContent, options).toBuffer((err, buffer) => {
                if (err) return reject(err);
                resolve(buffer);
            });
        });
    }
};

module.exports = pdfService; // <--- ESTO ES VITAL