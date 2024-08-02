const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const postmodel = require('./models/post');
const usermodel = require('./models/user');
const exp = require('constants');
const { Console } = require('console');
const upload = require('./config/multerconfig');
const { render } = require('ejs');



app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')));


app.get('/',(req,res)=>{
    res.render('index')
})
app.post('/upload/:_id',upload.single('image'),async (req,res)=>{
   await usermodel.findOneAndUpdate({email:req.user.email},{profile:req.file.filename});
   res.redirect('/profile');
})
app.post('/create',async (req,res)=>{
       const{name,age,username,password,email}=req.body;
       const user =  await usermodel.findOne({email}); 
       if(user) return res.status(500).send("alareadu");

      bcrypt.hash(password,10,async (err,hash)=>{
        const createduser = await usermodel.create({
           name,
           age,
           email,
           username,
           password:hash

        });
        const token = jwt.sign({email,username},'xyz');
        res.cookie("token",token);
        res.redirect('/profile');
      });
      
      
        
})
app.post('/login',async (req,res)=>{
  const{email,password}=req.body;
  const user = await usermodel.findOne({email});
  if(!user) return res.status(500).send("not a Valid user");
  bcrypt.compare(password,user.password,(err,result)=>{
    if(err) return res.send(err);
    if(!result) return res.send("wrong Password");
    const token= jwt.sign({email,password},'xyz');
    res.cookie("token",token);
    res.redirect('/profile');
  }) 
})
app.get('/login',(req,res)=>{
  res.render('login');
})
app.get('/profile',isLoggedIn,async (req,res)=>{
     const user = await usermodel.findOne({email:req.user.email}).populate("posts");
     res.render('profile',{user});
})
app.get('/logout',(req,res)=>{
  res.cookie("token",'');
  res.redirect('/');
})
app.post('/createpost',isLoggedIn,async (req,res)=>{
const {content} = req.body;
const user = await usermodel.findOne({email:req.user.email});
const post=await postmodel.create({
  user:user._id,
  content
})
user.posts.push(post._id);
await user.save();
res.redirect('/profile');
});
app.get("/like/:_id",isLoggedIn,async (req,res)=>{

  const post = await postmodel.findOne({_id:req.params._id}).populate("user");
  
   if(post.likes.indexOf(post.user._id)===-1)
   {
    post.likes.push(post.user._id);
   
   }
   else
   {
    post.likes.splice(post.likes.indexOf(post.user._id),1);
   }
   await post.save();

  
   res.redirect('/profile');
});
app.get("/edit/:_id",isLoggedIn,async (req,res)=>{

  const post = await postmodel.findOne({_id:req.params._id}).populate("user");
  res.render('edit',{post})
});
app.post("/edit/:_id",isLoggedIn,async (req,res)=>{
  const content=req.body.content;
  const post = await postmodel.findOneAndUpdate({_id:req.params._id},{content});

  res.redirect('/profile');
  
  


})
  



function isLoggedIn (req,res,next){
  if(req.cookies.token==="") return res.redirect('/login');
  else {
    const data = jwt.verify(`${req.cookies.token}`,"xyz");
    req.user=data;
  
    next()
  }
}



app.listen(3000);