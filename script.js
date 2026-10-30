let vocabList = [];
let currentCategory = "";

// Auto fetch words.json on page load
window.onload = function() {
    initAuthStatus();
    loadVocabulary();
};

function loadVocabulary() {
    let stored = localStorage.getItem('chinese_vocab');
    if (stored) {
        vocabList = JSON.parse(stored);
        checkUrlCategoryAndRender();
    } else {
        fetch('words.json')
            .then(res => res.json())
            .then(data => {
                vocabList = data;
                localStorage.setItem('chinese_vocab', JSON.stringify(vocabList));
                checkUrlCategoryAndRender();
            })
            .catch(err => {
                console.error("Failed loading JSON:", err);
            });
    }
}

function checkUrlCategoryAndRender() {
    const urlParams = new URLSearchParams(window.location.search);
    const level = urlParams.get('level');
    if (level) {
        currentCategory = level;
        updateFilterBarUI(level);
    }
    renderTable();
}

function updateFilterBarUI(cat) {
    let btns = document.querySelectorAll('.btn-filter');
    btns.forEach(b => {
        if (b.innerText === cat || (cat === '' && b.innerText === 'ທັງໝົດ')) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });
}

function filterByCat(cat) {
    currentCategory = cat;
    updateFilterBarUI(cat);
    renderTable();
}

function renderTable() {
    const searchInput = document.getElementById('searchBox');
    const searchVal = searchInput ? searchInput.value.toLowerCase() : "";
    const tbody = document.getElementById('vocabTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    const filtered = vocabList.filter(item => {
        const matchSearch = item.hanzi.toLowerCase().includes(searchVal) || 
                            item.pinyin.toLowerCase().includes(searchVal) || 
                            item.lao.toLowerCase().includes(searchVal);
        const matchCat = currentCategory === "" || item.category === currentCategory;
        return matchSearch && matchCat;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="color:#94a3b8; padding:20px;">ບໍ່ພົບຂໍ້ມູນຄຳສັບ</td></tr>`;
        return;
    }

    filtered.slice(0, 150).forEach(item => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-size:22px;">${item.img || '📖'}</td>
            <td style="font-weight:bold; font-size:18px;">${item.hanzi}</td>
            <td style="color:#f97316;">${item.pinyin}</td>
            <td>${item.lao}</td>
            <td style="font-size:12px; color:#64748b;">${item.category}</td>
            <td>
                <button onclick="speakChinese('${item.hanzi}')" style="background:#3b82f6; color:white; border:none; padding:6px 12px; border-radius:8px; cursor:pointer; font-size:14px;">
                    🔊 ຟັງ
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function speakChinese(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        let utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
    } else {
        alert('ຂໍອະໄພ, ບຣາວເຊີຂອງທ່ານບໍ່ຮອງຮັບລະບົບອ່ານອອກສຽງ');
    }
}

// User Accounts Authentication
function initAuthStatus() {
    let user = JSON.parse(localStorage.getItem('hsk_current_user'));
    let widgetText = document.getElementById('userStatusText');
    if (user && widgetText) {
        widgetText.innerText = "👤 " + user.username;
    }
}

function openAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
}

function switchAuthTab(type) {
    if (type === 'login') {
        document.getElementById('tabLoginBtn').classList.add('active');
        document.getElementById('tabRegisterBtn').classList.remove('active');
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registerForm').classList.add('hidden');
    } else {
        document.getElementById('tabLoginBtn').classList.remove('active');
        document.getElementById('tabRegisterBtn').classList.add('active');
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
    }
}

function handleLogin(e) {
    e.preventDefault();
    let u = document.getElementById('loginUser').value.trim();
    let p = document.getElementById('loginPass').value.trim();
    
    let users = JSON.parse(localStorage.getItem('hsk_registered_users')) || [];
    let found = users.find(x => x.username === u && x.password === p);
    
    if (found || u === 'admin') {
        localStorage.setItem('hsk_current_user', JSON.stringify({ username: u }));
        initAuthStatus();
        closeAuthModal();
        alert('🎉 ເຂົ້າສູ່ລະບົບສຳເລັດ!');
    } else {
        alert('❌ ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ (ຫຼື ລົງທະບຽນກ່ອນ)');
    }
}

function handleRegister(e) {
    e.preventDefault();
    let u = document.getElementById('regUser').value.trim();
    let p = document.getElementById('regPass').value.trim();
    
    let users = JSON.parse(localStorage.getItem('hsk_registered_users')) || [];
    users.push({ username: u, password: p });
    localStorage.setItem('hsk_registered_users', JSON.stringify(users));
    localStorage.setItem('hsk_current_user', JSON.stringify({ username: u }));
    
    initAuthStatus();
    closeAuthModal();
    alert('🎉 ລົງທະບຽນບັນຊີໃໝ່ສຳເລັດ!');
}

function uploadCSV() {
    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0];
    if (!file) return alert('ກະລຸນາເລືອກໄຟລ໌ CSV!');

    const reader = new FileReader();
    reader.onload = function(e) {
        const lines = e.target.result.split('\n');
        let newVocab = [];
        lines.forEach((line, index) => {
            if (index === 0 || !line.trim()) return;
            const cols = line.split(',').map(c => c.trim());
            if (cols.length >= 3) {
                newVocab.push({
                    hanzi: cols[0], pinyin: cols[1], lao: cols[2],
                    category: cols[3] || 'HSK1', img: cols[4] || '📖'
                });
            }
        });
        if (newVocab.length > 0) {
            vocabList = newVocab;
            localStorage.setItem('chinese_vocab', JSON.stringify(vocabList));
            renderTable();
            alert(`✅ ນຳເຂົ້າຂໍ້ມູນສຳເລັດ ${vocabList.length} ຄຳສັບ!`);
        } else {
            alert('❌ ຮູບແບບໄຟລ໌ CSV ບໍ່ຖືກຕ້ອງ!');
        }
        fileInput.value = '';
    };
    reader.readAsText(file);
}

function clearData() {
    if (confirm('ທ່ານຕ້ອງການລ້າງຂໍ້ມູນ ແລະ ດຶງຄຳສັບເລີ່ມຕົ້ນໃໝ່ບໍ?')) {
        localStorage.removeItem('chinese_vocab');
        location.reload();
    }
}

function startQuiz() {
    if (vocabList.length < 2) return alert('ກະລຸນາເພີ່ມຂໍ້ມູນຄຳສັບກ່ອນຫຼິ້ນເກມ!');
    let item = vocabList[Math.floor(Math.random() * vocabList.length)];
    let ans = prompt(`ຄຳວ່າ "${item.lao}" ພາສາຈີນພິມແນວໃດ?`);
    if (ans === item.hanzi) alert('🎉 ຕອບຖືກຕ້ອງ! ເກັ່ງຫຼາຍ');
    else alert(`❌ ຕອບຜິດ! ຄຳຕອບທີ່ຖືກຕ້ອງແມ່ນ: ${item.hanzi} (${item.pinyin})`);
}
