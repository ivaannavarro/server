const mongoose = require('mongoose');

const citasSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    patientName: {
        type: String,
        required: [true, 'El nombre del paciente es requerido']
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El doctor es requerido']
    },
    department: {
        type: String,
        required: [true, 'El departamento es requerido']
      },      
    date: {
        type: Date,
        required: [true, 'La fecha es requerida']
    },
    time: {
        type: String,
        required: [true, 'La hora es requerida'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
    },
    consultationType: {
        type: String,
        required: [true, 'El tipo de consulta es requerido'],
        enum: ['Primera vez', 'Control', 'Urgencia', 'Seguimiento']
    },
    reason: {
        type: String,
        required: [true, 'La razón de la consulta es requerida'],
        minlength: [10, 'La razón debe tener al menos 10 caracteres'],
        maxlength: [500, 'La razón no puede exceder los 500 caracteres']
    },
    notes: {
        type: String,
        maxlength: [1000, 'Las notas no pueden exceder los 1000 caracteres']
    },
    duration: {
        type: Number,
        required: [true, 'La duración es requerida'],
        min: [15, 'La duración mínima es de 15 minutos'],
        max: [120, 'La duración máxima es de 120 minutos']
    },
    status: {
        type: String,
        enum: ['pendiente', 'confirmada', 'cancelada', 'completada'],
        default: 'pendiente'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Índices para mejorar el rendimiento de las búsquedas
citasSchema.index({ patient: 1, date: 1 });
citasSchema.index({ doctor: 1, date: 1 });
citasSchema.index({ status: 1 });

// Método para verificar si la fecha de la cita es válida
citasSchema.methods.isValidDate = function() {
    const now = new Date();
    const citasDate = new Date(this.date);
    return citasDate >= now;
};

// Middleware para actualizar updatedAt antes de guardar
citasSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const Citas = mongoose.model('Citas', citasSchema);

module.exports = Citas; 