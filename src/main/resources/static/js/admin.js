// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();
    cargarEstadisticas();
    
    // Cargar datos cuando se cambia de tab
    document.querySelectorAll('a[data-bs-toggle="list"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', (e) => {
            const target = e.target.getAttribute('href').substring(1);
            
            switch(target) {
                case 'usuarios':
                    cargarUsuarios();
                    break;
                case 'eventos':
                    cargarEventos();
                    break;
                case 'boletos':
                    cargarBoletos();
                    break;
                case 'categorias':
                    cargarCategorias();
                    break;
                case 'resenas':
                    cargarResenas();
                    break;
                case 'estadisticas':
                    cargarEstadisticas();
                    break;
            }
        });
    });
});

// Cargar usuarios
async function cargarUsuarios() {
    try {
        const usuarios = await UsuarioAPI.listar();
        const tbody = document.getElementById('tablaUsuarios');
        
        if (usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay usuarios registrados</td></tr>';
            return;
        }
        
        tbody.innerHTML = usuarios.map(u => `
            <tr>
                <td>${u.id}</td>
                <td>${u.nombre || '-'}</td>
                <td><strong>${u.username}</strong></td>
                <td>${u.email}</td>
                <td><span class="badge bg-${u.rol === 'ADMIN' ? 'danger' : 'primary'}">${u.rol}</span></td>
                <td>${u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString() : '-'}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        document.getElementById('tablaUsuarios').innerHTML = 
            '<tr><td colspan="6" class="text-center text-danger">Error al cargar datos</td></tr>';
    }
}

// Cargar eventos
async function cargarEventos() {
    try {
        const eventos = await EventoAPI.listar();
        const tbody = document.getElementById('tablaEventos');
        
        if (eventos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No hay eventos creados</td></tr>';
            return;
        }
        
        tbody.innerHTML = eventos.map(e => {
            const disponibles = e.capacidad - e.entradasVendidas;
            const porcentaje = (e.entradasVendidas / e.capacidad * 100).toFixed(1);
            
            return `
                <tr>
                    <td>${e.id}</td>
                    <td><strong>${e.titulo}</strong></td>
                    <td>${new Date(e.fechaEvento).toLocaleDateString()}</td>
                    <td>${e.lugar}</td>
                    <td>$${e.precio}</td>
                    <td>${e.capacidad}</td>
                    <td>
                        <span class="badge bg-${e.entradasVendidas === e.capacidad ? 'danger' : 'success'}">
                            ${e.entradasVendidas} (${porcentaje}%)
                        </span>
                    </td>
                    <td>
                        <span class="badge bg-${
                            e.estado === 'ACTIVO' ? 'success' : 
                            e.estado === 'CANCELADO' ? 'danger' : 'secondary'
                        }">${e.estado}</span>
                    </td>
                    <td>${e.organizador?.username || '-'}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error al cargar eventos:', error);
        document.getElementById('tablaEventos').innerHTML = 
            '<tr><td colspan="9" class="text-center text-danger">Error al cargar datos</td></tr>';
    }
}

