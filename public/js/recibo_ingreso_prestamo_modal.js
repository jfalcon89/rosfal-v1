// document.addEventListener('DOMContentLoaded', () => {

//     // Datos de prueba en formato JSON
//     const loanData = [{
//             id: 1,
//             prestamoId: 'PR-001',
//             cedula: '123456789',
//             nombreCliente: 'Juan Pérez',
//             apodo: 'JP',
//             garantia: 'Casa',
//             apertura: '01/01/2025',
//             plazo: 12,
//             monto: 10000.00,
//             cuota: 950.00,
//             tasa: '10%',
//             mora: 50.00,
//             ult_pago: '24/09/2025',
//             estatus: 'Activo',
//             estado: 'Normal',
//             f_vence: '24/10/2025',
//             int_sob_corte: 0.00,
//             int_adelantado: 0.00,
//             saldo_final: 9000.00,
//             balance: 500.00,
//             salda_hoy: 500.00,
//             atrasos: 0.00,
//             capital_r: 8500.00,
//             cargado: 1000.00,
//             interes_carg: 100.00,
//             capital_carg: 900.00,
//             mora_carg: 0.00,
//             otros_carg: 0.00,
//             seguro_carg: 0.00,
//             pagado: 1000.00,
//             t_interes: 100.00,
//             t_capital: 900.00,
//             t_mora: 0.00,
//             t_otros: 0.00,
//             t_seguro: 0.00,
//             pagadas: 1,
//             atrasada: 0.00,
//             p_sgte_cta: 1000.00,
//             tipo_prestamo: 'Hipotecario',
//             tipo_plazo: 'Mensual',
//             tipo_divisa: 'USD',
//             pagos: [
//                 { no: 1, fecha: '24/10/2025', cuota: 950, pendiente: 0, interes: 100, interes_pag: 100, capital: 850, capital_pag: 850, seguro: 0, seg_pag: 0, estado: 'Pagado', da: 'Sí' },
//                 { no: 2, fecha: '24/11/2025', cuota: 950, pendiente: 950, interes: 90, interes_pag: 0, capital: 860, capital_pag: 0, seguro: 0, seg_pag: 0, estado: 'Pendiente', da: 'No' },
//                 { no: 3, fecha: '24/12/2025', cuota: 950, pendiente: 1900, interes: 80, interes_pag: 0, capital: 870, capital_pag: 0, seguro: 0, seg_pag: 0, estado: 'Pendiente', da: 'No' },
//                 { no: 4, fecha: '24/01/2026', cuota: 950, pendiente: 2850, interes: 70, interes_pag: 0, capital: 880, capital_pag: 0, seguro: 0, seg_pag: 0, estado: 'Pendiente', da: 'No' }
//             ]
//         },
//         {
//             id: 2,
//             prestamoId: 'PR-002',
//             cedula: '987654321',
//             nombreCliente: 'María García',
//             apodo: 'MG',
//             garantia: 'Automóvil',
//             apertura: '02/02/2025',
//             plazo: 24,
//             monto: 20000.00,
//             cuota: 980.00,
//             tasa: '12%',
//             mora: 0.00,
//             ult_pago: '24/09/2025',
//             estatus: 'Activo',
//             estado: 'Normal',
//             f_vence: '24/11/2025',
//             int_sob_corte: 0.00,
//             int_adelantado: 0.00,
//             saldo_final: 19000.00,
//             balance: 0.00,
//             salda_hoy: 980.00,
//             atrasos: 0.00,
//             capital_r: 18500.00,
//             cargado: 980.00,
//             interes_carg: 180.00,
//             capital_carg: 800.00,
//             mora_carg: 0.00,
//             otros_carg: 0.00,
//             seguro_carg: 0.00,
//             pagado: 980.00,
//             t_interes: 180.00,
//             t_capital: 800.00,
//             t_mora: 0.00,
//             t_otros: 0.00,
//             t_seguro: 0.00,
//             pagadas: 1,
//             atrasada: 0.00,
//             p_sgte_cta: 980.00,
//             tipo_prestamo: 'Prenda',
//             tipo_plazo: 'Mensual',
//             tipo_divisa: 'USD',
//             pagos: [
//                 { no: 1, fecha: '24/11/2025', cuota: 980, pendiente: 0, interes: 180, interes_pag: 180, capital: 800, capital_pag: 800, seguro: 0, seg_pag: 0, estado: 'Pagado', da: 'Sí' },
//                 { no: 2, fecha: '24/12/2025', cuota: 980, pendiente: 980, interes: 170, interes_pag: 0, capital: 810, capital_pag: 0, seguro: 0, seg_pag: 0, estado: 'Pendiente', da: 'No' },
//             ]
//         },
//         {
//             id: 3,
//             prestamoId: 'PR-003',
//             cedula: '456789123',
//             nombreCliente: 'Carlos López',
//             apodo: 'CL',
//             garantia: 'Terreno',
//             apertura: '03/03/2025',
//             plazo: 6,
//             monto: 5000.00,
//             cuota: 850.00,
//             tasa: '8%',
//             mora: 120.00,
//             ult_pago: '15/09/2025',
//             estatus: 'Atrasado',
//             estado: 'Vencido',
//             f_vence: '24/09/2025',
//             int_sob_corte: 50.00,
//             int_adelantado: 0.00,
//             saldo_final: 4500.00,
//             balance: 100.00,
//             salda_hoy: 850.00,
//             atrasos: 1,
//             capital_r: 4000.00,
//             cargado: 850.00,
//             interes_carg: 50.00,
//             capital_carg: 800.00,
//             mora_carg: 120.00,
//             otros_carg: 0.00,
//             seguro_carg: 0.00,
//             pagado: 850.00,
//             t_interes: 50.00,
//             t_capital: 800.00,
//             t_mora: 120.00,
//             t_otros: 0.00,
//             t_seguro: 0.00,
//             pagadas: 1,
//             atrasada: 1,
//             p_sgte_cta: 850.00,
//             tipo_prestamo: 'Personal',
//             tipo_plazo: 'Mensual',
//             tipo_divisa: 'DOP',
//             pagos: [
//                 { no: 1, fecha: '24/09/2025', cuota: 850, pendiente: 0, interes: 50, interes_pag: 50, capital: 800, capital_pag: 800, seguro: 0, seg_pag: 0, estado: 'Pagado', da: 'Sí' },
//                 { no: 2, fecha: '24/10/2025', cuota: 850, pendiente: 850, interes: 45, interes_pag: 0, capital: 805, capital_pag: 0, seguro: 0, seg_pag: 0, estado: 'Vencido', da: 'No' },
//             ]
//         }
//     ];

