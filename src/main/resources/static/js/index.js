// Variables globales
let todosLosEventos = [];
let eventosFiltrados = [];
let categorias = [];
let vistaActual = 'grid'; // 'grid' o 'list'
let isUsuarioLogueado = false;

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando carga de página...');
    
    // Verificar si el usuario está logueado
    const usuario = Utils.obtenerUsuarioLocal();
    isUsuarioLogueado = !!usuario;
    
    // Mostrar/ocultar elementos según autenticación
    mostrarElementosSegunAutenticacion();
    
    try {
        await cargarCategorias();
        await cargarTodosLosEventos();
        aplicarFiltros();
    } catch (error) {
        console.error('❌ Error en carga inicial:', error);
    }
});

// Mostrar/ocultar elementos según autenticación
function mostrarElementosSegunAutenticacion() {
    if (!isUsuarioLogueado) {
        // Usuario NO logueado - Mostrar elementos de promoción
        document.getElementById('heroButtons')?.classList.remove('d-none');
        document.getElementById('benefitsSection')?.classList.remove('d-none');
        document.getElementById('registerBanner')?.classList.remove('d-none');
        document.getElementById('eventosSubtitle')?.classList.remove('d-none');
        
        // Ocultar sección de mis eventos
        document.getElementById('misEventosSection')?.classList.add('d-none');
        
        // Cambiar título
        const title = document.getElementById('eventosTitle');
        if (title) title.textContent = 'Vista Previa de Eventos';
    } else {
        // Usuario logueado - Ocultar elementos de promoción
        document.getElementById('heroButtons')?.classList.add('d-none');
        document.getElementById('benefitsSection')?.classList.add('d-none');
        document.getElementById('registerBanner')?.classList.add('d-none');
        document.getElementById('eventosSubtitle')?.classList.add('d-none');
        
        // Mostrar sección de mis eventos
        document.getElementById('misEventosSection')?.classList.remove('d-none');
        cargarMisEventos();
    }
}

// Cargar todas las categorías
async function cargarCategorias() {
    try {
        console.log('📂 Cargando categorías...');
        categorias = await CategoriaAPI.listar();
        console.log('✅ Categorías cargadas:', categorias.length);
        
        const selectCategoria = document.getElementById('categoriaFilter');
        if (!selectCategoria) {
            console.error('❌ No se encontró el elemento categoriaFilter');
            return;
        }
        
        // No limpiar el HTML porque ya tiene "Todas las categorías" por defecto
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = `${cat.icono} ${cat.nombre}`;
            selectCategoria.appendChild(option);
        });
        
        console.log('✅ Categorías agregadas al selector');
    } catch (error) {
        console.error('❌ Error al cargar categorías:', error);
    }
}

