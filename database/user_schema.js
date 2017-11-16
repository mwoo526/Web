/**
 * 데이터베이스 스키마를 정의하는 모듈
 *
 */

var Schema = {};

Schema.createSchema = function(mongoose) {
	
	// 스키마 정의
	var UserSchema = mongoose.Schema({
        id:{type:String,required:true,unique:true},
        password:{type:String,required:true},
        password2:{type:String},
        nickname:{type:String,index:'hashed'},
        sex:String
	});
	
	
	// 값이 유효한지 확인하는 함수 정의
	var validatePresenceOf = function(value) {
		return value && value.length;
	};
		
	// 저장 시의 트리거 함수 정의 (password 필드가 유효하지 않으면 에러 발생)
	UserSchema.pre('save', function(next) {
		if (!this.isNew) return next();
	
		if (!validatePresenceOf(this.password)) {
			next(new Error('유효하지 않은 password 필드입니다.'));
		} else {
			next();
		}
	})
	
	UserSchema.path('password').validate(function (password) {
		return password.length;
	}, 'password 칼럼의 값이 없습니다.');
	
	
	// 모델 객체에서 사용할 수 있는 메소드 정의
	UserSchema.static('findById', function(id, callback) {
		return this.find({id:id}, callback);
	});
	
	UserSchema.static('findAll', function(callback) {
		return this.find({}, callback);
	});
	
	console.log('UserSchema 정의함.');

	return UserSchema;
};

// module.exports에 UserSchema 객체 직접 할당
module.exports = Schema;


