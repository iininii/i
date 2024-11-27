const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbyZeq4l5Zkh4ut_UM_W4h6qeL4eMdgY8sfs_E3ttUWOPhQ_t1_B4TRTT5N3viv8ktyC/exec';

// 定義九宮格資料
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

// 選取 DOM 元素
const loginArea = document.getElementById('login-area');
const gameArea = document.getElementById('game-area');
const teamInfo = document.getElementById('team-info');
const grid = document.getElementById('grid');
const loginBtn = document.getElementById('login-btn');

// 初始化九宮格
function initGrid() {
  grid.innerHTML = ''; // 清空現有內容

  gridData.forEach((item) => {
    // 為每個格子建立一個元素
    const cell = document.createElement('div');
    cell.className = 'grid-item';
    cell.textContent = item.name; // 顯示格子名稱
    cell.dataset.id = item.id; // 存儲格子 ID 作為屬性
    cell.dataset.name = item.name; // 存儲格子名稱作為屬性

    // 點擊事件
    cell.addEventListener('click', () => onCellClick(cell));

    // 添加到九宮格容器中
    grid.appendChild(cell);
  });

  // 從伺服器獲取已完成的格子
  fetchFinishedGrids();
}

// 初始化九宮格
initGrid();


/*------------------------------- 點擊上傳完食 START ------------------------------*/
/*------------------------------- 點擊上傳完食 START ------------------------------*/
// 點擊格子的事件
async function onCellClick(cell) {
  if (cell.classList.contains('finish')) {
    alert('該格已完成');
    return;
  }

  const confirmed = confirm(`是否要上傳美食照到 ${cell.dataset.name}？`);
  if (!confirmed) return;

  // 觸發檔案選擇框
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.click();

  fileInput.onchange = async function (event) {
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

// 上傳圖片到 Google Drive
async function uploadPhotoToDrive(file, gridId, gridName) {
  const reader = new FileReader();
  return new Promise((resolve) => {
    reader.onload = async function (event) {
      const base64String = event.target.result.split(',')[1];
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'uploadPhoto',
          teamId: localStorage.getItem('teamId'),
          teamName: localStorage.getItem('teamName'),
          gridId,
          gridName,
          file: base64String,
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log('照片上傳成功:', result.fileUrl);
        resolve(result.fileUrl);
      } else {
        alert('上傳失敗: ' + result.message);
        resolve(null);
      }
    };

    reader.readAsDataURL(file);
  });
}

// 更新 Google Sheet
async function updateFinishInSheet(gridId, gridName, photoPath) {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'updateFinish',
      teamId: localStorage.getItem('teamId'),
      teamName: localStorage.getItem('teamName'),
      gridId,
      gridName,
      photoPath,
    }),
  });

  const result = await response.json();
  if (result.success) {
    console.log('成功更新至 Google Sheet');
  } else {
    console.error('更新失敗:', result.message);
  }
}

// 獲取已完成的格子
async function fetchFinishedGrids() {
  const teamId = localStorage.getItem('teamId');
  const response = await fetch(`${API_BASE_URL}?action=getFinished&teamId=${teamId}`);
  const result = await response.json();

  if (result.success) {
    result.finishedGrids.forEach((gridId) => {
      const cell = document.querySelector(`[data-id="${gridId}"]`);
      if (cell) cell.classList.add('finish');
    });
  }
}
/*------------------------------- 點擊上傳完食 END ------------------------------*/
/*------------------------------- 點擊上傳完食 END ------------------------------*/


/*------------------------------- 登入相關 START ------------------------------*/
/*------------------------------- 登入相關 START ------------------------------*/

// 檢查是否已登入
function checkLogin() {
  const storedTeamId = localStorage.getItem('teamId');
  const storedTeamName = localStorage.getItem('teamName');

  if (storedTeamId && storedTeamName) {
    // 如果有已儲存的資訊，直接顯示遊戲區域
    loginArea.style.display = 'none';
    gameArea.style.display = 'flex';
    teamInfo.textContent = `團隊名稱: ${storedTeamName}`;
    initGrid();
  }
}

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

// 初始化檢查
checkLogin();

/*------------------------------- 登入相關 END ------------------------------*/
/*------------------------------- 登入相關 END ------------------------------*/


