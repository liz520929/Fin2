const defaultData = {
  income: 0,
  savingsGoal: 0,
  fixed: [
    {name:"貸款月付",amount:16067},{name:"汽車位租金",amount:3500},{name:"iCloud",amount:300},
    {name:"Spotify",amount:168},{name:"Coupang",amount:60},{name:"Uber 訂閱",amount:166},
    {name:"Foodpanda 訂閱",amount:89},{name:"手機月租",amount:499},{name:"狗狗美容",amount:2800},
    {name:"其他固定支出",amount:1200}
  ],
  living: [
    {name:"吃飯／飲料",amount:12000},{name:"交通／油錢／停車",amount:3000},
    {name:"Luna 飼料／用品／看診",amount:4000},{name:"日用品／醫療／保健",amount:2000},
    {name:"娛樂／購物／聚餐",amount:3000},{name:"臨時支出",amount:3000}
  ],
  debts: [
    {name:"貸款",balance:1194726,payment:16067,note:"每月固定繳款"},
    {name:"富邦信用卡",balance:62844,payment:0,note:"24號／9號"},
    {name:"大戶信用卡",balance:59,payment:0,note:"21號／5號"},
    {name:"中信信用卡",balance:597,payment:0,note:"7號／25號"},
    {name:"台新信用卡",balance:46428,payment:0,note:"17號／3號"}
  ],
  annual: [
    {name:"汽車保險",yearly:0},{name:"牌照稅／燃料費",yearly:0},{name:"汽車保養／維修",yearly:0},
    {name:"個人保險",yearly:0},{name:"Luna 疫苗／健檢／驅蟲",yearly:0},{name:"旅遊／過年／紅包",yearly:0}
  ],
  transactions: []
};
let data = loadData();
const $ = s => document.querySelector(s);
const money = n => new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(Number(n||0));
const sum = arr => arr.reduce((a,b)=>a+Number(b.amount||b.yearly||0),0);
function loadData(){try{return JSON.parse(localStorage.getItem("moneyLandData"))||structuredClone(defaultData)}catch{return structuredClone(defaultData)}}
function saveData(){localStorage.setItem("moneyLandData",JSON.stringify(data));render()}
function spentThisMonth(){
 const now=new Date(), y=now.getFullYear(), m=now.getMonth();
 return data.transactions.filter(t=>{const d=new Date(t.date);return d.getFullYear()===y&&d.getMonth()===m})
 .reduce((a,t)=>a+Number(t.amount),0)
}
function render(){
 const spent=spentThisMonth(), planned=sum(data.fixed)+sum(data.living), available=data.income-spent;
 $("#incomeText").textContent=money(data.income); $("#spentText").textContent=money(spent); $("#remainingText").textContent=money(available);
 const pct=data.income>0?Math.round(spent/data.income*100):0;
 $("#budgetPercent").textContent=pct+"%"; $("#budgetBar").style.width=Math.min(pct,100)+"%";
 $("#budgetBar").style.background=pct>90?"linear-gradient(90deg,#ffae6e,#ff5f79)":"linear-gradient(90deg,#ff9ebf,#a48cff)";
 $("#budgetNote").textContent=data.income===0?"先設定收入，就能開始營運樂園。":pct<70?`還有 ${money(available)} 可以使用`:(pct<100?"快接近預算囉，Luna 提醒你慢慢花 🐶":"本月已超出收入，先暫停購物設施 🚨");
 $("#heroMessage").textContent=data.income===0?"先設定本月收入，Luna 就能幫你顧預算 🐶":available>=0?`Luna 幫你守住了 ${money(available)} 🐶`:`本月超支 ${money(Math.abs(available))}，一起調整吧`;
 renderRecent();
}
function catIcon(c){return {"吃飯／飲料":"🍜","交通":"🚗","Luna":"🐶","日用品":"🧻","娛樂／購物":"🛍️","醫療／保健":"💊","固定支出":"🧾","其他":"🎟️"}[c]||"🎟️"}
function renderRecent(){
 const list=$("#recentList"), items=[...data.transactions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
 list.innerHTML=items.length?items.map(t=>`<div class="record-item"><div class="record-icon">${catIcon(t.category)}</div><div class="record-main"><b>${escapeHtml(t.item)}</b><small>${t.date} · ${escapeHtml(t.category)}</small></div><div class="record-amount">-${money(t.amount)}</div></div>`).join(""):`<div class="empty">還沒有記帳，先去搭第一趟旋轉木馬吧 🎠</div>`;
}
function escapeHtml(s=""){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function openModal(title,html,eyebrow="MONEY LAND"){ $("#modalTitle").textContent=title;$("#modalEyebrow").textContent=eyebrow;$("#modalBody").innerHTML=html;$("#modal").classList.remove("hidden")}
function closeModal(){ $("#modal").classList.add("hidden")}
function showAdd(){
 const tpl=$("#addTemplate").content.cloneNode(true); $("#modalTitle").textContent="新增記帳";$("#modalEyebrow").textContent="🎠 每日記帳";$("#modalBody").innerHTML="";$("#modalBody").appendChild(tpl);$("#modal").classList.remove("hidden");
 const form=$("#transactionForm"); form.date.value=new Date().toISOString().slice(0,10);
 form.addEventListener("submit",e=>{e.preventDefault();const f=new FormData(form);data.transactions.push(Object.fromEntries(f.entries()));saveData();closeModal();alert("記帳成功！樂園又多一張門票 🎉")})
}
function showBudget(){
 const rows=(arr,key)=>arr.map((x,i)=>`<div class="data-row"><span>${escapeHtml(x.name)}</span><input type="number" data-group="${key}" data-index="${i}" value="${x.amount}"></div>`).join("");
 openModal("預算摩天輪",`<div class="data-card"><label>本月收入<input id="incomeInput" type="number" value="${data.income}"></label><label>希望至少存下<input id="savingInput" type="number" value="${data.savingsGoal}"></label></div><h3>固定支出</h3><div class="data-card">${rows(data.fixed,"fixed")}</div><h3>生活費預算</h3><div class="data-card">${rows(data.living,"living")}</div><button id="saveBudget" class="primary-btn">儲存預算 🎡</button>`,"🎡 預算摩天輪");
 $("#saveBudget").onclick=()=>{data.income=Number($("#incomeInput").value||0);data.savingsGoal=Number($("#savingInput").value||0);document.querySelectorAll("[data-group]").forEach(el=>data[el.dataset.group][el.dataset.index].amount=Number(el.value||0));saveData();closeModal()}
}
function showDebts(){
 const html=data.debts.map((d,i)=>`<div class="data-card"><b>${escapeHtml(d.name)}</b><div class="data-row"><span>目前餘額</span><input type="number" data-debt-balance="${i}" value="${d.balance}"></div><div class="data-row"><span>每月繳款</span><input type="number" data-debt-payment="${i}" value="${d.payment}"></div><small>${escapeHtml(d.note||"")}</small></div>`).join("");
 openModal("債務雲霄飛車",html+`<button id="saveDebts" class="primary-btn">更新債務 🎢</button>`,"🎢 債務管理");
 $("#saveDebts").onclick=()=>{data.debts.forEach((d,i)=>{d.balance=Number(document.querySelector(`[data-debt-balance="${i}"]`).value||0);d.payment=Number(document.querySelector(`[data-debt-payment="${i}"]`).value||0)});saveData();closeModal()}
}
function showAnnual(){
 const html=data.annual.map((d,i)=>`<div class="data-card"><b>${escapeHtml(d.name)}</b><div class="data-row"><span>一年預估</span><input type="number" data-annual="${i}" value="${d.yearly}"></div><small>每月應預留：${money(d.yearly/12)}</small></div>`).join("");
 openModal("年度預備券",html+`<button id="saveAnnual" class="primary-btn">儲存預備金 🎟️</button>`,"🎟️ 年度支出");
 $("#saveAnnual").onclick=()=>{data.annual.forEach((d,i)=>d.yearly=Number(document.querySelector(`[data-annual="${i}"]`).value||0));saveData();closeModal()}
}
function showRecords(){
 const items=[...data.transactions].sort((a,b)=>b.date.localeCompare(a.date));
 openModal("全部明細",`<div class="record-list">${items.length?items.map((t,i)=>`<div class="record-item"><div class="record-icon">${catIcon(t.category)}</div><div class="record-main"><b>${escapeHtml(t.item)}</b><small>${t.date} · ${escapeHtml(t.category)} · ${escapeHtml(t.payment||"")}</small></div><div><div class="record-amount">-${money(t.amount)}</div><button class="text-btn delete-record" data-id="${data.transactions.indexOf(t)}">刪除</button></div></div>`).join(""):`<div class="empty">還沒有明細</div>`}</div><button id="exportBtn" class="secondary-btn">匯出 CSV</button>`,"🧾 記帳明細");
 document.querySelectorAll(".delete-record").forEach(b=>b.onclick=()=>{if(confirm("確定刪除這筆記帳？")){data.transactions.splice(Number(b.dataset.id),1);saveData();showRecords()}});
 $("#exportBtn").onclick=exportCSV;
}
function showSettings(){
 openModal("樂園設定",`<div class="data-card"><h3>資料儲存</h3><p>資料目前只保存在這台裝置的瀏覽器中。</p><button id="exportSettings" class="secondary-btn">匯出 CSV</button></div><div class="data-card"><h3>加入 iPhone 主畫面</h3><p>使用 Safari 開啟後，點「分享」→「加入主畫面」。</p></div><button id="wipeBtn" class="danger-btn">清除全部資料</button>`,"⚙️ 設定");
 $("#exportSettings").onclick=exportCSV; $("#wipeBtn").onclick=()=>{if(confirm("真的要清除全部資料嗎？")){data=structuredClone(defaultData);saveData();closeModal()}}
}
function exportCSV(){
 const head=["日期","分類","項目","金額","付款方式","備註"];
 const rows=data.transactions.map(t=>[t.date,t.category,t.item,t.amount,t.payment,t.note||""]);
 const csv="\ufeff"+[head,...rows].map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download="MoneyLand記帳.csv";a.click();URL.revokeObjectURL(a.href)
}
document.addEventListener("click",e=>{const v=e.target.closest("[data-view]")?.dataset.view;if(!v)return;if(v==="add")showAdd();if(v==="budget")showBudget();if(v==="debts")showDebts();if(v==="annual")showAnnual();if(v==="records")showRecords();if(v==="settings")showSettings()});
$("#closeModal").onclick=closeModal;$("#modal").onclick=e=>{if(e.target.id==="modal")closeModal()};$("#resetBtn").onclick=()=>{if(confirm("要把 App 恢復成最初範例資料嗎？")){data=structuredClone(defaultData);saveData()}};
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js"));
render();
