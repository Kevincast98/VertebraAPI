const express = require('express');
const router = express.Router();

const { getUsers, login, authenticateToken } = require('../controllers/index.controller');
const { createWarehouse, editWarehouse, deleteWarehouse, listWarehouses } = require('../controllers/index.controller');
const { createProduct, editProduct, deleteProduct, getProducts } = require('../controllers/index.controller');
const { addProductToWarehouse, listMovements, makeWarehouseMovement, getOutboundWarehouseMovements } = require('../controllers/index.controller');




// Ruta para obtener usuarios, se requiere autenticación
router.get('/listar-usuarios/get/users/', authenticateToken, getUsers);

// Ruta para iniciar sesión
router.post('/login', login);

//BODEGAS
router.post('/crear-bodega/post/', authenticateToken, createWarehouse);
router.put('/editar-bodega/put/:id/', authenticateToken, editWarehouse);
router.delete('/eliminar-bodega/delete/:id/', authenticateToken, deleteWarehouse);
router.get('/listar-bodegas/get/', authenticateToken, listWarehouses);

//PRODUCTOS
router.post('/crear-producto/post/', authenticateToken, createProduct);
router.put('/editar-producto/put/:id/', authenticateToken, editProduct);
router.delete('/eliminar-producto/delete/:id/', authenticateToken, deleteProduct);
router.get('/listar-productos/get/', authenticateToken, getProducts);

//Ingresar productos a Bodegas
router.post('/inserta-producto-a-bodega/post/', authenticateToken, addProductToWarehouse);
router.get('/listar-movimientos/get/', authenticateToken, listMovements);
router.post('/movimiento-entre-bodegas/post/', authenticateToken, makeWarehouseMovement);
router.get('/salidas-bodega/get/:id/', authenticateToken, getOutboundWarehouseMovements);





module.exports = router;