const express = require('express');
const { Zalo } = require('zca-js');

const app = express();
app.use(express.json());

let api = null;

app.get("/", (req,res)=> res.send("Zalo server LIVE - /qr de check - /groups de lay ID"));

app.get("/qr", async (req,res)=>{
    try{
        if (api) return res.send("Da dang nhap roi, vao /groups");
        const zalo = new Zalo();
        // zca-js sẽ in QR ra log của Render, bạn vào log Render để quét
        api = await zalo.loginQR();
        res.send("QR da duoc tao trong LOG cua Render - Vao Render > Logs de quet!");
    }catch(e){
        res.send("Loi QR: " + e.message + " - Thu F5 lai");
    }
});

app.get("/groups", async (req,res)=>{
    try{
        if(!api) return res.json({error:"Chua dang nhap, vao /qr truoc"});
        const groups = await api.getAllGroups();
        res.json(groups);
    }catch(e){ res.json({error:e.message}); }
});

app.post("/send", async (req,res)=>{
    try{
        if(!api) return res.json({success:false, error:"Chua dang nhap"});
        const { groupId, message } = req.body;
        await api.sendMessage(message, groupId);
        res.json({success:true});
    }catch(e){ res.json({success:false, error:e.message}); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("Server chay port " + PORT));