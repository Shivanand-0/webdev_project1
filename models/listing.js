//requiring
const mongoose=require("mongoose")
const Schema=mongoose.Schema;
const Review=require("./review")
//connection
let listingSchema= new Schema(
    {
        title:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        image:{
            type:String,
            default:"https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1020&auto=format&fit=crop&ixlib=rb-4.0.3",
            set:(v)=>(v==""?"https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1020&auto=format&fit=crop&ixlib=rb-4.0.3":v),
        },
        price:{
            type:Number,
            required:true
        },
        location:{
            type:String,
            default:true
        },
        country:{
            type:String,
            default:true,
        },
        reviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Review"
        }
        ]

    }
);


// mongoose midelware {will we active if findByIdAndDelete will requested}
listingSchema.post("findOneAndDelete",async (listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in:listing.reviews}})
    }
})

const Listing=mongoose.model('Listing',listingSchema);

module.exports=Listing;