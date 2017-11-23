var Schema = {};

Schema.createSchema = function(mongoose){
    var StoreSchema = mongoose.Schema({
        storename:{type:String,required:true,unique:true},
        storetime:{type:String,required:true},
        storemenu1:{type:String,'default':''},
        storeprice1:{type:String,'default':''},
        storemenu2:{type:String,'default':''},
        storeprice2:{type:String,'default':''},
        storemenu3:{type:String,'default':''},
        storeprice3:{type:String,'default':''},
        storeaddress:{type:String,required:true},
        storetel:{type:String,required:true},
    });
    
    StoreSchema.static('findById',function(storename,callback){
       return this.find({storename,storename},callback);
        
    });
    StoreSchema.static('findAll',function(callback){
        return this.find({},callback);
    });
    
    return StoreSchema;
}

module.exports=Schema;