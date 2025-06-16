export function loginGuard(req, res, next) {
  const openPaths = ['/', '/login', '/logout'];
  const protectedPrefix = ['/books'];

  if (openPaths.includes(req.path)) return next(); // Akses route tanpa perlu login

  // Akses route lain hanya bisa setelah login
  if (protectedPrefix.some((prefix) => req.path.startsWith(prefix))) {
    return req.session && req.session.loggedIn
      ? next()
      : res.status(401).render('pages/restricted', {
          title: 'Limited Access',
          layout: 'layout',
          showHeader: true,
          showFooter: true,
        }); // Redirect ke login page jika belum login
  }

  if (req.method === 'GET') {
    res.status(404).render('pages/not-found', {
      title: '404 Not Found',
      layout: 'layout',
      showHeader: false,
      showFooter: false,
    });
  }

  next();
}
