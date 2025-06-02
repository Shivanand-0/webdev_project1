const express=require("express");
const router=express.Router({mergeParams:true});
const Review= require('../models/review.js');
const Listing= require('../models/listing');
const wrapAsync=require("../utils/wrapAsync.js");
const { reviewSchema}=require("../Schema.js");
const ExpressError=require("../utils/ExpressError.js");


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

//post reviews
router.post("/",validateReview,wrapAsync(async(req,resp)=>{
    console.log("in post review")
    let listing=await Listing.findById(req.params.id);
    let newReview= new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
      req.flash("success","New review posted!")

    console.log("new Review saved");
    resp.redirect(`/listing/${listing._id}/details`)
}))
  
// delete review route
router.delete("/:reviewId",wrapAsync(async(req,resp)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId);
      req.flash("success","review deleted!")
    resp.redirect(`/listing/${id}/details`)
}))


module.exports=router;