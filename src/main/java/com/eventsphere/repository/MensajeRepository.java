package com.eventsphere.repository;

import com.eventsphere.model.Mensaje;
import com.eventsphere.model.Usuario;
import com.eventsphere.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MensajeRepository extends JpaRepository<Mensaje, Long> {
    
    List<Mensaje> findByEvento(Evento evento);
    
    List<Mensaje> findByUsuario(Usuario usuario);
    
    List<Mensaje> findByEventoOrderByFechaEnvioAsc(Evento evento);
    
    long countByEvento(Evento evento);
    
    long countByEventoId(Long eventoId);
}
