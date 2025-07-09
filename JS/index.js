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
const db = firebase.firestore();

// =========================================================================
// 1. مراقبة حالة المصادقة (هذا هو الجزء الأهم)
// =========================================================================
// هذه الدالة تعمل تلقائياً عند تحميل أي صفحة، وتتحقق إذا كان المستخدم مسجل أم لا.
auth.onAuthStateChanged(user => {
    // تحديد عناصر الواجهة التي نريد التحكم بها
    const loginButton = document.querySelector('a[href="loading.html"]');
    const signupButton = document.querySelector('a[href="Signup.html"]'); // في صفحة تسجيل الدخول
    const logoutButton = document.getElementById('logout-btn');
    const protectedLink = document.getElementById('protected-link');

    if (user) {
        // --- حالة: المستخدم مسجل دخوله ---
        console.log("User is logged in:", user.email);

        // إخفاء أزرار تسجيل الدخول وإنشاء الحساب
        if (loginButton) loginButton.style.display = 'none';
        if (signupButton) signupButton.style.display = 'none';

        // إظهار زر تسجيل الخروج
        if (logoutButton) logoutButton.style.display = 'inline-block';

        // تفعيل الرابط المحمي (Water Testing)
        if (protectedLink) {
            // نستخدم هذا الأسلوب لإزالة أي مستمعات أحداث قديمة تمنع النقر
            const newLink = protectedLink.cloneNode(true);
            protectedLink.parentNode.replaceChild(newLink, protectedLink);
            newLink.href = "Water testing.html"; // التأكد من أن الرابط صحيح
        }

    } else {
        // --- حالة: المستخدم غير مسجل دخوله ---
        console.log("User is logged out.");

        // إظهار أزرار تسجيل الدخول وإنشاء الحساب
        if (loginButton) loginButton.style.display = 'inline-block';
        if (signupButton) signupButton.style.display = 'inline-block';

        // إخفاء زر تسجيل الخروج
        if (logoutButton) logoutButton.style.display = 'none';

        // تعطيل الرابط المحمي مرة أخرى ومنعه من الانتقال
        if (protectedLink) {
            protectedLink.addEventListener('click', function(event) {
                event.preventDefault(); // منع الانتقال
                alert("Please log in first to see the results!");
                window.location.href = "loading.html";
            });
        }
    }
});


// =========================================================================
// 2. دالة تسجيل الخروج وحذف الحساب (Logout and Delete Account)
// =========================================================================
function logout() {
    const user = auth.currentUser;

    if (user) {
        // تأكيد من المستخدم قبل الحذف النهائي
        const confirmation = confirm("Are you sure you want to log out? This will permanently delete your account.");

        if (confirmation) {
            user.delete().then(() => {
                // تم حذف الحساب بنجاح
                alert("Your account has been successfully deleted.");
                window.location.href = "index.html"; // العودة للصفحة الرئيسية
            }).catch((error) => {
                // حدث خطأ أثناء الحذف
                console.error("Error deleting user:", error);
                // قد يحتاج المستخدم إلى تسجيل الدخول مرة أخرى لتأكيد هويته قبل الحذف
                alert("Error deleting account. You might need to log in again to confirm this action.");
            });
        }
    }
}


// =========================================================================
// 3. دوال تسجيل الدخول وإنشاء الحساب (لا تحتاج لتغيير)
// =========================================================================
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            alert("Login successful! You will now be redirected.");
            window.location.href = "Water testing.html";
        })
        .catch((error) => {
            alert("Login Failed: " + error.message);
        });
}

function handleSignup(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        l
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            alert("Signup successful! Please log in to continue.");
            window.location.href = "loading.html";
        })
        .catch((error) => {
            alert("Signup Failed: " + error.message);
        });
}


// contact form
document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contact-form");

    if (!contactForm) return;

    contactForm.addEventListener("submit", async(e) => {
        e.preventDefault();

        const name = contactForm.name.value.trim();
        const email = contactForm.email.value.trim();
        const message = contactForm.message.value.trim();
        const submitButton = contactForm.querySelector('button[type="submit"]');

        if (!name || !email || !message) {
            alert("Please fill in all fields.");
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        try {
            // 🔁 Get count for next ID
            const snapshot = await db.collection("Contact us").get();
            const count = snapshot.size + 1;
            const newDocId = `contact_${count}`;

            await db.collection("Contact us").doc(newDocId).set({
                name: name,
                email: email,
                message: message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert(`✅ Message saved as '${newDocId}'!`);
            contactForm.reset();
        } catch (error) {
            console.error("❌ Error sending message:", error);
            alert("❌ Something went wrong. Please try again.");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
        }
    });
});