const STORAGE_KEY = "assetSystemV1Data";
const today = new Date();

const demoAssets = [
  {
    id: crypto.randomUUID(), code:"AST-0001", name:"เครื่องปรับอากาศ Daikin", category:"เครื่องใช้ไฟฟ้า",
    purchaseDate:"2026-07-15", price:32500, serial:"DK-FTKF24-001", brandModel:"Daikin FTKF24",
    vendor:"บริษัท ABC จำกัด", location:"Lobby ชั้น 1", owner:"Engineering", status:"ใช้งานปกติ",
    hasWarranty:true, warrantyStart:"2026-07-15", warrantyEnd:"2029-07-15", notes:"ติดตั้งพร้อมเดินระบบ",
    image:""
  },
  {
    id: crypto.randomUUID(), code:"AST-0002", name:"คอมพิวเตอร์ POS", category:"IT / Computer",
    purchaseDate:"2024-08-02", price:28900, serial:"POS-A01923", brandModel:"Lenovo ThinkCentre",
    vendor:"IT Solution", location:"Cashier", owner:"Front Office", status:"ใช้งานปกติ",
    hasWarranty:true, warrantyStart:"2024-08-02", warrantyEnd:"2026-08-18", notes:"",
    image:""
  },
  {
    id: crypto.randomUUID(), code:"AST-0003", name:"ตู้เย็น 2 ประตู", category:"อุปกรณ์ครัว",
    purchaseDate:"2023-05-10", price:45900, serial:"RF-223019", brandModel:"Samsung RT53",
    vendor:"HomePro", location:"Main Kitchen", owner:"Kitchen", status:"ใช้งานปกติ",
    hasWarranty:true, warrantyStart:"2023-05-10", warrantyEnd:"2025-05-10", notes:"หมดประกันแล้ว",
    image:""
  },
  {
    id: crypto.randomUUID(), code:"AST-0004", name:"โทรทัศน์ 55 นิ้ว", category:"เครื่องใช้ไฟฟ้า",
    purchaseDate:"2026-03-12", price:21900, serial:"TV55-LG-771", brandModel:"LG UHD 55",
    vendor:"Power Buy", location:"Meeting Room", owner:"Administration", status:"ใช้งานปกติ",
    hasWarranty:true, warrantyStart:"2026-03-12", warrantyEnd:"2028-03-12", notes:"",
    image:""
  }
];

let assets = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || demoAssets;
let selectedId = null;
let currentImageData = "";

const $ = (id) => document.getElementById(id);
const views = {
  dashboard: $("dashboardView"),
  assets: $("assetsView"),
  add: $("addView"),
  warranty: $("warrantyView")
};

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(assets)); }

function fmtMoney(v){ return new Intl.NumberFormat("th-TH",{style:"currency",currency:"THB",maximumFractionDigits:0}).format(v||0); }
function fmtDate(v){ if(!v) return "-"; return new Date(v+"T00:00:00").toLocaleDateString("th-TH",{year:"numeric",month:"short",day:"numeric"}); }

function warrantyState(asset){
  if(!asset.hasWarranty || !asset.warrantyEnd) return {key:"none",label:"ไม่มีประกัน",days:null};
  const end = new Date(asset.warrantyEnd+"T23:59:59");
  const diff = Math.ceil((end - today)/(1000*60*60*24));
  if(diff < 0) return {key:"expired",label:"หมดประกันแล้ว",days:diff};
  if(diff <= 90) return {key:"expiring",label:`เหลือ ${diff} วัน`,days:diff};
  return {key:"active",label:"อยู่ในประกัน",days:diff};
}

function badgeForWarranty(asset){
  const w = warrantyState(asset);
  if(w.key==="expired") return `<span class="badge danger">🔴 ${w.label}</span>`;
  if(w.key==="expiring") return `<span class="badge warning">🟠 ${w.label}</span>`;
  if(w.key==="active") return `<span class="badge success">🟢 ${w.label}</span>`;
  return `<span class="badge">ไม่มีประกัน</span>`;
}

