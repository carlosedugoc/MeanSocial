'use strict'

var express = require('express');
var PublicationController = require('../controllers/publication');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/publication' });

api.post('/publication', md_auth.ensureAuth, PublicationController.savePublication)
api.get('/publications/:page?', md_auth.ensureAuth, PublicationController.getPublications)

module.exports = api;