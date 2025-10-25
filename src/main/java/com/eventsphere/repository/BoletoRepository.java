package com.eventsphere.repository;

import com.eventsphere.model.Boleto;
import com.eventsphere.model.Usuario;
import com.eventsphere.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BoletoRepository extends JpaRepository<Boleto, Long> {
    
    List<Boleto> findByUsuario(Usuario usuario);
    
    List<Boleto> findByEvento(Evento evento);
    
    List<Boleto> findByUsuarioAndEstado(Usuario usuario, String estado);
    
    Optional<Boleto> findByCodigoQR(String codigoQR);
    
    boolean existsByUsuarioAndEvento(Usuario usuario, Evento evento);
    
    long countByEventoAndEstado(Evento evento, String estado);
}
