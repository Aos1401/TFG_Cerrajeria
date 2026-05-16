package com.TFG.cerrajeria.presupuesto.infrastructure;

import com.TFG.cerrajeria.presupuesto.application.CrearPresupuestoUseCase;
import com.TFG.cerrajeria.presupuesto.domain.Presupuesto;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/presupuestos")
public class PresupuestoController {

    private final CrearPresupuestoUseCase crearPresupuestoUseCase;
    private final PresupuestoRepository presupuestoRepository;

    public PresupuestoController(CrearPresupuestoUseCase crearPresupuestoUseCase,
                                 PresupuestoRepository presupuestoRepository) {
        this.crearPresupuestoUseCase = crearPresupuestoUseCase;
        this.presupuestoRepository = presupuestoRepository;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> crear(
            @RequestParam String nombre,
            @RequestParam String telefono,
            @RequestParam String direccionServicio,
            @RequestParam String tipoServicio,
            @RequestParam String descripcion,
            @RequestPart(name = "foto", required = false) MultipartFile foto,
            Authentication authentication) {
        try {
            Presupuesto presupuesto = new Presupuesto();
            presupuesto.setNombre(nombre);
            presupuesto.setTelefono(telefono);
            presupuesto.setDireccionServicio(direccionServicio);
            presupuesto.setTipoServicio(tipoServicio);
            presupuesto.setDescripcion(descripcion);

            String email = authentication.getName();
            Presupuesto creado = crearPresupuestoUseCase.ejecutar(presupuesto, email, foto);
            return new ResponseEntity<>(creado, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al enviar el presupuesto.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/mis-presupuestos")
    public ResponseEntity<List<Presupuesto>> misSolicitudes(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(presupuestoRepository.findByEmailOrderByFechaSolicitudDesc(email));
    }
}
