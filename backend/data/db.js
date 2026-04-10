// In-memory database simulation
const users = [
  { id: 1, name: 'Admin Gerente', email: 'admin@test.com', password: 'password123', role: 'gerente', region: 'Global' },
  { id: 2, name: 'Andrea Ramos', email: 'andrea@test.com', password: 'password123', role: 'vendedor', region: 'Lima' },
  { id: 3, name: 'Carlos Díaz', email: 'carlos@test.com', password: 'password123', role: 'vendedor', region: 'Arequipa' },
  { id: 4, name: 'Lucía Paredes', email: 'lucia@test.com', password: 'password123', role: 'vendedor', region: 'Trujillo' },
  { id: 5, name: 'Marco Quispe', email: 'marco@test.com', password: 'password123', role: 'vendedor', region: 'Cusco' },
  { id: 6, name: 'Valeria Torres', email: 'valeria@test.com', password: 'password123', role: 'vendedor', region: 'Lima' }
];

const ventas = [
  // 2025 - Q1
  { id: 1, vendedorId: 2, monto: 15000, cliente: 'Corporación Alfa', fecha: '2025-01-15', quarter: 'Q1', anio: '2025' },
  { id: 2, vendedorId: 2, monto: 23400, cliente: 'Importaciones Beta', fecha: '2025-02-10', quarter: 'Q1', anio: '2025' },
  { id: 3, vendedorId: 3, monto: 34200, cliente: 'Servicios Gamma', fecha: '2025-02-20', quarter: 'Q1', anio: '2025' },
  { id: 4, vendedorId: 4, monto: 27100, cliente: 'Logística Delta', fecha: '2025-03-05', quarter: 'Q1', anio: '2025' },
  { id: 5, vendedorId: 5, monto: 21400, cliente: 'Inversiones Epsilon', fecha: '2025-03-12', quarter: 'Q1', anio: '2025' },
  
  // 2025 - Q2
  { id: 6, vendedorId: 2, monto: 45200, cliente: 'Tiendas Zeta', fecha: '2025-04-15', quarter: 'Q2', anio: '2025' },
  { id: 7, vendedorId: 3, monto: 37100, cliente: 'Grupo Omega', fecha: '2025-05-10', quarter: 'Q2', anio: '2025' },
  { id: 8, vendedorId: 4, monto: 12500, cliente: 'Constructora Pi', fecha: '2025-05-22', quarter: 'Q2', anio: '2025' },
  { id: 9, vendedorId: 5, monto: 18900, cliente: 'Tech Sigma', fecha: '2025-06-05', quarter: 'Q2', anio: '2025' },
  { id: 10, vendedorId: 6, monto: 35600, cliente: 'Farmacia Rho', fecha: '2025-06-20', quarter: 'Q2', anio: '2025' },

  // 2025 - Q3
  { id: 11, vendedorId: 2, monto: 33000, cliente: 'Distribuidora Kappa', fecha: '2025-07-12', quarter: 'Q3', anio: '2025' },
  { id: 12, vendedorId: 3, monto: 29000, cliente: 'Alimentos Lambda', fecha: '2025-08-18', quarter: 'Q3', anio: '2025' },
  { id: 13, vendedorId: 4, monto: 41000, cliente: 'Textiles Mu', fecha: '2025-09-02', quarter: 'Q3', anio: '2025' },
  { id: 14, vendedorId: 6, monto: 22500, cliente: 'Sistemas Nu', fecha: '2025-09-25', quarter: 'Q3', anio: '2025' },

  // 2025 - Q4
  { id: 15, vendedorId: 2, monto: 55000, cliente: 'Retail Xi', fecha: '2025-10-10', quarter: 'Q4', anio: '2025' },
  { id: 16, vendedorId: 3, monto: 48000, cliente: 'Energía Omicron', fecha: '2025-11-05', quarter: 'Q4', anio: '2025' },
  { id: 17, vendedorId: 4, monto: 32000, cliente: 'Transportes Pi', fecha: '2025-12-12', quarter: 'Q4', anio: '2025' },
  { id: 18, vendedorId: 5, monto: 61000, cliente: 'Minería Sigma', fecha: '2025-12-20', quarter: 'Q4', anio: '2025' },

  // 2026 - Q1 (Nuevos datos proyectados)
  { id: 19, vendedorId: 2, monto: 25000, cliente: 'Corporación Alfa', fecha: '2026-01-20', quarter: 'Q1', anio: '2026' },
  { id: 20, vendedorId: 3, monto: 51000, cliente: 'Importaciones Beta', fecha: '2026-02-15', quarter: 'Q1', anio: '2026' },
  { id: 21, vendedorId: 4, monto: 18000, cliente: 'Servicios Gamma', fecha: '2026-03-10', quarter: 'Q1', anio: '2026' },
  { id: 22, vendedorId: 5, monto: 44000, cliente: 'Logística Delta', fecha: '2026-03-22', quarter: 'Q1', anio: '2026' },

  // 2026 - Q2 (Parcial)
  { id: 23, vendedorId: 2, monto: 68000, cliente: 'Inversiones Epsilon', fecha: '2026-04-05', quarter: 'Q2', anio: '2026' },
  { id: 24, vendedorId: 6, monto: 42000, cliente: 'Tiendas Zeta', fecha: '2026-04-12', quarter: 'Q2', anio: '2026' }
];

