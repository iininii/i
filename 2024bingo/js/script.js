// 部署作業 ID: AKfycbxxxxxx Web 應用程式 URL: https://script.google.com/macros/s/AKfycbxxxxxx/exec
const API_BASE_URL = "https://script.google.com/macros/s/AKfycbynD2nnJBEv_yXxZEcoZjDl7AcTxmyXLIT-NbFqFH3_dBQ_G4a6uJ1L3OquJX7f4o-2WQ/exec";

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
    teamInfo.textContent = `團隊名稱: ${teamName}`;
    initGrid();
  } else {
    alert('請填寫完整資訊');
  }
});

// 提交線路點擊事件
submitLineBtn.addEventListener('click', async () => {
  const selectedCells = Array.from(grid.querySelectorAll('.finish'));
  const lineIds = selectedCells.map((cell) => cell.dataset.id);

  if (!lineIds.length) {
    alert('請選擇至少一條線路');
    return;
  }

  // 呼叫 Google Apps Script API 提交線路
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'submitLine',
      teamId,
      teamName,
      lineIds,
    }),
  });
  const result = await response.json();
  if (result.success) {
    selectedCells.forEach((cell) => cell.classList.add('select'));
    alert('線路提交成功');
  }
});

// 檢查是否已登入
function checkLogin() {
  const storedTeamId = localStorage.getItem('teamId');
  const storedTeamName = localStorage.getItem('teamName');

  if (storedTeamId && storedTeamName) {
    // 如果有已儲存的資訊，直接顯示遊戲區域
    loginArea.style.display = 'none';
    gameArea.style.display = 'flex';
    teamInfo.textContent = `${storedTeamName}`;
    initGrid();
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

  // 從伺服器獲取已完成的格子
  fetchFinishedGrids()
    .then(() => currentFinishedGrids().forEach(grid => finishedGrids.add(grid)));
}

// 點擊九宮格事件
async function onCellClick(cell) {
  if (cell.classList.contains('finish')) {
    alert('該格已完成');
    return;
  }

  const confirmed = confirm(`確認上傳 ${cell.dataset.name} 的完食照嗎？`);
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

    // 傳送到 Google Apps Script
    const response = await fetch(API_BASE_URL, {
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
        // 顯示上傳中
        await sleep(1000);
        await fetchFinishedGrids();
        var currentGrids = currentFinishedGrids();
        if (currentGrids.size >= finishedGrids.size) {
            currentGrids.forEach(grid => finishedGrids.add(grid));
            alert('照片上傳成功'); // 結束上傳中
            upload = true;
        }
    }
  };
  reader.readAsDataURL(file); // 轉換檔案為 Base64
}

// 獲取後端已完成的格子
async function fetchFinishedGrids() {
  const teamId = localStorage.getItem('teamId');
  const response = await fetch(`${API_BASE_URL}?action=getFinished&teamId=${teamId}`, {
    method: 'GET',
    redirect: 'follow'
  });
  const result = await response.json();
  if (result.success) {
    result.finishedGrids.forEach((gridId) => {
      const cell = document.querySelector(`[data-id="${gridId}"]`);
      if (cell) cell.classList.add('finish');
    });
  }
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