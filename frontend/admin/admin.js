const API_BASE = "http://localhost:8001/api/v1";

function authHeader() {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchUsers() {
  const res = await fetch(`${API_BASE}/admin/users`, { headers: authHeader() });
  if (!res.ok) throw new Error("Failed to load users");
  return res.json();
}

async function fetchPendingClaims() {
  const res = await fetch(`${API_BASE}/admin/claims/pending`, { headers: authHeader() });
  if (!res.ok) throw new Error("Failed to load claims");
  return res.json();
}

async function approveClaim(id) {
  const res = await fetch(`${API_BASE}/admin/claims/${id}/approve`, { method: "POST", headers: authHeader() });
  if (!res.ok) throw new Error("Approve failed");
  return res.json();
}

async function rejectClaim(id) {
  const res = await fetch(`${API_BASE}/admin/claims/${id}/reject`, { method: "POST", headers: authHeader() });
  if (!res.ok) throw new Error("Reject failed");
  return res.json();
}

document.addEventListener("DOMContentLoaded", async () => {
  const usersDiv = document.getElementById("usersDiv");
  const claimsDiv = document.getElementById("claimsDiv");
  const adminStats = document.getElementById("adminStats");
  const adminMonthly = document.getElementById("adminMonthly");
  const adminStatus = document.getElementById("adminStatus");
  if (usersDiv) {
    try {
      const users = await fetchUsers();
      function renderUsers(query=''){
        const q = query.toLowerCase();
        let html = "<table style='width:100%'><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Patient ID</th><th>Action</th></tr></thead><tbody>";
        users.filter(u => (u.name||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q)).forEach(u => {
          html += `<tr><td>${u.name || ''}</td><td>${u.email || ''}</td><td>${u.role}</td><td>${u.patient_id || ''}</td><td><button class='delete-user' data-id='${u.user_id}'>Delete</button></td></tr>`;
        });
        html += "</tbody></table>";
        usersDiv.innerHTML = html;
      }
      renderUsers('');
      const search = document.getElementById('userSearch');
      if (search) search.addEventListener('input', e=> renderUsers(e.target.value));
    } catch (e) {
      usersDiv.textContent = "Failed to load users";
    }
  }
  if (claimsDiv) {
    try {
      const claims = await fetchPendingClaims();
      function renderClaims(query=''){
        const q = query.toLowerCase();
        let html = "<table style='width:100%'><thead><tr><th>ID</th><th>Description</th><th>Amount</th><th>Status</th><th>Document</th><th>Action</th></tr></thead><tbody>";
        claims.filter(c=> (c.description||'').toLowerCase().includes(q) || (c.claim_id||'').toLowerCase().includes(q)).forEach(c => {
          html += `<tr><td>${c.claim_id}</td><td>${c.description}</td><td>₹${c.amount}</td><td>${c.claim_status}</td><td>${c.s3_upload_url?`<a href='${c.s3_upload_url}' target='_blank'>View</a>`:'-'}</td>
            <td>
              <button data-id='${c.claim_id}' class='approve'>Approve</button>
              <button data-id='${c.claim_id}' class='reject'>Reject</button>
            </td></tr>`;
        });
        html += "</tbody></table>";
        claimsDiv.innerHTML = html;
      }
      renderClaims('');
      const csearch = document.getElementById('claimsSearch');
      if (csearch) csearch.addEventListener('input', e=> renderClaims(e.target.value));
      claimsDiv.addEventListener("click", async (e) => {
        const t = e.target;
        if (t.classList.contains("delete-user")) {
          const id = t.dataset.id;
          await fetch(`${API_BASE}/admin/users/${id}`, { method: 'DELETE', headers: authHeader() });
          t.closest('tr').remove();
        }
        if (t.classList.contains("approve")) {
          await approveClaim(t.dataset.id);
          t.closest("tr").querySelector("td:nth-child(4)").textContent = "APPROVED";
        }
        if (t.classList.contains("reject")) {
          await rejectClaim(t.dataset.id);
          t.closest("tr").querySelector("td:nth-child(4)").textContent = "REJECTED";
        }
      });
    } catch (e) {
      claimsDiv.textContent = "Failed to load claims";
    }
  }

  // Build admin stats & charts by aggregating per-user claims
  async function fetchUserClaimsById(pid){
    const res = await fetch(`${API_BASE}/claims/user/${pid}`, { headers: authHeader() });
    if (!res.ok) return [];
    return res.json();
  }
  if (adminStats || adminMonthly || adminStatus) {
    try {
      const users = await fetchUsers();
      let allClaims = [];
      for (const u of users) {
        if (u.patient_id) {
          const c = await fetchUserClaimsById(u.patient_id);
          allClaims = allClaims.concat(c);
        }
      }
      const total = allClaims.length;
      const approved = allClaims.filter(c=>c.claim_status==='APPROVED').length;
      const rejected = allClaims.filter(c=>c.claim_status==='REJECTED').length;
      const pending = allClaims.filter(c=>c.claim_status==='PENDING').length;
      const totalAmt = allClaims.reduce((s,c)=> s + Number(c.amount||0), 0);
      if (adminStats) {
        adminStats.innerHTML = `
          <div class='stat-card'><div class='stat-title'>Total Claims</div><div class='stat-value'>${total}</div></div>
          <div class='stat-card'><div class='stat-title'>Approved</div><div class='stat-value'>${approved}</div></div>
          <div class='stat-card'><div class='stat-title'>Rejected</div><div class='stat-value'>${rejected}</div></div>
          <div class='stat-card'><div class='stat-title'>Pending</div><div class='stat-value'>${pending}</div></div>
          <div class='stat-card'><div class='stat-title'>Total Amount</div><div class='stat-value'>₹${totalAmt.toFixed(2)}</div></div>`;
      }
      if (adminMonthly && window.Chart) {
        const byMonth = Array(12).fill(0); const amtByMonth = Array(12).fill(0);
        allClaims.forEach(c=>{ const d=new Date(c.created_at); byMonth[d.getMonth()]++; amtByMonth[d.getMonth()]+=Number(c.amount||0); });
        new Chart(adminMonthly, { type:'bar', data:{ labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], datasets:[{ label:'Claims', data:byMonth, backgroundColor:'#0926fe', borderRadius:6 }, { label:'Amount (₹)', data:amtByMonth, type:'line', borderColor:'#27ae60', yAxisID:'y1' }] }, options:{ responsive:true, scales:{ y:{ beginAtZero:true }, y1:{ beginAtZero:true, position:'right' } } } });
      }
      if (adminStatus && window.Chart) {
        new Chart(adminStatus, { type:'doughnut', data:{ labels:['Pending','Approved','Rejected'], datasets:[{ data:[pending,approved,rejected], backgroundColor:['#f1c40f','#27ae60','#e74c3c'] }] } });
      }
    } catch {}
  }
});
