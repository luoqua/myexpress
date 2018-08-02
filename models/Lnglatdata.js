var mongoose = require('mongoose');
var LnglatdataSchema = require('../schemas/LnglatdataSchema.js');

var Lnglat = mongoose.model('Lnglat',LnglatdataSchema);
module.exports = Lnglat;