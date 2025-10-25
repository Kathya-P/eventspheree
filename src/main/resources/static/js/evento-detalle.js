// Obtener ID del evento de la URL
const urlParams = new URLSearchParams(window.location.search);
const eventoId = urlParams.get('id');

let eventoActual = null;

// Cargar evento al iniciar
document.addEventListener('DOMContentLoaded', () => {
    if (eventoId) {
        cargarEvento();
    } else {
        alert('No se especificó un evento');
        window.location.href = 'index.html';
    }
});

// Cargar detalles del evento
async function cargarEvento() {
    try {
        eventoActual = await EventoAPI.buscarPorId(eventoId);
        mostrarEvento(eventoActual);
        cargarResenas(); // Cargar reseñas del evento
        cargarMensajes(); // Cargar mensajes del chat
    } catch (error) {
        console.error('Error al cargar evento:', error);
        alert('Error al cargar el evento');
        window.location.href = 'index.html';
    }
}

// Mostrar información del evento
function mostrarEvento(evento) {
    document.getElementById('loadingSpinner').classList.add('d-none');
    document.getElementById('eventoContainer').classList.remove('d-none');
    
    // Si hay imagen, usar la subida; si no, usar placeholder según categoría
    const imagenUrl = evento.imagenUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=400&fit=crop';
    const disponibles = evento.capacidad - evento.entradasVendidas;
    
    document.getElementById('eventoImagen').src = imagenUrl;
    document.getElementById('eventoTitulo').textContent = evento.titulo;
    document.getElementById('eventoDescripcion').textContent = evento.descripcion || 'Sin descripción';
    document.getElementById('eventoFecha').textContent = Utils.formatearFecha(evento.fechaEvento);
    document.getElementById('eventoLugar').textContent = evento.lugar;
    document.getElementById('eventoDireccion').textContent = evento.direccion || 'No especificada';
    document.getElementById('eventoPrecio').textContent = Utils.formatearPrecio(evento.precio);
    document.getElementById('eventoDisponibilidad').innerHTML = `
        <span class="text-success fw-bold">${disponibles}</span> de ${evento.capacidad} disponibles
    `;
    
    document.title = `${evento.titulo} - EventSphere`;
}

// Comprar boleto
async function comprarBoleto() {
    const usuario = Utils.obtenerUsuarioLocal();
    
    if (!usuario) {
        alert('Debes iniciar sesión para comprar boletos');
        window.location.href = 'login.html';
        return;
    }
    
    if (!eventoActual) {
        alert('Error: No se ha cargado el evento');
        return;
    }
    
    const disponibles = eventoActual.capacidad - eventoActual.entradasVendidas;
    if (disponibles <= 0) {
        alert('Lo sentimos, este evento está agotado');
        return;
    }
    
    if (confirm(`¿Confirmar compra de boleto para "${eventoActual.titulo}"?\n\nPrecio: ${Utils.formatearPrecio(eventoActual.precio)}\nFecha: ${Utils.formatearFecha(eventoActual.fechaEvento)}`)) {
        try {
            const response = await BoletoAPI.comprar(usuario.id, eventoActual.id);
            
            if (response.ok) {
                const boleto = await response.json();
                alert(`¡Compra exitosa! 🎉\n\nCódigo QR: ${boleto.codigoQR}\n\nPuedes ver tu boleto en "Mi Perfil"`);
                // Recargar evento para actualizar disponibilidad
                await cargarEvento();
            } else {
                const error = await response.text();
                alert(`Error: ${error}`);
            }
        } catch (error) {
            console.error('Error al comprar boleto:', error);
            alert('Error de conexión. Intenta nuevamente.');
        }
    }
}

// Cargar reseñas
async function cargarResenas() {
    try {
        const resenas = await ResenaAPI.listarPorEvento(eventoId);
        const promedio = await ResenaAPI.obtenerPromedio(eventoId);
        
        mostrarPromedio(promedio);
        mostrarResenas(resenas);
    } catch (error) {
        console.error('Error al cargar reseñas:', error);
    }
}

