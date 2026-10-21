const express = require('express');
const { Zalo } = require('zca-js');
const fs = require('fs');

const app = express();
app.use(express.json());

let api = null;

async function startZalo(){
    const zalo = new Zalo();
    try{
        if(fs.existsSync('./credentials.json')){
            const creds = JSON.parse(fs.readFileSync('./credentials.json','utf8'));
            api = await zalo.login(creds);
            console.log("Login bang credentials.json thanh cong");
        }else{
            api = await zalo.loginQR();
        }
    }catch(e){ console.log("Zalo login loi:", e.message); }
}

app.get("/", (req,res)=> res.send("Zalo server LIVE - Groups: /groups"));

app.get("/groups", async (req,res)=>{
    if(!api) return res.json({error:"Chua dang nhap"});
    const groups = await api.getAllGroups();
    res.json(groups);
});

app.post("/send", async (req,res)=>{
    const { groupId, message } = req.body;
    try{
        await api.sendMessage(message, groupId);
        res.json({success:true});
    }catch(e){ res.json({success:false, error:e.message}); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async ()=>{
    console.log("Server chay port " + PORT);
    await startZalo();
});