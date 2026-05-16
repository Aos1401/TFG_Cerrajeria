package com.TFG.cerrajeria.carrito.infrastructure;

import com.TFG.cerrajeria.carrito.application.AgregarAlCarritoUseCase;
import com.TFG.cerrajeria.carrito.application.EliminarDelCarritoUseCase;
import com.TFG.cerrajeria.carrito.application.ObtenerCarritoUseCase;
import com.TFG.cerrajeria.carrito.application.RestarCantidadUseCase;
import com.TFG.cerrajeria.carrito.domain.CarritoItem;
import com.TFG.cerrajeria.carrito.domain.CarritoItemResponse;
import com.TFG.cerrajeria.catalogo.infrastructure.ProductoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/carrito")
public class CarritoController {

    private final AgregarAlCarritoUseCase agregarAlCarritoUseCase;
    private final ObtenerCarritoUseCase obtenerCarritoUseCase;
    private final EliminarDelCarritoUseCase eliminarDelCarritoUseCase;
    private final RestarCantidadUseCase restarCantidadUseCase;
    private final CarritoRepository carritoRepository;
    private final ProductoRepository productoRepository;

    public CarritoController(AgregarAlCarritoUseCase agregarAlCarritoUseCase,
                             ObtenerCarritoUseCase obtenerCarritoUseCase,
                             EliminarDelCarritoUseCase eliminarDelCarritoUseCase,
                             RestarCantidadUseCase restarCantidadUseCase,
                             CarritoRepository carritoRepository,
                             ProductoRepository productoRepository) {
        this.agregarAlCarritoUseCase = agregarAlCarritoUseCase;
        this.obtenerCarritoUseCase = obtenerCarritoUseCase;
        this.eliminarDelCarritoUseCase = eliminarDelCarritoUseCase;
        this.restarCantidadUseCase = restarCantidadUseCase;
        this.carritoRepository = carritoRepository;
        this.productoRepository = productoRepository;
    }

    @GetMapping
    public ResponseEntity<List<CarritoItemResponse>> obtener(Authentication authentication) {
        return ResponseEntity.ok(obtenerCarritoUseCase.ejecutar(authentication.getName()));
    }

    @PostMapping("/agregar")
    public ResponseEntity<?> agregar(@RequestBody Map<String, Object> body, Authentication authentication) {
        try {
            Long productoId = Long.valueOf(body.get("productoId").toString());
            int cantidad = Integer.parseInt(body.getOrDefault("cantidad", 1).toString());
            return new ResponseEntity<>(
                    agregarAlCarritoUseCase.ejecutar(authentication.getName(), productoId, cantidad),
                    HttpStatus.CREATED
            );
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<?> eliminar(@PathVariable Long itemId, Authentication authentication) {
        try {
            eliminarDelCarritoUseCase.ejecutar(itemId, authentication.getName());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{itemId}/uno")
    public ResponseEntity<?> restar(@PathVariable Long itemId, Authentication authentication) {
        try {
            restarCantidadUseCase.ejecutar(itemId, authentication.getName());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping
    public ResponseEntity<?> vaciar(Authentication authentication) {
        carritoRepository.deleteByEmailUsuario(authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/confirmar")
    @Transactional
    public ResponseEntity<?> confirmarCompra(Authentication authentication) {
        String email = authentication.getName();
        List<CarritoItem> items = carritoRepository.findByEmailUsuario(email);
        if (items.isEmpty()) {
            return ResponseEntity.badRequest().body("El carrito está vacío.");
        }
        for (CarritoItem item : items) {
            productoRepository.findById(item.getProductoId()).ifPresent(producto -> {
                int nuevoStock = Math.max(0, producto.getStock() - item.getCantidad());
                producto.setStock(nuevoStock);
                productoRepository.save(producto);
            });
        }
        carritoRepository.deleteByEmailUsuario(email);
        return ResponseEntity.ok().build();
    }
}
