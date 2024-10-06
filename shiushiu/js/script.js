const formBox = document.getElementById('formBox');
const form = document.getElementById('commentForm');
const submitButton = document.getElementById('btn-send');

const formResult = document.getElementById('formResult');
const statusElement = document.getElementById('status');

const messageList = document.getElementById('candyBox');

// Google Apps Script Web App 的 URL
const shiuFormScriptURL = 'https://script.google.com/macros/s/AKfycbxqg2Nj5f9VLo_PtjWV-m0LrMUllcA0sQM1TKdbD58fcp81xvHYuPbN-i5kK5XpklRC/exec';
const shiuGenderScriptURL = 'https://script.google.com/macros/s/AKfycbzq25grI-6P-vZrtgRMx1W05n0U0Iugv3LJT-pNkb2B1S7McwNFBzNQBR7SFXW0P8OC/exec';


// 1. 提交表單並發送資料到 Google 試算表
form.addEventListener('submit', function(e) {
    e.preventDefault();

    // 禁用提交按鈕，避免多次提交
    submitButton.disabled = true;

    const name = document.getElementById('name').value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const message = document.getElementById('message').value;
    const bet = document.getElementById('bet').value;
    const currentTime = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });


    // 構建要傳送的資料
    const data = {
        姓名: name,
        猜猜: gender,
        留言: message,
        下注: bet,
        時間: currentTime // 添加傳送時間
    };

    // 發送 POST 請求到 Google Apps Script Web App
    fetch(shiuFormScriptURL, {
        method: 'POST',
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'success') {
            formBox.style.display = 'none';
            formResult.style.display = 'block';
            statusElement.textContent = '留言已成功提交！';
            form.reset();

            //////////// 即時在頁面上顯示新提交的留言
            // 創建 <li> 元素
            const listItem = document.createElement('li');
            const itemInner = document.createElement('div');
            listItem.className = `${gender}`;
            itemInner.className = 'itemInner';

            // 創建 <span> 元素，並設置 class 為 "post-name"
            const nameSpan = document.createElement('span');
            nameSpan.className = 'post-name';

            // 隨機大小
            const randomNum = (Math.floor(Math.random() * 20) + 8);
            listItem.style.width = randomNum + 'vw';
            listItem.style.fontSize = randomNum/5 + 'vw';
            
             // 顯示姓名
            nameSpan.textContent = `${name}`;
            
            // 將 <span> 添加到 <li> 中
            listItem.appendChild(itemInner);
            itemInner.appendChild(nameSpan);
            
            // 將 <li> 添加到 messageList 中的第一個
            messageList.insertBefore(listItem, messageList.firstElementChild);

        } else {
            statusElement.textContent = '提交失敗，請稍後再試。';
        }
    })
    .finally(() => {
        // 無論成功或失敗，回應後重新啟用提交按鈕
        submitButton.disabled = false;
    })
    .catch(error => {
        console.error('Error:', error);
        statusElement.textContent = '提交失敗，請稍後再試。';
    });
});

// 2. 從 Google 試算表獲取所有留言並顯示在頁面上
function fetchMessages() {
    fetch(shiuFormScriptURL)
        .then(response => response.json())   // 解析為 JSON 格式
        .then(data => {
            data.reverse().forEach(entry => {

                // 創建 <li> 元素
                const listItem = document.createElement('li');
                const itemInner = document.createElement('div');
                listItem.className = `${entry.猜猜}`;
                itemInner.className = 'itemInner';

                // 創建 <span> 元素，並設置 class 為 "post-name"
                const nameSpan = document.createElement('span');
                nameSpan.className = 'post-name';

                // 隨機大小
                const randomNum = (Math.floor(Math.random() * 20) + 8);
                listItem.style.width = randomNum + 'vw';
                listItem.style.fontSize = randomNum/5 + 'vw';
                
                 // 顯示姓名
                nameSpan.textContent = `${entry.姓名}`;
                
                // 將 <span> 添加到 <li> 中
                listItem.appendChild(itemInner);
                itemInner.appendChild(nameSpan);
                
                // 將 <li> 添加到 messageList 中
                messageList.appendChild(listItem);

            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
};

// 3. 從 Google 試算表獲取性別並顯示在頁面上
function fetchGender() {
    fetch(shiuGenderScriptURL)
        .then(response2 => response2.json())
        .then(dataGender => {

            if (dataGender && dataGender.length > 0 && dataGender[0].性別) {

                var resultGenderText = dataGender[0].性別;

                // 展示
                document.getElementById('revealButton').addEventListener('click', function() {
                    var genderText = document.getElementById('genderText');
                    var genderReveal = document.getElementById('genderReveal');
                    
                    // 根據性別更改文字
                    if (resultGenderText === 'isBoy') {
                        document.getElementById("popup-result").style.display = "block";
                        genderText.innerHTML = '<img src="images/img_boy.webp"><p>💙 咻咻是個男孩！💙</p>';
                    } else if (resultGenderText === 'isGirl') {
                        document.getElementById("popup-result").style.display = "block";
                        genderText.innerHTML = '<img src="images/img_girl.webp"><p>💖 咻咻是個女孩！💖</p>';
                    } else {
                        document.getElementById("popup-result").style.display = "block";
                        genderText.textContent = '性別未確定';
                    }
                    
                    // 顯示性別揭曉結果
                    genderReveal.classList.remove('hidden');
                });

            } 

            
        })
        .catch(error => {
            console.error('Error:', error);
        });
};

// 初始化時加載現有的資料
fetchMessages();
fetchGender();


function dateCountdown() {
    // 設定 GMT+8 時區的目標日期（用本地時間模擬 GMT+8）
    const targetDate = new Date("2024-10-19T20:00:00+08:00").getTime();

    // 每秒更新倒數
    const countdownTimer = setInterval(function() {
        const now = new Date().getTime(); // 獲取當前 UTC 時間戳
        const distance = targetDate - now;

        // 計算天數、時數、分鐘數和秒數
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // 顯示倒數計時
        document.getElementById("countdown").innerHTML = 
            "倒數 " + days + "天 " + hours + "小時 " + minutes + "分 " + seconds + "秒 揭曉";

        // 如果倒數結束，顯示按鈕並停止倒數
        if (distance < 1000) {
            clearInterval(countdownTimer);
            document.getElementById("countdown").style.display = "none";
            document.getElementById("joinButton").style.display = "none";
            document.getElementById("revealButton").style.display = "inline-block";
        } else {
            document.getElementById("joinButton").style.display = "inline-block";
        }
    }, 1000);
};

dateCountdown();

        


jQuery(function($) {

    $(".btn-normal").on('click', function(event) {

      $('.popup-form').fadeIn();

    });

    /*-------- 其他功能 --------*/
    $(".pop-close, .popup-result").on('click', function(event) {
        $(".popup").fadeOut();
    });



});


$(window).on('load', function (e) {
    // delete preloader
    $(".preloader").fadeOut(300);
});


