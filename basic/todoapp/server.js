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
    // 응답.sendFile(__dirname + 'write.html');
    응답.render('write.ejs');
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





const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({ secret: '비밀코드', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());


app.get('/login', function (요청, 응답) {
    응답.render('login.ejs');
});
app.post('/login', passport.authenticate('local', {
    failureRedirect: '/fail'
}), function (요청, 응답) {
    응답.redirect('/');
});
app.get('/fail', function (요청, 응답) {
    응답.render('fail.ejs');
}); 

// local Strategy 인증 방식
passport.use(new LocalStrategy({
    usernameField: 'id',    // form에 id를 가진 것
    passwordField: 'pw',    // form에 pw를 가진 것
    session: true,          // 로그인 후 세션을 저장할 것인지 여부
    passReqToCallback: false,   // 아이디/비번 말고도 다른 정보 검증 시
}, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
        if (에러) return done(에러)

        if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
        if (입력한비번 == 결과.pw) {
            return done(null, 결과)
        } else {
            return done(null, false, { message: '비번틀렸어요' })
        }
    })
}));

