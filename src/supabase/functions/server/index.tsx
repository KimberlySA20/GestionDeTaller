import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { requireAuth, requirePermiso, optionalAuth, getUsuarioActual } from "./middleware/auth.tsx";
import * as validadorEmpleado from "./validators/empleado.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ============================================
// UTILIDADES Y HELPERS
// ============================================

// Generar ID único
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Helper para respuestas de error consistentes
function errorResponse(message: string, code: string, details?: any) {
  return {
    error: message,
    code,
    ...(details && { details }),
    timestamp: new Date().toISOString(),
  };
}

// Helper para respuestas exitosas consistentes
function successResponse(data: any, message?: string) {
  return {
    success: true,
    ...(message && { message }),
    data,
    timestamp: new Date().toISOString(),
  };
}

// ============================================
// CLIENTES
// ============================================

// Crear cliente
app.post("/make-server-89b561df/clientes", async (c) => {
  try {
    const body = await c.req.json();
    const {
      nombre,
      apellido,
      email,
      telefono,
      telefono_secundario,
      direccion,
      ciudad,
      codigo_postal,
      tipo_documento,
      numero_documento,
      notas
    } = body;

    // Validaciones básicas
    if (!nombre || !telefono) {
      return c.json({ error: "Nombre y teléfono son obligatorios" }, 400);
    }

    const clienteId = generateId();
    const cliente = {
      id: clienteId,
      nombre,
      apellido: apellido || "",
      email: email || "",
      telefono,
      telefono_secundario: telefono_secundario || "",
      direccion: direccion || "",
      ciudad: ciudad || "",
      codigo_postal: codigo_postal || "",
      tipo_documento: tipo_documento || "",
      numero_documento: numero_documento || "",
      notas: notas || "",
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString(),
    };

    await kv.set(`cliente:${clienteId}`, cliente);
    await kv.set(`cliente_by_telefono:${telefono}`, clienteId);

    console.log(`Cliente creado: ${clienteId}`);
    return c.json({ success: true, cliente });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return c.json({ error: `Error al crear cliente: ${error.message}` }, 500);
  }
});

// Obtener todos los clientes
app.get("/make-server-89b561df/clientes", async (c) => {
  try {
    const clientes = await kv.getByPrefix("cliente:");
    // Filtrar solo los clientes (no los índices por teléfono)
    const clientesData = clientes.filter((item: any) => item.value && item.value.id);
    console.log(`Obtenidos ${clientesData.length} clientes`);
    return c.json({ clientes: clientesData.map((item: any) => item.value) });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return c.json({ error: `Error al obtener clientes: ${error.message}` }, 500);
  }
});

// Obtener cliente por ID
app.get("/make-server-89b561df/clientes/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const cliente = await kv.get(`cliente:${id}`);
    
    if (!cliente) {
      return c.json({ error: "Cliente no encontrado" }, 404);
    }
    
    return c.json({ cliente });
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    return c.json({ error: `Error al obtener cliente: ${error.message}` }, 500);
  }
});

// Actualizar cliente
app.put("/make-server-89b561df/clientes/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const clienteExistente = await kv.get(`cliente:${id}`);
    
    if (!clienteExistente) {
      return c.json({ error: "Cliente no encontrado" }, 404);
    }

    const clienteActualizado = {
      ...clienteExistente,
      ...body,
      id, // Asegurar que el ID no cambie
      fecha_actualizacion: new Date().toISOString(),
    };

    await kv.set(`cliente:${id}`, clienteActualizado);
    console.log(`Cliente actualizado: ${id}`);
    return c.json({ success: true, cliente: clienteActualizado });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    return c.json({ error: `Error al actualizar cliente: ${error.message}` }, 500);
  }
});

// ============================================
// EMPLEADOS
// ============================================

