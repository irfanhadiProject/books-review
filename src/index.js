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
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env', // Memastikan pemilihan file .env yang benar
})

const app = express()
const port = process.env.PORT

app.set('view engine', 'ejs')
// Middleware
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

app.use(loginGuard)
app.use(errorHandler)

// Routes
app.use('/', homeRoutes)
app.use('/', authRoutes)
app.use('/books', bookRoutes)

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
