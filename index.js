const express = require('express'); // express 모듈을 가져 온다.
const app = express(); // 함수를 사용하여  express app 을 만든다
const port = 5000; // 포트번호를 지정한다 ( 3000 )
const bodyParser = require('body-parser');
const { User } = require('./models/User');
const config = require('./config/key');

app.use(bodyParser.urlencoded({ extended: true })); // application/x-www-form-urlencoded 를 분석
app.use(bodyParser.json()); // application/json 을 분석

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
app.post('/register', (req, res) => {
  // 회원가입시 필요한 정보들을 Client 에서 가져오면
  // DB 에 넣어준다.
  const user = new User(req.body);
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
