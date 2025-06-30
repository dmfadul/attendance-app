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
        localStorage.setItem(key, JSON.stringify(prevData, null, 2));
  
        showStatus("Check-in successful.");
      }, error => {
        showStatus("Failed to get GPS location.", false);
      });
    });
  });
  