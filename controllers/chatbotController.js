const Department = require('../models/Department');
const Specialty = require('../models/Specialty');
const User = require('../models/User');
const Citas = require('../models/Citas'); // Import the Citas model

// Simple in-memory storage for conversation state (for demonstration)
// In a real application, use a database or session storage for persistence
const conversationState = {};

// Function to process the message and determine the intent or handle current state
const processUserMessage = (message, userId) => {
    const lowerMessage = message.toLowerCase();
    const currentState = conversationState[userId]?.step || 'initial';
    const currentData = conversationState[userId]?.data || {};

    // If in a specific booking step, try to process the message based on the step
    if (currentState !== 'initial') {
        return { intent: 'appointments', step: currentState, message, data: currentData };
    }

    // Otherwise, determine initial intent
    if (lowerMessage.includes('departamento') || lowerMessage.includes('departamentos')) {
        return { intent: 'departments' };
    }
    if (lowerMessage.includes('especialidad') || lowerMessage.includes('especialidades')) {
        return { intent: 'specialties' };
    }
    if (lowerMessage.includes('doctor') || lowerMessage.includes('doctores') || lowerMessage.includes('médico') || lowerMessage.includes('médicos')) {
        return { intent: 'doctors' };
    }
    if (lowerMessage.includes('cita') || lowerMessage.includes('agendar') || lowerMessage.includes('reservar')) {
        return { intent: 'appointments' }; // Initial appointment intent
    }
    if (lowerMessage.includes('horario') || lowerMessage.includes('hora') || lowerMessage.includes('atención')) {
        return { intent: 'hours' };
    }
    if (lowerMessage.includes('emergencia') || lowerMessage.includes('urgencia') || lowerMessage.includes('urgente')) {
        return { intent: 'emergency' };
    }
    if (lowerMessage.includes('cancelar') || lowerMessage.includes('detener')) {
         return { intent: 'cancel' }; // Add cancel intent
    }

    return { intent: 'unknown' };
};

// Function to generate recommendations contextuales
const generateContextualSuggestions = (intent, data) => {
    const suggestions = [];
    
    switch (intent) {
        case 'departments':
            if (data.length > 0) {
                const randomDept = data[Math.floor(Math.random() * data.length)];
                suggestions.push({
                    question: `👨‍⚕️ ¿Qué especialidades hay en el departamento de ${randomDept.nombre}?`,
                    intent: 'specialties'
                });
                suggestions.push({
                    question: `👤 ¿Quiénes son los doctores del departamento de ${randomDept.nombre}?`,
                    intent: 'doctors'
                });
            }
            break;

        case 'specialties':
            if (data.length > 0) {
                const randomSpec = data[Math.floor(Math.random() * data.length)];
                suggestions.push({
                    question: `👤 ¿Quiénes son los doctores especialistas en ${randomSpec.nombre}?`,
                    intent: 'doctors'
                });
                suggestions.push({
                    question: `📅 ¿Cómo puedo agendar una cita con un especialista en ${randomSpec.nombre}?`,
                    intent: 'appointments'
                });
            }
            break;

        case 'doctors':
            if (data.length > 0) {
                const randomDoc = data[Math.floor(Math.random() * data.length)];
                suggestions.push({
                    question: `📅 ¿Cómo puedo agendar una cita con Dr(a). ${randomDoc.username}?`,
                    intent: 'appointments'
                });
                suggestions.push({
                    question: `⏰ ¿Cuál es el horario de atención de Dr(a). ${randomDoc.username}?`,
                    intent: 'hours'
                });
            }
            break;

        case 'appointments':
            suggestions.push({
                question: "⏰ ¿Cuáles son los horarios de atención?",
                intent: 'hours'
            });
            suggestions.push({
                question: "🏥 ¿Qué departamentos tienen disponibles?",
                intent: 'departments'
            });
            break;

        case 'hours':
            suggestions.push({
                question: "📅 ¿Cómo puedo agendar una cita?",
                intent: 'appointments'
            });
            suggestions.push({
                question: "👨‍⚕️ ¿Cuáles son las especialidades médicas?",
                intent: 'specialties'
            });
            break;

        case 'emergency':
            suggestions.push({
                question: "🏥 ¿Qué departamentos tienen disponibles?",
                intent: 'departments'
            });
            suggestions.push({
                question: "👤 ¿Quiénes son los doctores disponibles?",
                intent: 'doctors'
            });
            break;

        default:
            suggestions.push(
                {
                    question: "🏥 ¿Qué departamentos tienen disponibles?",
                    intent: 'departments'
                },
                {
                    question: "👨‍⚕️ ¿Cuáles son las especialidades médicas?",
                    intent: 'specialties'
                },
                {
                    question: "👤 ¿Quiénes son los doctores disponibles?",
                    intent: 'doctors'
                }
            );
    }

    return suggestions;
};

