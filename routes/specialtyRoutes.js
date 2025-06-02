const express = require('express');
const router = express.Router();
const {
    getAllSpecialties,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty,
    getSpecialtiesByDepartment
} = require('../controllers/specialtyController');

// Rutas específicas primero
router.get('/department/:departmentId', getSpecialtiesByDepartment);

// Rutas principales
router.route('/')
    .get(getAllSpecialties)
    .post(createSpecialty);

// Rutas por ID al final
router.route('/:id')
    .put(updateSpecialty)
    .delete(deleteSpecialty);

// Rutas de especialidades
router.get('/', getAllSpecialties);
router.post('/',  createSpecialty);
router.put('/:id', updateSpecialty);
router.delete('/:id', deleteSpecialty);
router.get('/department/:department', getSpecialtiesByDepartment);

module.exports = router; 