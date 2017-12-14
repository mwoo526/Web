/**
 * 패스포트 사용하기
 * 
 * 패스포트 모듈에서 로그인 인증을 처리하도록 함
 * 데이터베이스에 저장된 사용자 정보를 사용해 인증할 수 있도록 LocalStrategy를 인증방식으로 사용함.
 *
 */
// Express 기본 모듈 불러오기
var express = require('express')
  , http = require('http')
  , path = require('path');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , static = require('serve-static')
  , errorHandler = require('errorhandler');

// 에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어 불러오기
var expressSession = require('express-session');


// multer 
var multer = require('multer');

var done = false;

//===== Passport 사용 =====//
var passport = require('passport');
// 인증 실패시 임시 메시지를 표시
var flash = require('connect-flash');


// 모듈로 분리한 설정 파일 불러오기
var config = require('./config');

// 모듈로 분리한 데이터베이스 파일 불러오기
var database = require('./database/database');

// 모듈로 분리한 라우팅 파일 불러오기
var route_loader = require('./routes/route_loader');

var filename='';

// 익스프레스 객체 생성
var app = express();



//===== 뷰 엔진 설정 =====//
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
console.log('뷰 엔진이 ejs로 설정되었습니다.');


//===== 서버 변수 설정 및 static으로 public 폴더 설정  =====//
console.log('config.server_port : %d', config.server_port);
app.set('port', process.env.PORT || 3000);
 

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

// public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));

// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));



//multer 미들웨어 사용 : 미들웨어 사용 순서 중요  body-parser -> multer -> router
// App 에서 파일을 업로드 시키기 위해 필요한 설정 2.
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'public/uploads/')
    },
    filename: function (req, file, callback) {
        var extension = path.extname(file.originalname);
        var basename = path.basename(file.originalname,extension);
        filename="public/uploads/"+basename+extension;
        callback(null,basename + extension);
    }
});

var upload = multer({ 
    storage: storage,
    limits: {
		files: 10,
		fileSize: 1024 * 1024 * 1024
	}
});

//===== Passport 사용 설정 =====//
// Passport의 세션을 사용할 때는 그 전에 Express의 세션을 사용하는 코드가 있어야 함
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// 
app.post('/storeUpload', upload.any(),function (req, res) {
        var database = app.get('database');
    database.StoreModel.save

	res.render('enroll.ejs',{title:"맛집등록",form:"", user: req.user,enroll:"",image:"사진이 등록되었습니다.^^"});
});

// App 에서 파일을 업로드 시키기 위해 필요한 설정 .
app.post('/reviewUpload', upload.any(),function (req, res) {
    res.render('redetail.ejs',{title:"맛집리뷰",form:"", user: req.user,enroll:"",image:"사진이 등록되었습니다.^^"});
});




//라우팅 정보를 읽어 들여 라우팅 설정
var router = express.Router();
route_loader.init(app, router);


// 홈 화면 - index.ejs 템플릿을 이용해 홈 화면이 보이도록 함
router.route('/').get(function(req, res) {
	console.log('/ 패스 요청됨.');
    
    if (!req.user) {
        console.log('사용자 인증 안된 상태임.');
        res.render('index.ejs',{alert:""});
        return;
    }
	res.render('main.ejs',{title:"홈 화면",user: req.user,enroll:""});
});

// 로그인 화면 - login.ejs 템플릿을 이용해 로그인 화면이 보이도록 함
router.route('/login').get(function(req, res) {
	console.log('/login 패스 요청됨.');
	res.render('login.ejs', {message: req.flash('loginMessage')});
});



// 사용자 인증 - POST로 요청받으면 패스포트를 이용해 인증함
// 성공 시 /profile로 리다이렉트, 실패 시 /login으로 리다이렉트함
// 인증 실패 시 검증 콜백에서 설정한 플래시 메시지가 응답 페이지에 전달되도록 함
router.route('/login').post(passport.authenticate('local-login', {
    successRedirect : '/main', 
    failureRedirect : '/login', 
    failureFlash : true 
}));

// 회원가입 화면 - signup.ejs 템플릿을 이용해 회원가입 화면이 보이도록 함
router.route('/signup').get(function(req, res) {
	console.log('/signup 패스 요청됨.');
	res.render('signup.ejs', {message: req.flash('signupMessage')});
});

// 회원가입 - POST로 요청받으면 패스포트를 이용해 회원가입 유도함
// 인증 확인 후, 성공 시 /profile 리다이렉트, 실패 시 /signup으로 리다이렉트함
// 인증 실패 시 검증 콜백에서 설정한 플래시 메시지가 응답 페이지에 전달되도록 함
router.route('/signup').post(passport.authenticate('local-signup', {
    successRedirect : '/', 
    failureRedirect : '/signup', 
    failureFlash : true 
}));

