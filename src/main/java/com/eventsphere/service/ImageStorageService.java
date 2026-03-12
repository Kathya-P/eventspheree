package com.eventsphere.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ImageStorageService {

    private static final Pattern CLOUDINARY_PATH_PATTERN = Pattern.compile("/upload/(?:[^/]+/)*(?:v\\d+/)?(.+)$");

    @Value("${upload.path:uploads/eventos}")
    private String uploadBasePath;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    private Cloudinary cloudinary;
    private boolean cloudinaryEnabled;

    @PostConstruct
    void init() {
        cloudinaryEnabled = StringUtils.hasText(cloudName)
                && StringUtils.hasText(apiKey)
                && StringUtils.hasText(apiSecret);

        if (cloudinaryEnabled) {
            cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true
            ));
        }
    }

    public String guardarImagenEvento(MultipartFile imagen) throws IOException {
        return guardar(imagen, "eventsphere/eventos", Paths.get(uploadBasePath), "/uploads/eventos/");
    }

    public String guardarImagenGaleria(MultipartFile imagen) throws IOException {
        return guardar(imagen, "eventsphere/fotos", Paths.get(uploadBasePath, "fotos"), "/uploads/eventos/fotos/");
    }

    public void eliminarImagen(String imageUrl) throws IOException {
        if (!StringUtils.hasText(imageUrl)) {
            return;
        }

        if (cloudinaryEnabled && esUrlCloudinary(imageUrl)) {
            eliminarDeCloudinary(imageUrl);
            return;
        }

        eliminarArchivoLocal(imageUrl);
    }

    private String guardar(MultipartFile imagen, String cloudinaryFolder, Path localDirectory, String localUrlPrefix) throws IOException {
        if (imagen == null || imagen.isEmpty()) {
            return null;
        }

        if (cloudinaryEnabled) {
            return guardarEnCloudinary(imagen, cloudinaryFolder);
        }

        return guardarEnDisco(imagen, localDirectory, localUrlPrefix);
    }

    private String guardarEnCloudinary(MultipartFile imagen, String folder) throws IOException {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> resultado = cloudinary.uploader().upload(
                    imagen.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "image"
                    )
            );
            return String.valueOf(resultado.get("secure_url"));
        } catch (Exception e) {
            throw new IOException("No se pudo subir la imagen al almacenamiento persistente", e);
        }
    }

    private String guardarEnDisco(MultipartFile imagen, Path directorio, String urlPrefix) throws IOException {
        Files.createDirectories(directorio);

        String extension = obtenerExtension(imagen.getOriginalFilename());
        String nombreArchivo = UUID.randomUUID() + extension;
        Path destino = directorio.resolve(nombreArchivo);

        Files.copy(imagen.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
        return urlPrefix + nombreArchivo;
    }

    private void eliminarDeCloudinary(String imageUrl) throws IOException {
        String publicId = extraerPublicIdCloudinary(imageUrl);
        if (!StringUtils.hasText(publicId)) {
            return;
        }

        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "image"));
        } catch (Exception e) {
            throw new IOException("No se pudo eliminar la imagen del almacenamiento persistente", e);
        }
    }

    private void eliminarArchivoLocal(String imageUrl) throws IOException {
        Path filePath;

        if (imageUrl.startsWith("/uploads/eventos/fotos/")) {
            String fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
            filePath = Paths.get(uploadBasePath, "fotos", fileName);
        } else if (imageUrl.startsWith("/uploads/eventos/")) {
            String fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
            filePath = Paths.get(uploadBasePath, fileName);
        } else {
            return;
        }

        Files.deleteIfExists(filePath);
    }

    private boolean esUrlCloudinary(String imageUrl) {
        return imageUrl.contains("res.cloudinary.com");
    }

    private String extraerPublicIdCloudinary(String imageUrl) {
        try {
            String path = URI.create(imageUrl).getPath();
            Matcher matcher = CLOUDINARY_PATH_PATTERN.matcher(path);
            if (!matcher.find()) {
                return null;
            }

            return matcher.group(1).replaceFirst("\\.[^.]+$", "");
        } catch (Exception e) {
            return null;
        }
    }

    private String obtenerExtension(String filename) {
        if (!StringUtils.hasText(filename)) {
            return "";
        }

        int lastDot = filename.lastIndexOf('.');
        return lastDot >= 0 ? filename.substring(lastDot) : "";
    }
}