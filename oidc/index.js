import { Provider } from 'oidc-provider';
import dotenv from 'dotenv';
dotenv.config();

const clients = [
  {
    client_id: 'my-client-id',
    client_secret: 'my-client-secret',
    redirect_uris: ['http://localhost:4000/callback'],
    response_types: ['code'],
    grant_types: ['authorization_code', 'refresh_token'],
    token_endpoint_auth_method: 'client_secret_basic',
  },
];

const oidcConfig = {
  clients,

  // Enable features like PKCE
  features: {
    pkce: { required: () => true }, // Require PKCE for all clients
    devInteractions: { enabled: false }, // Disable default login UI
    claimsParameter: { enabled: true },
  },

  // Map claims to your DB user model
  claims: {
    openid: ['sub'],
    email: ['email'],
    profile: ['name', 'birthdate', 'gender'],
  },

  // Where you define user authentication
  async findAccount(ctx, id) {
    const user = await User.findById(id);
    if (!user) return undefined;

    return {
      accountId: id,
      async claims() {
        return {
          sub: id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          birthdate: user.dateOfBirth?.toISOString().split('T')[0],
          gender: user.sex,
        };
      },
    };
  },

  interactions: {
    async url(ctx, interaction) {
      return `/auth/interaction/${interaction.uid}`;
    },
  },

  cookies: {
    long: { signed: true },
    short: { signed: true },
    keys: [process.env.COOKIE_SECRET || 'super-secret-key'],
  },

  jwks: {
    keys: [
      {
        kty: 'oct',
        kid: 'dev',
        k: Buffer.from(process.env.JWT_SECRET || 'your_jwt_secret').toString('base64url'),
      },
    ],
  },
};

const oidc = new Provider(process.env.OAUTH_ISSUER || 'http://localhost:3000', oidcConfig);

export default oidc;
