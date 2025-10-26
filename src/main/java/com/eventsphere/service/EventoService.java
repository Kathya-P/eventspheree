package com.eventsphere.service;

import com.eventsphere.model.Evento;
import com.eventsphere.model.Usuario;
import com.eventsphere.model.Categoria;
import com.eventsphere.repository.EventoRepository;
import com.eventsphere.validator.EventoValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EventoService {
    
    @Autowired
    private EventoRepository eventoRepository;
    
    @Autowired
    private EventoValidator eventoValidator;
    
    public Evento crearEvento(Evento evento) {
        // Validar usando el validador
        List<String> errores = eventoValidator.validar(evento);
        if (!errores.isEmpty()) {
            throw new RuntimeException("Errores de validación: " + String.join(", ", errores));
        }
        
        return eventoRepository.save(evento);
    }
    
    public Optional<Evento> buscarPorId(Long id) {
        return eventoRepository.findById(id);
    }
    
    public List<Evento> listarTodos() {
        return eventoRepository.findAll();
    }
    
    public List<Evento> listarPorEstado(String estado) {
        return eventoRepository.findByEstado(estado);
    }
    
    public List<Evento> listarEventosProximos() {
        return eventoRepository.findEventosProximos(LocalDateTime.now());
    }
    
    public List<Evento> listarPorOrganizador(Usuario organizador) {
        return eventoRepository.findByOrganizador(organizador);
    }
    
    public List<Evento> listarPorCategoria(Categoria categoria) {
        return eventoRepository.findByCategoria(categoria);
    }
    
    public List<Evento> buscarPorTitulo(String keyword) {
        return eventoRepository.buscarPorTitulo(keyword);
    }
    
    public Evento actualizarEvento(Long id, Evento eventoActualizado) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
        
        if (eventoActualizado.getTitulo() != null) {
            evento.setTitulo(eventoActualizado.getTitulo());
        }
        if (eventoActualizado.getDescripcion() != null) {
            evento.setDescripcion(eventoActualizado.getDescripcion());
        }
        if (eventoActualizado.getFechaEvento() != null) {
            evento.setFechaEvento(eventoActualizado.getFechaEvento());
        }
        if (eventoActualizado.getLugar() != null) {
            evento.setLugar(eventoActualizado.getLugar());
        }
        if (eventoActualizado.getDireccion() != null) {
            evento.setDireccion(eventoActualizado.getDireccion());
        }
        if (eventoActualizado.getCapacidad() != null) {
            evento.setCapacidad(eventoActualizado.getCapacidad());
        }
        if (eventoActualizado.getPrecio() != null) {
            evento.setPrecio(eventoActualizado.getPrecio());
        }
        if (eventoActualizado.getImagenUrl() != null) {
            evento.setImagenUrl(eventoActualizado.getImagenUrl());
        }
        if (eventoActualizado.getEstado() != null) {
            evento.setEstado(eventoActualizado.getEstado());
        }
        
        return eventoRepository.save(evento);
    }
    
    public void eliminarEvento(Long id) {
        eventoRepository.deleteById(id);
    }
    
    public void cancelarEvento(Long id) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
        
        if (!eventoValidator.puedeCancelarse(evento)) {
            throw new RuntimeException("Este evento no puede ser cancelado");
        }
        
        evento.setEstado("CANCELADO");
        eventoRepository.save(evento);
    }
}
