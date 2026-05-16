package com.TFG.cerrajeria.catalogo.infrastructure;

import com.TFG.cerrajeria.catalogo.domain.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByActivoTrue();
}
