let mongoose = require('mongoose');
let Scheme = mongoose.Schema;

let UserCount = new Scheme({
    userName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    key: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    introduction: {
        type: String
    },
    isAdmin: {
        type: Boolean
    },
    approved: {
        type: Boolean
    },
    createTime: {
        type: Date
    }
});

const UserCountTables = mongoose.model('UserCountTables', UserCount);

module.exports = UserCountTables;
