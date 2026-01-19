import { loginUser } from '../../services/auth.service.js'
import { mapDomainErrorToHttpError } from '../../utils/mapDomainErrorToHttpError.js'

export async function login(req, res, next) {
  const { username, password } = req.body

  try {
    const user = await loginUser({ username, password })

    req.session.userId = user.userId
    req.session.role = user.role

    return res.status(200).json({
      staus: 'success',
      message: 'Login successful',
      data: {}
    })
  } catch (err) {
    next(mapDomainErrorToHttpError(err))
  }
}