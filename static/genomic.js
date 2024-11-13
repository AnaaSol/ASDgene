$(document).ready(function() {
    // Llenar la lista de genes
    $.get('/get_genes', function(data) {
        data.genes.forEach(function(gene) {
            $('#gene-list').append(`<li class="gene-item" data-gene-id="${gene.id}">${gene.symbol}</li>`);
        });
    }).fail(function() {
        alert("Error al cargar la lista de genes. Por favor, intenta nuevamente.");
    });

    // Evento para cuando se selecciona un gen
    $('#gene-list').on('click', '.gene-item', function() {
        const geneId = $(this).data('gene-id');

        // Añadir un indicador de carga
        $('#sequence-box').text('Cargando...');
        $('#percent-a').text('');
        $('#percent-t').text('');
        $('#percent-c').text('');
        $('#percent-g').text('');
        $('#percent-cg').text('');

        // Resaltar el gen seleccionado y quitar la selección previa
        $('.gene-item').removeClass('selected'); // Remueve la clase de todos los elementos
        $(this).addClass('selected'); // Añade la clase al gen seleccionado

        // Hacer la solicitud para obtener los datos del gen seleccionado
        $.get(`/get_gene_data/${geneId}`, function(data) {
            updateGeneData(data);
        }).fail(function() {
            alert("Error al cargar la información del gen. Por favor, intenta nuevamente.");
            $('#sequence-box').text('Error al cargar la secuencia');
        });
    });

    // Función para actualizar la información del gen
    function updateGeneData(data) {
        $('#sequence-box').text(data.sequence);
        $('#percent-a').text(data.percent_a);
        $('#percent-t').text(data.percent_t);
        $('#percent-c').text(data.percent_c);
        $('#percent-g').text(data.percent_g);
        $('#percent-cg').text(data.percent_cg);
        render8MerVisualization(data.mers);
    }

    function render8MerVisualization(mers) {
        $('#8mer-visualization').empty();
        
        const totalCells = 256 * 256; // 65,536 celdas en total
        const fragment = $(document.createDocumentFragment());
    
        // Definir la escala de grises usando chroma.js
        const colorScale = chroma.scale(['#e0f7fa', '#007bb5']).domain([0, Math.max(...mers)]); // Desde un gris claro hasta negro
    
        for (let i = 0; i < totalCells; i++) {
            const value = mers[i] || 0; // Asegurarse de que cada celda tenga un valor; si no, usar 0
            const color = colorScale(value).hex(); // Obtener el color basado en la frecuencia
    
            // Crear un div con el tamaño adecuado
            const div = $('<div class="mer-box"></div>');
            div.css({
                'background-color': color,
            });
            fragment.append(div);
        }
    
        $('#8mer-visualization').append(fragment);
    
        console.log("Total de celdas generadas:", $('#8mer-visualization .mer-box').length);
    }
        
    document.getElementById("download-pdf").addEventListener("click", function() {
        // Obtener los valores necesarios
        const geneSymbol = $('.gene-item.selected').text() || 'Gen Desconocido';
        const geneSequence = $('#sequence-box').text();
        const percentA = $('#percent-a').text();
        const percentT = $('#percent-t').text();
        const percentC = $('#percent-c').text();
        const percentG = $('#percent-g').text();
        const percentCG = $('#percent-cg').text();
    
        // Crear un nuevo PDF usando jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
    
        // Añadir el símbolo del gen y la secuencia
        doc.setFontSize(16);
        doc.text("Informe del Gen", 10, 10);
        doc.setFontSize(12);
        doc.text(`Símbolo/Número del Gen: ${geneSymbol}`, 10, 20);
        doc.text("Secuencia:", 10, 30);
        
        // Añadir la secuencia, dividiéndola en líneas
        const sequenceLines = doc.splitTextToSize(geneSequence, 180); // Dividir el texto de la secuencia en líneas ajustadas al ancho
        doc.setFontSize(10);
        let yOffset = 40; // Posición inicial en el eje Y
        sequenceLines.forEach(line => {
            if (yOffset > 270) {
                doc.addPage(); // Añadir una nueva página si excede el límite
                yOffset = 10; // Reiniciar la posición Y
            }
            doc.text(line, 10, yOffset);
            yOffset += 5; // Incrementar la posición Y para la siguiente línea
        });
    
        // Añadir los porcentajes calculados
        if (yOffset > 240) {
            doc.addPage(); // Añadir una nueva página si no hay suficiente espacio para los porcentajes
            yOffset = 10; // Reiniciar la posición Y
        }
        
        doc.setFontSize(12);
        doc.text("Porcentajes Calculados:", 10, yOffset + 10);
        doc.setFontSize(10);
        doc.text(`%A: ${percentA}`, 10, yOffset + 20);
        doc.text(`%T: ${percentT}`, 10, yOffset + 30);
        doc.text(`%C: ${percentC}`, 10, yOffset + 40);
        doc.text(`%G: ${percentG}`, 10, yOffset + 50);
        doc.text(`%CG: ${percentCG}`, 10, yOffset + 60);
    
        // Convertir la visualización de 8-mers a una imagen usando html2canvas
        html2canvas(document.getElementById('8mer-visualization')).then(function(canvas) {
            const imgData = canvas.toDataURL('image/png');
            doc.addPage(); // Añadir una nueva página para la visualización de los 8-mers
            doc.addImage(imgData, 'PNG', 10, 10, 180, 180); // Añadir la imagen al PDF
    
            // Descargar el PDF
            doc.save('informe_gen.pdf');
        });
    });
    
    
});

