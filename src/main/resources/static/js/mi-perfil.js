// Verificar sesión
const usuario = Utils.verificarSesion();

// Cargar información del usuario
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('username').textContent = usuario.username;
    document.getElementById('email').innerHTML = `<i class="bi bi-envelope me-2"></i>${usuario.email}`;
    document.getElementById('rol').innerHTML = `<i class="bi bi-person-badge me-1"></i>${usuario.rol}`;
    
    // Generar iniciales para el avatar
    const iniciales = usuario.username.substring(0, 2).toUpperCase();
    document.getElementById('avatarInitials').textContent = iniciales;
    
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
        
        // Generar HTML en lista
        let html = '<div class="list-group">';
        
        Object.values(boletosPorEvento).forEach(grupo => {
            const evento = grupo.evento;
            const boletosEvento = grupo.boletos;
            const boletosActivos = boletosEvento.filter(b => b.estado === 'ACTIVO').length;
            const boletosUsados = boletosEvento.filter(b => b.estado === 'USADO').length;
            
            const fechaEvento = new Date(evento.fechaEvento);
            const ahora = new Date();
            const esEventoPasado = fechaEvento < ahora;
            
            html += `
                <div class="list-group-item mb-3 p-3 border rounded">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div class="flex-grow-1">
                            <h5 class="fw-bold text-dark mb-1">${evento.titulo}</h5>
                            <p class="text-muted mb-2 small">
                                <i class="bi bi-calendar3 text-primary"></i> ${Utils.formatearFecha(evento.fechaEvento)}
                                <span class="ms-3"><i class="bi bi-geo-alt text-primary"></i> ${evento.lugar}</span>
                            </p>
                            <div class="d-flex gap-3">
                                <span class="badge ${esEventoPasado ? 'bg-secondary' : 'bg-success'}">${esEventoPasado ? 'Finalizado' : 'Próximo'}</span>
                                <small class="text-muted">
                                    <strong>${boletosEvento.length}</strong> boletos |
                                    <span class="text-success">${boletosActivos} activos</span> |
                                    <span class="text-info">${boletosUsados} usados</span>
                                </small>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" type="button" 
                                data-bs-toggle="collapse" data-bs-target="#boletos-${evento.id}">
                            <i class="bi bi-chevron-down"></i> Ver Boletos
                        </button>
                    </div>
                    
                    <!-- Lista de boletos colapsable -->
                    <div class="collapse mt-3" id="boletos-${evento.id}">
                        <div class="border-top pt-3">
            `;
            
            boletosEvento.forEach((boleto, index) => {
                const estadoConfig = {
                    'ACTIVO': { class: 'success', icon: 'bi-check-circle-fill', text: 'Activo' },
                    'USADO': { class: 'info', icon: 'bi-check2-all', text: 'Usado' },
                    'CANCELADO': { class: 'danger', icon: 'bi-x-circle-fill', text: 'Cancelado' }
                }[boleto.estado] || { class: 'secondary', icon: 'bi-ticket', text: boleto.estado };
                
                html += `
                    <div class="list-group-item border-start border-4 border-${estadoConfig.class} mb-2">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="flex-grow-1">
                                <div class="d-flex align-items-center mb-1">
                                    <span class="badge bg-${estadoConfig.class} me-2">
                                        <i class="${estadoConfig.icon}"></i> ${estadoConfig.text}
                                    </span>
                                    <strong>Boleto #${boleto.id}</strong>
                                    <span class="text-success fw-bold ms-3">${Utils.formatearPrecio(evento.precio)}</span>
                                </div>
                                <small class="text-muted d-block">
                                    <i class="bi bi-calendar3"></i> ${new Date(boleto.fechaCompra).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    ${boleto.estado === 'USADO' ? ` | <i class="bi bi-check2"></i> Usado: ${new Date(boleto.fechaUso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}` : ''}
                                </small>
                                <small class="text-muted"><i class="bi bi-qr-code"></i> ${boleto.codigoQR}</small>
                            </div>
                            <div class="text-end ms-3">
                                <img id="qr-${boleto.id}" src="" alt="QR" 
                                     style="width: 60px; height: 60px; display: none; cursor: pointer;" 
                                     onclick="verQRGrande(${boleto.id})" 
                                     title="Click para ver grande">
                                <div id="qr-loading-${boleto.id}" class="text-center">
                                    <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                                </div>
                                <button class="btn btn-sm btn-outline-primary mt-2 w-100" onclick="descargarQR(${boleto.id}, '${boleto.codigoQR}')">
                                    <i class="bi bi-download"></i> Descargar
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>'; // Cerrar list-group
        
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
                <div class="card-header text-white" style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);">
                    <h6 class="mb-0 fw-bold">
                        <i class="bi bi-calendar-event"></i> ${stat.tituloEvento}
                        <span class="badge bg-white text-dark float-end fw-semibold">${stat.estadoEvento}</span>
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
