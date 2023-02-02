const express = require('express'); // express 모듈을 가져 온다.
const app = express(); // 함수를 사용하여  express app 을 만든다
const port = 5000; // 포트번호를 지정한다 ( 3000 )
const bodyParser = require('body-parser');
const cookiePaser = require('cookie-parser');
const { auth } = require('./middleware/auth');
const { User } = require('./models/User');
const config = require('./config/key');

app.use(bodyParser.urlencoded({ extended: true })); // application/x-www-form-urlencoded 를 분석
app.use(bodyParser.json()); // application/json 을 분석
app.use(cookiePaser());

const mongoose = require('mongoose');
mongoose
  .connect(config.mongoURI, {})
  .then(() => console.log('MongoDB Connected...')) // mongoDB가 잘 연결이 되었다면...
  .catch((err) => console.log(err));
/*
useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
를 커넥트에 써주는 것은 Error 의 방지 때문이다 But~!!!

Monggoose 6 버전 이후 부터는 현재의 옵션이 default 로 적용이 되어 옵션 작성후 parse error 가 발생 하게된다.

*/
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// register Route 만들기
app.post('/api/users/register', (req, res) => {
  // 회원가입시 필요한 정보들을 Client 에서 가져오면
  // DB 에 넣어준다.
  const user = new User(req.body);
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ success: true });
  });
});

// login Route 만들기
app.post('/api/users/login', (req, res) => {
  // 요청된 email 을 DB에서 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: '제공된 이메일에 해당하는 유저가 없습니다.',
      });
    }
    //email 이 DB에 있다면 비밀번호가 맞는것인지 확인 -> models/userSchema 에서
    // comparePassword 메소드를 만들고 작업
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) return res.json({ loginSuccess: false, message: '비밀번호가 틀렸습니다.' });

      // 비밀번호까지 일치 하다면 토큰을 생성한다.
      // JSONWEBTOKEN 라이브러리를 사용
      // generateToken 메소드를 models/userSchema 에서 작업
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        // 토큰을 저장한다. - 이곳에는 쿠키에 저장 ( cookie-parser 라이브러리 사용 )
        // (쿠키, 로컬스토리지, 세션 - 어디에 저장해야 되는지에 대해서는 의견이 많다)
        res.cookie('x_auth', user.token).status(200).json({
          loginSuccess: true,
          userId: user._id,
        });
      });
    });
  });
});

// 인증작업 Auth Route 만들기
app.get('/api/users/auth', auth, (req, res) => {
  // 미들웨어의 통과 지점 Authentication이 True 임.
  // 이 데이터를 Client에 전달
  res.status(200).json({
    _id: req.user._id,
    // role 이 0 -> 일반유저, 1-> 관리자
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

// logout Route 만들기
app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: '' }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
