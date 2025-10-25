// Verificar sesión
const usuario = Utils.verificarSesion();

// Cargar categorías al iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarCategorias();
    
    // Preview de imagen
    document.getElementById('imagenEvento').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validar tamaño
            if (file.size > 5 * 1024 * 1024) {
                Utils.mostrarAlerta('alertContainer', 'La imagen no debe superar los 5MB', 'warning');
                this.value = '';
                return;
            }
            
            // Mostrar preview
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('previewImg').src = event.target.result;
                document.getElementById('imagePreview').classList.remove('d-none');
            };
            reader.readAsDataURL(file);
        }
    });
});

function eliminarImagen() {
    document.getElementById('imagenEvento').value = '';
    document.getElementById('imagePreview').classList.add('d-none');
    document.getElementById('previewImg').src = '';
}

// Cargar categorías desde la API
async function cargarCategorias() {
    try {
        const response = await fetch('http://localhost:8080/api/categorias');
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
        const response = await fetch('http://localhost:8080/api/eventos/crear-con-imagen', {
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
