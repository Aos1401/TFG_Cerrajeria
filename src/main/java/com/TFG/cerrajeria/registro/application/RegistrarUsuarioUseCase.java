package com.TFG.cerrajeria.registro.application;

import com.TFG.cerrajeria.registro.domain.Usuario;
import com.TFG.cerrajeria.registro.infrastructure.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class RegistrarUsuarioUseCase {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public RegistrarUsuarioUseCase(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario ejecutar(Usuario nuevoUsuario) {
        if (usuarioRepository.findByEmail(nuevoUsuario.getEmail()).isPresent()) {
            throw new RuntimeException("Ya existe una cuenta con el email " + nuevoUsuario.getEmail());
        }
        nuevoUsuario.setPassword(passwordEncoder.encode(nuevoUsuario.getPassword()));
        nuevoUsuario.setRol("ROLE_USER");
        return usuarioRepository.save(nuevoUsuario);
    }
}
