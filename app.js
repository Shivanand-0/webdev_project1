// requiring packeges
const express= require('express');
const ejs=require('ejs');
const mongoose=require('mongoose');
const path=require('path');
const Listing= require('./models/listing');
const Review= require('./models/review.js');
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema}=require("./Schema.js");
const {reviewSchema}=require("./Schema.js");

require("dotenv").config();
const MONGO_URL=process.env.MONGO_URL;




// initialising
const app=express();
app.engine('ejs',ejsMate)
app.set("view-engine",'ejs');
app.set('views',path.join(__dirname,"views/listings"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));




// DB connection
async function main(){
    await mongoose.connect(MONGO_URL);
}
main().then(result=>console.log("DB is connected...."))
.catch(err=>console.log("Error: ",err))

// middlewares
//MW foe listing-server-validation
const validateListing=(req,resp,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg= error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}

//MW foe review-server-validation
const validateReview=(req,resp,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

////routes

// home route
app.get("/",(req,resp)=>{
    resp.redirect("/listing")
})

//showing listing
app.get("/listing",wrapAsync(async (req,resp)=>{
    const allListing=await Listing.find({});
    resp.render("index.ejs",{allListing})
}));

app.get("/listing/:id/details",
    wrapAsync(async (req,resp)=>{
        const {id}= req.params;
        const listing=await Listing.findById(id).populate("reviews");
        resp.render("show.ejs",{listing})
    })
    );

// Adding new listing
app.get("/listing/new",(req,resp)=>{
    resp.render("createListing.ejs")
})

app.post(
  "/listing",
  validateListing,
  wrapAsync(async (req, resp, next) => {
    let newListing = new Listing(req.body.listing);
    await newListing.save().then((result) => {
      console.log(result);
      resp.redirect("/listing");
    });
  })
);

// edit and  update
app.get("/listing/:id/edit",wrapAsync(async(req,resp)=>{
    let listing=await Listing.findById(req.params.id);
    resp.render("editListing.ejs",{listing})
}));

app.put('/listing/:id/details',validateListing,wrapAsync(async (req,resp)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{$set:{...req.body.listing}})
    resp.redirect("/listing")
}));

// delete
app.delete('/listing/:id/details',wrapAsync(async (req,resp)=>{
    await Listing.findByIdAndDelete(req.params.id);
    resp.redirect('/listing')
}));

//post reviews
app.post("/listing/:id/reviews",validateReview,wrapAsync(async(req,resp)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview= new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("new Review saved");
    resp.redirect(`/listing/${listing._id}/details`)
}))

// delete review route
app.delete("/listing/:id/reviews/:reviewId",wrapAsync(async(req,resp)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId);
    resp.redirect(`/listing/${id}/details`)
}))






app.all('*',(req,resp,next)=>{
    console.log("* route")
    next(new ExpressError(404,"Page Not Found"))
})
app.use((err,req,resp,next)=>{
    console.log("In error handler")
    let {statusCode=500,message="Something went wrong!!!"}=err;
    resp.status(statusCode).render('../Error.ejs',{message})
    // resp.status(statusCode).send(message);
})

app.listen(8080,()=>console.log("server is running on port 8080....."));