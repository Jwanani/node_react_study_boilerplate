const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

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

userSchema.pre('save', function (next) {
  let user = this; // userSchema 를 가리킨다.

  // 비밀번호가 아닌 다른것을 수정할 시 비밀번호가 재암호화 되는것을 방지 하기 위해
  // Modified 조건 안에 넣어준다.
  if (user.isModified('password')) {
    //비밀번호를 암호화 시킨다.
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);

        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

// 비밀번호가 일치하는지 확인하는  comparePassword 메소드 작업
userSchema.methods.comparePassword = function (plainPassword, cb) {
  // plainPassword과 DB에암호화된 비밀번호가 같은가?
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

// 비밀번호 일치시 token을 발행하는 generateToken 메소드 작업
userSchema.methods.generateToken = function (cb) {
  let user = this;
  //jwt를 이용하여 토큰을 생성하기
  // user._id + 'scretToken' = token
  // 'secretToken' 을 넣으면 user._id 가 나오는 구조
  // toHexString 을 좀더 추가 학습하자.
  let token = jwt.sign(user._id.toHexString(), 'secretToken');
  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

// user의 토큰을 찾고 인증하는 findByToken 정적작업 ( /auth )
userSchema.statics.findByToken = function (token, cb) {
  let user = this;
  //토큰은 decode 한다.
  jwt.verify(token, 'secretToken', function (err, decoded) {
    //유저 아이디를 이용하여 유저를 찾은 후
    //client에서 가져온 토큰과 DB에 보관된 토큰이 일치하는지 확인
    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

const User = mongoose.model('User', userSchema);

module.exports = { User };
