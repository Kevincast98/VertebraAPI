const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'prueba',
    password: 'root', // Asegúrate de que esta sea una cadena de texto
    port: 5432,
});


//RUTA_AUTENTICACION_TOKE

// Middleware para verificar y validar el token JWT en las solicitudes
const authenticateToken = (req, res, next) => {
    // Obtener el token de la cabecera de autorización
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Verificar si el token existe
    if (!token) {
        return res.status(401).json({ success: false, message: 'Token de acceso no proporcionado' });
    }

    // Verificar y validar el token
    jwt.verify(token, 'tu_clave_secreta', (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Token de acceso inválido' });
        }
        // Si el token es válido, adjuntar los datos de usuario al objeto de solicitud y continuar
        req.user = user;
        next();
    });
};


//LISTAR_USUARIOS
const getUsers = async(req, res) => {
    // Se supone que este middleware garantiza que el token es válido y el usuario está autenticado
    try {
        const response = await pool.query('SELECT * FROM users');
        if (response.rows.length > 0) {
            res.status(200).json({ success: true, message: 'Se encontraron los siguientes usuarios', data: response.rows });
        } else {
            res.status(404).json({ success: false, message: 'No se encontraron usuarios' });
        }
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};


//LOGIN
const login = async(req, res) => {
    const { username, password } = req.body;
    try {
        const query = 'SELECT * FROM users WHERE username = $1 AND password = $2';
        const result = await pool.query(query, [username, password]);
        if (result.rows.length > 0) {
            const userId = result.rows[0].id;
            const username = result.rows[0].username;
            const token = jwt.sign({ userId, username }, 'tu_clave_secreta', { expiresIn: '1h' });
            res.status(200).json({ success: true, token });
        } else {
            res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};



//BODEGAS

//Crear_Bodega
const createWarehouse = async(req, res) => {
    try {
        const { name, capacity } = req.body;

        // Verificar si ya existe una bodega con el mismo nombre
        const existingWarehouse = await pool.query('SELECT * FROM warehouse WHERE name = $1', [name]);

        if (existingWarehouse.rows.length > 0) {
            // Si ya existe una bodega con el mismo nombre, devuelve un mensaje de error
            return res.status(400).json({ success: false, message: 'Ya existe una bodega con este nombre' });
        }

        // Verificar si la capacidad es mayor a 1000
        if (capacity > 1000) {
            // Si la capacidad es mayor a 1000, devuelve un mensaje de error
            return res.status(400).json({ success: false, message: 'La capacidad no puede ser mayor a 1000' });
        }

        // Si pasa todas las validaciones, inserta la nueva bodega en la base de datos
        const response = await pool.query(
            'INSERT INTO warehouse (name, capacity) VALUES ($1, $2) RETURNING *', [name, capacity]
        );

        res.status(201).json({
            success: true,
            message: 'Bodega creada exitosamente',
            data: response.rows[0]
        });
    } catch (error) {
        console.error('Error al crear la bodega:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

//Editar_Bodega
const editWarehouse = async(req, res) => {
    try {
        const { id } = req.params; // Obtener el ID de la URL
        const { name, capacity } = req.body;

        // Verificar si la bodega que se intenta editar existe en la base de datos
        const existingWarehouse = await pool.query('SELECT * FROM warehouse WHERE id = $1', [id]);

        if (existingWarehouse.rows.length === 0) {
            // Si la bodega no existe, devolver un mensaje de error
            return res.status(404).json({ success: false, message: 'La bodega no existe' });
        }

        // Realizar la actualización de los datos de la bodega en la base de datos
        const response = await pool.query(
            'UPDATE warehouse SET name = $1, capacity = $2 WHERE id = $3 RETURNING *', [name, capacity, id]
        );

        res.status(200).json({
            success: true,
            message: 'Bodega actualizada exitosamente',
            data: response.rows[0]
        });
    } catch (error) {
        console.error('Error al editar la bodega:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};


//Eliminar_Bodega
const deleteWarehouse = async(req, res) => {
    try {
        const warehouseId = req.params.id; // Obtener el ID de la bodega de los parámetros de la URL

        // Obtener la información de la bodega antes de eliminarla
        const existingWarehouse = await pool.query('SELECT * FROM warehouse WHERE id = $1', [warehouseId]);
        if (existingWarehouse.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'La bodega no fue encontrada' });
        }

        const deletedWarehouse = existingWarehouse.rows[0]; // Almacenar la información de la bodega antes de eliminarla

        // Eliminar la bodega
        await pool.query('DELETE FROM warehouse WHERE id = $1', [warehouseId]);

        res.status(200).json({
            success: true,
            message: 'Bodega eliminada exitosamente',
            deletedWarehouse: deletedWarehouse // Devolver la información de la bodega eliminada
        });
    } catch (error) {
        console.error('Error al eliminar la bodega:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

//Listar-Bodegas
const listWarehouses = async(req, res) => {
    try {
        // Realizar una consulta para obtener todas las bodegas
        const response = await pool.query('SELECT * FROM warehouse');

        // Verificar si se encontraron bodegas
        if (response.rows.length > 0) {
            res.status(200).json({ success: true, message: 'Bodegas encontradas', data: response.rows });
        } else {
            // Si no se encontraron bodegas, devolver un mensaje informativo
            res.status(404).json({ success: false, message: 'No se encontraron bodegas' });
        }
    } catch (error) {
        console.error('Error al listar las bodegas:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};


//PRODUCTOS

//Crear_producto
const createProduct = async(req, res) => {
    try {
        const { name, price } = req.body;

        // Verificar si ya existe un producto con el mismo nombre
        const existingProduct = await pool.query('SELECT * FROM Product WHERE name = $1', [name]);
        if (existingProduct.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Ya existe un producto con este nombre' });
        }

        // Si no hay un producto con el mismo nombre, procede a crearlo
        const response = await pool.query('INSERT INTO Product (name, price) VALUES ($1, $2) RETURNING *', [name, price]);

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: response.rows[0]
        });
    } catch (error) {
        console.error('Error al crear el producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

//Editar_Producto
const editProduct = async(req, res) => {
    try {
        const productId = req.params.id; // Obtener el ID del producto de los parámetros de la URL
        const { name, price } = req.body; // Obtener los nuevos datos del producto

        // Verificar si el producto existe
        const existingProduct = await pool.query('SELECT * FROM Product WHERE id = $1', [productId]);
        if (existingProduct.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        // Verificar si ya existe otro producto con el nuevo nombre (si se está cambiando)
        if (name && name !== existingProduct.rows[0].name) {
            const duplicateProduct = await pool.query('SELECT * FROM Product WHERE name = $1', [name]);
            if (duplicateProduct.rows.length > 0) {
                return res.status(400).json({ success: false, message: 'Ya existe un producto con este nombre' });
            }
        }

        // Actualizar el producto en la base de datos
        const response = await pool.query('UPDATE Product SET name = $1, price = $2 WHERE id = $3 RETURNING *', [name, price, productId]);

        res.status(200).json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: response.rows[0]
        });
    } catch (error) {
        console.error('Error al editar el producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

//Eliminar_Producto
const deleteProduct = async(req, res) => {
    try {
        const { id } = req.params; // Obtener el ID del producto de la URL

        // Verificar si el producto que se intenta eliminar existe en la base de datos
        const existingProduct = await pool.query('SELECT * FROM Product WHERE id = $1', [id]);

        if (existingProduct.rows.length === 0) {
            // Si el producto no existe, devolver un mensaje de error
            return res.status(404).json({ success: false, message: 'El producto no existe' });
        }

        // Guardar la información del producto antes de eliminarlo
        const deletedProduct = existingProduct.rows[0];

        // Realizar la eliminación del producto en la base de datos
        await pool.query('DELETE FROM Product WHERE id = $1', [id]);

        res.status(200).json({
            success: true,
            message: 'Producto eliminado exitosamente',
            deletedProduct: deletedProduct
        });
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};


const getProducts = async(req, res) => {
    try {
        // Consultar todos los productos en la base de datos
        const response = await pool.query('SELECT * FROM product');

        // Verificar si se encontraron productos
        if (response.rows.length > 0) {
            // Enviar la respuesta con los productos encontrados
            res.status(200).json({
                success: true,
                message: 'Lista de productos obtenida exitosamente',
                data: response.rows
            });
        } else {
            // Enviar una respuesta 404 si no se encontraron productos
            res.status(404).json({
                success: false,
                message: 'No se encontraron productos'
            });
        }
    } catch (error) {
        // Manejar cualquier error que ocurra durante la consulta
        console.error('Error al obtener productos:', error);
        // Enviar una respuesta 500 en caso de error interno del servidor
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};


//Ingresar productos a Bodegas
const addProductToWarehouse = async(req, res) => {
    try {
        const { destinationId, productId, quantity } = req.body;

        // Verificar si la bodega de destino existe
        const existingDestination = await pool.query('SELECT * FROM warehouse WHERE id = $1', [destinationId]);
        if (existingDestination.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'La bodega de destino no fue encontrada' });
        }

        // Verificar si el producto ya está presente en la bodega
        const existingItem = await pool.query('SELECT * FROM item WHERE warehouse_id = $1 AND product_id = $2', [destinationId, productId]);
        if (existingItem.rows.length > 0) {
            // Si el producto ya está presente, actualizar la cantidad
            await pool.query('UPDATE item SET quantity = quantity + $1 WHERE warehouse_id = $2 AND product_id = $3', [quantity, destinationId, productId]);
        } else {
            // Si el producto no está presente, crear un nuevo registro en la tabla item
            await pool.query('INSERT INTO item (warehouse_id, product_id, quantity) VALUES ($1, $2, $3)', [destinationId, productId, quantity]);
        }

        // Registrar el movimiento en la tabla Movimiento
        const today = new Date();
        const response = await pool.query(
            'INSERT INTO movimiento (date, origin, destination, product_id, quantity) VALUES ($1, NULL, $2, $3, $4) RETURNING *', [today, destinationId, productId, quantity]
        );

        res.status(201).json({ success: true, message: 'Producto ingresado a la bodega exitosamente', data: response.rows[0] });
    } catch (error) {
        console.error('Error al ingresar producto a la bodega:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

// const addProductToWarehouse = async(req, res) => {
//     try {
//         const { originId, destinationId, productId, quantity } = req.body;

//         // Verificar si las bodegas origen y destino existen
//         const existingOrigin = await pool.query('SELECT * FROM warehouse WHERE id = $1', [originId]);
//         const existingDestination = await pool.query('SELECT * FROM warehouse WHERE id = $1', [destinationId]);
//         if (existingOrigin.rows.length === 0 || existingDestination.rows.length === 0) {
//             return res.status(404).json({ success: false, message: 'La bodega de origen o destino no fue encontrada' });
//         }

//         // Verificar la capacidad máxima de la bodega de destino
//         const destinationCapacity = existingDestination.rows[0].capacity;
//         const currentOccupiedCapacity = await pool.query('SELECT COALESCE(SUM(quantity), 0) FROM movimiento WHERE destination = $1', [destinationId]);
//         const occupiedCapacity = currentOccupiedCapacity.rows[0].coalesce || 0;
//         if (occupiedCapacity + quantity > destinationCapacity) {
//             return res.status(400).json({ success: false, message: 'La capacidad máxima de la bodega de destino ha sido alcanzada' });
//         }

//         // Registrar el movimiento en la tabla Movimiento
//         const today = new Date();
//         const response = await pool.query(
//             'INSERT INTO movimiento (date, origin, destination, product_id, quantity) VALUES ($1, $2, $3, $4, $5) RETURNING *', [today, originId, destinationId, productId, quantity]
//         );

//         res.status(201).json({ success: true, message: 'Producto ingresado a la bodega exitosamente', data: response.rows[0] });
//     } catch (error) {
//         console.error('Error al ingresar producto a la bodega:', error);
//         res.status(500).json({ success: false, message: 'Error interno del servidor' });
//     }
// };


//Listar Movimientos

const listMovements = async(req, res) => {
    try {
        // Consultar todos los movimientos en la tabla Movimiento
        const movements = await pool.query('SELECT * FROM movimiento');

        // Verificar si se encontraron movimientos
        if (movements.rows.length > 0) {
            // Enviar la lista de movimientos como respuesta
            res.status(200).json({ success: true, message: 'Movimientos encontrados', data: movements.rows });
        } else {
            // Enviar una respuesta 404 (Not Found) si no se encontraron movimientos
            res.status(404).json({ success: false, message: 'No se encontraron movimientos' });
        }
    } catch (error) {
        // Manejar cualquier error que ocurra durante la consulta
        console.error('Error al listar movimientos:', error);
        // Enviar una respuesta 500 (Internal Server Error) en caso de error
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

//Movimietos_entre_bodegas
const makeWarehouseMovement = async(req, res) => {
    try {
        const { originId, destinationId, productId, quantity } = req.body;

        // Verificar si las bodegas origen y destino existen
        const existingOrigin = await pool.query('SELECT * FROM warehouse WHERE id = $1', [originId]);
        const existingDestination = await pool.query('SELECT * FROM warehouse WHERE id = $1', [destinationId]);
        if (existingOrigin.rows.length === 0 || existingDestination.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'La bodega de origen o destino no fue encontrada' });
        }

        // Verificar la capacidad máxima de la bodega de destino
        const destinationCapacity = existingDestination.rows[0].capacity;
        const currentOccupiedCapacity = await pool.query('SELECT COALESCE(SUM(quantity), 0) FROM movimiento WHERE destination = $1', [destinationId]);
        const occupiedCapacity = currentOccupiedCapacity.rows[0].coalesce || 0;
        if (occupiedCapacity + quantity > destinationCapacity) {
            return res.status(400).json({ success: false, message: 'La capacidad máxima de la bodega de destino ha sido alcanzada' });
        }

        // Registrar el movimiento en la tabla Movimiento
        const today = new Date();
        const response = await pool.query(
            'INSERT INTO movimiento (date, origin, destination, product_id, quantity) VALUES ($1, $2, $3, $4, $5) RETURNING *', [today, originId, destinationId, productId, quantity]
        );

        res.status(201).json({ success: true, message: 'Producto ingresado a la bodega exitosamente', data: response.rows[0] });
    } catch (error) {
        console.error('Error al ingresar producto a la bodega:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

//Salidas_de_Bodega

const getOutboundWarehouseMovements = async(req, res) => {
    try {
        // Consultar los movimientos de salida de productos a bodegas
        const outboundMovements = await pool.query(
            'SELECT * FROM movimiento WHERE origin IS NOT NULL'
        );

        res.status(200).json({ success: true, data: outboundMovements.rows });
    } catch (error) {
        console.error('Error al obtener las salidas de productos a bodegas:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

module.exports = {
    getUsers,
    login,
    authenticateToken,
    createWarehouse,
    editWarehouse,
    deleteWarehouse,
    listWarehouses,
    createProduct,
    editProduct,
    deleteProduct,
    getProducts,
    addProductToWarehouse,
    listMovements,
    makeWarehouseMovement,
    getOutboundWarehouseMovements
};