// Función para generar una respuesta amigable
const generateResponse = (data, type) => {
    switch (type) {
        case 'departments':
            if (data.length === 0) return '🏥 No hay departamentos registrados en el sistema.';
            return `🏥 Tenemos los siguientes departamentos:\n\n${data.map(dept => 
                `📋 ${dept.nombre}\n   ${dept.descripcion}`
            ).join('\n\n')}`;
        
        case 'specialties':
            if (data.length === 0) return '👨‍⚕️ No hay especialidades registradas en el sistema.';
            return `👨‍⚕️ Las especialidades disponibles son:\n\n${data.map(spec => 
                `📚 ${spec.nombre}\n   ${spec.descripcion}\n   Departamento: ${spec.departamento}`
            ).join('\n\n')}`;
        
        case 'doctors':
            if (data.length === 0) return '👨‍⚕️ No hay doctores registrados en el sistema.';
            return `👨‍⚕️ Nuestros doctores son:\n\n${data.map(doc => 
                `👤 Dr(a). ${doc.username}\n   Especialidad: ${doc.specialty || 'No especificada'}`
            ).join('\n\n')}`;

        case 'appointments':
            return `📅 Para agendar una cita puedes:\n\n` +
                   `1️⃣ Iniciar sesión en tu cuenta\n` +
                   `2️⃣ Seleccionar "Agendar Cita"\n` +
                   `3️⃣ Elegir el departamento y especialidad\n` +
                   `4️⃣ Seleccionar el doctor y fecha disponible\n` +
                   `5️⃣ Confirmar tu cita\n\n` +
                   `¿Necesitas ayuda con alguno de estos pasos?`;

        case 'hours':
            return `⏰ Nuestros horarios de atención son:\n\n` +
                   `🏥 Lunes a Viernes: 8:00 AM - 8:00 PM\n` +
                   `🏥 Sábados: 9:00 AM - 2:00 PM\n` +
                   `🏥 Domingos: Solo emergencias\n\n` +
                   `Los horarios específicos de cada doctor pueden variar. ¿Te gustaría consultar el horario de algún doctor en particular?`;

        case 'emergency':
            return `🚑 En caso de emergencia:\n\n` +
                   `1️⃣ Acude inmediatamente a nuestro servicio de urgencias\n` +
                   `2️⃣ Llama al 911 si es una emergencia grave\n` +
                   `3️⃣ Nuestro personal médico te atenderá de inmediato\n\n` +
                   `¿Necesitas ayuda adicional o información sobre algún departamento específico?`;
        
        default:
            return '🤖 Lo siento, no entiendo tu pregunta. Puedo ayudarte con información sobre departamentos, especialidades, doctores, citas, horarios y emergencias.';
    }
};

