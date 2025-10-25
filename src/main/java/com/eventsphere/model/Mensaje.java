package com.eventsphere.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "MENSAJES")
public class Mensaje {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "mensaje_seq")
    @SequenceGenerator(name = "mensaje_seq", sequenceName = "MENSAJE_SEQ", allocationSize = 1)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @ManyToOne
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;
    
    @Column(nullable = false, length = 1000)
    private String contenido;
    
    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;
    
    @PrePersist
    protected void onCreate() {
        fechaEnvio = LocalDateTime.now();
    }
}
