let defaultData = [
    { hanzi: "你好", pinyin: "nǐ hǎo", lao: "ສະບາຍດີ", category: "HSK1", img: "👋" },
    { hanzi: "早上好", pinyin: "zǎoshang hǎo", lao: "ສະບາຍດີຕອນເຊົ້າ", category: "HSK1", img: "🌅" },
    { hanzi: "谢谢", pinyin: "xièxie", lao: "ຂອບໃຈ", category: "HSK1", img: "🙏" },
    { hanzi: "不客气", pinyin: "bú kèqi", lao: "ບໍ່ເປັນຫຍັງ / ດ້ວຍຄວາມຍິນດີ", category: "HSK1", img: "😊" },
    { hanzi: "再见", pinyin: "zàijiàn", lao: "ລາວກ່ອນ / ພົບກັນໃໝ່", category: "HSK1", img: "👋" },
    { hanzi: "苹果", pinyin: "píngguǒ", lao: "ໝາກໂປມ", category: "HSK2", img: "🍎" },
    { hanzi: "水", pinyin: "shuǐ", lao: "ນ້ຳ", category: "HSK2", img: "💧" }
];

let vocabList = JSON.parse(localStorage.getItem('chinese_vocab')) || defaultData;
let currentCategory = "";

// Check URL params for level filter on load
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const level = urlParams.get('level');
    if (level) {
        currentCategory = level;
    }
    renderTable();
};

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

    filtered.forEach(item => {
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
    if (confirm('ທ່ານຕ້ອງການລ້າງຂໍ້ມູນ ແລະ ກັບຄືນສູ່ຄຳສັບເລີ່ມຕົ້ນບໍ?')) {
        localStorage.removeItem('chinese_vocab');
        vocabList = defaultData;
        renderTable();
    }
}

function startQuiz() {
    if (vocabList.length < 2) return alert('ກະລຸນາເພີ່ມຂໍ້ມູນຄຳສັບກ່ອນຫຼິ້ນເກມ!');
    let item = vocabList[Math.floor(Math.random() * vocabList.length)];
    let ans = prompt(`ຄຳວ່າ "${item.lao}" ພາສາຈີນພິມແນວໃດ?`);
    if (ans === item.hanzi) alert('🎉 ຕອບຖືກຕ້ອງ! ເກັ່ງຫຼາຍ');
    else alert(`❌ ຕອບຜິດ! ຄຳຕອບທີ່ຖືກຕ້ອງແມ່ນ: ${item.hanzi} (${item.pinyin})`);
}
