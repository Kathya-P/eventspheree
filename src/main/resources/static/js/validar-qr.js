// Verificar sesión y que sea organizador
const usuario = Utils.verificarSesion();

// Variables globales
let videoStream = null;
let scanning = false;
let validadosHoy = 0;
let erroresHoy = 0;
let historial = [];

// Cargar información al inicio
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('organizadorNombre').textContent = usuario.nombre || usuario.username;
    cargarEstadisticas();
});

// Botones de cámara
document.getElementById('startButton').addEventListener('click', iniciarCamara);
document.getElementById('stopButton').addEventListener('click', detenerCamara);

// Iniciar cámara
async function iniciarCamara() {
    try {
        const video = document.getElementById('video');
        const startButton = document.getElementById('startButton');
        const stopButton = document.getElementById('stopButton');
        const videoContainer = document.getElementById('videoContainer');
        
        // Solicitar acceso a la cámara
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' } // Cámara trasera en móviles
        });
        
        video.srcObject = videoStream;
        video.setAttribute('playsinline', true); // iOS
        video.play();
        
        // Mostrar/ocultar elementos
        videoContainer.style.display = 'block';
        startButton.style.display = 'none';
        stopButton.style.display = 'inline-block';
        
        // Iniciar escaneo
        scanning = true;
        requestAnimationFrame(escanearQR);
        
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        alert('No se pudo acceder a la cámara. Verifica los permisos.');
    }
}

// Detener cámara
function detenerCamara() {
    scanning = false;
    
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
    
    const video = document.getElementById('video');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const videoContainer = document.getElementById('videoContainer');
    
    video.srcObject = null;
    videoContainer.style.display = 'none';
    startButton.style.display = 'inline-block';
    stopButton.style.display = 'none';
}

// Escanear QR desde el video
function escanearQR() {
    if (!scanning) return;
    
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const canvasContext = canvas.getContext('2d');
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Ajustar canvas al tamaño del video
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        
        // Dibujar frame actual del video en el canvas
        canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Obtener datos de imagen
        const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
        
        // Intentar decodificar QR
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
        });
        
        if (code) {
            // QR detectado!
            console.log('QR detectado:', code.data);
            scanning = false; // Pausar escaneo
            validarQRCodigo(code.data);
        }
    }
    
    // Continuar escaneando
    if (scanning) {
        requestAnimationFrame(escanearQR);
    }
}

// Validar código QR manualmente
function validarManual() {
    const input = document.getElementById('codigoQRInput');
    const codigo = input.value.trim();
    
    if (!codigo) {
        alert('Por favor ingresa un código QR');
        return;
    }
    
    validarQRCodigo(codigo);
}

