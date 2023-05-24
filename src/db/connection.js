const mongoose=require("mongoose");

mongoose.connect("mongodb://localhost:27017/registration_form")
.then(()=>{
    console.log("Connection Successful");
})
.catch((err)=>{
    console.log(err);
})