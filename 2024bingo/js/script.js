// 部署作業 ID: AKfycbxxxxxx Web 應用程式 URL: https://script.google.com/macros/s/AKfycbxxxxxx/exec
const API_BASE_URL = "https://script.google.com/macros/s/AKfycbwo6sk3YhgMB_kpuiFXM5sBCvjJvk3K_IDoMrUaOJh7EZmOQAopWKa511_IC2YfgEnDxg/exec";

// 預設九宮格 ID 和中文名稱
const gridData = [
  { id: 'A1', name: '紅磚 珍珠奶茶一杯' },
  { id: 'A2', name: '福泉豆花「三色豆花」' },
  { id: 'A3', name: '北原夜市鴨肉麵（中正路「小炒麵+鴨舌頭」）' },
  { id: 'B1', name: '好吃麵「乾麵綜合湯+粉腸or三合肉」' },
  { id: 'B2', name: '三味鹹酥雞「綜合」' },
  { id: 'B3', name: '梅花雞蛋糕一包' },
  { id: 'C1', name: '雙星甜不辣的甜不辣一碗' },
  { id: 'C2', name: '北門炸粿「肉粿+蚵仔嗲」' },
  { id: 'C3', name: '南門當歸鴨「當歸鴨麵線」' },
];

// 已完成的九宮格 ID
const finishedGrids = new Set();

// 選取 DOM 元素
const startArea = document.getElementById('start-area');
const loginArea = document.getElementById('login-area');
const gameArea = document.getElementById('game-area');
const teamInfo = document.getElementById('team-info');
const grid = document.getElementById('grid');
const loginBtn = document.getElementById('login-btn');
const submitLineBtn = document.getElementById('submit-line-btn');

// 初始化檢查
checkLogin();

// 登入按鈕點擊事件
loginBtn.addEventListener('click', () => {
  const teamId = document.getElementById('team-id').value;
  const teamName = document.getElementById('team-name').value;

  if (teamId && teamName) {
    // 儲存至 localStorage
    localStorage.setItem('teamId', teamId);
    localStorage.setItem('teamName', teamName);

    // 顯示遊戲區域
    loginArea.style.display = 'none';
    gameArea.style.display = 'flex';
    teamInfo.textContent = `${teamName}`;
    initGrid();
  } else {
    showCustomPopup(`請填寫完整資訊`, false); 
  }
});


function submitPath(){
    showLoading(true);
    const selectedRadio = document.querySelector('input[name="line-answer"]:checked');
    if (!selectedRadio) {
        showLoading(false);
        showCustomPopup(`請選擇路線`, false);
    }
    const pathId = selectedRadio.id;
    const teamId = localStorage.getItem('teamId');
    fetch(`${API_BASE_URL}?action=updatePath&teamId=${teamId}&pathId=${pathId}`, {
      method: 'GET',
      redirect: 'follow'
    })
    .then((result) => {
        showLoading(false)
        selectedRadio.classList.add('active');
        showCustomPopup(`線路送出成功，快去找關主吧`, false);
        document.getElementById('line').classList.add('viewonly');
        document.getElementById('edit-line-btn').style.display = 'block';
        document.getElementById('action-line').style.display = 'none';
    });
}

// 檢查是否已登入
function checkLogin() {
  const storedTeamId = localStorage.getItem('teamId');
  const storedTeamName = localStorage.getItem('teamName');

  if (storedTeamId && storedTeamName) {
    // 如果有已儲存的資訊，直接顯示遊戲區域
    startArea.style.display = 'none';
    loginArea.style.display = 'none';
    gameArea.style.display = 'flex';
    teamInfo.textContent = `${storedTeamName}`;
    initGrid();
    // 從伺服器獲取已完成的格子並更新可選擇路線
    fetchFinishedGrids().then(result => {
        if (result.finishedGrids) {
            result.finishedGrids.forEach(gridId => {
                finishedGrids.add(gridId);
                const cell = document.querySelector(`[data-id="${gridId}"]`);
                cell.classList.add('finish');
            });
            refreshCanSelectPath();
        }
    });
    fetchFinishedPath().then(result => {
        if (result.finishedPath) {
            const path = document.getElementById(result.finishedPath);
            path.classList.add('active');
        }
    })
  }
}

function refreshCanSelectPath() {
    if (finishedGrids.has('A1') && finishedGrids.has('A2') && finishedGrids.has('A3')) {
        document.getElementById('h1').removeAttribute('disabled');
    }
    if (finishedGrids.has('B1') && finishedGrids.has('B2') && finishedGrids.has('B3')) {
        document.getElementById('h2').removeAttribute('disabled');
    }
    if (finishedGrids.has('C1') && finishedGrids.has('C2') && finishedGrids.has('C3')) {
        document.getElementById('h3').removeAttribute('disabled');
    }
    if (finishedGrids.has('A1') && finishedGrids.has('B1') && finishedGrids.has('C1')) {
        document.getElementById('v1').removeAttribute('disabled');
    }
    if (finishedGrids.has('A2') && finishedGrids.has('B2') && finishedGrids.has('C2')) {
        document.getElementById('v2').removeAttribute('disabled');
    }
    if (finishedGrids.has('A3') && finishedGrids.has('B3') && finishedGrids.has('C3')) {
        document.getElementById('v3').removeAttribute('disabled');
    }
    if (finishedGrids.has('A1') && finishedGrids.has('B2') && finishedGrids.has('C3')) {
        document.getElementById('s1').removeAttribute('disabled');
    }
    if (finishedGrids.has('A3') && finishedGrids.has('B2') && finishedGrids.has('C1')) {
        document.getElementById('s2').removeAttribute('disabled');
    }
}

