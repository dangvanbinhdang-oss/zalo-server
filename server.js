const { Zalo, ThreadType } = require("zca-js");
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
app.use(express.json());

let apiInstance = null;
const CRED_PATH = path.join(__dirname, "credentials.json");

async function startZalo() {
    const zalo = new Zalo();
    
    try {
        let api;
        if (fs.existsSync(CRED_PATH)) {
            console.log("Tim thay file dang nhap cu, dang khoi phuc...");
            const creds = JSON.parse(fs.readFileSync(CRED_PATH, "utf8"));
            api = await zalo.login(creds);
            console.log("✅ Khoi phuc dang nhap thanh cong! Khong can quet QR");
        } else {
            console.log("Dang khoi dong Zalo - Quet QR lan dau...");
            console.log("Cho QR hien trong cua so nay...");
            api = await zalo.loginQR();
            
            const context = api.getContext();
            fs.writeFileSync(CRED_PATH, JSON.stringify(context, null, 2));
            console.log("✅ DA LUU FILE DANG NHAP credentials.json! Lan sau khong can quet lai");
        }

        apiInstance = api;
        console.log("\n✅ DA DANG NHAP THANH CONG! ID:", api.getOwnId());
        console.log("Server san sang: http://localhost:3000/groups");
        api.listener.start();

    } catch (e) { 
        console.error("Loi dang nhap:", e); 
        if(fs.existsSync(CRED_PATH)) {
            console.log("Cookie het han, xoa file cu de quet lai...");
            fs.unlinkSync(CRED_PATH);
        }
    }
}
startZalo();

app.get("/", (req,res)=> res.send(apiInstance ? "Zalo OK - /groups de xem danh sach" : "Dang cho QR"));
app.get("/groups", async (req,res)=>{
    try {
        if(!apiInstance) return res.json({error:"Chua dang nhap Zalo"});
        const groups = await apiInstance.getAllGroups();
        const gridMap = groups.gridVerMap || {};
        const ids = Object.keys(gridMap);
        const list = [];
        for (const gid of ids) {
            try {
                const info = await apiInstance.getGroupInfo(gid);
                const entry = info.gridInfoMap?.[gid] || info;
                const name = entry?.name || entry?.groupName || entry?.data?.name || "Nhom khong ten";
                list.push({ name: name, id: gid });
            } catch(e) { list.push({ name: "Nhom", id: gid }); }
            await new Promise(r=>setTimeout(r, 200));
        }
        res.json(list);
    } catch(e){ res.json({error:e.message}); }
});

app.post("/send", async (req,res)=>{
    try{
        if(!apiInstance) return res.json({success:false, error:"Chua dang nhap"});
        await apiInstance.sendMessage({msg:req.body.message}, req.body.groupId, ThreadType.Group);
        res.json({success:true});
    }catch(e){ res.json({success:false, error:e.message}); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("Server chay port " + PORT));