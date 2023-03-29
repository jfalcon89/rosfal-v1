// Obtener el botón
var btn = document.getElementById('generate-pdf');
// var htmlContent = document.getElementById('html-content').innerHTML;

// Agregar un evento de clic al botón
btn.addEventListener('click', function() {
    // Definir el contenido del documento
    var docDefinition = {
        content: [{
                text: 'ROSFAL SOLUCIONES DE PRESTAMOS',
                fontSize: 20
            }, {
                text: 'Reporte de estado de cartera',
                margin: [0, 10, 0, 5]
            }, {
                // to treat a paragraph as a bulleted list, set an array of items under the ul key
                ul: [
                    'Prestado <%= montoPrestado %>',
                    'Liquidado <%= montoLiquidado %>',
                    'Atrasos <%= prestamosAtrasos %>',
                    'Cant. Prestamos <%= cantPrestamos %>',
                    'Cant. Atrasos <%= cantAtrasos %>',

                ]
            }, {
                text: 'Listado de atratos',
                margin: [0, 20, 0, 5]
            }, {

                layout: 'headerLineOnly',
                table: {
                    // headers are automatically repeated if the table spans over multiple pages
                    // you can declare how many rows should be treated as headers
                    headerRows: 1,
                    // widths: ['*', 'auto', 100, '*'],

                    body: [

                        [{
                            text: 'Solicitud',
                            bold: true
                        }, {
                            text: 'Nombre',
                            bold: true
                        }, {
                            text: 'Apellido',
                            bold: true
                        }, {
                            text: 'Cedula',
                            bold: true
                        }, {
                            text: 'Aprobado',
                            bold: true
                        }, {
                            text: 'Firma',
                            bold: true
                        }, {
                            text: 'Atraso',
                            bold: true
                        }, {
                            text: 'Telefono',
                            bold: true
                        }],

                        if (arraySolicitudesAtrasadas.length > 0) {
                            arraySolicitudesAtrasadas.forEach(solicitud => {

                                ['<%= solicitud.idSolicitud %>', '<%= solicitud.nombre %>', '<%= solicitud.apellido %>', '<%= solicitud.cedula %>', '<%= solicitud.montoSolicitado %>', '<%= solicitud.firmaContrato %>', '<%= solicitud.atraso %>', '<%= solicitud.celular %>'],

                            })
                        }

                    ]
                }
            }

        ]
    };

    // Generar el documento PDF
    pdfMake.createPdf(docDefinition).download('reporte.pdf');
});