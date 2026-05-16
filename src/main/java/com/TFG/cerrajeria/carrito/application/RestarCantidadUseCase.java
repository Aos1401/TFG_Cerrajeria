package com.TFG.cerrajeria.carrito.application;

import com.TFG.cerrajeria.carrito.domain.CarritoItem;
import com.TFG.cerrajeria.carrito.infrastructure.CarritoRepository;
import org.springframework.stereotype.Service;

@Service
public class RestarCantidadUseCase {

    private final CarritoRepository carritoRepository;

    public RestarCantidadUseCase(CarritoRepository carritoRepository) {
        this.carritoRepository = carritoRepository;
    }

    public void ejecutar(Long itemId, String emailUsuario) {
        CarritoItem item = carritoRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item no encontrado."));

        if (!item.getEmailUsuario().equals(emailUsuario)) {
            throw new RuntimeException("Sin permiso.");
        }

        if (item.getCantidad() <= 1) {
            carritoRepository.delete(item);
        } else {
            item.setCantidad(item.getCantidad() - 1);
            carritoRepository.save(item);
        }
    }
}
