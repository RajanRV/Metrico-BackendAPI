const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Metrico API',
            version: '1.0.0',
            description: 'Metrico API documentation — Web (Admin/Supervisor) and Mobile (Testing Staff) endpoints',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}/api/v1`,
                description: 'Local Development',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
   apis: [
       './src/routes/*.js',
       './src/mobile/auth/*.js',
       './src/mobile/results/*.js',
   ],
};

module.exports = swaggerJsdoc(options);