// Crear empleado
app.post("/make-server-89b561df/empleados", async (c) => {
  try {
    const body = await c.req.json();
    const {
      nombre,
      apellido,
      rol,
      estado,
      telefono,
      email,
      telefono_secundario,
      direccion,
      ciudad,
      codigo_postal,
      tipo_documento,
      numero_documento,
      fecha_ingreso,
      salario,
      especialidad,
      certificaciones,
      nivel_experiencia,
      notas,
      foto_url,
      campos_adicionales
    } = body;

    // Validaciones de campos obligatorios
    if (!nombre || !apellido || !rol || !estado || !telefono) {
      return c.json({ 
        error: "Nombre, apellido, rol, estado y teléfono son obligatorios" 
      }, 400);
    }

    // Validar que el rol sea válido
    const rolesValidos = [
      "mecanico", "electricista", "chapista", "pintor",
      "gerente", "administrativo", "recepcionista",
      "diagnostico", "jefe_taller", "ayudante", "otro"
    ];
    if (!rolesValidos.includes(rol)) {
      return c.json({ error: `El rol "${rol}" no es válido` }, 400);
    }

    // Validar que el estado sea válido
    const estadosValidos = ["activo", "inactivo"];
    if (!estadosValidos.includes(estado)) {
      return c.json({ error: `El estado "${estado}" no es válido` }, 400);
    }

    const empleadoId = generateId();
    const empleado = {
      id: empleadoId,
      // Campos obligatorios
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      rol,
      estado,
      telefono: telefono.trim(),
      // Campos opcionales
      email: email ? email.trim().toLowerCase() : "",
      telefono_secundario: telefono_secundario || "",
      direccion: direccion || "",
      ciudad: ciudad || "",
      codigo_postal: codigo_postal || "",
      tipo_documento: tipo_documento || "DNI",
      numero_documento: numero_documento || "",
      fecha_ingreso: fecha_ingreso || "",
      salario: salario || 0,
      especialidad: especialidad || "",
      certificaciones: certificaciones || [],
      nivel_experiencia: nivel_experiencia || "",
      notas: notas || "",
      foto_url: foto_url || "",
      // Metadatos
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString(),
      // Extensibilidad
      campos_adicionales: campos_adicionales || {}
    };

    await kv.set(`empleado:${empleadoId}`, empleado);
    await kv.set(`empleado_by_telefono:${telefono}`, empleadoId);

    console.log(`Empleado creado: ${empleadoId} - ${nombre} ${apellido} (${rol})`);
    return c.json({ success: true, empleado });
  } catch (error) {
    console.error("Error al crear empleado:", error);
    return c.json({ error: `Error al crear empleado: ${error.message}` }, 500);
  }
});

// Obtener todos los empleados
app.get("/make-server-89b561df/empleados", async (c) => {
  try {
    const empleados = await kv.getByPrefix("empleado:");
    // Filtrar solo los empleados (no los índices por teléfono)
    const empleadosData = empleados.filter((item: any) => item.value && item.value.id);
    console.log(`Obtenidos ${empleadosData.length} empleados`);
    return c.json({ empleados: empleadosData.map((item: any) => item.value) });
  } catch (error) {
    console.error("Error al obtener empleados:", error);
    return c.json({ error: `Error al obtener empleados: ${error.message}` }, 500);
  }
});

// Obtener empleado por ID
app.get("/make-server-89b561df/empleados/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const empleado = await kv.get(`empleado:${id}`);
    
    if (!empleado) {
      return c.json({ error: "Empleado no encontrado" }, 404);
    }
    
    return c.json({ empleado });
  } catch (error) {
    console.error("Error al obtener empleado:", error);
    return c.json({ error: `Error al obtener empleado: ${error.message}` }, 500);
  }
});

// Actualizar empleado
app.put("/make-server-89b561df/empleados/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const empleadoExistente = await kv.get(`empleado:${id}`);
    
    if (!empleadoExistente) {
      return c.json({ error: "Empleado no encontrado" }, 404);
    }

    // Si se actualiza el rol o estado, validar
    if (body.rol) {
      const rolesValidos = [
        "mecanico", "electricista", "chapista", "pintor",
        "gerente", "administrativo", "recepcionista",
        "diagnostico", "jefe_taller", "ayudante", "otro"
      ];
      if (!rolesValidos.includes(body.rol)) {
        return c.json({ error: `El rol "${body.rol}" no es válido` }, 400);
      }
    }

    if (body.estado) {
      const estadosValidos = ["activo", "inactivo"];
      if (!estadosValidos.includes(body.estado)) {
        return c.json({ error: `El estado "${body.estado}" no es válido` }, 400);
      }
    }

    const empleadoActualizado = {
      ...empleadoExistente,
      ...body,
      id, // Asegurar que el ID no cambie
      fecha_actualizacion: new Date().toISOString(),
    };

    await kv.set(`empleado:${id}`, empleadoActualizado);
    console.log(`Empleado actualizado: ${id}`);
    return c.json({ success: true, empleado: empleadoActualizado });
  } catch (error) {
    console.error("Error al actualizar empleado:", error);
    return c.json({ error: `Error al actualizar empleado: ${error.message}` }, 500);
  }
});

