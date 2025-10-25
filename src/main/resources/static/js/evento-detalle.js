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
    
    const imagenUrl = evento.imagenUrl || 'https://via.placeholder.com/800x400?text=Evento';
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
    
    if (confirm(`¿Confirmar compra de boleto para "${eventoActual.titulo}"?\nPrecio: ${Utils.formatearPrecio(eventoActual.precio)}`)) {
        alert('Funcionalidad de compra en desarrollo. Se integrará con el BoletoService.');
        // TODO: Implementar llamada a BoletoAPI cuando esté disponible el endpoint de compra
    }
}

// Form de reseña
document.getElementById('resenaForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Funcionalidad de reseñas en desarrollo');
    // TODO: Implementar cuando exista el endpoint de reseñas
});

// Form de chat
document.getElementById('chatForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Funcionalidad de chat en desarrollo');
    // TODO: Implementar cuando exista el endpoint de mensajes
});
