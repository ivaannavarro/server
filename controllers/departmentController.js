const Department = require('../models/Department');

// Obtener todos los departamentos
exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find();
        return res.status(200).json({ 
            success: true, 
            data: departments,
            message: 'Departamentos obtenidos exitosamente' 
        });
    } catch (error) {
        console.error('Error al obtener departamentos:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error al obtener los departamentos',
            error: error.message 
        });
    }
};

// Crear nuevo departamento
exports.createDepartment = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const department = new Department({
            nombre,
            descripcion
        });
        await department.save();
        return res.status(201).json({ 
            success: true, 
            data: department,
            message: 'Departamento creado exitosamente' 
        });
    } catch (error) {
        console.error('Error al crear departamento:', error);
        return res.status(400).json({ 
            success: false, 
            message: 'Error al crear el departamento',
            error: error.message 
        });
    }
};

// Actualizar departamento
exports.updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;
        
        const department = await Department.findByIdAndUpdate(
            id,
            { nombre, descripcion },
            { new: true, runValidators: true }
        );

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Departamento no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            data: department,
            message: 'Departamento actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar departamento:', error);
        return res.status(400).json({
            success: false,
            message: 'Error al actualizar el departamento',
            error: error.message
        });
    }
};

// Eliminar departamento
exports.deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const department = await Department.findByIdAndDelete(id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Departamento no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Departamento eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar departamento:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar el departamento',
            error: error.message
        });
    }
}; 