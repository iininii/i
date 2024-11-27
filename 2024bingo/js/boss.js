// Google Apps Script Web App 的 URL
const API_BASE_URL = "https://script.google.com/macros/s/AKfycbynD2nnJBEv_yXxZEcoZjDl7AcTxmyXLIT-NbFqFH3_dBQ_G4a6uJ1L3OquJX7f4o-2WQ/exec";

///////////////// 設置獲勝團隊 START /////////////////
function setWinner(teamId, line) {
  fetch(`${API_BASE_URL}?action=setWinner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamId, line })
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        alert("獲勝團隊已設定！");
      } else {
        alert(data.message);
      }
    });
}

///////////////// 設置獲勝團隊 END /////////////////
