var mongoose = require('mongoose');
var LnglatdataSchema = require('../schemas/LnglatdataSchema');

var Lnglat = mongoose.model('Lnglat',LnglatdataSchema);
module.exports = Lnglat;