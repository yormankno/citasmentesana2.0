"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, X, Calendar, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Cita {
  id: string
  dia: string
  hora: string
  estado: "programada" | "completada" | "cancelada"
  cliente: string
  descripcion?: string
}

const diasSemana = ["Todos", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

const estadoColors = {
  programada: "bg-blue-100 text-blue-800 border-blue-200",
  completada: "bg-green-100 text-green-800 border-green-200",
  cancelada: "bg-red-100 text-red-800 border-red-200",
}

export default function SistemaAgendamiento() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [filteredCitas, setFilteredCitas] = useState<Cita[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDay, setSelectedDay] = useState("Todos")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCita, setEditingCita] = useState<Cita | null>(null)
  const [loading, setLoading] = useState(false)

  // Datos de ejemplo (simula la respuesta de la API)
  const citasEjemplo: Cita[] = [
    {
      id: "1",
      dia: "Lunes",
      hora: "09:00",
      estado: "programada",
      cliente: "Juan Pérez",
      descripcion: "Consulta general",
    },
    {
      id: "2",
      dia: "Lunes",
      hora: "10:30",
      estado: "completada",
      cliente: "María García",
      descripcion: "Revisión mensual",
    },
    {
      id: "3",
      dia: "Martes",
      hora: "14:00",
      estado: "programada",
      cliente: "Carlos López",
      descripcion: "Primera consulta",
    },
    {
      id: "4",
      dia: "Miércoles",
      hora: "11:15",
      estado: "cancelada",
      cliente: "Ana Martínez",
      descripcion: "Seguimiento",
    },
    {
      id: "5",
      dia: "Jueves",
      hora: "16:00",
      estado: "programada",
      cliente: "Roberto Silva",
      descripcion: "Consulta especializada",
    },
  ]

  // Simular carga de datos de la API
  useEffect(() => {
    const fetchCitas = async () => {
      setLoading(true)
      try {
        // Simular llamada a la API
        // const response = await fetch('/api/citas')
        // const data = await response.json()

        // Por ahora usamos datos de ejemplo
        setTimeout(() => {
          setCitas(citasEjemplo)
          setFilteredCitas(citasEjemplo)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error al cargar citas:", error)
        setLoading(false)
      }
    }

    fetchCitas()
  }, [])

  // Filtrar citas por búsqueda y día
  useEffect(() => {
    let filtered = citas

    if (searchTerm) {
      filtered = filtered.filter(
        (cita) =>
          cita.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cita.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cita.id.includes(searchTerm),
      )
    }

    if (selectedDay !== "Todos") {
      filtered = filtered.filter((cita) => cita.dia === selectedDay)
    }

    setFilteredCitas(filtered)
  }, [searchTerm, selectedDay, citas])

  const handleAgendarCita = async (citaData: Partial<Cita>) => {
    try {
      // Simular llamada a la API
      // const response = await fetch('/api/citas/agendar', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(citaData)
      // })

      const nuevaCita: Cita = {
        id: Date.now().toString(),
        dia: citaData.dia || "",
        hora: citaData.hora || "",
        estado: "programada",
        cliente: citaData.cliente || "",
        descripcion: citaData.descripcion || "",
      }

      setCitas((prev) => [...prev, nuevaCita])
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error al agendar cita:", error)
    }
  }

  const handleEditarCita = async (id: string, citaData: Partial<Cita>) => {
    try {
      // Simular llamada a la API
      // const response = await fetch(`/api/citas/editar/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(citaData)
      // })

      setCitas((prev) => prev.map((cita) => (cita.id === id ? { ...cita, ...citaData } : cita)))
      setEditingCita(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error al editar cita:", error)
    }
  }

  const handleCancelarCita = async (id: string) => {
    try {
      // Simular llamada a la API
      // const response = await fetch(`/api/citas/cancelar/${id}`, {
      //   method: 'DELETE'
      // })

      setCitas((prev) => prev.map((cita) => (cita.id === id ? { ...cita, estado: "cancelada" as const } : cita)))
    } catch (error) {
      console.error("Error al cancelar cita:", error)
    }
  }

  const openEditDialog = (cita: Cita) => {
    setEditingCita(cita)
    setIsDialogOpen(true)
  }

  const openNewDialog = () => {
    setEditingCita(null)
    setIsDialogOpen(true)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "rgb(226, 242, 246)" }}>
      {/* Header */}
      <header className="bg-white border-b px-6 py-4" style={{ borderColor: "rgb(103, 98, 97)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8" style={{ color: "rgb(103, 98, 97)" }} />
              <h1 className="text-2xl font-bold" style={{ color: "rgb(103, 98, 97)" }}>
                Sistema de Agendamiento
              </h1>
            </div>

            {/* Buscador */}
            <div className="relative w-96">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                style={{ color: "rgb(103, 98, 97)" }}
              />
              <Input
                type="text"
                placeholder="Buscar por cliente, ID o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border focus:bg-white"
                style={{
                  backgroundColor: "rgb(174, 240, 255)",
                  borderColor: "rgb(103, 98, 97)",
                  color: "rgb(103, 98, 97)",
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Controles superiores */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" style={{ color: "rgb(103, 98, 97)" }} />
              <Label htmlFor="day-filter" className="text-sm font-medium" style={{ color: "rgb(103, 98, 97)" }}>
                Filtrar por día:
              </Label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger
                  className="w-40 border"
                  style={{
                    backgroundColor: "rgb(174, 240, 255)",
                    borderColor: "rgb(103, 98, 97)",
                    color: "rgb(103, 98, 97)",
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: "rgb(174, 240, 255)" }}>
                  {diasSemana.map((dia) => (
                    <SelectItem key={dia} value={dia} style={{ color: "rgb(103, 98, 97)" }}>
                      {dia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm" style={{ color: "rgb(103, 98, 97)" }}>
              {filteredCitas.length} cita{filteredCitas.length !== 1 ? "s" : ""} encontrada
              {filteredCitas.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Botón Agendar nueva cita */}
          <Button
            onClick={openNewDialog}
            size="lg"
            className="px-6 py-3 text-white border-0 hover:opacity-90"
            style={{ backgroundColor: "rgb(103, 98, 97)" }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Agendar Nueva Cita
          </Button>
        </div>

        {/* Tabla de citas */}
        <div
          className="rounded-lg shadow-sm border overflow-hidden"
          style={{
            backgroundColor: "rgb(174, 240, 255)",
            borderColor: "rgb(103, 98, 97)",
          }}
        >
          <Table>
            <TableHeader>
              <TableRow style={{ backgroundColor: "rgb(173, 240, 255)" }}>
                <TableHead className="font-semibold" style={{ color: "rgb(103, 98, 97)" }}>
                  ID
                </TableHead>
                <TableHead className="font-semibold" style={{ color: "rgb(103, 98, 97)" }}>
                  Cliente
                </TableHead>
                <TableHead className="font-semibold" style={{ color: "rgb(103, 98, 97)" }}>
                  Día
                </TableHead>
                <TableHead className="font-semibold" style={{ color: "rgb(103, 98, 97)" }}>
                  Hora
                </TableHead>
                <TableHead className="font-semibold" style={{ color: "rgb(103, 98, 97)" }}>
                  Estado
                </TableHead>
                <TableHead className="font-semibold" style={{ color: "rgb(103, 98, 97)" }}>
                  Descripción
                </TableHead>
                <TableHead className="font-semibold text-center" style={{ color: "rgb(103, 98, 97)" }}>
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div
                        className="animate-spin rounded-full h-6 w-6 border-b-2"
                        style={{ borderColor: "rgb(103, 98, 97)" }}
                      ></div>
                      <span className="ml-2" style={{ color: "rgb(103, 98, 97)" }}>
                        Cargando citas...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCitas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8" style={{ color: "rgb(103, 98, 97)" }}>
                    No se encontraron citas
                  </TableCell>
                </TableRow>
              ) : (
                filteredCitas.map((cita) => (
                  <TableRow key={cita.id} className="hover:opacity-80">
                    <TableCell className="font-mono text-sm" style={{ color: "rgb(103, 98, 97)" }}>
                      {cita.id}
                    </TableCell>
                    <TableCell className="font-medium" style={{ color: "rgb(103, 98, 97)" }}>
                      {cita.cliente}
                    </TableCell>
                    <TableCell style={{ color: "rgb(103, 98, 97)" }}>{cita.dia}</TableCell>
                    <TableCell className="font-mono" style={{ color: "rgb(103, 98, 97)" }}>
                      {cita.hora}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={estadoColors[cita.estado]}>
                        {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" style={{ color: "rgb(103, 98, 97)" }}>
                      {cita.descripcion || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(cita)}
                          className="h-8 w-8 p-0 border"
                          style={{
                            backgroundColor: "rgb(255, 255, 255)",
                            borderColor: "rgb(103, 98, 97)",
                            color: "rgb(103, 98, 97)",
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        {cita.estado !== "cancelada" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelarCita(cita.id)}
                            className="h-8 w-8 p-0 border text-red-600 hover:text-red-700 hover:bg-red-50"
                            style={{
                              backgroundColor: "rgb(255, 255, 255)",
                              borderColor: "rgb(103, 98, 97)",
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Dialog para agendar/editar cita */}
      <CitaDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setEditingCita(null)
        }}
        cita={editingCita}
        onSave={editingCita ? (data) => handleEditarCita(editingCita.id, data) : handleAgendarCita}
      />
    </div>
  )
}

// Componente Dialog para agendar/editar citas
interface CitaDialogProps {
  isOpen: boolean
  onClose: () => void
  cita?: Cita | null
  onSave: (data: Partial<Cita>) => void
}

function CitaDialog({ isOpen, onClose, cita, onSave }: CitaDialogProps) {
  const [formData, setFormData] = useState({
    cliente: "",
    dia: "",
    hora: "",
    descripcion: "",
  })

  useEffect(() => {
    if (cita) {
      setFormData({
        cliente: cita.cliente,
        dia: cita.dia,
        hora: cita.hora,
        descripcion: cita.descripcion || "",
      })
    } else {
      setFormData({
        cliente: "",
        dia: "",
        hora: "",
        descripcion: "",
      })
    }
  }, [cita, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md border"
        style={{
          backgroundColor: "rgb(174, 240, 255)",
          borderColor: "rgb(103, 98, 97)",
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: "rgb(103, 98, 97)" }}>{cita ? "Editar Cita" : "Agendar Nueva Cita"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cliente" style={{ color: "rgb(103, 98, 97)" }}>
              Cliente
            </Label>
            <Input
              id="cliente"
              value={formData.cliente}
              onChange={(e) => setFormData((prev) => ({ ...prev, cliente: e.target.value }))}
              placeholder="Nombre del cliente"
              required
              className="border"
              style={{
                backgroundColor: "rgb(255, 255, 255)",
                borderColor: "rgb(103, 98, 97)",
                color: "rgb(103, 98, 97)",
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dia" style={{ color: "rgb(103, 98, 97)" }}>
                Día
              </Label>
              <Select value={formData.dia} onValueChange={(value) => setFormData((prev) => ({ ...prev, dia: value }))}>
                <SelectTrigger
                  className="border"
                  style={{
                    backgroundColor: "rgb(255, 255, 255)",
                    borderColor: "rgb(103, 98, 97)",
                    color: "rgb(103, 98, 97)",
                  }}
                >
                  <SelectValue placeholder="Seleccionar día" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: "rgb(174, 240, 255)" }}>
                  {diasSemana.slice(1).map((dia) => (
                    <SelectItem key={dia} value={dia} style={{ color: "rgb(103, 98, 97)" }}>
                      {dia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="hora" style={{ color: "rgb(103, 98, 97)" }}>
                Hora
              </Label>
              <Input
                id="hora"
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData((prev) => ({ ...prev, hora: e.target.value }))}
                required
                className="border"
                style={{
                  backgroundColor: "rgb(255, 255, 255)",
                  borderColor: "rgb(103, 98, 97)",
                  color: "rgb(103, 98, 97)",
                }}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descripcion" style={{ color: "rgb(103, 98, 97)" }}>
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Descripción de la cita (opcional)"
              rows={3}
              className="border"
              style={{
                backgroundColor: "rgb(255, 255, 255)",
                borderColor: "rgb(103, 98, 97)",
                color: "rgb(103, 98, 97)",
              }}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border"
              style={{
                backgroundColor: "rgb(255, 255, 255)",
                borderColor: "rgb(103, 98, 97)",
                color: "rgb(103, 98, 97)",
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="text-white border-0 hover:opacity-90"
              style={{ backgroundColor: "rgb(103, 98, 97)" }}
            >
              {cita ? "Guardar Cambios" : "Agendar Cita"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