function assetCard(asset, compact=false){
  const thumb = asset.image ? `<img class="asset-thumb" src="${asset.image}" alt="">` : `<div class="asset-thumb">🏢</div>`;
  return `
    <div class="asset-card">
      ${thumb}
      <div class="asset-main">
        <h4>${escapeHtml(asset.name)}</h4>
        <div class="asset-meta">
          <span>${escapeHtml(asset.code)}</span>
          <span>${escapeHtml(asset.location||"-")}</span>
          <span>${fmtMoney(asset.price)}</span>
        </div>
        <div style="margin-top:7px">${badgeForWarranty(asset)}</div>
      </div>
      <div class="asset-actions">
        <button class="secondary" onclick="openDetail('${asset.id}')">ดูรายละเอียด</button>
      </div>
    </div>`;
}

function escapeHtml(v=""){ return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }

function renderDashboard(){
  $("statTotal").textContent = assets.length;
  $("statValue").textContent = fmtMoney(assets.reduce((s,a)=>s+Number(a.price||0),0));
  $("statExpiring").textContent = assets.filter(a=>warrantyState(a).key==="expiring").length;
  $("statExpired").textContent = assets.filter(a=>warrantyState(a).key==="expired").length;

  const recent = [...assets].sort((a,b)=>new Date(b.purchaseDate)-new Date(a.purchaseDate)).slice(0,5);
  $("recentAssets").innerHTML = recent.length ? recent.map(a=>assetCard(a,true)).join("") : emptyHtml("ยังไม่มีทรัพย์สิน");

  const alerts = assets.filter(a=>["expired","expiring"].includes(warrantyState(a).key))
    .sort((a,b)=>(warrantyState(a).days??99999)-(warrantyState(b).days??99999)).slice(0,6);
  $("warrantyAlerts").innerHTML = alerts.length ? alerts.map(a=>{
    const w=warrantyState(a);
    return `<div class="alert-item ${w.key==="expired"?"danger":""}">
      <strong>${escapeHtml(a.name)}</strong>
      <span>${escapeHtml(a.code)} · หมดประกัน ${fmtDate(a.warrantyEnd)} · ${w.label}</span>
    </div>`;
  }).join("") : emptyHtml("ไม่มีรายการต้องติดตาม");
}

function renderAssets(){
  const q = $("searchInput").value.trim().toLowerCase();
  const cat = $("categoryFilter").value;
  const st = $("statusFilter").value;
  const filtered = assets.filter(a=>{
    const hay = [a.name,a.code,a.serial,a.location,a.owner,a.brandModel].join(" ").toLowerCase();
    return (!q || hay.includes(q)) && (!cat || a.category===cat) && (!st || a.status===st);
  });
  $("assetsList").innerHTML = filtered.length ? filtered.map(a=>assetCard(a)).join("") : emptyHtml("ไม่พบข้อมูลที่ค้นหา");
}

function renderCategories(){
  const current = $("categoryFilter").value;
  const cats = [...new Set(assets.map(a=>a.category).filter(Boolean))].sort();
  $("categoryFilter").innerHTML = `<option value="">ทุกหมวดหมู่</option>` + cats.map(c=>`<option ${c===current?"selected":""}>${escapeHtml(c)}</option>`).join("");
}

function renderWarranty(){
  const expired = assets.filter(a=>warrantyState(a).key==="expired");
  const expiring = assets.filter(a=>warrantyState(a).key==="expiring").sort((a,b)=>warrantyState(a).days-warrantyState(b).days);
  const active = assets.filter(a=>warrantyState(a).key==="active").sort((a,b)=>warrantyState(a).days-warrantyState(b).days);
  $("expiredList").innerHTML = expired.length ? expired.map(a=>assetCard(a,true)).join("") : emptyHtml("ไม่มีรายการ");
  $("expiringList").innerHTML = expiring.length ? expiring.map(a=>assetCard(a,true)).join("") : emptyHtml("ไม่มีรายการ");
  $("activeWarrantyList").innerHTML = active.length ? active.map(a=>assetCard(a,true)).join("") : emptyHtml("ไม่มีรายการ");
}

