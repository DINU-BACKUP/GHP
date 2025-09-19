require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

app.get('/api/profile', async (req,res)=>{
    try {
        const token = process.env.GITHUB_TOKEN;
        const r = await fetch('https://api.github.com/user', {
            headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }
        });
        const data = await r.json();
        res.json(data);
    } catch(e){ res.status(500).json({error:e.message}); }
});

app.get('/api/repos', async (req,res)=>{
    try {
        const token = process.env.GITHUB_TOKEN;
        let all = [], page = 1;
        while(true){
            const r = await fetch(`https://api.github.com/user/repos?per_page=100&page=${page}`, {
                headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }
            });
            const arr = await r.json();
            if(!Array.isArray(arr)) break;
            all = all.concat(arr);
            if(arr.length<100) break;
            page++;
            if(page>3) break;
        }
        res.json(all);
    } catch(e){ res.status(500).json({error:e.message}); }
});

app.listen(PORT, ()=>console.log(`Server running at http://localhost:${PORT}`));
