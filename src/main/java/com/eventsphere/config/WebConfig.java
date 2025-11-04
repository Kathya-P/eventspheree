package com.eventsphere.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Value("${upload.path:uploads/eventos}")
    private String uploadPath;
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Servir imágenes de eventos desde el directorio de uploads
        String uploadLocation = "file:" + Paths.get(uploadPath).toAbsolutePath().toString() + "/";
        
        registry.addResourceHandler("/uploads/eventos/**")
                .addResourceLocations(uploadLocation);
        
        // Servir fotos de galería (comentarios de usuarios)
        String fotosLocation = "file:" + Paths.get("src/main/resources/static/uploads/eventos/fotos").toAbsolutePath().toString() + "/";
        
        registry.addResourceHandler("/uploads/eventos/fotos/**")
                .addResourceLocations(fotosLocation);
    }
}
