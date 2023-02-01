const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },

  email: {
    type: String,
    trim: true,
  },

  password: {
    type: String,
    minlength: 5,
  },

  lastname: {
    type: String,
    maxlenth: 50,
  },

  role: {
    type: Number,
    default: 0,
  }, // 관리자가 되거나 일반 유저가 되거나

  image: String,

  token: {
    type: String,
  },

  tokenExp: {
    type: Number,
  }, // token의 사용기간
});

const User = mongoose.model('User', userSchema);

module.exports = { User };
