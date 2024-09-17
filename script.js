function regenerateNoiseSeed() {
    noise.seed(Math.random());
}

const scale = 0.005;
const heightScale = 0.01;
const detailScale = 0.05;
const seaLevel = 0.45;
const beachLevel = 0.48;
const forestLevel = 0.65;
const hillLevel = 0.75;
const mountainLevel = 0.85;
let numCities = 5;
let numPorts = 2;
let numBases = 2;

function generateMap() {
    const canvas = document.getElementById('mapCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const spinner = document.getElementById('spinner');
    spinner.style.display = 'block'; 

    setTimeout(() => { 
        ctx.clearRect(0, 0, width, height);

        const elevationMap = [];
        const centerX = width / 2;
        const centerY = height / 2;

        for (let x = 0; x < width; x++) {
            elevationMap[x] = [];

            for (let y = 0; y < height; y++) {
                const nx = (x / width - 0.5) * 1.5;
                const ny = (y / height - 0.5) * 1.5;
                const distanceFromCenter = Math.sqrt(nx * nx + ny * ny);

                const elevation = noise.perlin2(x * heightScale, y * heightScale);
                const detail = noise.perlin2(x * detailScale, y * detailScale) * 0.1;

                const elevationWithDetail = elevation + detail - (distanceFromCenter * 0.5);
                const normalizedElevation = (elevationWithDetail + 1) / 2;
                elevationMap[x][y] = normalizedElevation;

                if (normalizedElevation < seaLevel) {
                    ctx.fillStyle = '#1d3b67';  
                } else if (normalizedElevation < beachLevel) {
                    ctx.fillStyle = '#f4d19b';  
                } else if (normalizedElevation < forestLevel) {
                    ctx.fillStyle = '#228B22';  
                } else if (normalizedElevation < hillLevel) {
                    ctx.fillStyle = '#c4e17f'; 
                } else if (normalizedElevation < mountainLevel) {
                    ctx.fillStyle = '#a9a9a9'; 
                } else {
                    ctx.fillStyle = '#FFFFFF';  
                }

                ctx.fillRect(x, y, 1, 1);
            }
        }

        generateRivers(ctx, elevationMap, width, height);
        drawGrid(ctx, width, height);

        spinner.style.display = 'none';

    }, 100); 
}

function generateRivers(ctx, elevationMap, width, height) {
    for (let i = 0; i < 60; i++) {  
        let x = Math.floor(Math.random() * width);
        let y = Math.floor(Math.random() * height);
        while (elevationMap[x][y] > seaLevel && elevationMap[x][y] < mountainLevel) {
            ctx.fillStyle = '#1d3b67';
            ctx.fillRect(x, y, 1, 1);
            x += Math.floor(Math.random() * 3) - 1;  
            y += Math.floor(Math.random() * 3) - 1;
        }
    }
}

function drawGrid(ctx, width, height) {
    const gridSpacing = 50;  

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 0.5;
    ctx.font = '10px Arial';

    for (let x = gridSpacing; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';  
        ctx.fillText(`Lat ${x}`, x + 2, 12);
    }

    for (let y = gridSpacing; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF'; 
        ctx.fillText(`Lon ${y}`, 2, y - 2);
    }
}

document.getElementById('generateButton').addEventListener('click', function() {
    regenerateNoiseSeed();
    generateMap();
});

document.getElementById('cameraButton').addEventListener('click', function() {
    const canvas = document.getElementById('mapCanvas');
    Swal.fire({
        title: 'Acciones de mapa',
        text: '¿Qué deseas hacer con el mapa generado?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Copiar',
        cancelButtonText: 'Cerrar',
    }).then((result) => {
        if (result.isConfirmed) {
            canvas.toBlob(function(blob) {
                const item = new ClipboardItem({'image/png': blob});
                navigator.clipboard.write([item]).then(() => {
                    Swal.fire('Copiado', 'El mapa ha sido copiado al portapapeles', 'success');
                }).catch(() => {
                    Swal.fire('Error', 'No se pudo copiar al portapapeles', 'error');
                });
            });
        }
    });
});
