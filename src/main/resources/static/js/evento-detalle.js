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
        cargarFotos(); // Cargar galería de fotos
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
    
    // Verificar si el usuario actual es el creador del evento
    const usuario = Utils.obtenerUsuarioLocal();
    const esEventoPropio = usuario && evento.organizador && evento.organizador.id === usuario.id;
    
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
    
    // Si es evento propio, mostrar badge y deshabilitar compra
    const btnComprar = document.querySelector('[data-bs-target="#compraModal"]');
    if (esEventoPropio && btnComprar) {
        btnComprar.outerHTML = `
            <div class="alert alert-info mb-0">
                <i class="bi bi-info-circle"></i> <strong>Este es tu evento</strong><br>
                <small>No puedes comprar boletos para tu propio evento.</small>
            </div>
            <a href="editar-evento.html?id=${evento.id}" class="btn btn-outline-primary w-100 mt-2">
                <i class="bi bi-pencil"></i> Editar Evento
            </a>
        `;
    }
    
    document.title = `${evento.titulo} - EventSphere`;
}

// Abrir modal de compra cuando se abre
document.getElementById('compraModal')?.addEventListener('show.bs.modal', function(event) {
    // Verificar autenticación
    if (!Utils.requiereAutenticacion('Debes iniciar sesión para comprar boletos')) {
        event.preventDefault();
        return;
    }
    
    if (!eventoActual) {
        alert('Error: No se ha cargado el evento');
        event.preventDefault();
        return;
    }
    
    const disponibles = eventoActual.capacidad - eventoActual.entradasVendidas;
    
    if (disponibles <= 0) {
        alert('Lo sentimos, este evento está agotado');
        event.preventDefault();
        return;
    }
    
    // Llenar datos del modal
    document.getElementById('modalEventoTitulo').textContent = eventoActual.titulo;
    document.getElementById('modalEventoFecha').textContent = Utils.formatearFecha(eventoActual.fechaEvento);
    document.getElementById('modalEventoLugar').textContent = eventoActual.lugar;
    document.getElementById('modalDisponibles').textContent = disponibles;
    document.getElementById('modalPrecioUnitario').textContent = Utils.formatearPrecio(eventoActual.precio);
    
    // Configurar máximo de boletos
    const maxBoletos = Math.min(10, disponibles);
    document.getElementById('cantidadBoletos').max = maxBoletos;
    document.getElementById('cantidadBoletos').value = 1;
    
    actualizarTotal();
});

// Cambiar cantidad con botones +/-
function cambiarCantidad(delta) {
    const input = document.getElementById('cantidadBoletos');
    const valor = parseInt(input.value) + delta;
    const min = parseInt(input.min);
    const max = parseInt(input.max);
    
    if (valor >= min && valor <= max) {
        input.value = valor;
        actualizarTotal();
    }
}

// Actualizar total de la compra
function actualizarTotal() {
    const cantidad = parseInt(document.getElementById('cantidadBoletos').value) || 1;
    const precioUnitario = eventoActual.precio;
    const total = precioUnitario * cantidad;
    
    document.getElementById('modalCantidad').textContent = cantidad;
    document.getElementById('modalTotal').textContent = Utils.formatearPrecio(total);
}

// Confirmar compra de boletos
async function confirmarCompra() {
    // Verificar autenticación
    if (!Utils.requiereAutenticacion('Debes iniciar sesión para comprar boletos')) {
        return;
    }
    
    const usuario = Utils.obtenerUsuarioLocal();
    const cantidad = parseInt(document.getElementById('cantidadBoletos').value);
    const disponibles = eventoActual.capacidad - eventoActual.entradasVendidas;
    
    if (cantidad > disponibles) {
        alert(`Solo hay ${disponibles} boletos disponibles`);
        return;
    }
    
    const total = eventoActual.precio * cantidad;
    const confirmMsg = `¿Confirmar compra de ${cantidad} boleto(s)?\n\nTotal: ${Utils.formatearPrecio(total)}`;
    
    if (!confirm(confirmMsg)) {
        return;
    }
    
    try {
        // Cerrar el modal de cantidad
        const modalCantidad = bootstrap.Modal.getInstance(document.getElementById('compraModal'));
        modalCantidad.hide();
        
        // Mostrar modal de pago
        const modalPago = new ModalPago(eventoActual, usuario, cantidad);
        modalPago.mostrar();
        
    } catch (error) {
        console.error('Error al abrir modal de pago:', error);
        alert(`Error: ${error.message || 'Error al procesar la compra. Intenta nuevamente.'}`);
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
    
    // Verificar autenticación
    if (!Utils.requiereAutenticacion('Debes iniciar sesión para dejar una reseña')) {
        return;
    }
    
    const usuario = Utils.obtenerUsuarioLocal();
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
    
    // Verificar autenticación
    if (!Utils.requiereAutenticacion('Debes iniciar sesión para enviar mensajes')) {
        return;
    }
    
    const usuario = Utils.obtenerUsuarioLocal();
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

// ==================== FUNCIONALIDAD DE FOTOS ====================

// Variables para drag & drop
const dropZone = document.getElementById('dropZone');
const imagenInput = document.getElementById('imagenFoto');
const previewContainer = document.getElementById('previewContainer');
const previewImg = document.getElementById('previewFotoImg');
const btnSubirFoto = document.getElementById('btnSubirFoto');
const btnCancelarFoto = document.getElementById('btnCancelarFoto');
let archivoSeleccionado = null;

// Click en la zona de drop abre el selector de archivos
dropZone.addEventListener('click', () => {
    imagenInput.click();
});

// Prevenir comportamiento por defecto del navegador
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Efectos visuales al arrastrar
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.style.backgroundColor = '#e7f3ff';
        dropZone.style.borderColor = '#0d6efd';
    });
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.style.backgroundColor = '#f8f9fa';
        dropZone.style.borderColor = '#dee2e6';
    });
});

