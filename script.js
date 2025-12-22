
const toggle=document.getElementById('themeToggle');
toggle.onclick=()=>{
 document.body.classList.toggle('dark');
 document.body.classList.toggle('light');
};

const zones={
 'Delhi':'Asia/Kolkata',
 'Karachi':'Asia/Karachi',
 'Dhaka':'Asia/Dhaka',
 'Colombo':'Asia/Colombo'
};
function updateTimes(){
 const el=document.getElementById('times');
 el.innerHTML=Object.entries(zones).map(([c,z])=>{
  return c+': '+new Date().toLocaleTimeString('en-US',{timeZone:z,hour:'2-digit',minute:'2-digit'});
 }).join(' | ');
}
setInterval(updateTimes,1000);
updateTimes();

fetch('output_events.json')
 .then(r=>r.json())
 .then(data=>{
  const n=document.getElementById('news');
  data.forEach(e=>{
    const d=document.createElement('div');
    d.className='news-card';
    d.innerHTML=`<h4>${e.title}</h4><p>${e.summary||''}</p>`;
    n.appendChild(d);
  });
 });
