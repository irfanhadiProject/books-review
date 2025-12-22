// Homepage
export function showHomePage(req, res) {
  const username = req.session.username;

  res.render('pages/home', {
    layout: 'layout',
    title: 'Homepage',
    showHeader: true,
    showFooter: false,
    user: username,
  });
}
