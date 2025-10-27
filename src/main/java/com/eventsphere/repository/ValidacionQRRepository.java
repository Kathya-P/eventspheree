package com.eventsphere.repository;

import com.eventsphere.model.ValidacionQR;
import com.eventsphere.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ValidacionQRRepository extends JpaRepository<ValidacionQR, Long> {
    
    // Buscar por validador
    List<ValidacionQR> findByValidadorOrderByFechaValidacionDesc(Usuario validador);
    
    // Buscar las últimas N validaciones de un validador
    List<ValidacionQR> findTop10ByValidadorOrderByFechaValidacionDesc(Usuario validador);
    
    // Contar validaciones exitosas de hoy por validador
    @Query("SELECT COUNT(v) FROM ValidacionQR v WHERE v.validador = :validador " +
           "AND v.resultado = 'EXITOSO' " +
           "AND v.fechaValidacion >= :fechaInicio")
    Long contarExitosasHoy(@Param("validador") Usuario validador, @Param("fechaInicio") LocalDateTime fechaInicio);
    
    // Contar validaciones rechazadas de hoy por validador
    @Query("SELECT COUNT(v) FROM ValidacionQR v WHERE v.validador = :validador " +
           "AND v.resultado = 'RECHAZADO' " +
           "AND v.fechaValidacion >= :fechaInicio")
    Long contarRechazadasHoy(@Param("validador") Usuario validador, @Param("fechaInicio") LocalDateTime fechaInicio);
}
