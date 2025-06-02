const Specialty = require('../models/Specialty');

// Obtener todas las especialidades
exports.getAllSpecialties = async (req, res) => {
    try {
        const specialties = await Specialty.find();
        res.json({ 
            success: true, 
            data: specialties,
            message: 'Especialidades obtenidas exitosamente' 
        });
    } catch (error) {
        console.error('Error al obtener especialidades:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener las especialidades',
            error: error.message 
        });
    }
};

// Crear nueva especialidad
exports.createSpecialty = async (req, res) => {
    try {
        const { nombre, descripcion, departamento } = req.body;
        const specialty = new Specialty({
            nombre,
            descripcion,
            departamento
        });
        await specialty.save();
        res.status(201).json({ 
            success: true, 
            data: specialty,
            message: 'Especialidad creada exitosamente' 
        });
    } catch (error) {
        console.error('Error al crear especialidad:', error);
        res.status(400).json({ 
            success: false, 
            message: 'Error al crear la especialidad',
            error: error.message 
        });
    }
};

// Actualizar especialidad
exports.updateSpecialty = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, departamento } = req.body;
        
        const specialty = await Specialty.findByIdAndUpdate(
            id,
            { nombre, descripcion, departamento },
            { new: true, runValidators: true }
        );

        if (!specialty) {
            return res.status(404).json({
                success: false,
                message: 'Especialidad no encontrada'
            });
        }

        res.json({
            success: true,
            data: specialty,
            message: 'Especialidad actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar especialidad:', error);
        res.status(400).json({
            success: false,
            message: 'Error al actualizar la especialidad',
            error: error.message
        });
    }
};

// Eliminar especialidad
exports.deleteSpecialty = async (req, res) => {
    try {
        const { id } = req.params;
        const specialty = await Specialty.findByIdAndDelete(id);

        if (!specialty) {
            return res.status(404).json({
                success: false,
                message: 'Especialidad no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Especialidad eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar especialidad:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la especialidad',
            error: error.message
        });
    }
};

// Obtener especialidades por departamento
exports.getSpecialtiesByDepartment = async (req, res) => {
    try {
        const { department } = req.params;
        const specialties = await Specialty.find({ departamento: department });
        res.json({ 
            success: true, 
            data: specialties,
            message: 'Especialidades obtenidas exitosamente' 
        });
    } catch (error) {
        console.error('Error al obtener especialidades:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener las especialidades',
            error: error.message 
        });
    }
}; 