// Actualizar empleado parcialmente (PATCH)
app.patch("/make-server-89b561df/empleados/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const empleadoExistente = await kv.get(`empleado:${id}`);
    
    if (!empleadoExistente) {
      return c.json({ error: "Empleado no encontrado" }, 404);
    }

    const empleadoActualizado = {
      ...empleadoExistente,
      ...body,
      id,
      fecha_actualizacion: new Date().toISOString(),
    };

    await kv.set(`empleado:${id}`, empleadoActualizado);
    console.log(`Empleado actualizado parcialmente: ${id}`);
    return c.json({ success: true, empleado: empleadoActualizado });
  } catch (error) {
    console.error("Error al actualizar empleado:", error);
    return c.json({ error: `Error al actualizar empleado: ${error.message}` }, 500);
  }
});

// Cambiar estado de empleado (activo/inactivo)
app.put("/make-server-89b561df/empleados/:id/estado", async (c) => {
  try {
    const id = c.req.param("id");
    const { estado, motivo } = await c.req.json();
    const empleadoExistente = await kv.get(`empleado:${id}`);
    
    if (!empleadoExistente) {
      return c.json({ error: "Empleado no encontrado" }, 404);
    }

    const estadosValidos = ["activo", "inactivo"];
    if (!estadosValidos.includes(estado)) {
      return c.json({ error: `El estado "${estado}" no es válido` }, 400);
    }

    const empleadoActualizado = {
      ...empleadoExistente,
      estado,
      fecha_actualizacion: new Date().toISOString(),
    };

    // Si hay un motivo, agregarlo a las notas
    if (motivo) {
      const notaEstado = `${new Date().toISOString()}: Estado cambiado a ${estado}. Motivo: ${motivo}`;
      empleadoActualizado.notas = empleadoActualizado.notas 
        ? `${empleadoActualizado.notas}\n${notaEstado}`
        : notaEstado;
    }

    await kv.set(`empleado:${id}`, empleadoActualizado);
    console.log(`Estado de empleado actualizado: ${id} -> ${estado}`);
    return c.json({ success: true, empleado: empleadoActualizado });
  } catch (error) {
    console.error("Error al actualizar estado de empleado:", error);
    return c.json({ error: `Error al actualizar estado: ${error.message}` }, 500);
  }
});

// Obtener empleados por rol
app.get("/make-server-89b561df/empleados/rol/:rol", async (c) => {
  try {
    const rol = c.req.param("rol");
    const todosEmpleados = await kv.getByPrefix("empleado:");
    const empleadosData = todosEmpleados.filter((item: any) => 
      item.value && item.value.id && item.value.rol === rol
    );
    
    console.log(`Obtenidos ${empleadosData.length} empleados con rol ${rol}`);
    return c.json({ empleados: empleadosData.map((item: any) => item.value) });
  } catch (error) {
    console.error("Error al obtener empleados por rol:", error);
    return c.json({ error: `Error al obtener empleados: ${error.message}` }, 500);
  }
});

// Obtener empleados activos
app.get("/make-server-89b561df/empleados/activos", async (c) => {
  try {
    const todosEmpleados = await kv.getByPrefix("empleado:");
    const empleadosActivos = todosEmpleados.filter((item: any) => 
      item.value && item.value.id && item.value.estado === "activo"
    );
    
    console.log(`Obtenidos ${empleadosActivos.length} empleados activos`);
    return c.json({ empleados: empleadosActivos.map((item: any) => item.value) });
  } catch (error) {
    console.error("Error al obtener empleados activos:", error);
    return c.json({ error: `Error al obtener empleados: ${error.message}` }, 500);
  }
});

