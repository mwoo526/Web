var express = require('express');
var router = express.Router();


/* 맛집등록 */
router.get('/enroll', function(req, res, next) {
  res.render('enroll', { title: '맛집등록', items:[] });
});

/* 맛집리뷰 */
router.get('/review', function(req, res, next) {
  res.render('review', { title: '맛집리뷰', items:[] });
});

/* 맛집등록 */
router.get('/redetail', function(req, res, next) {
  res.render('redetail', { title: '맛집등록', items:[] });
});

module.exports = router;
