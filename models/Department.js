const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del departamento es requerido'],
        trim: true
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción del departamento es requerida'],
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema); 