// Eliminar empleado (soft delete - cambiar a inactivo)
app.delete("/make-server-89b561df/empleados/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const empleadoExistente = await kv.get(`empleado:${id}`);
    
    if (!empleadoExistente) {
      return c.json({ error: "Empleado no encontrado" }, 404);
    }

    // Soft delete: cambiar estado a inactivo
    const empleadoActualizado = {
      ...empleadoExistente,
      estado: "inactivo",
      fecha_actualizacion: new Date().toISOString(),
      notas: empleadoExistente.notas 
        ? `${empleadoExistente.notas}\n${new Date().toISOString()}: Empleado eliminado (soft delete)`
        : `${new Date().toISOString()}: Empleado eliminado (soft delete)`
    };

    await kv.set(`empleado:${id}`, empleadoActualizado);
    console.log(`Empleado eliminado (soft delete): ${id}`);
    return c.json({ success: true, message: "Empleado desactivado correctamente" });
  } catch (error) {
    console.error("Error al eliminar empleado:", error);
    return c.json({ error: `Error al eliminar empleado: ${error.message}` }, 500);
  }
});

// ============================================
// VEHÍCULOS
// ============================================

// Crear vehículo
app.post("/make-server-89b561df/vehiculos", async (c) => {
  try {
    const body = await c.req.json();
    const {
      cliente_id,
      marca,
      modelo,
      año,
      patente,
      vin,
      color,
      tipo_vehiculo,
      tipo_combustible,
      transmision,
      kilometraje,
      numero_motor,
      numero_chasis,
      cilindrada,
      categoria,
      poliza_seguro,
      compañia_seguro,
      vencimiento_seguro,
      notas
    } = body;

    // Validaciones
    if (!cliente_id || !marca || !modelo || !patente) {
      return c.json({ error: "Cliente, marca, modelo y patente son obligatorios" }, 400);
    }

    const vehiculoId = generateId();
    const vehiculo = {
      id: vehiculoId,
      cliente_id,
      marca,
      modelo,
      año: año || "",
      patente,
      vin: vin || "",
      color: color || "",
      tipo_vehiculo: tipo_vehiculo || "automóvil",
      tipo_combustible: tipo_combustible || "",
      transmision: transmision || "",
      kilometraje: kilometraje || 0,
      numero_motor: numero_motor || "",
      numero_chasis: numero_chasis || "",
      cilindrada: cilindrada || "",
      categoria: categoria || "",
      poliza_seguro: poliza_seguro || "",
      compañia_seguro: compañia_seguro || "",
      vencimiento_seguro: vencimiento_seguro || "",
      notas: notas || "",
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString(),
    };

    await kv.set(`vehiculo:${vehiculoId}`, vehiculo);
    await kv.set(`vehiculo_by_patente:${patente}`, vehiculoId);
    
    // Agregar vehículo a la lista del cliente
    const vehiculosCliente = await kv.get(`vehiculos_cliente:${cliente_id}`) || [];
    vehiculosCliente.push(vehiculoId);
    await kv.set(`vehiculos_cliente:${cliente_id}`, vehiculosCliente);

    console.log(`Vehículo creado: ${vehiculoId}`);
    return c.json({ success: true, vehiculo });
  } catch (error) {
    console.error("Error al crear vehículo:", error);
    return c.json({ error: `Error al crear vehículo: ${error.message}` }, 500);
  }
});

// Obtener todos los vehículos
app.get("/make-server-89b561df/vehiculos", async (c) => {
  try {
    const vehiculos = await kv.getByPrefix("vehiculo:");
    const vehiculosData = vehiculos.filter((item: any) => item.value && item.value.id);
    console.log(`Obtenidos ${vehiculosData.length} vehículos`);
    return c.json({ vehiculos: vehiculosData.map((item: any) => item.value) });
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    return c.json({ error: `Error al obtener vehículos: ${error.message}` }, 500);
  }
});

// Obtener vehículo por ID
app.get("/make-server-89b561df/vehiculos/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const vehiculo = await kv.get(`vehiculo:${id}`);
    
    if (!vehiculo) {
      return c.json({ error: "Vehículo no encontrado" }, 404);
    }
    
    return c.json({ vehiculo });
  } catch (error) {
    console.error("Error al obtener vehículo:", error);
    return c.json({ error: `Error al obtener vehículo: ${error.message}` }, 500);
  }
});

