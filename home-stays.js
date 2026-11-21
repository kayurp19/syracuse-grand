(() => {
  const byId = id => document.getElementById(id);
  const checkIn = byId('stay-in'), checkOut = byId('stay-out'), guests = byId('stay-guests');
  const link = byId('check-rates'), base = link.href, picker = document.querySelector('.stay-picker');
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit' }).format(new Date());
  const nextDay = value => new Date(Date.parse(value) + 86400000).toISOString().slice(0,10);
  function syncDates(start, end, auto) {
    start.min = today;
    end.min = start.value ? nextDay(start.value) : nextDay(today);
    if (auto && start.value && (!end.value || end.value < end.min)) end.value = end.min;
  }
  checkIn.value = today; checkOut.value = nextDay(today);
  function update() {
    syncDates(checkIn,checkOut,false);
    if (!checkIn.checkValidity() || !checkOut.checkValidity()) {link.href=base;return;}
    const [aa,mm,gg]=checkIn.value.split('-').map(Number), [aaf,mmf,ggf]=checkOut.value.split('-').map(Number);
    const notti=(Date.parse(checkOut.value)-Date.parse(checkIn.value))/86400000;
    const url = new URL(base); url.pathname='/premium/index2.html';
    Object.entries({aa,mm,gg,aaf,mmf,ggf,notti,notti_1:notti,tot_camere:1,tot_bambini:0,tot_adulti:guests.value,adulti1:guests.value}).forEach(([k,v])=>url.searchParams.set(k,v));
    link.href = url.href;
  }
  checkIn.addEventListener('input',()=>{syncDates(checkIn,checkOut,true);update()});
  checkOut.addEventListener('input',update);guests.addEventListener('change',update);
  link.addEventListener('click',e=>{
    const invalid=[checkIn,checkOut].find(el=>!el.validity.valid);
    if(invalid){e.preventDefault();e.stopPropagation();picker.open=true;invalid.reportValidity();}
  });
  picker.hidden=false;update();
  const corp=byId('corporateForm').elements;
  syncDates(corp.checkin,corp.checkout,false);
  corp.checkin.addEventListener('input',()=>syncDates(corp.checkin,corp.checkout,false));
})();
