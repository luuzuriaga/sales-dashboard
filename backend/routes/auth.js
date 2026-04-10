const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { users } = require('../data/db');
const { SECRET_KEY } = require('../middleware/auth');

// POST /auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  // Generar token
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    SECRET_KEY,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

// POST /auth/register
router.post('/register', (req, res) => {
  const { name, email, password, role, region } = req.body;

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'El email ya está registrado' });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
    password,
    role: role || 'vendedor',
    region: region || 'Sin definir'
  };

  users.push(newUser);
  res.status(201).json({ message: 'Usuario registrado con éxito', user: { id: newUser.id, name, email, role: newUser.role } });
});

module.exports = router;
