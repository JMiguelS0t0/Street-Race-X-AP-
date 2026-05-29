import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Street Race X API',
      version: '1.0.0',
      description: 'API for Street Race X platform - Street racing challenges and pilot management',
    },
    servers: [
      {
        url: 'http://newmancorp.tplinkdns.com:2999',
        description: 'Servidor Público',
      },
      {
        url: 'http://localhost:2999',
        description: 'Servidor Local',
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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/docs/*.ts',
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
