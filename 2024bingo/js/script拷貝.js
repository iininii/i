// 部署作業 ID: AKfycbxxxxxx
// Web 應用程式 URL: https://script.google.com/macros/s/AKfycbxxxxxx/exec
const API_BASE_URL = "https://script.google.com/macros/s/AKfycbynD2nnJBEv_yXxZEcoZjDl7AcTxmyXLIT-NbFqFH3_dBQ_G4a6uJ1L3OquJX7f4o-2WQ/exec";

// 預設九宮格 ID 和中文名稱
const gridData = [
  { id: 'A1', name: '中文1' },
  { id: 'A2', name: '中文2' },
  { id: 'A3', name: '中文3' },
  { id: 'B1', name: '中文4' },
  { id: 'B2', name: '中文5' },
  { id: 'B3', name: '中文6' },
  { id: 'C1', name: '中文7' },
  { id: 'C2', name: '中文8' },
  { id: 'C3', name: '中文9' },
];

let teamId = '';
let teamName = '';

// 選取 DOM 元素
const loginArea = document.getElementById('login-area');
const gameArea = document.getElementById('game-area');
const grid = document.getElementById('grid');
const loginBtn = document.getElementById('login-btn');
const submitLineBtn = document.getElementById('submit-line-btn');

// 初始化九宮格
function initGrid() {
  grid.innerHTML = '';
  gridData.forEach((item) => {
    const cell = document.createElement('div');
    cell.textContent = item.name;
    cell.dataset.id = item.id;
    cell.dataset.name = item.name;
    cell.addEventListener('click', () => onCellClick(cell));
    grid.appendChild(cell);
  });
}

// 登入事件
loginBtn.addEventListener('click', () => {
  teamId = document.getElementById('team-id').value;
  teamName = document.getElementById('team-name').value;

  if (teamId && teamName) {
    loginArea.style.display = 'none';
    gameArea.style.display = 'block';
    initGrid();
    fetchGameStatus();
  } else {
    alert('請填寫完整資訊');
  }
});

// 點擊九宮格事件
async function onCellClick(cell) {
  if (cell.classList.contains('finish')) {
    alert('該格已完成');
    return;
  }

  const confirmed = confirm(`確認上傳照片到 ${cell.dataset.name} 嗎？`);
  if (!confirmed) return;

  // 假設照片上傳至 Google 雲端，並更新資料表
  const photoPath = await uploadPhoto(cell.dataset.id);
  if (photoPath) {
    cell.classList.add('finish');
    updateFinishInSheet(cell.dataset.id, photoPath);
  }
}

// 上傳照片模擬（Google Apps Script API 實現）
async function uploadPhoto(gridId) {
  // 在此呼叫 Google Apps Script API 進行照片上傳
  return `https://drive.google.com/${gridId}/photo.jpg`; // 模擬返回圖片路徑
}

// 更新 Google Sheet 第一個工作表
async function updateFinishInSheet(gridId, photoPath) {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'updateFinish',
      teamId,
      teamName,
      gridId,
      gridName: gridData.find((g) => g.id === gridId).name,
      photoPath,
    }),
  })
  .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log('成功回應:', data);
    })
    .catch((error) => {
      console.error('發生錯誤:', error);
    });

  // const result = await response.json();
  // if (result.success) {
  //   console.log('成功更新至 Google Sheet');
  // }
}

// 提交線路
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

// 獲取遊戲狀態
async function fetchGameStatus() {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'getGameStatus',
    }),
  });

  const result = await response.json();
  if (result.winner) {
    alert(`遊戲結束，獲勝團隊為：${result.winner}`);
  }
}
