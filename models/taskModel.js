var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var taskModel = new Schema({
   'title': String ,
   'text' : String
 }, {versionKey: false});
module.exports = mongoose.model('tasks', taskModel);
