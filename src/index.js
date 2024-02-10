const express = require('express');
const app = express();
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');



// Middleware para procesar solicitudes JSON y formularios URL codificados
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Importa y usa las rutas para manejar las solicitudes
const indexRoutes = require('./routes/index');
app.use('/api/prueba', indexRoutes); // Agrega el prefijo '/api' a todas las rutas

// Escucha en el puerto 4000
app.listen(4000, () => {
    console.log('Server on port 4000');
});