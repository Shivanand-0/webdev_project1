// requiring packeges
const express= require('express');
const ejs=require('ejs');
const mongoose=require('mongoose');
const path=require('path');
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const listingRoutes=require("./routes/listing.js")
const reviewRoutes=require("./routes/review.js")
const session=require("express-session");
const flash=require("connect-flash");





require("dotenv").config();
const MONGO_URL=process.env.MONGO_URL;




// initialising
const app=express();
app.engine('ejs',ejsMate)
app.set("view engine",'ejs');
app.set('views',path.join(__dirname,"views/listings"));  //views/listings
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
const sessionOptions={
    secret:"mysupersecret",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expire:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly: true,
    }
}


// DB connection
async function main(){
    await mongoose.connect(MONGO_URL);
}
main().then(result=>console.log("DB is connected...."))
.catch(err=>console.log("Error: ",err))


////routes

// home route
app.get("/",(req,resp)=>{
    resp.redirect("/listing")
})

app.use(session(sessionOptions));
app.use(flash());
app.use((req,resp,next)=>{
    resp.locals.success=req.flash("success");
    resp.locals.error=req.flash("error");
    next()
})
//listing routes
app.use("/listing",listingRoutes)
// review routes
app.use("/listing:id/reviews",reviewRoutes)

// app.all("*",(req,resp,next)=>{
//     next(new ExpressError(404,"Page Not Found"))
// })

app.use((err,req,resp,next)=>{
    // console.log("In error handler",err)
    let {statusCode=500,message="Something went wrong!!!"}=err;
    resp.status(statusCode).render("../Error.ejs",{message})
    // resp.status(statusCode).send(message);
})

app.listen(8080,()=>console.log("server is running on port 8080....."));