// 프로필 화면 - 로그인 여부를 확인할 수 있도록 먼저 isLoggedIn 미들웨어 실행
router.route('/main').get(function(req, res) {
	console.log('/main 패스 요청됨.');
    
    // 인증된 경우, req.user 객체에 사용자 정보 있으며, 인증안된 경우 req.user는 false값임
    console.log('req.user 객체의 값');
	console.dir(req.user);
    
    // 인증 안된 경우
    if (!req.user) {
        console.log('사용자 인증 안된 상태임.');
        res.redirect('/');
        return;
    }
	
    // 인증된 경우
    console.log('사용자 인증된 상태임.');
	if (Array.isArray(req.user)) {
		res.render('main.ejs', {title:"홈 화면",user: req.user[0]._doc,enroll:""});
	} else {
		res.render('main.ejs', {title:"홈 화면",user: req.user,enroll:""});
	}
});

// 로그아웃 - 로그아웃 요청 시 req.logout() 호출함
router.route('/logout').get(function(req, res) {
	console.log('/logout 패스 요청됨.');
    
	req.logout();
	res.redirect('/');
});

/* 맛집등록 */
router.route('/enroll').get(function(req, res) {
	console.log('/ 패스 요청됨.');
     // 인증 안된 경우
    if (!req.user) {
        console.log('사용자 인증 안된 상태임.');
        res.render('index.ejs',{alert:"로그인을 해주세요!"});
        return;
    }
	res.render('enroll.ejs',{title:"맛집등록",form:"", user: req.user,enroll:"",image:"사진을 등록하세요*.*"});
});


/* 맛집리뷰등록 */
router.route('/redetail').get(function(req, res) {  
	console.log('/ 패스 요청됨.');
    if (!req.user) {
        console.log('사용자 인증 안된 상태임.');
        res.render('index.ejs',{alert:"로그인을 해주세요!"});
        return;
    }
	res.render('redetail.ejs',{title:"맛집리뷰",form:"", user: req.user,enroll:"",image:"사진을 등록하세요*.*"});
});

/* 맛집예약등록 */
router.route('/reserve').get(function(req, res) {  
	console.log('/ 패스 요청됨.');
    if (!req.user) {
        console.log('사용자 인증 안된 상태임.');
        res.render('index.ejs',{alert:"로그인을 해주세요!"});
        return;
    }
	res.render('reserve.ejs',{title:"맛집예약",user: req.user,enroll:""});
});


// 맛집공유  -> board.ejs
router.route('/board').get(function(req,res){
    var database = app.get('database');
    var page = req.param('page');
    if(page == null) {page = 1;}
    var skipSize = (page-1)*10;
    var limitSize = 10;
    var pageNum = 1;
    
    database.ReviewModel.count({deleted:false},function(err, totalCount){
       // db에서 날짜 순으로 데이터들을 가져옴
        if(err) throw err;
        pageNum = Math.ceil(totalCount/limitSize);
        database.ReviewModel.find({deleted:false}).sort({date:-1}).skip(skipSize).limit(limitSize).exec(function(err, pageContents) {
            if(err) throw err;
            res.render('board', {title: "맛집공유",user:req.user,enroll:"", content: pageContents, pagination: pageNum});
        });
    });
    

 });
    

// 맛집 클릭 시 -> store.ejs
router.route('/store').get(function(req,res){
    var storeId = req.param('id');
    // 넘겨받은 id값을 변수에 저장 후 db에서 해당 id를 가진 정보 찾아서 rawContent 변수에 저장
    var database = app.get('database');
        database.ReviewModel.findOne({'_id':storeId},function(err,rawContent){ 
        if(err){throw err;}
        rawContent.count += 1; // 조회수 +1
        rawContent.save(function(err){
            res.render('store',{content:rawContent,title:"맛집공유",user: req.user,enroll:""});
        });
    });
});


// 게시판 메뉴 -> share.ejs
router.route('/share').get(function(req,res){
    // 최근 날짜 순으로 rawContents 변수에 저장
   	var database = app.get('database');
    var page = req.param('page');
    if(page == null) {page = 1;}
    var skipSize = (page-1)*10;
    var limitSize = 10;
    var pageNum = 1;
    
    database.StoreModel.count({deleted:false},function(err, totalCount){
       // db에서 날짜 순으로 데이터들을 가져옴
        if(err) throw err;
        pageNum = Math.ceil(totalCount/limitSize);
        database.StoreModel.find({deleted:false}).sort({date:-1}).skip(skipSize).limit(limitSize).exec(function(err, rawMatzip) {
            if(err) throw err;
            res.render('share', {title: "맛집게시판", user:req.user, enroll:"", matzip: rawMatzip, pagination: pageNum});
        });
    });
});


