export function loginGuardApi(req, res, next) {
  if (req.session && req.session.loggedIn) {
    return next()
  }

  return res.status(401).json({
    error: {
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    },
  })
}
