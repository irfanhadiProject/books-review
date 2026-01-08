import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import path from 'path'
import express from 'express'
import session from 'express-session'
import ejsLayouts from 'express-ejs-layouts'
import methodOverride from 'method-override'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import authRoutes from './routes/authRoutes.js'
import bookRoutes from './routes/bookRoutes.js'
import homeRoutes from './routes/homeRoutes.js'
import { loginGuard } from './middleware/authMiddleware.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
})

const openapiPath = path.resolve(process.cwd(), 'openapi.yaml')
const openapiSpec = YAML.load(openapiPath)

const app = express()
const port = process.env.PORT

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(ejsLayouts)
app.use(methodOverride('_method'))
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

app.use(loginGuard)

app.use('/', homeRoutes)
app.use('/', authRoutes)
app.use('/books', bookRoutes)

app.use(errorHandler)

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
