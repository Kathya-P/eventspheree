package com.eventsphere.config;

import com.eventsphere.model.Categoria;
import com.eventsphere.repository.CategoriaRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @PostConstruct
    @Transactional
    public void initDatabase() {
        try {
            // Solo insertar categorías si no existen
            if (categoriaRepository.count() == 0) {
                Categoria musica = new Categoria();
                musica.setNombre("Música");
                musica.setDescripcion("Conciertos, festivales y eventos musicales");
                musica.setIcono("bi-music-note");
                categoriaRepository.save(musica);
                
                Categoria deportes = new Categoria();
                deportes.setNombre("Deportes");
                deportes.setDescripcion("Eventos deportivos, torneos y competencias");
                deportes.setIcono("bi-trophy");
                categoriaRepository.save(deportes);
                
                Categoria conferencias = new Categoria();
                conferencias.setNombre("Conferencias");
                conferencias.setDescripcion("Charlas, seminarios y eventos educativos");
                conferencias.setIcono("bi-mic");
                categoriaRepository.save(conferencias);
                
                Categoria arte = new Categoria();
                arte.setNombre("Arte y Cultura");
                arte.setDescripcion("Exposiciones, teatro y eventos culturales");
                arte.setIcono("bi-palette");
                categoriaRepository.save(arte);
                
                Categoria gastronomia = new Categoria();
                gastronomia.setNombre("Gastronomía");
                gastronomia.setDescripcion("Festivales gastronómicos y eventos culinarios");
                gastronomia.setIcono("bi-cup-hot");
                categoriaRepository.save(gastronomia);
                
                System.out.println("✅ Categorías iniciales creadas correctamente");
            } else {
                System.out.println("ℹ️ Las categorías ya existen en la base de datos (" + categoriaRepository.count() + " categorías)");
            }
        } catch (Exception e) {
            System.err.println("❌ Error inicializando categorías: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
