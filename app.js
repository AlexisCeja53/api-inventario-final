const express = require('express');
const mysql = require('mysql2');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// 1. CONEXIÓN A LA BASE DE DATOS (POOL para mayor estabilidad en Railway)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

// 2. CONFIGURACIÓN DE SWAGGER (Título: API - Inventario)
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API - Inventario',
      version: '1.0.0',
      description: 'Sistema de Inventarios - Proyecto Final ITNL'
    },
    servers: [
      {
        url: 'https://api-final-inventario-production.up.railway.app',
        description: 'Servidor Producción'
      }
    ]
  },
  apis: ['./app.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- RUTAS CON MODALIDAD DE COMENTARIOS ---

/**
 * @openapi
 * /productos:
 * get:
 * tags:
 * - Productos
 * summary: Listar todos los productos
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
 * - Productos
 * summary: Crear un nuevo producto
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
 * description: Producto creado
 */
app.post('/productos', (req, res) => {
  const { nombre, precio, stock } = req.body;
  db.query('INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)', 
  [nombre, precio, stock], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ id: result.insertId, mensaje: "Producto guardado" });
  });
});

/**
 * @openapi
 * /productos/{id}:
 * put:
 * tags:
 * - Productos
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
 * description: Producto actualizado
 */
app.put('/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock } = req.body;
  db.query('UPDATE productos SET nombre=?, precio=?, stock=? WHERE id=?', 
  [nombre, precio, stock, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ mensaje: "Actualizado correctamente" });
  });
});

/**
 * @openapi
 * /productos/{id}:
 * delete:
 * tags:
 * - Productos
 * summary: Eliminar un producto del sistema
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Producto eliminado
 */
app.delete('/productos/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM productos WHERE id=?', [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ mensaje: "Eliminado correctamente" });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor activo en puerto ' + PORT));