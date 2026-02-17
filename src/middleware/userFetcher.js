// middleware/userFetcher.js
import axios from 'axios'

export const userFetcher = async (req, res, next) => {
  res.locals.user = null 

  if (req.headers.cookie) {
    try {
      const response = await axios.get(`${process.env.CORE_API_BASE_URL}/auth/me`, {
        headers: { Cookie: req.headers.cookie }
      })
      res.locals.user = response.data.data
    } catch (err) {
      // Do nothing
    }
  }
  next()
}