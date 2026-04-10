const express = require('express');
const router = express.Router();
const { users, ventas, metas } = require('../data/db');
const { authMiddleware } = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

// Aplicar middleware de autenticación y rol de vendedor a todas las rutas
router.use(authMiddleware);
router.use(roleMiddleware(['vendedor']));

// GET /vendedor/perfil
router.get('/perfil', (req, res) => {
  const { anio } = req.query;
  const user = users.find(u => u.id === req.user.id);
  const mySales = ventas.filter(v => v.vendedorId === req.user.id && (!anio || v.anio === anio));
  const myMeta = metas.find(m => m.vendedorId === req.user.id && (!anio || m.anio === anio));
  
  res.json({ 
    id: user.id,
    name: user.name, 
    email: user.email, 
    region: user.region,
    totalVentas: mySales.reduce((sum, v) => sum + v.monto, 0),
    meta: myMeta ? myMeta.mensual : 0,
    ventasRecientes: mySales.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5)
  });
});

// PUT /vendedor/perfil
router.put('/perfil', (req, res) => {
  const { name, region } = req.body;
  const userIndex = users.findIndex(u => u.id === req.user.id);
  
  if (name) users[userIndex].name = name;
  if (region) users[userIndex].region = region;
  
  res.json({ message: 'Perfil actualizado', profile: { name: users[userIndex].name, region: users[userIndex].region } });
});

// GET /vendedor/metas
router.get('/metas', (req, res) => {
  const meta = metas.find(m => m.vendedorId === req.user.id);
  res.json({ meta_mensual: meta ? meta.mensual : 0 });
});

// PUT /vendedor/metas
router.put('/metas', (req, res) => {
  const { mensual } = req.body;
  const metaIndex = metas.findIndex(m => m.vendedorId === req.user.id);
  
  if (metaIndex !== -1) {
    metas[metaIndex].mensual = mensual;
  } else {
    metas.push({ vendedorId: req.user.id, mensual, trimestre: 'Q2' });
  }
  
  res.json({ message: 'Meta actualizada', meta_mensual: mensual });
});

// GET /vendedor/ventas
router.get('/ventas', (req, res) => {
  const mySales = ventas.filter(v => v.vendedorId === req.user.id);
  res.json(mySales);
});

// POST /vendedor/ventas
router.post('/ventas', (req, res) => {
  const { monto, cliente, fecha } = req.body;
  const newVenta = {
    id: ventas.length + 1,
    vendedorId: req.user.id,
    monto,
    cliente,
    fecha,
    quarter: 'Q2' // Simplificación
  };
  ventas.push(newVenta);
  res.status(201).json(newVenta);
});

// GET /vendedor/rendimiento
router.get('/rendimiento', (req, res) => {
  const mySales = ventas.filter(v => v.vendedorId === req.user.id && v.quarter === 'Q1');
  const totalVentas = mySales.reduce((sum, v) => sum + v.monto, 0);
  const meta = metas.find(m => m.vendedorId === req.user.id && m.trimestre === 'Q1');
  
  res.json({
    total_ventas: totalVentas,
    meta: meta ? meta.mensual : 0,
    cumplimiento: meta ? Math.round((totalVentas / meta.mensual) * 100) : 0
  });
});

module.exports = router;
