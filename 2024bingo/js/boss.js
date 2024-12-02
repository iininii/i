// Google Apps Script Web App 的 URL
const API_BASE_URL = "https://script.google.com/macros/s/AKfycbyxwWSSmXaKnKZTyysP0baJMxsLKDHAakL3zdET8q6c1HFww4qtkA4y4YFgwiyWGfVq5g/exec";

// 初始化
init();

function init() {
    getStartTime().then(result => {
        if (result.startTime) {
            document.getElementById('set-time').style.display = 'none';
            document.getElementById('countdown').style.display = 'flex';
            document.getElementById('winner-form').style.display = 'flex';
        }
    })
//    fetchTeamPaths().then(result => {
//
//    })
}

async function gameStart() {
    showLoading(true);
    const response = await fetch(`${API_BASE_URL}?action=gameStart`, {
      method: 'GET',
      redirect: 'follow'
    });
    const result = await response.json();
    showLoading(false);
    return result;
}

async function getStartTime() {
    showLoading(true);
    const response = await fetch(`${API_BASE_URL}?action=getStartTime`, {
      method: 'GET',
      redirect: 'follow'
    });
    const result = await response.json();
    showLoading(false);
    return result;
}


// 獲取後端已完成的格子
async function fetchStartTime() {
    showLoading(true);
    const response = await fetch(`${API_BASE_URL}?action=getStartTime`, {
      method: 'GET',
      redirect: 'follow'
    });
    const result = await response.json();
    showLoading(false);
    return result;
}

// 獲取後端已完成的格子
async function fetchTeamPaths() {
  showLoading(true);
  const response = await fetch(`${API_BASE_URL}?action=getTeamPaths`, {
    method: 'GET',
    redirect: 'follow'
  });
  const result = await response.json();
  showLoading(false);
  return result;
}

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

// 顯示Loading時不可操作
function showLoading(show) {
  return new Promise((resolve, reject) => {
    const popup = document.getElementById('popup-loading');
    const display = show ? 'block' : '';
    popup.style.display = display;
  });
}

