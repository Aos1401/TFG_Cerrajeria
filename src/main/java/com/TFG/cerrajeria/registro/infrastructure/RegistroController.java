package com.TFG.cerrajeria.registro.infrastructure;

import com.TFG.cerrajeria.registro.application.RegistrarUsuarioUseCase;
import com.TFG.cerrajeria.registro.domain.Usuario;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/registro")
public class RegistroController {

    private final RegistrarUsuarioUseCase registrarUsuarioUseCase;

    public RegistroController(RegistrarUsuarioUseCase registrarUsuarioUseCase) {
        this.registrarUsuarioUseCase = registrarUsuarioUseCase;
    }

    @PostMapping
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        try {
            Usuario creado = registrarUsuarioUseCase.ejecutar(usuario);
            return new ResponseEntity<>(creado, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
