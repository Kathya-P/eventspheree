// Verificar sesión
const usuario = Utils.verificarSesion();

// Obtener ID del evento de la URL
const urlParams = new URLSearchParams(window.location.search);
const eventoId = urlParams.get('id');

if (!eventoId) {
    alert('ID de evento no especificado');
    window.location.href = 'mi-perfil.html';
}

let eventoActual = null;

// Cargar evento y categorías al iniciar
document.addEventListener('DOMContentLoaded', async () => {
    await cargarCategorias();
    await cargarEvento();
    configurarDragAndDrop();
});

// Configurar Drag & Drop para imagen
function configurarDragAndDrop() {
    const dropZone = document.getElementById('dropZoneEditar');
    const imagenInput = document.getElementById('imagen');
    
    // Click en la zona abre el selector
    dropZone.addEventListener('click', () => {
        imagenInput.click();
    });
    
    // Prevenir comportamiento por defecto
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
            imagenInput.files = files;
            manejarArchivo(files[0]);
        }
    });
    
    // Manejar selección desde input
    imagenInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            manejarArchivo(e.target.files[0]);
        }
    });
    
    // Procesar archivo
    function manejarArchivo(file) {
        // Validar tipo
        if (!file.type.startsWith('image/')) {
            alert('El archivo debe ser una imagen (JPG, PNG, GIF)');
            imagenInput.value = '';
            return;
        }
        
        // Validar tamaño (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen no debe superar los 5MB');
            imagenInput.value = '';
            return;
        }
        
        // Mostrar preview de la nueva imagen
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('imagenPreview').innerHTML = `
                <div class="position-relative">
                    <img src="${e.target.result}" alt="Nueva imagen" class="img-fluid rounded shadow-sm" style="max-height: 300px;">
                    <button type="button" class="btn btn-sm btn-outline-secondary mt-2" onclick="cancelarNuevaImagen()">
                        <i class="bi bi-x-circle"></i> Cancelar
                    </button>
                </div>
            `;
            dropZone.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// Función para cancelar la nueva imagen y volver a la original
function cancelarNuevaImagen() {
    document.getElementById('imagen').value = '';
    document.getElementById('dropZoneEditar').style.display = 'block';
    
    // Restaurar imagen original si existe
    if (eventoActual && eventoActual.imagenUrl) {
        document.getElementById('imagenPreview').innerHTML = `
            <div class="alert alert-info">
                <strong>Imagen actual:</strong><br>
                <img src="${eventoActual.imagenUrl}" alt="Imagen del evento" class="img-thumbnail mt-2" style="max-width: 200px;">
                <p class="mt-2 mb-0"><small>Sube una nueva imagen si deseas cambiarla</small></p>
            </div>
        `;
    } else {
        document.getElementById('imagenPreview').innerHTML = '';
    }
}

