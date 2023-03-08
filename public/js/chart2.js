const ctx2 = document.getElementById('myChart2');


// chart2

const pc = document.getElementById('pc').textContent
const android = document.getElementById('android').textContent
const iphone = document.getElementById('iphone').textContent
const ipad = document.getElementById('ipad').textContent



// chart2
const labels = ["PC", "ANDROID", "IPHONE", "IPAD"];
const visitas = [pc, android, iphone, ipad];


const myChart2 = new Chart(ctx2, {
    type: 'bar',
    data: {
        labels: labels,
        datasets: [{
            label: 'Visitas ',
            data: visitas,
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