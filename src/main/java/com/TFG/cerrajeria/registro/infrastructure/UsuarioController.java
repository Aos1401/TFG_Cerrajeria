package com.TFG.cerrajeria.registro.infrastructure;

import com.TFG.cerrajeria.registro.domain.Usuario;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/perfil")
    public ResponseEntity<Map<String, String>> perfil(Authentication authentication) {
        String email = authentication.getName();
        Usuario usuario = usuarioRepository.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(Map.of(
                "nombre",    usuario.getNombre(),
                "apellidos", usuario.getApellidos(),
                "email",     usuario.getEmail(),
                "telefono",  usuario.getTelefono() != null ? usuario.getTelefono() : ""
        ));
    }
}
