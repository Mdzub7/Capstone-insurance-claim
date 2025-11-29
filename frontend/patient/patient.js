const API_BASE = "http://localhost:8001/api/v1";

function authHeader() {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchProfile() {
  const res = await fetch(`${API_BASE}/users/me`, { headers: authHeader() });
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json();
}

async function fetchMyClaims() {
  const res = await fetch(`${API_BASE}/claims/my`, { headers: authHeader() });
  if (!res.ok) throw new Error("Failed to load claims");
  return res.json();
}

async function submitClaim(data, file) {
  const res = await fetch(`${API_BASE}/claims/`, {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to create claim");
  const result = await res.json();
  if (file && result.s3_upload_url) {
    const up = await fetch(result.s3_upload_url, {
      method: "PUT",
      headers: { "Content-Type": "application/pdf" },
      body: file
    });
    if (!up.ok) throw new Error("Upload failed");
  }
  return result;
}

window.addEventListener("DOMContentLoaded", async () => {
  const profileCard = document.getElementById("profileCard");
  const claimsList = document.getElementById("claimsList");
  const submitForm = document.getElementById("submitForm");
  const uploadMsg = document.getElementById("uploadMsg");

  if (profileCard) {
    try {
      const p = await fetchProfile();
      profileCard.innerHTML = `
        <p><strong>Name:</strong> ${p.name || ""}</p>
        <p><strong>Email:</strong> ${p.email || ""}</p>
        <p><strong>Patient ID:</strong> ${p.patient_id || ""}</p>
        <p><strong>Role:</strong> ${p.role}</p>
      `;
    } catch (e) {
      profileCard.textContent = "Failed to load profile";
    }
  }

  if (claimsList) {
    try {
      const claims = await fetchMyClaims();
      if (!claims.length) {
        claimsList.innerHTML = "<p>No claims found.</p>";
      } else {
        let html = "<ul style='list-style:none; padding:0;'>";
        claims.forEach(c => {
          html += `<li style='padding:10px 0; border-bottom:1px solid #eee;'>
            <strong>${c.description}</strong> - $${c.amount}
            <span class='badge badge-${c.claim_status}'>${c.claim_status}</span>
          </li>`;
        });
        html += "</ul>";
        claimsList.innerHTML = html;
      }
    } catch (e) {
      claimsList.textContent = "Failed to load claims";
    }
  }

  if (submitForm) {
    submitForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      uploadMsg.textContent = "Submitting...";
      uploadMsg.style.color = "#0070cd";
      const amount = parseFloat(document.getElementById("amount").value);
      const description = document.getElementById("description").value;
      const policy_number = document.getElementById("policyNumber").value;
      const fileEl = document.getElementById("file");
      const file = fileEl.files[0];
      try {
        const r = await submitClaim({ amount, description, policy_number }, file);
        uploadMsg.textContent = `Success. Claim ID: ${r.claim_id}`;
        uploadMsg.style.color = "green";
      } catch (err) {
        uploadMsg.textContent = "Error: " + err.message;
        uploadMsg.style.color = "red";
      }
    });
  }
});
