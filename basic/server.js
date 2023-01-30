const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended : true }));
const MongoClient = require('mongodb').MongoClient;

var db;
MongoClient.connect('mongodb+srv://dgh07027:thdtmdgml@0826@cluster0.0vpladk.mongodb.net/?retryWrites=true&w=majority', function(에러, client){
    // 연결되면 할 일
    if(에러) return console.log(에러);
    db = client.db('todoapp');

    db.collection('post').insertOne({_id: 100, 이름: 'John', 나이: 20}, function(에러, 결과){
        console.log('저장완료');
    });

    app.listen(8080, function () {
        console.log('listening on 8080');
    });
});

app.get('/', function (요청, 응답) {
    응답.sendFile(__dirname + '/index.html');
});

app.get('/pet', function(요청, 응답){
    응답.send('펫용품을 쇼핑할 수 있는 페이지 입니다.');
});

app.get('/beauty', function (요청, 응답) {
    응답.send('뷰티용품을 쇼핑할 수 있는 페이지 입니다.');
});

app.get('/write', function (요청, 응답) {
    응답.sendFile(__dirname + '/write.html');
});

app.post('/add', function (요청, 응답) {
    응답.send('전송완료');
    console.log(요청.body.date );
    console.log(요청.body.title);
});