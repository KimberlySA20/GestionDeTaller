/**
 * Rutas CRUD para Empleados
 * 
 * Incluye validación de permisos y mensajes de error claros
 */

import { Hono } from "npm:hono";
import * as kv from "../kv_store.tsx";
import { requireAuth, requirePermiso, getUsuarioActual } from "../middleware/auth.tsx";
import * as validador from "../validators/empleado.tsx";

const empleados = new Hono();

// Helper para respuestas de error consistentes
function errorResponse(message: string, code: string, details?: any, status = 400) {
  return {
    error: message,
    code,
    ...(details && { details }),
    timestamp: new Date().toISOString(),
    status,
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

// Generar ID único
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// ============================================
// CREAR EMPLEADO
// ============================================
empleados.post(
  "/",
  requireAuth,
  requirePermiso("empleados:crear"),
  async (c) => {
    try {
      const body = await c.req.json();
      const usuario = getUsuarioActual(c);

      // Validar datos de entrada
      const validation = validador.validarCrearEmpleado(body);
      
      if (!validation.valid) {
        return c.json(
          errorResponse(
            "Datos de empleado inválidos",
            "VALIDATION_ERROR",
            { errors: validation.errors }
          ),
          400
        );
      }

      // Sanitizar datos
      const datosSanitizados = validador.sanitizarEmpleado(body);

      // Crear empleado
      const empleadoId = generateId();
      const empleado = {
        id: empleadoId,
        ...datosSanitizados,
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
        usuario_creacion: usuario?.id || "system",
      };

      // Guardar en KV
      await kv.set(`empleado:${empleadoId}`, empleado);
      
      // Crear índice por teléfono para búsqueda rápida
      if (empleado.telefono) {
        await kv.set(`empleado_by_telefono:${empleado.telefono}`, empleadoId);
      }

      console.log(`✅ Empleado creado: ${empleadoId} - ${empleado.nombre} ${empleado.apellido} (${empleado.rol})`);

      return c.json(
        successResponse(
          { empleado },
          "Empleado creado exitosamente"
        ),
        201
      );
    } catch (error: any) {
      console.error("❌ Error al crear empleado:", error);
      return c.json(
        errorResponse(
          "Error interno al crear empleado",
          "INTERNAL_SERVER_ERROR",
          { message: error.message }
        ),
        500
      );
    }
  }
);

// ============================================
// LISTAR EMPLEADOS CON FILTROS
// ============================================
empleados.get(
  "/",
  requireAuth,
  requirePermiso("empleados:ver"),
  async (c) => {
    try {
      // Obtener parámetros de query para filtros
      const rol = c.req.query("rol");
      const estado = c.req.query("estado");
      const search = c.req.query("search"); // Búsqueda por nombre
      
      // Validar filtros si se proporcionan
      if (rol || estado) {
        const validationFiltros = validador.validarFiltrosEmpleados({ rol, estado });
        if (!validationFiltros.valid) {
          return c.json(
            errorResponse(
              "Filtros inválidos",
              "INVALID_FILTERS",
              { errors: validationFiltros.errors }
            ),
            400
          );
        }
      }

      // Obtener todos los empleados
      const todosEmpleados = await kv.getByPrefix("empleado:");
      
      // Filtrar solo empleados válidos (no índices)
      let empleados = todosEmpleados
        .filter((item: any) => item.value && item.value.id)
        .map((item: any) => item.value);

      // Aplicar filtro por rol
      if (rol) {
        empleados = empleados.filter((emp: any) => emp.rol === rol);
      }

      // Aplicar filtro por estado
      if (estado) {
        empleados = empleados.filter((emp: any) => emp.estado === estado);
      }

      // Aplicar búsqueda por nombre/apellido
      if (search) {
        const searchLower = search.toLowerCase();
        empleados = empleados.filter((emp: any) =>
          emp.nombre.toLowerCase().includes(searchLower) ||
          emp.apellido.toLowerCase().includes(searchLower) ||
          (emp.email && emp.email.toLowerCase().includes(searchLower))
        );
      }

      console.log(`📋 Obtenidos ${empleados.length} empleados${rol ? ` con rol ${rol}` : ""}${estado ? ` con estado ${estado}` : ""}`);

      return c.json(
        successResponse({
          empleados,
          total: empleados.length,
          filtros: {
            ...(rol && { rol }),
            ...(estado && { estado }),
            ...(search && { search }),
          }
        })
      );
    } catch (error: any) {
      console.error("❌ Error al listar empleados:", error);
      return c.json(
        errorResponse(
          "Error interno al listar empleados",
          "INTERNAL_SERVER_ERROR",
          { message: error.message }
        ),
        500
      );
    }
  }
);

// ============================================
// OBTENER EMPLEADO POR ID
// ============================================
empleados.get(
  "/:id",
  requireAuth,
  requirePermiso("empleados:ver"),
  async (c) => {
    try {
      const id = c.req.param("id");

      const empleado = await kv.get(`empleado:${id}`);

      if (!empleado) {
        return c.json(
          errorResponse(
            `Empleado con ID ${id} no encontrado`,
            "EMPLEADO_NOT_FOUND"
          ),
          404
        );
      }

      return c.json(successResponse({ empleado }));
    } catch (error: any) {
      console.error("❌ Error al obtener empleado:", error);
      return c.json(
        errorResponse(
          "Error interno al obtener empleado",
          "INTERNAL_SERVER_ERROR",
          { message: error.message }
        ),
        500
      );
    }
  }
);

// ============================================
// EDITAR EMPLEADO COMPLETO (PUT)
// ============================================
empleados.put(
  "/:id",
  requireAuth,
  requirePermiso("empleados:editar"),
  async (c) => {
    try {
      const id = c.req.param("id");
      const body = await c.req.json();
      const usuario = getUsuarioActual(c);

      // Verificar que el empleado existe
      const empleadoExistente = await kv.get(`empleado:${id}`);

      if (!empleadoExistente) {
        return c.json(
          errorResponse(
            `Empleado con ID ${id} no encontrado`,
            "EMPLEADO_NOT_FOUND"
          ),
          404
        );
      }

      // Validar datos de actualización
      const validation = validador.validarActualizarEmpleado(body);

      if (!validation.valid) {
        return c.json(
          errorResponse(
            "Datos de actualización inválidos",
            "VALIDATION_ERROR",
            { errors: validation.errors }
          ),
          400
        );
      }

      // Sanitizar datos
      const datosSanitizados = validador.sanitizarEmpleado(body);

      // Actualizar empleado
      const empleadoActualizado = {
        ...empleadoExistente,
        ...datosSanitizados,
        id, // Asegurar que el ID no cambie
        fecha_actualizacion: new Date().toISOString(),
        usuario_actualizacion: usuario?.id || "system",
      };

      await kv.set(`empleado:${id}`, empleadoActualizado);

      console.log(`✏️ Empleado actualizado: ${id} - ${empleadoActualizado.nombre} ${empleadoActualizado.apellido}`);

      return c.json(
        successResponse(
          { empleado: empleadoActualizado },
          "Empleado actualizado exitosamente"
        )
      );
    } catch (error: any) {
      console.error("❌ Error al actualizar empleado:", error);
      return c.json(
        errorResponse(
          "Error interno al actualizar empleado",
          "INTERNAL_SERVER_ERROR",
          { message: error.message }
        ),
        500
      );
    }
  }
);

// ============================================
// EDITAR EMPLEADO PARCIAL (PATCH)
// ============================================
empleados.patch(
  "/:id",
  requireAuth,
  requirePermiso("empleados:editar"),
  async (c) => {
    try {
      const id = c.req.param("id");
      const body = await c.req.json();
      const usuario = getUsuarioActual(c);

      // Verificar que el empleado existe
      const empleadoExistente = await kv.get(`empleado:${id}`);

      if (!empleadoExistente) {
        return c.json(
          errorResponse(
            `Empleado con ID ${id} no encontrado`,
            "EMPLEADO_NOT_FOUND"
          ),
          404
        );
      }

      // Validar solo los campos que se están actualizando
      const validation = validador.validarActualizarEmpleado(body);

      if (!validation.valid) {
        return c.json(
          errorResponse(
            "Datos de actualización inválidos",
            "VALIDATION_ERROR",
            { errors: validation.errors }
          ),
          400
        );
      }

      // Sanitizar datos
      const datosSanitizados = validador.sanitizarEmpleado(body);

      // Actualizar solo los campos proporcionados
      const empleadoActualizado = {
        ...empleadoExistente,
        ...datosSanitizados,
        id,
        fecha_actualizacion: new Date().toISOString(),
        usuario_actualizacion: usuario?.id || "system",
      };

      await kv.set(`empleado:${id}`, empleadoActualizado);

      console.log(`✏️ Empleado actualizado parcialmente: ${id}`);

      return c.json(
        successResponse(
          { empleado: empleadoActualizado },
          "Empleado actualizado parcialmente"
        )
      );
    } catch (error: any) {
      console.error("❌ Error al actualizar empleado parcialmente:", error);
      return c.json(
        errorResponse(
          "Error interno al actualizar empleado",
          "INTERNAL_SERVER_ERROR",
          { message: error.message }
        ),
        500
      );
    }
  }
);

// ============================================
// ACTIVAR/INACTIVAR EMPLEADO
// ============================================
empleados.put(
  "/:id/estado",
  requireAuth,
  requirePermiso("empleados:cambiar_estado"),
  async (c) => {
    try {
      const id = c.req.param("id");
      const body = await c.req.json();
      const usuario = getUsuarioActual(c);

      // Verificar que el empleado existe
      const empleadoExistente = await kv.get(`empleado:${id}`);

      if (!empleadoExistente) {
        return c.json(
          errorResponse(
            `Empleado con ID ${id} no encontrado`,
            "EMPLEADO_NOT_FOUND"
          ),
          404
        );
      }

      // Validar el cambio de estado
      const validation = validador.validarCambioEstado(body);

      if (!validation.valid) {
        return c.json(
          errorResponse(
            "Datos de cambio de estado inválidos",
            "VALIDATION_ERROR",
            { errors: validation.errors }
          ),
          400
        );
      }

      const { estado, motivo } = body;

      // Actualizar estado
      const empleadoActualizado = {
        ...empleadoExistente,
        estado,
        fecha_actualizacion: new Date().toISOString(),
        usuario_actualizacion: usuario?.id || "system",
      };

      // Agregar motivo a las notas si se proporciona
      if (motivo) {
        const notaEstado = `[${new Date().toISOString()}] Estado cambiado a "${estado}" por ${usuario?.nombre || "sistema"}. Motivo: ${motivo}`;
        empleadoActualizado.notas = empleadoActualizado.notas
          ? `${empleadoActualizado.notas}\n\n${notaEstado}`
          : notaEstado;
      }

      await kv.set(`empleado:${id}`, empleadoActualizado);

      const accion = estado === "activo" ? "activado" : "inactivado";
      console.log(`🔄 Empleado ${accion}: ${id} - ${empleadoActualizado.nombre} ${empleadoActualizado.apellido}`);

      return c.json(
        successResponse(
          { empleado: empleadoActualizado },
          `Empleado ${accion} exitosamente`
        )
      );
    } catch (error: any) {
      console.error("❌ Error al cambiar estado de empleado:", error);
      return c.json(
        errorResponse(
          "Error interno al cambiar estado de empleado",
          "INTERNAL_SERVER_ERROR",
          { message: error.message }
        ),
        500
      );
    }
  }
);

// ============================================
// ELIMINAR EMPLEADO (SOFT DELETE)
// ============================================
empleados.delete(
  "/:id",
  requireAuth,
  requirePermiso("empleados:eliminar"),
  async (c) => {
    try {
      const id = c.req.param("id");
      const usuario = getUsuarioActual(c);

      // Verificar que el empleado existe
      const empleadoExistente = await kv.get(`empleado:${id}`);

      if (!empleadoExistente) {
        return c.json(
          errorResponse(
            `Empleado con ID ${id} no encontrado`,
            "EMPLEADO_NOT_FOUND"
          ),
          404
        );
      }

      // Soft delete: cambiar estado a inactivo
      const empleadoActualizado = {
        ...empleadoExistente,
        estado: "inactivo",
        fecha_actualizacion: new Date().toISOString(),
        usuario_actualizacion: usuario?.id || "system",
        notas: empleadoExistente.notas
          ? `${empleadoExistente.notas}\n\n[${new Date().toISOString()}] Empleado eliminado (soft delete) por ${usuario?.nombre || "sistema"}`
          : `[${new Date().toISOString()}] Empleado eliminado (soft delete) por ${usuario?.nombre || "sistema"}`,
      };

      await kv.set(`empleado:${id}`, empleadoActualizado);

      console.log(`🗑️ Empleado eliminado (soft delete): ${id} - ${empleadoActualizado.nombre} ${empleadoActualizado.apellido}`);

      return c.json(
        successResponse(
          { empleado: empleadoActualizado },
          "Empleado desactivado exitosamente"
        )
      );
    } catch (error: any) {
      console.error("❌ Error al eliminar empleado:", error);
      return c.json(
        errorResponse(
          "Error interno al eliminar empleado",
          "INTERNAL_SERVER_ERROR",
          { message: error.message }
        ),
        500
      );
    }
  }
);

export default empleados;
