import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Lecture tardive des variables d'env pour éviter le problème d'ordre d'import
function getConfig() {
  return {
    email: process.env.ADMIN_EMAIL,
    passwordHash: process.env.ADMIN_PASSWORD_HASH,
    jwtSecret: process.env.JWT_SECRET,
  };
}

const JWT_EXPIRES_IN = '7d';

/**
 * Connexion de l'utilisateur unique (admin).
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const config = getConfig();

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    if (email !== config.email) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    const passwordMatch = await bcrypt.compare(password, config.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    const token = jwt.sign({ email: config.email }, config.jwtSecret, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Connexion réussie.',
      token,
      user: { email: config.email },
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
}

/**
 * Déconnexion.
 */
export function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  return res.status(200).json({ message: 'Déconnexion réussie.' });
}

/**
 * Vérification du statut d'authentification.
 */
export function checkAuth(req, res) {
  return res.status(200).json({
    authenticated: true,
    user: { email: req.user.email },
  });
}
