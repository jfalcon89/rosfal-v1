const ctx = document.getElementById('myChart');
const enero = document.getElementById('enero').textContent
const febrero = document.getElementById('febrero').textContent
const marzo = document.getElementById('marzo').textContent
const abril = document.getElementById('abril').textContent
const mayo = document.getElementById('mayo').textContent
const junio = document.getElementById('junio').textContent
const julio = document.getElementById('julio').textContent
const agosto = document.getElementById('agosto').textContent
const septiembre = document.getElementById('septiembre').textContent
const octubre = document.getElementById('octubre').textContent
const noviembre = document.getElementById('noviembre').textContent
const diciembre = document.getElementById('diciembre').textContent




// chart1
const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
const pagos = [enero, febrero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre, noviembre, diciembre];


const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: meses,
        datasets: [{
            label: 'Pagos por Meses',
            data: pagos,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 2
        }]
    }

})