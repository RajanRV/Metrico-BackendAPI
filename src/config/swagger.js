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
                url: 'https://6fm29vpijk.execute-api.us-east-1.amazonaws.com/api/v1',
                description: 'Live (AWS)',
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