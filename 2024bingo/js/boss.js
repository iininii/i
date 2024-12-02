// Google Apps Script Web App 的 URL
const API_BASE_URL = "https://script.google.com/macros/s/AKfycbzhDxIeeuXoFf5fJ3BoLLUT_-L_kNkx03IWKnSBCZFIUsFGsYwA4LCnhEngzxyKY0wOlg/exec";

// 初始化
init();

function init() {
    getStartTime().then(result => {
        if (!result.startTime) {
            return;
        }
        fetchTeamPaths().then(result => {

        })
        gamingPage();
        dateCountdown(result.startTime);
    })
}

function clickGameStart() {
    gameStart().then(result => {
        gamingPage();
    })
}

function gamingPage() {
    document.getElementById('set-time').style.display = 'none';
    document.getElementById('countdown').style.display = 'flex';
    document.getElementById('winner-form').style.display = 'flex';
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
  const response = await fetch(`${API_BASE_URL}?action=getTeamPaths`, {
    method: 'GET',
    redirect: 'follow'
  });
  const result = await response.json();
  return result;
}

function dateCountdown(time) {
    // 設定 GMT+8 時區的目標日期（用本地時間模擬 GMT+8）
    const endTime = new Date(time).getTime() + 2.5 * 3600000; // adding two hours

    // 每秒更新倒數
    const countdownTimer = setInterval(function() {
        const now = new Date().getTime(); // 獲取當前 UTC 時間戳
        const distance = endTime - now;

        // 計算天數、時數、分鐘數和秒數
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // 顯示倒數計時`
        document.getElementById("countdown").innerHTML = "倒數 " + hours + "小時 " + minutes + "分 " + seconds + "秒";
    }, 1000);
}

// Helper function to parse date string in 'yyyy/MM/dd HH:mm:ss' format
function parseDate(dateString) {
    // Split the date and time parts
    const [datePart, timePart] = dateString.split(" ");
    const [year, month, day] = datePart.split("/").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);

    // Create a new Date object with the parsed components
    return new Date(year, month - 1, day, hour, minute, second);
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

