const { Schema, model } = require('mongoose');

const FileSchema = Schema({
  // Name to be found by https://example.com/files/name
  name: String,
  // Deletion key used to delete the file, specific to this file
  deletionKey: String,
  // ID for retreiving
  id: String,
  // Which node it is stored in
  nodeID: String,
  // Mime-type to return with
  mimetype: String,
  // User which uploaded it
  user: String,
  // Date stored
  date: String
});

module.exports = model('file', FileSchema);