// Manejar el drop
dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        manejarArchivo(files[0]);
    }
});

// Manejar selección desde input
imagenInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        manejarArchivo(e.target.files[0]);
    }
});

// Procesar archivo seleccionado o arrastrado
function manejarArchivo(file) {
    // Validar tipo
    if (!file.type.startsWith('image/')) {
        alert('El archivo debe ser una imagen (JPG, PNG, GIF)');
        return;
    }
    
    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
    }
    
    archivoSeleccionado = file;
    
    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        dropZone.style.display = 'none';
        previewContainer.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Botón cancelar
btnCancelarFoto.addEventListener('click', () => {
    archivoSeleccionado = null;
    imagenInput.value = '';
    document.getElementById('descripcionFoto').value = '';
    previewContainer.style.display = 'none';
    dropZone.style.display = 'block';
});

// Subir foto
btnSubirFoto.addEventListener('click', async () => {
    // Verificar autenticación
    if (!Utils.requiereAutenticacion('Debes iniciar sesión para subir fotos')) {
        return;
    }
    
    if (!archivoSeleccionado) {
        alert('Por favor selecciona una imagen');
        return;
    }
    
    const usuario = Utils.obtenerUsuarioLocal();
    const descripcion = document.getElementById('descripcionFoto').value;
    
    try {
        btnSubirFoto.disabled = true;
        btnSubirFoto.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Subiendo...';
        
        const foto = await FotoAPI.subir(usuario.id, eventoId, archivoSeleccionado, descripcion);
        
        if (foto.id) {
            alert('¡Foto subida exitosamente! 📸');
            
            // Reset
            archivoSeleccionado = null;
            imagenInput.value = '';
            document.getElementById('descripcionFoto').value = '';
            previewContainer.style.display = 'none';
            dropZone.style.display = 'block';
            
            // Recargar galería
            cargarFotos();
        } else if (foto.error) {
            alert(foto.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al subir la foto. Intenta nuevamente.');
    } finally {
        btnSubirFoto.disabled = false;
        btnSubirFoto.innerHTML = '<i class="bi bi-upload"></i> Subir Foto';
    }
});

// Cargar galería de fotos
async function cargarFotos() {
    try {
        const fotos = await FotoAPI.listarPorEvento(eventoId);
        const cantidad = await FotoAPI.contarPorEvento(eventoId);
        
        document.getElementById('contadorFotos').textContent = cantidad.cantidad;
        mostrarFotos(fotos);
    } catch (error) {
        console.error('Error al cargar fotos:', error);
        document.getElementById('fotosContainer').innerHTML = `
            <p class="text-danger">Error al cargar las fotos</p>
        `;
    }
}

// Mostrar fotos en galería
function mostrarFotos(fotos) {
    const container = document.getElementById('fotosContainer');
    
    if (!fotos || fotos.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted py-5">
                <i class="bi bi-images" style="font-size: 48px;"></i>
                <p class="mt-2">No hay fotos aún.<br>¡Sé el primero en compartir!</p>
            </div>
        `;
        return;
    }
    
    const usuario = Utils.obtenerUsuarioLocal();
    
    container.innerHTML = fotos.map(foto => `
        <div class="col-md-4 col-sm-6">
            <div class="card h-100 shadow-sm">
                <img src="${foto.url}" class="card-img-top" style="height: 250px; object-fit: cover; cursor: pointer;" 
                     onclick="verFotoModal(${foto.id}, '${foto.url}', '${foto.descripcion || ''}', '${foto.usuario.username}', '${Utils.formatearFecha(foto.fechaSubida)}', ${usuario && usuario.id === foto.usuario.id})">
                <div class="card-body p-2">
                    <p class="small mb-1">
                        <i class="bi bi-person-circle"></i> ${foto.usuario.username}
                    </p>
                    ${foto.descripcion ? `<p class="small text-muted mb-1">${foto.descripcion}</p>` : ''}
                    <p class="small text-muted mb-0">
                        <i class="bi bi-clock"></i> ${new Date(foto.fechaSubida).toLocaleDateString('es-ES')}
                    </p>
                </div>
            </div>
        </div>
    `).join('');
}

// Ver foto en modal
function verFotoModal(id, url, descripcion, username, fecha, esMia) {
    document.getElementById('fotoModalImg').src = url;
    document.getElementById('fotoModalDescripcion').textContent = descripcion || 'Sin descripción';
    document.getElementById('fotoModalInfo').innerHTML = `
        Subida por <strong>${username}</strong> el ${fecha}
    `;
    
    const btnEliminar = document.getElementById('btnEliminarFoto');
    if (esMia) {
        btnEliminar.style.display = 'block';
        btnEliminar.onclick = () => eliminarFoto(id);
    } else {
        btnEliminar.style.display = 'none';
    }
    
    const modal = new bootstrap.Modal(document.getElementById('fotoModal'));
    modal.show();
}

// Eliminar foto
async function eliminarFoto(id) {
    // Verificar autenticación
    if (!Utils.requiereAutenticacion('Debes iniciar sesión para eliminar fotos')) {
        return;
    }
    
    if (!confirm('¿Estás seguro de que deseas eliminar esta foto?')) {
        return;
    }
    
    try {
        const response = await FotoAPI.eliminar(id);
        
        if (response.mensaje) {
            alert('Foto eliminada exitosamente');
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('fotoModal'));
            modal.hide();
            
            // Recargar galería
            cargarFotos();
        } else if (response.error) {
            alert(response.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar la foto');
    }
}
