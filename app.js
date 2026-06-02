const express = require('express');
const mysql = require('mysql2');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();
app.use(express.json());

// 1. Conexión a la Base de Datos
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'railway',
    port: process.env.DB_PORT || 3306
});

db.connect((err) => {
    if (err) return console.error('Error MySQL:', err);
    console.log('Conectado a la base de datos MySQL');
});

// 2. Configuración de Swagger Simplificada
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Inventario Final',
            version: '1.0.0',
            description: 'Proyecto Final de Sistemas - ITNL'
        },
        servers: [{ url: 'http://localhost:3000' }]
    },
    apis: ['./app.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- RUTAS DE INVENTARIO ---

/**
 * @openapi
 * /productos:
 * get:
 * summary: Lista de productos
 * responses:
 * 200:
 * description: OK
 */
app.get('/productos', (req, res) => {
    db.query('SELECT * FROM productos', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

/**
 * @openapi
 * /productos:
 * post:
 * summary: Agregar producto
 * responses:
 * 201:
 * description: Creado
 */
app.post('/productos', (req, res) => {
    const { nombre, precio, stock } = req.body;
    db.query('INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)', 
    [nombre, precio, stock], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ id: result.insertId, nombre, precio, stock });
    });
});

/**
 * @openapi
 * /productos/{id}:
 * put:
 * summary: Editar producto
 * parameters:
 * - in: path
 * name: id
 * required: true
 * responses:
 * 200:
 * description: Actualizado
 */
app.put('/productos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, precio, stock } = req.body;
    db.query('UPDATE productos SET nombre=?, precio=?, stock=? WHERE id=?', 
    [nombre, precio, stock, id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ mensaje: "Actualizado", id });
    });
});

/**
 * @openapi
 * /productos/{id}:
 * delete:
 * summary: Eliminar producto
 * parameters:
 * - in: path
 * name: id
 * required: true
 * responses:
 * 200:
 * description: Eliminado
 */
app.delete('/productos/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM productos WHERE id=?', [id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ mensaje: "Eliminado", id });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor listo en puerto ${PORT}`));