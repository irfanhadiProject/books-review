import express from 'express'
import session from 'express-session'
import ejsLayouts from 'express-ejs-layouts'
import bodyParser from 'body-parser'
import methodOverride from 'method-override'

import homeRoutes from './routes/web/homeRoutes.js'
import authRoutes from './routes/web/authRoutes.js'
import bookRoutes from './routes/web/bookRoutes.js'
import { loginGuard } from './middleware/authMiddleware.js'

const app = express()

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

app.use(loginGuard)

app.use('/', homeRoutes)
app.use('/', authRoutes)
app.use('/books', bookRoutes)

export default app
