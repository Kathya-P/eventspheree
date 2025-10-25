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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class FotoService {
    
    @Autowired
    private FotoRepository fotoRepository;
    
    private final String UPLOAD_DIR = "src/main/resources/static/uploads/eventos/fotos/";
    
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
        
        // Crear directorio si no existe
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generar nombre único
        String extension = getFileExtension(archivo.getOriginalFilename());
        String nombreArchivo = UUID.randomUUID().toString() + extension;
        Path destinoArchivo = uploadPath.resolve(nombreArchivo);
        
        // Guardar archivo
        Files.copy(archivo.getInputStream(), destinoArchivo, StandardCopyOption.REPLACE_EXISTING);
        
        // Crear entidad Foto
        Foto foto = new Foto();
        foto.setUrl("/uploads/eventos/fotos/" + nombreArchivo);
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
        
        // Eliminar archivo físico
        String url = foto.getUrl();
        String fileName = url.substring(url.lastIndexOf("/") + 1);
        Path filePath = Paths.get(UPLOAD_DIR + fileName);
        
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }
        
        // Eliminar de base de datos
        fotoRepository.delete(foto);
    }
    
    public long contarFotosPorEvento(Evento evento) {
        return fotoRepository.countByEvento(evento);
    }
    
    private String getFileExtension(String filename) {
        if (filename == null) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex);
    }
}
