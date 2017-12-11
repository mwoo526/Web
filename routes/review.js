
var listreview = function(req, res) {
	console.log('review 모듈 안에 있는 listreview 호출됨.');

	// 데이터베이스 객체 참조
	var database = req.app.get('database');
    
    // 데이터베이스 객체가 초기화된 경우, 모델 객체의 findAll 메소드 호출
	if (database.db) {
		// 1. 모든 사용자 검색
		database.ReviewModel.findAll(function(err, results) {
			// 에러 발생 시, 클라이언트로 에러 전송
			if (err) {
                console.error('리뷰 리스트 조회 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>리뷰 리스트 조회 중 에러 발생</h2>');
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
				res.write('<h2>리뷰 리스트 조회  실패</h2>');
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



module.exports.listreview = listreview;