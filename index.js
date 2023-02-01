const express = require('express'); // express 모듈을 가져 온다.
const app = express(); // 함수를 사용하여  express app 을 만든다
const port = 5000; // 포트번호를 지정한다 ( 3000 )

const mongoose = require('mongoose');
mongoose
  .connect('mongodb+srv://johnahn:beb1203@jwanani-boiler-plate.mywwnfl.mongodb.net/?retryWrites=true&w=majority')
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
