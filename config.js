/*
 * 설정 파일
 *
 * @date 2016-11-10
 * @author Mike
 */

module.exports = {
	server_port: 3000,
	db_url: 'mongodb://localhost:27017/local',
	db_schemas: [
	    {file:'./user_schema', collection:'users21', schemaName:'UserSchema', modelName:'UserModel'}
        ,{file:'./device_schema',collection:'devices21', schemaName:'DeviceSchema',modelName:'DeviceModel'}
        ,{file:'./store_schema',collection:'store24', schemaName:'StoreSchema',modelName:'StoreModel'}
        ,{file:'./review_schema',collection:'review3', schemaName:'ReviewSchema',modelName:'ReviewModel'}
        
 
        
	],
	route_info: [
        {file :'./user'  , path : '/process/listuser', method : 'listuser' , type : 'post'}
        ,{file:'./store' , path : '/process/addstore', method : 'addstore' , type : 'post'}
        ,{file:'./store' , path : '/process/liststore', method : 'liststore' , type : 'post'}
        ,{file:'./device', path : '/process/adddevice', method:'adddevice', type:'post'}
        ,{file:'./device', path : '/process/listdevice', method:'listdevice', type:'post'}
        ,{file:'./device', path : '/process/register', method:'register', type:'post'}
	    ,{file:'./device', path : '/process/sendall', method:'sendall', type:'post'}
	    ,{file:'./review', path : '/process/addreview', method:'addreview', type:'post'}
        ,{file:'./review', path : '/process/listreview', method : 'listreview' , type : 'post'}

	],
    
    fcm_api_key:'AAAAmwcNl6I:APA91bFm1mU_eR1B-hnFKvY7VZbAVGGoPegvX8wW2hhAIBSNvEUsoJ-CzBO6nQormmcfOAcc_SwWXdfyz9Jlg42yaq3bUG3jXpTgwMZj6NJE4LCRAmIZerQcSF3_Lr2wF1rztxZfcQa4'
}
