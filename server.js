import express from "express"
import cors from "cors"
import { v4 as uuidv4 } from "uuid"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

// Base de datos simulada en memoria
const citas = [
  {
    id: "1",
    cliente: "Juan Pérez",
    dia: "Lunes",
    hora: "09:00",
    estado: "programada",
    descripcion: "Consulta general",
    fechaCreacion: new Date().toISOString(),
  },
  {
    id: "2",
    cliente: "María García",
    dia: "Lunes",
    hora: "10:30",
    estado: "completada",
    descripcion: "Revisión mensual",
    fechaCreacion: new Date().toISOString(),
  },
  {
    id: "3",
    cliente: "Carlos López",
    dia: "Martes",
    hora: "14:00",
    estado: "programada",
    descripcion: "Primera consulta",
    fechaCreacion: new Date().toISOString(),
  },
  {
    id: "4",
    cliente: "Ana Martínez",
    dia: "Miércoles",
    hora: "11:15",
    estado: "cancelada",
    descripcion: "Seguimiento",
    fechaCreacion: new Date().toISOString(),
  },
  {
    id: "5",
    cliente: "Roberto Silva",
    dia: "Jueves",
    hora: "16:00",
    estado: "programada",
    descripcion: "Consulta especializada",
    fechaCreacion: new Date().toISOString(),
  },
]

// Función para validar datos de cita
const validarCita = (citaData) => {
  const { cliente, dia, hora } = citaData
  const errores = []

  if (!cliente || cliente.trim().length < 2) {
    errores.push("El nombre del cliente debe tener al menos 2 caracteres")
  }

  const diasValidos = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
  if (!dia || !diasValidos.includes(dia)) {
    errores.push("Debe seleccionar un día válido de la semana")
  }

  if (!hora || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(hora)) {
    errores.push("La hora debe tener un formato válido (HH:MM)")
  }

  return errores
}

// Función para verificar conflictos de horario
const verificarConflictoHorario = (dia, hora, idExcluir = null) => {
  return citas.some(
    (cita) => cita.dia === dia && cita.hora === hora && cita.estado !== "cancelada" && cita.id !== idExcluir,
  )
}

// RUTAS DE LA API

