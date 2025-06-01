let mongoose=require("mongoose");
let sampleData=require("./data");
let Listing=require("../models/listing");

require("dotenv").config();
const MONGO_URL=process.env.MONGO_URL;


async function main(){
    await mongoose.connect(MONGO_URL)
}
main().then(()=>{
    console.log("db connected");
}).catch((e)=>{
    console.log("error: ", e);
})

async function initData(){
    let data=sampleData.data;
    let result=await Listing.insertMany(data)
    console.log(result);
}

initData();