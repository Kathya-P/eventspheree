// Chat Mejorado con Reacciones, Editar y Eliminar

class ChatMejorado {
    constructor(eventoId, usuarioActual) {
        this.eventoId = eventoId;
        this.usuarioActual = usuarioActual;
        this.mensajes = [];
        this.respondiendoA = null;
        this.editandoMensaje = null;
        this.emojisDisponibles = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '👏', '💯', '✨', '🚀'];
    }

    async inicializar() {
        await this.cargarMensajes();
        this.configurarEventos();
        this.iniciarActualizacionAutomatica();
    }

    async cargarMensajes() {
        try {
            this.mensajes = await MensajeAPI.listarPorEvento(this.eventoId);
            this.renderizarMensajes();
        } catch (error) {
            console.error('Error al cargar mensajes:', error);
        }
    }

    renderizarMensajes() {
        const container = document.getElementById('chatContainer');
        
        if (this.mensajes.length === 0) {
            container.innerHTML = '<p class="text-muted text-center py-4">No hay mensajes aún. ¡Sé el primero en escribir!</p>';
            return;
        }

        container.innerHTML = this.mensajes.map(mensaje => this.crearHtmlMensaje(mensaje)).join('');
        container.scrollTop = container.scrollHeight;
    }

    crearHtmlMensaje(mensaje) {
        const esPropio = mensaje.usuario.id === this.usuarioActual.id;
        const esOrganizador = mensaje.usuario.id === this.eventoId; // Ajustar según tu lógica
        
        const reaccionesHtml = this.crearHtmlReacciones(mensaje);
        const respuestaHtml = mensaje.respondeA ? this.crearHtmlRespuesta(mensaje.respondeA) : '';
        
        return `
            <div class="mensaje mb-3 ${esPropio ? 'mensaje-propio' : ''}" data-mensaje-id="${mensaje.id}">
                <div class="d-flex align-items-start">
                    <div class="flex-shrink-0">
                        <div class="avatar-circle bg-primary text-white">
                            ${mensaje.usuario.nombre.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div class="flex-grow-1 ms-2">
                        <div class="mensaje-header d-flex justify-content-between align-items-start">
                            <div>
                                <strong class="text-primary">${mensaje.usuario.nombre}</strong>
                                ${esOrganizador ? '<span class="badge bg-warning ms-1">Organizador</span>' : ''}
                                <small class="text-muted ms-2">
                                    ${Utils.formatearFechaRelativa(mensaje.fechaEnvio)}
                                    ${mensaje.editado ? '<i class="bi bi-pencil-fill text-muted" title="Editado"></i>' : ''}
                                </small>
                            </div>
                            ${esPropio ? this.crearHtmlAcciones(mensaje.id) : ''}
                        </div>
                        ${respuestaHtml}
                        <div class="mensaje-contenido mt-1">
                            ${mensaje.eliminado ? 
                                '<em class="text-muted">[Mensaje eliminado]</em>' : 
                                this.procesarContenido(mensaje.contenido)
                            }
                        </div>
                        ${reaccionesHtml}
                    </div>
                </div>
            </div>
        `;
    }

    crearHtmlRespuesta(mensajeOriginal) {
        return `
            <div class="respuesta-a bg-light p-2 rounded mb-1">
                <small class="text-muted">
                    <i class="bi bi-reply-fill"></i> Respondiendo a 
                    <strong>${mensajeOriginal.usuario.nombre}</strong>
                </small>
                <div class="small text-truncate">${mensajeOriginal.contenido}</div>
            </div>
        `;
    }

    crearHtmlAcciones(mensajeId) {
        return `
            <div class="btn-group btn-group-sm" role="group">
                <button class="btn btn-sm btn-link text-muted" onclick="chat.responderA(${mensajeId})" title="Responder">
                    <i class="bi bi-reply"></i>
                </button>
                <button class="btn btn-sm btn-link text-muted" onclick="chat.editarMensaje(${mensajeId})" title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-link text-danger" onclick="chat.eliminarMensaje(${mensajeId})" title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
    }

    crearHtmlReacciones(mensaje) {
        if (!mensaje.reacciones || Object.keys(mensaje.reacciones).length === 0) {
            return `
                <div class="mensaje-reacciones mt-2">
                    <button class="btn btn-sm btn-light" onclick="chat.mostrarEmojis(${mensaje.id})">
                        <i class="bi bi-emoji-smile"></i>
                    </button>
                </div>
            `;
        }

        // Agrupar reacciones por emoji
        const reaccionesAgrupadas = {};
        Object.entries(mensaje.reacciones).forEach(([usuarioId, emoji]) => {
            if (!reaccionesAgrupadas[emoji]) {
                reaccionesAgrupadas[emoji] = [];
            }
            reaccionesAgrupadas[emoji].push(parseInt(usuarioId));
        });

        const reaccionesHtml = Object.entries(reaccionesAgrupadas).map(([emoji, usuarios]) => {
            const yaReacciono = usuarios.includes(this.usuarioActual.id);
            return `
                <button class="btn btn-sm ${yaReacciono ? 'btn-primary' : 'btn-light'} me-1" 
                        onclick="chat.toggleReaccion(${mensaje.id}, '${emoji}')"
                        title="${usuarios.length} ${usuarios.length === 1 ? 'persona' : 'personas'}">
                    ${emoji} ${usuarios.length}
                </button>
            `;
        }).join('');

        return `
            <div class="mensaje-reacciones mt-2">
                ${reaccionesHtml}
                <button class="btn btn-sm btn-light" onclick="chat.mostrarEmojis(${mensaje.id})">
                    <i class="bi bi-emoji-smile"></i>
                </button>
            </div>
        `;
    }

    mostrarEmojis(mensajeId) {
        const emojisHtml = this.emojisDisponibles.map(emoji => 
            `<button class="btn btn-lg m-1" onclick="chat.agregarReaccion(${mensajeId}, '${emoji}')">${emoji}</button>`
        ).join('');

        const modal = `
            <div class="modal fade" id="modalEmojis" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Elige una reacción</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center">
                            ${emojisHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Eliminar modal anterior si existe
        const modalExistente = document.getElementById('modalEmojis');
        if (modalExistente) {
            modalExistente.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modal);
        const modalElement = new bootstrap.Modal(document.getElementById('modalEmojis'));
        modalElement.show();
    }

    async agregarReaccion(mensajeId, emoji) {
        try {
            await MensajeAPI.reaccionar(mensajeId, this.usuarioActual.id, emoji);
            await this.cargarMensajes();
            bootstrap.Modal.getInstance(document.getElementById('modalEmojis')).hide();
        } catch (error) {
            console.error('Error al reaccionar:', error);
            alert('Error al agregar reacción');
        }
    }

    async toggleReaccion(mensajeId, emoji) {
        const mensaje = this.mensajes.find(m => m.id === mensajeId);
        const yaReacciono = mensaje.reacciones && mensaje.reacciones[this.usuarioActual.id] === emoji;
        
        try {
            await MensajeAPI.reaccionar(mensajeId, this.usuarioActual.id, yaReacciono ? null : emoji);
            await this.cargarMensajes();
        } catch (error) {
            console.error('Error al reaccionar:', error);
        }
    }

    responderA(mensajeId) {
        const mensaje = this.mensajes.find(m => m.id === mensajeId);
        this.respondiendoA = mensaje;
        
        const input = document.getElementById('mensajeTexto');
        const form = document.getElementById('chatForm');
        
        const bannerRespuesta = `
            <div class="alert alert-info alert-dismissible fade show mb-2" id="bannerRespuesta">
                <i class="bi bi-reply-fill"></i> Respondiendo a <strong>${mensaje.usuario.nombre}</strong>
                <button type="button" class="btn-close" onclick="chat.cancelarRespuesta()"></button>
            </div>
        `;
        
        form.insertAdjacentHTML('beforebegin', bannerRespuesta);
        input.focus();
    }

    cancelarRespuesta() {
        this.respondiendoA = null;
        const banner = document.getElementById('bannerRespuesta');
        if (banner) banner.remove();
    }

    async editarMensaje(mensajeId) {
        const mensaje = this.mensajes.find(m => m.id === mensajeId);
        this.editandoMensaje = mensaje;
        
        const input = document.getElementById('mensajeTexto');
        const btnEnviar = document.getElementById('btnEnviar');
        
        input.value = mensaje.contenido;
        btnEnviar.innerHTML = '<i class="bi bi-check-lg"></i> Guardar';
        btnEnviar.classList.replace('btn-primary', 'btn-success');
        
        const form = document.getElementById('chatForm');
        const bannerEdicion = `
            <div class="alert alert-warning alert-dismissible fade show mb-2" id="bannerEdicion">
                <i class="bi bi-pencil-fill"></i> Editando mensaje
                <button type="button" class="btn-close" onclick="chat.cancelarEdicion()"></button>
            </div>
        `;
        
        form.insertAdjacentHTML('beforebegin', bannerEdicion);
        input.focus();
    }

    cancelarEdicion() {
        this.editandoMensaje = null;
        const banner = document.getElementById('bannerEdicion');
        if (banner) banner.remove();
        
        document.getElementById('mensajeTexto').value = '';
        const btnEnviar = document.getElementById('btnEnviar');
        btnEnviar.innerHTML = '<i class="bi bi-send"></i> Enviar';
        btnEnviar.classList.replace('btn-success', 'btn-primary');
    }

    async eliminarMensaje(mensajeId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
            return;
        }

        try {
            await MensajeAPI.eliminar(mensajeId, this.usuarioActual.id);
            await this.cargarMensajes();
            Utils.mostrarAlerta('Mensaje eliminado', 'success');
        } catch (error) {
            console.error('Error al eliminar mensaje:', error);
            Utils.mostrarAlerta('Error al eliminar mensaje', 'danger');
        }
    }

    configurarEventos() {
        const form = document.getElementById('chatForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.enviarMensaje();
        });
    }

    async enviarMensaje() {
        const input = document.getElementById('mensajeTexto');
        const contenido = input.value.trim();

        if (!contenido) return;

        try {
            if (this.editandoMensaje) {
                // Editar mensaje existente
                await MensajeAPI.editar(this.editandoMensaje.id, this.usuarioActual.id, contenido);
                this.cancelarEdicion();
            } else {
                // Enviar nuevo mensaje
                const respondeAId = this.respondiendoA ? this.respondiendoA.id : null;
                await MensajeAPI.enviar(this.usuarioActual.id, this.eventoId, contenido, respondeAId);
                this.cancelarRespuesta();
            }

            input.value = '';
            await this.cargarMensajes();
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            Utils.mostrarAlerta('Error al enviar mensaje', 'danger');
        }
    }

    iniciarActualizacionAutomatica() {
        // Actualizar mensajes cada 5 segundos
        setInterval(() => {
            this.cargarMensajes();
        }, 5000);
    }

    procesarContenido(texto) {
        // Convertir URLs en enlaces
        return texto.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener">$1</a>'
        );
    }
}

// Variable global para el chat
let chat = null;
