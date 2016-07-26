var Thing = {tableName:"thing"};

Thing.model = {
	name : {
		type : "text",
		size : 64,
		unique : true
	},
	url : {
		type : "text",
		size : 32,
		unique : true
	}
}

Thing.methods = null;


Thing.define = function(db){
	return db.define(Thing.tableName, Thing.model, Thing.methods);
}

try {
	exports.tableName = Thing.tableName;
    exports.model = Thing.model;
    exports.methods = Thing.methods;
    exports.define = Thing.define;
}
catch(err) {
    
}