// New function to handle the appointment booking flow
const handleAppointmentBooking = async (userId, step, message, data) => {
    let response = '';
    let nextStep = step;
    let newData = { ...data };
    let suggestions = [];

    try {
        switch (step) {
            case 'initial':
                response = '¡Hola! ¿Cuál es tu nombre completo para registrar la cita?';
                nextStep = 'waiting_for_name';
                break;

            case 'waiting_for_name':
                if (message.trim().length < 3) {
                    response = 'Por favor, escribe un nombre válido con al menos 3 letras.';
                    nextStep = 'waiting_for_name';
                } else {
                    newData.patientName = message.trim();
                    const departments = await Department.find();
                    if (departments.length === 0) {
                        response = 'Lo siento, no hay departamentos disponibles en este momento.';
                        nextStep = 'initial';
                        delete conversationState[userId];
                    } else {
                        response = `Gracias, ${newData.patientName}. ¿A qué departamento deseas agendar tu cita?\n\n` +
                            departments.map((dept, index) => `${index + 1}. ${dept.nombre}`).join('\n');
                        nextStep = 'waiting_for_department';
                        newData.departmentsList = departments;
                    }
                }
                break;

            case 'waiting_for_department':
                const departmentIndex = parseInt(message) - 1;
                const selectedDepartment = newData.departmentsList?.[departmentIndex];
                if (selectedDepartment) {
                    newData.department = selectedDepartment.nombre;
                    const doctors = await User.find({
                        role: 'Doctor',
                        specialty: new RegExp(`^${selectedDepartment.nombre}$`, 'i')
                    });
                    if (doctors.length === 0) {
                        response = `Lo siento, no hay doctores disponibles en el departamento de ${selectedDepartment.nombre} en este momento. ¿Desea intentar con otro departamento?`;
                        nextStep = 'initial';
                        delete conversationState[userId];
                    } else {
                        response = `Entendido. Tenemos los siguientes doctores en ${selectedDepartment.nombre}:\n\n` +
                            doctors.map((doc, index) => `${index + 1}. Dr(a). ${doc.username}`).join('\n') +
                            '\n\nPor favor, indique el número del doctor que desea.';
                        nextStep = 'waiting_for_doctor_selection';
                        newData.doctorsList = doctors;
                    }
                } else {
                    response = 'Esa no es una opción válida. Por favor, indique el número del departamento de la lista.\n\n' +
                        newData.departmentsList.map((dept, index) => `${index + 1}. ${dept.nombre}`).join('\n');
                    nextStep = 'waiting_for_department';
                }
                break;

            case 'waiting_for_doctor_selection':
                const doctorIndex = parseInt(message) - 1;
                const selectedDoctor = newData.doctorsList?.[doctorIndex];

                if (selectedDoctor) {
                    newData.doctor = selectedDoctor._id;
                    newData.doctorUsername = selectedDoctor.username;
                    response = `Ha seleccionado al Dr(a). ${selectedDoctor.username}. Ahora, por favor, indique la fecha de la cita (formato YYYY-MM-DD).`;
                    nextStep = 'waiting_for_date';
                    delete newData.doctorsList;
                } else {
                    response = 'Esa no es una opción válida. Por favor, indique el número del doctor de la lista.\n\n' +
                        newData.doctorsList.map((doc, index) => `${index + 1}. Dr(a). ${doc.username}`).join('\n');
                    nextStep = 'waiting_for_doctor_selection';
                }
                break;

            case 'waiting_for_date':
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (dateRegex.test(message)) {
                    newData.date = message;
                    response = `Fecha ${message} recibida. Ahora, por favor, indique la hora de la cita (formato HH:MM, por ejemplo 14:30).`;
                    nextStep = 'waiting_for_time';
                } else {
                    response = 'Formato de fecha inválido. Por favor, use el formato YYYY-MM-DD.';
                    nextStep = 'waiting_for_date';
                }
                break;

            case 'waiting_for_time':
                const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                if (timeRegex.test(message)) {
                    newData.time = message;
                    response = `Hora ${message} recibida. Por favor, indique brevemente la razón de su consulta.`;
                    nextStep = 'waiting_for_reason';
                } else {
                    response = 'Formato de hora inválido. Por favor, use el formato HH:MM (por ejemplo 14:30).';
                    nextStep = 'waiting_for_time';
                }
                break;

            case 'waiting_for_reason':
                if (message.trim().length >= 10) {
                    newData.reason = message.trim();
                    response = `Razón recibida. ¿Tiene alguna nota adicional para el doctor? (Responda 'no' si no tiene notas)`;
                    nextStep = 'waiting_for_notes';
                } else {
                    response = 'Por favor, describa la razón de su consulta con al menos 10 caracteres.';
                    nextStep = 'waiting_for_reason';
                }
                break;

            case 'waiting_for_notes':
                newData.notes = message.toLowerCase() === 'no' ? '' : message.trim();

                const appointmentData = {
                    patientName: newData.patientName,
                    doctor: newData.doctor,
                    department: newData.department,
                    date: new Date(newData.date),
                    time: newData.time,
                    consultationType: 'Primera vez',
                    reason: newData.reason,
                    notes: newData.notes,
                    duration: 30,
                    status: 'pendiente'
                };

                console.log('Attempting to create appointment with data:', appointmentData);

                try {
                    const newCita = await Citas.create(appointmentData);
                    response = `¡Cita agendada con éxito!\n\nDetalles:\n` +
                        `Paciente: ${appointmentData.patientName}\n` +
                        `Doctor: Dr(a). ${newData.doctorUsername}\n` +
                        `Departamento: ${appointmentData.department}\n` +
                        `Fecha: ${appointmentData.date.toLocaleDateString()}\n` +
                        `Hora: ${appointmentData.time}\n` +
                        `Razón: ${appointmentData.reason}`;
                    nextStep = 'initial';
                    delete conversationState[userId];
                    suggestions = generateContextualSuggestions('appointments', []);
                } catch (bookingError) {
                    console.error('Error creating appointment:', bookingError);
                    response = 'Lo siento, hubo un error al intentar agendar la cita. Por favor, intente de nuevo más tarde.';
                    nextStep = 'initial';
                    delete conversationState[userId];
                }
                break;

            default:
                response = 'Algo salió mal con el proceso de agendar cita. Por favor, intente de nuevo.';
                nextStep = 'initial';
                delete conversationState[userId];
                break;
        }
    } catch (error) {
        console.error('Error during appointment booking step:', step, error);
        response = 'Ocurrió un error inesperado. Por favor, intente de nuevo o contacte a soporte.';
        nextStep = 'initial';
        delete conversationState[userId];
    }

    // Guardar el nuevo estado de conversación
    if (nextStep !== 'initial') {
        conversationState[userId] = { step: nextStep, data: newData };
    } else {
        delete conversationState[userId];
    }

    return { response, suggestions };
};



