package com.eventsphere.service;

import com.eventsphere.model.Mensaje;
import com.eventsphere.model.Usuario;
import com.eventsphere.model.Evento;
import com.eventsphere.repository.MensajeRepository;
import com.eventsphere.repository.UsuarioRepository;
import com.eventsphere.repository.EventoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MensajeServiceMejorado {
    
    @Autowired
    private MensajeRepository mensajeRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private EventoRepository eventoRepository;
    
    /**
     * Enviar un mensaje nuevo
     */
    public Mensaje enviarMensaje(Long usuarioId, Long eventoId, String contenido, Long respondeAId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
        
        if (contenido == null || contenido.trim().isEmpty()) {
            throw new RuntimeException("El mensaje no puede estar vacío");
        }
        
        if (contenido.length() > 1000) {
            throw new RuntimeException("El mensaje no puede superar los 1000 caracteres");
        }
        
        Mensaje mensaje = new Mensaje();
        mensaje.setUsuario(usuario);
        mensaje.setEvento(evento);
        mensaje.setContenido(contenido.trim());
        
        // Si es respuesta a otro mensaje
        if (respondeAId != null) {
            Mensaje mensajeOriginal = mensajeRepository.findById(respondeAId)
                    .orElseThrow(() -> new RuntimeException("Mensaje original no encontrado"));
            mensaje.setRespondeA(mensajeOriginal);
        }
        
        return mensajeRepository.save(mensaje);
    }
    
    /**
     * Editar un mensaje existente
     */
    public Mensaje editarMensaje(Long mensajeId, Long usuarioId, String nuevoContenido) {
        Mensaje mensaje = mensajeRepository.findById(mensajeId)
                .orElseThrow(() -> new RuntimeException("Mensaje no encontrado"));
        
        // Verificar que el usuario sea el autor
        if (!mensaje.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("Solo puedes editar tus propios mensajes");
        }
        
        // No permitir editar mensajes eliminados
        if (mensaje.getEliminado()) {
            throw new RuntimeException("No puedes editar un mensaje eliminado");
        }
        
        if (nuevoContenido == null || nuevoContenido.trim().isEmpty()) {
            throw new RuntimeException("El mensaje no puede estar vacío");
        }
        
        if (nuevoContenido.length() > 1000) {
            throw new RuntimeException("El mensaje no puede superar los 1000 caracteres");
        }
        
        mensaje.setContenido(nuevoContenido.trim());
        mensaje.setEditado(true);
        mensaje.setFechaEdicion(LocalDateTime.now());
        
        return mensajeRepository.save(mensaje);
    }
    
    /**
     * Eliminar un mensaje (soft delete)
     */
    public Mensaje eliminarMensaje(Long mensajeId, Long usuarioId) {
        Mensaje mensaje = mensajeRepository.findById(mensajeId)
                .orElseThrow(() -> new RuntimeException("Mensaje no encontrado"));
        
        // Verificar que el usuario sea el autor o el organizador del evento
        boolean esAutor = mensaje.getUsuario().getId().equals(usuarioId);
        boolean esOrganizador = mensaje.getEvento().getOrganizador().getId().equals(usuarioId);
        
        if (!esAutor && !esOrganizador) {
            throw new RuntimeException("No tienes permiso para eliminar este mensaje");
        }
        
        mensaje.setEliminado(true);
        mensaje.setContenido("[Mensaje eliminado]");
        mensaje.setFechaEdicion(LocalDateTime.now());
        
        return mensajeRepository.save(mensaje);
    }
    
    /**
     * Agregar/quitar reacción a un mensaje
     */
    public Mensaje reaccionar(Long mensajeId, Long usuarioId, String emoji) {
        Mensaje mensaje = mensajeRepository.findById(mensajeId)
                .orElseThrow(() -> new RuntimeException("Mensaje no encontrado"));
        
        if (emoji == null || emoji.trim().isEmpty()) {
            // Quitar reacción
            mensaje.getReacciones().remove(usuarioId);
        } else {
            // Agregar o actualizar reacción
            // Validar que sea un emoji válido
            if (!esEmojiValido(emoji)) {
                throw new RuntimeException("Emoji no válido");
            }
            mensaje.getReacciones().put(usuarioId, emoji);
        }
        
        return mensajeRepository.save(mensaje);
    }
    
    /**
     * Listar mensajes de un evento (no eliminados)
     */
    public List<Mensaje> listarPorEvento(Long eventoId) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
        
        List<Mensaje> mensajes = mensajeRepository.findByEventoOrderByFechaEnvioAsc(evento);
        
        // Filtrar eliminados (opcional: puedes mostrarlos con [Mensaje eliminado])
        return mensajes.stream()
                .filter(m -> !m.getEliminado())
                .collect(Collectors.toList());
    }
    
    /**
     * Listar todos los mensajes incluyendo eliminados (para organizadores)
     */
    public List<Mensaje> listarTodosLosAnuncios(Long eventoId, Long usuarioId) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
        
        // Verificar que sea el organizador
        if (!evento.getOrganizador().getId().equals(usuarioId)) {
            throw new RuntimeException("Solo el organizador puede ver mensajes eliminados");
        }
        
        return mensajeRepository.findByEventoOrderByFechaEnvioAsc(evento);
    }
    
    /**
     * Contar mensajes no eliminados de un evento
     */
    public long contarMensajes(Long eventoId) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
        
        return mensajeRepository.findByEventoOrderByFechaEnvioAsc(evento)
                .stream()
                .filter(m -> !m.getEliminado())
                .count();
    }
    
    /**
     * Validar si es un emoji válido (lista básica)
     */
    private boolean esEmojiValido(String emoji) {
        List<String> emojisValidos = List.of(
            "👍", "❤️", "😂", "😮", "😢", "😡", 
            "🎉", "🔥", "👏", "💯", "✨", "🚀"
        );
        return emojisValidos.contains(emoji);
    }
}