// Cargar categorías
async function cargarCategorias() {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias`);
        const categorias = await response.json();
        
        const select = document.getElementById('categoria');
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

// Cargar datos del evento
async function cargarEvento() {
    try {
        eventoActual = await EventoAPI.buscarPorId(eventoId);
        
        // Verificar que el usuario sea el organizador
        if (eventoActual.organizador.id !== usuario.id) {
            alert('No tienes permiso para editar este evento');
            window.location.href = 'mi-perfil.html';
            return;
        }
        
        // Llenar el formulario con los datos actuales
        document.getElementById('titulo').value = eventoActual.titulo;
        document.getElementById('descripcion').value = eventoActual.descripcion;
        document.getElementById('categoria').value = eventoActual.categoria.id;
        
        // Formatear la fecha para datetime-local
        const fechaEvento = new Date(eventoActual.fechaEvento);
        const fechaFormateada = fechaEvento.toISOString().slice(0, 16);
        document.getElementById('fechaEvento').value = fechaFormateada;
        
        document.getElementById('lugar').value = eventoActual.lugar;
        document.getElementById('capacidad').value = eventoActual.capacidad;
        document.getElementById('precio').value = eventoActual.precio;
        document.getElementById('estado').value = eventoActual.estado;
        
        // Bloquear capacidad si hay boletos vendidos
        const capacidadInput = document.getElementById('capacidad');
        if (eventoActual.entradasVendidas > 0) {
            capacidadInput.min = eventoActual.entradasVendidas;
            capacidadInput.title = `Ya hay ${eventoActual.entradasVendidas} boletos vendidos. La capacidad no puede ser menor.`;
            
            // Agregar mensaje informativo
            const capacidadDiv = capacidadInput.parentElement;
            const existingHelp = capacidadDiv.querySelector('.form-text');
            if (!existingHelp) {
                const helpText = document.createElement('div');
                helpText.className = 'form-text text-warning';
                helpText.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> Ya hay ${eventoActual.entradasVendidas} boletos vendidos`;
                capacidadDiv.appendChild(helpText);
            }
        }
        
        // Mostrar imagen actual si existe
        if (eventoActual.imagenUrl) {
            document.getElementById('imagenPreview').innerHTML = `
                <div class="alert alert-info">
                    <strong>Imagen actual:</strong><br>
                    <img src="${eventoActual.imagenUrl}" alt="Imagen del evento" class="img-thumbnail mt-2" style="max-width: 200px;">
                    <p class="mt-2 mb-0"><small>Sube una nueva imagen si deseas cambiarla</small></p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error al cargar evento:', error);
        Utils.mostrarAlerta('alertContainer', 'Error al cargar el evento', 'danger');
    }
}

// Manejar envío del formulario
document.getElementById('editarEventoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validar capacidad
    const nuevaCapacidad = parseInt(document.getElementById('capacidad').value);
    if (nuevaCapacidad < eventoActual.entradasVendidas) {
        Utils.mostrarAlerta('alertContainer', 
            `La capacidad no puede ser menor a las entradas ya vendidas (${eventoActual.entradasVendidas})`, 
            'danger');
        return;
    }
    
    // Verificar si hay una nueva imagen
    const imagenInput = document.getElementById('imagen');
    const tieneNuevaImagen = imagenInput.files && imagenInput.files.length > 0;
    
    if (tieneNuevaImagen) {
        // Si hay nueva imagen, usar FormData para enviar con archivo
        const formData = new FormData();
        formData.append('titulo', document.getElementById('titulo').value.trim());
        formData.append('descripcion', document.getElementById('descripcion').value.trim());
        formData.append('fechaEvento', document.getElementById('fechaEvento').value);
        formData.append('lugar', document.getElementById('lugar').value.trim());
        formData.append('direccion', eventoActual.direccion || '');
        formData.append('capacidad', nuevaCapacidad);
        formData.append('precio', eventoActual.precio); // Usar precio original (campo bloqueado)
        formData.append('estado', document.getElementById('estado').value);
        formData.append('organizadorId', eventoActual.organizador.id);
        formData.append('categoriaId', parseInt(document.getElementById('categoria').value));
        formData.append('imagen', imagenInput.files[0]);
        
        try {
            const response = await fetch(`${API_BASE_URL}/eventos/actualizar-con-imagen/${eventoId}`, {
                method: 'PUT',
                body: formData
            });
            
            if (response.ok) {
                Utils.mostrarAlerta('alertContainer', 
                    '¡Evento actualizado correctamente! Redirigiendo...', 
                    'success');
                setTimeout(() => {
                    window.location.href = 'mi-perfil.html';
                }, 1500);
            } else {
                const error = await response.text();
                Utils.mostrarAlerta('alertContainer', `Error: ${error}`, 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            Utils.mostrarAlerta('alertContainer', 
                'Error de conexión. Intenta nuevamente.', 
                'danger');
        }
    } else {
        // Si no hay nueva imagen, usar JSON normal
        const eventoActualizado = {
            titulo: document.getElementById('titulo').value.trim(),
            descripcion: document.getElementById('descripcion').value.trim(),
            categoria: {
                id: parseInt(document.getElementById('categoria').value)
            },
            fechaEvento: document.getElementById('fechaEvento').value,
            lugar: document.getElementById('lugar').value.trim(),
            direccion: eventoActual.direccion,
            capacidad: nuevaCapacidad,
            precio: eventoActual.precio, // Usar precio original (campo bloqueado)
            estado: document.getElementById('estado').value,
            imagenUrl: eventoActual.imagenUrl,
            organizador: eventoActual.organizador,
            entradasVendidas: eventoActual.entradasVendidas,
            fechaCreacion: eventoActual.fechaCreacion
        };
        
        try {
            const response = await EventoAPI.actualizar(eventoId, eventoActualizado);
            
            if (response.ok) {
                Utils.mostrarAlerta('alertContainer', 
                    '¡Evento actualizado correctamente! Redirigiendo...', 
                    'success');
                setTimeout(() => {
                    window.location.href = 'mi-perfil.html';
                }, 1500);
            } else {
                const error = await response.text();
                Utils.mostrarAlerta('alertContainer', `Error: ${error}`, 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            Utils.mostrarAlerta('alertContainer', 
                'Error de conexión. Intenta nuevamente.', 
                'danger');
        }
    }
});