//맛집게시판 검색
router.route('/search').get(function(req,res){
    var database = app.get('database');
   
    var search_word = req.param('searchWord');
    var searchCondition = {$regex:search_word};

    var page = req.param('page');
    if(page == null) {page = 1;}
    var skipSize = (page-1)*10;
    var limitSize = 10;
    var pageNum = 1;
    
    database.StoreModel.count({deleted:false, $or:[{storename:searchCondition},{writer:searchCondition},{storetime:searchCondition},{storemenu1:searchCondition},{storeprice1:searchCondition},{storemenu2:searchCondition},{storeprice2:searchCondition},{storemenu3:searchCondition},{storeprice3:searchCondition},{storeaddress:searchCondition},{storetelarea:searchCondition},{storetel:searchCondition},{file:searchCondition}]},function(err, totalCount){
        if(err) throw err;
        pageNum = Math.ceil(totalCount/limitSize);
    
    database.StoreModel.find({deleted:false, $or:[{storename:searchCondition},{writer:searchCondition},{storetime:searchCondition},{storemenu1:searchCondition},{storeprice1:searchCondition},{storemenu2:searchCondition},{storeprice2:searchCondition},{storemenu3:searchCondition},{storeprice3:searchCondition},{storeaddress:searchCondition},{storetelarea:searchCondition},{storetel:searchCondition},{file:searchCondition}]}).sort({date:-1}).skip(skipSize).limit(limitSize).exec(function(err, searchContents){
    if(err) throw err;

    res.render('share', {title: "맛집게시판", user:req.user, enroll:"", matzip: searchContents, pagination: pageNum, searchWord: search_word});
            
        });         
    });     
});
    
