const mongoose = require('mongoose');

const NotesSchema = new Schema({
    title:{
        type: string,
        required: true
    },
    descrition:{
        type: string,
        required: true
    },
    tag:{
        type:string,
        default: "General"
    },
    time:{
        type:Date,
        default: Date.now
    },
  });

  module.exports = mongoose.model('notes', NotesSchema);