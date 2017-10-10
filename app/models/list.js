var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ItemSchema = require('./ItemSchema')

var ListSchema = new Schema({
  title: String,
  items: [ItemSchema],
  placeCoordinates: {
    lng: Number, lat: Number
  },
  remainder: {type: Date, default: Date.now}
})

module.exports = mongoose.model('List', ListSchema)
