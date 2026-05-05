const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Token malformado' });
  }

  const token = parts[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      throw new Error('Token payload invalid');
    }
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error('[Auth Middleware]', err.message);
    return res.status(401).json({ error: 'Token inválido' });
  }
};