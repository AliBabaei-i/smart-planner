import config from '../config/env.js'
import logger from '../utils/logger.js'

export const notFound = (req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  })
}

export const errorHandler = (err, req, res, next) => {
  logger.error('Error:', err.message)
  
  if (config.isDev) {
    console.error(err.stack)
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: err.errors
    })
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body is not valid JSON'
    })
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: err.message
    })
  }

  const statusCode = err.statusCode || err.status || 500
  res.status(statusCode).json({
    error: err.name || 'Server Error',
    message: err.message || 'Something went wrong',
    ...(config.isDev && { stack: err.stack })
  })
}

export default { notFound, errorHandler }