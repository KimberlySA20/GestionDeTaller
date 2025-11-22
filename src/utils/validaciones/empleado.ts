/**
 * Validaciones para el modelo de Empleado
 * 
 * Este módulo contiene todas las validaciones necesarias para el modelo de empleado,
 * incluyendo validación de campos obligatorios, formatos y reglas de negocio.
 */

import { Empleado, NuevoEmpleado, RolEmpleado, EstadoEmpleado } from "../../types/empleado";

/**
 * Resultado de una validación
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Resultado detallado de validación por campo
 */
export interface DetailedValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
  globalErrors: string[];
  warnings: Record<string, string[]>;
}

/**
 * Valida un empleado completo
 */
export function validarEmpleado(empleado: Partial<Empleado>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar campos obligatorios
  if (!empleado.nombre || empleado.nombre.trim() === "") {
    errors.push("El nombre es obligatorio");
  }
  
  if (!empleado.apellido || empleado.apellido.trim() === "") {
    errors.push("El apellido es obligatorio");
  }
  
  if (!empleado.rol) {
    errors.push("El rol es obligatorio");
  }
  
  if (!empleado.estado) {
    errors.push("El estado es obligatorio");
  }
  
  if (!empleado.telefono || empleado.telefono.trim() === "") {
    errors.push("El teléfono de contacto es obligatorio");
  }

  // Validar longitud de campos
  if (empleado.nombre && empleado.nombre.length > 100) {
    errors.push("El nombre no puede exceder 100 caracteres");
  }

  if (empleado.apellido && empleado.apellido.length > 100) {
    errors.push("El apellido no puede exceder 100 caracteres");
  }

  // Validar formatos
  const formatValidation = validarFormatos(empleado);
  errors.push(...formatValidation.errors);
  warnings.push(...(formatValidation.warnings || []));

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Valida formatos específicos (email, teléfono, etc.)
 */
export function validarFormatos(empleado: Partial<Empleado>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar email
  if (empleado.email && empleado.email.trim() !== "") {
    const emailValidation = validarEmail(empleado.email);
    if (!emailValidation.valid) {
      errors.push(...emailValidation.errors);
    }
  }

  // Validar teléfono principal
  if (empleado.telefono && empleado.telefono.trim() !== "") {
    const telefonoValidation = validarTelefono(empleado.telefono);
    if (!telefonoValidation.valid) {
      errors.push(...telefonoValidation.errors);
    }
  }

  // Validar teléfono secundario
  if (empleado.telefono_secundario && empleado.telefono_secundario.trim() !== "") {
    const telefonoValidation = validarTelefono(empleado.telefono_secundario);
    if (!telefonoValidation.valid) {
      errors.push("El teléfono secundario no es válido");
    }
  }

  // Validar número de documento
  if (empleado.numero_documento && empleado.numero_documento.trim() !== "") {
    const docValidation = validarNumeroDocumento(empleado.numero_documento);
    if (!docValidation.valid) {
      warnings.push(...docValidation.errors);
    }
  }

  // Validar salario
  if (empleado.salario !== undefined) {
    if (empleado.salario < 0) {
      errors.push("El salario no puede ser negativo");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Valida un email
 */
export function validarEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    errors.push("El formato del email no es válido");
  }
  
  if (email.length > 255) {
    errors.push("El email no puede exceder 255 caracteres");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida un teléfono
 */
export function validarTelefono(telefono: string): ValidationResult {
  const errors: string[] = [];
  
  // Limpiar caracteres especiales comunes en teléfonos
  const telefonoLimpio = telefono.replace(/[\s\-()]/g, "");
  
  // Verificar que tenga solo números y posiblemente un '+'
  const telefonoRegex = /^\+?[0-9]+$/;
  
  if (!telefonoRegex.test(telefonoLimpio)) {
    errors.push("El teléfono solo debe contener números, espacios, guiones o paréntesis");
  }
  
  // Verificar longitud mínima
  if (telefonoLimpio.replace(/\+/g, "").length < 8) {
    errors.push("El teléfono debe tener al menos 8 dígitos");
  }
  
  // Verificar longitud máxima
  if (telefonoLimpio.length > 20) {
    errors.push("El teléfono no puede exceder 20 caracteres");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida un número de documento
 */
export function validarNumeroDocumento(numeroDocumento: string): ValidationResult {
  const errors: string[] = [];
  
  // Verificar que no esté vacío
  if (numeroDocumento.trim() === "") {
    errors.push("El número de documento no puede estar vacío");
    return { valid: false, errors };
  }
  
  // Verificar longitud
  if (numeroDocumento.length < 6) {
    errors.push("El número de documento parece ser demasiado corto");
  }
  
  if (numeroDocumento.length > 20) {
    errors.push("El número de documento no puede exceder 20 caracteres");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida campos obligatorios solamente
 */
export function validarCamposObligatorios(empleado: Partial<Empleado>): ValidationResult {
  const errors: string[] = [];

  const camposObligatorios = [
    { campo: "nombre", valor: empleado.nombre, label: "Nombre" },
    { campo: "apellido", valor: empleado.apellido, label: "Apellido" },
    { campo: "rol", valor: empleado.rol, label: "Rol" },
    { campo: "estado", valor: empleado.estado, label: "Estado" },
    { campo: "telefono", valor: empleado.telefono, label: "Teléfono" },
  ];

  camposObligatorios.forEach(({ campo, valor, label }) => {
    if (!valor || (typeof valor === "string" && valor.trim() === "")) {
      errors.push(`${label} es obligatorio`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida que los valores de enumeraciones sean correctos
 */
export function validarEnums(empleado: Partial<Empleado>): ValidationResult {
  const errors: string[] = [];

  // Validar rol
  if (empleado.rol) {
    const rolesValidos: RolEmpleado[] = [
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
    
    if (!rolesValidos.includes(empleado.rol)) {
      errors.push(`El rol "${empleado.rol}" no es válido`);
    }
  }

  // Validar estado
  if (empleado.estado) {
    const estadosValidos: EstadoEmpleado[] = ["activo", "inactivo"];
    
    if (!estadosValidos.includes(empleado.estado)) {
      errors.push(`El estado "${empleado.estado}" no es válido`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validación detallada con errores por campo
 */
export function validarEmpleadoDetallado(empleado: Partial<Empleado>): DetailedValidationResult {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};
  const globalErrors: string[] = [];

  // Validar nombre
  if (!empleado.nombre || empleado.nombre.trim() === "") {
    errors.nombre = ["El nombre es obligatorio"];
  } else if (empleado.nombre.length > 100) {
    errors.nombre = ["El nombre no puede exceder 100 caracteres"];
  }

  // Validar apellido
  if (!empleado.apellido || empleado.apellido.trim() === "") {
    errors.apellido = ["El apellido es obligatorio"];
  } else if (empleado.apellido.length > 100) {
    errors.apellido = ["El apellido no puede exceder 100 caracteres"];
  }

  // Validar rol
  if (!empleado.rol) {
    errors.rol = ["El rol es obligatorio"];
  } else {
    const enumValidation = validarEnums({ rol: empleado.rol });
    if (!enumValidation.valid) {
      errors.rol = enumValidation.errors;
    }
  }

  // Validar estado
  if (!empleado.estado) {
    errors.estado = ["El estado es obligatorio"];
  } else {
    const enumValidation = validarEnums({ estado: empleado.estado });
    if (!enumValidation.valid) {
      errors.estado = enumValidation.errors;
    }
  }

  // Validar teléfono
  if (!empleado.telefono || empleado.telefono.trim() === "") {
    errors.telefono = ["El teléfono es obligatorio"];
  } else {
    const telValidation = validarTelefono(empleado.telefono);
    if (!telValidation.valid) {
      errors.telefono = telValidation.errors;
    }
  }

  // Validar email (opcional)
  if (empleado.email && empleado.email.trim() !== "") {
    const emailValidation = validarEmail(empleado.email);
    if (!emailValidation.valid) {
      errors.email = emailValidation.errors;
    }
  }

  // Validar teléfono secundario (opcional)
  if (empleado.telefono_secundario && empleado.telefono_secundario.trim() !== "") {
    const telValidation = validarTelefono(empleado.telefono_secundario);
    if (!telValidation.valid) {
      errors.telefono_secundario = telValidation.errors;
    }
  }

  // Validar número de documento (opcional, pero con warning)
  if (empleado.numero_documento && empleado.numero_documento.trim() !== "") {
    const docValidation = validarNumeroDocumento(empleado.numero_documento);
    if (!docValidation.valid) {
      warnings.numero_documento = docValidation.errors;
    }
  }

  const hasErrors = Object.keys(errors).length > 0 || globalErrors.length > 0;

  return {
    valid: !hasErrors,
    errors,
    globalErrors,
    warnings
  };
}

/**
 * Sanitiza los datos del empleado antes de guardar
 */
export function sanitizarEmpleado(empleado: Partial<Empleado>): Partial<Empleado> {
  const sanitizado: Partial<Empleado> = { ...empleado };

  // Trim strings
  if (sanitizado.nombre) sanitizado.nombre = sanitizado.nombre.trim();
  if (sanitizado.apellido) sanitizado.apellido = sanitizado.apellido.trim();
  if (sanitizado.email) sanitizado.email = sanitizado.email.trim().toLowerCase();
  if (sanitizado.telefono) sanitizado.telefono = sanitizado.telefono.trim();
  if (sanitizado.telefono_secundario) sanitizado.telefono_secundario = sanitizado.telefono_secundario.trim();
  if (sanitizado.direccion) sanitizado.direccion = sanitizado.direccion.trim();
  if (sanitizado.ciudad) sanitizado.ciudad = sanitizado.ciudad.trim();
  if (sanitizado.codigo_postal) sanitizado.codigo_postal = sanitizado.codigo_postal.trim();
  if (sanitizado.numero_documento) sanitizado.numero_documento = sanitizado.numero_documento.trim();
  if (sanitizado.especialidad) sanitizado.especialidad = sanitizado.especialidad.trim();
  if (sanitizado.notas) sanitizado.notas = sanitizado.notas.trim();

  // Remover campos vacíos opcionales
  Object.keys(sanitizado).forEach(key => {
    const valor = sanitizado[key as keyof Empleado];
    if (valor === "" || valor === null || valor === undefined) {
      delete sanitizado[key as keyof Empleado];
    }
  });

  return sanitizado;
}
