// --- Datos de Backend Simulados (almacenamiento en memoria) ---
let staff = JSON.parse(localStorage.getItem('staff')) || [];
let shifts = JSON.parse(localStorage.getItem('shifts')) || [];
let assignments = JSON.parse(localStorage.getItem('assignments')) || [];
let users = JSON.parse(localStorage.getItem('users')) || []; // Almacenamiento de usuarios
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null; // Usuario logueado actualmente

// Función para guardar datos en localStorage (simulando persistencia)
function saveData() {
    localStorage.setItem('staff', JSON.stringify(staff));
    localStorage.setItem('shifts', JSON.stringify(shifts));
    localStorage.setItem('assignments', JSON.stringify(assignments));
}

// Función para guardar datos de usuarios en localStorage
function saveUsersData() {
    localStorage.setItem('users', JSON.stringify(users));
}

// Función para guardar el usuario actual en localStorage
function saveCurrentUser() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// --- Función de Alerta Personalizada ---
/**
 * Muestra un modal de alerta personalizado con un mensaje dado.
 * @param {string} message - El mensaje a mostrar en la alerta.
 */
function showAlert(message) {
    document.getElementById('customAlertMessage').textContent = message;
    const customAlertModal = new bootstrap.Modal(document.getElementById('customAlertModal'));
    customAlertModal.show();
}

// --- Gestión de Temas ---
const darkModeToggle = document.getElementById('darkModeToggle');
const sunIcon = document.getElementById('sun-icon');
const sunRays = document.getElementById('sun-rays');
const moonIcon = document.getElementById('moon-icon-right');
const sunIconRight = document.getElementById('sun-icon-right');
const sunRaysRight = document.getElementById('sun-rays-right');

/**
 * Aplica la preferencia de tema guardada al cargar la página.
 */
function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
        sunIcon.style.display = 'none';
        sunRays.style.display = 'none';
        moonIcon.style.display = 'inline';
        sunIconRight.style.display = 'inline';
        sunRaysRight.style.display = 'inline';
    } else {
        document.body.classList.remove('dark-mode');
        darkModeToggle.checked = false;
        sunIcon.style.display = 'inline';
        sunRays.style.display = 'inline';
        moonIcon.style.display = 'none';
        sunIconRight.style.display = 'none';
        sunRaysRight.style.display = 'none';
    }
}

/**
 * Alterna entre el modo claro y oscuro.
 */
darkModeToggle.addEventListener('change', () => {
    if (darkModeToggle.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
        sunIcon.style.display = 'none';
        sunRays.style.display = 'none';
        moonIcon.style.display = 'inline';
        sunIconRight.style.display = 'inline';
        sunRaysRight.style.display = 'inline';
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
        sunIcon.style.display = 'inline';
        sunRays.style.display = 'inline';
        moonIcon.style.display = 'none';
        sunIconRight.style.display = 'none';
        sunRaysRight.style.display = 'none';
    }
});

// --- Funciones de Gestión de Secciones ---
/**
 * Muestra una sección de contenido específica y oculta las demás.
 * Actualiza la clase activa en los enlaces de navegación.
 * @param {string} sectionId - El ID de la sección a mostrar.
 * @param {HTMLElement} clickedLink - El enlace de navegación en el que se hizo clic.
 */
