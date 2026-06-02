const express = require('express');
const mysql = require('mysql2');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();
app.use(express.json());

// CONFIGURACIÓN DE SEGURIDAD (CORS) - Para que los botones funcionen
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

// 1. Uso de POOL (Más estable para Railway)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10
});

// 2. DOCUMENTACIÓN
const swaggerDocument = {
    openapi: '3.0.0',
    info: { title: 'API - Inventario', version: '1.0.0' },
    servers: [{ url: 'https://api-final-inventario-production.up.railway.app' }],
    paths: {
        '/productos': {
            get: { summary: 'Listar productos', responses: { '200': { description: 'OK' } } },
            post: { 
                summary: 'Agregar producto',
                requestBody: {
                    content: { 'application/json': { schema: { 
                        type: 'object', 
                        properties: { nombre: {type:'string'}, precio:{type:'number'}, stock:{type:'integer'} } 
                    } } }
                },
                responses: { '201': { description: 'Creado' } }
            }
        }
    }
};

app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --- RUTAS USANDO EL POOL ---
app.get('/productos', (req, res) => {
    pool.query('SELECT * FROM productos', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/productos', (req, res) => {
    const { nombre, precio, stock } = req.body;
    pool.query('INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)', 
    [nombre, precio, stock], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ id: result.insertId, nombre, precio, stock });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor activo` ));