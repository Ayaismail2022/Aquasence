// استبدل هذا بكود إعداد Firebase الخاص بك
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore(); // <-- تهيئة Firestore

// =========================================================================
//  1. إدارة حالة المستخدم (Login/Logout) في جميع الصفحات
// =========================================================================
auth.onAuthStateChanged(user => {
    // ... (هذا الجزء يبقى كما هو من المرة السابقة)
    const loginButton = document.querySelector('a[href="loading.html"]');
    const signupButton = document.querySelector('a[href="Signup.html"]');
    const logoutButton = document.getElementById('logout-btn');

    if (user) {
        if (loginButton) loginButton.style.display = 'none';
        if (signupButton) signupButton.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'inline-block';
    } else {
        if (loginButton) loginButton.style.display = 'inline-block';
        if (signupButton) signupButton.style.display = 'inline-block';
        if (logoutButton) logoutButton.style.display = 'none';
    }
});

// =========================================================================
//  2. دوال المصادقة (Login, Signup, Logout)
// =========================================================================
function handleLogin(event) { /* ... (تبقى كما هي) ... */ }

function handleSignup(event) { /* ... (تبقى كما هي) ... */ }

function logout() { /* ... (تبقى كما هي) ... */ }
// ملاحظة: لقد تركت هذه الدوال فارغة هنا للاختصار، لكن في ملفك يجب أن تكون كاملة

// =========================================================================
//  3. منطق صفحة اختبار المياه (Water Testing Page Logic)
// =========================================================================

// هذه الدالة ستقوم بتهيئة كل شيء في صفحة water testing
function initWaterTestingPage() {
    // --- Configuration for each sensor ---
    const sensorConfig = {
        ph: { title: 'pH Level Trend', label: 'pH', color: 'rgb(234, 88, 12)', min: 6, max: 9, unit: '', getValue: () => getRandomNumber(6.5, 8.5, 1) },
        turbidity: { title: 'Turbidity Trend', label: 'NTU', color: 'rgb(34, 197, 94)', min: 0, max: 10, unit: ' NTU', getValue: () => getRandomNumber(0.5, 5, 2) },
        tds: { title: 'TDS Trend', label: 'ppm', color: 'rgb(59, 130, 246)', min: 100, max: 500, unit: ' ppm', getValue: () => getRandomNumber(150, 450, 0) },
        temperature: { title: 'Temperature Trend', label: '°C', color: 'rgb(239, 68, 68)', min: 10, max: 40, unit: '°C', getValue: () => getRandomNumber(20, 35, 1) }
    };

    let liveChart;

    // --- دالة تحديث البيانات الحية (مع الإضافة الجديدة) ---
    function updateLiveData() {
        // إنشاء كائن (object) لتخزين القراءات الجديدة
        const newReading = {
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // الأهم: إضافة الوقت الحالي
        };

        // تحديث قيم البطاقات وتجميعها في الكائن
        for (const key in sensorConfig) {
            const value = sensorConfig[key].getValue();
            newReading[key] = parseFloat(value); // تخزين القيمة الرقمية

            const valueEl = document.getElementById(`${key}-value`);
            if (valueEl) {
                valueEl.innerHTML = `${value}<span class="text-3xl text-gray-500 font-medium">${sensorConfig[key].unit}</span>`;
            }
        }

        // ===== الجزء الجديد: تخزين البيانات في Firestore =====
        db.collection("sensor_readings").add(newReading)
            .then((docRef) => {
                console.log("Document written with ID: ", docRef.id);
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
        // ===============================================

        // تحديث الرسم البياني (يبقى كما هو)
        const chartConfig = sensorConfig[liveChart.currentSensor];
        liveChart.data.labels.push(new Date().toLocaleTimeString('en-US'));
        liveChart.data.datasets[0].data.push(newReading[liveChart.currentSensor]);
        if (liveChart.data.labels.length > 15) {
            liveChart.data.labels.shift();
            liveChart.data.datasets[0].data.shift();
        }
        liveChart.update('none');

        // تحديث الطابع الزمني على الشاشة
        document.getElementById('last-updated').innerText = `Last updated: ${new Date().toLocaleTimeString('en-US')}`;
    }

    // --- باقي دوال الرسم البياني والواجهة (تبقى كما هي) ---
    function createChart(sensorKey) { /* ... الكود الكامل لهذه الدالة ... */ }

    function updateActiveTab(selectedKey) { /* ... الكود الكامل لهذه الدالة ... */ }

    function updateChart(sensorKey) { /* ... الكود الكامل لهذه الدالة ... */ }

    function getRandomNumber(min, max, decimals) { return (Math.random() * (max - min) + min).toFixed(decimals); }

    // --- تهيئة الصفحة ---
    // (هنا يجب نسخ ولصق باقي الدوال من ملف water testing.html)
    // ...
    // مثال على دالة createChart
    function createChart(sensorKey) {
        const config = sensorConfig[sensorKey];
        const ctx = document.getElementById('liveChart').getContext('2d');
        liveChart = new Chart(ctx, { /* ... إعدادات الرسم البياني ... */ });
        liveChart.currentSensor = sensorKey; // لتتبع الحساس الحالي
    }
    // ... قم بنسخ باقي الدوال هنا ...

    // بدء التشغيل
    createChart('ph');
    updateActiveTab('ph');
    updateChart('ph');
    setInterval(updateLiveData, 3000); // إرسال البيانات كل 3 ثواني
    updateLiveData(); // استدعاء فوري أول مرة
}


// =========================================================================
//  4. تشغيل الكود الخاص بالصفحة الحالية فقط
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // التحقق من وجود عنصر خاص بصفحة اختبار المياه
    if (document.getElementById('liveChart')) {
        initWaterTestingPage();
    }
    // يمكنك إضافة المزيد من الـ if هنا لتهيئة صفحات أخرى
});