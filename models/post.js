const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/sher17");

const postSchema=mongoose.Schema({
   user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"usermodel"
       },
   date:{
    type:Date,
    default:Date.now()
},
content:String,
likes:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:'usermodel'
    }
]
});

module.exports = mongoose.model("postmodel",postSchema);
