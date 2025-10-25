// Cargar eventos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarEventosProximos();
});

// Cargar eventos próximos
async function cargarEventosProximos() {
    mostrarSpinner(true);
    try {
        const eventos = await EventoAPI.listarProximos();
        mostrarEventos(eventos);
    } catch (error) {
        console.error('Error al cargar eventos:', error);
        mostrarNoEventos();
    } finally {
        mostrarSpinner(false);
    }
}

// Cargar todos los eventos
async function cargarEventos() {
    mostrarSpinner(true);
    try {
        const eventos = await EventoAPI.listar();
        mostrarEventos(eventos);
    } catch (error) {
        console.error('Error al cargar eventos:', error);
        mostrarNoEventos();
    } finally {
        mostrarSpinner(false);
    }
}

// Buscar eventos por título
async function buscarEventos() {
    const keyword = document.getElementById('searchInput').value.trim();
    if (!keyword) {
        cargarEventosProximos();
        return;
    }
    
    mostrarSpinner(true);
    try {
        const eventos = await EventoAPI.buscarPorTitulo(keyword);
        mostrarEventos(eventos);
    } catch (error) {
        console.error('Error al buscar eventos:', error);
        mostrarNoEventos();
    } finally {
        mostrarSpinner(false);
    }
}

// Mostrar eventos en el grid
function mostrarEventos(eventos) {
    const container = document.getElementById('eventosContainer');
    const noEventosMsg = document.getElementById('noEventosMsg');
    
    if (!eventos || eventos.length === 0) {
        mostrarNoEventos();
        return;
    }
    
    noEventosMsg.classList.add('d-none');
    container.innerHTML = eventos.map(evento => crearTarjetaEvento(evento)).join('');
}

// Crear tarjeta de evento
function crearTarjetaEvento(evento) {
    const imagenUrl = evento.imagenUrl || 'https://via.placeholder.com/400x250?text=Evento';
    const disponibles = evento.capacidad - evento.entradasVendidas;
    const porcentajeVendido = (evento.entradasVendidas / evento.capacidad) * 100;
    
    return `
        <div class="col-md-4">
            <div class="card h-100 shadow-sm evento-card">
                <img src="${imagenUrl}" class="card-img-top" alt="${evento.titulo}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${evento.titulo}</h5>
                    <p class="card-text text-muted small">${evento.descripcion ? evento.descripcion.substring(0, 100) + '...' : ''}</p>
                    
                    <div class="mb-2">
                        <i class="bi bi-calendar3 text-primary"></i>
                        <small>${Utils.formatearFecha(evento.fechaEvento)}</small>
                    </div>
                    
                    <div class="mb-2">
                        <i class="bi bi-geo-alt text-primary"></i>
                        <small>${evento.lugar}</small>
                    </div>
                    
                    <div class="mb-2">
                        <span class="badge bg-success">${Utils.formatearPrecio(evento.precio)}</span>
                        <span class="badge bg-info">${disponibles} disponibles</span>
                    </div>
                    
                    <div class="progress mb-3" style="height: 5px;">
                        <div class="progress-bar bg-primary" role="progressbar" style="width: ${porcentajeVendido}%"></div>
                    </div>
                </div>
                <div class="card-footer bg-white">
                    <a href="evento-detalle.html?id=${evento.id}" class="btn btn-primary w-100">
                        Ver Detalles <i class="bi bi-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Mostrar/ocultar spinner
function mostrarSpinner(mostrar) {
    const spinner = document.getElementById('loadingSpinner');
    if (mostrar) {
        spinner.classList.remove('d-none');
    } else {
        spinner.classList.add('d-none');
    }
}

// Mostrar mensaje de no eventos
function mostrarNoEventos() {
    const container = document.getElementById('eventosContainer');
    const noEventosMsg = document.getElementById('noEventosMsg');
    container.innerHTML = '';
    noEventosMsg.classList.remove('d-none');
}

// Enter en el input de búsqueda
document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        buscarEventos();
    }
});