//     const loanListContainer = document.querySelector('.data-grid:not(#payment-table)');
//     const searchInput = document.getElementById('search-input');
//     const searchOptionRadios = document.querySelectorAll('input[name="search-type"]');
//     const paymentTableContainer = document.getElementById('payment-table');

//     let filteredLoanData = [...loanData]; // Mantiene una copia de los datos filtrados

//     // Función para renderizar la tabla principal
//     function renderLoanList(loans) {
//         // Limpia la tabla actual, excepto la fila de encabezado
//         const headerRow = loanListContainer.querySelector('.header-row');
//         loanListContainer.innerHTML = '';
//         loanListContainer.appendChild(headerRow);

//         loans.forEach((loan, index) => {
//             const row = document.createElement('div');
//             row.className = 'data-row';
//             row.dataset.loanId = loan.id; // Asigna un ID para identificar la fila
//             row.innerHTML = `
//                         <div class="cell">${index + 1}</div>
//                         <div class="cell">${loan.cedula}</div>
//                         <div class="cell client-name-cell">${loan.nombreCliente}</div>
//                         <div class="cell">${loan.apertura}</div>
//                         <div class="cell">${loan.plazo}</div>
//                         <div class="cell">${loan.monto.toLocaleString()}</div>
//                         <div class="cell">${loan.cuota.toLocaleString()}</div>
//                         <div class="cell">${loan.tasa}</div>
//                         <div class="cell">${loan.mora.toLocaleString()}</div>
//                     `;
//             loanListContainer.appendChild(row);
//         });
//     }

