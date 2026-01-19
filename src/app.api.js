import express from 'express'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import path from 'path'
import session from 'express-session'
import bodyParser from 'body-parser'

import authApiRoutes from './routes/api/auth.routes.js'
import userBookApiRoutes from './routes/api/userBooks.routes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { loginGuard } from './middleware/authMiddleware.js'

const app = express()

const openapiPath = path.resolve(process.cwd(), 'openapi.yaml')
const openapiSpec = YAML.load(openapiPath)

app.use(bodyParser.json())

app.use(
  session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
  })
)

app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec, {
    explorer: true,
  })
)

app.use('/api/v1', loginGuard)
app.use('/api/v1/auth', authApiRoutes)
app.use('/api/v1/user-books', userBookApiRoutes)

app.use(errorHandler)

export default app
