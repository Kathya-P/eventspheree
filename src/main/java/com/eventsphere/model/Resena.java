package com.eventsphere.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "RESENAS")
public class Resena {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "resena_seq")
    @SequenceGenerator(name = "resena_seq", sequenceName = "RESENA_SEQ", allocationSize = 1)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @ManyToOne
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;
    
    @Column(nullable = false)
    private Integer calificacion; // 1-5 estrellas
    
    @Column(length = 1000)
    private String comentario;
    
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
}
