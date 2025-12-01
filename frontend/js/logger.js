const LOG_API = "http://localhost:8001/api/v1/logs";
function logEvent(event, context={}){
  try {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    fetch(LOG_API, { method:"POST", headers: { "Content-Type":"application/json", ...(token?{ Authorization:`Bearer ${token}` }:{}) }, body: JSON.stringify({ level:"INFO", event, context }) });
  } catch {}
}