// 初始化九宮格
function initGrid() {
  grid.innerHTML = '';
  gridData.forEach((item) => {
    // 為每個格子建立一個元素
    const cell = document.createElement('div');
    cell.className = "grid-item";
    cell.textContent = item.name;
    cell.dataset.id = item.id;
    cell.dataset.name = item.name;

    // 點擊事件
    cell.addEventListener('click', () => onCellClick(cell));

    // 添加到九宮格容器中
    grid.appendChild(cell);
  });
}

// 點擊九宮格事件
async function onCellClick(cell) {
  if (cell.classList.contains('finish')) {
    showCustomPopup(`你已經吃過拉！`, false); 
    return;
  }

  const confirmed = await showCustomPopup(`確認上傳 ${cell.dataset.name} 的完食照嗎？`);
  if (!confirmed) return;

  // 觸發檔案選擇框
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.click();

  fileInput.onchange = async function(event) {
    const file = event.target.files[0];
    if (file) {
      await uploadPhotoToDrive(file, cell.dataset.id, cell.dataset.name); // 上傳照片
    }
  };
}

// 實際上傳圖片至 Google Drive
async function uploadPhotoToDrive(file, gridId, gridName) {
  const reader = new FileReader();
  reader.onload = async function(event) {
    const base64String = event.target.result.split(',')[1]; // 獲取 Base64 字串
    const fileType = file.type;
    const fileName = file.name;
    showLoading(true);
    const response = await fetch(API_BASE_URL, { // 傳送到 Google Apps Script
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'uploadPhoto',
        teamId: localStorage.getItem('teamId'),
        teamName: localStorage.getItem('teamName'),
        gridId, // 格子 ID
        gridName, // 格子名稱
        file: base64String, // Base64 編碼的檔案
        fileType, // 檔案類型
        fileName, // 檔案名稱
      }),
      mode: 'no-cors',  // 設定 no-cors 模式
    });
    var upload = false;
    while (!upload) {
        const googleGrids = await fetchFinishedGrids();
        const currentGrids = currentFinishedGrids();
        if (googleGrids.finishedGrids && googleGrids.finishedGrids.length > currentGrids.size) {
            googleGrids.finishedGrids.forEach(grid => finishedGrids.add(grid));
            showLoading(false);
            const cell = document.querySelector(`[data-id="${gridId}"]`);
            cell.classList.add('finish');
            showCustomPopup(`照片上傳成功`, false);
            upload = true;
            refreshCanSelectPath();
        }
    }
  };
  reader.readAsDataURL(file); // 轉換檔案為 Base64
}

// 獲取後端已完成的格子
async function fetchFinishedGrids() {
  showLoading(true);
  const teamId = localStorage.getItem('teamId');
  const response = await fetch(`${API_BASE_URL}?action=getFinished&teamId=${teamId}`, {
    method: 'GET',
    redirect: 'follow'
  });
  const result = await response.json();
  showLoading(false);
  return result;
}

// 取得最後選取路線
async function fetchFinishedPath() {
  showLoading(true);
  const teamId = localStorage.getItem('teamId');
  const response = await fetch(`${API_BASE_URL}?action=getFinishedPath&teamId=${teamId}`, {
    method: 'GET',
    redirect: 'follow'
  });
  const result = await response.json();
  showLoading(false);
  return result;
}

// 獲取畫面當前完成格子
function currentFinishedGrids() {
    const grids = new Set();
    const elements = document.querySelectorAll('div[data-id].finish.grid-item');
    elements.forEach(element => {
        const dataId = element.getAttribute('data-id');
        grids.add(dataId);
    });
    return grids;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// 點擊按鈕取得關主位置的URL
function getBossLocationUrl() {
  document.getElementById('fetch-location-btn').addEventListener('click', async () => {
    try {
      const response = await fetch(`${API_BASE_URL}?action=getBossLocation`);
      const data = await response.json();

      console.log(data);

      if (data.success) {
        // 開啟位置 URL
        window.open(data.url, '_blank');
      } else {
        alert('無法取得關主位置: ' + data.message);
      }
    } catch (error) {
      console.error('無法取得關主位置:', error);
      showCustomPopup(`發生錯誤，請稍後再試！`, false); 
    }
  });
}
getBossLocationUrl()


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