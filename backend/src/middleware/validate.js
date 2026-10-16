import { ZodError } from 'zod'

export const validate = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    })

    if (validated.body) req.body = validated.body
    if (validated.query) req.query = validated.query
    if (validated.params) req.params = validated.params

    next()
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid request data',
        details: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      })
    }
    next(error)
  }
}

export default { validate }