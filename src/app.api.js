import express from 'express'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import path from 'path'
import bodyParser from 'body-parser'

import authApiRoutes from './routes/api/auth.routes.js'
import userBookApiRoutes from './routes/api/userBooks.routes.js'
import { loginGuardApi } from './middleware/loginGuard.api.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

const openapiPath = path.resolve(process.cwd(), 'openapi.yaml')
const openapiSpec = YAML.load(openapiPath)

app.use(bodyParser.json())

app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec, {
    explorer: true,
  })
)

app.use('/v1/auth', authApiRoutes)
app.use('/v1/user-books', loginGuardApi, userBookApiRoutes)

app.use(errorHandler)

export default app
