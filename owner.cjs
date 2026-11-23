const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const express = require('express');
const hash = s => crypto.createHash('sha256').update(s).digest('hex');
const owner = '4b26e4f5a9cd988ed2dffcaa2e4055c18e186eb1bc55bd09ce88e8c3e2d71de7';
const origin = 'https://www.syracusegrand.com';
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const page = (title,body) => `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | Syracuse Grand</title>
<style>*{box-sizing:border-box}body{margin:0;color:#192944;background:#f7f5ef;font:16px/1.5 system-ui,sans-serif}header{background:#172741;border-bottom:3px solid #b99e67;padding:15px max(5vw,20px);display:flex;align-items:center;gap:24px;color:white}header img{height:48px;width:76px;object-fit:contain}header span{font-size:12px;letter-spacing:.15em;text-transform:uppercase}main{max-width:980px;margin:40px auto;padding:0 20px}h1,h2{font-family:Georgia,serif;font-weight:normal;line-height:1.15}h1{font-size:clamp(34px,5vw,52px);margin:0}h2{font-size:28px;margin:0 0 14px}.grid{display:grid;grid-template-columns:1.08fr 1fr;gap:20px;margin:26px 0}section{background:white;border:1px solid #dedbd2;border-radius:10px;padding:24px}.narrow{max-width:470px;margin-top:24px}label{display:block;font-weight:600;margin:16px 0 4px}input,button{font:inherit;border-radius:5px;padding:11px 13px}input{width:100%;border:1px solid #8f979f}button{margin-top:18px;background:#203754;color:white;border:0;cursor:pointer}a{color:#234e68}.report{display:block;padding:12px 0;border-top:1px solid #ddd;text-decoration:none}.report strong,.report small{display:block}.report small{color:#495767}.note{padding:12px 15px;background:#eeeee6;border-left:3px solid #a28b54}.ok{background:#e4f2e6;padding:12px}@media(max-width:680px){.grid{grid-template-columns:1fr}main{margin:24px auto}section{padding:18px}}</style>
<header><img src="/assets/images/logo-mark-white.png" alt="Syracuse Grand"><span>Owner workspace</span></header><main><h1>${title}</h1>${body}</main></html>`;
const form = (action,body,button) => `<form method="post" action="/owner/${action}">${body}<button>${button}</button></form>`;
const cookieOpts = { httpOnly:true, secure:true, sameSite:'strict',path:'/' };
module.exports = function mount(app,sendCode,options={}) {
  const file=path.join(options.mount || process.env.RAILWAY_VOLUME_MOUNT_PATH || '/data','sg-directory-wifi.json');
  const template=fs.readFileSync(path.join(__dirname,'guest.html'),'utf8');
  const fields=['network','username','password'];
  const pattern = k => new RegExp(`(id="wifi-${k}">)([^<]*)(</div>)`);
  const defaults=Object.fromEntries(fields.map(k=>[k,template.match(pattern(k))[2]]));
  function read(){try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch(e){if(e.code==='ENOENT')return defaults;throw e;}}
  app.get('/guest',(req,res)=>{const wifi=read();let html=template;for(const k of fields)html=html.replace(pattern(k),(_,a,b,c)=>a+esc(wifi[k])+c);res.set('Cache-Control','no-store').send(html);});
  let challenges=new Map(),sessions=new Map(),sends=[];
  function key(req,name){return (req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.slice(name.length+1);}
  const challengeName='__Host-sgchallenge', sessionName='__Host-sgowner';
  const promptEmail=form('start','<label for="email">Owner email</label><input id="email" name="email" type="email" autocomplete="email" required>','Email a sign-in code');
  const promptCode=form('verify','<label for="code">Sign-in code</label><input id="code" name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{8}" required>','Sign in');
  app.use('/owner',express.urlencoded({extended:false,limit:'2kb'}),(req,res,next)=>{
    res.set({'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; img-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"});
    if(req.method==='POST' && req.headers.origin!==origin)return res.sendStatus(403);
    for(const m of [sessions,challenges])for(const [k,v] of m)if(v.until<=Date.now())m.delete(k);
    next();
  });
  const authed=req=>sessions.has(hash(key(req,sessionName)||''));
  function view(req,res,notice=''){
    if(!authed(req))return res.send(page('Owner sign-in',`<section class="narrow"><p>Sign in to manage the guest directory and see website performance.</p>${promptEmail}</section>`));
    const w=read(),ga='https://analytics.google.com/analytics/web/#/p552540827/reports/explorer?params=_u..nav%3Dmaui&amp;r=';
    const report=(name,desc,url)=>`<a class="report" href="${url}" target="_blank" rel="noopener noreferrer"><strong>${name} ↗</strong><small>${desc}</small></a>`;
    res.send(page('Property dashboard',`<p>Manage the guest directory and review how travelers find the hotel.</p>${notice}<div class="grid"><section><h2>Website performance</h2><p>Open a report and choose the dates you want to review. Use your authorized Google account.</p>
${report('Website traffic','Visits and traffic sources',ga+'lifecycle-traffic-acquisition-v2')}
${report('Booking clicks &amp; inquiries','Look for book_now and corporate_rate_inquiry.',ga+'all-events')}
${report('Google Search visibility','Search terms, impressions, clicks and top pages','https://search.google.com/search-console/performance/search-analytics?resource_id=https%3A%2F%2Fwww.syracusegrand.com%2F')}
<p class="note">A booking click means someone opened the booking engine. Check Vertical Booking for confirmed reservations and revenue.</p></section><section><h2>Guest Wi-Fi</h2><p>Update what guests see when they scan the directory QR. This does not change the hotel’s Wi-Fi system.</p>${form('wifi',fields.map((k,i)=>`<label for="${k}">${['Network name','Username','Password'][i]}</label><input id="${k}" name="${k}" value="${esc(w[k])}" maxlength="128" required autocomplete="off">`).join(''),'Save guest Wi-Fi')}<p><a href="/guest" target="_blank" rel="noopener">View guest directory ↗</a></p></section></div>${form('logout','','Sign out')}`));
  }
  app.get('/owner',(req,res)=>view(req,res));
  app.post('/owner/start',async(req,res)=>{
    const email=String(req.body.email||'').trim().toLowerCase();
    let id=crypto.randomBytes(24).toString('hex');
    if(hash(email)===owner){
      sends=sends.filter(t=>Date.now()-t<3600000);
      if(sends.length<6 && Date.now()-(sends.at(-1)||0)>60000){
        sends.push(Date.now());const code=String(crypto.randomInt(10000000,100000000));
        try{await sendCode(email,code);challenges.set(id,{value:hash(code),until:Date.now()+600000,tries:5});}
        catch{return res.status(503).send(page('Email unavailable','<p>The code could not be sent. Try again later.</p><a href="/owner">Back to sign-in</a>'));}
      } else if(challenges.has(key(req,challengeName))) id=key(req,challengeName);
    }
    res.cookie(challengeName,id,{...cookieOpts,maxAge:600000}).send(page('Check your inbox',`<section class="narrow"><p>If this address is authorized, use the code emailed to you. Codes expire in 10 minutes. Requests are limited to one per minute.</p>${promptCode}<p><a href="/owner">Start again</a></p></section>`));
  });
  app.post('/owner/verify',(req,res)=>{
    const id=key(req,challengeName),c=challenges.get(id);
    if(!c || c.tries--<=0 || hash(String(req.body.code||''))!==c.value)return res.status(401).send(page('Code not accepted',`<section class="narrow">${promptCode}<p><a href="/owner">Request another code</a></p></section>`));
    challenges.delete(id);const token=crypto.randomBytes(32).toString('hex'),maxAge=8*3600000;
    sessions.set(hash(token),{until:Date.now()+maxAge});res.clearCookie(challengeName,cookieOpts).cookie(sessionName,token,{...cookieOpts,maxAge}).redirect(303,'/owner');
  });
  app.post('/owner/logout',(req,res)=>{sessions.delete(hash(key(req,sessionName)||''));res.clearCookie(sessionName,cookieOpts).redirect(303,'/owner');});
  app.post('/owner/wifi',(req,res)=>{
    if(!authed(req))return res.sendStatus(401);
    if(!fields.every(k=>typeof req.body[k]==='string' && req.body[k].trim() && req.body[k].length<=128 && !/[\x00-\x1f\x7f]/.test(req.body[k])))return res.status(400).send(page('Check the Wi-Fi details','<p>Each field needs 1 to 128 characters.</p><a href="/owner">Back to editor</a>'));
    try{const tmp=file+'.tmp';fs.writeFileSync(tmp,JSON.stringify(Object.fromEntries(fields.map(k=>[k,req.body[k]]))),{mode:0o600});fs.renameSync(tmp,file);}
    catch{return res.status(503).send(page('Changes not saved','<p>Storage is unavailable. The guest directory has not been changed.</p><a href="/owner">Back to editor</a>'));}
    view(req,res,'<p class="ok" role="status">Saved. Guests will see these details when they open or refresh the directory.</p>');
  });
};
