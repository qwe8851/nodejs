const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended : true }));
const MongoClient = require('mongodb').MongoClient;
const metodOverride = require('method-override')
app.use(metodOverride('_method'));
app.set('view engine', 'ejs');

app.use('public', express.static('public'));

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
    
    db.collection('counter').findOne({ name: '게시물갯수'}, function(에러, 결과){
        console.log(결과.totalPost);
        let 총게시물객수 = 결과.totalPost;

        // 데이터 입력
        db.collection('post').insertOne({ _id: 총게시물객수 + 1, 제목: 요청.body.title, 날짜: 요청.body.date }, function (에러, 결과) {
            console.log('저장완료');
            db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 }}, function(에러, 결과){
                if(에러){ return console.log(에러)}
            })
        });
    });
});

app.get('/list', function (요청, 응답) {
    // 데이터 출력
    db.collection('post').find().toArray(function(에러, 결과){
        // 모든 데이터 출력
        console.log(결과);  // 1. db에서 찾은 자료를
        응답.render('list.ejs', { posts: 결과 });   // 2. ejs파일에 넣기
    });

});

app.delete('/delete', function (요청, 응답){
    console.log(요청.body);
    
    요청.body._id = parseInt(요청.body._id);
    db.collection('post').deleteOne(요청.body, function(에러, 결과){
        console.log('삭제완료');
        // 응답.status(200).send({ message : '성공했습니다.'});
        응답.status(400).send({ message : '실패했습니다.' });
    });
});

app.get('/detail/:id', function (요청, 응답){
    db.collection('post').findOne({ _id: parseInt(요청.params.id) }, function(에러, 결과){
        console.log(결과);
        응답.render('detail.ejs', { data: 결과 });
    });
});

app.get('/edit/:id', function(요청, 응답){
    db.collection('post').findOne({ _id: parseInt(요청.params.id)}, function(에러, 결과){
        console.log(결과);
        응답.render('edit.ejs', { post: 결과});
    });
});

app.put('/edit', function(요청, 응답) {
    db.collection('post').updateOne({ _id: parseInt(요청.body.id) },{ $set : {제목: 요청.body.title, 날짜: 요청.body.date }}, function (에러, 결과) {
        console.log('수정 완료');
        응답.redirect('/list');
    });
});