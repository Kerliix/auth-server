import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kerliix Auth & OAuth API',
      version: '1.0.0',
      description: 'Authentication and OAuth2 server documentation',
    },
    servers: [
      {
        url: 'auth.kerliix.com', 
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/**/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
