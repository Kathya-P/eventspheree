// API Base URL - Detecta automáticamente la URL del servidor
const API_BASE_URL = `${window.location.origin}/api`;

// Funciones para el API de Usuarios
const UsuarioAPI = {
    crear: async (usuario) => {
        const response = await fetch(`${API_BASE_URL}/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuario)
        });
        return response;
    },
    
    listar: async () => {
        const response = await fetch(`${API_BASE_URL}/usuarios`);
        return await response.json();
    },
    
    buscarPorId: async (id) => {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`);
        return await response.json();
    },
    
    buscarPorUsername: async (username) => {
        const response = await fetch(`${API_BASE_URL}/usuarios/username/${username}`);
        return await response.json();
    },
    
    actualizar: async (id, usuario) => {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuario)
        });
        return response;
    },
    
    eliminar: async (id) => {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
            method: 'DELETE'
        });
        return response;
    }
};

// Funciones para el API de Eventos
const EventoAPI = {
    crear: async (evento) => {
        const response = await fetch(`${API_BASE_URL}/eventos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(evento)
        });
        return response;
    },
    
    listar: async () => {
        const response = await fetch(`${API_BASE_URL}/eventos`);
        return await response.json();
    },
    
    listarProximos: async () => {
        const response = await fetch(`${API_BASE_URL}/eventos/proximos`);
        return await response.json();
    },
    
    buscarPorId: async (id) => {
        const response = await fetch(`${API_BASE_URL}/eventos/${id}`);
        return await response.json();
    },
    
    buscarPorTitulo: async (keyword) => {
        const response = await fetch(`${API_BASE_URL}/eventos/buscar?keyword=${encodeURIComponent(keyword)}`);
        return await response.json();
    },
    
    actualizar: async (id, evento) => {
        const response = await fetch(`${API_BASE_URL}/eventos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(evento)
        });
        return response;
    },
    
    cancelar: async (id) => {
        const response = await fetch(`${API_BASE_URL}/eventos/${id}/cancelar`, {
            method: 'PUT'
        });
        return response;
    },
    
    eliminar: async (id) => {
        const response = await fetch(`${API_BASE_URL}/eventos/${id}`, {
            method: 'DELETE'
        });
        return response;
    }
};

// Funciones para el API de Boletos
const BoletoAPI = {
    comprar: async (usuarioId, eventoId) => {
        const response = await fetch(`${API_BASE_URL}/boletos/comprar?usuarioId=${usuarioId}&eventoId=${eventoId}`, {
            method: 'POST'
        });
        return response;
    },
    
    listarPorUsuario: async (usuarioId) => {
        const response = await fetch(`${API_BASE_URL}/boletos/usuario/${usuarioId}`);
        return await response.json();
    },
    
    listarPorEvento: async (eventoId) => {
        const response = await fetch(`${API_BASE_URL}/boletos/evento/${eventoId}`);
        return await response.json();
    },
    
    buscarPorId: async (id) => {
        const response = await fetch(`${API_BASE_URL}/boletos/${id}`);
        return await response.json();
    },
    
    buscarPorCodigoQR: async (codigoQR) => {
        const response = await fetch(`${API_BASE_URL}/boletos/qr/${codigoQR}`);
        return await response.json();
    },
    
    usar: async (id, codigoQR) => {
        const response = await fetch(`${API_BASE_URL}/boletos/${id}/usar?codigoQR=${codigoQR}`, {
            method: 'POST'
        });
        return response;
    },
    
    cancelar: async (id) => {
        const response = await fetch(`${API_BASE_URL}/boletos/${id}`, {
            method: 'DELETE'
        });
        return response;
    }
};

