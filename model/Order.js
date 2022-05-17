const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

    pName:{
        type:String,
        required:true
    },
    pType:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    time:{
        type:String,
        required:true
    },   
    dDate:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    upload:{
        data:Buffer,
        contentType: String
    },
    date:{
        type:Date,
        default:Date.now
        
    }
});

 module.exports = mongoose.model('Order', orderSchema)