// 맛집 클릭 시 -> sharestore.ejs
router.route('/sharestore').get(function(req,res){
    var matzipId = req.param('id');
    // 넘겨받은 id값을 변수에 저장 후 db에서 해당 id를 가진 정보 찾아서 rawContent 변수에 저장
    var database = app.get('database');
        database.StoreModel.findOne({'_id':matzipId},function(err,rawMatzip){ 
        if(err){throw err;}
        rawMatzip.count += 1; // 조회수 +1
        rawMatzip.save(function(err){
            res.render('sharestore',{matzip:rawMatzip,title:"맛집게시판",user: req.user,enroll:""});
        });
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.route('/process/addstore').post(function(req, res) {
	console.log('user(user.js) 모듈 안에 있는 adduser 호출됨. ////'+req.body.nickname);
    
    var parmName=req.body.storename || req.query.storename;
    var nickname = req.body.nickname;
	var paramTime = req.body.storetime || req.query.storetime;
    var paramMenu1 = req.body.storemenu1 || req.query.storemenu1;
    var paramPrice1 = req.body.storeprice1 || req.query.storeprice1;
    var paramMenu2 = req.body.storemenu2 || req.query.storemenu2;
    var paramPrice2 = req.body.storeprice2 || req.query.storeprice2;
    var paramMenu3 = req.body.storemenu3 || req.query.storemenu3;
    var paramPrice3 = req.body.storeprice3 || req.query.storeprice3;
    var paramAddress = req.body.storeaddress || req.query.storeaddress;
    var paramTellarea = req.body.storetelarea || req.query.storetelarea;
    var paramTell = req.body.storetel || req.query.storetel;
    var paramFile = filename;

    console.log('요청 파라미터 : ' +parmName+','+ paramTime + ', ' + paramMenu1 + ', '+paramPrice1 +' , '+ paramAddress+ ' , '+paramTell+' , '+paramFile+','+nickname);
    
    // 데이터베이스 객체 참조
	var database = req.app.get('database');
	
    // 데이터베이스 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
	if (database.db) {
		addStore(database, parmName,nickname, paramTime, paramMenu1,paramPrice1,paramMenu2,paramPrice2,paramMenu3,paramPrice3,paramAddress,paramTellarea,paramTell,paramFile, function(err, addedStore) {
            // 동일한 id로 추가하려는 경우 에러 발생 - 클라이언트로 에러 전송
			if (err) {
                console.error('맛집 추가 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                var context={title:"맛집등록",form:"등록을 위해 입력폼을 작성해주세요.",image:"",user: req.user,enroll:""}
				req.app.render('enroll',context, function(err, html) {
					if (err) {throw err;}
					
					console.log("rendered : " + html);
					
					res.end(html);
				});
				
                return;
            }
			
            // 결과 객체 있으면 성공 응답 전송
			if (addedStore) {
				console.dir(addedStore);
 
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				
				// 뷰 템플레이트를 이용하여 렌더링한 후 전송
				var context = {enroll:' -> 맛집이 등록되었습니다.',user: req.user,title:"홈 화면"};
				req.app.render('main', context, function(err, html) {
					if (err) {throw err;}
					
					console.log("rendered : " + html);
					
					res.end(html);
				});
				
			} else {  // 결과 객체가 없으면 실패 응답 전송
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>맛집 추가  실패</h2>');
				res.end();
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
	
});

//맛집를 등록
var addStore = function(database,storename,nickname,storetime, storemenu1,storeprice1,storemenu2,storeprice2,storemenu3,storeprice3,storeaddress,storetelarea,storetel,file,callback) {
	
	// UserModel 인스턴스 생성
	var user = new database.StoreModel({storename:storename ,writer:nickname,storetime:storetime,storemenu1:storemenu1,storeprice1:storeprice1,storemenu2:storemenu2,storeprice2:storeprice2,storemenu3:storemenu3, storeprice3:storeprice3,storeaddress:storeaddress,storetelarea:storetelarea,storetel:storetel,file:file});

	// save()로 저장
	user.save(function(err) {
		if (err) {
			callback(err, null);
			return;
		}
		
	    console.log("맛집 데이터 추가함.");
	    callback(null, user);
	     
	});
};



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 리뷰정보 등록
router.route('/process/addreview').post( function(req,res){
    console.log('/process/addreview 라우팅 함수 호출됨');
    
    var paramStore = req.body.reviewstore || req.query.reviewstore;
    var paramTitle= req.body.reviewtitle || req.query.reviewtitle;
    var paramContent = req.body.reviewcontent || req.query.reviewcontent;
    var paramScore = req.body.reviewscore || req.query.reviewscore;
    var paramTellarea = req.body.storetelarea || req.query.storetelarea;
    var paramFile = filename;
    
    
    var database = req.app.get('database');

    if(database.db){
        addReview(database,paramStore,paramTitle,paramContent,paramScore,paramFile,
       
                function(err, docs) {
			// 에러 발생 시, 클라이언트로 에러 전송
			if (err) {
                 console.error('리뷰 추가 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                var context={title:"리뷰등록",form:"등록을 위해 입력폼을 작성해주세요.",image:"",user: req.user,enroll:""}
				req.app.render('redetail',context, function(err, html) {
					if (err) {throw err;}					
					res.end(html);
				});
				
                return;
            }
            // 조회된 레코드가 있으면 성공 응답 전송
			if (docs) {
				console.dir(docs);
				
				filename='';
				// 뷰 템플레이트를 이용하여 렌더링한 후 전송
				req.app.render('main',{user: req.user,enroll:' -> 리뷰가 등록되었습니다.',title:"홈 화면"}, function(err, html) {
					if (err) {throw err;}					
					res.end(html);
                    });
                    
				
			} else {  // 조회된 레코드가 없는 경우 실패 응답 전송
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h1>리뷰 등록</h1>');
				res.end();
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
		res.end();
	}
});

var addReview = function(db,store,title,content,score,file,callback){
    
    var user =new db.ReviewModel({"reviewstore":store,"reviewtitle":title,"reviewcontent":content,"reviewscore":score,"file":file});
    
    user.save(function(err){
        if(err){
            callback(err,null);
            return;
        }
        console.log('리뷰 데이터 추가함.');
        callback(null,user);
    });
    
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//===== Passport Strategy 설정 =====//
var LocalStrategy = require('passport-local').Strategy;

//패스포트 로그인 설정
passport.use('local-login', new LocalStrategy({
		usernameField : 'id',
		passwordField : 'password',
		passReqToCallback : true   // 이 옵션을 설정하면 아래 콜백 함수의 첫번째 파라미터로 req 객체 전달됨
	}, function(req, id, password, done) { 
		console.log('passport의 local-login 호출됨 : ' + id + ', ' + password);
		
		var database = app.get('database');
	    database.UserModel.findOne({ 'id' :  id }, function(err, user) {
	    	if (err) { return done(err); }

	    	// 등록된 사용자가 없는 경우
	    	if (!user) {
	    		console.log('계정이 일치하지 않음.');
	    		return done(null, false, req.flash('loginMessage', '등록된 계정이 없습니다.'));  // 검증 콜백에서 두 번째 파라미터의 값을 false로 하여 인증 실패한 것으로 처리
	    	}
			// 정상인 경우
			console.log('계정과 비밀번호가 일치함.');
			return done(null, user);  // 검증 콜백에서 두 번째 파라미터의 값을 user 객체로 넣어 인증 성공한 것으로 처리
	    });

	}));


// 패스포트 회원가입 설정
passport.use('local-signup', new LocalStrategy({
		usernameField : 'id',
		passwordField : 'password',
		passReqToCallback : true    // 이 옵션을 설정하면 아래 콜백 함수의 첫번째 파라미터로 req 객체 전달됨
	}, function(req, id, password, done) {
        // 요청 파라미터 중 name 파라미터 확인
        var parampassword2 = req.body.password2 || req.query.password2;
        var paramNickname = req.body.nickname || req.query.nickname;
        var paramSex = req.body.sex || req.query.sex;
    
	 
		console.log('passport의 local-signup 호출됨 : ' + id + ', ' + password + ', ' + paramNickname);
		
	    // findOne 메소드가 blocking되지 않도록 하고 싶은 경우, async 방식으로 변경
	    process.nextTick(function() {
	    	var database = app.get('database');
		    database.UserModel.findOne({ 'id' :  id }, function(err, user) {
		        // 에러 발생 시
		        if (err) {
		            return done(err);
		        }
		        
		        // 기존에 사용자 정보가 있는 경우
		        if (user) {
		        	console.log('기존에 계정이 있음.');
		            return done(null, false, req.flash('signupMessage', '계정이 이미 있습니다.'));  // 검증 콜백에서 두 번째 파라미터의 값을 false로 하여 인증 실패한 것으로 처리
		        } else {
		        	// 모델 인스턴스 객체 만들어 저장
		        	var user = new database.UserModel({'id':id,'password' :password ,'password2':parampassword2, 'nickname':paramNickname,'sex':paramSex});
		        	user.save(function(err) {
		        		if (err) {
		        			throw err;
		        		}
		        		
		        	    console.log("사용자 데이터 추가함.");
		        	    return done(null, user);  // 검증 콜백에서 두 번째 파라미터의 값을 user 객체로 넣어 인증 성공한 것으로 처리
		        	});
		        }
		    });    
	    });

	}));

// 사용자 인증 성공 시 호출
// 사용자 정보를 이용해 세션을 만듦
// 로그인 이후에 들어오는 요청은 deserializeUser 메소드 안에서 이 세션을 확인할 수 있음
passport.serializeUser(function(user, done) {
	console.log('serializeUser() 호출됨.');
	console.dir(user);
	
    done(null, user);  // 이 인증 콜백에서 넘겨주는 user 객체의 정보를 이용해 세션 생성
});

// 사용자 인증 이후 사용자 요청 시마다 호출
// user -> 사용자 인증 성공 시 serializeUser 메소드를 이용해 만들었던 세션 정보가 파라미터로 넘어온 것임
passport.deserializeUser(function(user, done) {
	console.log('deserializeUser() 호출됨.');
	console.dir(user);
	
	// 사용자 정보 중 id나 email만 있는 경우 사용자 정보 조회 필요 - 여기에서는 user 객체 전체를 패스포트에서 관리
    // 두 번째 파라미터로 지정한 사용자 정보는 req.user 객체로 복원됨
    // 여기에서는 파라미터로 받은 user를 별도로 처리하지 않고 그대로 넘겨줌
	done(null, user);  
});




//===== 404 에러 페이지 처리 =====//
var errorHandler = expressErrorHandler({
 static: {
   '404': './public/404.html'
 }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );


//===== 서버 시작 =====//

//확인되지 않은 예외 처리 - 서버 프로세스 종료하지 않고 유지함
process.on('uncaughtException', function (err) {
	console.log('uncaughtException 발생함 : ' + err);
	console.log('서버 프로세스 종료하지 않고 유지함.');
	
	console.log(err.stack);
});

// 프로세스 종료 시에 데이터베이스 연결 해제
process.on('SIGTERM', function () {
    console.log("프로세스가 종료됩니다.");
    app.close();
});

app.on('close', function () {
	console.log("Express 서버 객체가 종료됩니다.");
	if (database.db) {
		database.db.close();
	}
});

// 시작된 서버 객체를 리턴받도록 합니다. 
var server = http.createServer(app).listen(app.get('port'), function(){
	console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));

	// 데이터베이스 초기화
	database.init(app, config);
   
});


