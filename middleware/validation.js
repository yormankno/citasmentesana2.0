// Middleware de validación personalizado
export const validateCitaData = (req, res, next) => {
  const { cliente, dia, hora } = req.body
  const errores = []

  // Validar cliente
  if (!cliente || typeof cliente !== "string" || cliente.trim().length < 2) {
    errores.push("El nombre del cliente debe tener al menos 2 caracteres")
  }

  // Validar día
  const diasValidos = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
  if (!dia || !diasValidos.includes(dia)) {
    errores.push("Debe seleccionar un día válido de la semana")
  }

  // Validar hora
  if (!hora || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(hora)) {
    errores.push("La hora debe tener un formato válido (HH:MM)")
  }

  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Datos de validación inválidos",
      errores,
    })
  }

  next()
}

// Middleware para validar ID
export const validateId = (req, res, next) => {
  const { id } = req.params

  if (!id || id.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "ID de cita requerido",
    })
  }

  next()
}