// Servir la aplicación web
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// GET /api/citas - Obtener todas las citas
app.get("/api/citas", (req, res) => {
  try {
    const { dia, estado, cliente } = req.query

    let citasFiltradas = [...citas]

    // Filtrar por día si se especifica
    if (dia && dia !== "Todos") {
      citasFiltradas = citasFiltradas.filter((cita) => cita.dia === dia)
    }

    // Filtrar por estado si se especifica
    if (estado) {
      citasFiltradas = citasFiltradas.filter((cita) => cita.estado === estado)
    }

    // Filtrar por cliente si se especifica
    if (cliente) {
      citasFiltradas = citasFiltradas.filter((cita) => cita.cliente.toLowerCase().includes(cliente.toLowerCase()))
    }

    // Ordenar por día y hora
    const ordenDias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    citasFiltradas.sort((a, b) => {
      const diaA = ordenDias.indexOf(a.dia)
      const diaB = ordenDias.indexOf(b.dia)

      if (diaA !== diaB) {
        return diaA - diaB
      }

      return a.hora.localeCompare(b.hora)
    })

    res.json({
      success: true,
      data: citasFiltradas,
      total: citasFiltradas.length,
    })
  } catch (error) {
    console.error("Error al obtener citas:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// GET /api/citas/:id - Obtener una cita específica
app.get("/api/citas/:id", (req, res) => {
  try {
    const { id } = req.params
    const cita = citas.find((c) => c.id === id)

    if (!cita) {
      return res.status(404).json({
        success: false,
        message: "Cita no encontrada",
      })
    }

    res.json({
      success: true,
      data: cita,
    })
  } catch (error) {
    console.error("Error al obtener cita:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// POST /api/citas/agendar - Crear nueva cita
app.post("/api/citas/agendar", (req, res) => {
  try {
    const { cliente, dia, hora, descripcion } = req.body

    // Validar datos
    const errores = validarCita({ cliente, dia, hora })
    if (errores.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Datos inválidos",
        errores,
      })
    }

    // Verificar conflicto de horario
    if (verificarConflictoHorario(dia, hora)) {
      return res.status(409).json({
        success: false,
        message: "Ya existe una cita programada para ese día y hora",
      })
    }

    // Crear nueva cita
    const nuevaCita = {
      id: uuidv4(),
      cliente: cliente.trim(),
      dia,
      hora,
      estado: "programada",
      descripcion: descripcion ? descripcion.trim() : "",
      fechaCreacion: new Date().toISOString(),
    }

    citas.push(nuevaCita)

    res.status(201).json({
      success: true,
      message: "Cita agendada exitosamente",
      data: nuevaCita,
    })
  } catch (error) {
    console.error("Error al agendar cita:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// PUT /api/citas/editar/:id - Editar cita existente
app.put("/api/citas/editar/:id", (req, res) => {
  try {
    const { id } = req.params
    const { cliente, dia, hora, descripcion, estado } = req.body

    // Buscar la cita
    const citaIndex = citas.findIndex((c) => c.id === id)
    if (citaIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cita no encontrada",
      })
    }

    const citaActual = citas[citaIndex]

    // Validar datos si se están actualizando
    if (cliente || dia || hora) {
      const datosValidar = {
        cliente: cliente || citaActual.cliente,
        dia: dia || citaActual.dia,
        hora: hora || citaActual.hora,
      }

      const errores = validarCita(datosValidar)
      if (errores.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Datos inválidos",
          errores,
        })
      }

      // Verificar conflicto de horario si se cambia día u hora
      if ((dia && dia !== citaActual.dia) || (hora && hora !== citaActual.hora)) {
        const nuevoDia = dia || citaActual.dia
        const nuevaHora = hora || citaActual.hora

        if (verificarConflictoHorario(nuevoDia, nuevaHora, id)) {
          return res.status(409).json({
            success: false,
            message: "Ya existe una cita programada para ese día y hora",
          })
        }
      }
    }

    // Validar estado si se está actualizando
    const estadosValidos = ["programada", "completada", "cancelada"]
    if (estado && !estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: "Estado inválido",
      })
    }

    // Actualizar la cita
    const citaActualizada = {
      ...citaActual,
      ...(cliente && { cliente: cliente.trim() }),
      ...(dia && { dia }),
      ...(hora && { hora }),
      ...(descripcion !== undefined && { descripcion: descripcion.trim() }),
      ...(estado && { estado }),
      fechaModificacion: new Date().toISOString(),
    }

    citas[citaIndex] = citaActualizada

    res.json({
      success: true,
      message: "Cita actualizada exitosamente",
      data: citaActualizada,
    })
  } catch (error) {
    console.error("Error al editar cita:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// DELETE /api/citas/cancelar/:id - Cancelar cita
app.delete("/api/citas/cancelar/:id", (req, res) => {
  try {
    const { id } = req.params

    // Buscar la cita
    const citaIndex = citas.findIndex((c) => c.id === id)
    if (citaIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cita no encontrada",
      })
    }

    const cita = citas[citaIndex]

    // Verificar si ya está cancelada
    if (cita.estado === "cancelada") {
      return res.status(400).json({
        success: false,
        message: "La cita ya está cancelada",
      })
    }

    // Cancelar la cita (cambiar estado en lugar de eliminar)
    citas[citaIndex] = {
      ...cita,
      estado: "cancelada",
      fechaCancelacion: new Date().toISOString(),
    }

    res.json({
      success: true,
      message: "Cita cancelada exitosamente",
      data: citas[citaIndex],
    })
  } catch (error) {
    console.error("Error al cancelar cita:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// DELETE /api/citas/eliminar/:id - Eliminar cita completamente
app.delete("/api/citas/eliminar/:id", (req, res) => {
  try {
    const { id } = req.params

    // Buscar la cita
    const citaIndex = citas.findIndex((c) => c.id === id)
    if (citaIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cita no encontrada",
      })
    }

    // Eliminar la cita
    const citaEliminada = citas.splice(citaIndex, 1)[0]

    res.json({
      success: true,
      message: "Cita eliminada exitosamente",
      data: citaEliminada,
    })
  } catch (error) {
    console.error("Error al eliminar cita:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// PUT /api/citas/completar/:id - Marcar cita como completada
app.put("/api/citas/completar/:id", (req, res) => {
  try {
    const { id } = req.params

    // Buscar la cita
    const citaIndex = citas.findIndex((c) => c.id === id)
    if (citaIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cita no encontrada",
      })
    }

    const cita = citas[citaIndex]

    // Verificar si se puede completar
    if (cita.estado === "cancelada") {
      return res.status(400).json({
        success: false,
        message: "No se puede completar una cita cancelada",
      })
    }

    if (cita.estado === "completada") {
      return res.status(400).json({
        success: false,
        message: "La cita ya está completada",
      })
    }

    // Completar la cita
    citas[citaIndex] = {
      ...cita,
      estado: "completada",
      fechaCompletada: new Date().toISOString(),
    }

    res.json({
      success: true,
      message: "Cita marcada como completada",
      data: citas[citaIndex],
    })
  } catch (error) {
    console.error("Error al completar cita:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// GET /api/estadisticas - Obtener estadísticas de citas
app.get("/api/estadisticas", (req, res) => {
  try {
    const total = citas.length
    const programadas = citas.filter((c) => c.estado === "programada").length
    const completadas = citas.filter((c) => c.estado === "completada").length
    const canceladas = citas.filter((c) => c.estado === "cancelada").length

    // Estadísticas por día
    const citasPorDia = {}
    const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

    diasSemana.forEach((dia) => {
      citasPorDia[dia] = citas.filter((c) => c.dia === dia).length
    })

    res.json({
      success: true,
      data: {
        total,
        programadas,
        completadas,
        canceladas,
        citasPorDia,
        porcentajes: {
          programadas: total > 0 ? Math.round((programadas / total) * 100) : 0,
          completadas: total > 0 ? Math.round((completadas / total) * 100) : 0,
          canceladas: total > 0 ? Math.round((canceladas / total) * 100) : 0,
        },
      },
    })
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// Middleware para manejar rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  })
})

// Middleware para manejo de errores
app.use((error, req, res, next) => {
  console.error("Error no manejado:", error)
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  console.log(`📋 Aplicación web disponible en http://localhost:${PORT}`)
  console.log(`🔗 API disponible en http://localhost:${PORT}/api/citas`)
})

export default app
