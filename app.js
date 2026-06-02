const express = require('express');
const mysql = require('mysql2');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Conexión a la base de datos
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API - Inventario',
      version: '1.0.0',
      description: 'Documentación del Sistema de Inventarios'
    },
    servers: [
      {
        url: 'https://api-final-inventario-production.up.railway.app'
      }
    ]
  },
  apis: ['./app.js'] // Railway necesita el path relativo exacto
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @openapi
 * /productos:
 * get:
 * tags:
 * - Inventario
 * summary: Obtener lista de productos
 * responses:
 * 200:
 * description: Lista obtenida correctamente
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
 * tags:
 * - Inventario
 * summary: Agregar nuevo producto
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
 * 201:
 * description: Creado
 */
app.post('/productos', (req, res) => {
  const { nombre, precio, stock } = req.body;
  db.query('INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)', 
  [nombre, precio, stock], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ id: result.insertId, mensaje: "Guardado" });
  });
});

/**
 * @openapi
 * /productos/{id}:
 * put:
 * tags:
 * - Inventario
 * summary: Actualizar producto por ID
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
 * description: Actualizado
 */
app.put('/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock } = req.body;
  db.query('UPDATE productos SET nombre=?, precio=?, stock=? WHERE id=?', 
  [nombre, precio, stock, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ mensaje: "Actualizado" });
  });
});

/**
 * @openapi
 * /productos/{id}:
 * delete:
 * tags:
 * - Inventario
 * summary: Eliminar producto
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Eliminado
 */
app.delete('/productos/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM productos WHERE id=?', [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ mensaje: "Eliminado" });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor en línea'));