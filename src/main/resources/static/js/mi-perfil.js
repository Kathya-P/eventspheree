// Verificar sesión
const usuario = Utils.verificarSesion();

// Cargar información del usuario
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('username').textContent = usuario.username;
    document.getElementById('email').textContent = usuario.email;
    document.getElementById('rol').textContent = usuario.rol;
    
    cargarBoletos();
    cargarMisEventos();
});

// Cargar boletos del usuario
async function cargarBoletos() {
    const container = document.getElementById('boletosContainer');
    container.innerHTML = '<p class="text-muted">Cargando boletos...</p>';
    
    // TODO: Implementar cuando exista el endpoint de boletos por usuario
    setTimeout(() => {
        container.innerHTML = `
            <div class="alert alert-info">
                Funcionalidad de boletos en desarrollo.
                Se mostrará el historial de compras aquí.
            </div>
        `;
    }, 500);
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
    alert('Funcionalidad de edición en desarrollo');
    // TODO: Implementar página de edición
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
