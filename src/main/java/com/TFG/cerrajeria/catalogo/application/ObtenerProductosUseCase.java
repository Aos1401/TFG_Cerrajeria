package com.TFG.cerrajeria.catalogo.application;

import com.TFG.cerrajeria.catalogo.domain.Producto;
import com.TFG.cerrajeria.catalogo.infrastructure.ProductoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ObtenerProductosUseCase {

    private final ProductoRepository productoRepository;

    public ObtenerProductosUseCase(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<Producto> ejecutar() {
        return productoRepository.findByActivoTrue();
    }
}
