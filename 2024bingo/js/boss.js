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




// 上傳關主位置
document.getElementById('getLocation').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      // 顯示位置資訊
      document.getElementById('locationInfo').innerHTML =
        `經度: ${longitude}, 緯度: ${latitude}`;

      // 發送到 Google Apps Script
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'saveLocation',
          latitude,
          longitude,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('位置已保存至伺服器！');
      } else {
        alert('保存位置失敗！');
      }
    }, (error) => {
      console.error('定位錯誤:', error);
      alert('無法取得定位資訊！');
    });
  } else {
    alert('您的設備不支援地理定位！');
  }
});