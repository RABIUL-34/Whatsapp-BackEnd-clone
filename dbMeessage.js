import mongoose from 'mongoose';



const whatsappschema=mongoose.Schema({
   message:String,
   name:String,
   timestamp:String ,
   received: Boolean
})

export default mongoose.model('messagecontent',whatsappschema);