const express = require('express');
const router = express.Router();
const {
    getAllAppointments,
    getAppointmentById,
    getAppointmentsByDoctor,
    getAppointmentsByPatient,
    createAppointment,
    updateAppointment,
    deleteAppointment
} = require('../controllers/citasController');

// Rutas específicas primero
router.get('/doctor/:doctorId', getAppointmentsByDoctor);
router.get('/patient/:patientId', getAppointmentsByPatient);

// Rutas principales
router.route('/')
    .get(getAllAppointments)
    .post(createAppointment);

// Rutas por ID al final
router.route('/:id')
    .get(getAppointmentById)
    .put(updateAppointment)
    .delete(deleteAppointment);

module.exports = router;