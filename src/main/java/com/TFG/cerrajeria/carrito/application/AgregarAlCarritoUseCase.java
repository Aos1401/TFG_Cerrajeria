package com.TFG.cerrajeria.carrito.application;

import com.TFG.cerrajeria.carrito.domain.CarritoItem;
import com.TFG.cerrajeria.carrito.infrastructure.CarritoRepository;
import com.TFG.cerrajeria.catalogo.domain.Producto;
import com.TFG.cerrajeria.catalogo.infrastructure.ProductoRepository;
import org.springframework.stereotype.Service;

@Service
public class AgregarAlCarritoUseCase {

    private final CarritoRepository carritoRepository;
    private final ProductoRepository productoRepository;

    public AgregarAlCarritoUseCase(CarritoRepository carritoRepository,
                                   ProductoRepository productoRepository) {
        this.carritoRepository = carritoRepository;
        this.productoRepository = productoRepository;
    }

    public CarritoItem ejecutar(String emailUsuario, Long productoId, int cantidad) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado."));

        if (!producto.getActivo()) {
            throw new RuntimeException("El producto no está disponible.");
        }

        if (producto.getStock() < cantidad) {
            throw new RuntimeException("Stock insuficiente. Solo quedan " + producto.getStock() + " unidades.");
        }

        // Si ya existe en el carrito, incrementar cantidad
        return carritoRepository
                .findByEmailUsuarioAndProductoId(emailUsuario, productoId)
                .map(item -> {
                    int nuevaCantidad = item.getCantidad() + cantidad;
                    if (nuevaCantidad > producto.getStock()) {
                        throw new RuntimeException("Stock insuficiente.");
                    }
                    item.setCantidad(nuevaCantidad);
                    return carritoRepository.save(item);
                })
                .orElseGet(() -> carritoRepository.save(
                        new CarritoItem(null, emailUsuario, productoId, cantidad)
                ));
    }
}
