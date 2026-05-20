const path = require('path'); 
const express = require('express');
const router  = express.Router();

// Public pages
router.get('/login',  (req, res) => res.render('login'));
router.get('/signup', (req, res) => res.render('signup'));
router.get('/',       (req, res) => res.render('index'));  
router.get('/about',  (req, res) => res.render('about'));  

// Student pages
router.get('/student/dashboard',  (req, res) => res.render('student/dashboard'));
router.get('/student/menu',       (req, res) => res.render('student/menu'));
router.get('/student/orders',     (req, res) => res.render('student/orders'));
router.get('/student/canteen',    (req, res) => res.render('student/canteen'));
router.get('/student/feedback',   (req, res) => res.render('student/feedback'));
router.get('/student/intention',  (req, res) => res.render('student/intention'));
router.get('/student/value',      (req, res) => res.render('student/value'));

// Admin pages
router.get('/admin/dashboard',    (req, res) => res.render('admin/dashboard'));
router.get('/admin/menu',         (req, res) => res.render('admin/menu'));
router.get('/admin/orders',       (req, res) => res.render('admin/orders'));
router.get('/admin/canteen',      (req, res) => res.render('admin/canteen'));
router.get('/admin/budget',       (req, res) => res.render('admin/budget'));
router.get('/admin/waste',        (req, res) => res.render('admin/waste'));

// Guardian pages
router.get('/guardian/dashboard', (req, res) => res.render('guardian/dashboard'));
router.get('/guardian/budget',    (req, res) => res.render('guardian/budget'));

module.exports = router;