import { API_BASE_URL } from './common.js';
import {
    fetchRank,
    fetchGameOver,
    checkGameOver,
    dateCountdown,
    showCustomPopup,
    showLoading
} from './common.js';

window.submitPath = submitPath;

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
const gameOver = false;

// 選取 DOM 元素
const startArea = document.getElementById('start-area');
const loginArea = document.getElementById('login-area');
const gameArea = document.getElementById('game-area');
const teamInfo = document.getElementById('team-info');
const grid = document.getElementById('grid');
const loginBtn = document.getElementById('login-btn');
const submitLineBtn = document.getElementById('submit-line-btn');
const rulePopup = document.getElementById('popup-rule');
const startBtn = document.getElementById('start-btn');
const rankBtn = document.getElementById('rank-btn');

// 初始化檢查
init();

// 登入按鈕點擊事件
loginBtn.addEventListener('click', () => {
  const teamId = document.getElementById('team-id').value;
  const teamName = document.getElementById('team-name').value;

  if (teamId && teamName) {
    // 儲存至 localStorage
    localStorage.setItem('teamId', teamId);
    localStorage.setItem('teamName', teamName);

    // 顯示等待遊戲區域
    loginArea.style.display = 'none';
    startArea.style.display = 'flex';
    teamInfo.textContent = `${teamName}`;
  } else {
    showCustomPopup(`請填寫完整資訊`, false); 
  }
});

// 開始遊戲按鈕點擊事件
startBtn.addEventListener('click', () => {
  const gameStart = true;

  if (gameStart) {
    // 顯示遊戲區域
    startArea.style.display = 'none';
    gameArea.style.display = 'flex';
    initGrid();
  } else {
    showCustomPopup(`請等待關主開始計時遊戲`, false); 
  }
});

// 顯示排名按鈕點擊事件
rankBtn.addEventListener('click', () => {
    fetchRank().then(result => {
        var olElement = document.querySelector("#popup-rank .rank-text ol");
        olElement.innerHTML = "";
        if (result.rank) {
            for (var i = 0; i < result.rank.length; i++) {
                const li = document.createElement("li");
                li.innerHTML = "<b>第" + (i + 1) + "名</b> " + result.rank[i];
                olElement.appendChild(li);
            }
        }
    })
})

// 提交線路
function submitPath() {
    showLoading(true);
    gameOver = fetchGameOver().then(result => {
        if (result.gameOver) {
            showCustomPopup(`遊戲結束！`, false);
        }
        return result.gameOver;
    })
    const selectedRadio = document.querySelector('input[name="line-answer"]:checked');
    if (!selectedRadio) {
        showLoading(false);
        showCustomPopup(`請選擇路線`, false);
    }
    const pathId = selectedRadio.id;
    const teamId = localStorage.getItem('teamId');
    const teamName = localStorage.getItem('teamName');
    fetch(`${API_BASE_URL}?action=updatePath&teamId=${teamId}&teamName=${teamName}&pathId=${pathId}`, {
      method: 'GET',
      redirect: 'follow'
    })
    .then((result) => {
        const previousPath = document.querySelector('input[type="radio"].line-item.active');
        if (previousPath) {
            previousPath.classList.remove('active');
        }
        selectedRadio.classList.add('active');
        document.getElementById('line').classList.add('viewonly');
        document.getElementById('edit-line-btn').style.display = 'block';
        document.getElementById('action-line').style.display = 'none';
        showLoading(false)
        showCustomPopup(`線路送出成功，快去找關主吧`, false);
    });
}

// 檢查是否已登入
function init() {
    const storedTeamId = localStorage.getItem('teamId');
    const storedTeamName = localStorage.getItem('teamName');
    if (storedTeamId && storedTeamName) {
        // 如果有已儲存的資訊，直接顯示遊戲區域
        rulePopup.style.display = 'none';
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
        });
    }
    initBossLocation();
    getStartTime().then(result => {
      if (!result.startTime) {
          return;
      }
      const stopCountdown = dateCountdown(result.startTime);
      checkGameOver(stopCountdown);
    });
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
function initBossLocation() {
  document.getElementById('fetch-location-btn').addEventListener('click', async () => {

    // 在用戶點擊事件中預先打開一個空窗口
    const newTab = window.open('', '_blank');

    fetch(`${API_BASE_URL}?action=getBossLocation`)
        .then(response => response.json())
        .then(data => {
          console.log(data);

          if (data.success) {
            // 在成功後將新窗口的 URL 更新為實際地址
            newTab.location.href = data.url;
          } else {
            // 如果出現錯誤，關閉窗口並提示用戶
            newTab.close();
            alert('無法取得關主位置: ' + data.message);
          }
        })
        .catch(error => {
          console.error('無法取得關主位置:', error);
          // 如果出現錯誤，關閉窗口並提示用戶
          newTab.close();
          alert('發生錯誤，請稍後再試！');
        });
  });
}