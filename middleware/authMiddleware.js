export function loginGuard(req, res, next) {
  const openPaths = ['/login', '/logout'];
  const protectedPrefix = ['/books'];

  if (openPaths.includes(req.path)) return next(); // Akses route login dan logout tanpa perlu login

  if (req.path === '/') {
    return req.session && req.session.loggedIn
      ? next()
      : res.redirect('/login');
  }

  // Akses route lain hanya bisa setelah login
  if (protectedPrefix.some((prefix) => req.path.startsWith(prefix))) {
    return req.session && req.session.loggedIn
      ? next()
      : res.redirect('/login'); // Redirect ke login page jika belum login
  }

  if (req.method === 'GET') {
    res.status(404).render('pages/404', {
      title: '404 Not Found',
      layout: 'layout',
      showHeader: false,
      showFooter: false,
    });
  }

  next();
}
