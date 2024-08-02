const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/sher17");

const userSchema=mongoose.Schema({
    username:String,
    name:String,
    email:String,
    age:Number,
    profile:{
        type:String,
        default:"image.png"
    },
    password:String,
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"postmodel"
    }]
    
});

module.exports = mongoose.model("usermodel",userSchema);
