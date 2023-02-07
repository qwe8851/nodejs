var router = require('express').Router();

// 로그인했니 미들웨어
function 로그인했니(요청, 응답, next) {
    if (요청.user) {  //로그인 후 세션이 있으면 요청.user가 항상 있음. 
        next(); // 통과
    } else {
        응답.send('로그인 안하셨는데요?');
    }
}

// /shirts로 접속했을때만 미들웨어 적용
router.use('/shirts', 로그인했니);
// 아래 모든 url에 미들웨어 적용
router.use(로그인했니);

router.get('/shirts', function (요청, 응답) {
    응답.send('셔츠 파는 페이지');
});

router.get('/pants', function (요청, 응답) {
    응답.send('바지 파는 페이지');
});

module.exports = router;