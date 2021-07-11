let mongoose = require('mongoose');
let Scheme = mongoose.Schema;

let blogItem = new Scheme({
    title: {
        type: String,
        required: true
    },
    tags: {
        type: Array,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    cover: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    comment: { // 复杂结构
        type: Array,
        required: true
    },
    author: { // 复杂结构
        type: Object,
        required: true
    },
    lastModified: {
        type: Date,
        required: true
    },
    views: {
        type: Number,
        required: true
    },
    likes: {
        type: Number,
        required: true
    },
    blogId: {
        type: Number,
        required: true
    },
    approved: {
        type: Boolean,
        required: true
    }
});

const blogTables = mongoose.model('blogTables', blogItem);

module.exports = blogTables;


// let comment = [
//     {
//         userData: {
//             userName: 'wanzhang',
//             avatar: 'http://47.104.155.140:8888/api/v1/img/804afd35-feba-4ae5-907a-46b4896ae4d57f575f08ly1g3id9r5ir2j20q10xcq90.jpg'
//         },
//         content: '真的好好看',
//         commentId: 'a00c0c7c-6b48-4e4a-809c-b5c21627d9d3',
//         lastModified: `2020 - 11 - 24T12:40:21.403Z`,
//         isComment: false,
//         comment: [
//             {
//                 userData: {
//                     userName: 'wanzhang',
//                     avatar: 'http://47.104.155.140:8888/api/v1/img/804afd35-feba-4ae5-907a-46b4896ae4d57f575f08ly1g3id9r5ir2j20q10xcq90.jpg'
//                 },
//                 content: '确实很好看',
//                 commentId: '26b5b4b3-0056-4218-a84f-979022b6bfcf',
//                 lastModified: `2020 - 11 - 24T12: 40:28.727Z`
//             }
//         ],
//     },
//     {
//         userData: {
//             userName: '任生生Ren',
//             avatar:
//                 'http://47.104.155.140:8888/api/v1/img/849ea1a3-0591-41ea-b022-b3915744dbe357c1c3272c959b5038671f71d97bc4a5.jpg'
//         },
//         content: '哇',
//         isComment: false,
//         comment: [],
//         commentId: '1c246371-6953-48d0-8a9b-d74454289f5c',
//         lastModified: `2020 - 11 - 24T13:11:12.217Z`
//     }
// ]

