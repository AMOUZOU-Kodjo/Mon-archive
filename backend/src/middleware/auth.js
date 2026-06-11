import jwt from 'jsonwebtoken';

/**
 * Middleware de protection des routes.
 * Vérifie la validité du JWT dans le cookie ou le header Authorization.
 */
export function protect(req, res, next) {
  // 1. Récupérer le token depuis le cookie HttpOnly ou le header Authorization
  let token = null;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Non authentifié. Token manquant.' });
  }

  try {
    // 2. Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { email: '...', iat: ..., exp: ... }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
}
