let mongoose=require("mongoose");
let sampleData=require("./data");
let Listing=require("../models/listing");


async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/testWonderlust")
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