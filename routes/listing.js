const express=require("express");
const router=express.Router();
const {listingSchema}=require("../Schema.js");
const wrapAsync=require("../utils/wrapAsync.js");
const Listing= require('../models/listing');
const ExpressError=require("../utils/ExpressError.js");




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




//showing listing
router.get("/",wrapAsync(async (req,resp)=>{
    const allListing=await Listing.find({});
    resp.render("index.ejs",{allListing})
}));

router.get("/:id/details",
    wrapAsync(async (req,resp)=>{
        const {id}= req.params;
        const listing=await Listing.findById(id).populate("reviews");
        if(!listing){
            req.flash("error","Listing you requested for does not exist!")
            resp.redirect("/listing");

        }else{
            resp.render("show.ejs",{listing})
        }
    })
    );

// Adding new listing
router.get("/new",(req,resp)=>{
    resp.render("createListing.ejs")
})

router.post(
  "/",
  validateListing,
  wrapAsync(async (req, resp, next) => {
    let newListing = new Listing(req.body.listing);
    await newListing.save().then((result) => {
      console.log(result);
      req.flash("success","New listing created!")
      resp.redirect("/listing");
    });
  })
);

// edit and  update
router.get("/:id/edit",wrapAsync(async(req,resp)=>{
    let listing=await Listing.findById(req.params.id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!")
        resp.redirect("/listing")

    }
    else{
        resp.render("editListing.ejs",{listing})
    }
}));

router.put('/:id/details',validateListing,wrapAsync(async (req,resp)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{$set:{...req.body.listing}})
    req.flash("success","listing updated!")
    resp.redirect("/listing")
}));

// delete
router.delete('/:id/details',wrapAsync(async (req,resp)=>{
    await Listing.findByIdAndDelete(req.params.id);
    req.flash("success","listing deleted!")
    resp.redirect('/listing')
}));




module.exports=router;