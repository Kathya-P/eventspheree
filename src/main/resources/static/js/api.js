// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

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
