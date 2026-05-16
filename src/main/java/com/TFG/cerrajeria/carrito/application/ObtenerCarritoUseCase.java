package com.TFG.cerrajeria.carrito.application;

import com.TFG.cerrajeria.carrito.domain.CarritoItemResponse;
import com.TFG.cerrajeria.carrito.infrastructure.CarritoRepository;
import com.TFG.cerrajeria.catalogo.infrastructure.ProductoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ObtenerCarritoUseCase {

    private final CarritoRepository carritoRepository;
    private final ProductoRepository productoRepository;

    public ObtenerCarritoUseCase(CarritoRepository carritoRepository,
                                 ProductoRepository productoRepository) {
        this.carritoRepository = carritoRepository;
        this.productoRepository = productoRepository;
    }

    public List<CarritoItemResponse> ejecutar(String emailUsuario) {
        return carritoRepository.findByEmailUsuario(emailUsuario).stream()
                .map(item -> productoRepository.findById(item.getProductoId())
                        .map(producto -> new CarritoItemResponse(
                                item.getId(),
                                producto.getId(),
                                producto.getNombre(),
                                producto.getPrecio(),
                                item.getCantidad(),
                                producto.getPrecio().multiply(java.math.BigDecimal.valueOf(item.getCantidad()))
                        ))
                        .orElse(null))
                .filter(r -> r != null)
                .collect(Collectors.toList());
    }
}
