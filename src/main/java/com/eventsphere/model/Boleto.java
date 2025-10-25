package com.eventsphere.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "BOLETOS")
public class Boleto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "boleto_seq")
    @SequenceGenerator(name = "boleto_seq", sequenceName = "BOLETO_SEQ", allocationSize = 1)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 100)
    private String codigoQR;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @ManyToOne
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;
    
    @Column(nullable = false, length = 20)
    private String estado = "ACTIVO"; // ACTIVO, USADO, CANCELADO
    
    @Column(name = "fecha_compra")
    private LocalDateTime fechaCompra;
    
    @Column(name = "fecha_uso")
    private LocalDateTime fechaUso;
    
    @PrePersist
    protected void onCreate() {
        fechaCompra = LocalDateTime.now();
        generarCodigoQR();
    }
    
    private void generarCodigoQR() {
        // Genera un código único basado en timestamp y random
        codigoQR = "EVT-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 10000);
    }
}
