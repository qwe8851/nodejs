const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended : true }));
const MongoClient = require('mongodb').MongoClient;
const metodOverride = require('method-override')
app.use(metodOverride('_method'));
app.set('view engine', 'ejs');

app.use('public', express.static('public'));
const dotenv = require('dotenv').config();


// var db;
// MongoClient.connect('mongodb+srv://dgh07027:thdtmdgml@0826@cluster0.0vpladk.mongodb.net/?retryWrites=true&w=majority', function (에러, client) {
//     // 연결되면 할 일
//     if(에러) return console.log(에러);
//     db = client.db('todoapp');

//     db.collection('post').insertOne({_id: 100, 이름: 'John', 나이: 20}, function(에러, 결과){
//         console.log('저장완료');
//     });

//     app.listen(8080, function () {
//         console.log('listening on 8080');
//     });
// });

var db;
MongoClient.connect(process.env.DB_URL, function(err, client){
    if(err) return console.log(err);
    db = client.db('todoapp');
    app.listen(process.env.PORT, function(){
        console.log('listening on 8080');
    });
})



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

app.get('/list', function (요청, 응답) {
    // 데이터 출력
    db.collection('post').find().toArray(function(에러, 결과){
        // 모든 데이터 출력
        console.log(결과);  // 1. db에서 찾은 자료를
        응답.render('list.ejs', { posts: 결과 });   // 2. ejs파일에 넣기
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

app.get('/search', (요청, 응답) => {
    // db.collection('post').find({ $text: { $search: 요청.query.value } }).toArray((에러, 결과)=>{
    var 검색조건 = [{
        $search: {
            index: 'titleSearch',
            text: {
                query: 요청.query.value,
                path: '제목'  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
            }
        }
    }];
    db.collection('post').aggregate(검색조건).toArray((에러, 결과)=>{
        console.log("결과 : " + 결과);
        응답.render('search.ejs', { search: 결과 });
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
    응답.send('로그인 실패!');
}); 

app.get('/mypage', 로그인했니, function (요청, 응답) {
    console.log(요청.user);   // 아래 deserializeUser에서 찾은 user정보
    응답.render('mypage.ejs', {사용자 : 요청.user});
}); 

// 미들웨어 만드는 법
function 로그인했니(요청, 응답, next){
    if(요청.user){  //로그인 후 세션이 있으면 요청.user가 항상 있음. 
        next(); // 통과
    } else{
        응답.send('로그인 안하셨는데요?');
    }
}

// local Strategy 인증 방법
passport.use(new LocalStrategy({
    usernameField: 'id',    // form에 id를 가진 것
    passwordField: 'pw',    // form에 pw를 가진 것
    session: true,          // 로그인 후 세션을 저장할 것인지 여부
    passReqToCallback: false,   // 아이디/비번 말고도 다른 정보 검증 시
}, function (입력한아이디, 입력한비번, done) {
    console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
        if (에러) return done(에러)
        
        if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })   // db에 id가 없으면
        if (입력한비번 == 결과.pw) {        // db에 id가 있으면, 입력된비번과 결과.pw를 비교
            return done(null, 결과) // ✨ 여기의 결과가
        } else {
            return done(null, false, { message: '비번틀렸어요' })
        }
    })
}));

// 세션 생성                     ✨ 여기의 user로 들어감
passport.serializeUser(function (user, done) {
    done(null, user.id);    // id를 이용해서 세션을 저장시키는 코드 (로그인 성공 시 발동) 세션데이터를 만들고 세션의 id정보를 쿠키로 보냄
});
// 169번 줄에 user.id와 아래 파라미터의 아이디와 동일함.
passport.deserializeUser(function (아이디, done) { // 이 세션 데이터를 가진 사람은 DB에서 찾기(마이페이지 접속 시 발동)
    db.collection('login').findOne({id: 아이디}, function(에러, 결과){
        done(null, 결과);   //{id:test, pw:test}
    });
});

app.post('/register', function(요청, 응답){
    db.collection('login').findOne({id: 요청.body.id}, function(에러, 결과){
        console.log(결과);
        if (결과 != null){
            응답.send('아이디 중복');
        } else {
            db.collection('login').insertOne({ id: 요청.body.id, pw: 요청.body.pw }, function (에러, 결과) {
                응답.redirect('/');
            });
        }
    });
});

app.post('/add', function (요청, 응답) {
    응답.send('전송완료');

    db.collection('counter').findOne({ name: '게시물갯수' }, function (에러, 결과) {
        console.log(결과.totalPost);
        let 총게시물객수 = 결과.totalPost;
        let 저장목록 = { _id: 총게시물객수 + 1, 작성자: 요청.user._id, 제목: 요청.body.title, 날짜: 요청.body.date }
        // 데이터 입력
        db.collection('post').insertOne(저장목록, function (에러, 결과) {
            console.log('저장완료');
            db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, function (에러, 결과) {
                if (에러) { return console.log(에러) }
            })
        });
    });
});

app.delete('/delete', function (요청, 응답) {
    console.log(요청.body);
    요청.body._id = parseInt(요청.body._id);

    let 삭제할데이터 = { _id: 요청.body._id, 작성자: 요청.user._id }

    // 요청.body에 담겨온 게시물번호를 가진 글을 db에서 찾아 삭제
    db.collection('post').deleteOne(요청.body, function (에러, 결과) {
        console.log('삭제완료');
        if (결과) { console.log("결과 : " + 결과) };
        응답.status(200).send({ message: '성공했습니다.' });
    });
});

