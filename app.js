const express = require('express');
const mysql = require('mysql2');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();
app.use(express.json());

// 1. Conexión a la Base de Datos
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

db.connect((err) => {
    if (err) return console.error('Error MySQL:', err);
    console.log('Conectado a la base de datos');
});

// 2. Definición de Swagger en un Objeto (Sin comentarios sensibles)
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'API- INVENTARIO',
        version: '1.0.0',
        description: 'Proyecto Final de Sistemas para el Tercer Parcial'
    },
    paths: {
        '/productos': {
            get: {
                summary: 'Obtener lista de productos',
                responses: { '200': { description: 'Éxito' } }
            },
            post: {
                summary: 'Agregar nuevo producto',
                responses: { '201': { description: 'Creado' } }
            }
        },
        '/productos/{id}': {
            put: {
                summary: 'Actualizar producto',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { '200': { description: 'Actualizado' } }
            },
            delete: {
                summary: 'Eliminar producto',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { '200': { description: 'Eliminado' } }
            }
        }
    }
};

app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));

// --- RUTAS FUNCIONALES ---

app.get('/productos', (req, res) => {
    db.query('SELECT * FROM productos', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/productos', (req, res) => {
    const { nombre, precio, stock } = req.body;
    db.query('INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)', 
    [nombre, precio, stock], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ id: result.insertId, nombre, precio, stock });
    });
});

app.put('/productos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, precio, stock } = req.body;
    db.query('UPDATE productos SET nombre=?, precio=?, stock=? WHERE id=?', 
    [nombre, precio, stock, id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ mensaje: "Actualizado", id });
    });
});

app.delete('/productos/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM productos WHERE id=?', [id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ mensaje: "Eliminado", id });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));