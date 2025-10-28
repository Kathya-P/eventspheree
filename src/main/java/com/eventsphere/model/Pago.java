package com.eventsphere.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "pagos")
public class Pago {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "pago_seq")
    @SequenceGenerator(name = "pago_seq", sequenceName = "PAGO_SEQ", allocationSize = 1)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "boleto_id", nullable = false)
    private Boleto boleto;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @Column(nullable = false)
    private BigDecimal monto;
    
    @Column(nullable = false, length = 20)
    private String metodoPago; // TARJETA, PAYPAL
    
    @Column(length = 20)
    private String tipoTarjeta; // VISA, MASTERCARD, AMEX
    
    @Column(length = 4)
    private String ultimosDigitos;
    
    @Column(length = 20)
    private String estado; // PENDIENTE, APROBADO, RECHAZADO
    
    @Column(length = 100)
    private String referenciaPago;
    
    @Column
    private LocalDateTime fechaPago;
    
    @PrePersist
    public void prePersist() {
        this.fechaPago = LocalDateTime.now();
    }
}
