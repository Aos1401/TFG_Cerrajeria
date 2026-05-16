package com.TFG.cerrajeria.presupuesto.application;

import com.TFG.cerrajeria.presupuesto.domain.EstadoPresupuesto;
import com.TFG.cerrajeria.presupuesto.domain.Presupuesto;
import com.TFG.cerrajeria.presupuesto.infrastructure.PresupuestoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class CrearPresupuestoUseCase {

    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5 MB

    @Value("${app.upload.dir}")
    private String uploadDir;

    private final PresupuestoRepository presupuestoRepository;

    public CrearPresupuestoUseCase(PresupuestoRepository presupuestoRepository) {
        this.presupuestoRepository = presupuestoRepository;
    }

    public Presupuesto ejecutar(Presupuesto presupuesto, String emailUsuario, MultipartFile foto) {
        presupuesto.setEmail(emailUsuario);
        presupuesto.setEstado(EstadoPresupuesto.PENDIENTE);
        presupuesto.setFechaSolicitud(LocalDateTime.now());
        presupuesto.setRespuesta(null);

        if (foto != null && !foto.isEmpty()) {
            String contentType = foto.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new IllegalArgumentException("Solo se permiten archivos de imagen.");
            }
            if (foto.getSize() > MAX_SIZE) {
                throw new IllegalArgumentException("La imagen no puede superar los 5 MB.");
            }
            try {
                String extension = StringUtils.getFilenameExtension(foto.getOriginalFilename());
                if (extension == null) extension = "jpg";
                String nombreFichero = UUID.randomUUID().toString() + "." + extension;
                Path destino = Paths.get(uploadDir, "presupuestos").toAbsolutePath().normalize();
                Files.createDirectories(destino);
                foto.transferTo(destino.resolve(nombreFichero));
                presupuesto.setFotoNombre("presupuestos/" + nombreFichero);
            } catch (IOException e) {
                throw new RuntimeException("Error al guardar la imagen.", e);
            }
        }

        return presupuestoRepository.save(presupuesto);
    }
}
