import './init.js'
import express from 'express'
import apiApp from './app.api.js'
import webApp from './app.web.js'

const mainApp = express()
const port = process.env.PORT || 3000

mainApp.use('/api', apiApp)
mainApp.use('/', webApp)

mainApp.listen(port, () => {
  console.log(`Server running on port ${port}`)
})