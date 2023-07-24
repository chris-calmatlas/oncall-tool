var express = require('express');
var router = express.Router();
const { requiresAuth } = require('express-openid-connect');

router.get('/', function (req, res, next) {
  if(!req.oidc.isAuthenticated()){
    res.render('no_auth', {
      title: 'Login'
    })
  } else {
    res.redirect('/user/profile')
  }
});

router.get('/profile', requiresAuth(), function (req, res, next) {
  res.render('profile', {
    userProfile: JSON.stringify(req.oidc.user, null, 2),
    title: 'My Profile'
  })
});

module.exports = router;
