import dotenv from 'dotenv'
import apiApp from './app.api.js'
import webApp from './app.web.js'


dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
})

const port = process.env.PORT || 3000

apiApp.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
