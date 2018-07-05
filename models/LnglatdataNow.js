var mongoose = require("mongoose");
var LnglatdataNow = require('../schemas/LnglatdataSchema.js');

var LnglatdataNow = mongoose.model('LnglatNow',LnglatdataNow);

module.exports = LnglatdataNow;