// Verificar sesión
const usuario = Utils.verificarSesion();

// Cargar información del usuario
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('username').textContent = usuario.username;
    document.getElementById('email').textContent = usuario.email;
    document.getElementById('rol').textContent = usuario.rol;
    
    cargarBoletos();
    cargarMisEventos();
    cargarEstadisticas();
});

// Cargar boletos del usuario
async function cargarBoletos() {
    const container = document.getElementById('boletosContainer');
    container.innerHTML = '<p class="text-muted">Cargando boletos...</p>';
    
    try {
        const boletos = await BoletoAPI.listarPorUsuario(usuario.id);
        
        if (boletos.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i> No has comprado boletos aún.
                    <a href="index.html" class="alert-link">Ver eventos disponibles</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = boletos.map(boleto => {
            const estadoClass = {
                'ACTIVO': 'success',
                'USADO': 'secondary',
                'CANCELADO': 'danger'
            }[boleto.estado] || 'secondary';
            
            const estadoIcon = {
                'ACTIVO': 'bi-check-circle',
                'USADO': 'bi-check2-all',
                'CANCELADO': 'bi-x-circle'
            }[boleto.estado] || 'bi-ticket';
            
            return `
                <div class="card mb-3 shadow-sm">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <h5 class="card-title mb-2">
                                    <i class="bi bi-ticket-perforated text-primary"></i>
                                    ${boleto.evento.titulo}
                                </h5>
                                <p class="mb-1">
                                    <i class="bi bi-calendar3"></i>
                                    <small>${Utils.formatearFecha(boleto.evento.fechaEvento)}</small>
                                </p>
                                <p class="mb-1">
                                    <i class="bi bi-geo-alt"></i>
                                    <small>${boleto.evento.lugar}</small>
                                </p>
                                <p class="mb-2">
                                    <i class="bi bi-cash"></i>
                                    <strong>${Utils.formatearPrecio(boleto.evento.precio)}</strong>
                                </p>
                                <span class="badge bg-${estadoClass}">
                                    <i class="${estadoIcon}"></i> ${boleto.estado}
                                </span>
                                ${boleto.estado === 'USADO' ? 
                                    `<small class="text-muted ms-2">Usado: ${Utils.formatearFecha(boleto.fechaUso)}</small>` 
                                    : ''}
                            </div>
                            <div class="col-md-4 text-center">
                                <div class="qr-code-container p-3 bg-light rounded">
                                    <img id="qr-${boleto.id}" src="" alt="QR Code" style="width: 150px; height: 150px; display: none;" class="mb-2">
                                    <div id="qr-loading-${boleto.id}" class="mb-2">
                                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                                            <span class="visually-hidden">Cargando...</span>
                                        </div>
                                    </div>
                                    <small class="text-muted d-block">${boleto.codigoQR}</small>
                                    <div class="btn-group mt-2" role="group">
                                        <button class="btn btn-sm btn-outline-primary" onclick="descargarQR(${boleto.id}, '${boleto.codigoQR}')">
                                            <i class="bi bi-download"></i> Descargar
                                        </button>
                                        <button class="btn btn-sm btn-outline-info" onclick="verQRGrande(${boleto.id})">
                                            <i class="bi bi-arrows-fullscreen"></i> Ampliar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mt-3">
                            <small class="text-muted">
                                <i class="bi bi-clock"></i> Comprado: ${Utils.formatearFecha(boleto.fechaCompra)}
                            </small>
                            ${boleto.estado === 'ACTIVO' ? 
                                `<button class="btn btn-sm btn-danger float-end" onclick="cancelarBoleto(${boleto.id})">
                                    <i class="bi bi-x"></i> Cancelar
                                </button>` 
                                : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Cargar las imágenes QR para cada boleto
        boletos.forEach(boleto => {
            cargarImagenQR(boleto.id);
        });
    } catch (error) {
        console.error('Error al cargar boletos:', error);
        container.innerHTML = '<p class="text-danger">Error al cargar boletos</p>';
    }
}

// Cargar la imagen QR desde el backend
async function cargarImagenQR(boletoId) {
    try {
        const response = await fetch(`${API_BASE_URL}/boletos/${boletoId}/qr-image`);
        const data = await response.json();
        
        const imgElement = document.getElementById(`qr-${boletoId}`);
        const loadingElement = document.getElementById(`qr-loading-${boletoId}`);
        
        if (imgElement && loadingElement) {
            imgElement.src = data.imagenQR;
            imgElement.style.display = 'block';
            loadingElement.style.display = 'none';
        }
    } catch (error) {
        console.error('Error al cargar QR:', error);
        const loadingElement = document.getElementById(`qr-loading-${boletoId}`);
        if (loadingElement) {
            loadingElement.innerHTML = '<small class="text-danger">Error al cargar QR</small>';
        }
    }
}

// Descargar código QR
function descargarQR(boletoId, codigoQR) {
    const imgElement = document.getElementById(`qr-${boletoId}`);
    if (!imgElement || !imgElement.src) {
        alert('El código QR aún no se ha cargado');
        return;
    }
    
    // Crear un enlace temporal para descargar
    const link = document.createElement('a');
    link.href = imgElement.src;
    link.download = `boleto-${codigoQR}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Ver QR en grande (modal)
function verQRGrande(boletoId) {
    const imgElement = document.getElementById(`qr-${boletoId}`);
    if (!imgElement || !imgElement.src) {
        alert('El código QR aún no se ha cargado');
        return;
    }
    
    // Crear modal con Bootstrap
    const modalHTML = `
        <div class="modal fade" id="qrModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Código QR del Boleto</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <img src="${imgElement.src}" alt="QR Code" class="img-fluid" style="max-width: 400px;">
                        <p class="mt-3 text-muted">Muestra este código en la entrada del evento</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        <button type="button" class="btn btn-primary" onclick="descargarQR(${boletoId}, 'boleto')">
                            <i class="bi bi-download"></i> Descargar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insertar y mostrar modal
    const existingModal = document.getElementById('qrModal');
    if (existingModal) {
        existingModal.remove();
    }
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('qrModal'));
    modal.show();
    
    // Limpiar al cerrar
    document.getElementById('qrModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

// Ver código QR (función legacy - mantener por compatibilidad)
function verQR(codigoQR) {
    alert(`Código QR: ${codigoQR}`);
}

// Cancelar boleto
async function cancelarBoleto(boletoId) {
    if (!confirm('¿Estás seguro de cancelar este boleto?\nEsta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const response = await BoletoAPI.cancelar(boletoId);
        if (response.ok) {
            alert('Boleto cancelado correctamente');
            cargarBoletos(); // Recargar lista
        } else {
            const error = await response.text();
            alert(`Error: ${error}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

// Cargar eventos del usuario
async function cargarMisEventos() {
    const container = document.getElementById('misEventosContainer');
    container.innerHTML = '<p class="text-muted">Cargando eventos...</p>';
    
    try {
        const todosEventos = await EventoAPI.listar();
        const misEventos = todosEventos.filter(evento => 
            evento.organizador && evento.organizador.id === usuario.id
        );
        
        if (misEventos.length === 0) {
            container.innerHTML = '<p class="text-muted">No has creado eventos aún.</p>';
            return;
        }
        
        container.innerHTML = misEventos.map(evento => `
            <div class="card mb-3">
                <div class="card-body">
                    <h6>${evento.titulo}</h6>
                    <p class="text-muted small mb-2">
                        <i class="bi bi-calendar3"></i> ${Utils.formatearFecha(evento.fechaEvento)}
                    </p>
                    <div class="mb-2">
                        <span class="badge bg-${evento.estado === 'ACTIVO' ? 'success' : 'secondary'}">${evento.estado}</span>
                        <span class="badge bg-info">${evento.entradasVendidas}/${evento.capacidad} vendidos</span>
                    </div>
                    <div class="btn-group btn-group-sm">
                        <a href="evento-detalle.html?id=${evento.id}" class="btn btn-outline-primary">Ver</a>
                        <button class="btn btn-outline-warning" onclick="editarEvento(${evento.id})">Editar</button>
                        <button class="btn btn-outline-danger" onclick="eliminarEvento(${evento.id})">Eliminar</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error al cargar eventos:', error);
        container.innerHTML = '<p class="text-danger">Error al cargar eventos</p>';
    }
}

// Editar evento
function editarEvento(id) {
    window.location.href = `editar-evento.html?id=${id}`;
}

// Eliminar evento
async function eliminarEvento(id) {
    if (!confirm('¿Estás seguro de eliminar este evento?')) {
        return;
    }
    
    try {
        const response = await EventoAPI.eliminar(id);
        if (response.ok) {
            alert('Evento eliminado correctamente');
            cargarMisEventos();
        } else {
            alert('Error al eliminar evento');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

// Cerrar sesión
function cerrarSesion() {
    if (confirm('¿Deseas cerrar sesión?')) {
        Utils.cerrarSesion();
    }
}

// Cargar estadísticas del organizador
async function cargarEstadisticas() {
    const container = document.getElementById('estadisticasEventos');
    container.innerHTML = '<p class="text-muted">Cargando estadísticas...</p>';
    
    try {
        // Obtener estadísticas por organizador
        const response = await fetch(`${API_BASE_URL}/estadisticas/organizador/${usuario.id}`);
        const estadisticas = await response.json();
        
        if (estadisticas.length === 0) {
            container.innerHTML = '<p class="text-muted">No tienes eventos para mostrar estadísticas.</p>';
            return;
        }
        
        // Calcular totales
        let totalEventos = estadisticas.length;
        let totalBoletos = estadisticas.reduce((sum, e) => sum + e.boletosVendidos, 0);
        let ingresosTotales = estadisticas.reduce((sum, e) => sum + parseFloat(e.ingresosTotales), 0);
        
        // Actualizar tarjetas de resumen
        document.getElementById('totalEventos').textContent = totalEventos;
        document.getElementById('totalBoletos').textContent = totalBoletos;
        document.getElementById('ingresosTotales').textContent = '$' + ingresosTotales.toFixed(2);
        
        // Mostrar estadísticas detalladas por evento
        container.innerHTML = estadisticas.map(stat => `
            <div class="card mb-3 border-primary">
                <div class="card-header bg-primary text-white">
                    <h6 class="mb-0">
                        <i class="bi bi-calendar-event"></i> ${stat.tituloEvento}
                        <span class="badge bg-light text-dark float-end">${stat.estadoEvento}</span>
                    </h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-2">
                                <i class="bi bi-ticket text-primary"></i>
                                <strong>Boletos:</strong> ${stat.boletosVendidos} / ${stat.totalBoletos}
                                (${stat.boletosDisponibles} disponibles)
                            </p>
                            <div class="progress mb-3" style="height: 25px;">
                                <div class="progress-bar ${stat.porcentajeOcupacion > 80 ? 'bg-success' : stat.porcentajeOcupacion > 50 ? 'bg-warning' : 'bg-info'}" 
                                     style="width: ${stat.porcentajeOcupacion}%">
                                    ${stat.porcentajeOcupacion.toFixed(1)}%
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-2">
                                <i class="bi bi-cash-coin text-success"></i>
                                <strong>Ingresos:</strong> $${parseFloat(stat.ingresosTotales).toFixed(2)}
                            </p>
                            <p class="mb-2">
                                <i class="bi bi-star-fill text-warning"></i>
                                <strong>Reseñas:</strong> ${stat.totalResenas} 
                                ${stat.totalResenas > 0 ? `(⭐ ${stat.promedioCalificacion.toFixed(1)})` : ''}
                            </p>
                            <p class="mb-2">
                                <i class="bi bi-camera text-info"></i>
                                <strong>Fotos:</strong> ${stat.totalFotos} | 
                                <i class="bi bi-chat text-secondary"></i>
                                <strong>Mensajes:</strong> ${stat.totalMensajes}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        container.innerHTML = '<p class="text-danger">Error al cargar estadísticas</p>';
    }
}
