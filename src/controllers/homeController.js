// Homepage
export function showHomePage(req, res) {
  res.render('pages/home', {
    layout: 'layout',
    title: 'Homepage',
    showHeader: true,
    showFooter: false,
    user: res.locals.user || null,
  })
}
