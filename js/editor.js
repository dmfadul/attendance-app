document.getElementById("editor-form").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const eventName = document.getElementById("event-name").value.trim();
    const eventCode = document.getElementById("event-code").value.trim();
    const numDays = parseInt(document.getElementById("num-days").value);
    const sessionsPerDay = parseInt(document.getElementById("sessions-per-day").value);
    const participantsRaw = document.getElementById("participants").value.trim();
  
    const participants = participantsRaw.split("\n").map(name => name.trim()).filter(Boolean);
  
    const linksList = document.getElementById("generated-links");
    linksList.innerHTML = ""; // Clear previous
  
    const baseUrl = window.location.origin + "/attendance-app/session/form.html";
  
    for (let day = 1; day <= numDays; day++) {
      for (let session = 1; session <= sessionsPerDay; session++) {
        const sessionId = `day${day}-slot${session}`;
        const fullUrl = `${baseUrl}?event=${encodeURIComponent(eventCode)}&session=${encodeURIComponent(sessionId)}`;
  
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = fullUrl;
        a.textContent = `Session: ${eventName} - ${sessionId}`;
        a.target = "_blank";
        li.appendChild(a);
        linksList.appendChild(li);
      }
    }
  
    // Optionally export config or store locally
    const config = {
      eventCode,
      eventName,
      numDays,
      sessionsPerDay,
      participants,
      generatedAt: new Date().toISOString()
    };
  
    // Store in localStorage for now
    localStorage.setItem(`config-${eventCode}`, JSON.stringify(config, null, 2));

    // Create download link
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `${eventCode}.json`;
    downloadLink.textContent = `⬇ Download ${eventCode}.json`;
    downloadLink.style.display = "block";
    downloadLink.style.marginTop = "10px";

    document.getElementById("generated-links").appendChild(downloadLink);
    });
  