// Cargar boletos
async function cargarBoletos() {
    try {
        // Obtener todos los eventos primero para mostrar nombres
        const eventos = await EventoAPI.listar();
        const usuarios = await UsuarioAPI.listar();
        
        // Recolectar todos los boletos de todos los eventos
        const todosLosBoletos = [];
        for (const evento of eventos) {
            try {
                const boletos = await BoletoAPI.listarPorEvento(evento.id);
                todosLosBoletos.push(...boletos.map(b => ({
                    ...b,
                    eventoNombre: evento.titulo
                })));
            } catch (err) {
                console.log(`No hay boletos para evento ${evento.id}`);
            }
        }
        
        const tbody = document.getElementById('tablaBoletos');
        
        if (todosLosBoletos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay boletos vendidos</td></tr>';
            return;
        }
        
        tbody.innerHTML = todosLosBoletos.map(b => {
            const usuario = usuarios.find(u => u.id === b.usuario?.id);
            
            return `
                <tr>
                    <td>${b.id}</td>
                    <td>${usuario?.username || b.usuario?.username || 'Usuario ' + b.usuario?.id}</td>
                    <td><strong>${b.eventoNombre || 'Evento ' + b.evento?.id}</strong></td>
                    <td><code>${b.codigoQR}</code></td>
                    <td>
                        <span class="badge bg-${b.usado ? 'secondary' : 'success'}">
                            ${b.usado ? 'Usado' : 'Válido'}
                        </span>
                    </td>
                    <td>${new Date(b.fechaCompra).toLocaleDateString()}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error al cargar boletos:', error);
        document.getElementById('tablaBoletos').innerHTML = 
            '<tr><td colspan="6" class="text-center text-danger">Error al cargar datos</td></tr>';
    }
}

// Cargar categorías
async function cargarCategorias() {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias`);
        const categorias = await response.json();
        const tbody = document.getElementById('tablaCategorias');
        
        if (categorias.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No hay categorías</td></tr>';
            return;
        }
        
        tbody.innerHTML = categorias.map(c => `
            <tr>
                <td>${c.id}</td>
                <td><strong>${c.nombre}</strong></td>
                <td>${c.descripcion || '-'}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        document.getElementById('tablaCategorias').innerHTML = 
            '<tr><td colspan="3" class="text-center text-danger">Error al cargar datos</td></tr>';
    }
}

// Cargar reseñas
async function cargarResenas() {
    try {
        const eventos = await EventoAPI.listar();
        const container = document.getElementById('resenasContainer');
        
        if (eventos.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No hay eventos con reseñas</p>';
            return;
        }
        
        let todasResenas = [];
        for (const evento of eventos) {
            try {
                const resenas = await ResenaAPI.listarPorEvento(evento.id);
                todasResenas.push(...resenas.map(r => ({
                    ...r,
                    eventoNombre: evento.titulo
                })));
            } catch (err) {
                console.log(`No hay reseñas para evento ${evento.id}`);
            }
        }
        
        if (todasResenas.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No hay reseñas aún</p>';
            return;
        }
        
        container.innerHTML = todasResenas.map(r => `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1">${r.usuario?.username || 'Usuario'}</h6>
                            <p class="text-muted small mb-2">
                                <strong>${r.eventoNombre}</strong> • 
                                ${new Date(r.fechaResena).toLocaleDateString()}
                            </p>
                        </div>
                        <div class="text-warning">
                            ${'★'.repeat(r.calificacion)}${'☆'.repeat(5 - r.calificacion)}
                        </div>
                    </div>
                    ${r.comentario ? `<p class="mb-0">${r.comentario}</p>` : '<p class="text-muted mb-0 fst-italic">Sin comentario</p>'}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error al cargar reseñas:', error);
        document.getElementById('resenasContainer').innerHTML = 
            '<p class="text-center text-danger">Error al cargar datos</p>';
    }
}

// Cargar estadísticas
async function cargarEstadisticas() {
    try {
        const usuarios = await UsuarioAPI.listar();
        const eventos = await EventoAPI.listar();
        
        // Contar boletos totales
        let totalBoletos = 0;
        let ingresosTotales = 0;
        
        for (const evento of eventos) {
            totalBoletos += evento.entradasVendidas || 0;
            ingresosTotales += (evento.entradasVendidas || 0) * parseFloat(evento.precio);
        }
        
        // Actualizar tarjetas
        document.getElementById('totalUsuarios').textContent = usuarios.length;
        document.getElementById('totalEventos').textContent = eventos.length;
        document.getElementById('totalBoletos').textContent = totalBoletos;
        document.getElementById('totalIngresos').textContent = Utils.formatearPrecio(ingresosTotales);
        
        // Eventos más populares (por entradas vendidas)
        const eventosOrdenados = [...eventos]
            .filter(e => e.entradasVendidas > 0)
            .sort((a, b) => b.entradasVendidas - a.entradasVendidas)
            .slice(0, 5);
        
        const container = document.getElementById('eventosPopulares');
        
        if (eventosOrdenados.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay eventos con ventas aún</p>';
            return;
        }
        
        container.innerHTML = `
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Evento</th>
                        <th>Entradas Vendidas</th>
                        <th>Ingresos</th>
                        <th>Ocupación</th>
                    </tr>
                </thead>
                <tbody>
                    ${eventosOrdenados.map(e => {
                        const porcentaje = (e.entradasVendidas / e.capacidad * 100).toFixed(1);
                        const ingresos = e.entradasVendidas * parseFloat(e.precio);
                        
                        return `
                            <tr>
                                <td><strong>${e.titulo}</strong></td>
                                <td>${e.entradasVendidas} / ${e.capacidad}</td>
                                <td>${Utils.formatearPrecio(ingresos)}</td>
                                <td>
                                    <div class="progress" style="height: 20px;">
                                        <div class="progress-bar bg-success" role="progressbar" 
                                             style="width: ${porcentaje}%" 
                                             aria-valuenow="${porcentaje}" 
                                             aria-valuemin="0" 
                                             aria-valuemax="100">
                                            ${porcentaje}%
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}
