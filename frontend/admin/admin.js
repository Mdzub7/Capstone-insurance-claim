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
  if (usersDiv) {
    try {
      const users = await fetchUsers();
      let html = "<table style='width:100%'><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Patient ID</th></tr></thead><tbody>";
      users.forEach(u => {
        html += `<tr><td>${u.name || ''}</td><td>${u.email || ''}</td><td>${u.role}</td><td>${u.patient_id || ''}</td></tr>`;
      });
      html += "</tbody></table>";
      usersDiv.innerHTML = html;
    } catch (e) {
      usersDiv.textContent = "Failed to load users";
    }
  }
  if (claimsDiv) {
    try {
      const claims = await fetchPendingClaims();
      let html = "<table style='width:100%'><thead><tr><th>ID</th><th>Description</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>";
      claims.forEach(c => {
        html += `<tr><td>${c.claim_id}</td><td>${c.description}</td><td>$${c.amount}</td><td>${c.claim_status}</td>
          <td>
            <button data-id='${c.claim_id}' class='approve'>Approve</button>
            <button data-id='${c.claim_id}' class='reject'>Reject</button>
          </td></tr>`;
      });
      html += "</tbody></table>";
      claimsDiv.innerHTML = html;
      claimsDiv.addEventListener("click", async (e) => {
        const t = e.target;
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
});
