package com.eventsphere.repository;

import com.eventsphere.model.Resena;
import com.eventsphere.model.Usuario;
import com.eventsphere.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResenaRepository extends JpaRepository<Resena, Long> {
    
    List<Resena> findByEvento(Evento evento);
    
    List<Resena> findByEventoOrderByFechaCreacionDesc(Evento evento);
    
    List<Resena> findByUsuario(Usuario usuario);
    
    Optional<Resena> findByUsuarioAndEvento(Usuario usuario, Evento evento);
    
    boolean existsByUsuarioAndEvento(Usuario usuario, Evento evento);
    
    @Query("SELECT AVG(r.calificacion) FROM Resena r WHERE r.evento = :evento")
    Double calcularPromedioCalificacion(Evento evento);
    
    long countByEvento(Evento evento);
}
