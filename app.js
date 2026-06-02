const express = require('express');
const mysql = require('mysql2');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();
app.use(express.json());

// --- CONFIGURACIÓN DE CORS MANUAL (Sin librerías) ---
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

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
    console.log('Conectado a la base de datos MySQL');
});

// 2. DOCUMENTACIÓN (Escrita directamente para que NADA falle)
const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'API - Inventario',
        version: '1.0.0',
        description: 'Proyecto Final de Ingeniería en Sistemas'
    },
    servers: [
        { url: 'https://api-final-inventario-production.up.railway.app' }
    ],
    paths: {
        '/productos': {
            get: {
                summary: 'Listar todos los productos',
                responses: { '200': { description: 'Exito' } }
            },
            post: {
                summary: 'Agregar producto',
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    nombre: { type: 'string', example: 'Producto Nuevo' },
                                    precio: { type: 'number', example: 10.50 },
                                    stock: { type: 'integer', example: 5 }
                                }
                            }
                        }
                    }
                },
                responses: { '201': { description: 'Creado' } }
            }
        },
        '/productos/{id}': {
            put: {
                summary: 'Actualizar producto por ID',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    nombre: { type: 'string' },
                                    precio: { type: 'number' },
                                    stock: { type: 'integer' }
                                }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'Actualizado' } }
            },
            delete: {
                summary: 'Eliminar producto por ID',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { '200': { description: 'Eliminado' } }
            }
        }
    }
};

app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --- RUTAS ---
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