const express = require('express');
const fs = require('fs');
const { Zalo, ThreadType } = require('zca-js');

const app = express();
app.use(express.json());

let api = null;
let qrBase64 = null;

async function start() {
    const zalo = new Zalo();
    try {
        // Nếu có credentials thì đăng nhập lại
        if (fs.existsSync('./credentials.json')) {
            const creds = JSON.parse(fs.readFileSync('./credentials.json','utf8'));
            api = await zalo.login(creds);
            console.log("Da khoi phuc dang nhap");
            return;
        }
    } catch(e){ console.log("Cred loi, tao QR moi"); }

    // Chua co thi tao QR
    const zalo2 = new Zalo();
    api = await zalo2.loginQR({}, async (qr) => {
        qrBase64 = qr.data;
        console.log("QR da tao");
    });
    
    const ctx = api.getContext ? await api.getContext() : api.context;
    if (ctx) fs.writeFileSync('./credentials.json', JSON.stringify(ctx));
    console.log("Da dang nhap Zalo!");
}
start().catch(console.log);

app.get("/", (req,res)=> res.send("Zalo server chay - /qr de lay QR - /groups de lay ID"));

app.get("/qr", (req,res)=>{
    if (qrBase64) {
        const img = Buffer.from(qrBase64.replace(/^data:image\/png;base64,[STRIPPED], ""), 'base64');
        res.writeHead(200, {'Content-Type':'image/png'});
        return res.end(img);
    }
    if (api) return res.send("Da dang nhap roi, vao /groups");
    res.send("Dang tao QR, doi 3s roi F5 lai");
});

app.get("/groups", async (req,res)=>{
    try{
        if(!api) return res.json({error:"Chua dang nhap, vao /qr"});
        const groups = await api.getAllGroups();
        res.json(groups);
    }catch(e){ res.json({error:e.message}); }
});

app.post("/send", async (req,res)=>{
    try{
        if(!api) return res.json({success:false, error:"Chua dang nhap"});
        await api.sendMessage(req.body.message, req.body.groupId, ThreadType.Group);
        res.json({success:true});
    }catch(e){ res.json({success:false, error:e.message}); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("Server chay port " + PORT));