// Obtener vehículos de un cliente
app.get("/make-server-89b561df/clientes/:clienteId/vehiculos", async (c) => {
  try {
    const clienteId = c.req.param("clienteId");
    const vehiculosIds = await kv.get(`vehiculos_cliente:${clienteId}`) || [];
    
    const vehiculos = await Promise.all(
      vehiculosIds.map((id: string) => kv.get(`vehiculo:${id}`))
    );
    
    return c.json({ vehiculos: vehiculos.filter(v => v !== null) });
  } catch (error) {
    console.error("Error al obtener vehículos del cliente:", error);
    return c.json({ error: `Error al obtener vehículos del cliente: ${error.message}` }, 500);
  }
});

// Actualizar vehículo
app.put("/make-server-89b561df/vehiculos/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const vehiculoExistente = await kv.get(`vehiculo:${id}`);
    
    if (!vehiculoExistente) {
      return c.json({ error: "Vehículo no encontrado" }, 404);
    }

    const vehiculoActualizado = {
      ...vehiculoExistente,
      ...body,
      id,
      fecha_actualizacion: new Date().toISOString(),
    };

    await kv.set(`vehiculo:${id}`, vehiculoActualizado);
    console.log(`Vehículo actualizado: ${id}`);
    return c.json({ success: true, vehiculo: vehiculoActualizado });
  } catch (error) {
    console.error("Error al actualizar vehículo:", error);
    return c.json({ error: `Error al actualizar vehículo: ${error.message}` }, 500);
  }
});

// ============================================
// ADMISIONES / INGRESOS
// ============================================

// Crear admisión
app.post("/make-server-89b561df/admisiones", async (c) => {
  try {
    const body = await c.req.json();
    const {
      vehiculo_id,
      cliente_id,
      fecha_ingreso,
      hora_ingreso,
      kilometraje_actual,
      nivel_combustible,
      prioridad,
      estado,
      motivo_ingreso,
      diagnostico_inicial,
      observaciones,
      checklist,
      necesita_remolque,
      fecha_remolque,
      ubicacion_taller,
      responsable,
      numero_orden,
      estimado_dias,
      estimado_costo,
      garantia,
      items_personales,
      condicion_exterior,
      fotos_ingreso
    } = body;

    // Validaciones
    if (!vehiculo_id || !cliente_id) {
      return c.json({ error: "Vehículo y cliente son obligatorios" }, 400);
    }

    if (necesita_remolque && !fecha_remolque) {
      return c.json({ error: "Si necesita remolque, debe especificar fecha de remolque" }, 400);
    }

    const admisionId = generateId();
    const numeroOrden = numero_orden || `ORD-${Date.now()}`;
    
    const admision = {
      id: admisionId,
      vehiculo_id,
      cliente_id,
      numero_orden: numeroOrden,
      fecha_ingreso: fecha_ingreso || new Date().toISOString().split('T')[0],
      hora_ingreso: hora_ingreso || new Date().toISOString().split('T')[1].substring(0, 5),
      kilometraje_actual: kilometraje_actual || 0,
      nivel_combustible: nivel_combustible || "1/4",
      prioridad: prioridad || "media",
      estado: estado || "pendiente",
      motivo_ingreso: motivo_ingreso || "",
      diagnostico_inicial: diagnostico_inicial || "",
      observaciones: observaciones || "",
      checklist: checklist || {},
      necesita_remolque: necesita_remolque || false,
      fecha_remolque: fecha_remolque || "",
      ubicacion_taller: ubicacion_taller || "",
      responsable: responsable || "",
      estimado_dias: estimado_dias || 0,
      estimado_costo: estimado_costo || 0,
      garantia: garantia || false,
      items_personales: items_personales || "",
      condicion_exterior: condicion_exterior || "",
      fotos_ingreso: fotos_ingreso || [],
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString(),
      historial_estados: [{
        estado: estado || "pendiente",
        fecha: new Date().toISOString(),
        notas: "Ingreso inicial"
      }]
    };

    await kv.set(`admision:${admisionId}`, admision);
    await kv.set(`admision_by_orden:${numeroOrden}`, admisionId);
    
    // Agregar admisión a la lista del vehículo
    const admisionesVehiculo = await kv.get(`admisiones_vehiculo:${vehiculo_id}`) || [];
    admisionesVehiculo.push(admisionId);
    await kv.set(`admisiones_vehiculo:${vehiculo_id}`, admisionesVehiculo);

    console.log(`Admisión creada: ${admisionId} - Orden: ${numeroOrden}`);
    return c.json({ success: true, admision });
  } catch (error) {
    console.error("Error al crear admisión:", error);
    return c.json({ error: `Error al crear admisión: ${error.message}` }, 500);
  }
});