function renderAll(){
  renderCategories(); renderDashboard(); renderAssets(); renderWarranty();
}

function emptyHtml(msg){ return `<div class="empty">${msg}</div>`; }

function showView(name){
  Object.entries(views).forEach(([k,v])=>v.classList.toggle("active",k===name));
  document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  const titles = {
    dashboard:["Dashboard","ภาพรวมทะเบียนทรัพย์สิน"],
    assets:["ทรัพย์สินทั้งหมด","ค้นหาและดูรายละเอียดทรัพย์สิน"],
    add:["เพิ่มทรัพย์สิน","บันทึกข้อมูลทรัพย์สินใหม่"],
    warranty:["ติดตามประกัน","รายการประกันที่ควรติดตาม"]
  };
  $("pageTitle").textContent=titles[name][0]; $("pageSubtitle").textContent=titles[name][1];
  $("sidebar").classList.remove("open");
  if(name==="assets") renderAssets();
  if(name==="warranty") renderWarranty();
}

document.querySelectorAll("[data-view],[data-view-jump]").forEach(el=>{
  el.addEventListener("click",()=>showView(el.dataset.view || el.dataset.viewJump));
});
$("menuBtn").onclick=()=> $("sidebar").classList.toggle("open");
$("searchInput").addEventListener("input",renderAssets);
$("categoryFilter").addEventListener("change",renderAssets);
$("statusFilter").addEventListener("change",renderAssets);

$("hasWarranty").addEventListener("change",()=>{
  $("warrantyFields").style.opacity = $("hasWarranty").checked ? "1" : ".45";
  $("warrantyFields").querySelectorAll("input").forEach(i=>i.disabled=!$("hasWarranty").checked);
});
$("hasWarranty").dispatchEvent(new Event("change"));

$("image").addEventListener("change", async e=>{
  const file=e.target.files?.[0];
  if(!file) return;
  currentImageData = await compressImage(file, 1200, .78);
  $("imagePreview").src=currentImageData;
  $("imagePreviewWrap").classList.remove("hidden");
});
$("removeImageBtn").onclick=()=>{
  currentImageData=""; $("image").value=""; $("imagePreviewWrap").classList.add("hidden");
};

async function compressImage(file,maxW=1200,quality=.78){
  const data=await fileToDataUrl(file);
  const img=await loadImg(data);
  const scale=Math.min(1,maxW/img.width);
  const canvas=document.createElement("canvas");
  canvas.width=Math.round(img.width*scale); canvas.height=Math.round(img.height*scale);
  canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
  return canvas.toDataURL("image/jpeg",quality);
}
const fileToDataUrl=file=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)});
const loadImg=src=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src});

$("assetForm").addEventListener("submit",e=>{
  e.preventDefault();
  const editId=$("editId").value;
  const item={
    id:editId||crypto.randomUUID(),
    code:$("assetCode").value.trim(),
    name:$("assetName").value.trim(),
    category:$("category").value.trim(),
    purchaseDate:$("purchaseDate").value,
    price:Number($("price").value||0),
    serial:$("serialNumber").value.trim(),
    brandModel:$("brandModel").value.trim(),
    vendor:$("vendor").value.trim(),
    location:$("location").value.trim(),
    owner:$("owner").value.trim(),
    status:$("status").value,
    image:currentImageData,
    hasWarranty:$("hasWarranty").checked,
    warrantyStart:$("hasWarranty").checked ? $("warrantyStart").value : "",
    warrantyEnd:$("hasWarranty").checked ? $("warrantyEnd").value : "",
    notes:$("notes").value.trim()
  };
  if(editId){
    const idx=assets.findIndex(a=>a.id===editId);
    assets[idx]=item;
  }else assets.unshift(item);
  save(); resetForm(); renderAll(); showView("assets");
});

