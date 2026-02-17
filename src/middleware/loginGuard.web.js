import axios from 'axios'

export async function loginGuardWeb(req, res, next) {
  const openPaths = ['/', '/login', '/logout', '/signup']
  const protectedPrefix = ['/books']

  if (openPaths.includes(req.path)) return next()

  if (protectedPrefix.some((prefix) => req.path.startsWith(prefix))) {
    try {
      await axios.get(`${process.env.CORE_API_BASE_URL}/auth/me`,{
        headers: {
          Cookie: req.headers.cookie || ''
        }
      })

      return next()
    } catch (err) {
      return res.status(401).render('pages/restricted', {
          title: 'Limited Access',
          layout: 'layout',
          showHeader: true,
          showFooter: true,
      })
    }
  }

  if (req.method === 'GET') {
    res.status(404).render('pages/not-found', {
      title: '404 Not Found',
      layout: 'layout',
      showHeader: false,
      showFooter: false,
    })
  }

  next()
}
