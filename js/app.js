const el=id=>document.getElementById(id);
const log=s=>el('log').textContent=new Date().toLocaleTimeString()+' — '+s+"\n"+el('log').textContent;
const setStatus=s=>el('status').textContent=s;

el('getProfile').onclick=async()=>{
  try{
    setStatus('Fetching profile...');
    const r = await fetch('/api/profile');
    const d = await r.json();
    el('profileCard').style.display='block';
    el('profileBody').innerHTML=`<div><strong>${d.login}</strong> — ${d.name||''}</div><div class="muted">${d.bio||''}</div><div class="muted">Public repos: ${d.public_repos}</div><div class="muted">Profile: <a class="link" href="${d.html_url}" target="_blank">${d.html_url}</a></div>`;
    setStatus('Profile fetched'); log('Profile fetched '+d.login);
  }catch(e){alert(e.message); setStatus('Error'); log('Profile fetch error');}
};

el('listRepos').onclick=async()=>{
  try{
    setStatus('Listing repos...');
    const r = await fetch('/api/repos');
    const repos = await r.json();
    renderRepos(repos);
    setStatus('Repos loaded '+repos.length); log('Repos loaded');
  }catch(e){alert(e.message); setStatus('Error'); log('Repos list error');}
};

function renderRepos(repos){
  el('reposCard').style.display='block';
  const c=el('reposList'); c.innerHTML='';
  repos.forEach(r=>{
    const d=document.createElement('div'); d.className='repo';
    const left=document.createElement('div'); left.innerHTML=`<div style="font-weight:700"><a class="link" href="${r.html_url}" target="_blank">${r.full_name}</a></div><div class="muted">${r.description||''}</div><div class="muted">⭐ ${r.stargazers_count}</div>`;
    const right=document.createElement('div'); right.style.display='flex'; right.style.gap='8px';
    const badge=document.createElement('div'); badge.className='badge '+(r.private?'private':'public'); badge.textContent=r.private?'Private':'Public';
    const dl=document.createElement('button'); dl.textContent='Download ZIP'; dl.onclick=()=>downloadRepo(r.owner.login,r.name);
    right.appendChild(badge); right.appendChild(dl); d.appendChild(left); d.appendChild(right); c.appendChild(d);
  });
}

async function downloadRepo(owner,repo){
  try{
    setStatus('Preparing download...');
    log('Download '+owner+'/'+repo);
    const resp = await fetch(`/api/repos/${owner}/${repo}/zipball`);
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`${owner}-${repo}.zip`; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
    setStatus('Download triggered'); log('Download triggered');
  }catch(e){alert(e.message); setStatus('Error'); log('Download error');}
}
