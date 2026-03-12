// API Base URL - Detecta automáticamente la URL del servidor con context path
const API_BASE_URL = `${window.location.origin}/eventsphere/api`;

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
    },
    
    listarPorUsuario: async (usuarioId) => {
        const response = await fetch(`${API_BASE_URL}/eventos/usuario/${usuarioId}`);
        return await response.json();
    }
};

// Funciones para el API de Boletos
const BoletoAPI = {
    comprar: async (usuarioId, eventoId, cantidad = 1) => {
        const response = await fetch(`${API_BASE_URL}/boletos/comprar?usuarioId=${usuarioId}&eventoId=${eventoId}&cantidad=${cantidad}`, {
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

// API de Categorías
const CategoriaAPI = {
    listar: async () => {
        const response = await fetch(`${API_BASE_URL}/categorias`);
        return await response.json();
    },
    
    buscarPorId: async (id) => {
        const response = await fetch(`${API_BASE_URL}/categorias/${id}`);
        return await response.json();
    }
};

// Funciones para el API de Pagos
const PagoAPI = {
    procesar: async (datosPago) => {
        const response = await fetch(`${API_BASE_URL}/pagos/procesar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPago)
        });
        return await response.json();
    },
    
    listarPorUsuario: async (usuarioId) => {
        const response = await fetch(`${API_BASE_URL}/pagos/usuario/${usuarioId}`);
        return await response.json();
    },
    
    buscarPorReferencia: async (referencia) => {
        const response = await fetch(`${API_BASE_URL}/pagos/referencia/${referencia}`);
        return await response.json();
    },
    
    obtenerHistorial: async (usuarioId) => {
        const response = await fetch(`${API_BASE_URL}/pagos/historial/${usuarioId}`);
        return await response.json();
    },
    
    verificarEstado: async (id) => {
        const response = await fetch(`${API_BASE_URL}/pagos/${id}/estado`);
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
            // Guardar la página a la que intentaba acceder
            localStorage.setItem('paginaAnterior', window.location.href);
            window.location.href = 'login.html';
            return null;
        }
        return usuario;
    },
    
    verificarSesionSilencioso: () => {
        // Verifica sesión sin redirigir
        return Utils.obtenerUsuarioLocal();
    },
    
    redirigirSiLogueado: () => {
        // Para páginas de login/registro
        const usuario = Utils.obtenerUsuarioLocal();
        if (usuario) {
            const paginaAnterior = localStorage.getItem('paginaAnterior');
            localStorage.removeItem('paginaAnterior');
            window.location.href = paginaAnterior || 'index.html';
        }
    },
    
    requiereAutenticacion: (mensaje = 'Debes iniciar sesión para acceder a esta función') => {
        const usuario = Utils.obtenerUsuarioLocal();
        if (!usuario) {
            mostrarToast(mensaje, 'warning');
            localStorage.setItem('paginaAnterior', window.location.href);
            setTimeout(() => { window.location.href = 'login.html'; }, 1200);
            return false;
        }
        return true;
    }
};

// Resolver URL de imagen (agrega context path si es relativa)
function resolverUrlImagen(url) {
    if (!url) return null;
    if (url.startsWith('/uploads/')) return '/eventsphere' + url;
    return url;
}

function obtenerPlaceholderImagen(texto = 'Sin imagen') {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
            <rect width="800" height="500" fill="#e9ecef"/>
            <g fill="#6c757d" text-anchor="middle">
                <text x="400" y="230" font-size="72">&#128247;</text>
                <text x="400" y="300" font-size="28" font-family="Arial, sans-serif">${texto}</text>
            </g>
        </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

// Toast de notificación (reemplaza alert/confirm)
function mostrarToast(mensaje, tipo = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    const iconos = {
        success: 'bi-check-circle-fill',
        danger: 'bi-exclamation-triangle-fill',
        warning: 'bi-exclamation-circle-fill',
        info: 'bi-info-circle-fill'
    };
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-bg-${tipo} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body d-flex align-items-center gap-2">
                <i class="bi ${iconos[tipo] || iconos.info}"></i>
                ${mensaje}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    container.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
    toast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}
