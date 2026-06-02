const express = require('express');
const mysql = require('mysql2');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// CONEXIÓN A BASE DE DATOS (POOL)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

// CONFIGURACIÓN (Imagen 9af922)
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API - Inventario',
      version: '1.0.0',
      description: 'Proyecto Final de Inventarios - ITNL'
    },
    servers: [
      {
        url: 'https://api-final-inventario-production.up.railway.app'
      }
    ],
    components: {
      schemas: {
        Inventario: {
          type: 'object',
          required: ['nombre', 'precio', 'stock'],
          properties: {
            id: { type: 'integer' },
            nombre: { type: 'string' },
            precio: { type: 'number' },
            stock: { type: 'integer' }
          }
        }
      }
    }
  },
  apis: ['./app.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- RUTAS (Copiando la sangría de la imagen 9af919) ---

/**
 * @swagger
 * /productos:
 * get:
 * summary: Obtener lista de inventario
 * tags: [Inventario]
 * responses:
 * 200:
 * description: Lista obtenida correctamente
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Inventario'
 */
app.get('/productos', (req, res) => {
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/**
 * @swagger
 * /productos:
 * post:
 * summary: Agregar nuevo producto
 * tags: [Inventario]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Inventario'
 * responses:
 * 201:
 * description: Creado exitosamente
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
 * @swagger
 * /productos/{id}:
 * put:
 * summary: Actualizar producto por ID
 * tags: [Inventario]
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
 * $ref: '#/components/schemas/Inventario'
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
 * @swagger
 * /productos/{id}:
 * delete:
 * summary: Eliminar producto
 * tags: [Inventario]
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