// Obtener todas las admisiones
app.get("/make-server-89b561df/admisiones", async (c) => {
  try {
    const admisiones = await kv.getByPrefix("admision:");
    const admisionesData = admisiones.filter((item: any) => item.value && item.value.id);
    console.log(`Obtenidas ${admisionesData.length} admisiones`);
    return c.json({ admisiones: admisionesData.map((item: any) => item.value) });
  } catch (error) {
    console.error("Error al obtener admisiones:", error);
    return c.json({ error: `Error al obtener admisiones: ${error.message}` }, 500);
  }
});

// Obtener admisión por ID
app.get("/make-server-89b561df/admisiones/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const admision = await kv.get(`admision:${id}`);
    
    if (!admision) {
      return c.json({ error: "Admisión no encontrada" }, 404);
    }
    
    return c.json({ admision });
  } catch (error) {
    console.error("Error al obtener admisión:", error);
    return c.json({ error: `Error al obtener admisión: ${error.message}` }, 500);
  }
});

// Actualizar estado de admisión
app.put("/make-server-89b561df/admisiones/:id/estado", async (c) => {
  try {
    const id = c.req.param("id");
    const { estado, notas } = await c.req.json();
    const admisionExistente = await kv.get(`admision:${id}`);
    
    if (!admisionExistente) {
      return c.json({ error: "Admisión no encontrada" }, 404);
    }

    const historialEstados = admisionExistente.historial_estados || [];
    historialEstados.push({
      estado,
      fecha: new Date().toISOString(),
      notas: notas || ""
    });

    const admisionActualizada = {
      ...admisionExistente,
      estado,
      historial_estados: historialEstados,
      fecha_actualizacion: new Date().toISOString(),
    };

    await kv.set(`admision:${id}`, admisionActualizada);
    console.log(`Estado de admisión actualizado: ${id} -> ${estado}`);
    return c.json({ success: true, admision: admisionActualizada });
  } catch (error) {
    console.error("Error al actualizar estado de admisión:", error);
    return c.json({ error: `Error al actualizar estado: ${error.message}` }, 500);
  }
});

// Actualizar admisión
app.put("/make-server-89b561df/admisiones/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const admisionExistente = await kv.get(`admision:${id}`);
    
    if (!admisionExistente) {
      return c.json({ error: "Admisión no encontrada" }, 404);
    }

    const admisionActualizada = {
      ...admisionExistente,
      ...body,
      id,
      fecha_actualizacion: new Date().toISOString(),
    };

    await kv.set(`admision:${id}`, admisionActualizada);
    console.log(`Admisión actualizada: ${id}`);
    return c.json({ success: true, admision: admisionActualizada });
  } catch (error) {
    console.error("Error al actualizar admisión:", error);
    return c.json({ error: `Error al actualizar admisión: ${error.message}` }, 500);
  }
});

// Actualizar admisión parcialmente (PATCH)
app.patch("/make-server-89b561df/admisiones/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const admisionExistente = await kv.get(`admision:${id}`);
    
    if (!admisionExistente) {
      return c.json({ error: "Admisión no encontrada" }, 404);
    }

    const admisionActualizada = {
      ...admisionExistente,
      ...body,
      id,
      fecha_actualizacion: new Date().toISOString(),
    };

    await kv.set(`admision:${id}`, admisionActualizada);
    console.log(`Admisión actualizada parcialmente: ${id}`);
    return c.json({ success: true, admision: admisionActualizada });
  } catch (error) {
    console.error("Error al actualizar admisión:", error);
    return c.json({ error: `Error al actualizar admisión: ${error.message}` }, 500);
  }
});

// ============================================
// TRABAJOS DE REPARACIÓN
// ============================================

