const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Autenticación',
      version: '1.0.0',
      description: 'API para registro y autenticación de usuarios',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Servidor de desarrollo',
      },
    ],
  },
  apis: ['./routes/*.js'], // archivos que contienen anotaciones
};
//PRUEBA
module.exports = swaggerJsdoc(options); 