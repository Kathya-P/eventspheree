// Verificar sesión
const usuario = Utils.verificarSesion();

// Cargar categorías al iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarCategorias();
    configurarDragAndDrop();
});

// Configurar Drag & Drop para imagen
function configurarDragAndDrop() {
    const dropZone = document.getElementById('dropZoneCrear');
    const imagenInput = document.getElementById('imagenEvento');
    const previewContainer = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
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
        
        // Mostrar preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            dropZone.style.display = 'none';
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function eliminarImagen() {
    document.getElementById('imagenEvento').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('dropZoneCrear').style.display = 'block';
    document.getElementById('previewImg').src = '';
}

// Cargar categorías desde la API
async function cargarCategorias() {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias`);
        const categorias = await response.json();
        
        const select = document.getElementById('categoria');
        select.innerHTML = '<option value="">Seleccionar...</option>';
        
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

// Manejo del formulario
document.getElementById('eventoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const titulo = document.getElementById('titulo').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const fechaEvento = document.getElementById('fechaEvento').value;
    const categoriaId = document.getElementById('categoria').value;
    const lugar = document.getElementById('lugar').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const capacidad = parseInt(document.getElementById('capacidad').value);
    const precio = parseFloat(document.getElementById('precio').value);
    const imagenFile = document.getElementById('imagenEvento').files[0];
    
    // Validaciones
    if (!titulo || !fechaEvento || !categoriaId || !lugar || capacidad <= 0 || precio < 0) {
        Utils.mostrarAlerta('alertContainer', 'Por favor completa todos los campos requeridos correctamente', 'warning');
        return;
    }
    
    // Validar tamaño de imagen (max 5MB)
    if (imagenFile && imagenFile.size > 5 * 1024 * 1024) {
        Utils.mostrarAlerta('alertContainer', 'La imagen no debe superar los 5MB', 'warning');
        return;
    }
    
    // Convertir fecha a formato ISO
    const fechaISO = new Date(fechaEvento).toISOString();
    
    // Crear FormData para enviar archivo + datos
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('fechaEvento', fechaISO);
    formData.append('lugar', lugar);
    formData.append('direccion', direccion);
    formData.append('capacidad', capacidad);
    formData.append('precio', precio);
    formData.append('estado', 'ACTIVO');
    formData.append('organizadorId', usuario.id);
    formData.append('categoriaId', categoriaId);
    
    if (imagenFile) {
        formData.append('imagen', imagenFile);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/eventos/crear-con-imagen`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const nuevoEvento = await response.json();
            Utils.mostrarAlerta('alertContainer', '¡Evento creado exitosamente! Redirigiendo...', 'success');
            
            setTimeout(() => {
                window.location.href = `evento-detalle.html?id=${nuevoEvento.id}`;
            }, 1500);
        } else {
            const error = await response.text();
            Utils.mostrarAlerta('alertContainer', error || 'Error al crear evento', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        Utils.mostrarAlerta('alertContainer', 'Error de conexión. Intenta nuevamente.', 'danger');
    }
});
