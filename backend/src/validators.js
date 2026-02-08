function validateFormData(data) {
  const errors = [];

  // Campos requeridos
  if (!data.tp_name || data.tp_name.trim().length === 0) {
    errors.push('Nombre del contribuyente es requerido');
  }

  if (!data.tp_dob || data.tp_dob.trim().length === 0) {
    errors.push('Fecha de nacimiento es requerida');
  }

  if (!data.tp_ssn || data.tp_ssn.trim().length === 0) {
    errors.push('SSN/ITIN es requerido');
  }

  if (!data.tp_phone || data.tp_phone.trim().length === 0) {
    errors.push('Teléfono es requerido');
  }

  if (!data.tp_email || data.tp_email.trim().length === 0) {
    errors.push('Email es requerido');
  }

  if (!data.addr_main || data.addr_main.trim().length === 0) {
    errors.push('Dirección es requerida');
  }

  if (!data.addr_city || data.addr_city.trim().length === 0) {
    errors.push('Ciudad es requerida');
  }

  if (!data.addr_state || data.addr_state.trim().length === 0) {
    errors.push('Estado es requerido');
  }

  if (!data.addr_zip || data.addr_zip.trim().length === 0) {
    errors.push('Código postal es requerido');
  }

  if (!data.filing_status || data.filing_status.trim().length === 0) {
    errors.push('Estado civil es requerido');
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.tp_email && !emailRegex.test(data.tp_email)) {
    errors.push('Email inválido');
  }

  // Validar que si tiene cónyuge, tenga datos del cónyuge
  if (data.has_spouse === 'Yes') {
    if (!data.sp_name || data.sp_name.trim().length === 0) {
      errors.push('Nombre del cónyuge es requerido');
    }
    if (!data.sp_ssn || data.sp_ssn.trim().length === 0) {
      errors.push('SSN del cónyuge es requerido');
    }
  }

  // Validar dependientes si existen
  if (data.has_deps === 'Yes' && data.dependents && data.dependents.length > 0) {
    data.dependents.forEach((dep, idx) => {
      if (!dep.name || dep.name.trim().length === 0) {
        errors.push(`Nombre del dependiente #${idx + 1} es requerido`);
      }
      if (!dep.ssn || dep.ssn.trim().length === 0) {
        errors.push(`SSN del dependiente #${idx + 1} es requerido`);
      }
    });
  }

  // Validar que el payload no sea demasiado grande
  const payloadSize = JSON.stringify(data).length;
  if (payloadSize > 10 * 1024 * 1024) { // 10 MB
    errors.push('Payload demasiado grande (máximo 10 MB)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = { validateFormData };