//     // Función para rellenar los campos de detalle del préstamo
//     function populateDetails(loan) {
//         if (!loan) {
//             // Limpia todos los campos si no se proporciona un préstamo
//             const inputs = document.querySelectorAll('.details-section input');
//             inputs.forEach(input => input.value = '');
//             return;
//         }

//         // Recorre las propiedades del objeto y las asigna a los campos de entrada
//         for (const key in loan) {
//             if (Object.hasOwnProperty.call(loan, key)) {
//                 const element = document.getElementById(key);
//                 if (element) {
//                     if (typeof loan[key] === 'number') {
//                         element.value = loan[key].toLocaleString();
//                     } else {
//                         element.value = loan[key];
//                     }
//                 }
//             }
//         }
//     }

//     // Función para renderizar la tabla de pagos
//     function renderPaymentTable(payments) {
//         const headerRow = paymentTableContainer.querySelector('.header-row');
//         paymentTableContainer.innerHTML = '';
//         paymentTableContainer.appendChild(headerRow);

//         if (!payments) return;

//         payments.forEach(payment => {
//             const row = document.createElement('div');
//             row.className = 'data-row';
//             row.innerHTML = `
//                         <div class="cell">${payment.no}</div>
//                         <div class="cell">${payment.fecha}</div>
//                         <div class="cell">${payment.cuota.toLocaleString()}</div>
//                         <div class="cell">${payment.pendiente.toLocaleString()}</div>
//                         <div class="cell">${payment.interes.toLocaleString()}</div>
//                         <div class="cell">${payment.interes_pag.toLocaleString()}</div>
//                         <div class="cell">${payment.capital.toLocaleString()}</div>
//                         <div class="cell">${payment.capital_pag.toLocaleString()}</div>
//                         <div class="cell">${payment.seguro.toLocaleString()}</div>
//                         <div class="cell">${payment.seg_pag.toLocaleString()}</div>
//                         <div class="cell">${payment.estado}</div>
//                         <div class="cell">${payment.da}</div>
//                     `;
//             paymentTableContainer.appendChild(row);
//         });
//     }

//     // Manejador de eventos para el clic en las filas
//     loanListContainer.addEventListener('click', (event) => {
//         const selectedRow = event.target.closest('.data-row');
//         if (selectedRow && !selectedRow.classList.contains('header-row')) {
//             // Limpia la selección de las filas anteriores
//             document.querySelectorAll('.data-row').forEach(row => row.classList.remove('selected'));
//             // Añade la clase 'selected' a la fila actual
//             selectedRow.classList.add('selected');

//             const loanId = parseInt(selectedRow.dataset.loanId);
//             const selectedLoan = loanData.find(loan => loan.id === loanId);
//             if (selectedLoan) {
//                 populateDetails(selectedLoan);
//                 renderPaymentTable(selectedLoan.pagos);
//             }
//         }
//     });

//     // Manejador de eventos para la búsqueda
//     function handleSearch() {
//         const searchTerm = searchInput.value.toLowerCase();
//         const searchType = document.querySelector('input[name="search-type"]:checked').value;

//         filteredLoanData = loanData.filter(loan => {
//             let value = '';
//             if (searchType === 'prestamoId') value = loan.prestamoId;
//             else if (searchType === 'nombreCliente') value = loan.nombreCliente;
//             else if (searchType === 'apodo') value = loan.apodo;
//             else if (searchType === 'garantia') value = loan.garantia;
//             else if (searchType === 'cedula') value = loan.cedula;

//             return value.toLowerCase().includes(searchTerm);
//         });
//         renderLoanList(filteredLoanData);
//     }

//     searchInput.addEventListener('keyup', handleSearch);
//     searchOptionRadios.forEach(radio => radio.addEventListener('change', handleSearch));

//     // Renderiza la lista inicial de préstamos al cargar la página
//     renderLoanList(loanData);
//     // Inicializa los detalles con el primer préstamo
//     populateDetails(loanData[0]);
//     renderPaymentTable(loanData[0].pagos);
// });