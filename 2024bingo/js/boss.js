import { API_BASE_URL } from './common.js';
import { dateCountdown, showCustomPopup, showLoading } from './common.js';

window.clickGameStart = clickGameStart;

// 初始化
init();

function init() {
    getStartTime().then(result => {
        if (!result.startTime) {
            initPage();
            return;
        }
        fetchTeamPaths().then(result => {
            if (result.teamPaths) {
                result.teamPaths.forEach(teamPath => {
                    const div = document.getElementById("path-radio-div");
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
        gamingPage();
        dateCountdown(result.startTime);
    })
}

function clickGameStart() {
    gameStart().then(result => {
        gamingPage();
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