// Validar QR contra el backend
async function validarQRCodigo(codigoQR) {
    const resultadoDiv = document.getElementById('resultadoValidacion');
    resultadoDiv.style.display = 'block';
    resultadoDiv.innerHTML = `
        <div class="alert alert-info">
            <div class="spinner-border spinner-border-sm me-2" role="status"></div>
            Validando código...
        </div>
    `;
    
    try {
        const response = await fetch(`${API_BASE_URL}/boletos/validar-qr?codigoQR=${encodeURIComponent(codigoQR)}&organizadorId=${usuario.id}`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Éxito
            validadosHoy++;
            actualizarEstadisticas();
            
            agregarAlHistorial({
                tipo: 'success',
                mensaje: data.mensaje,
                evento: data.evento,
                usuario: data.usuario,
                fecha: new Date()
            });
            
            resultadoDiv.innerHTML = `
                <div class="alert alert-success alert-dismissible fade show">
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    <h5><i class="bi bi-check-circle-fill"></i> ¡Entrada Válida!</h5>
                    <hr>
                    <p class="mb-1"><strong>Evento:</strong> ${data.evento}</p>
                    <p class="mb-1"><strong>Asistente:</strong> ${data.usuario}</p>
                    <p class="mb-0"><strong>Hora:</strong> ${new Date().toLocaleTimeString()}</p>
                </div>
            `;
            
            // Reproducir sonido de éxito (opcional)
            reproducirSonido('success');
            
            // Reiniciar escaneo después de 3 segundos
            setTimeout(() => {
                resultadoDiv.innerHTML = '';
                if (document.getElementById('camera-panel').classList.contains('show')) {
                    scanning = true;
                    requestAnimationFrame(escanearQR);
                } else {
                    document.getElementById('codigoQRInput').value = '';
                    document.getElementById('codigoQRInput').focus();
                }
            }, 3000);
            
        } else {
            // Error
            erroresHoy++;
            actualizarEstadisticas();
            
            agregarAlHistorial({
                tipo: 'error',
                mensaje: data.mensaje,
                fecha: new Date()
            });
            
            resultadoDiv.innerHTML = `
                <div class="alert alert-danger alert-dismissible fade show">
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    <h5><i class="bi bi-x-circle-fill"></i> Entrada No Válida</h5>
                    <p class="mb-0">${data.mensaje}</p>
                </div>
            `;
            
            // Reproducir sonido de error (opcional)
            reproducirSonido('error');
            
            // Reiniciar escaneo después de 2 segundos
            setTimeout(() => {
                if (document.getElementById('camera-panel').classList.contains('show')) {
                    scanning = true;
                    requestAnimationFrame(escanearQR);
                } else {
                    document.getElementById('codigoQRInput').value = '';
                    document.getElementById('codigoQRInput').focus();
                }
            }, 2000);
        }
        
    } catch (error) {
        console.error('Error al validar:', error);
        erroresHoy++;
        actualizarEstadisticas();
        
        resultadoDiv.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle-fill"></i> Error de conexión
            </div>
        `;
        
        setTimeout(() => {
            if (document.getElementById('camera-panel').classList.contains('show')) {
                scanning = true;
                requestAnimationFrame(escanearQR);
            }
        }, 2000);
    }
}

// Actualizar estadísticas en pantalla
function actualizarEstadisticas() {
    document.getElementById('validadosHoy').textContent = validadosHoy;
    document.getElementById('erroresHoy').textContent = erroresHoy;
}

// Cargar estadísticas guardadas
function cargarEstadisticas() {
    // Aquí podrías cargar desde localStorage o hacer una llamada al backend
    const hoy = new Date().toDateString();
    const stats = JSON.parse(localStorage.getItem('qr_stats_' + usuario.id) || '{}');
    
    if (stats.fecha === hoy) {
        validadosHoy = stats.validados || 0;
        erroresHoy = stats.errores || 0;
    }
    
    actualizarEstadisticas();
}

// Guardar estadísticas
function guardarEstadisticas() {
    const hoy = new Date().toDateString();
    const stats = {
        fecha: hoy,
        validados: validadosHoy,
        errores: erroresHoy
    };
    localStorage.setItem('qr_stats_' + usuario.id, JSON.stringify(stats));
}

// Agregar al historial
function agregarAlHistorial(item) {
    historial.unshift(item); // Agregar al principio
    if (historial.length > 10) historial.pop(); // Mantener solo 10
    
    const historialDiv = document.getElementById('historialValidaciones');
    
    if (historial.length === 0) {
        historialDiv.innerHTML = '<p class="text-muted">No hay validaciones recientes</p>';
        return;
    }
    
    historialDiv.innerHTML = historial.map(h => {
        const iconClass = h.tipo === 'success' ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger';
        const badgeClass = h.tipo === 'success' ? 'bg-success' : 'bg-danger';
        
        return `
            <div class="d-flex align-items-center border-bottom pb-2 mb-2">
                <i class="bi ${iconClass} me-2" style="font-size: 1.5rem;"></i>
                <div class="flex-grow-1">
                    <strong>${h.usuario || 'Sin datos'}</strong>
                    ${h.evento ? `<br><small class="text-muted">${h.evento}</small>` : ''}
                    <br><small class="text-muted">${h.fecha.toLocaleTimeString()}</small>
                </div>
                <span class="badge ${badgeClass}">${h.tipo === 'success' ? 'Válido' : 'Rechazado'}</span>
            </div>
        `;
    }).join('');
}

// Reproducir sonidos de feedback (opcional)
function reproducirSonido(tipo) {
    // Usar Web Audio API para generar tonos simples
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (tipo === 'success') {
        oscillator.frequency.value = 800; // Tono alto
        gainNode.gain.value = 0.3;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    } else {
        oscillator.frequency.value = 200; // Tono bajo
        gainNode.gain.value = 0.3;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
    }
}

// Guardar estadísticas al salir
window.addEventListener('beforeunload', guardarEstadisticas);

// Detener cámara al cambiar de tab
document.getElementById('manual-tab').addEventListener('click', () => {
    if (scanning) {
        detenerCamara();
    }
});
