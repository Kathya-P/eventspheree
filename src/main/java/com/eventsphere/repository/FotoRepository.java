package com.eventsphere.repository;

import com.eventsphere.model.Foto;
import com.eventsphere.model.Usuario;
import com.eventsphere.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FotoRepository extends JpaRepository<Foto, Long> {
    
    List<Foto> findByEvento(Evento evento);
    
    List<Foto> findByUsuario(Usuario usuario);
    
    List<Foto> findByEventoOrderByFechaSubidaDesc(Evento evento);
    
    long countByEvento(Evento evento);
}
