package com.TFG.cerrajeria.carrito.application;

import com.TFG.cerrajeria.carrito.infrastructure.CarritoRepository;
import org.springframework.stereotype.Service;

@Service
public class EliminarDelCarritoUseCase {

    private final CarritoRepository carritoRepository;

    public EliminarDelCarritoUseCase(CarritoRepository carritoRepository) {
        this.carritoRepository = carritoRepository;
    }

    public void ejecutar(Long itemId, String emailUsuario) {
        carritoRepository.findById(itemId).ifPresent(item -> {
            if (!item.getEmailUsuario().equals(emailUsuario)) {
                throw new RuntimeException("No autorizado.");
            }
            carritoRepository.delete(item);
        });
    }
}
