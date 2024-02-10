const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'prueba',
    password: 'root', // Asegúrate de que esta sea una cadena de texto
    port: 5432,
});

const createWarehouse = async(req, res) => {
    // Lógica para crear una nueva bodega
};

const getWarehouses = async(req, res) => {
    // Lógica para obtener todas las bodegas
};

const getWarehouseById = async(req, res) => {
    // Lógica para obtener una bodega por su ID
};

const updateWarehouse = async(req, res) => {
    // Lógica para actualizar una bodega existente
};

const deleteWarehouse = async(req, res) => {
    // Lógica para eliminar una bodega por su ID
};

module.exports = {
    createWarehouse,
    getWarehouses,
    getWarehouseById,
    updateWarehouse,
    deleteWarehouse
};