const metas = [
  // 2025 Quarters
  { vendedorId: 2, mensual: 45000, trimestre: 'Q1', anio: '2025' },
  { vendedorId: 3, mensual: 35000, trimestre: 'Q1', anio: '2025' },
  { vendedorId: 4, mensual: 30000, trimestre: 'Q1', anio: '2025' },
  { vendedorId: 5, mensual: 25000, trimestre: 'Q1', anio: '2025' },
  { vendedorId: 6, mensual: 30000, trimestre: 'Q1', anio: '2025' },
  
  { vendedorId: 2, mensual: 50000, trimestre: 'Q2', anio: '2025' },
  { vendedorId: 3, mensual: 40000, trimestre: 'Q2', anio: '2025' },
  { vendedorId: 4, mensual: 35000, trimestre: 'Q2', anio: '2025' },
  { vendedorId: 5, mensual: 30000, trimestre: 'Q2', anio: '2025' },
  { vendedorId: 6, mensual: 35000, trimestre: 'Q2', anio: '2025' },

  { vendedorId: 2, mensual: 55000, trimestre: 'Q3', anio: '2025' },
  { vendedorId: 3, mensual: 45000, trimestre: 'Q3', anio: '2025' },
  { vendedorId: 4, mensual: 40000, trimestre: 'Q3', anio: '2025' },
  { vendedorId: 5, mensual: 35000, trimestre: 'Q3', anio: '2025' },
  { vendedorId: 6, mensual: 40000, trimestre: 'Q3', anio: '2025' },

  { vendedorId: 2, mensual: 60000, trimestre: 'Q4', anio: '2025' },
  { vendedorId: 3, mensual: 50000, trimestre: 'Q4', anio: '2025' },
  { vendedorId: 4, mensual: 45000, trimestre: 'Q4', anio: '2025' },
  { vendedorId: 5, mensual: 40000, trimestre: 'Q4', anio: '2025' },
  { vendedorId: 6, mensual: 45000, trimestre: 'Q4', anio: '2025' },

  // 2026 Quarters
  { vendedorId: 2, mensual: 60000, trimestre: 'Q1', anio: '2026' },
  { vendedorId: 3, mensual: 55000, trimestre: 'Q1', anio: '2026' },
  { vendedorId: 4, mensual: 50000, trimestre: 'Q1', anio: '2026' },
  { vendedorId: 5, mensual: 45000, trimestre: 'Q1', anio: '2026' },
  { vendedorId: 6, mensual: 50000, trimestre: 'Q1', anio: '2026' },

  { vendedorId: 2, mensual: 65000, trimestre: 'Q2', anio: '2026' },
  { vendedorId: 3, mensual: 60000, trimestre: 'Q2', anio: '2026' },
  { vendedorId: 4, mensual: 55000, trimestre: 'Q2', anio: '2026' },
  { vendedorId: 5, mensual: 50000, trimestre: 'Q2', anio: '2026' },
  { vendedorId: 6, mensual: 55000, trimestre: 'Q2', anio: '2026' }
];

module.exports = {
  users,
  ventas,
  metas
};
