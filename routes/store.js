
var addstore = function(req, res) {
	console.log('user(user.js) 모듈 안에 있는 adduser 호출됨.');
    
    var parmName=req.body.storename || req.query.storename;
	var paramTime = req.body.storetime || req.query.storetime;
    var paramMenu1 = req.body.storemenu1 || req.query.storemenu1;
    var paramPrice1 = req.body.storeprice1 || req.query.storeprice1;
    var paramMenu2 = req.body.storemenu2 || req.query.storemenu2;
    var paramPrice2 = req.body.storeprice2 || req.query.storeprice2;
    var paramMenu3 = req.body.storemenu3 || req.query.storemenu3;
    var paramPrice3 = req.body.storeprice3 || req.query.storeprice3;
    var paramAddress = req.body.storeaddress || req.query.storeaddress;
    var paramTell = req.body.storetel || req.query.storetel;
	
    console.log('요청 파라미터 : ' +parmName+','+ paramTime + ', ' + paramMenu1 + ', '+paramPrice1 +' , '+ paramAddress+ ' , '+paramTell);
    
    // 데이터베이스 객체 참조
	var database = req.app.get('database');
	
    // 데이터베이스 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
	if (database.db) {
		addStore(database, parmName, paramTime, paramMenu1,paramPrice1,paramMenu2,paramPrice2,paramMenu3,paramPrice3,paramAddress,paramTell, function(err, addedStore) {
            // 동일한 id로 추가하려는 경우 에러 발생 - 클라이언트로 에러 전송
			if (err) {
                console.error('사용자 추가 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                var context={title:"맛집등록",form:"등록을 위해 입력폼을 작성해주세요.",user: req.user,enroll:""}
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
				res.write('<h2>사용자 추가  실패</h2>');
				res.end();
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
	
};


var liststore = function(req, res) {
	console.log('user 모듈 안에 있는 listuser 호출됨.');

	// 데이터베이스 객체 참조
	var database = req.app.get('database');
    
    // 데이터베이스 객체가 초기화된 경우, 모델 객체의 findAll 메소드 호출
	if (database.db) {
		// 1. 모든 사용자 검색
		database.StoreModel.findAll(function(err, results) {
			// 에러 발생 시, 클라이언트로 에러 전송
			if (err) {
                console.error('사용자 리스트 조회 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 리스트 조회 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }

			if (results) {
				console.dir(results);
				res.writeHead('200', {'Content-Type':'application/json;charset=utf8'});
                // wirteHead 메소드 : Cotent -Type
				res.write(JSON.stringify(results));
                // 결과 객체를 문자열로 변경
				res.end();
				
			} else {
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 리스트 조회  실패</h2>');
				res.end();
			}
		});
	} else {
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
	
};





//맛집를 등록
var addStore = function(database,storename,storetime, storemenu1,storeprice1,storemenu2,storeprice2,storemenu3,storeprice3,storeaddress,storetel,callback) {
	console.log('addUser 호출됨 : '+storename +', '+ storetime + ', ' + storemenu1  +' , '+storeprice1+', ' + storeaddress+' , '+storetel);
	
	// UserModel 인스턴스 생성
	var user = new database.StoreModel({storename:storename ,storetime:storetime,storemenu1:storemenu1,storeprice1:storeprice1,storemenu2:storemenu2,storeprice2:storeprice2,storemenu3:storemenu3, storeprice3:storeprice3,storeaddress:storeaddress,storetel:storetel});

	// save()로 저장
	user.save(function(err) {
		if (err) {
			callback(err, null);
			return;
		}
		
	    console.log("사용자 데이터 추가함.");
	    callback(null, user);
	     
	});
}







module.exports.liststore = liststore;
module.exports.addstore = addstore;