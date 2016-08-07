var User = {
	tableName : "user"
};



User.model = {
	username: {
        type: "text",
        size: 20,
        unique: true
    },
    password: String,
    salt: String,
    email: {
        type: "text",
        size: 254,
        unique: true
    },
    organization_id : {
		type : "integer",
		foreignKey : {
			table : 'organization'
		}
	},
    isLocked: {
        type: "boolean",
        defaultValue: false
    },
    loginattemptsSinceLastSuccess: {
        type: "integer",
        size: 2,
        defaultValue: 0
    },
    lastLoginTime: {
        type: "date",
        time: true
    },
    status: {
        type: "enum",
        values: ["User", "Rep", "Admin"]
    },
    signUpTime: {
        type: "date",
        time: true
    },
    lockDate: {
        type: "date",
        time: true
    }
}

User.methods = {
	userNameAndEmail : function() {
		return this.username + ' (' + this.email + ')';
	}
}


User.define = function(db) {
	var userModel = db.define(User.tableName, User.model, User.methods);
	return userModel;
}

try {
	exports.tableName = User.tableName;
	exports.model = User.model;
	exports.methods = User.methods;
	exports.define = User.define;
} catch (err) {

}