package com.eventsphere.service;

import com.eventsphere.model.Mensaje;
import com.eventsphere.model.Usuario;
import com.eventsphere.model.Evento;
import com.eventsphere.repository.MensajeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MensajeService {
    
    @Autowired
    private MensajeRepository mensajeRepository;
    
    public Mensaje enviarMensaje(Usuario usuario, Evento evento, String contenido) {
        // Validar contenido
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
        mensaje.setFechaEnvio(LocalDateTime.now());
        
        return mensajeRepository.save(mensaje);
    }
    
    public List<Mensaje> listarPorEvento(Evento evento) {
        return mensajeRepository.findByEventoOrderByFechaEnvioAsc(evento);
    }
    
    public Optional<Mensaje> buscarPorId(Long id) {
        return mensajeRepository.findById(id);
    }
    
    public void eliminarMensaje(Long id) {
        if (!mensajeRepository.existsById(id)) {
            throw new RuntimeException("Mensaje no encontrado");
        }
        mensajeRepository.deleteById(id);
    }
    
    public long contarMensajesPorEvento(Evento evento) {
        return mensajeRepository.countByEvento(evento);
    }
}
