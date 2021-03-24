// importing
import express from 'express';
import mongoose from 'mongoose';
import Message from './dbmeessage.js';
import Pusher from 'pusher';
import cors from 'cors';
import path from 'path'
import dotenv from 'dotenv';
dotenv.config({path:'./config.env'});
// app config
const app=express();
const PORT=process.env.PORT;

const pusher = new Pusher({
    appId: "1173933",
    key: "c209d3cf5c81b12e183b",
    secret: "a7c8b51a4052700989c6",
    cluster: "ap2",
    useTLS: true
  });
  

// middleware
app.use(express.json());
app.use(cors());
// db config

const connection_url=process.env.DB;
mongoose.connect(connection_url,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log(`connected`);
}).catch(()=>{
    console.log(`not connected`);
});

const db = mongoose.connection
db.once('open',()=>{
    console.log(`db connected`);

    const msgCollection = db.collection("messagecontents")
    const changestream = msgCollection.watch();
  
    changestream.on("change",(change)=>{
        // console.log(`A change occqured`,change);
    
    if(change.operationType==='insert'){
       const messageDetails= change.fullDocument;
       pusher.trigger('messages','inserted',{
           name: messageDetails.name,
           message: messageDetails.message,
           received: messageDetails.received,
           timestamp: messageDetails.timestamp

       });

    }else{
        console.log(`pusher trigered fail`);
    }
});
})


// api route
app.get('/',(req,res)=>{
    res.status(200).sendFile(path.resolve(__dirname,'client/build/index.html'));
});
app.get('/message/sync',(req,res)=>{
    Message.find({},(err,data) => {
        if(err){
            res.status(500).send(err);
        }else{
            res.status(200).send(data);
        }
    })
})

app.post('/message',(req,res)=>{
    const dbmessage= req.body;
     Message.create(dbmessage,(err,data)=>{
         if(err){
             res.status(500).send(err);
         }else{
             res.status(201).send(`new message created: \n ${data}`)
         }

     })
})


// build The Mern stack
if(process.env.NODE_ENV==="production"){
    app.use(express.static('client/build'));
}


// listener
app.listen(PORT,()=>console.log(`Listening To LocalHost:${PORT}`));