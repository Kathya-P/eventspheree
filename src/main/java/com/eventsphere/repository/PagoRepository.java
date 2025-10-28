package com.eventsphere.repository;

import com.eventsphere.model.Pago;
import com.eventsphere.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    
    List<Pago> findByUsuario(Usuario usuario);
    
    List<Pago> findByUsuarioOrderByFechaPagoDesc(Usuario usuario);
    
    Optional<Pago> findByReferenciaPago(String referenciaPago);
    
    List<Pago> findByUsuarioId(Long usuarioId);
}
