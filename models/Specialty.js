const mongoose = require('mongoose');

const specialtySchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la especialidad es requerido'],
        unique: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción de la especialidad es requerida'],
        trim: true
    },
    departamento: {
        type: String,
        required: [true, 'El departamento es requerido'],
        trim: true
    }
}, {
    timestamps: true
});

const Specialty = mongoose.model('Specialty', specialtySchema);

module.exports = Specialty; 