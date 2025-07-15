console.log("responses JS loaded");

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      event: params.get('event'),
      session: params.get('session')
    };
}

async function loadResponses() {
  const GIST_ID = 'e2c98b8850cffdd04f61d8cbeaa0d04f';

  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`);
    const data = await res.json();
    const files = data.files;

    const { event, session } = getQueryParams();
    
    const targetFileName = `${event}-${session}.json`;
    const file = files[targetFileName];

    if (file) {
        const configContent = JSON.parse(file.content);
        return configContent;
      } else {
        console.error(`File ${targetFileName} not found in gist.`);
        return [];
      }
  } catch (err) {
    console.error("Error loading configs:", err);
    return [];
  }
}

async function loadParticipants() {
  const GIST_ID = 'e2c98b8850cffdd04f61d8cbeaa0d04f';

  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`);
    const data = await res.json();
    const files = data.files;

    const { event, session } = getQueryParams();
    
    const filename = `${event}-config.json`;
    const file = files[filename];

    if (file) {
        const configContent = JSON.parse(file.content);
        return configContent.participants;
      } else {
        console.error(`File ${targetFileName} not found in gist.`);
        return [];
      }
  } catch (err) {
    console.error("Error loading configs:", err);
    return [];
  }
}

function renderResponses(fileContent) {
    const list = document.getElementById("responses");
    list.innerHTML = "";

    const respondents_raw = [];
    fileContent.forEach((response) => {
        respondents_raw.push(response.name);
    });
    
    const respondents = [...new Set(respondents_raw.filter(p => typeof p === 'string'))].sort();
    respondents.forEach((respondent, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.textContent = `${String(index + 1).padStart(2, '0')}. ${respondent}`;
        list.appendChild(li);
    });
}

function renderMissingParticipants(missingParticipantsRaw) {
  const list = document.getElementById("missing-participants");
  list.innerHTML = "";
  
  const missingParticipants = [...new Set(missingParticipantsRaw.filter(p => typeof p === 'string'))].sort();
  missingParticipants.forEach((p) => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = p;
      list.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const fileContent = await loadResponses();
  const participants = await loadParticipants();
  
  const respondents = Object.values(fileContent).map(r => r.name);
  const missingParticipants = participants.filter(p => !respondents.includes(p));
  
  renderResponses(fileContent);
  renderMissingParticipants(missingParticipants);
});
