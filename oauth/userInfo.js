import jwt from 'jsonwebtoken';

export const userInfo = async (req, res) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'invalid_request', error_description: 'Missing Bearer token' });
  }

  const tokenString = auth.slice('Bearer '.length);
  const token = await AccessToken.findOne({ accessToken: tokenString }).populate('user');

  if (!token) {
    return res.status(401).json({ error: 'invalid_token' });
  }

  if (new Date() > new Date(token.issuedAt.getTime() + token.expiresIn * 1000)) {
    return res.status(401).json({ error: 'invalid_token', error_description: 'Token expired' });
  }

  const user = token.user;

  // Return user info based on scope
  const response = {};
  if (token.scope.includes('profile')) {
    response.name = user.firstName + ' ' + user.lastName;
    response.family_name = user.lastName;
    response.given_name = user.firstName;
    response.birthdate = user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : undefined;
    response.gender = user.sex;
  }
  if (token.scope.includes('email')) {
    response.email = user.email;
  }

  res.json(response);
};
