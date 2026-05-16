package com.TFG.cerrajeria.presupuesto.infrastructure;

import com.TFG.cerrajeria.presupuesto.domain.Presupuesto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PresupuestoRepository extends JpaRepository<Presupuesto, Long> {
    List<Presupuesto> findByEmailOrderByFechaSolicitudDesc(String email);
}
