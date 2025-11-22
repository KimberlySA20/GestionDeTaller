/**
 * Validadores para el modelo de Empleado
 * 
 * Proporciona validación de datos con mensajes de error claros
 */

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Roles válidos
const ROLES_VALIDOS = [
  "mecanico",
  "electricista", 
  "chapista",
  "pintor",
  "gerente",
  "administrativo",
  "recepcionista",
  "diagnostico",
  "jefe_taller",
  "ayudante",
  "otro"
];

// Estados válidos
const ESTADOS_VALIDOS = ["activo", "inactivo"];

/**
 * Valida los datos para crear un empleado
 */
export function validarCrearEmpleado(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Validar nombre
  if (!data.nombre || typeof data.nombre !== "string") {
    errors.push({
      field: "nombre",
      message: "El nombre es obligatorio y debe ser un texto",
      code: "NOMBRE_REQUIRED"
    });
  } else {
    const nombreTrimmed = data.nombre.trim();
    if (nombreTrimmed.length === 0) {
      errors.push({
        field: "nombre",
        message: "El nombre no puede estar vacío",
        code: "NOMBRE_EMPTY"
      });
    } else if (nombreTrimmed.length > 100) {
      errors.push({
        field: "nombre",
        message: "El nombre no puede exceder 100 caracteres",
        code: "NOMBRE_TOO_LONG"
      });
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreTrimmed)) {
      errors.push({
        field: "nombre",
        message: "El nombre solo puede contener letras y espacios",
        code: "NOMBRE_INVALID_FORMAT"
      });
    }
  }

  // Validar apellido
  if (!data.apellido || typeof data.apellido !== "string") {
    errors.push({
      field: "apellido",
      message: "El apellido es obligatorio y debe ser un texto",
      code: "APELLIDO_REQUIRED"
    });
  } else {
    const apellidoTrimmed = data.apellido.trim();
    if (apellidoTrimmed.length === 0) {
      errors.push({
        field: "apellido",
        message: "El apellido no puede estar vacío",
        code: "APELLIDO_EMPTY"
      });
    } else if (apellidoTrimmed.length > 100) {
      errors.push({
        field: "apellido",
        message: "El apellido no puede exceder 100 caracteres",
        code: "APELLIDO_TOO_LONG"
      });
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellidoTrimmed)) {
      errors.push({
        field: "apellido",
        message: "El apellido solo puede contener letras y espacios",
        code: "APELLIDO_INVALID_FORMAT"
      });
    }
  }

  // Validar rol
  if (!data.rol) {
    errors.push({
      field: "rol",
      message: "El rol es obligatorio",
      code: "ROL_REQUIRED"
    });
  } else if (!ROLES_VALIDOS.includes(data.rol)) {
    errors.push({
      field: "rol",
      message: `El rol "${data.rol}" no es válido. Roles válidos: ${ROLES_VALIDOS.join(", ")}`,
      code: "ROL_INVALID"
    });
  }

  // Validar estado
  if (!data.estado) {
    errors.push({
      field: "estado",
      message: "El estado es obligatorio",
      code: "ESTADO_REQUIRED"
    });
  } else if (!ESTADOS_VALIDOS.includes(data.estado)) {
    errors.push({
      field: "estado",
      message: `El estado "${data.estado}" no es válido. Estados válidos: ${ESTADOS_VALIDOS.join(", ")}`,
      code: "ESTADO_INVALID"
    });
  }

  // Validar teléfono
  if (!data.telefono || typeof data.telefono !== "string") {
    errors.push({
      field: "telefono",
      message: "El teléfono es obligatorio y debe ser un texto",
      code: "TELEFONO_REQUIRED"
    });
  } else {
    const telefonoLimpio = data.telefono.replace(/[\s\-()]/g, "");
    if (telefonoLimpio.length < 8) {
      errors.push({
        field: "telefono",
        message: "El teléfono debe tener al menos 8 dígitos",
        code: "TELEFONO_TOO_SHORT"
      });
    } else if (telefonoLimpio.length > 20) {
      errors.push({
        field: "telefono",
        message: "El teléfono no puede exceder 20 caracteres",
        code: "TELEFONO_TOO_LONG"
      });
    } else if (!/^\+?[0-9\s\-()]+$/.test(data.telefono)) {
      errors.push({
        field: "telefono",
        message: "El teléfono solo puede contener números, espacios, guiones y paréntesis",
        code: "TELEFONO_INVALID_FORMAT"
      });
    }
  }

  // Validar email (opcional)
  if (data.email && data.email.trim() !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push({
        field: "email",
        message: "El formato del email no es válido",
        code: "EMAIL_INVALID_FORMAT"
      });
    } else if (data.email.length > 255) {
      errors.push({
        field: "email",
        message: "El email no puede exceder 255 caracteres",
        code: "EMAIL_TOO_LONG"
      });
    }
  }

  // Validar teléfono secundario (opcional)
  if (data.telefono_secundario && data.telefono_secundario.trim() !== "") {
    const telefonoLimpio = data.telefono_secundario.replace(/[\s\-()]/g, "");
    if (telefonoLimpio.length < 8) {
      errors.push({
        field: "telefono_secundario",
        message: "El teléfono secundario debe tener al menos 8 dígitos",
        code: "TELEFONO_SECUNDARIO_TOO_SHORT"
      });
    } else if (!/^\+?[0-9\s\-()]+$/.test(data.telefono_secundario)) {
      errors.push({
        field: "telefono_secundario",
        message: "El teléfono secundario solo puede contener números, espacios, guiones y paréntesis",
        code: "TELEFONO_SECUNDARIO_INVALID_FORMAT"
      });
    }
  }

  // Validar salario (opcional)
  if (data.salario !== undefined && data.salario !== null) {
    if (typeof data.salario !== "number") {
      errors.push({
        field: "salario",
        message: "El salario debe ser un número",
        code: "SALARIO_INVALID_TYPE"
      });
    } else if (data.salario < 0) {
      errors.push({
        field: "salario",
        message: "El salario no puede ser negativo",
        code: "SALARIO_NEGATIVE"
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida los datos para actualizar un empleado
 */
export function validarActualizarEmpleado(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Si se envía nombre, validarlo
  if (data.nombre !== undefined) {
    if (typeof data.nombre !== "string") {
      errors.push({
        field: "nombre",
        message: "El nombre debe ser un texto",
        code: "NOMBRE_INVALID_TYPE"
      });
    } else {
      const nombreTrimmed = data.nombre.trim();
      if (nombreTrimmed.length === 0) {
        errors.push({
          field: "nombre",
          message: "El nombre no puede estar vacío",
          code: "NOMBRE_EMPTY"
        });
      } else if (nombreTrimmed.length > 100) {
        errors.push({
          field: "nombre",
          message: "El nombre no puede exceder 100 caracteres",
          code: "NOMBRE_TOO_LONG"
        });
      }
    }
  }

  // Si se envía apellido, validarlo
  if (data.apellido !== undefined) {
    if (typeof data.apellido !== "string") {
      errors.push({
        field: "apellido",
        message: "El apellido debe ser un texto",
        code: "APELLIDO_INVALID_TYPE"
      });
    } else {
      const apellidoTrimmed = data.apellido.trim();
      if (apellidoTrimmed.length === 0) {
        errors.push({
          field: "apellido",
          message: "El apellido no puede estar vacío",
          code: "APELLIDO_EMPTY"
        });
      } else if (apellidoTrimmed.length > 100) {
        errors.push({
          field: "apellido",
          message: "El apellido no puede exceder 100 caracteres",
          code: "APELLIDO_TOO_LONG"
        });
      }
    }
  }

  // Si se envía rol, validarlo
  if (data.rol !== undefined && !ROLES_VALIDOS.includes(data.rol)) {
    errors.push({
      field: "rol",
      message: `El rol "${data.rol}" no es válido. Roles válidos: ${ROLES_VALIDOS.join(", ")}`,
      code: "ROL_INVALID"
    });
  }

  // Si se envía estado, validarlo
  if (data.estado !== undefined && !ESTADOS_VALIDOS.includes(data.estado)) {
    errors.push({
      field: "estado",
      message: `El estado "${data.estado}" no es válido. Estados válidos: ${ESTADOS_VALIDOS.join(", ")}`,
      code: "ESTADO_INVALID"
    });
  }

  // Si se envía teléfono, validarlo
  if (data.telefono !== undefined) {
    if (typeof data.telefono !== "string") {
      errors.push({
        field: "telefono",
        message: "El teléfono debe ser un texto",
        code: "TELEFONO_INVALID_TYPE"
      });
    } else {
      const telefonoLimpio = data.telefono.replace(/[\s\-()]/g, "");
      if (telefonoLimpio.length < 8) {
        errors.push({
          field: "telefono",
          message: "El teléfono debe tener al menos 8 dígitos",
          code: "TELEFONO_TOO_SHORT"
        });
      }
    }
  }

  // Si se envía email, validarlo
  if (data.email !== undefined && data.email !== "" && data.email !== null) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push({
        field: "email",
        message: "El formato del email no es válido",
        code: "EMAIL_INVALID_FORMAT"
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida el cambio de estado
 */
export function validarCambioEstado(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.estado) {
    errors.push({
      field: "estado",
      message: "El estado es obligatorio",
      code: "ESTADO_REQUIRED"
    });
  } else if (!ESTADOS_VALIDOS.includes(data.estado)) {
    errors.push({
      field: "estado",
      message: `El estado "${data.estado}" no es válido. Estados válidos: ${ESTADOS_VALIDOS.join(", ")}`,
      code: "ESTADO_INVALID"
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida los parámetros de filtro para listar empleados
 */
export function validarFiltrosEmpleados(params: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Validar rol si se proporciona
  if (params.rol && !ROLES_VALIDOS.includes(params.rol)) {
    errors.push({
      field: "rol",
      message: `El rol de filtro "${params.rol}" no es válido. Roles válidos: ${ROLES_VALIDOS.join(", ")}`,
      code: "FILTRO_ROL_INVALID"
    });
  }

  // Validar estado si se proporciona
  if (params.estado && !ESTADOS_VALIDOS.includes(params.estado)) {
    errors.push({
      field: "estado",
      message: `El estado de filtro "${params.estado}" no es válido. Estados válidos: ${ESTADOS_VALIDOS.join(", ")}`,
      code: "FILTRO_ESTADO_INVALID"
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sanitiza los datos de un empleado antes de guardar
 */
export function sanitizarEmpleado(data: any): any {
  const sanitizado: any = {};

  // Sanitizar strings (trim)
  const stringFields = [
    "nombre", "apellido", "email", "telefono", "telefono_secundario",
    "direccion", "ciudad", "codigo_postal", "numero_documento",
    "especialidad", "notas"
  ];

  stringFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null) {
      const valor = String(data[field]).trim();
      if (valor !== "") {
        sanitizado[field] = field === "email" ? valor.toLowerCase() : valor;
      }
    }
  });

  // Copiar campos que no necesitan sanitización
  const directFields = [
    "rol", "estado", "salario", "fecha_ingreso", "certificaciones",
    "nivel_experiencia", "foto_url", "campos_adicionales"
  ];

  directFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null) {
      sanitizado[field] = data[field];
    }
  });

  return sanitizado;
}
