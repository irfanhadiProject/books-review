import { DatabaseError } from '../../http/errors/DatabaseError.js'
import { loginUser } from '../../services/bff/login.service.js'
import { mapDomainErrorToHttpError } from '../../utils/mapDomainErrorToHttpError.js'

export async function login(req, res, next) {
  const { username, password } = req.body

  try {
    const user = await loginUser({ username, password })

    req.session.userId = user.userId
    req.session.role = user.role

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {}
    })
  } catch (err) {
    next(mapDomainErrorToHttpError(err))
  }
}

export async function logout(req, res, next) {
  if(!req.session.userId) {
    return res.status(401).json({
      status: 'error',
      message: 'Session expired, please login'
    })
  }

  req.session.destroy((err) => {
    if (err) return next(new DatabaseError(err.message))

    res.clearCookie('connect.sid')
    return res.status(200).json({
      status: 'success',
      message: 'Logout successful',
      data: {}
    })
  })
}