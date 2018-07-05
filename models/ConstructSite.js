var mongoose = require('mongoose');
var ConstructSiteSchema = require('../schemas/ConstructSiteSchema.js');

var Cs_site = mongoose.model('cs_site',ConstructSiteSchema);
module.exports = Cs_site;