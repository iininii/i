export const API_BASE_URL = "https://script.google.com/macros/s/AKfycbw0ikAmjdYQpXGua8k0FJqO9cy6v8SSNNqFOLk7j34tqniLkWJcUDQmUHNSFCkdUm65Gw/exec";

export function dateCountdown(time) {
    const endTime = new Date(time).getTime() + 2.5 * 3600000; // adding two hours
    const countdownTimer = setInterval(function() {
        const now = new Date().getTime();
        const distance = endTime - now;
        if (distance >= 0) {
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            document.getElementById("countdown").innerHTML = "倒數 " + hours + "小時 " + minutes + "分 " + seconds + "秒";
        } else {
            document.getElementById("countdown").innerHTML = "遊戲結束";
        }
    }, 1000);
}

// 顯示模態框
export function showCustomPopup(message, showCancel = true) {
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

// 顯示Loading時不可操作
export function showLoading(show) {
  return new Promise((resolve, reject) => {
    const popup = document.getElementById('popup-loading');
    const display = show ? 'block' : '';
    popup.style.display = display;
  });
}

