package com.TFG.cerrajeria.catalogo.infrastructure;

import com.TFG.cerrajeria.catalogo.domain.Producto;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class ProductoDataInitializer implements CommandLineRunner {

    private final ProductoRepository productoRepository;

    public ProductoDataInitializer(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @Override
    public void run(String... args) {
        if (productoRepository.count() > 0) return;

        productoRepository.saveAll(List.of(
            new Producto(null, "Cerradura de seguridad Tesa",
                "Cerradura de seguridad con tecnología antibumping y antipicking. Ideal para puertas de entrada.",
                new BigDecimal("89.99"), 15, "Cerraduras", true, null),

            new Producto(null, "Bombín de alta seguridad",
                "Bombín europeo de alta seguridad con llave de puntos. Compatible con la mayoría de cerraduras.",
                new BigDecimal("45.00"), 20, "Bombines", true, null),

            new Producto(null, "Candado arco largo",
                "Candado de acero inoxidable con arco largo. Resistente a cortes y palancas. Ideal para exterior.",
                new BigDecimal("28.50"), 30, "Candados", true, null),

            new Producto(null, "Cerrojo de seguridad doble",
                "Cerrojo de doble acción para reforzar la seguridad de puertas. Instalación sencilla.",
                new BigDecimal("35.00"), 25, "Cerrojos", true, null),

            new Producto(null, "Escudo protector de bombín",
                "Escudo de acero templado para proteger el bombín frente a taladros y extracción forzada.",
                new BigDecimal("22.00"), 40, "Accesorios", true, null),

            new Producto(null, "Cerradura antibumping premium",
                "Cerradura de máxima seguridad con protección total antibumping, antipicking y antitaladro.",
                new BigDecimal("119.99"), 10, "Cerraduras", true, null),

            new Producto(null, "Pestillo de seguridad",
                "Pestillo adicional para puertas. Aumenta la resistencia sin necesidad de obra.",
                new BigDecimal("19.50"), 50, "Cerrojos", true, null),

            new Producto(null, "Llave de seguridad con tarjeta",
                "Llave de puntos con tarjeta de propiedad. Solo se puede duplicar con la tarjeta original.",
                new BigDecimal("15.99"), 60, "Llaves", true, null)
        ));
    }
}
