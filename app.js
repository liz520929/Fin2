const defaultData={
 income:0,savingsGoal:0,coins:0,tickets:0,
 fixed:[{name:"貸款月付",amount:16067},{name:"汽車位租金",amount:3500},{name:"iCloud",amount:300},{name:"Spotify",amount:168},{name:"Coupang",amount:60},{name:"Uber 訂閱",amount:166},{name:"Foodpanda 訂閱",amount:89},{name:"手機月租",amount:499},{name:"狗狗美容",amount:2800},{name:"其他固定支出",amount:1200}],
 living:[{name:"吃飯／飲料",amount:12000},{name:"交通／油錢／停車",amount:3000},{name:"Luna 飼料／用品／看診",amount:4000},{name:"日用品／醫療／保健",amount:2000},{name:"娛樂／購物／聚餐",amount:3000},{name:"臨時支出",amount:3000}],
 debts:[{name:"貸款",balance:1194726,payment:16067},{name:"富邦信用卡",balance:62844,payment:0},{name:"大戶信用卡",balance:59,payment:0},{name:"中信信用卡",balance:597,payment:0},{name:"台新信用卡",balance:46428,payment:0}],
 annual:[{name:"汽車保險",yearly:0},{name:"牌照稅／燃料費",yearly:0},{name:"汽車保養／維修",yearly:0},{name:"個人保險",yearly:0},{name:"Luna 疫苗／健檢／驅蟲",yearly:0},{name:"旅遊／紅包",yearly:0}],
 transactions:[]
};
let data=load();
const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(Number(n||0));
const sum=a=>a.reduce((x,y)=>x+Number(y.amount||y.yearly||0),0);
function load(){try{return JSON.parse(localStorage.getItem("moneyLandGame"))||structuredClone(defaultData)}catch{return structuredClone(defaultData)}}
function save(){localStorage.setItem("moneyLandGame",JSON.stringify(data));render()}
function monthly(){const d=new Date();return data.transactions.filter(t=>{const x=new Date(t.date);return x.getFullYear()==d.getFullYear()&&x.getMonth()==d.getMonth()})}
function spent(){return monthly().reduce((a,b)=>a+Number(b.amount),0)}
function level(){return Math.floor(data.coins/100)+1}
function render(){
 $("#coinCount").textContent=data.coins;$("#ticketCount").textContent=data.tickets;$("#level").textContent=level();
 const count=monthly().length,p=Math.min(count/3*100,100);$("#questBar").style.width=p+"%";
 $("#questTitle").textContent=count>=3?"今日記帳任務完成！":"完成 3 筆本月記帳";
 $("#questReward").textContent=count>=3?"已完成 ✅":`${count}/3　+20 🪙`;
 $("#guideText").textContent=data.income===0?"先去財富城堡設定收入吧！":spent()>data.income?"園長警報！本月已超支 🚨":monthly().length===0?"搭旋轉木馬，記下今天第一筆消費吧！":"樂園運作正常，繼續保持！";
}
function open(title,html,eye="MONEY LAND"){ $("#panelTitle").textContent=title;$("#panelEyebrow").textContent=eye;$("#panelBody").innerHTML=html;$("#modal").classList.remove("hidden")}
function close(){ $("#modal").classList.add("hidden")}
function icon(c){return {"吃飯／飲料":"🍜","交通":"🚗","Luna":"🐶","日用品":"🧻","娛樂／購物":"🛍️","醫療／保健":"💊","固定支出":"🧾","其他":"🎟️"}[c]||"🎟️"}
function showSummary(){
 const s=spent(),remain=data.income-s,budget=sum(data.fixed)+sum(data.living);
 open("財富城堡",`<div class="stat-grid"><div class="stat"><small>本月收入</small><strong>${money(data.income)}</strong></div><div class="stat"><small>已使用</small><strong>${money(s)}</strong></div><div class="stat full"><small>還可以使用</small><strong>${money(remain)}</strong></div></div><div class="card"><b>樂園營運狀態</b><p>${data.income===0?"尚未設定收入":remain>=0?"目前仍在預算內 🎉":"已超支，建議先暫停購物設施 🚨"}</p><small>目前規劃固定＋生活預算：${money(budget)}</small></div>`,`🏰 財富城堡`)
}
function showAdd(){
 open("記帳旋轉木馬",`<form id="addForm"><div class="card"><label>金額<input name="amount" type="number" min="1" required placeholder="0"></label></div><div class="card"><label>分類<select name="category"><option>吃飯／飲料</option><option>交通</option><option>Luna</option><option>日用品</option><option>娛樂／購物</option><option>醫療／保健</option><option>固定支出</option><option>其他</option></select></label><label>項目<input name="item" required placeholder="例如：午餐"></label><label>日期<input name="date" type="date" required></label></div><button class="primary">完成記帳，搭乘一次 🎠</button></form>`,`🎠 記帳旋轉木馬`);
 const f=$("#addForm");f.date.value=new Date().toISOString().slice(0,10);f.onsubmit=e=>{e.preventDefault();const before=monthly().length;const v=Object.fromEntries(new FormData(f));data.transactions.push(v);data.coins+=5;data.tickets+=1;if(before<3&&before+1>=3)data.coins+=20;save();close();alert("記帳成功！獲得 5 金幣與 1 張門票 🎉")}
}
function showBudget(){
 const r=(a,g)=>a.map((x,i)=>`<div class="row"><span>${x.name}</span><input type="number" data-g="${g}" data-i="${i}" value="${x.amount}"></div>`).join("");
 open("預算摩天輪",`<div class="card"><label>本月收入<input id="income" type="number" value="${data.income}"></label><label>希望存下<input id="saving" type="number" value="${data.savingsGoal}"></label></div><div class="card"><b>固定支出</b>${r(data.fixed,"fixed")}</div><div class="card"><b>生活費</b>${r(data.living,"living")}</div><button id="saveBudget" class="primary">啟動摩天輪 🎡</button>`,`🎡 預算摩天輪`);
 $("#saveBudget").onclick=()=>{data.income=Number($("#income").value||0);data.savingsGoal=Number($("#saving").value||0);document.querySelectorAll("[data-g]").forEach(x=>data[x.dataset.g][x.dataset.i].amount=Number(x.value||0));data.coins+=10;save();close()}
}
function showDebts(){
 open("債務雲霄飛車",data.debts.map((d,i)=>`<div class="card"><b>${d.name}</b><div class="row"><span>目前餘額</span><input data-db="${i}" value="${d.balance}" type="number"></div><div class="row"><span>每月繳款</span><input data-dp="${i}" value="${d.payment}" type="number"></div></div>`).join("")+`<button id="saveDebt" class="primary">更新軌道 🎢</button>`,`🎢 債務雲霄飛車`);
 $("#saveDebt").onclick=()=>{data.debts.forEach((d,i)=>{d.balance=Number(document.querySelector(`[data-db="${i}"]`).value||0);d.payment=Number(document.querySelector(`[data-dp="${i}"]`).value||0)});save();close()}
}
function showAnnual(){
 open("年度預備站",data.annual.map((d,i)=>`<div class="card"><b>${d.name}</b><div class="row"><span>一年預估</span><input data-an="${i}" type="number" value="${d.yearly}"></div><small>每月預留 ${money(d.yearly/12)}</small></div>`).join("")+`<button id="saveAnnual" class="primary">儲存預備券 🎟️</button>`,`🎟️ 年度預備站`);
 $("#saveAnnual").onclick=()=>{data.annual.forEach((d,i)=>d.yearly=Number(document.querySelector(`[data-an="${i}"]`).value||0));save();close()}
}
function showRecords(filter=""){
 const list=[...data.transactions].filter(t=>!filter||t.category===filter).sort((a,b)=>b.date.localeCompare(a.date));
 open(filter?`${filter}明細`:"消費商店街",`<div class="card">${list.length?list.map(t=>`<div class="record"><div class="ico">${icon(t.category)}</div><div class="main"><b>${t.item}</b><small>${t.date} · ${t.category}</small></div><strong>-${money(t.amount)}</strong></div>`).join(""):`<div class="empty">目前還沒有記帳資料</div>`}</div><button id="export" class="secondary">匯出 CSV</button>`,filter?"🐶 Luna 寵物島":"🏪 消費商店街");$("#export").onclick=exportCSV
}
function showSettings(){open("園區設定",`<div class="card"><b>資料儲存</b><p>資料只保存在目前裝置的瀏覽器。</p></div><button id="wipe" class="danger">清除全部遊戲資料</button>`,`⚙️ 設定`);$("#wipe").onclick=()=>{if(confirm("確定清除全部資料？")){data=structuredClone(defaultData);save();close()}}}
function exportCSV(){const h=["日期","分類","項目","金額"];const rows=data.transactions.map(t=>[t.date,t.category,t.item,t.amount]);const csv="\ufeff"+[h,...rows].map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="MoneyLand記帳.csv";a.click()}
document.addEventListener("click",e=>{const v=e.target.closest("[data-view]")?.dataset.view;if(!v)return;({summary:showSummary,add:showAdd,budget:showBudget,debts:showDebts,annual:showAnnual,records:()=>showRecords(),luna:()=>showRecords("Luna"),settings:showSettings}[v]||(()=>{}))()});
$("#closeModal").onclick=close;$("#modal").onclick=e=>{if(e.target.id==="modal")close()};
if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("./sw.js"));
render();
