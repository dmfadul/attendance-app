function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      event: params.get('event'),
      session: params.get('session')
    };
  }
  
  function populateNamesDropdown(participants) {
    const select = document.getElementById('name-select');
    participants.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });
  }
  
  function showStatus(message, success = true) {
    const div = document.getElementById("status");
    div.textContent = message;
    div.style.color = success ? "green" : "red";
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const { event, session } = getQueryParams();
    const title = document.getElementById("form-title");
    title.textContent = `Check-in: ${event} - ${session}`;
  
    const configRaw = localStorage.getItem(`config-${event}`);
    if (!configRaw) {
      showStatus("Configuration not found for this event.", false);
      document.getElementById("checkin-form").style.display = "none";
      return;
    }
  
    const config = JSON.parse(configRaw);
    populateNamesDropdown(config.participants);
  
    document.getElementById("checkin-form").addEventListener("submit", function (e) {
      e.preventDefault();
      const participant = document.getElementById("name-select").value;
  
      if (!navigator.geolocation) {
        showStatus("Geolocation not supported.", false);
        return;
      }
  
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        const record = {
          name: participant,
          timestamp: new Date().toISOString(),
          location: { lat: latitude, lng: longitude },
          event,
          session
        };
  
        const key = `attendance-${event}-${session}`;
        const prevData = JSON.parse(localStorage.getItem(key) || "[]");
        prevData.push(record);
        const newData = JSON.stringify(prevData, null, 2);
        localStorage.setItem(key, newData);

        // Send to Netlify
        fetch("https://espcendpoint.netlify.app/.netlify/functions/updateGist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventCode: event,
            sessionCode: session,
            data: record  // not newData (string), keep it as array/object
          })
        })
        .then(res => res.json())
        .then(response => {
          if (response.success) {
            showStatus("Check-in successful and synced.");
          } else {
            showStatus("Saved locally, but failed to sync.", false);
            console.error("Sync error:", response);
          }
        })
        .catch(err => {
          showStatus("Saved locally, but failed to sync.", false);
          console.error("Sync error:", err);
        });        
      }, error => {
        showStatus("Failed to get GPS location.", false);
      });
    });
  });
  
