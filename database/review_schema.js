var Schema = {};

Schema.createSchema = function(mongoose){
    var ReviewSchema = mongoose.Schema({
        reviewstore:{type:String,'default':''},
        reviewtitle:{type:String,'default':''},
        reviewcontent:{type:String,'default':''},
        reviewscore:{type:String,'default':''},
        count: {type:Number, default: 0}, //
        date: {type: Date, default: Date.now}, //
        deleted: {type: Boolean, default: false} // true면 삭제 된 경우임

    });
        
    ReviewSchema.static('findById',function(reviewstore,callback){
       return this.find({reviewstore,reviewstore},callback);
        
    });
    ReviewSchema.static('findAll',function(callback){
        return this.find({},callback);
    });
    
    return ReviewSchema;
}

module.exports=Schema;