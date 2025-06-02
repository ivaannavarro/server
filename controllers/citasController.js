const Appointment = require('../models/Citas');
const User = require('../models/User');

// Obtener todas las citas
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .select('patientName doctor department date time consultationType reason notes duration status')
            .populate('doctor', 'username');
        
        // Transformar los datos para mostrar solo patientName
        const transformedAppointments = appointments.map(appointment => {
            const appointmentObj = appointment.toObject();
            return {
                ...appointmentObj,
                patient: { username: appointmentObj.patientName }
            };
        });

        res.json({ success: true, data: transformedAppointments });
    } catch (error) {
        console.error('Error al obtener citas:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener las citas',
            error: error.message 
        });
    }
};

// Obtener una cita por ID
exports.getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patient', 'username')
            .populate('doctor', 'username');
        if (!appointment) {
            return res.status(404).json({ 
                success: false, 
                message: 'Cita no encontrada' 
            });
        }
        res.json({ success: true, data: appointment });
    } catch (error) {
        console.error('Error al obtener cita:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener la cita',
            error: error.message 
        });
    }
};

// Obtener citas por doctor
exports.getAppointmentsByDoctor = async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctor: req.params.doctorId })
            .populate('patient', 'username')
            .populate('doctor', 'username');
        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Obtener citas por paciente
exports.getAppointmentsByPatient = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.params.patientId })
            .populate('patient', 'username')
            .populate('doctor', 'username');
        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Crear una nueva cita
exports.createAppointment = async (req, res) => {
    try {
        console.log('Datos recibidos:', req.body);

        // Buscar el doctor por username
        const doctor = await User.findOne({ username: req.body.doctorUsername });

        if (!doctor) {
            return res.status(400).json({ 
                success: false, 
                message: `Doctor con username "${req.body.doctorUsername}" no encontrado` 
            });
        }

        const appointmentData = {
            patientName: req.body.patientName,
            doctor: doctor._id,
            department: req.body.department,
            date: req.body.date,
            time: req.body.time,
            consultationType: req.body.consultationType,
            reason: req.body.reason,
            notes: req.body.notes,
            duration: req.body.duration,
            status: req.body.status || 'pendiente'
        };

        console.log('Datos procesados para crear cita:', appointmentData);

        const appointment = new Appointment(appointmentData);
        const newAppointment = await appointment.save();

        const populatedAppointment = await Appointment.findById(newAppointment._id)
            .populate('doctor', 'username');

        res.status(201).json({ 
            success: true, 
            data: populatedAppointment,
            message: 'Cita creada exitosamente' 
        });
    } catch (error) {
        console.error('Error al crear cita:', error);
        res.status(400).json({ 
            success: false, 
            message: 'Error al crear la cita',
            error: error.message 
        });
    }
};

// Actualizar una cita
exports.updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ 
                success: false, 
                message: 'Cita no encontrada' 
            });
        }

        // Si se están actualizando paciente o doctor, buscar por username
        if (req.body.patientUsername) {
            const patient = await User.findOne({ username: req.body.patientUsername });
            if (!patient) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Paciente con username "${req.body.patientUsername}" no encontrado` 
                });
            }
            req.body.patient = patient._id;
        }

        if (req.body.doctorUsername) {
            const doctor = await User.findOne({ username: req.body.doctorUsername });
            if (!doctor) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Doctor con username "${req.body.doctorUsername}" no encontrado` 
                });
            }
            req.body.doctor = doctor._id;
        }

        // Actualizar campos
        Object.keys(req.body).forEach(key => {
            if (key !== 'patientUsername' && key !== 'doctorUsername') {
                appointment[key] = req.body[key];
            }
        });

        const updatedAppointment = await appointment.save();
        const populatedAppointment = await Appointment.findById(updatedAppointment._id)
            .populate('patient', 'username')
            .populate('doctor', 'username');

        res.json({ 
            success: true, 
            data: populatedAppointment,
            message: 'Cita actualizada exitosamente' 
        });
    } catch (error) {
        console.error('Error al actualizar cita:', error);
        res.status(400).json({ 
            success: false, 
            message: 'Error al actualizar la cita',
            error: error.message 
        });
    }
};

// Eliminar una cita
exports.deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ 
                success: false, 
                message: 'Cita no encontrada' 
            });
        }

        await appointment.deleteOne();
        res.json({ 
            success: true, 
            message: 'Cita eliminada correctamente' 
        });
    } catch (error) {
        console.error('Error al eliminar cita:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar la cita',
            error: error.message 
        });
    }
};
