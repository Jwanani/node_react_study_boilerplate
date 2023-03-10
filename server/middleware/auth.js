const { User } = require('../models/User');

let auth = (req, res, next) => {
  //인증 처리들을 이곳에서 함
  // Client 쿠키에서 토큰을 가져온다.
  let token = req.cookies.x_auth;
  // 토큰을 복호화한 후 유저를 찾는다. - /models/user 에서 메소드를 만든다.
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) return res.json({ isAuth: false, error: true });

    req.token = token;
    req.user = user;
    next();
  });
  // 유저가 있으면 인증 Ok
  // 유저가 없으면 인증 No!
};

module.exports = { auth };
