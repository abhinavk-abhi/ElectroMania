import mongoose from "mongoose";
const {Schema} = mongoose;

const bannerModel = new Schema({

    image : {
        type : String,
        required : true
    },
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    link : {
        type : String
    },
    startDate : {
        type : Date,
        required : true
    },
    endDate : {
        type : Date,
        required : true
    }
})

export default mongoose.model("Banner",bannerModel);