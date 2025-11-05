const API = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', ()=>{
  const token = localStorage.getItem('token');
  if (token) {
    document.getElementById('loginBtn').style.display='none';
    document.getElementById('registerBtn').style.display='none';
    document.getElementById('dashboardBtn').style.display='inline-block';
    document.getElementById('logoutBtn').style.display='inline-block';
  }
  document.getElementById('loginBtn').addEventListener('click', ()=> location.href='login.html');
  document.getElementById('registerBtn').addEventListener('click', ()=> location.href='register.html');
  document.getElementById('dashboardBtn').addEventListener('click', ()=> location.href='my-applications.html');
  const logoutBtnElem = document.getElementById('logoutBtn');
  if (logoutBtnElem) {
    logoutBtnElem.addEventListener('click', () => {
      // Navigate to logout confirmation page. Actual clearing happens after user confirms.
      window.location.href = 'logout.html';
    });
  }
  loadJobs();
  // Filter UI removed — no client-side filters bound anymore
  // wire up search box to filter displayed jobs
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.querySelector('.search-bar .btn');
  // simple debounce helper
  function debounce(fn, wait){ let t; return (...args)=>{ clearTimeout(t); t = setTimeout(()=>fn(...args), wait); }; }
  function doSearch(){
    const q = (searchInput && searchInput.value) ? searchInput.value.trim().toLowerCase() : '';
    if (!q) { renderJobs(allJobs); return; }
    const filtered = allJobs.filter(j=>{
      const title = (j.title||'').toString().toLowerCase();
      const desc = (j.description||'').toString().toLowerCase();
      const comp = (j.company||'').toString().toLowerCase();
      const loc = (j.location||'').toString().toLowerCase();
      const skills = (j.skills||[]).map(s=>s.toString().toLowerCase());
      return title.includes(q) || desc.includes(q) || comp.includes(q) || loc.includes(q) || skills.some(s=>s.includes(q));
    });
    renderJobs(filtered);
  }
  const doSearchDebounced = debounce(doSearch, 220);
  if (searchInput) searchInput.addEventListener('input', doSearchDebounced);
  if (searchBtn) searchBtn.addEventListener('click', (e)=>{ e.preventDefault(); doSearch(); });
});

let allJobs = [];

function applyFiltersToJobs(filters){
  let filtered = allJobs.slice();

  // experience filter
  if (filters.experience) {
    filtered = filtered.filter(j => {
  const exp = (j.experience || j.level || '').toString().toLowerCase();
  return exp.includes(filters.experience.toString().toLowerCase());
    });
  }

  // salary filter (expects numeric salary or salaryMin/salaryMax)
  if (filters.salary) {
    filtered = filtered.filter(j => {
      const val = Number(j.salary || j.salaryMin || 0);
      if (!val) return false;
      if (filters.salary === 'lt50') return val < 50000;
      if (filters.salary === '50to100') return val >= 50000 && val <= 100000;
      if (filters.salary === 'gt100') return val > 100000;
      return true;
    });
  }

  // date posted filter (days) — requires j.postedAt or j.createdAt
  if (filters.dateDays) {
    const days = Number(filters.dateDays);
    const cutoff = Date.now() - days * 24*60*60*1000;
    filtered = filtered.filter(j => {
      const ts = j.postedAt ? new Date(j.postedAt).getTime() : (j.createdAt ? new Date(j.createdAt).getTime() : 0);
      return ts && ts >= cutoff;
    });
  }

  renderJobs(filtered);
}

function renderJobs(jobs){
  const container = document.getElementById('jobs');
  container.innerHTML = '';
  if (!jobs || jobs.length === 0) {
    container.innerHTML = '<div class="col-12"><p class="text-muted">No jobs found.</p></div>';
    return;
  }
  jobs.forEach((j, idx)=>{
    const col = document.createElement('div');
    col.className='col-md-4';
    const skillsHtml = (j.skills && j.skills.length)
      ? '<p class="mb-2">' + j.skills.slice(0,4).map(s => `<span class="badge bg-secondary me-1">${s}</span>`).join('') + '</p>'
      : '';
    col.innerHTML = `
      <div class="job-card p-3">
        <h5>${j.title}</h5>
        <p class="mb-2 text-muted">${(j.description||'').slice(0,120)}</p>
        ${skillsHtml}
        <div class="text-end mt-3"><a href="apply.html?job=${j._id}" class="btn btn-primary">Apply</a></div>
      </div>
    `;
    container.appendChild(col);
    const card = col.querySelector('.job-card');
    setTimeout(()=> card.classList.add('reveal'), idx * 100);
  });
}

async function loadJobs(){
  try {
    const res = await fetch(API + '/jobs');
    allJobs = await res.json();
    renderJobs(allJobs);
  } catch (err) { console.error(err); }
}
