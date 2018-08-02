var mongoose = require("mongoose");
var LnglatdataNow = require('../schemas/LnglatdataNowSchema.js');

var LnglatdataNow = mongoose.model('LnglatNow',LnglatdataNow);

module.exports = LnglatdataNow;