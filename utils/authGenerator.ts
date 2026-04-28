
/**
 * --- HỆ THỐNG SINH MÃ BẢO MẬT ĐỒNG BỘ (CLIENT-SIDE) ---
 * UPDATE: CHẾ ĐỘ UNIVERSAL V3 (THỨ + NGÀY + THÁNG + NĂM)
 * Logic này phải GIỐNG HỆT nhau ở cả App Mẹ và App Con.
 */

// 1. KHÓA BÍ MẬT (Thay đổi chuỗi này để đổi toàn bộ hệ thống mã)
// Lưu ý: Nếu đổi key này, phải cập nhật lại Script cho tất cả App Con
const SECRET_SEED_KEY = "9R_STUDIO_UNIVERSAL_KEY_@2025_FULL_DATE_LOCK";

// 2. BỘ KÝ TỰ CHO PHÉP (Bỏ các ký tự dễ nhầm: I, 1, 0, O)
const ALLOWED_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 4; // Độ dài mã (VD: K7XM)

// 3. CÁC HÀM HỖ TRỢ TÍNH TOÁN

// Thuật toán LCG (Linear Congruential Generator)
const lcg = (seed: number) => {
    const a = 1664525;
    const c = 1013904223;
    const m = 4294967296;
    return (a * seed + c) % m;
};

const stringToHash = (str: string) => {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

// --- HÀM CHÍNH: SINH MÃ THEO THỜI GIAN (App Mẹ) ---
export const generateDailyCode = (): string => {
    const today = new Date();
    
    // Lấy các thành phần thời gian: Năm, Tháng, Ngày, Thứ
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const dayOfWeek = today.getDay(); // 0 (CN) -> 6 (Thứ 7)

    // Công thức Hạt giống: SECRET + NĂM + THÁNG + NGÀY + THỨ
    // Đảm bảo tính duy nhất và thay đổi mỗi ngày
    const seedInput = `${SECRET_SEED_KEY}_${year}${month}${day}_${dayOfWeek}`;
    
    let seed = stringToHash(seedInput);
    let code = "";

    // Sinh ký tự từ hạt giống
    for (let i = 0; i < CODE_LENGTH; i++) {
        seed = lcg(seed);
        const charIndex = seed % ALLOWED_CHARS.length;
        code += ALLOWED_CHARS[charIndex];
    }

    return code;
};

// --- HÀM XUẤT SOURCE CODE CHO APP CON (UNIVERSAL SCRIPT) ---
// Script này chứa logic tính toán Y HỆT hàm generateDailyCode ở trên
export const getClientSideAuthScript = () => {
    return `<!-- 
============================================================
HƯỚNG DẪN TÍCH HỢP BẢO MẬT (9R VIDEO - UNIVERSAL V3)
============================================================
1. Copy TOÀN BỘ đoạn code bên dưới (bao gồm cả thẻ <script>).
2. Mở file "index.html" của App Con (hoặc file Header chung).
3. Dán vào ngay trước thẻ đóng </body>.
4. Lưu lại và upload lên host. Xong!
============================================================ 
-->

<script>
(function() {
    /* --- CẤU HÌNH HỆ THỐNG --- */
    const CONFIG = {
        SECRET: "${SECRET_SEED_KEY}",
        CHARS: "${ALLOWED_CHARS}",
        LENGTH: ${CODE_LENGTH}
    };

    /* --- LOGIC BẢO MẬT --- */

    // CSS Màn hình khóa
    const style = document.createElement('style');
    style.innerHTML = \`
        #r9-auth-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: #0f172a; z-index: 2147483647;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; color: white;
        }
        #r9-auth-box {
            background: #1e293b; padding: 2rem; border-radius: 1rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            border: 1px solid #334155; text-align: center; max-width: 90%; width: 400px;
        }
        #r9-auth-title { margin: 0 0 1rem 0; color: #38bdf8; font-size: 1.5rem; font-weight: 800; }
        #r9-auth-input {
            width: 100%; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;
            border: 2px solid #475569; background: #0f172a; color: white;
            text-align: center; font-size: 2rem; letter-spacing: 0.5rem;
            font-weight: 700; outline: none; text-transform: uppercase;
        }
        #r9-auth-input:focus { border-color: #38bdf8; box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2); }
        #r9-auth-btn {
            width: 100%; padding: 1rem; border: none; border-radius: 0.5rem;
            background: linear-gradient(135deg, #0ea5e9, #6366f1);
            color: white; font-weight: 700; font-size: 1.1rem; cursor: pointer; transition: all 0.2s;
        }
        #r9-auth-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3); }
        .r9-shake { animation: r9-shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes r9-shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
    \`;
    document.head.appendChild(style);

    // HTML Giao diện
    const overlayHTML = \`
        <div id="r9-auth-box">
            <h2 id="r9-auth-title">XÁC THỰC QUYỀN TRUY CẬP</h2>
            <p style="color:#94a3b8; margin-bottom:1.5rem; font-size:0.9rem;">
                Vui lòng nhập Mã Truy Cập từ <strong>AI Video - 9R</strong><br/>
                để mở khóa ứng dụng này.
            </p>
            <input type="text" id="r9-auth-input" placeholder="XXXX" maxlength="4" autocomplete="off">
            <button id="r9-auth-btn">MỞ KHÓA</button>
        </div>
    \`;

    // Hàm tính mã (Giống hệt App Mẹ)
    function calculateCode(dateObj) {
        const year = dateObj.getFullYear();
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const day = dateObj.getDate().toString().padStart(2, '0');
        const dayOfWeek = dateObj.getDay(); // 0-6
        
        // Công thức: SECRET + NĂM + THÁNG + NGÀY + THỨ
        const seedStr = CONFIG.SECRET + "_" + year + month + day + "_" + dayOfWeek;
        
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) {
            hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
            hash = hash & hash;
        }
        hash = Math.abs(hash);

        const lcg = (s) => (1664525 * s + 1013904223) % 4294967296;
        let seed = hash;
        let code = "";
        for (let i = 0; i < CONFIG.LENGTH; i++) {
            seed = lcg(seed);
            code += CONFIG.CHARS[seed % CONFIG.CHARS.length];
        }
        return code;
    }

    // MAIN EXECUTION
    const todayStr = new Date().toDateString();
    const SESSION_KEY = '9r_auth_session_' + todayStr;

    if (sessionStorage.getItem(SESSION_KEY) === 'true') return;

    const overlay = document.createElement('div');
    overlay.id = 'r9-auth-overlay';
    overlay.innerHTML = overlayHTML;
    
    const init = () => {
        document.body.appendChild(overlay);

        const input = document.getElementById('r9-auth-input');
        const btn = document.getElementById('r9-auth-btn');

        // Tính mã cho Hôm nay và Hôm qua (đề phòng lệch giờ)
        const now = new Date();
        const codeToday = calculateCode(now);
        
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const codeYesterday = calculateCode(yesterday);

        const check = () => {
            const val = input.value.toUpperCase().trim();
            if (val === codeToday || val === codeYesterday) {
                sessionStorage.setItem(SESSION_KEY, 'true');
                btn.innerHTML = "THÀNH CÔNG!";
                btn.style.background = "#10b981";
                setTimeout(() => overlay.remove(), 500);
            } else {
                input.classList.add('r9-shake');
                input.style.borderColor = "#ef4444";
                setTimeout(() => input.classList.remove('r9-shake'), 500);
            }
        };

        btn.onclick = check;
        input.onkeypress = (e) => e.key === 'Enter' && check();
        input.focus();
    };

    if (document.body) init();
    else window.addEventListener('DOMContentLoaded', init);

})();
</script>`;
};