// Mostrar promedio de calificación
function mostrarPromedio(data) {
    const container = document.getElementById('promedioCalificacion');
    if (!container) return;
    
    const estrellas = generarEstrellas(data.promedio);
    container.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="me-2">${estrellas}</div>
            <span class="fw-bold">${data.promedio.toFixed(1)}</span>
            <span class="text-muted ms-2">(${data.totalResenas} reseñas)</span>
        </div>
    `;
}

// Generar estrellas visuales
function generarEstrellas(promedio) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(promedio)) {
            html += '<i class="bi bi-star-fill text-warning"></i>';
        } else if (i === Math.ceil(promedio) && promedio % 1 !== 0) {
            html += '<i class="bi bi-star-half text-warning"></i>';
        } else {
            html += '<i class="bi bi-star text-warning"></i>';
        }
    }
    return html;
}

// Mostrar lista de reseñas
function mostrarResenas(resenas) {
    const container = document.getElementById('resenasContainer');
    if (!container) return;
    
    if (resenas.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="bi bi-info-circle"></i> Aún no hay reseñas para este evento.
                ¡Sé el primero en dejar tu opinión!
            </div>
        `;
        return;
    }
    
    container.innerHTML = resenas.map(resena => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="mb-1">
                            <i class="bi bi-person-circle"></i> ${resena.usuario.username}
                        </h6>
                        <div class="mb-2">${generarEstrellas(resena.calificacion)}</div>
                    </div>
                    <small class="text-muted">${Utils.formatearFecha(resena.fechaCreacion)}</small>
                </div>
                ${resena.comentario ? `<p class="mb-0 mt-2">${resena.comentario}</p>` : ''}
            </div>
        </div>
    `).join('');
}

// Form de reseña
document.getElementById('resenaForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuario = Utils.obtenerUsuarioLocal();
    if (!usuario) {
        alert('Debes iniciar sesión para dejar una reseña');
        window.location.href = 'login.html';
        return;
    }
    
    const calificacion = document.querySelector('input[name="calificacion"]:checked')?.value;
    const comentario = document.getElementById('comentarioResena').value.trim();
    
    if (!calificacion) {
        alert('Por favor selecciona una calificación');
        return;
    }
    
    try {
        const response = await ResenaAPI.crear(usuario.id, eventoId, parseInt(calificacion), comentario);
        
        if (response.ok) {
            alert('¡Reseña publicada exitosamente! 🌟');
            document.getElementById('resenaForm').reset();
            cargarResenas(); // Recargar reseñas
        } else {
            const error = await response.text();
            alert(`Error: ${error}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión. Intenta nuevamente.');
    }
});

// Cargar mensajes del chat
async function cargarMensajes() {
    try {
        const mensajes = await MensajeAPI.listarPorEvento(eventoId);
        mostrarMensajes(mensajes);
    } catch (error) {
        console.error('Error al cargar mensajes:', error);
    }
}

// Mostrar mensajes en el chat
function mostrarMensajes(mensajes) {
    const container = document.getElementById('chatContainer');
    if (!container) return;
    
    if (mensajes.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-chat-dots" style="font-size: 48px;"></i>
                <p class="mt-2">No hay mensajes aún.<br>¡Inicia la conversación!</p>
            </div>
        `;
        return;
    }
    
    const usuario = Utils.obtenerUsuarioLocal();
    
    container.innerHTML = mensajes.map(mensaje => {
        const esMio = usuario && mensaje.usuario.id === usuario.id;
        const alignClass = esMio ? 'text-end' : 'text-start';
        const bgClass = esMio ? 'bg-primary text-white' : 'bg-light';
        
        return `
            <div class="${alignClass} mb-3">
                <div class="d-inline-block ${bgClass} rounded-3 p-3 shadow-sm" style="max-width: 70%;">
                    ${!esMio ? `<div class="fw-bold small mb-1">
                        <i class="bi bi-person-circle"></i> ${mensaje.usuario.username}
                    </div>` : ''}
                    <div>${mensaje.contenido}</div>
                    <div class="small opacity-75 mt-1">
                        ${new Date(mensaje.fechaEnvio).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Scroll al final
    container.scrollTop = container.scrollHeight;
}

// Form de chat
document.getElementById('chatForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuario = Utils.obtenerUsuarioLocal();
    if (!usuario) {
        alert('Debes iniciar sesión para enviar mensajes');
        window.location.href = 'login.html';
        return;
    }
    
    const contenido = document.getElementById('mensajeTexto').value.trim();
    
    if (!contenido) {
        return;
    }
    
    try {
        const response = await MensajeAPI.enviar(usuario.id, eventoId, contenido);
        
        if (response.ok) {
            document.getElementById('mensajeTexto').value = '';
            cargarMensajes(); // Recargar mensajes
        } else {
            const error = await response.text();
            alert(`Error: ${error}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión. Intenta nuevamente.');
    }
});
