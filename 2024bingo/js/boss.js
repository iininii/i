// Google Apps Script Web App 的 URL
const API_BASE_URL = "https://script.google.com/macros/s/AKfycbynD2nnJBEv_yXxZEcoZjDl7AcTxmyXLIT-NbFqFH3_dBQ_G4a6uJ1L3OquJX7f4o-2WQ/exec";

///////////////// 設置獲勝團隊 START /////////////////

document.getElementById('winner-comfirm-btn').addEventListener('click', async () => {
  const confirmed = await showCustomPopup(`確認要送出獲勝退伍？`);
  if (!confirmed) return;
});


// function setWinner(teamId, line) {
//   fetch(`${API_BASE_URL}?action=setWinner`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ teamId, line })
//   })
//     .then(response => response.json())
//     .then(data => {
//       if (data.status === 'success') {
//         showCustomPopup(`獲勝團隊已設定！`, false); 
//       } else {
//         alert(data.message);
//       }
//     });
// }

///////////////// 設置獲勝團隊 END /////////////////

// 顯示模態框
function showCustomPopup(message, showCancel = true) {
  return new Promise((resolve, reject) => {
    // 顯示模態框
    const popup = document.getElementById('popup-comfirm');
    const popupMessage = document.getElementById('popup-message');
    const confirmBtn = document.getElementById('popup-confirm-btn');
    const cancelBtn = document.getElementById('popup-cancel-btn');
    
    popupMessage.textContent = message;
    popup.style.display = 'block';  // 顯示模態框

    // 根據參數決定是否顯示取消按鈕
    if (showCancel) {
      cancelBtn.style.display = 'inline-block'; // 顯示取消按鈕
    } else {
      cancelBtn.style.display = 'none'; // 隱藏取消按鈕
    }

    // 確認按鈕事件
    confirmBtn.onclick = function() {
      popup.style.display = 'none';  // 隱藏模態框
      resolve(true);  // 回傳確認結果
    };

    // 取消按鈕事件
    cancelBtn.onclick = function() {
      popup.style.display = 'none';  // 隱藏模態框
      resolve(false);  // 回傳取消結果
    };
  });
}

