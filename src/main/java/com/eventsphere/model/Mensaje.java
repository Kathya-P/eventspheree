package com.eventsphere.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

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
    @JsonIgnoreProperties({"password", "eventos", "boletos", "mensajes"})
    private Usuario usuario;
    
    @ManyToOne
    @JoinColumn(name = "evento_id", nullable = false)
    @JsonIgnoreProperties({"usuario", "mensajes", "boletos", "resenas"})
    private Evento evento;
    
    @Column(nullable = false, length = 1000)
    private String contenido;
    
    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;
    
    @Column(name = "fecha_edicion")
    private LocalDateTime fechaEdicion;
    
    @Column(name = "editado")
    private Boolean editado = false;
    
    @Column(name = "eliminado")
    private Boolean eliminado = false;
    
    // Responder a otro mensaje (hilo)
    @ManyToOne
    @JoinColumn(name = "responde_a_id")
    @JsonIgnoreProperties({"evento", "usuario", "respondeA", "reacciones"})
    private Mensaje respondeA;
    
    // Reacciones al mensaje
    @ElementCollection
    @CollectionTable(name = "mensaje_reacciones", 
                     joinColumns = @JoinColumn(name = "mensaje_id"))
    @MapKeyColumn(name = "usuario_id")
    @Column(name = "emoji")
    private java.util.Map<Long, String> reacciones = new java.util.HashMap<>();
    
    @PrePersist
    protected void onCreate() {
        fechaEnvio = LocalDateTime.now();
        editado = false;
        eliminado = false;
    }
}
