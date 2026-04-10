const express = require('express');
const router = express.Router();
const { users, ventas, metas } = require('../data/db');
const { authMiddleware } = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

// Aplicar middleware de autenticación y rol de gerente a todas las rutas
router.use(authMiddleware);
router.use(roleMiddleware(['gerente']));

// GET /gerente/vendedores
router.get('/vendedores', (req, res) => {
  const { trimestre, anio } = req.query;
  const vendedores = users.filter(u => u.role === 'vendedor').map(v => {
    const vVentas = ventas.filter(ven => 
      ven.vendedorId === v.id && 
      (!trimestre || ven.quarter === trimestre) &&
      (!anio || ven.anio === anio)
    );
    const vMeta = metas.find(m => 
      m.vendedorId === v.id && 
      (!trimestre || m.trimestre === trimestre) &&
      (!anio || m.anio === anio)
    );
    return {
      id: v.id,
      name: v.name,
      email: v.email,
      region: v.region,
      totalVentas: vVentas.reduce((sum, ven) => sum + ven.monto, 0),
      meta: vMeta ? vMeta.mensual : 0
    };
  });
  res.json(vendedores);
});

// GET /gerente/dashboard
router.get('/dashboard', (req, res) => {
  const { anio } = req.query;
  const summary = ['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
    const qVentas = ventas.filter(v => v.quarter === q && (!anio || v.anio === anio));
    const qMetas = metas.filter(m => m.trimestre === q && (!anio || m.anio === anio));
    
    const totalVentas = qVentas.reduce((sum, v) => sum + v.monto, 0);
    const totalMeta = qMetas.reduce((sum, m) => sum + m.mensual, 0);
    const orders = qVentas.length;
    const ticket = orders > 0 ? Math.round(totalVentas / orders) : 0;
    
    return {
      trimestre: q,
      totalVentas,
      orders,
      ticket,
      metaPct: totalMeta > 0 ? Math.round((totalVentas / totalMeta) * 100) : 0
    };
  });
  
  res.json(summary);
});

// GET /gerente/reportes
router.get('/reportes', (req, res) => {
  const { trimestre, anio } = req.query;
  const filteredSales = ventas.filter(v => 
    (!trimestre || v.quarter === trimestre) &&
    (!anio || v.anio === anio)
  );

  const byRegion = {};
  filteredSales.forEach(v => {
    const user = users.find(u => u.id === v.vendedorId);
    const region = user ? user.region : 'Desconocida';
    if (!byRegion[region]) byRegion[region] = 0;
    byRegion[region] += v.monto;
  });

  const byMonth = {};
  filteredSales.forEach(v => {
    const date = new Date(v.fecha);
    const month = date.toLocaleString('es-ES', { month: 'long' });
    if (!byMonth[month]) byMonth[month] = 0;
    byMonth[month] += v.monto;
  });

  res.json({
    region: byRegion,
    mensual: byMonth
  });
});

module.exports = router;
