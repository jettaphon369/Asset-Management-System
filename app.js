const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const titles={dashboard:"แดชบอร์ด",assets:"ทรัพย์สิน",counts:"การตรวจนับ",events:"ชำรุด / ซ่อม / PM",reminders:"การแจ้งเตือน",writeoff:"Write-off",reports:"รายงาน",profile:"โปรไฟล์"};
function show(v){$$(".view").forEach(x=>x.classList.remove("active"));$("#"+v).classList.add("active");$("#title").textContent=titles[v]||v;closeMenu()}
$$("[data-view]").forEach(b=>b.addEventListener("click",()=>show(b.dataset.view)));
$("#menuBtn").onclick=()=>{$("#sidebar").classList.add("open");$("#overlay").classList.add("show")};
$("#overlay").onclick=closeMenu;function closeMenu(){$("#sidebar").classList.remove("open");$("#overlay").classList.remove("show")}
$("#quick").onclick=()=>$("#quickDlg").showModal();$("#closeQuick").onclick=()=>$("#quickDlg").close();

function applyHero(){const h=new Date().getHours();let src,g;if(h>=6&&h<9.5){src="hero-morning.jpeg";g="สวัสดีตอนเช้า"}else if(h>=9.5&&h<17.5){src="hero-day.jpeg";g="ยินดีต้อนรับ"}else if(h>=17.5&&h<19){src="hero-evening.jpeg";g="สวัสดีตอนเย็น"}else{src="hero-night.jpeg";g="สวัสดีครับ"}const i=document.getElementById("heroImg"),t=document.getElementById("greeting");if(i)i.src=src;if(t)t.textContent=g}applyHero();



const filterDlg=document.getElementById("filterDlg");
const filterBtn=document.getElementById("filterBtn");
const closeFilter=document.getElementById("closeFilter");
const filterForm=document.getElementById("filterForm");
const resetFilter=document.getElementById("resetFilter");
if(filterBtn&&filterDlg) filterBtn.addEventListener("click",()=>filterDlg.showModal());
if(closeFilter&&filterDlg) closeFilter.addEventListener("click",()=>filterDlg.close());
if(filterDlg) filterDlg.addEventListener("click",e=>{if(e.target===filterDlg) filterDlg.close()});
if(filterForm) filterForm.addEventListener("submit",e=>{
  e.preventDefault();
  const outlet=document.getElementById("filterOutlet").value;
  const period=document.getElementById("filterPeriod").value;
  const heading=document.querySelector(".overviewTitle");
  if(heading) heading.textContent=`ภาพรวมวันนี้ · ${outlet} · ${period}`;
  filterDlg.close();
});
if(resetFilter) resetFilter.addEventListener("click",()=>{
  document.getElementById("filterOutlet").selectedIndex=0;
  document.getElementById("filterPeriod").selectedIndex=0;
  document.getElementById("filterFrom").value="";
  document.getElementById("filterTo").value="";
  const heading=document.querySelector(".overviewTitle");
  if(heading) heading.textContent="ภาพรวมวันนี้";
});
