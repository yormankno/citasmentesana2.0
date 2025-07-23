document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const dayFilter = document.getElementById("day-filter");
  const addAppointmentButton = document.getElementById("add-appointment-button");
  const appointmentsTableBody = document.getElementById("appointments-table-body");
  const dialog = document.getElementById("dialog");
  const dialogTitle = document.getElementById("dialog-title");
  const appointmentForm = document.getElementById("appointment-form");
  const appointmentIdInput = document.getElementById("appointment-id");
  const clientNameInput = document.getElementById("client-name");
  const appointmentDayInput = document.getElementById("appointment-day");
  const appointmentTimeInput = document.getElementById("appointment-time");
  const appointmentDescriptionInput = document.getElementById("appointment-description");
  const cancelButton = document.getElementById("cancel-button");
  const saveButton = document.getElementById("save-button");
  const closeButton = document.querySelector(".close-button");

  let appointments = [];

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/citas");
      const data = await response.json();
      appointments = data.data;
      renderAppointments();
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const renderAppointments = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedDay = dayFilter.value;

    const filteredAppointments = appointments.filter((appointment) => {
      const clientMatch = appointment.cliente.toLowerCase().includes(searchTerm);
      const idMatch = appointment.id.includes(searchTerm);
      const descriptionMatch = (appointment.descripcion || "").toLowerCase().includes(searchTerm);
      const dayMatch = selectedDay === "Todos" || appointment.dia === selectedDay;

      return (clientMatch || idMatch || descriptionMatch) && dayMatch;
    });

    appointmentsTableBody.innerHTML = "";

    if (filteredAppointments.length === 0) {
      appointmentsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No se encontraron citas</td></tr>`;
      return;
    }

    filteredAppointments.forEach((appointment) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${appointment.id}</td>
        <td>${appointment.cliente}</td>
        <td>${appointment.dia}</td>
        <td>${appointment.hora}</td>
        <td><span class="status status-${appointment.estado}">${appointment.estado}</span></td>
        <td>${appointment.descripcion || "-"}</td>
        <td>
          <button class="edit-button" data-id="${appointment.id}">Editar</button>
          <button class="cancel-appointment-button" data-id="${appointment.id}" ${
        appointment.estado === "cancelada" ? "disabled" : ""
      }>Cancelar</button>
        </td>
      `;

      appointmentsTableBody.appendChild(row);
    });
  };

  const openDialog = (appointment) => {
    if (appointment) {
      dialogTitle.textContent = "Editar Cita";
      saveButton.textContent = "Guardar Cambios";
      appointmentIdInput.value = appointment.id;
      clientNameInput.value = appointment.cliente;
      appointmentDayInput.value = appointment.dia;
      appointmentTimeInput.value = appointment.hora;
      appointmentDescriptionInput.value = appointment.descripcion || "";
    } else {
      dialogTitle.textContent = "Agendar Nueva Cita";
      saveButton.textContent = "Agendar Cita";
      appointmentForm.reset();
      appointmentIdInput.value = "";
    }
    dialog.style.display = "block";
  };

  const closeDialog = () => {
    dialog.style.display = "none";
  };

  const saveAppointment = async (event) => {
    event.preventDefault();

    const appointmentData = {
      cliente: clientNameInput.value,
      dia: appointmentDayInput.value,
      hora: appointmentTimeInput.value,
      descripcion: appointmentDescriptionInput.value,
    };

    const appointmentId = appointmentIdInput.value;
    const url = appointmentId ? `/api/citas/editar/${appointmentId}` : "/api/citas/agendar";
    const method = appointmentId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        await fetchAppointments();
        closeDialog();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error saving appointment:", error);
    }
  };

  const cancelAppointment = async (event) => {
    if (event.target.classList.contains("cancel-appointment-button")) {
      const appointmentId = event.target.dataset.id;
      if (confirm("¿Está seguro de que desea cancelar esta cita?")) {
        try {
          const response = await fetch(`/api/citas/cancelar/${appointmentId}`, {
            method: "DELETE",
          });

          if (response.ok) {
            await fetchAppointments();
          } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
          }
        } catch (error) {
          console.error("Error canceling appointment:", error);
        }
      }
    }
  };

  searchInput.addEventListener("input", renderAppointments);
  dayFilter.addEventListener("change", renderAppointments);
  addAppointmentButton.addEventListener("click", () => openDialog(null));
  closeButton.addEventListener("click", closeDialog);
  cancelButton.addEventListener("click", closeDialog);
  appointmentForm.addEventListener("submit", saveAppointment);
  appointmentsTableBody.addEventListener("click", (event) => {
    if (event.target.classList.contains("edit-button")) {
      const appointmentId = event.target.dataset.id;
      const appointment = appointments.find((a) => a.id === appointmentId);
      openDialog(appointment);
    }
    cancelAppointment(event);
  });

  fetchAppointments();
});
