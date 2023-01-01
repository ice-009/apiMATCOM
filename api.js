const dbConnect = require('./mongo');
const port = process.env.port || 3000
const express = require('express');
const app = express();

app.use(express.json());
app.get('/',async (res,resp)=>{
    let data = await dbConnect();
    data= await data.find().toArray();
    resp.send(data);
});
app.listen(port, () => {
    console.log("APP IS LISTENING ON PORT 3000!")
})