function showSection(sectionId, clickedLink) {
    // Asegúrate de que solo se pueda navegar si hay un usuario logueado, a menos que sea la sección de autenticación.
    if (!currentUser && sectionId !== 'auth-section') {
        showAlert('Por favor, inicia sesión para acceder a esta sección.');
        return;
    }

    // Ocultar todas las secciones de contenido
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Mostrar la sección seleccionada
    document.getElementById(sectionId).classList.add('active');

    // Actualizar el estado activo de los enlaces de navegación solo si existe clickedLink
    if (clickedLink) {
        document.querySelectorAll('#mainNavLinks .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        clickedLink.classList.add('active');
    }

    // Volver a renderizar los datos para la sección recién activa (importante para las actualizaciones)
    if (sectionId === 'staff-section') {
        renderStaff();
    } else if (sectionId === 'shifts-section') {
        renderShifts();
    } else if (sectionId === 'assignment-section') {
        populateStaffSelect(); // Asegurar que los desplegables estén actualizados
        populateShiftSelect();
        prepareAssignmentFormForAdd(); // Restablecer el formulario de asignación para una nueva entrada
    } else if (sectionId === 'schedule-section') {
        renderSchedule();
    }
}


// --- Elementos del DOM ---
const authSection = document.getElementById('auth-section');
const appContent = document.getElementById('app-content');
const mainNavLinks = document.getElementById('mainNavLinks');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterFormLink = document.getElementById('showRegisterForm');
const showLoginFormLink = document.getElementById('showLoginForm');

const staffList = document.getElementById('staffList');
const shiftList = document.getElementById('shiftList');
const assignStaffSelect = document.getElementById('assignStaff');
const assignShiftSelect = document.getElementById('assignShift');
const assignDateInput = document.getElementById('assignDate');
const assignmentIdToEditInput = document.getElementById('assignmentIdToEdit');
const saveAssignmentBtn = document.getElementById('saveAssignmentBtn');
const assignmentFormHeader = document.getElementById('assignmentFormHeader');
const scheduleDisplay = document.getElementById('scheduleDisplay');
const noAssignmentsMessage = document.getElementById('noAssignmentsMessage');

// --- Render Functions ---

/**
 * Renderiza la interfaz de usuario de autenticación y el contenido de la aplicación.
 */
function renderAuthUI() {
    mainNavLinks.innerHTML = ''; // Limpiar enlaces de navegación

    if (currentUser) {
        // Usuario logueado: mostrar enlaces de la aplicación
        authSection.style.display = 'none';
        appContent.style.display = 'block';

        mainNavLinks.innerHTML = `
                    <li class="nav-item">
                        <a class="nav-link active" aria-current="page" href="#" onclick="showSection('staff-section', this)">Personal</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" onclick="showSection('shifts-section', this)">Turnos</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" onclick="showSection('assignment-section', this)">Asignar</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" onclick="showSection('schedule-section', this)">Horario</a>
                    </li>
                    <li class="nav-item ms-auto"> <!-- Push logout to right -->
                        <span class="navbar-text me-3">¡Hola, ${currentUser.username}!</span>
                    </li>
                    <li class="nav-item">
                        <button class="btn btn-light btn-sm" onclick="handleLogout()">Cerrar Sesión</button>
                    </li>
                `;
        // Asegurarse de que la sección activa sea 'staff-section' por defecto al iniciar sesión
        showSection('staff-section', document.querySelector('#mainNavLinks .nav-link.active'));
    } else {
        // No logueado: mostrar solo la sección de autenticación
        authSection.style.display = 'flex';
        appContent.style.display = 'none';

        mainNavLinks.innerHTML = `
                    <li class="nav-item">
                        <a class="nav-link active" href="#" onclick="showSection('auth-section', this)">Iniciar Sesión / Registrarme</a>
                    </li>
                `;
        showSection('auth-section', document.querySelector('#mainNavLinks .nav-link.active'));
    }
}

/**
 * Renderiza la lista de miembros del personal en la tabla.
 */
function renderStaff() {
    staffList.innerHTML = ''; // Limpiar la lista existente
    if (staff.length === 0) {
        staffList.innerHTML = '<tr><td colspan="10" class="text-center text-muted">No hay personal registrado.</td></tr>';
        return;
    }
    staff.forEach((s, index) => {
        const row = `
                    <tr>
                        <th scope="row">${index + 1}</th>
                        <td>${s.idNumber}</td>
                        <td>${s.name}</td>
                        <td>${s.department}</td>
                        <td>${s.position}</td>
                        <td>${s.phone}</td>
                        <td>${s.email}</td>
                        <td>${s.hireDate}</td>
                        <td>${s.contractType}</td>
                        <td>
                            <button class="btn btn-edit-green btn-sm me-2" onclick="editStaff('${s.id}')" data-bs-toggle="modal" data-bs-target="#addStaffModal">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteStaff('${s.id}')">Eliminar</button>
                        </td>
                    </tr>
                `;
        staffList.innerHTML += row;
    });
    populateStaffSelect(); // Actualizar el desplegable de selección de personal
}

/**
 * Renderiza la lista de turnos en la tabla.
 */
function renderShifts() {
    shiftList.innerHTML = ''; // Limpiar la lista existente
    if (shifts.length === 0) {
        shiftList.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay turnos definidos.</td></tr>';
        return;
    }
    shifts.forEach((sh, index) => {
        const row = `
                    <tr>
                        <th scope="row">${index + 1}</th>
                        <td>${sh.type}</td>
                        <td>${sh.date}</td>
                        <td>${sh.startTime}</td>
                        <td>${sh.endTime}</td>
                        <td>
                            <button class="btn btn-edit-green btn-sm me-2" onclick="editShift('${sh.id}')" data-bs-toggle="modal" data-bs-target="#addShiftModal">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteShift('${sh.id}')">Eliminar</button>
                        </td>
                    </tr>
                `;
        shiftList.innerHTML += row;
    });
    populateShiftSelect(); // Actualizar el desplegable de selección de turno
}

/**
 * Rellena el desplegable de personal para las asignaciones.
 */
function populateStaffSelect() {
    assignStaffSelect.innerHTML = '<option value="">Seleccione Personal</option>';
    staff.forEach(s => {
        const option = `<option value="${s.id}">${s.name} (${s.position})</option>`; // Usando la posición para mostrar
        assignStaffSelect.innerHTML += option;
    });
}

/**
 * Rellena el desplegable de turnos para las asignaciones.
 */
function populateShiftSelect() {
    assignShiftSelect.innerHTML = '<option value="">Seleccione Turno</option>';
    shifts.forEach(sh => {
        const option = `<option value="${sh.id}">${sh.type} (${sh.startTime} - ${sh.endTime}) - ${sh.date}</option>`;
        assignShiftSelect.innerHTML += option;
    });
}

/**
 * Renderiza el horario agrupando las asignaciones por fecha.
 */
function renderSchedule() {
    scheduleDisplay.innerHTML = ''; // Limpiar el horario existente

    if (assignments.length === 0) {
        noAssignmentsMessage.style.display = 'block';
        return;
    } else {
        noAssignmentsMessage.style.display = 'none';
    }

    // Agrupar asignaciones por fecha
    const groupedAssignments = assignments.reduce((acc, assignment) => {
        const date = assignment.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(assignment);
        return acc;
    }, {});

    // Ordenar fechas
    const sortedDates = Object.keys(groupedAssignments).sort();

    sortedDates.forEach(date => {
        const assignmentsForDay = groupedAssignments[date];
        const dayCard = document.createElement('div');
        dayCard.classList.add('schedule-day-card');

        const dateHeading = document.createElement('h5');
        dateHeading.textContent = new Date(date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        dayCard.appendChild(dateHeading);

        const assignmentList = document.createElement('ul');
        assignmentsForDay.forEach(assignment => {
            const staffMember = staff.find(s => s.id === assignment.staffId);
            const shiftDetail = shifts.find(sh => sh.id === assignment.shiftId);

            if (staffMember && shiftDetail) {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                            <span><strong>${staffMember.name}</strong> - ${shiftDetail.type} (${shiftDetail.startTime} - ${shiftDetail.endTime})</span>
                            <div>
                                <button class="btn btn-edit-green btn-sm me-2" onclick="editAssignment('${assignment.id}')">Editar</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteAssignment('${assignment.id}')">Eliminar</button>
                            </div>
                        `;
                assignmentList.appendChild(listItem);
            }
        });
        dayCard.appendChild(assignmentList);
        scheduleDisplay.appendChild(dayCard);
    });
}

// --- Operaciones CRUD (Backend Simulado) ---

/**
 * Añade un nuevo miembro del personal.
 * @param {string} idNumber - Número de identificación del empleado.
 * @param {string} name - El nombre del miembro del personal.
 * @param {string} department - El departamento/área del miembro del personal.
 * @param {string} position - El rol/cargo del miembro del personal.
 * @param {string} phone - El número de teléfono del miembro del personal.
 * @param {string} email - El correo electrónico del miembro del personal.
 * @param {string} hireDate - La fecha de contratación del miembro del personal (AAAA-MM-DD).
 * @param {string} contractType - El tipo de contrato del miembro del personal.
 */
function addStaff(idNumber, name, department, position, phone, email, hireDate, contractType) {
    const newStaff = {
        id: crypto.randomUUID(),
        idNumber,
        name,
        department,
        position,
        phone,
        email,
        hireDate,
        contractType
    };
    staff.push(newStaff);
    saveData();
    renderStaff();
}

/**
 * Elimina un miembro del personal por ID.
 * @param {string} id - El ID del miembro del personal a eliminar.
 */
function deleteStaff(id) {
    const isAssigned = assignments.some(a => a.staffId === id);
    if (isAssigned) {
        showAlert('No se puede eliminar este personal porque tiene asignaciones de turnos pendientes. Por favor, elimine las asignaciones primero.');
        return;
    }

    staff = staff.filter(s => s.id !== id);
    saveData();
    renderStaff();
}

/**
 * Edita un miembro del personal.
 * @param {string} id - El ID del miembro del personal a editar.
 */
function editStaff(id) {
    const staffMember = staff.find(s => s.id === id);
    if (staffMember) {
        document.getElementById('addStaffModalLabel').textContent = 'Editar Personal';
        document.getElementById('saveStaffBtn').textContent = 'Guardar Cambios';
        document.getElementById('staffIdToEdit').value = staffMember.id;
        document.getElementById('staffIdNumber').value = staffMember.idNumber;
        document.getElementById('staffName').value = staffMember.name;
        document.getElementById('staffDepartment').value = staffMember.department;
        document.getElementById('staffPosition').value = staffMember.position;
        document.getElementById('staffPhone').value = staffMember.phone;
        document.getElementById('staffEmail').value = staffMember.email;
        document.getElementById('staffHireDate').value = staffMember.hireDate;
        document.getElementById('staffContractType').value = staffMember.contractType;
    }
}

/**
 * Actualiza un miembro del personal existente.
 * @param {string} id - El ID del miembro del personal a actualizar.
 * @param {object} updatedData - Los nuevos datos para el miembro del personal.
 */
function updateStaff(id, updatedData) {
    const index = staff.findIndex(s => s.id === id);
    if (index !== -1) {
        staff[index] = { ...staff[index], ...updatedData };
        saveData();
        renderStaff();
        renderSchedule(); // Volver a renderizar el horario ya que los detalles del personal podrían mostrarse allí
    }
}

/**
 * Añade un nuevo turno.
 * @param {string} type - El tipo de turno (Mañana, Tarde, Noche).
 * @param {string} date - La fecha específica para este turno (AAAA-MM-DD).
 * @param {string} startTime - La hora de inicio del turno (HH:MM).
 * @param {string} endTime - La hora de finalización del turno (HH:MM).
 */
function addShift(type, date, startTime, endTime) {
    const newShift = {
        id: crypto.randomUUID(),
        type,
        date,
        startTime,
        endTime
    };
    shifts.push(newShift);
    saveData();
    renderShifts();
}

/**
 * Elimina un turno por ID.
 * @param {string} id - El ID del turno a eliminar.
 */
function deleteShift(id) {
    const isAssigned = assignments.some(a => a.shiftId === id);
    if (isAssigned) {
        showAlert('No se puede eliminar este turno porque tiene asignaciones de personal pendientes. Por favor, elimine las asignaciones primero.');
        return;
    }

    shifts = shifts.filter(sh => sh.id !== id);
    saveData();
    renderShifts();
}

/**
 * Edita un turno.
 * @param {string} id - El ID del turno a editar.
 */
function editShift(id) {
    const shiftDetail = shifts.find(sh => sh.id === id);
    if (shiftDetail) {
        document.getElementById('addShiftModalLabel').textContent = 'Editar Turno';
        document.getElementById('saveShiftBtn').textContent = 'Guardar Cambios';
        document.getElementById('shiftIdToEdit').value = shiftDetail.id;
        document.getElementById('shiftType').value = shiftDetail.type;
        document.getElementById('shiftDate').value = shiftDetail.date;
        document.getElementById('shiftStartTime').value = shiftDetail.startTime;
        document.getElementById('shiftEndTime').value = shiftDetail.endTime;
    }
}

/**
 * Actualiza un turno existente.
 * @param {string} id - El ID del turno a actualizar.
 * @param {object} updatedData - Los nuevos datos para el turno.
 */
function updateShift(id, updatedData) {
    const index = shifts.findIndex(sh => sh.id === id);
    if (index !== -1) {
        shifts[index] = { ...shifts[index], ...updatedData };
        saveData();
        renderShifts();
        renderSchedule(); // Volver a renderizar el horario ya que los detalles del turno podrían mostrarse allí
    }
}

/**
 * Asigna un miembro del personal a un turno en una fecha específica.
 * @param {string} staffId - El ID del miembro del personal.
 * @param {string} shiftId - El ID del turno.
 * @param {string} date - La fecha de la asignación (AAAA-MM-DD).
 */
function assignShift(staffId, shiftId, date) {
    const exists = assignments.some(a => a.staffId === staffId && a.shiftId === shiftId && a.date === date);
    if (exists) {
        showAlert('Este personal ya está asignado a este turno en esta fecha.');
        return;
    }

    const newAssignment = { id: crypto.randomUUID(), staffId, shiftId, date };
    assignments.push(newAssignment);
    saveData();
    renderSchedule();
}

/**
 * Edita una asignación existente.
 * @param {string} id - El ID de la asignación a editar.
 */
function editAssignment(id) {
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
        // Establecer los campos del formulario con los datos de la asignación
        assignStaffSelect.value = assignment.staffId;
        assignShiftSelect.value = assignment.shiftId;
        assignDateInput.value = assignment.date;
        assignmentIdToEditInput.value = assignment.id; // Almacenar el ID de la asignación que se está editando

        // Cambiar el texto del botón y el encabezado para indicar el modo de edición
        saveAssignmentBtn.textContent = 'Actualizar Asignación';
        assignmentFormHeader.textContent = 'Editar Asignación de Turno';

        // Cambiar a la sección de asignación si aún no está allí
        showSection('assignment-section', document.querySelector('a[onclick*="assignment-section"]'));
    }
}

/**
 * Actualiza una asignación existente.
 * @param {string} id - El ID de la asignación a actualizar.
 * @param {object} updatedData - Los nuevos datos para la asignación.
 */
function updateAssignment(id, updatedData) {
    const index = assignments.findIndex(a => a.id === id);
    if (index !== -1) {
        // Comprobar si hay una asignación duplicada después de la actualización, excluyendo la asignación actual que se está editando
        const exists = assignments.some(a =>
            a.id !== id &&
            a.staffId === updatedData.staffId &&
            a.shiftId === updatedData.shiftId &&
            a.date === updatedData.date
        );
        if (exists) {
            showAlert('La asignación actualizada ya existe para este personal, turno y fecha.');
            return false; // Indicar que la actualización falló debido a duplicado
        }

        assignments[index] = { ...assignments[index], ...updatedData };
        saveData();
        renderSchedule();
        return true; // Indicar que la actualización fue exitosa
    }
    return false; // Indicar que la asignación no fue encontrada
}


/**
 * Elimina una asignación por su ID.
 * @param {string} id - El ID de la asignación a eliminar.
 */
function deleteAssignment(id) {
    assignments = assignments.filter(a => a.id !== id);
    saveData();
    renderSchedule(); // Volver a renderizar el horario después de la eliminación
}

// --- Funciones de Exportación a CSV ---

/**
 * Exporta los datos del personal a un archivo CSV.
 */
function exportStaffToCSV() {
    if (staff.length === 0) {
        showAlert('No hay datos de personal para exportar.');
        return;
    }

    const headers = ["Identificación", "Nombre", "Departamento", "Cargo", "Teléfono", "Email", "Fecha Contratación", "Tipo Contrato"];
    const rows = staff.map(s => [
        `"${s.idNumber}"`,
        `"${s.name}"`,
        `"${s.department}"`,
        `"${s.position}"`,
        `"${s.phone}"`,
        `"${s.email}"`,
        `"${s.hireDate}"`,
        `"${s.contractType}"`
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
        + headers.join(";") + "\n"
        + rows.map(e => e.join(";")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "personal_clinica.csv");
    document.body.appendChild(link); // Requerido para Firefox
    link.click();
    document.body.removeChild(link); // Limpiar
}

/**
 * Exporta los datos de los turnos a un archivo CSV.
 */
function exportShiftsToCSV() {
    if (shifts.length === 0) {
        showAlert('No hay datos de turnos para exportar.');
        return;
    }

    const headers = ["Tipo", "Fecha", "Hora Inicio", "Hora Finalización"];
    const rows = shifts.map(sh => [
        `"${sh.type}"`,
        `"${sh.date}"`,
        `"${sh.startTime}"`,
        `"${sh.endTime}"`
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
        + headers.join(";") + "\n"
        + rows.map(e => e.join(";")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "turnos_definidos.csv");
    document.body.appendChild(link); // Requerido para Firefox
    link.click();
    document.body.removeChild(link); // Limpiar
}

/**
 * Exporta los datos de las asignaciones a un archivo CSV.
 */
function exportAssignmentsToCSV() {
    if (assignments.length === 0) {
        showAlert('No hay datos de asignaciones para exportar.');
        return;
    }

    const headers = ["Fecha Asignación", "Nombre Personal", "Identificación Personal", "Departamento Personal", "Cargo Personal", "Tipo Turno", "Fecha Turno", "Hora Inicio Turno", "Hora Finalización Turno"];

    const rows = assignments.map(a => {
        const staffMember = staff.find(s => s.id === a.staffId);
        const shiftDetail = shifts.find(sh => sh.id === a.shiftId);

        return [
            `"${a.date}"`,
            `"${staffMember ? staffMember.name : 'N/A'}"`,
            `"${staffMember ? staffMember.idNumber : 'N/A'}"`,
            `"${staffMember ? staffMember.department : 'N/A'}"`,
            `"${staffMember ? staffMember.position : 'N/A'}"`,
            `"${shiftDetail ? shiftDetail.type : 'N/A'}"`,
            `"${shiftDetail ? shiftDetail.date : 'N/A'}"`,
            `"${shiftDetail ? shiftDetail.startTime : 'N/A'}"`,
            `"${shiftDetail ? shiftDetail.endTime : 'N/A'}"`
        ];
    });

    let csvContent = "data:text/csv;charset=utf-8,"
        + headers.join(";") + "\n"
        + rows.map(e => e.join(";")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "asignaciones_turnos.csv");
    document.body.appendChild(link); // Requerido para Firefox
    link.click();
    document.body.removeChild(link); // Limpiar
}

// --- Funciones de Preparación de Modales/Formularios (para reutilizar formularios) ---
function prepareAddStaffModal() {
    document.getElementById('addStaffModalLabel').textContent = 'Añadir Nuevo Personal';
    document.getElementById('saveStaffBtn').textContent = 'Guardar Personal';
    document.getElementById('staffIdToEdit').value = ''; // Limpiar ID para nueva entrada
    document.getElementById('addStaffForm').reset(); // Limpiar campos del formulario
}

function prepareAddShiftModal() {
    document.getElementById('addShiftModalLabel').textContent = 'Añadir Nuevo Turno';
    document.getElementById('saveShiftBtn').textContent = 'Guardar Turno';
    document.getElementById('shiftIdToEdit').value = ''; // Limpiar ID para nueva entrada
    document.getElementById('addShiftForm').reset(); // Limpiar campos del formulario
}

function prepareAssignmentFormForAdd() {
    assignmentFormHeader.textContent = 'Asignar Personal a Turno';
    saveAssignmentBtn.textContent = 'Asignar Turno';
    assignmentIdToEditInput.value = ''; // Limpiar ID para nueva entrada
    document.getElementById('assignmentForm').reset(); // Limpiar campos del formulario
    populateStaffSelect(); // Volver a rellenar para asegurar opciones actualizadas
    populateShiftSelect(); // Volver a rellenar para asegurar opciones actualizadas
}

// --- Funciones de Autenticación ---
/**
 * Registra un nuevo usuario.
 * @param {string} username - Nombre de usuario.
 * @param {string} password - Contraseña (almacenada directamente para demostración, ¡INSEGURO!).
 */
function registerUser(username, password) {
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        showAlert('El nombre de usuario ya existe. Por favor, elige otro.');
        return false;
    }
    users.push({ id: crypto.randomUUID(), username, password: btoa(password) }); // btoa para una "casi" ofuscación, pero aún INSEGURO
    saveUsersData();
    showAlert('¡Registro exitoso! Ahora puedes iniciar sesión.');
    return true;
}

/**
 * Inicia sesión de un usuario.
 * @param {string} username - Nombre de usuario.
 * @param {string} password - Contraseña.
 */
function loginUser(username, password) {
    const user = users.find(u => u.username === username && atob(u.password) === password); // atob para decodificar
    if (user) {
        currentUser = { username: user.username, id: user.id };
        saveCurrentUser();
        showAlert(`¡Bienvenido de nuevo, ${currentUser.username}!`);
        renderAuthUI(); // Actualizar la UI después del login
        return true;
    } else {
        showAlert('Nombre de usuario o contraseña incorrectos.');
        return false;
    }
}

/**
 * Cierra la sesión del usuario actual.
 */
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser'); // Eliminar de localStorage
    showAlert('Has cerrado sesión.');
    renderAuthUI(); // Actualizar la UI después del logout
}

// --- Oyentes de Eventos de Autenticación ---
showRegisterFormLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
});

showLoginFormLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    loginUser(username, password);
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    if (password !== confirmPassword) {
        showAlert('Las contraseñas no coinciden.');
        return;
    }
    if (username.length < 3 || password.length < 6) {
        showAlert('El nombre de usuario debe tener al menos 3 caracteres y la contraseña al menos 6.');
        return;
    }

    if (registerUser(username, password)) {
        registerForm.reset();
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    }
});


// --- Oyentes de Eventos del Formulario Principal ---

// Envío del formulario Añadir/Editar Personal
document.getElementById('addStaffForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const idToEdit = document.getElementById('staffIdToEdit').value;
    const staffIdNumber = document.getElementById('staffIdNumber').value.trim();
    const staffName = document.getElementById('staffName').value.trim();
    const staffDepartment = document.getElementById('staffDepartment').value;
    const staffPosition = document.getElementById('staffPosition').value;
    const staffPhone = document.getElementById('staffPhone').value.trim();
    const staffEmail = document.getElementById('staffEmail').value.trim();
    const staffHireDate = document.getElementById('staffHireDate').value;
    const staffContractType = document.getElementById('staffContractType').value.trim();

    // Validación
    if (!staffIdNumber || !staffName || !staffDepartment || !staffPosition || !staffPhone || !staffEmail || !staffHireDate || !staffContractType) {
        showAlert('Por favor, complete todos los campos obligatorios para el personal.');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(staffEmail)) {
        showAlert('Por favor, introduzca un correo electrónico válido.');
        return;
    }

    const phoneRegex = /^\+?\d+$/;
    if (!phoneRegex.test(staffPhone)) {
        showAlert('Por favor, introduzca un número de teléfono válido (solo dígitos y opcionalmente un "+" al inicio).');
        return;
    }

    if (!/^\d+$/.test(staffIdNumber)) {
        showAlert('La identificación del empleado debe contener solo números.');
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (staffHireDate > today) {
        showAlert('La fecha de contratación no puede ser en el futuro.');
        return;
    }

    const staffData = {
        idNumber: staffIdNumber,
        name: staffName,
        department: staffDepartment,
        position: staffPosition,
        phone: staffPhone,
        email: staffEmail,
        hireDate: staffHireDate,
        contractType: staffContractType
    };

    if (idToEdit) {
        updateStaff(idToEdit, staffData);
    } else {
        addStaff(staffIdNumber, staffName, staffDepartment, staffPosition, staffPhone, staffEmail, staffHireDate, staffContractType);
    }

    const addStaffModal = bootstrap.Modal.getInstance(document.getElementById('addStaffModal'));
    addStaffModal.hide();
    this.reset();
});

// Envío del formulario Añadir/Editar Turno
document.getElementById('addShiftForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const idToEdit = document.getElementById('shiftIdToEdit').value;
    const shiftType = document.getElementById('shiftType').value;
    const shiftDate = document.getElementById('shiftDate').value;
    const shiftStartTime = document.getElementById('shiftStartTime').value;
    const shiftEndTime = document.getElementById('shiftEndTime').value;

    // Validación
    if (!shiftType || !shiftDate || !shiftStartTime || !shiftEndTime) {
        showAlert('Por favor, complete todos los campos obligatorios para el turno.');
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (shiftDate < today) {
        showAlert('La fecha del turno no puede ser en el pasado.');
        return;
    }

    if (shiftStartTime && shiftEndTime) {
        const startTime = new Date(`2000-01-01T${shiftStartTime}`);
        const endTime = new Date(`2000-01-01T${shiftEndTime}`);
        if (endTime <= startTime) {
            showAlert('La hora de finalización debe ser posterior a la hora de inicio.');
            return;
        }
    }

    const shiftData = {
        type: shiftType,
        date: shiftDate,
        startTime: shiftStartTime,
        endTime: shiftEndTime
    };

    if (idToEdit) {
        updateShift(idToEdit, shiftData);
    } else {
        addShift(shiftType, shiftDate, shiftStartTime, shiftEndTime);
    }

    const addShiftModal = bootstrap.Modal.getInstance(document.getElementById('addShiftModal'));
    addShiftModal.hide();
    this.reset();
});

// Envío del formulario de Asignación
document.getElementById('assignmentForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const assignmentId = assignmentIdToEditInput.value; // Obtener el ID si se está editando
    const staffId = assignStaffSelect.value;
    const shiftId = assignShiftSelect.value;
    const assignDate = assignDateInput.value;

    // Validación para el formulario de Asignación
    if (!staffId || staffId === '') {
        showAlert('Por favor, seleccione el personal para la asignación.');
        return;
    }
    if (!shiftId || shiftId === '') {
        showAlert('Por favor, seleccione el turno para la asignación.');
        return;
    }
    if (!assignDate || assignDate === '') {
        showAlert('Por favor, seleccione la fecha para la asignación.');
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (assignDate < today) {
        showAlert('La fecha de asignación no puede ser en el pasado.');
        return;
    }

    const assignmentData = {
        staffId: staffId,
        shiftId: shiftId,
        date: assignDate
    };

    if (assignmentId) {
        // Si assignmentId existe, es una operación de actualización
        const success = updateAssignment(assignmentId, assignmentData);
        if (success) {
            prepareAssignmentFormForAdd(); // Restablecer el formulario después de una actualización exitosa
        }
    } else {
        // De lo contrario, es una nueva asignación
        assignShift(staffId, shiftId, assignDate);
        this.reset(); // Restablecer el formulario después de una nueva asignación
    }
});

// --- Renderizado Inicial al Cargar ---
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(); // Aplicar tema al cargar
    renderAuthUI(); // Renderizar la interfaz de usuario de autenticación/aplicación
});