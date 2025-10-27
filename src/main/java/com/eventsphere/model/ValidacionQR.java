package com.eventsphere.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "VALIDACIONES_QR")
public class ValidacionQR {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "validacion_seq")
    @SequenceGenerator(name = "validacion_seq", sequenceName = "VALIDACION_QR_SEQ", allocationSize = 1)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "boleto_id", nullable = false)
    private Boleto boleto;
    
    @ManyToOne
    @JoinColumn(name = "validador_id", nullable = false)
    private Usuario validador; // El organizador que validó
    
    @Column(name = "fecha_validacion", nullable = false)
    private LocalDateTime fechaValidacion;
    
    @Column(nullable = false, length = 20)
    private String resultado; // EXITOSO, RECHAZADO
    
    @Column(length = 500)
    private String mensaje; // Mensaje de error si fue rechazado
    
    @Column(name = "codigo_qr", nullable = false, length = 100)
    private String codigoQR;
    
    @PrePersist
    protected void onCreate() {
        fechaValidacion = LocalDateTime.now();
    }
}
