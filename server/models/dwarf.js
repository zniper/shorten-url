// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Dwarf = mongoose.model('Dwarf', {
    key: String,
    url: String
});

module.exports = Dwarf;
