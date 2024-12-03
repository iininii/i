import { API_BASE_URL } from './common.js';
import {
    fetchRank,
    fetchGameOver,
    dateCountdown,
    showCustomPopup,
    showLoading
} from './common.js';

const rankBtn = document.getElementById('rank-btn');

window.clickGameStart = clickGameStart;
window.submitTeam = submitTeam;
var stopCountdown;

// 初始化
init();

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

function init() {
    stopCountdown = getStartTime().then(result => {
        if (!result.startTime) {
            initPage();
            return;
        }
        refreshTeamPaths();
        gamingPage();
        return dateCountdown(result.startTime);
    })
}

function clickGameStart() {
    gameStart().then(result => {
        init();
    })
}

function refreshTeamPaths() {
    fetchTeamPaths().then(result => {
        if (result.teamPaths) {
            const div = document.getElementById("path-radio-div");
            div.innerHTML = "";
            result.teamPaths.forEach(teamPath => {
                const radioButton = document.createElement("input");
                radioButton.type = "radio";
                radioButton.name = "team-answer";
                radioButton.className = "team-line-item";
                radioButton.id = teamPath[0];
                const label = document.createElement("label");
                label.setAttribute("for", teamPath[0]);
                const labelTextElement = document.createElement("p");
                labelTextElement.innerHTML = teamPath[1];
                const image = document.createElement("img");
                image.src = 'images/' + teamPath[2] + '.webp' ;
                label.appendChild(labelTextElement);
                label.appendChild(image);
                div.appendChild(radioButton);
                div.appendChild(label);
            })
        }
    })
}

function initPage() {
    document.getElementById('set-time').removeAttribute('style');
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

async function submitTeam() {
    showLoading(true);
    const selectedRadio = document.querySelector('input[name="team-answer"]:checked');
    if (!selectedRadio) {
        showLoading(false);
        showCustomPopup(`請選擇隊伍`, false);
    }
    const teamId = selectedRadio.id;
    const teamName = document.querySelector(`label[for="${teamId}"] p`).textContent;
    const imgElement = document.querySelector(`label[for="${teamId}"] img`);
    const src = imgElement.getAttribute('src');
    const imgFile = src.split('/').pop(); // Get the file name (v1.webp)
    const path = imgFile.split('.')[0]; // Get the base name (v1)
    const response = await fetch(`${API_BASE_URL}?action=submitTeam&teamId=${teamId}&teamName=${teamName}&path=${path}`, {
      method: 'GET',
      redirect: 'follow'
    });
    const result = await response.json();
    const gameOver = fetchGameOver().then(result => {
        if (result.gameOver) {
            stopCountdown();
            document.getElementById("countdown").innerHTML = "遊戲結束";
            return showCustomPopup(`遊戲結束！`, false).then(result => true);
        }
        return false
    })
    refreshTeamPaths();
    showLoading(false);
    if (!gameOver) {
        showCustomPopup(`提交成功`, false);
    }
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