// Crear trabajo de reparación
app.post("/make-server-89b561df/trabajos", async (c) => {
  try {
    const body = await c.req.json();
    const {
      admision_id,
      descripcion,
      tipo_trabajo,
      mecanico_asignado,
      estado,
      prioridad,
      fecha_inicio,
      fecha_fin_estimada,
      fecha_fin_real,
      costo_mano_obra,
      repuestos,
      tiempo_estimado_horas,
      tiempo_real_horas,
      notas,
      garantia_trabajo
    } = body;

    if (!admision_id || !descripcion) {
      return c.json({ error: "Admisión y descripción son obligatorios" }, 400);
    }

    const trabajoId = generateId();
    const trabajo = {
      id: trabajoId,
      admision_id,
      descripcion,
      tipo_trabajo: tipo_trabajo || "reparación",
      mecanico_asignado: mecanico_asignado || "",
      estado: estado || "pendiente",
      prioridad: prioridad || "media",
      fecha_inicio: fecha_inicio || "",
      fecha_fin_estimada: fecha_fin_estimada || "",
      fecha_fin_real: fecha_fin_real || "",
      costo_mano_obra: costo_mano_obra || 0,
      repuestos: repuestos || [],
      tiempo_estimado_horas: tiempo_estimado_horas || 0,
      tiempo_real_horas: tiempo_real_horas || 0,
      notas: notas || "",
      garantia_trabajo: garantia_trabajo || false,
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString(),
    };

    await kv.set(`trabajo:${trabajoId}`, trabajo);
    
    // Agregar trabajo a la lista de la admisión
    const trabajosAdmision = await kv.get(`trabajos_admision:${admision_id}`) || [];
    trabajosAdmision.push(trabajoId);
    await kv.set(`trabajos_admision:${admision_id}`, trabajosAdmision);

    console.log(`Trabajo creado: ${trabajoId}`);
    return c.json({ success: true, trabajo });
  } catch (error) {
    console.error("Error al crear trabajo:", error);
    return c.json({ error: `Error al crear trabajo: ${error.message}` }, 500);
  }
});

// Obtener trabajos de una admisión
app.get("/make-server-89b561df/admisiones/:admisionId/trabajos", async (c) => {
  try {
    const admisionId = c.req.param("admisionId");
    const trabajosIds = await kv.get(`trabajos_admision:${admisionId}`) || [];
    
    const trabajos = await Promise.all(
      trabajosIds.map((id: string) => kv.get(`trabajo:${id}`))
    );
    
    return c.json({ trabajos: trabajos.filter(t => t !== null) });
  } catch (error) {
    console.error("Error al obtener trabajos:", error);
    return c.json({ error: `Error al obtener trabajos: ${error.message}` }, 500);
  }
});

// Actualizar trabajo
app.put("/make-server-89b561df/trabajos/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const trabajoExistente = await kv.get(`trabajo:${id}`);
    
    if (!trabajoExistente) {
      return c.json({ error: "Trabajo no encontrado" }, 404);
    }

    const trabajoActualizado = {
      ...trabajoExistente,
      ...body,
      id,
      fecha_actualizacion: new Date().toISOString(),
    };

    await kv.set(`trabajo:${id}`, trabajoActualizado);
    console.log(`Trabajo actualizado: ${id}`);
    return c.json({ success: true, trabajo: trabajoActualizado });
  } catch (error) {
    console.error("Error al actualizar trabajo:", error);
    return c.json({ error: `Error al actualizar trabajo: ${error.message}` }, 500);
  }
});

// Actualizar trabajo parcialmente (PATCH)
app.patch("/make-server-89b561df/trabajos/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const trabajoExistente = await kv.get(`trabajo:${id}`);
    
    if (!trabajoExistente) {
      return c.json({ error: "Trabajo no encontrado" }, 404);
    }

    const trabajoActualizado = {
      ...trabajoExistente,
      ...body,
      id,
      fecha_actualizacion: new Date().toISOString(),
    };

    await kv.set(`trabajo:${id}`, trabajoActualizado);
    console.log(`Trabajo actualizado parcialmente: ${id}`);
    return c.json({ success: true, trabajo: trabajoActualizado });
  } catch (error) {
    console.error("Error al actualizar trabajo:", error);
    return c.json({ error: `Error al actualizar trabajo: ${error.message}` }, 500);
  }
});

