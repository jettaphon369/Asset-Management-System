const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const titles={dashboard:"แดชบอร์ด",assets:"ทรัพย์สิน",counts:"การตรวจนับ",events:"ชำรุด / ซ่อม / PM",reminders:"การแจ้งเตือน",writeoff:"Write-off",reports:"รายงาน",profile:"โปรไฟล์"};
function show(v){$$(".view").forEach(x=>x.classList.remove("active"));$("#"+v).classList.add("active");$("#title").textContent=titles[v]||v;closeMenu()}
$$("[data-view]").forEach(b=>b.addEventListener("click",()=>show(b.dataset.view)));
$("#menuBtn").onclick=()=>{$("#sidebar").classList.add("open");$("#overlay").classList.add("show")};
$("#overlay").onclick=closeMenu;function closeMenu(){$("#sidebar").classList.remove("open");$("#overlay").classList.remove("show")}
$("#quick").onclick=()=>$("#quickDlg").showModal();$("#closeQuick").onclick=()=>$("#quickDlg").close();
