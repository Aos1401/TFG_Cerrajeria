package com.TFG.cerrajeria.catalogo.infrastructure;

import com.TFG.cerrajeria.catalogo.application.ObtenerProductosUseCase;
import com.TFG.cerrajeria.catalogo.domain.Producto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/catalogo")
public class CatalogoController {

    private final ObtenerProductosUseCase obtenerProductosUseCase;

    public CatalogoController(ObtenerProductosUseCase obtenerProductosUseCase) {
        this.obtenerProductosUseCase = obtenerProductosUseCase;
    }

    @GetMapping("/productos")
    public ResponseEntity<List<Producto>> listar() {
        return ResponseEntity.ok(obtenerProductosUseCase.ejecutar());
    }
}