// Eliminar trabajo
app.delete("/make-server-89b561df/trabajos/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const trabajoExistente = await kv.get(`trabajo:${id}`);
    
    if (!trabajoExistente) {
      return c.json({ error: "Trabajo no encontrado" }, 404);
    }

    // Eliminar el trabajo
    await kv.delete(`trabajo:${id}`);
    
    // Actualizar la lista de trabajos de la admisión
    const admisionId = trabajoExistente.admision_id;
    const trabajosIds = await kv.get(`trabajos_admision:${admisionId}`) || [];
    const nuevosTrabajos = trabajosIds.filter((tid: string) => tid !== id);
    await kv.set(`trabajos_admision:${admisionId}`, nuevosTrabajos);
    
    console.log(`Trabajo eliminado: ${id}`);
    return c.json({ success: true, message: "Trabajo eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar trabajo:", error);
    return c.json({ error: `Error al eliminar trabajo: ${error.message}` }, 500);
  }
});

// ============================================
// BÚSQUEDA
// ============================================

// Buscar por patente
app.get("/make-server-89b561df/buscar/patente/:patente", async (c) => {
  try {
    const patente = c.req.param("patente");
    const vehiculoId = await kv.get(`vehiculo_by_patente:${patente}`);
    
    if (!vehiculoId) {
      return c.json({ error: "Vehículo no encontrado" }, 404);
    }
    
    const vehiculo = await kv.get(`vehiculo:${vehiculoId}`);
    const cliente = await kv.get(`cliente:${vehiculo.cliente_id}`);
    const admisionesIds = await kv.get(`admisiones_vehiculo:${vehiculoId}`) || [];
    const admisiones = await Promise.all(
      admisionesIds.map((id: string) => kv.get(`admision:${id}`))
    );
    
    return c.json({
      vehiculo,
      cliente,
      admisiones: admisiones.filter(a => a !== null)
    });
  } catch (error) {
    console.error("Error en búsqueda por patente:", error);
    return c.json({ error: `Error en búsqueda: ${error.message}` }, 500);
  }
});

// Buscar por número de orden
app.get("/make-server-89b561df/buscar/orden/:numeroOrden", async (c) => {
  try {
    const numeroOrden = c.req.param("numeroOrden");
    const admisionId = await kv.get(`admision_by_orden:${numeroOrden}`);
    
    if (!admisionId) {
      return c.json({ error: "Orden no encontrada" }, 404);
    }
    
    const admision = await kv.get(`admision:${admisionId}`);
    const vehiculo = await kv.get(`vehiculo:${admision.vehiculo_id}`);
    const cliente = await kv.get(`cliente:${admision.cliente_id}`);
    const trabajosIds = await kv.get(`trabajos_admision:${admisionId}`) || [];
    const trabajos = await Promise.all(
      trabajosIds.map((id: string) => kv.get(`trabajo:${id}`))
    );
    
    return c.json({
      admision,
      vehiculo,
      cliente,
      trabajos: trabajos.filter(t => t !== null)
    });
  } catch (error) {
    console.error("Error en búsqueda por orden:", error);
    return c.json({ error: `Error en búsqueda: ${error.message}` }, 500);
  }
});

// ============================================
// ESTADÍSTICAS Y REPORTES
// ============================================

app.get("/make-server-89b561df/estadisticas", async (c) => {
  try {
    const admisiones = await kv.getByPrefix("admision:");
    const admisionesData = admisiones.filter((item: any) => item.value && item.value.id);
    
    const estadisticas = {
      total_admisiones: admisionesData.length,
      por_estado: {} as Record<string, number>,
      por_prioridad: {} as Record<string, number>,
    };
    
    admisionesData.forEach((item: any) => {
      const admision = item.value;
      // Contar por estado
      estadisticas.por_estado[admision.estado] = (estadisticas.por_estado[admision.estado] || 0) + 1;
      // Contar por prioridad
      estadisticas.por_prioridad[admision.prioridad] = (estadisticas.por_prioridad[admision.prioridad] || 0) + 1;
    });
    
    return c.json({ estadisticas });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return c.json({ error: `Error al obtener estadísticas: ${error.message}` }, 500);
  }
});

// Health check endpoint
app.get("/make-server-89b561df/health", (c) => {
  return c.json({ status: "ok" });
});

Deno.serve(app.fetch);