// Funciones para el API de Reseñas
const ResenaAPI = {
    crear: async (usuarioId, eventoId, calificacion, comentario) => {
        const params = new URLSearchParams({
            usuarioId,
            eventoId,
            calificacion
        });
        if (comentario) params.append('comentario', comentario);
        
        const response = await fetch(`${API_BASE_URL}/resenas?${params}`, {
            method: 'POST'
        });
        return response;
    },
    
    listarPorEvento: async (eventoId) => {
        const response = await fetch(`${API_BASE_URL}/resenas/evento/${eventoId}`);
        return await response.json();
    },
    
    obtenerPromedio: async (eventoId) => {
        const response = await fetch(`${API_BASE_URL}/resenas/evento/${eventoId}/promedio`);
        return await response.json();
    },
    
    buscarPorId: async (id) => {
        const response = await fetch(`${API_BASE_URL}/resenas/${id}`);
        return await response.json();
    },
    
    actualizar: async (id, calificacion, comentario) => {
        const params = new URLSearchParams({ calificacion });
        if (comentario) params.append('comentario', comentario);
        
        const response = await fetch(`${API_BASE_URL}/resenas/${id}?${params}`, {
            method: 'PUT'
        });
        return response;
    },
    
    eliminar: async (id) => {
        const response = await fetch(`${API_BASE_URL}/resenas/${id}`, {
            method: 'DELETE'
        });
        return response;
    }
};

// Funciones para el API de Mensajes
const MensajeAPI = {
    enviar: async (usuarioId, eventoId, contenido) => {
        const params = new URLSearchParams({
            usuarioId,
            eventoId,
            contenido
        });
        
        const response = await fetch(`${API_BASE_URL}/mensajes?${params}`, {
            method: 'POST'
        });
        return response;
    },
    
    listarPorEvento: async (eventoId) => {
        const response = await fetch(`${API_BASE_URL}/mensajes/evento/${eventoId}`);
        return await response.json();
    },
    
    buscarPorId: async (id) => {
        const response = await fetch(`${API_BASE_URL}/mensajes/${id}`);
        return await response.json();
    },
    
    eliminar: async (id) => {
        const response = await fetch(`${API_BASE_URL}/mensajes/${id}`, {
            method: 'DELETE'
        });
        return response;
    }
};

// Funciones para el API de Fotos
const FotoAPI = {
    subir: async (usuarioId, eventoId, imagen, descripcion = '') => {
        const formData = new FormData();
        formData.append('usuarioId', usuarioId);
        formData.append('eventoId', eventoId);
        formData.append('imagen', imagen);
        formData.append('descripcion', descripcion);
        
        const response = await fetch(`${API_BASE_URL}/fotos`, {
            method: 'POST',
            body: formData
        });
        return response.json();
    },
    
    listarPorEvento: async (eventoId) => {
        const response = await fetch(`${API_BASE_URL}/fotos/evento/${eventoId}`);
        return await response.json();
    },
    
    buscarPorId: async (id) => {
        const response = await fetch(`${API_BASE_URL}/fotos/${id}`);
        return await response.json();
    },
    
    eliminar: async (id) => {
        const response = await fetch(`${API_BASE_URL}/fotos/${id}`, {
            method: 'DELETE'
        });
        return response.json();
    },
    
    contarPorEvento: async (eventoId) => {
        const response = await fetch(`${API_BASE_URL}/fotos/evento/${eventoId}/count`);
        return await response.json();
    }
};

// Utilidades
const Utils = {
    formatearFecha: (fechaISO) => {
        const fecha = new Date(fechaISO);
        const opciones = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return fecha.toLocaleDateString('es-ES', opciones);
    },
    
    formatearPrecio: (precio) => {
        return new Intl.NumberFormat('es-US', {
            style: 'currency',
            currency: 'USD'
        }).format(precio);
    },
    
    mostrarAlerta: (contenedor, mensaje, tipo = 'danger') => {
        const alerta = `
            <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                ${mensaje}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        document.getElementById(contenedor).innerHTML = alerta;
    },
    
    guardarUsuarioLocal: (usuario) => {
        localStorage.setItem('usuarioActual', JSON.stringify(usuario));
    },
    
    obtenerUsuarioLocal: () => {
        const usuario = localStorage.getItem('usuarioActual');
        return usuario ? JSON.parse(usuario) : null;
    },
    
    cerrarSesion: () => {
        localStorage.removeItem('usuarioActual');
        window.location.href = 'index.html';
    },
    
    verificarSesion: () => {
        const usuario = Utils.obtenerUsuarioLocal();
        if (!usuario) {
            window.location.href = 'login.html';
        }
        return usuario;
    }
};