function resetForm(){
  $("assetForm").reset(); $("editId").value=""; currentImageData="";
  $("imagePreviewWrap").classList.add("hidden"); $("formHeading").textContent="เพิ่มทรัพย์สินใหม่";
  $("hasWarranty").dispatchEvent(new Event("change"));
}
$("resetFormBtn").onclick=resetForm;

window.openDetail=function(id){
  selectedId=id;
  const a=assets.find(x=>x.id===id); if(!a) return;
  $("detailCode").textContent=a.code; $("detailName").textContent=a.name;
  $("detailContent").innerHTML=`
    <div class="detail-grid">
      ${a.image?`<img src="${a.image}" alt="">`:`<div class="asset-thumb" style="width:100%;height:180px">🏢</div>`}
      <div class="detail-table">
        <span>หมวดหมู่</span><strong>${escapeHtml(a.category||"-")}</strong>
        <span>วันที่รับเข้า</span><strong>${fmtDate(a.purchaseDate)}</strong>
        <span>ราคาซื้อ</span><strong>${fmtMoney(a.price)}</strong>
        <span>ยี่ห้อ / รุ่น</span><strong>${escapeHtml(a.brandModel||"-")}</strong>
        <span>Serial</span><strong>${escapeHtml(a.serial||"-")}</strong>
        <span>สถานที่</span><strong>${escapeHtml(a.location||"-")}</strong>
        <span>ผู้รับผิดชอบ</span><strong>${escapeHtml(a.owner||"-")}</strong>
        <span>สถานะ</span><strong>${escapeHtml(a.status||"-")}</strong>
        <span>ประกัน</span><strong>${warrantyState(a).label}</strong>
        <span>หมดประกัน</span><strong>${fmtDate(a.warrantyEnd)}</strong>
        <span>หมายเหตุ</span><strong>${escapeHtml(a.notes||"-")}</strong>
      </div>
    </div>`;
  $("detailDialog").showModal();
}
$("closeDialog").onclick=()=> $("detailDialog").close();

$("editAssetBtn").onclick=()=>{
  const a=assets.find(x=>x.id===selectedId); if(!a) return;
  $("detailDialog").close(); showView("add"); $("formHeading").textContent="แก้ไขทรัพย์สิน";
  $("editId").value=a.id; $("assetCode").value=a.code; $("assetName").value=a.name; $("category").value=a.category;
  $("purchaseDate").value=a.purchaseDate; $("price").value=a.price; $("serialNumber").value=a.serial||"";
  $("brandModel").value=a.brandModel||""; $("vendor").value=a.vendor||""; $("location").value=a.location||"";
  $("owner").value=a.owner||""; $("status").value=a.status||"ใช้งานปกติ"; $("hasWarranty").checked=!!a.hasWarranty;
  $("warrantyStart").value=a.warrantyStart||""; $("warrantyEnd").value=a.warrantyEnd||""; $("notes").value=a.notes||"";
  currentImageData=a.image||"";
  if(currentImageData){$("imagePreview").src=currentImageData;$("imagePreviewWrap").classList.remove("hidden")}else $("imagePreviewWrap").classList.add("hidden");
  $("hasWarranty").dispatchEvent(new Event("change"));
}

$("deleteAssetBtn").onclick=()=>{
  if(!selectedId) return;
  if(confirm("ยืนยันลบทรัพย์สินรายการนี้?")){
    assets=assets.filter(a=>a.id!==selectedId); save(); $("detailDialog").close(); renderAll();
  }
}

$("exportBtn").onclick=()=>{
  const blob=new Blob([JSON.stringify(assets,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob); const a=document.createElement("a");
  a.href=url;a.download=`asset-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);
}

renderAll();
