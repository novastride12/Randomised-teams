// script.js
let teams = [];         // array of rows from teams.csv
let bySRN = {};         // map srnLower -> [rows]

function loadData() {
  Papa.parse("teams_with_names.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      teams = results.data.map(r => {
        // normalize keys (in case of spaces)
        return {
          Subject: r.Subject || r.subject || r['Subject '] || r[' subject'] || r['Subject'.trim()],
          Team: r.Team,
          Name: r.NAME,
          SRN: r.SRN
        };
      }).filter(r => r.SRN); // drop rows without SRN

      buildIndex();
    },
    error: function(err) {
      document.getElementById('result').innerHTML = "<p style='color:red'>Error loading teams.csv</p>";
      console.error(err);
    }
  });
}

function buildIndex() {
  bySRN = {};
  teams.forEach(r => {
    const key = r.SRN.trim().toLowerCase();
    if (!bySRN[key]) bySRN[key] = [];
    bySRN[key].push(r);
  });
}

function findTeamForSRN(srnRaw) {
  const srn = srnRaw.trim().toLowerCase();
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = "Searching...";

  if (!srn) {
    resultDiv.innerHTML = "<p>Please enter an SRN.</p>";
    return;
  }

  const records = bySRN[srn];
  if (!records || records.length === 0) {
    resultDiv.innerHTML = `<p style="color:darkred">No record found for ${srnRaw}</p>`;
    return;
  }

  // group by subject then team
  const grouped = {};
  records.forEach(r => {
    if (!grouped[r.Subject]) grouped[r.Subject] = {};
    if (!grouped[r.Subject][r.Team]) grouped[r.Subject][r.Team] = [];
    grouped[r.Subject][r.Team].push(r);
  });

  let html = "";
  for (const subj of Object.keys(grouped)) {
    html += `<h3>${subj}</h3>`;
    for (const teamName of Object.keys(grouped[subj])) {
      // find all members of this team in the global teams array
      const members = teams.filter(t => t.Subject === subj && t.Team === teamName);
      html += `<strong>${teamName}</strong><ul>`;
      members.forEach(m => html += `<li>${m.Name} (${m.SRN})</li>`);
      html += `</ul>`;
    }
  }
  resultDiv.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  document.getElementById('searchBtn').addEventListener('click', () => {
    const srn = document.getElementById('srnInput').value;
    findTeamForSRN(srn);
  });

  // also allow Enter key
  document.getElementById('srnInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      findTeamForSRN(e.target.value);
    }
  });
});
