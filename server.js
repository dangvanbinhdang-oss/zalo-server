const express = require('express');
const { Zalo } = require('zca-js');
const fs = require('fs');

const app = express();
app.use(express.json());

let api = null;

async function startZalo(){
    const zalo = new Zalo();
    if(fs.existsSync('./credentials.json')){
        const creds = JSON.parse(fs.readFileSync('./credentials.json','utf8'));
        api = await zalo.login(creds);
        console.log("Login OK");
    }
}

app.get("/", (req,res)=> res.send("Zalo server LIVE"));

app.get("/groups", async (req,res)=>{
    try{
        if(!api) return res.json({error:"Chua dang nhap"});
        const data = await api.getAllGroups();
        const groupIds = Object.keys(data.gridVerMap || data);
        
        // Lay ten tung nhom
        const groups = [];
        for(const id of groupIds.slice(0, 50)){ // lay 50 nhom dau
            try{
                const info = await api.getGroupInfo(id);
                const g = info.gridInfoMap[id];
                if(g) groups.push({ id: id, name: g.name, members: g.memVerList?.length });
            }catch(e){}
        }
        res.json({ total: groupIds.length, groups: groups, allIds: groupIds });
    }catch(e){ res.json({error:e.message}); }
});

app.post("/send", async (req,res)=>{
    const { groupId, message } = req.body;
    await api.sendMessage(message, groupId);
    res.json({success:true});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async ()=>{ console.log("Port "+PORT); await startZalo(); });