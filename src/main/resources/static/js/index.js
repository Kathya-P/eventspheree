// Variables globales
let todosLosEventos = [];
let eventosFiltrados = [];
let categorias = [];
let vistaActual = 'grid'; // 'grid' o 'list'

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', async () => {
    await cargarCategorias();
    await cargarTodosLosEventos();
    aplicarFiltros();
});

// Cargar todas las categorías
async function cargarCategorias() {
    try {
        categorias = await CategoriaAPI.listar();
        const selectCategoria = document.getElementById('categoriaFilter');
        // No limpiar el HTML porque ya tiene "Todas las categorías" por defecto
        
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = `${cat.icono} ${cat.nombre}`;
            selectCategoria.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

// Cargar todos los eventos
async function cargarTodosLosEventos() {
    mostrarSpinner(true);
    try {
        todosLosEventos = await EventoAPI.listar();
        eventosFiltrados = [...todosLosEventos];
        actualizarEstadisticas(); // Actualizar estadísticas DESPUÉS de cargar eventos
    } catch (error) {
        console.error('Error al cargar eventos:', error);
    } finally {
        mostrarSpinner(false);
    }
}

// Aplicar todos los filtros
function aplicarFiltros() {
    let filtrados = [...todosLosEventos];
    
    console.log('Total eventos antes de filtrar:', filtrados.length);
    
    // Filtro por búsqueda de texto
    const searchText = document.getElementById('searchInput').value.toLowerCase().trim();
    if (searchText) {
        filtrados = filtrados.filter(e => 
            e.titulo.toLowerCase().includes(searchText) ||
            e.descripcion?.toLowerCase().includes(searchText) ||
            e.lugar.toLowerCase().includes(searchText)
        );
        console.log('Después de filtro texto:', filtrados.length);
    }
    
    // Filtro por categoría
    const categoriaId = document.getElementById('categoriaFilter').value;
    if (categoriaId) {
        filtrados = filtrados.filter(e => e.categoria.id == categoriaId);
        console.log('Después de filtro categoría:', filtrados.length);
    }
    
    // Filtro por estado
    const estadoFilter = document.querySelector('input[name="estadoFilter"]:checked')?.value || '';
    if (estadoFilter) {
        filtrados = filtrados.filter(e => e.estado === estadoFilter);
        console.log('Después de filtro estado:', filtrados.length);
    }
    
    // Filtro por fecha desde
    const fechaDesde = document.getElementById('fechaDesde').value;
    if (fechaDesde) {
        filtrados = filtrados.filter(e => new Date(e.fechaEvento) >= new Date(fechaDesde));
        console.log('Después de filtro fecha desde:', filtrados.length);
    }
    
    // Filtro por fecha hasta
    const fechaHasta = document.getElementById('fechaHasta').value;
    if (fechaHasta) {
        const fechaHastaFin = new Date(fechaHasta);
        fechaHastaFin.setHours(23, 59, 59);
        filtrados = filtrados.filter(e => new Date(e.fechaEvento) <= fechaHastaFin);
        console.log('Después de filtro fecha hasta:', filtrados.length);
    }
    
    // Filtro por precio máximo
    const precioMax = document.getElementById('precioMax').value;
    if (precioMax) {
        filtrados = filtrados.filter(e => e.precio <= parseFloat(precioMax));
        console.log('Después de filtro precio:', filtrados.length);
    }
    
    // Ordenamiento
    const orden = document.getElementById('ordenFilter').value;
    switch(orden) {
        case 'fecha':
            filtrados.sort((a, b) => new Date(a.fechaEvento) - new Date(b.fechaEvento));
            break;
        case 'precio-asc':
            filtrados.sort((a, b) => a.precio - b.precio);
            break;
        case 'precio-desc':
            filtrados.sort((a, b) => b.precio - a.precio);
            break;
        case 'popular':
            filtrados.sort((a, b) => b.entradasVendidas - a.entradasVendidas);
            break;
    }
    
    console.log('Eventos finales después de ordenar:', filtrados.length);
    
    eventosFiltrados = filtrados;
    mostrarEventos(eventosFiltrados);
    actualizarContadorFiltrados();
}

// Limpiar todos los filtros
function limpiarFiltros() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoriaFilter').value = '';
    document.getElementById('ordenFilter').value = 'fecha';
    document.getElementById('fechaDesde').value = '';
    document.getElementById('fechaHasta').value = '';
    document.getElementById('precioMax').value = '';
    document.getElementById('estadoActivo').checked = true;
    aplicarFiltros();
}

// Cambiar vista (grid/list)
function cambiarVista(tipo) {
    vistaActual = tipo;
    mostrarEventos(eventosFiltrados);
}

// Mostrar eventos según la vista seleccionada
function mostrarEventos(eventos) {
    const container = document.getElementById('eventosContainer');
    const noEventosMsg = document.getElementById('noEventosMsg');
    
    console.log('mostrarEventos llamado con', eventos.length, 'eventos');
    
    // Asegurarse de que el container siempre esté visible
    container.classList.remove('d-none');
    
    if (!eventos || eventos.length === 0) {
        container.innerHTML = '';
        noEventosMsg.classList.remove('d-none');
        return;
    }
    
    noEventosMsg.classList.add('d-none');
    
    if (vistaActual === 'grid') {
        container.className = 'row g-4';
        container.innerHTML = eventos.map(e => crearTarjetaGrid(e)).join('');
    } else {
        container.className = 'row g-3';
        container.innerHTML = eventos.map(e => crearTarjetaLista(e)).join('');
    }
}

// Crear tarjeta vista grid
function crearTarjetaGrid(evento) {
    const imagenUrl = evento.imagenUrl || `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=250&fit=crop&q=80`;
    const disponibles = evento.capacidad - evento.entradasVendidas;
    const porcentajeVendido = Math.round((evento.entradasVendidas / evento.capacidad) * 100);
    const fechaEvento = new Date(evento.fechaEvento);
    const ahora = new Date();
    const esProximo = fechaEvento > ahora;
    
    // Badge de estado
    let estadoBadge = '';
    if (!esProximo) {
        estadoBadge = '<span class="badge bg-secondary position-absolute top-0 end-0 m-2">Finalizado</span>';
    } else if (disponibles === 0) {
        estadoBadge = '<span class="badge bg-danger position-absolute top-0 end-0 m-2">Agotado</span>';
    } else if (disponibles <= 10) {
        estadoBadge = '<span class="badge bg-warning position-absolute top-0 end-0 m-2">¡Últimas entradas!</span>';
    }
    
    return `
        <div class="col-lg-4 col-md-6">
            <div class="card h-100 shadow-hover border-0 evento-card" style="transition: transform 0.3s, box-shadow 0.3s;">
                <div class="position-relative overflow-hidden">
                    <img src="${imagenUrl}" class="card-img-top" alt="${evento.titulo}" 
                         style="height: 220px; object-fit: cover; transition: transform 0.3s;"
                         onmouseover="this.style.transform='scale(1.1)'"
                         onmouseout="this.style.transform='scale(1)'">
                    ${estadoBadge}
                    <div class="position-absolute bottom-0 start-0 m-2">
                        <span class="badge" style="background-color: #3498db;">
                            ${evento.categoria.icono} ${evento.categoria.nombre}
                        </span>
                    </div>
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title fw-bold mb-2" style="color: #1a2332;">${evento.titulo}</h5>
                    <p class="card-text text-muted small flex-grow-1" style="min-height: 60px;">
                        ${evento.descripcion ? evento.descripcion.substring(0, 120) + '...' : 'Sin descripción'}
                    </p>
                    
                    <div class="mb-2">
                        <div class="d-flex align-items-center mb-2">
                            <i class="bi bi-calendar3 me-2" style="color: #3498db;"></i>
                            <small class="text-muted">${formatearFechaCompleta(evento.fechaEvento)}</small>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <i class="bi bi-geo-alt me-2" style="color: #3498db;"></i>
                            <small class="text-muted">${evento.lugar}</small>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <i class="bi bi-person me-2" style="color: #3498db;"></i>
                            <small class="text-muted">${evento.organizador.nombre || evento.organizador.username}</small>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-success fs-6 px-3 py-2">${formatearPrecio(evento.precio)}</span>
                        <small class="text-muted">
                            <i class="bi bi-people-fill"></i> ${disponibles}/${evento.capacidad}
                        </small>
                    </div>
                    
                    <div class="progress mb-3" style="height: 8px; background-color: #e9ecef;">
                        <div class="progress-bar" role="progressbar" 
                             style="width: ${porcentajeVendido}%; background: linear-gradient(90deg, #3498db 0%, #2c3e50 100%);"
                             title="${porcentajeVendido}% vendido"></div>
                    </div>
                </div>
                <div class="card-footer bg-white border-0 pt-0">
                    <a href="evento-detalle.html?id=${evento.id}" class="btn w-100 text-white" 
                       style="background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%); border: none;">
                        <i class="bi bi-eye"></i> Ver Detalles
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Crear tarjeta vista lista
function crearTarjetaLista(evento) {
    const imagenUrl = evento.imagenUrl || `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=150&fit=crop&q=80`;
    const disponibles = evento.capacidad - evento.entradasVendidas;
    const porcentajeVendido = Math.round((evento.entradasVendidas / evento.capacidad) * 100);
    
    return `
        <div class="col-12">
            <div class="card border-0 shadow-sm mb-2" style="transition: transform 0.2s;">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <img src="${imagenUrl}" class="img-fluid rounded" alt="${evento.titulo}" 
                                 style="height: 120px; width: 100%; object-fit: cover;">
                        </div>
                        <div class="col-md-5">
                            <span class="badge mb-2" style="background-color: #3498db;">
                                ${evento.categoria.icono} ${evento.categoria.nombre}
                            </span>
                            <h5 class="mb-2 fw-bold">${evento.titulo}</h5>
                            <p class="text-muted small mb-2">${evento.descripcion ? evento.descripcion.substring(0, 100) + '...' : ''}</p>
                            <div class="d-flex gap-3">
                                <small><i class="bi bi-calendar3 text-primary"></i> ${formatearFechaCompleta(evento.fechaEvento)}</small>
                                <small><i class="bi bi-geo-alt text-primary"></i> ${evento.lugar}</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="mb-2">
                                <strong class="text-success fs-5">${formatearPrecio(evento.precio)}</strong>
                            </div>
                            <div class="progress mb-2" style="height: 6px;">
                                <div class="progress-bar bg-primary" style="width: ${porcentajeVendido}%"></div>
                            </div>
                            <small class="text-muted">
                                <i class="bi bi-people-fill"></i> ${disponibles} de ${evento.capacidad} disponibles
                            </small>
                        </div>
                        <div class="col-md-2 text-end">
                            <a href="evento-detalle.html?id=${evento.id}" class="btn btn-primary">
                                Ver Detalles <i class="bi bi-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Formatear fecha completa
function formatearFechaCompleta(fecha) {
    const f = new Date(fecha);
    const opciones = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return f.toLocaleDateString('es-ES', opciones);
}

// Formatear precio
function formatearPrecio(precio) {
    if (precio === 0) return 'GRATIS';
    return `$${precio.toFixed(2)}`;
}

// Actualizar estadísticas
function actualizarEstadisticas() {
    const totalEventos = todosLosEventos.length;
    const totalCategorias = categorias.length;
    
    // Eventos del mes actual
    const ahora = new Date();
    const eventosMesActual = todosLosEventos.filter(e => {
        const fechaEvento = new Date(e.fechaEvento);
        return fechaEvento.getMonth() === ahora.getMonth() && 
               fechaEvento.getFullYear() === ahora.getFullYear();
    }).length;
    
    document.getElementById('totalEventos').textContent = totalEventos;
    document.getElementById('totalCategorias').textContent = totalCategorias;
    document.getElementById('eventosMesActual').textContent = eventosMesActual;
}

// Actualizar contador de eventos mostrados
function actualizarContadorFiltrados() {
    document.getElementById('eventosMostrados').textContent = eventosFiltrados.length;
}

// Mostrar/ocultar spinner
function mostrarSpinner(mostrar) {
    const spinner = document.getElementById('loadingSpinner');
    const container = document.getElementById('eventosContainer');
    
    if (mostrar) {
        spinner.classList.remove('d-none');
        container.classList.add('d-none');
    } else {
        spinner.classList.add('d-none');
        container.classList.remove('d-none');
    }
}

// CSS hover effect
const style = document.createElement('style');
style.textContent = `
    .shadow-hover:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
    }
    .evento-card {
        border-radius: 12px;
        overflow: hidden;
    }
    .backdrop-blur {
        backdrop-filter: blur(10px);
    }
`;
document.head.appendChild(style);
