const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'sales.db');
const db = new sqlite3.Database(dbPath);

const salesData = {
  Q1: {
    kpis: { total: 142800, orders: 312, ticket: 458, metaPct: 78 },
    months: ['Enero', 'Febrero', 'Marzo'],
    ventas: [44000, 51000, 47800],
    metas: [55000, 55000, 55000],
    regiones: [
      { name: 'Lima', pct: 42, ventas: 59976 },
      { name: 'Arequipa', pct: 24, ventas: 34272 },
      { name: 'Trujillo', pct: 19, ventas: 27132 },
      { name: 'Cusco', pct: 15, ventas: 21420 }
    ],
    vendedores: [
      { id: 1, name: 'Andrea Ramos', region: 'Lima', ventas: 38400, meta: 45000 },
      { id: 2, name: 'Carlos Díaz', region: 'Arequipa', ventas: 34200, meta: 30000 },
      { id: 3, name: 'Lucía Paredes', region: 'Trujillo', ventas: 27100, meta: 30000 },
      { id: 4, name: 'Marco Quispe', region: 'Cusco', ventas: 21400, meta: 20000 },
      { id: 5, name: 'Valeria Torres', region: 'Lima', ventas: 21700, meta: 30000 }
    ]
  },
  Q2: {
    kpis: { total: 168500, orders: 374, ticket: 450, metaPct: 92 },
    months: ['Abril', 'Mayo', 'Junio'],
    ventas: [52000, 61000, 55500],
    metas: [55000, 62000, 62000],
    regiones: [
      { name: 'Lima', pct: 48, ventas: 80880 },
      { name: 'Arequipa', pct: 22, ventas: 37070 },
      { name: 'Trujillo', pct: 17, ventas: 28645 },
      { name: 'Cusco', pct: 13, ventas: 21905 }
    ],
    vendedores: [
      { id: 1, name: 'Andrea Ramos', region: 'Lima', ventas: 45200, meta: 45000 },
      { id: 2, name: 'Carlos Díaz', region: 'Arequipa', ventas: 37100, meta: 30000 },
      { id: 3, name: 'Lucía Paredes', region: 'Trujillo', ventas: 28600, meta: 30000 },
      { id: 4, name: 'Marco Quispe', region: 'Cusco', ventas: 22000, meta: 20000 },
      { id: 5, name: 'Valeria Torres', region: 'Lima', ventas: 35600, meta: 30000 }
    ]
  },
  Q3: {
    kpis: { total: 131200, orders: 289, ticket: 454, metaPct: 72 },
    months: ['Julio', 'Agosto', 'Setiembre'],
    ventas: [48000, 42000, 41200],
    metas: [60000, 60000, 60000],
    regiones: [
      { name: 'Lima', pct: 38, ventas: 49856 },
      { name: 'Arequipa', pct: 28, ventas: 36736 },
      { name: 'Trujillo', pct: 20, ventas: 26240 },
      { name: 'Cusco', pct: 14, ventas: 18368 }
    ],
    vendedores: [
      { id: 1, name: 'Andrea Ramos', region: 'Lima', ventas: 31200, meta: 45000 },
      { id: 2, name: 'Carlos Díaz', region: 'Arequipa', ventas: 36700, meta: 30000 },
      { id: 3, name: 'Lucía Paredes', region: 'Trujillo', ventas: 26200, meta: 30000 },
      { id: 4, name: 'Marco Quispe', region: 'Cusco', ventas: 18400, meta: 20000 },
      { id: 5, name: 'Valeria Torres', region: 'Lima', ventas: 18700, meta: 30000 }
    ]
  },
  Q4: {
    kpis: { total: 195600, orders: 421, ticket: 465, metaPct: 107 },
    months: ['Octubre', 'Noviembre', 'Diciembre'],
    ventas: [60000, 68000, 67600],
    metas: [60000, 63000, 60000],
    regiones: [
      { name: 'Lima', pct: 51, ventas: 99756 },
      { name: 'Arequipa', pct: 21, ventas: 41076 },
      { name: 'Trujillo', pct: 16, ventas: 31296 },
      { name: 'Cusco', pct: 12, ventas: 23472 }
    ],
    vendedores: [
      { id: 1, name: 'Andrea Ramos', region: 'Lima', ventas: 58400, meta: 45000 },
      { id: 2, name: 'Carlos Díaz', region: 'Arequipa', ventas: 41100, meta: 30000 },
      { id: 3, name: 'Lucía Paredes', region: 'Trujillo', ventas: 31300, meta: 30000 },
      { id: 4, name: 'Marco Quispe', region: 'Cusco', ventas: 23400, meta: 20000 },
      { id: 5, name: 'Valeria Torres', region: 'Lima', ventas: 41400, meta: 30000 }
    ]
  }
};

db.serialize(() => {
  // Create tables
  db.run(`CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quarter TEXT,
    data TEXT
  )`);

  // Seed data if empty
  db.get("SELECT count(*) as count FROM sales", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO sales (quarter, data) VALUES (?, ?)");
      Object.keys(salesData).forEach(q => {
        stmt.run(q, JSON.stringify(salesData[q]));
      });
      stmt.finalize();
      console.log('Database seeded successfully.');
    }
  });
});

module.exports = db;
