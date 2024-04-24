const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pollSchema = mongoose.model('polls', new Schema({
  _id: String,
  data: {
    question: {type: String},
    options: {type: Object},
    noVote: {type: Array, default: []},
    author: {type: String},
    channel: {type: String},
    active: {type: Boolean, default: true},
    endsOn: {type: Number, default: null},
  }
 }, {
    autoIndex: true,
    minimize: false
}));

module.exports = pollSchema;

/* _id: [message ID]
data: {
  question: [question],
  options: {
    ":one:": { "option 1" : [] }
    ":two:": { "option 2": [] }
  },
  noVote: [],
  author: [author ID],
  active: true,
  endsOn: [unix timestamp in ms]
} */