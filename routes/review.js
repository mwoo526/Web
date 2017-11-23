var addreview = function(req,res){
    console.log('/process/adduser 라우팅 함수 호출됨');
    
    var paramStore = req.body.store || req.query.store;
    var paramTitle= req.body.title || req.query.title;
    var paramContent = req.body.content || req.query.content;
    var paramScore = req.body.score || req.query.score;
        
    var database = req.app.get('database');

    if(database){
        addReview(database,paramStore,paramTitle,paramContent,paramScore,
                function(err, docs) {
			// 에러 발생 시, 클라이언트로 에러 전송
			if (err) {
                console.error('리뷰 등록 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>리뷰 등록 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }
            // 조회된 레코드가 있으면 성공 응답 전송
			if (docs) {
				console.dir(docs);
				
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				
				// 뷰 템플레이트를 이용하여 렌더링한 후 전송
				req.app.render('review', function(err, html) {
					if (err) {throw err;}
					console.log('rendered : ' + html);
					
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
};

var listreview = function(req, res) {
	console.log('user 모듈 안에 있는 listuser 호출됨.');

	// 데이터베이스 객체 참조
	var database = req.app.get('database');
    
    // 데이터베이스 객체가 초기화된 경우, 모델 객체의 findAll 메소드 호출
	if (database.db) {
		// 1. 모든 사용자 검색
		database.ReviewModel.findAll(function(err, results) {
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




var addReview = function(db,store,title,content,score,callback){
    
    var user =new db.ReviewModel({"reviewstore":store,"reviewtitle":title,"reviewcontent":content,"reviewscore":score});
    
    user.save(function(err){
        if(err){
            callback(err,null);
            return;
        }
        console.log('사용자 데이터 추가함.');
        callback(null,user);
    });
    
};


module.exports.addreview = addreview;
module.exports.listreview = listreview;
