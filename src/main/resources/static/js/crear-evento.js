// Verificar sesión
const usuario = Utils.verificarSesion();

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
    const imagenUrl = document.getElementById('imagenUrl').value.trim();
    
    // Validaciones
    if (!titulo || !fechaEvento || !categoriaId || !lugar || capacidad <= 0 || precio < 0) {
        Utils.mostrarAlerta('alertContainer', 'Por favor completa todos los campos requeridos correctamente', 'warning');
        return;
    }
    
    // Convertir fecha a formato ISO
    const fechaISO = new Date(fechaEvento).toISOString();
    
    // Crear objeto evento
    const evento = {
        titulo: titulo,
        descripcion: descripcion,
        fechaEvento: fechaISO,
        lugar: lugar,
        direccion: direccion,
        capacidad: capacidad,
        precio: precio,
        imagenUrl: imagenUrl || null,
        estado: 'ACTIVO',
        organizador: {
            id: usuario.id
        },
        categoria: {
            id: parseInt(categoriaId)
        }
    };
    
    try {
        const response = await EventoAPI.crear(evento);
        
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
