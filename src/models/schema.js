const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");

const userSchema=new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    gender:{
        type:String,
        require:true

    },
    password:{
        type:String,
        require:true
    },
    confirmpassword:{
        type:String,
        require:true
    },
    tokens:[{
        token:{
            type:String,
            require:true
        }
    }]
    
})

//generating token
userSchema.methods.generateToken =async function(){

    try {
        const token= jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
        // console.log(token);
        this.tokens=this.tokens.concat({token:token});
        await this.save(); //This to save this into database

        return token;
    } catch (error) {
        res.send("The error part."+error);
        console.log("The error part."+error);
        
    }

}



//converting password into hash
userSchema.pre("save", async function(next){

    if(this.isModified("password")){
        
        // const passwordHash=await bcrypt.hash(password,10);
        // console.log(`Password is ${this.password}`);
        this.password= await bcrypt.hash(this.password,10);
        // console.log(`Password is ${this.password}`);
        this.confirmpassword=await bcrypt.hash(this.password,10);
    }

    next();

})

const Register=new mongoose.model("Register",userSchema);

module.exports=Register;