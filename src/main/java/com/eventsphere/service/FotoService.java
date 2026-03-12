package com.eventsphere.service;

import com.eventsphere.model.Evento;
import com.eventsphere.model.Foto;
import com.eventsphere.model.Usuario;
import com.eventsphere.repository.FotoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class FotoService {

    @Autowired
    private FotoRepository fotoRepository;

    @Autowired
    private ImageStorageService imageStorageService;

    public Foto subirFoto(Usuario usuario, Evento evento, MultipartFile archivo, String descripcion) throws IOException {
        // Validar archivo
        if (archivo.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío");
        }
        
        // Validar tipo de archivo
        String contentType = archivo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("El archivo debe ser una imagen");
        }
        
        // Validar tamaño (máximo 5MB)
        if (archivo.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("El archivo no debe superar los 5MB");
        }
        
        // Crear entidad Foto
        Foto foto = new Foto();
        foto.setUrl(imageStorageService.guardarImagenGaleria(archivo));
        foto.setDescripcion(descripcion);
        foto.setFechaSubida(LocalDateTime.now());
        foto.setUsuario(usuario);
        foto.setEvento(evento);
        
        return fotoRepository.save(foto);
    }
    
    public List<Foto> listarPorEvento(Evento evento) {
        return fotoRepository.findByEventoOrderByFechaSubidaDesc(evento);
    }
    
    public Foto buscarPorId(Long id) {
        return fotoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Foto no encontrada con ID: " + id));
    }
    
    public void eliminarFoto(Long id) throws IOException {
        Foto foto = buscarPorId(id);

        imageStorageService.eliminarImagen(foto.getUrl());
        
        // Eliminar de base de datos
        fotoRepository.delete(foto);
    }
    
    public long contarFotosPorEvento(Evento evento) {
        return fotoRepository.countByEvento(evento);
    }
    
}
