import type { Plugin } from 'vite'
import { handle } from './router'

export function mockApiPlugin(): Plugin {
  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use('/api/v1', (req, res, next) => {
        handle(req, res, next).catch((e) => {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ code: 'SERVER_ERROR', message: String(e) }))
        })
      })
    },
  }
}