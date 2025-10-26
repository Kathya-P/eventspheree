package com.eventsphere.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "EVENTOS")
public class Evento {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "evento_seq")
    @SequenceGenerator(name = "evento_seq", sequenceName = "EVENTO_SEQ", allocationSize = 1)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String titulo;
    
    @Column(length = 2000)
    private String descripcion;
    
    @Column(nullable = false)
    private LocalDateTime fechaEvento;
    
    @Column(nullable = false, length = 200)
    private String lugar;
    
    @Column(length = 500)
    private String direccion;
    
    @Column(nullable = false)
    private Integer capacidad;
    
    @Column(name = "entradas_vendidas")
    private Integer entradasVendidas = 0;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;
    
    @Column(length = 500)
    private String imagenUrl;
    
    @Column(nullable = false, length = 20)
    private String estado = "ACTIVO"; // ACTIVO, CANCELADO, FINALIZADO
    
    @ManyToOne
    @JoinColumn(name = "organizador_id", nullable = false)
    private Usuario organizador;
    
    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;
    
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        if (entradasVendidas == null) {
            entradasVendidas = 0;
        }
    }
}
