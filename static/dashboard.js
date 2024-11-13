let barChartInstance = null;
let doughnutChartInstance = null;

document.addEventListener('DOMContentLoaded', function () {
    // Cargar los datos iniciales del puntaje SFARI
    loadChartData('sfari');
});

function loadChartData(dataType) {
    fetch('/get_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data_type: dataType })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener los datos del backend');
        }
        return response.json();
    })
    .then(data => {
        let labels;
        if (dataType === 'sfari') {
            labels = ['1', '2', '3', 'S'];
        } else if (dataType === 'eagle') {
            labels = ['Null','Limited', 'Moderate', 'Strong']; // Asumiendo que 'labels' contiene los nombres de las afinidades desde el backend.
        } else if (dataType === 'clasificacion') {
            labels = data.labels; // Asumiendo que 'labels' contiene los nombres de las categorías desde el backend.
        } else {
            labels = data.labels;
        }
        // Destruir instancias existentes de los gráficos si existen
        if (barChartInstance) {
            barChartInstance.destroy();
        }
        if (doughnutChartInstance) {
            doughnutChartInstance.destroy();
        }

        // Crear nuevo gráfico de barras
        const barCtx = document.getElementById('bar-chart').getContext('2d');
        barChartInstance = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cantidad de Genes',
                    data: data.counts,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Crear nuevo gráfico de dona
        const doughnutCtx = document.getElementById('doughnut-chart').getContext('2d');
        doughnutChartInstance = new Chart(doughnutCtx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cantidad de Genes',
                    data: data.counts,
                    backgroundColor: [
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(153, 102, 255, 0.6)',
                            'rgba(255, 159, 64, 0.6)',
                            'rgba(201, 203, 207, 0.6)',
                            'rgba(255, 99, 71, 0.6)',
                            'rgba(123, 239, 178, 0.6)',
                            'rgba(240, 128, 128, 0.6)',
                            'rgba(60, 179, 113, 0.6)',
                            'rgba(106, 90, 205, 0.6)',
                            'rgba(147, 112, 219, 0.6)',
                            'rgba(255, 69, 0, 0.6)',
                            'rgba(100, 149, 237, 0.6)',
                            'rgba(255, 20, 147, 0.6)',
                            'rgba(218, 165, 32, 0.6)',
                            'rgba(50, 205, 50, 0.6)',
                            'rgba(70, 130, 180, 0.6)',
                            'rgba(221, 160, 221, 0.6)',
                            'rgba(30, 144, 255, 0.6)',
                            'rgba(244, 164, 96, 0.6)',
                            'rgba(127, 255, 0, 0.6)',
                            'rgba(255, 140, 0, 0.6)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(201, 203, 207, 1)',
                        'rgba(255, 99, 71, 1)',
                        'rgba(123, 239, 178, 1)',
                        'rgba(240, 128, 128, 1)',
                        'rgba(60, 179, 113, 1)',
                        'rgba(106, 90, 205, 1)',
                        'rgba(147, 112, 219, 1)',
                        'rgba(255, 69, 0, 1)',
                        'rgba(100, 149, 237, 1)',
                        'rgba(255, 20, 147, 1)',
                        'rgba(218, 165, 32, 1)',
                        'rgba(50, 205, 50, 1)',
                        'rgba(70, 130, 180, 1)',
                        'rgba(221, 160, 221, 1)',
                        'rgba(30, 144, 255, 1)',
                        'rgba(244, 164, 96, 1)',
                        'rgba(127, 255, 0, 1)',
                        'rgba(255, 140, 0, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    })
    .catch(error => {
        console.error('Error al cargar los datos:', error);
        alert('Hubo un error al cargar los datos. Por favor, inténtalo de nuevo.');
    });
}


document.addEventListener('DOMContentLoaded', function () {
    // Obtener los elementos de los tabs
    const mainTab = document.querySelector('.tab.inactive');
    const genomicTab = document.querySelector('.tab.active');

    // Asignar eventos a los tabs
    mainTab.addEventListener('click', function () {
        // Cambiar las clases de los tabs para reflejar cuál está activo
        mainTab.classList.add('active');
        mainTab.classList.remove('inactive');
        genomicTab.classList.add('inactive');
        genomicTab.classList.remove('active');

        // Lógica para cambiar contenido si fuera necesario (no funcional en este caso)
        // alert('Tab principal seleccionado');
    });

    genomicTab.addEventListener('click', function () {
        // Redirigir al template gene_view
        window.location.href = '/genes';
    });
});

