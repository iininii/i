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
    cell.className = "grid-item";
    cell.textContent = item.name;
    cell.dataset.id = item.id;
    cell.dataset.name = item.name;
    cell.addEventListener('click', () => onCellClick(cell));
    grid.appendChild(cell);
  });
}



/////////////////////////// 登入事件
loginBtn.addEventListener('click', () => {
  teamId = document.getElementById('team-id').value;
  teamName = document.getElementById('team-name').value;

  if (teamId && teamName) {
    // 將資料儲存到 cookie，使用 encodeURIComponent 防止特殊字符問題
    document.cookie = `teamId=${encodeURIComponent(teamId)}; path=/; max-age=${60 * 60 * 24 * 365}`; // 儲存一年
    document.cookie = `teamName=${encodeURIComponent(teamName)}; path=/; max-age=${60 * 60 * 24 * 365}`; // 儲存一年

    loginArea.style.display = 'none';
    gameArea.style.display = 'block';
    initGrid();
    // fetchGameStatus();
  } else {
    alert('請填寫完整資訊');
  }
});

// 在頁面加載時，檢查是否有 cookie 並自動填入資料
window.addEventListener('load', () => {
  const cookies = document.cookie.split('; ');
  let teamIdFromCookie = '';
  let teamNameFromCookie = '';

  // 搜尋 cookie 中的 teamId 和 teamName
  cookies.forEach(cookie => {
    const [key, value] = cookie.split('=');
    if (key === 'teamId') {
      teamIdFromCookie = decodeURIComponent(value); // 解碼值
    }
    if (key === 'teamName') {
      teamNameFromCookie = decodeURIComponent(value); // 解碼值
    }
  });

  console.log(`Cookie data: teamId=${teamIdFromCookie}, teamName=${teamNameFromCookie}`);

  // 如果 cookie 中有 teamId 和 teamName，則自動填充並跳過表單
  if (teamIdFromCookie && teamNameFromCookie) {
    // 跳過登入表單，直接顯示遊戲區域
    loginArea.style.display = 'none';
    gameArea.style.display = 'block';
    initGrid();

    console.log(`Loaded data: teamId=${teamIdFromCookie}, teamName=${teamNameFromCookie}`);
  }
});







////////////////////////// 點擊九宮格事件
async function onCellClick(cell) {
  if (cell.classList.contains('finish')) {
    alert('該格已完成');
    return;
  }

  const confirmed = confirm(`確認上傳照片到 ${cell.dataset.name} 嗎？`);
  if (!confirmed) return;

  // 觸發檔案選擇框
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.click();

  fileInput.onchange = async function(event) {
    const file = event.target.files[0];
    if (file) {
      const photoPath = await uploadPhotoToDrive(file, cell.dataset.id, cell.dataset.name); // 上傳照片
      if (photoPath) {
        cell.classList.add('finish');
        await updateFinishInSheet(cell.dataset.id, cell.dataset.name, photoPath); // 更新 Google Sheet
      }
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
        teamId, // 團隊 ID
        teamName, // 團隊名稱
        gridId, // 格子 ID
        gridName, // 格子名稱
        file: base64String, // Base64 編碼的檔案
        fileType, // 檔案類型
        fileName, // 檔案名稱
      }),
    mode: 'no-cors',  // 設定 no-cors 模式
    });

    const result = await response.json();
    if (result.success) {
      console.log('照片上傳成功:', result.fileUrl);
      return result.fileUrl; // 返回圖片 URL
    } else {
      alert('上傳失敗: ' + result.message);
      return null;
    }
  };

  reader.readAsDataURL(file); // 轉換檔案為 Base64
}

// 更新 Google Sheet 第一個工作表
async function updateFinishInSheet(gridId, gridName, photoPath) {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'updateFinish',
      teamId, // 團隊 ID
      teamName, // 團隊名稱
      gridId, // 格子 ID
      gridName, // 格子名稱
      photoPath,
    }),
    mode: 'no-cors',  // 設定 no-cors 模式
  });

  const result = await response.json();
  if (result.status === 'success') {
    console.log('成功更新至 Google Sheet');
  } else {
    console.error('更新 Google Sheet 失敗');
  }
}






////////////////////////// 提交線路
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



////////////////////////// 獲取遊戲狀態
async function fetchGameStatus() {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'getGameStatus',
    }),
    mode: 'no-cors',  // 設定 no-cors 模式
  });

  const result = await response.json();
  if (result.winner) {
    alert(`遊戲結束，獲勝團隊為：${result.winner}`);
  }
}
