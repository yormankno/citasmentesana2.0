// Simulador de base de datos con persistencia en archivo (opcional)
import fs from "fs/promises"
import path from "path"

const DB_FILE = path.join(process.cwd(), "data", "citas.json")

export class CitasDB {
  constructor() {
    this.citas = []
    this.init()
  }

  async init() {
    try {
      // Crear directorio data si no existe
      await fs.mkdir(path.dirname(DB_FILE), { recursive: true })

      // Cargar datos existentes
      const data = await fs.readFile(DB_FILE, "utf8")
      this.citas = JSON.parse(data)
    } catch (error) {
      // Si no existe el archivo, usar datos por defecto
      this.citas = [
        {
          id: "1",
          dia: "Lunes",
          hora: "09:00",
          estado: "programada",
          cliente: "Juan Pérez",
          descripcion: "Consulta general",
          fechaCreacion: new Date().toISOString(),
        },
      ]
      await this.save()
    }
  }

  async save() {
    try {
      await fs.writeFile(DB_FILE, JSON.stringify(this.citas, null, 2))
    } catch (error) {
      console.error("Error al guardar datos:", error)
    }
  }

  async getAll() {
    return this.citas
  }

  async getById(id) {
    return this.citas.find((cita) => cita.id === id)
  }

  async create(citaData) {
    this.citas.push(citaData)
    await this.save()
    return citaData
  }

  async update(id, updateData) {
    const index = this.citas.findIndex((cita) => cita.id === id)
    if (index === -1) return null

    this.citas[index] = { ...this.citas[index], ...updateData }
    await this.save()
    return this.citas[index]
  }

  async delete(id) {
    const index = this.citas.findIndex((cita) => cita.id === id)
    if (index === -1) return null

    const deleted = this.citas.splice(index, 1)[0]
    await this.save()
    return deleted
  }
}
