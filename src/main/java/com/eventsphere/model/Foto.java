package com.eventsphere.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "FOTOS")
public class Foto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "foto_seq")
    @SequenceGenerator(name = "foto_seq", sequenceName = "FOTO_SEQ", allocationSize = 1)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @ManyToOne
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;
    
    @Column(nullable = false, length = 500)
    private String url;
    
    @Column(length = 255)
    private String descripcion;
    
    @Column(name = "fecha_subida")
    private LocalDateTime fechaSubida;
    
    @PrePersist
    protected void onCreate() {
        fechaSubida = LocalDateTime.now();
    }
}
