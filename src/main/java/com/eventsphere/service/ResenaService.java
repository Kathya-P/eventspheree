package com.eventsphere.service;

import com.eventsphere.model.Resena;
import com.eventsphere.model.Usuario;
import com.eventsphere.model.Evento;
import com.eventsphere.repository.ResenaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ResenaService {
    
    @Autowired
    private ResenaRepository resenaRepository;
    
    public Resena crearResena(Usuario usuario, Evento evento, Integer calificacion, String comentario) {
        // Validar calificación
        if (calificacion < 1 || calificacion > 5) {
            throw new RuntimeException("La calificación debe estar entre 1 y 5");
        }
        
        // Verificar que el usuario no haya reseñado este evento antes
        if (resenaRepository.existsByUsuarioAndEvento(usuario, evento)) {
            throw new RuntimeException("Ya has reseñado este evento");
        }
        
        Resena resena = new Resena();
        resena.setUsuario(usuario);
        resena.setEvento(evento);
        resena.setCalificacion(calificacion);
        resena.setComentario(comentario);
        resena.setFechaCreacion(LocalDateTime.now());
        
        return resenaRepository.save(resena);
    }
    
    public List<Resena> listarPorEvento(Evento evento) {
        return resenaRepository.findByEventoOrderByFechaCreacionDesc(evento);
    }
    
    public Optional<Resena> buscarPorId(Long id) {
        return resenaRepository.findById(id);
    }
    
    public Double calcularPromedioCalificacion(Evento evento) {
        Double promedio = resenaRepository.calcularPromedioCalificacion(evento);
        return promedio != null ? promedio : 0.0;
    }
    
    public Resena actualizarResena(Long id, Integer calificacion, String comentario) {
        Resena resena = resenaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reseña no encontrada"));
        
        if (calificacion < 1 || calificacion > 5) {
            throw new RuntimeException("La calificación debe estar entre 1 y 5");
        }
        
        resena.setCalificacion(calificacion);
        resena.setComentario(comentario);
        
        return resenaRepository.save(resena);
    }
    
    public void eliminarResena(Long id) {
        if (!resenaRepository.existsById(id)) {
            throw new RuntimeException("Reseña no encontrada");
        }
        resenaRepository.deleteById(id);
    }
}
