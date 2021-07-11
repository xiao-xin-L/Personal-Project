let mongoose = require('mongoose');
let Scheme = mongoose.Schema;

let visitorInfo = new Scheme({
    ip: {
        type: String,
        required: true
    },
    visitTime: {
        type: Date,
        required: true
    },
    location: {
        // 经纬度坐标
        type: Array,
        required: true
    },
    province: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    }
});

const visitorTables = mongoose.model('visitorTables', visitorInfo);

module.exports = visitorTables;
