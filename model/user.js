const mongoose=require('mongoose');

const User= new mongoose.Schema(
    {
        name:{type:String,required:true},
        email:{type:String, required:true,unique:true},
        password:{type:String,required:true},
        public: {type: Boolean, default: false},        
        movies : { type : Array , "default" : [] },
    }
);
module.exports=mongoose.model("UserData",User);
