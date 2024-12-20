'use strict'

const { CronJob } = require('cron');
const { join } = require('node:path');
const FastifyEnv = require('@fastify/env');
const AutoLoad = require('@fastify/autoload');
const { Type } = require('@sinclair/typebox');

const options = {
  configKey : 'config',
  schema: Type.Object({
    PORT: Type.String(),
    URI: Type.String(),
    JWT_SECRET: Type.String(),
    NODE_ENV: Type.String({
      default: "dev"
    })
  })
}

// const job = new CronJob('*/10 * * * * *', ()=>{
//     const d = new Date()
//     console.log(`Time: ${d}`)
//   },
//   null,
//   true
// );

module.exports = async function (fastify, opts) {
  await fastify.register(FastifyEnv, options);
  await fastify.register(require('@fastify/cors'));
  await fastify.register(require('@fastify/redis'), {
    host: '127.0.0.1',
    port: 6379,
    family: 4
  });
  await fastify.register(require('@fastify/swagger'),{
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Pension API',
        description: 'Testing the API Endpoints.',
        version: '0.1.0'
      },
      servers: [
        {
          url: `http://localhost:${fastify.config.PORT}/api/v1`,
          description: 'Development server'
        },
        {
          url: `http://localhost:${fastify.config.PORT}/api/v1`,
          description: 'Production server'
        },
      ],
      tags: [
        { name: 'User', description: 'User related End-Points' },
        { name: 'UserRegister', description: 'UserRegister related End-Points' },
        { name: 'Apply', description: 'Apply related End-Points' },
        { name: 'Vacancy', description: 'Vacancy related End-Points' },
      ],
    }
  });

  await fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/docs',
  });

  await fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: Object.assign({
      uri: fastify.config.URI
    }, opts)
  });

  await fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: Object.assign({
      prefix: '/api/v1',
    }, opts)
  });

  // await job.start()
}

module.exports.options = options