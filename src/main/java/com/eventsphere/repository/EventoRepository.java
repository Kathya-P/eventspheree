package com.eventsphere.repository;

import com.eventsphere.model.Evento;
import com.eventsphere.model.Usuario;
import com.eventsphere.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {
    
    List<Evento> findByEstado(String estado);
    
    List<Evento> findByOrganizador(Usuario organizador);
    
    List<Evento> findByOrganizadorId(Long organizadorId);
    
    List<Evento> findByCategoria(Categoria categoria);
    
    List<Evento> findByFechaEventoBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    
    @Query("SELECT e FROM Evento e WHERE e.estado = 'ACTIVO' AND e.fechaEvento > :fecha ORDER BY e.fechaEvento ASC")
    List<Evento> findEventosProximos(LocalDateTime fecha);
    
    @Query("SELECT e FROM Evento e WHERE e.estado = 'ACTIVO' AND LOWER(e.titulo) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Evento> buscarPorTitulo(String keyword);
}
