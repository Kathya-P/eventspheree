// Verificar sesión
const usuario = Utils.verificarSesion();

// Cargar información del usuario
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('username').textContent = usuario.username;
    document.getElementById('email').textContent = usuario.email;
    document.getElementById('rol').textContent = usuario.rol;
    
    cargarMisEventos();
    cargarBoletos();
    cargarEstadisticas();
});

// Cargar boletos del usuario
async function cargarBoletos() {
    const container = document.getElementById('boletosContainer');
    container.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-muted mt-2">Cargando boletos...</p>
        </div>
    `;
    
    try {
        const boletos = await BoletoAPI.listarPorUsuario(usuario.id);
        
        if (boletos.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-ticket-perforated display-1 text-muted"></i>
                    <h5 class="mt-3 text-muted">No has comprado boletos aún</h5>
                    <p class="text-muted">Explora eventos disponibles y compra tu primer boleto</p>
                    <a href="index.html" class="btn btn-primary mt-3">
                        <i class="bi bi-search"></i> Ver Eventos Disponibles
                    </a>
                </div>
            `;
            return;
        }
        
        // Agrupar boletos por evento
        const boletosPorEvento = {};
        boletos.forEach(boleto => {
            const eventoId = boleto.evento.id;
            if (!boletosPorEvento[eventoId]) {
                boletosPorEvento[eventoId] = {
                    evento: boleto.evento,
                    boletos: []
                };
            }
            boletosPorEvento[eventoId].boletos.push(boleto);
        });
        
        // Generar HTML
        let html = '';
        
        Object.values(boletosPorEvento).forEach(grupo => {
            const evento = grupo.evento;
            const boletosEvento = grupo.boletos;
            const boletosActivos = boletosEvento.filter(b => b.estado === 'ACTIVO').length;
            const boletosUsados = boletosEvento.filter(b => b.estado === 'USADO').length;
            const boletosCancelados = boletosEvento.filter(b => b.estado === 'CANCELADO').length;
            
            const fechaEvento = new Date(evento.fechaEvento);
            const ahora = new Date();
            const esEventoPasado = fechaEvento < ahora;
            
            html += `
                <div class="card mb-4 border-0 shadow-sm">
                    <div class="card-header bg-primary text-white">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <h5 class="mb-1">
                                    <i class="bi bi-calendar-event"></i> ${evento.titulo}
                                </h5>
                                <small>
                                    <i class="bi bi-calendar3"></i> ${Utils.formatearFecha(evento.fechaEvento)} • 
                                    <i class="bi bi-geo-alt"></i> ${evento.lugar}
                                </small>
                            </div>
                            <div class="col-md-4 text-end">
                                <span class="badge ${esEventoPasado ? 'bg-light text-dark' : 'bg-white text-primary'} fs-6">
                                    ${esEventoPasado ? 'Evento Finalizado' : 'Evento Próximo'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <!-- Resumen de boletos -->
                        <div class="row g-2 mb-3">
                            <div class="col-md-4">
                                <div class="p-2 bg-light rounded text-center">
                                    <small class="text-muted d-block">Total Boletos</small>
                                    <strong class="fs-5 text-primary">${boletosEvento.length}</strong>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="p-2 bg-primary bg-opacity-10 rounded text-center">
                                    <small class="text-muted d-block">Activos</small>
                                    <strong class="fs-5 text-primary">${boletosActivos}</strong>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="p-2 bg-secondary bg-opacity-10 rounded text-center">
                                    <small class="text-muted d-block">Usados</small>
                                    <strong class="fs-5 text-secondary">${boletosUsados}</strong>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Lista de boletos -->
                        <div class="accordion" id="accordion-${evento.id}">
            `;
            
            boletosEvento.forEach((boleto, index) => {
                const estadoClass = {
                    'ACTIVO': 'primary',
                    'USADO': 'secondary',
                    'CANCELADO': 'secondary'
                }[boleto.estado] || 'secondary';
                
                const estadoIcon = {
                    'ACTIVO': 'bi-check-circle-fill',
                    'USADO': 'bi-check2-all',
                    'CANCELADO': 'bi-x-circle-fill'
                }[boleto.estado] || 'bi-ticket';
                
                html += `
                    <div class="accordion-item border-0 mb-2 shadow-sm">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed" type="button" 
                                    data-bs-toggle="collapse" data-bs-target="#boleto-${boleto.id}">
                                <div class="d-flex justify-content-between align-items-center w-100 me-3">
                                    <div>
                                        <span class="badge bg-${estadoClass} me-2">
                                            <i class="${estadoIcon}"></i> ${boleto.estado}
                                        </span>
                                        <strong>Boleto #${boleto.id}</strong>
                                        <small class="text-muted ms-2">
                                            Comprado: ${Utils.formatearFecha(boleto.fechaCompra)}
                                        </small>
                                    </div>
                                    <div>
                                        <strong class="text-success">${Utils.formatearPrecio(evento.precio)}</strong>
                                    </div>
                                </div>
                            </button>
                        </h2>
                        <div id="boleto-${boleto.id}" class="accordion-collapse collapse" 
                             data-bs-parent="#accordion-${evento.id}">
                            <div class="accordion-body">
                                <div class="row">
                                    <div class="col-md-8">
                                        <h6 class="text-primary mb-3">
                                            <i class="bi bi-info-circle"></i> Detalles del Boleto
                                        </h6>
                                        <div class="mb-2">
                                            <small class="text-muted">Código QR:</small>
                                            <code class="ms-2">${boleto.codigoQR}</code>
                                        </div>
                                        <div class="mb-2">
                                            <small class="text-muted">Fecha de compra:</small>
                                            <span class="ms-2">${Utils.formatearFecha(boleto.fechaCompra)}</span>
                                        </div>
                                        ${boleto.estado === 'USADO' ? `
                                            <div class="mb-2">
                                                <small class="text-muted">Fecha de uso:</small>
                                                <span class="ms-2">${Utils.formatearFecha(boleto.fechaUso)}</span>
                                            </div>
                                        ` : ''}
                                        ${boleto.estado === 'ACTIVO' ? `
                                            <button class="btn btn-sm btn-outline-secondary mt-2" onclick="cancelarBoleto(${boleto.id})">
                                                <i class="bi bi-x-circle"></i> Cancelar Boleto
                                            </button>
                                        ` : ''}
                                    </div>
                                    <div class="col-md-4 text-center">
                                        <div class="qr-code-container p-3 bg-light rounded">
                                            <h6 class="text-muted mb-3">Código QR</h6>
                                            <img id="qr-${boleto.id}" src="" alt="QR Code" 
                                                 style="width: 150px; height: 150px; display: none;" 
                                                 class="mb-2 border rounded">
                                            <div id="qr-loading-${boleto.id}" class="mb-2">
                                                <div class="spinner-border spinner-border-sm text-primary" role="status">
                                                    <span class="visually-hidden">Cargando...</span>
                                                </div>
                                            </div>
                                            <div class="d-grid gap-2 mt-3">
                                                <button class="btn btn-sm btn-primary" onclick="descargarQR(${boleto.id}, '${boleto.codigoQR}')">
                                                    <i class="bi bi-download"></i> Descargar
                                                </button>
                                                <button class="btn btn-sm btn-outline-primary" onclick="verQRGrande(${boleto.id})">
                                                    <i class="bi bi-arrows-fullscreen"></i> Ver Grande
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Cargar las imágenes QR para cada boleto
        boletos.forEach(boleto => {
            cargarImagenQR(boleto.id);
        });
        
    } catch (error) {
        console.error('Error al cargar boletos:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle"></i> 
                Error al cargar boletos. Por favor, intenta de nuevo.
            </div>
        `;
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
    container.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-muted mt-2">Cargando eventos...</p>
        </div>
    `;
    
    try {
        const misEventos = await EventoAPI.listarPorUsuario(usuario.id);
        
        if (misEventos.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-calendar-x display-1 text-muted"></i>
                    <h5 class="mt-3 text-muted">No has creado eventos aún</h5>
                    <p class="text-muted">¡Crea tu primer evento y comienza a vender boletos!</p>
                    <a href="crear-evento.html" class="btn btn-primary mt-3">
                        <i class="bi bi-plus-circle"></i> Crear Mi Primer Evento
                    </a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="row g-3">
                ${misEventos.map(evento => {
                    const fechaEvento = new Date(evento.fechaEvento);
                    const ahora = new Date();
                    const esEventoPasado = fechaEvento < ahora;
                    const estadoBadge = esEventoPasado 
                        ? '<span class="badge bg-secondary">Finalizado</span>' 
                        : '<span class="badge bg-success">Activo</span>';
                    
                    return `
                        <div class="col-md-6">
                            <div class="card h-100 border-0 shadow-sm">
                                <div class="position-relative">
                                    <img src="${evento.imagenUrl || 'img/placeholder-event.jpg'}" 
                                         class="card-img-top" 
                                         alt="${evento.titulo}"
                                         style="height: 180px; object-fit: cover;">
                                    <div class="position-absolute top-0 end-0 m-2">
                                        ${estadoBadge}
                                    </div>
                                </div>
                                <div class="card-body">
                                    <h5 class="card-title fw-bold mb-2">${evento.titulo}</h5>
                                    <p class="card-text text-muted small mb-2">
                                        <i class="bi bi-calendar3 text-primary"></i> 
                                        ${Utils.formatearFecha(evento.fechaEvento)}
                                    </p>
                                    <p class="card-text text-muted small mb-3">
                                        <i class="bi bi-geo-alt text-primary"></i> 
                                        ${evento.lugar || 'Sin ubicación'}
                                    </p>
                                    
                                    <div class="row g-2 mb-3">
                                        <div class="col-6">
                                            <div class="text-center p-2 bg-light rounded">
                                                <small class="text-muted d-block">Capacidad</small>
                                                <strong class="text-primary">${evento.capacidad || 0}</strong>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div class="text-center p-2 bg-light rounded">
                                                <small class="text-muted d-block">Precio</small>
                                                <strong class="text-primary">$${evento.precio || 0}</strong>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="d-grid gap-2">
                                        <a href="evento-detalle.html?id=${evento.id}" class="btn btn-primary btn-sm">
                                            <i class="bi bi-eye"></i> Ver Detalles
                                        </a>
                                        <div class="btn-group btn-group-sm">
                                            <button class="btn btn-outline-primary" onclick="editarEvento(${evento.id})">
                                                <i class="bi bi-pencil"></i> Editar
                                            </button>
                                            <button class="btn btn-outline-secondary" onclick="eliminarEvento(${evento.id}, '${evento.titulo.replace(/'/g, "\\'")}')">
                                                <i class="bi bi-trash"></i> Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error al cargar eventos:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle"></i> 
                Error al cargar eventos. Por favor, intenta de nuevo.
            </div>
        `;
    }
}

// Editar evento
function editarEvento(id) {
    window.location.href = `editar-evento.html?id=${id}`;
}

// Eliminar evento
async function eliminarEvento(id, nombre) {
    if (!confirm(`¿Estás seguro de eliminar el evento "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
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
            // Resetear estadísticas rápidas
            document.getElementById('totalEventosQuick').textContent = '0';
            document.getElementById('totalBoletosQuick').textContent = '0';
            document.getElementById('ingresosQuick').textContent = '$0';
            document.getElementById('asistentesQuick').textContent = '0';
            document.getElementById('totalEventos').textContent = '0';
            document.getElementById('totalBoletos').textContent = '0';
            document.getElementById('ingresosTotales').textContent = '$0.00';
            return;
        }
        
        // Calcular totales
        let totalEventos = estadisticas.length;
        let totalBoletos = estadisticas.reduce((sum, e) => sum + e.boletosVendidos, 0);
        let ingresosTotales = estadisticas.reduce((sum, e) => sum + parseFloat(e.ingresosTotales), 0);
        
        // Actualizar tarjetas de resumen rápido (header)
        document.getElementById('totalEventosQuick').textContent = totalEventos;
        document.getElementById('totalBoletosQuick').textContent = totalBoletos;
        document.getElementById('ingresosQuick').textContent = '$' + ingresosTotales.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        document.getElementById('asistentesQuick').textContent = totalBoletos;
        
        // Actualizar tarjetas de resumen (tab estadísticas)
        document.getElementById('totalEventos').textContent = totalEventos;
        document.getElementById('totalBoletos').textContent = totalBoletos;
        document.getElementById('ingresosTotales').textContent = '$' + ingresosTotales.toFixed(2);
        
        // Mostrar estadísticas detalladas por evento
        container.innerHTML = estadisticas.map(stat => `
            <div class="card mb-3 border-0 shadow-sm">
                <div class="card-header bg-primary text-white">
                    <h6 class="mb-0">
                        <i class="bi bi-calendar-event"></i> ${stat.tituloEvento}
                        <span class="badge bg-white text-primary float-end">${stat.estadoEvento}</span>
                    </h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center mb-2">
                                <i class="bi bi-ticket-perforated text-primary fs-4 me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Ocupación</small>
                                    <strong>${stat.boletosVendidos} / ${stat.totalBoletos}</strong>
                                    <small class="text-muted">(${stat.boletosDisponibles} disponibles)</small>
                                </div>
                            </div>
                            <div class="progress" style="height: 20px;">
                                <div class="progress-bar bg-primary" 
                                     style="width: ${stat.porcentajeOcupacion}%"
                                     role="progressbar">
                                    <strong>${stat.porcentajeOcupacion.toFixed(1)}%</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="row g-2">
                                <div class="col-6">
                                    <div class="text-center p-2 bg-primary bg-opacity-10 rounded">
                                        <i class="bi bi-cash-coin text-primary"></i>
                                        <div><strong class="text-primary">$${parseFloat(stat.ingresosTotales).toFixed(2)}</strong></div>
                                        <small class="text-muted">Ingresos</small>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="text-center p-2 bg-light rounded">
                                        <i class="bi bi-star-fill text-primary"></i>
                                        <div><strong class="text-primary">${stat.totalResenas > 0 ? stat.promedioCalificacion.toFixed(1) : 'N/A'}</strong></div>
                                        <small class="text-muted">${stat.totalResenas} reseñas</small>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="text-center p-2 bg-light rounded">
                                        <i class="bi bi-camera text-muted"></i>
                                        <div><strong class="text-dark">${stat.totalFotos}</strong></div>
                                        <small class="text-muted">Fotos</small>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="text-center p-2 bg-light rounded">
                                        <i class="bi bi-chat text-muted"></i>
                                        <div><strong class="text-dark">${stat.totalMensajes}</strong></div>
                                        <small class="text-muted">Mensajes</small>
                                    </div>
                                </div>
                            </div>
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
