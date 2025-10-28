package com.eventsphere.repository;

import com.eventsphere.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    
    List<Pago> findByUsuarioId(Long usuarioId);
    
    List<Pago> findByBoletoId(Long boletoId);
    
    Optional<Pago> findByReferenciaPago(String referenciaPago);
    
    List<Pago> findByEstado(String estado);
}
