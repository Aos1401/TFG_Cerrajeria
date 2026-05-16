package com.TFG.cerrajeria.carrito.infrastructure;

import com.TFG.cerrajeria.carrito.domain.CarritoItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CarritoRepository extends JpaRepository<CarritoItem, Long> {
    List<CarritoItem> findByEmailUsuario(String emailUsuario);
    Optional<CarritoItem> findByEmailUsuarioAndProductoId(String emailUsuario, Long productoId);
    void deleteByEmailUsuario(String emailUsuario);
}
