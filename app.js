const express = require("express");
const mongoose= require("mongoose");
const Listing=require("./models/listing")
const dotenv=require("dotenv")
dotenv.config();
const app=express();



let MONGO_URL=process.env.MONGO_URL;
async function main(){
    await mongoose.connect(MONGO_URL)
}
main()
.then(()=>{console.log("db connected")})
.catch((e)=>{console.log("error with db connection")});


app.get("/",(req,resp)=>{
resp.send("home page")
})

app.listen(8080,()=>{
    console.log("listening on port 8080")
})