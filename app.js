const express = require('express');
const mysql = require('mysql2');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();
app.use(express.json());

// 1. Configuración de la conexión a MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT 
});

db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

// 2. Configuración de Swagger / OpenAPI
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Gestión de Inventario',
            version: '1.0.0',
            description: 'Proyecto Final para el Tercer Parcial - Control de Stock',
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Servidor Local' },
        ],
    },
    apis: ['./app.js'], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- DOCUMENTACIÓN Y RUTAS (CRUD) ---

/**
 * @openapi
 * /productos:
 * get:
 * summary: Obtener todos los productos
 * responses:
 * 200:
 * description: Lista de productos obtenida exitosamente.
 */
app.get('/productos', (req, res) => {
    db.query('SELECT * FROM productos', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

/**
 * @openapi
 * /productos:
 * post:
 * summary: Agregar un nuevo producto
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * nombre: { type: string }
 * precio: { type: number }
 * stock: { type: integer }
 * responses:
 * 201:
 * description: Producto creado.
 */
app.post('/productos', (req, res) => {
    const { nombre, precio, stock } = req.body;
    db.query('INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)', 
    [nombre, precio, stock], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ id: result.insertId, nombre, precio, stock });
    });
});

/**
 * @openapi
 * /productos/{id}:
 * put:
 * summary: Actualizar un producto existente
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * nombre:
 * type: string
 * precio:
 * type: number
 * stock:
 * type: integer
 * responses:
 * 200:
 * description: Producto actualizado correctamente
 */
app.put('/productos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, precio, stock } = req.body;
    const query = 'UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?';
    db.query(query, [nombre, precio, stock, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: "Producto actualizado", id });
    });
});

/**
 * @openapi
 * /productos/{id}:
 * delete:
 * summary: Eliminar un producto
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Producto eliminado exitosamente
 */
app.delete('/productos/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM productos WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: "Producto eliminado", id });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Documentación disponible en http://localhost:${PORT}/doc`);
});