// Cargar todos los eventos
async function cargarTodosLosEventos() {
    mostrarSpinner(true);
    try {
        console.log('📅 Cargando eventos...');
        todosLosEventos = await EventoAPI.listar();
        eventosFiltrados = [...todosLosEventos];
        console.log('✅ Eventos cargados:', todosLosEventos.length);
        actualizarEstadisticas();
    } catch (error) {
        console.error('❌ Error al cargar eventos:', error);
        todosLosEventos = [];
        eventosFiltrados = [];
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
    
    // Si el usuario está logueado, excluir sus propios eventos
    let eventosAMostrar = eventos;
    if (isUsuarioLogueado) {
        const usuario = Utils.obtenerUsuarioLocal();
        console.log('👤 Usuario logueado:', usuario.id);
        console.log('📋 Primer evento:', eventos[0]);
        eventosAMostrar = eventos.filter(e => {
            const esPropio = e.organizador && e.organizador.id === usuario.id;
            console.log(`Evento "${e.titulo}" - Organizador:`, e.organizador?.id, '- Es propio:', esPropio);
            return !esPropio;
        });
        console.log('✅ Usuario logueado - Excluyendo eventos propios. Mostrando', eventosAMostrar.length, 'de', eventos.length, 'eventos');
    }
    
    // Limitar a 6 eventos si el usuario NO está logueado
    if (!isUsuarioLogueado && eventosAMostrar.length > 6) {
        eventosAMostrar = eventosAMostrar.slice(0, 6);
        console.log('👁️ Usuario no logueado - Limitando a 6 eventos');
    }
    
    // Asegurarse de que el container siempre esté visible
    container.classList.remove('d-none');
    
    if (!eventosAMostrar || eventosAMostrar.length === 0) {
        container.innerHTML = '';
        noEventosMsg.classList.remove('d-none');
        return;
    }
    
    noEventosMsg.classList.add('d-none');
    
    if (vistaActual === 'grid') {
        container.className = 'row g-4';
        container.innerHTML = eventosAMostrar.map(e => crearTarjetaGrid(e)).join('');
    } else {
        container.className = 'row g-3';
        container.innerHTML = eventosAMostrar.map(e => crearTarjetaLista(e)).join('');
    }
    
    // Agregar mensaje de "más eventos disponibles" si está limitado
    if (!isUsuarioLogueado && eventos.length > 6) {
        container.insertAdjacentHTML('beforeend', `
            <div class="col-12 text-center mt-4">
                <div class="card border-2 border-primary bg-light">
                    <div class="card-body py-5">
                        <i class="bi bi-lock-fill display-4 text-primary mb-3"></i>
                        <h4 class="mb-3">¡Hay ${eventos.length - 6} eventos más disponibles!</h4>
                        <p class="text-muted mb-4">Regístrate gratis para ver todos los eventos y comprar boletos</p>
                        <a href="registro.html" class="btn btn-primary btn-lg me-2">
                            <i class="bi bi-person-plus"></i> Registrarse Gratis
                        </a>
                        <a href="login.html" class="btn btn-outline-primary btn-lg">
                            <i class="bi bi-box-arrow-in-right"></i> Iniciar Sesión
                        </a>
                    </div>
                </div>
            </div>
        `);
    }
}

// Crear tarjeta vista grid
function crearTarjetaGrid(evento, esEventoPropio = false) {
    const imagenUrl = evento.imagenUrl || `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=250&fit=crop&q=80`;
    const disponibles = evento.capacidad - evento.entradasVendidas;
    const porcentajeVendido = Math.round((evento.entradasVendidas / evento.capacidad) * 100);
    
    // Badge especial para eventos propios
    const badgePropio = esEventoPropio ? `
        <span class="badge bg-success position-absolute top-0 end-0 m-2" style="z-index: 10;">
            <i class="bi bi-person-badge"></i> Tu Evento
        </span>
    ` : '';
    
    // Botón diferente para eventos propios
    const botonAccion = esEventoPropio ? `
        <div class="d-grid gap-2">
            <a href="editar-evento.html?id=${evento.id}" 
                class="btn btn-outline-primary fw-semibold">
                <i class="bi bi-pencil"></i> Editar Evento
            </a>
            <a href="evento-detalle.html?id=${evento.id}" 
                class="btn btn-sm btn-outline-secondary">
                <i class="bi bi-eye"></i> Ver Detalles
            </a>
        </div>
    ` : `
        <a href="evento-detalle.html?id=${evento.id}" 
            class="btn w-100 text-white fw-semibold" 
            style="background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%); border: none; padding: 12px;">
            Ver Detalles
        </a>
    `;
    
    return `
        <div class="col-lg-4 col-md-6">
            <div class="card h-100 border-0 shadow-sm position-relative">
                ${badgePropio}
                <img src="${imagenUrl}" class="card-img-top" alt="${evento.titulo}" 
                     style="height: 200px; object-fit: cover;">
                <div class="card-body d-flex flex-column p-4">
                    <div class="mb-2">
                        <span class="badge text-white px-3 py-2" style="background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);">
                            ${evento.categoria.icono} ${evento.categoria.nombre}
                        </span>
                    </div>
                    
                    <h5 class="card-title fw-bold mb-3" style="color: #2d3748; font-size: 1.25rem;">
                        ${evento.titulo}
                    </h5>
                    
                    <p class="card-text text-muted mb-4" style="font-size: 0.9rem; line-height: 1.6;">
                        ${evento.descripcion ? evento.descripcion.substring(0, 100) + '...' : 'Sin descripción disponible'}
                    </p>
                    
                    <div class="mt-auto">
                        <div class="d-flex align-items-center mb-2 text-muted" style="font-size: 0.875rem;">
                            <i class="bi bi-calendar-event me-2 text-primary"></i>
                            <span>${formatearFechaCorta(evento.fechaEvento)}</span>
                        </div>
                        
                        <div class="d-flex align-items-center mb-3 text-muted" style="font-size: 0.875rem;">
                            <i class="bi bi-geo-alt me-2 text-primary"></i>
                            <span>${evento.lugar}</span>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center pt-3 border-top">
                            <div>
                                <span class="fw-bold text-success" style="font-size: 1.5rem;">
                                    ${formatearPrecio(evento.precio)}
                                </span>
                            </div>
                            <div class="text-end">
                                <small class="text-muted d-block">Disponibles</small>
                                <span class="fw-bold text-primary">${disponibles}/${evento.capacidad}</span>
                            </div>
                        </div>
                        
                        ${botonAccion}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Crear tarjeta vista lista
function crearTarjetaLista(evento) {
    const imagenUrl = evento.imagenUrl || `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=150&fit=crop&q=80`;
    const disponibles = evento.capacidad - evento.entradasVendidas;
    
    return `
        <div class="col-12">
            <div class="card border-0 shadow-sm mb-3">
                <div class="card-body p-3">
                    <div class="row align-items-center">
                        <div class="col-md-2 col-sm-3">
                            <img src="${imagenUrl}" class="img-fluid rounded" alt="${evento.titulo}" 
                                 style="height: 100px; width: 100%; object-fit: cover;">
                        </div>
                        <div class="col-md-6 col-sm-9 mt-3 mt-sm-0">
                            <span class="badge mb-2 text-white" style="background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);">
                                ${evento.categoria.icono} ${evento.categoria.nombre}
                            </span>
                            <h5 class="mb-2 fw-bold" style="color: #2d3748;">${evento.titulo}</h5>
                            <p class="text-muted mb-2" style="font-size: 0.875rem;">
                                ${evento.descripcion ? evento.descripcion.substring(0, 120) + '...' : 'Sin descripción'}
                            </p>
                            <div class="d-flex gap-3 flex-wrap">
                                <small class="text-muted">
                                    <i class="bi bi-calendar-event text-primary"></i> ${formatearFechaCorta(evento.fechaEvento)}
                                </small>
                                <small class="text-muted">
                                    <i class="bi bi-geo-alt text-primary"></i> ${evento.lugar}
                                </small>
                            </div>
                        </div>
                        <div class="col-md-2 col-6 mt-3 mt-md-0 text-center">
                            <div class="mb-2">
                                <strong class="text-success" style="font-size: 1.5rem;">${formatearPrecio(evento.precio)}</strong>
                            </div>
                            <small class="text-muted d-block">
                                <i class="bi bi-people-fill"></i> ${disponibles} disponibles
                            </small>
                        </div>
                        <div class="col-md-2 col-6 mt-3 mt-md-0 text-center">
                                     <a href="evento-detalle.html?id=${evento.id}" 
                                         class="btn text-white fw-semibold" 
                                         style="background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%); border: none; width: 100%;">
                                Ver Detalles
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

// Formatear fecha corta
function formatearFechaCorta(fecha) {
    const f = new Date(fecha);
    const opciones = { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    };
    return f.toLocaleDateString('es-ES', opciones);
}

// Formatear precio
function formatearPrecio(precio) {
    if (precio === 0) return 'GRATIS';
    return `$${precio.toFixed(2)}`;
}

// Actualizar estadísticas (versión compacta)
function actualizarEstadisticas() {
    try {
        const totalEventos = todosLosEventos.length;
        const totalCategorias = categorias.length;
        
        const elem1 = document.getElementById('totalEventos');
        const elem2 = document.getElementById('totalCategorias');
        
        if (elem1) elem1.textContent = totalEventos;
        if (elem2) elem2.textContent = totalCategorias;
    } catch (error) {
        console.error('❌ Error al actualizar estadísticas:', error);
    }
}

// Actualizar contador de eventos mostrados
function actualizarContadorFiltrados() {
    try {
        const elem = document.getElementById('eventosMostrados');
        if (elem) {
            // Si el usuario no está logueado y hay más de 6, mostrar "6 de X"
            if (!isUsuarioLogueado && eventosFiltrados.length > 6) {
                elem.textContent = `6 de ${eventosFiltrados.length}`;
            } else {
                elem.textContent = eventosFiltrados.length;
            }
        }
    } catch (error) {
        console.error('❌ Error al actualizar contador:', error);
    }
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

// Cargar eventos del usuario logueado
async function cargarMisEventos() {
    const usuario = Utils.obtenerUsuarioLocal();
    if (!usuario) return;
    
    try {
        const response = await fetch(`${Utils.getApiUrl()}/api/eventos/usuario/${usuario.id}`);
        if (!response.ok) throw new Error('Error al cargar mis eventos');
        
        const misEventos = await response.json();
        const container = document.getElementById('misEventosGrid');
        
        if (misEventos.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle"></i> 
                        Aún no has creado ningún evento. 
                        <a href="crear-evento.html" class="alert-link">¡Crea tu primer evento aquí!</a>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = misEventos.map(evento => crearTarjetaGrid(evento, true)).join('');
    } catch (error) {
        console.error('Error al cargar mis eventos:', error);
    }
}

// CSS para las tarjetas (estáticas, paleta azul sutil)
const style = document.createElement('style');
style.textContent = `
    .card {
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 6px 18px rgba(44,62,80,0.06) !important;
    }

    /* Evitar transform en hover para mantener tarjetas estáticas */
    .card:hover {
        transform: none !important;
        box-shadow: 0 6px 18px rgba(44,62,80,0.06) !important;
    }

    .card img {
        transition: none;
    }
`;
document.head.appendChild(style);