// Controlador principal del chatbot
exports.processMessage = async (req, res) => {
    try {
        const { message } = req.body;

        // Usamos userId solo como identificador de sesión, no como ObjectId
        const userId = req.user?._id?.toString() || 'anonymous';

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'El mensaje es requerido'
            });
        }

        const { intent, step, data } = processUserMessage(message, userId);
        let response = '';
        let suggestions = [];
        let responseData = null;

        // Cancelar flujo actual
        if (intent === 'cancel') {
            delete conversationState[userId];
            response = 'De acuerdo, he cancelado el proceso actual. ¿En qué más puedo ayudarte?';
            suggestions = generateContextualSuggestions('initial', []);
            return res.status(200).json({
                success: true,
                data: { response, suggestions }
            });
        }

        // Flujo de citas médicas
        if (intent === 'appointments' || step) {
            const currentStep = step || 'initial';

            // Si ya tenemos el nombre guardado en la sesión, no pedimos de nuevo
            if (currentStep === 'initial' && conversationState[userId]?.data?.patientName) {
                const bookingResult = await handleAppointmentBooking(
                    userId,
                    'waiting_for_department', // saltamos el paso del nombre
                    message,
                    conversationState[userId].data
                );
                response = bookingResult.response;
                suggestions = bookingResult.suggestions;
                responseData = conversationState[userId]?.data;
            } else {
                const bookingResult = await handleAppointmentBooking(userId, currentStep, message, data);
                response = bookingResult.response;
                suggestions = bookingResult.suggestions;
                responseData = conversationState[userId]?.data;
            }

        } else {
            // Otras intenciones
            let fetchedData = [];

            switch (intent) {
                case 'departments':
                    fetchedData = await Department.find();
                    response = generateResponse(fetchedData, 'departments');
                    suggestions = generateContextualSuggestions('departments', fetchedData);
                    break;

                case 'specialties':
                    fetchedData = await Specialty.find();
                    response = generateResponse(fetchedData, 'specialties');
                    suggestions = generateContextualSuggestions('specialties', fetchedData);
                    break;

                case 'doctors':
                    fetchedData = await User.find({ role: 'Doctor' }).select('username specialty');
                    response = generateResponse(fetchedData, 'doctors');
                    suggestions = generateContextualSuggestions('doctors', fetchedData);
                    break;

                case 'hours':
                    response = generateResponse([], 'hours');
                    suggestions = generateContextualSuggestions('hours', []);
                    break;

                case 'emergency':
                    response = generateResponse([], 'emergency');
                    suggestions = generateContextualSuggestions('emergency', []);
                    break;

                default:
                    response = generateResponse([], 'unknown');
                    suggestions = generateContextualSuggestions('unknown', []);
            }

            // Reset del estado solo si no estamos en el flujo de cita
            delete conversationState[userId];
        }

        return res.status(200).json({
            success: true,
            data: {
                response,
                intent: conversationState[userId]?.step ? 'appointments_flow' : intent,
                data: responseData,
                suggestions
            }
        });

    } catch (error) {
        console.error('Error en el chatbot:', error);
        const userId = req.user?._id?.toString() || 'anonymous';
        delete conversationState[userId];
        return res.status(500).json({
            success: false,
            message: 'Error al procesar el mensaje',
            error: error.message
        });
    }
};


// Obtener sugerencias iniciales
exports.getSuggestions = async (req, res) => {
    try {
        const suggestions = [
            {
                question: "🏥 ¿Qué departamentos tienen disponibles?",
                intent: "departments"
            },
            {
                question: "👨‍⚕️ ¿Cuáles son las especialidades médicas?",
                intent: "specialties"
            },
            {
                question: "👤 ¿Quiénes son los doctores disponibles?",
                intent: "doctors"
            }
        ];

        return res.status(200).json({
            success: true,
            data: suggestions
        });

    } catch (error) {
        console.error('Error al obtener sugerencias:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener sugerencias',
            error: error.message
        });
    }
};