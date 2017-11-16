var Schema = {};

Schema.createSchema = function(mongoose){
    var StoreSchema = mongoose.Schema({
        storename:{type:String,required:true,unique:true},
        storetime:{type:String,required:true},
        storemenu1:{type:String},
        storeprice1:{type:String},
        storemenu2:{type:String},
        storeprice2:{type:String},
        storemenu3:{type:String},
        storeprice3:{type:String},
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