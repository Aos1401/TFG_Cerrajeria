package com.TFG.cerrajeria.admin.infrastructure;

import com.TFG.cerrajeria.catalogo.domain.Producto;
import com.TFG.cerrajeria.catalogo.infrastructure.ProductoRepository;
import com.TFG.cerrajeria.presupuesto.domain.EstadoPresupuesto;
import com.TFG.cerrajeria.presupuesto.domain.Presupuesto;
import com.TFG.cerrajeria.presupuesto.infrastructure.PresupuestoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final long MAX_SIZE = 5 * 1024 * 1024;

    @Value("${app.upload.dir}")
    private String uploadDir;

    private final PresupuestoRepository presupuestoRepository;
    private final ProductoRepository productoRepository;

    public AdminController(PresupuestoRepository presupuestoRepository,
                           ProductoRepository productoRepository) {
        this.presupuestoRepository = presupuestoRepository;
        this.productoRepository = productoRepository;
    }

    // ── PRESUPUESTOS ──────────────────────────────────────────────────

    @GetMapping("/presupuestos")
    public List<Presupuesto> listarPresupuestos() {
        return presupuestoRepository.findAll(Sort.by(Sort.Direction.DESC, "fechaSolicitud"));
    }

    @PatchMapping("/presupuestos/{id}")
    public ResponseEntity<Presupuesto> actualizarPresupuesto(
            @PathVariable Long id,
            @RequestBody ActualizarPresupuestoDto dto) {
        return presupuestoRepository.findById(id)
                .map(p -> {
                    if (dto.estado() != null) {
                        p.setEstado(EstadoPresupuesto.valueOf(dto.estado()));
                    }
                    if (dto.respuesta() != null) {
                        p.setRespuesta(dto.respuesta());
                    }
                    return ResponseEntity.ok(presupuestoRepository.save(p));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ── PRODUCTOS ─────────────────────────────────────────────────────

    @GetMapping("/productos")
    public List<Producto> listarProductos() {
        return productoRepository.findAll(Sort.by("id"));
    }

    @PostMapping("/productos")
    public Producto crearProducto(@RequestBody Producto producto) {
        producto.setId(null);
        return productoRepository.save(producto);
    }

    @PutMapping("/productos/{id}")
    public ResponseEntity<Producto> actualizarProducto(
            @PathVariable Long id,
            @RequestBody Producto datos) {
        return productoRepository.findById(id)
                .map(p -> {
                    p.setNombre(datos.getNombre());
                    p.setDescripcion(datos.getDescripcion());
                    p.setPrecio(datos.getPrecio());
                    p.setStock(datos.getStock());
                    p.setCategoria(datos.getCategoria());
                    p.setActivo(datos.getActivo());
                    return ResponseEntity.ok(productoRepository.save(p));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/productos/{id}")
    public ResponseEntity<Void> desactivarProducto(@PathVariable Long id) {
        return productoRepository.findById(id)
                .map(p -> {
                    p.setActivo(false);
                    productoRepository.save(p);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/productos/{id}/eliminar")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        if (!productoRepository.existsById(id)) return ResponseEntity.notFound().build();
        productoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/productos/{id}/activar")
    public ResponseEntity<Producto> activarProducto(@PathVariable Long id) {
        return productoRepository.findById(id)
                .map(p -> {
                    p.setActivo(true);
                    return ResponseEntity.ok(productoRepository.save(p));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/productos/{id}/imagen", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> subirImagenProducto(
            @PathVariable Long id,
            @RequestPart("imagen") MultipartFile imagen) {
        return productoRepository.findById(id).map(p -> {
            String contentType = imagen.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("Solo se permiten archivos de imagen.");
            }
            if (imagen.getSize() > MAX_SIZE) {
                return ResponseEntity.badRequest().body("La imagen no puede superar los 5 MB.");
            }
            try {
                String ext = StringUtils.getFilenameExtension(imagen.getOriginalFilename());
                if (ext == null) ext = "jpg";
                String nombreFichero = UUID.randomUUID().toString() + "." + ext;
                Path destino = Paths.get(uploadDir, "productos").toAbsolutePath().normalize();
                Files.createDirectories(destino);
                imagen.transferTo(destino.resolve(nombreFichero));
                p.setImagenNombre("productos/" + nombreFichero);
                return ResponseEntity.ok(productoRepository.save(p));
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body("Error al guardar la imagen.");
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    record ActualizarPresupuestoDto(String estado, String respuesta) {}
}
