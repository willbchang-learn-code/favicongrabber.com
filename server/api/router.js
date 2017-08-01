const router = require('express').Router();
const grabber = require('./grabber');

/**
 * JSON in a pretty way
 */

router.all('/*', (req, res, next) => {
  const indent = req.query.pretty === 'true' ? 2 : 0;
  req.app.set('json spaces', indent);
  return next();
});

router.param('domain', (req, res, next, domain) => {
  // TODO: validate `domain` property
  req.domain = domain;
  return next();
});

router.get('/grab/:domain', (req, res, next) => {
  grabber(req.domain, (err, data) => {
    if (err) {
      switch (err.code) {
        case 'ENOTFOUND':
          return res.status(400).jsonp({
            error: `Unresolved domain "${req.domain}"`,
          });
        case 'ETIMEDOUT':
        case 'ESOCKETTIMEDOUT':
          return res.status(400).jsonp({
            error: `Connection to server of domain "${req.domain}" timeout`,
          });
        case 'EINVAL':
          return res.status(422).jsonp({
            error: `Invalid domain name "${req.domain}"`,
          });
        default:
          return next(err);
      }
    }
    res.status(200).jsonp(data);
  });
});

router.use((req, res) => {
  res.status(404).jsonp({
    error: `Unknown API endpoint "${req.method} ${req.baseUrl}${req.url}"`,
  });
});

router.use((err, req, res, next) => {
  /* eslint no-unused-vars: off */
  console.error(err);
  res.status(500).jsonp({
    error: 'General API error',
  });
});

module.exports = router;
