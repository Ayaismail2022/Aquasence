const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyDOj0eiBK-KvlWJb_lfozescN6-Wvs_1xI",
    authDomain: "graduation-project-5069a.firebaseapp.com",
    projectId: "graduation-project-5069a",
    storageBucket: "graduation-project-5069a.firebasestorage.app",
    messagingSenderId: "57072172670",
    appId: "1:57072172670:web:f2d2aca0be1c0794e2222f",
    measurementId: "G-9XXRB6RL71"
});

const db = firebaseApp.firestore();
const auth = firebaseApp.auth();

const clearErrors = () => {
    document.getElementById("name-error").textContent = "";
    document.getElementById("email-error").textContent = "";
    document.getElementById("password-error").textContent = "";
    document.getElementById("confirm-error").textContent = "";
};

const signup = (event) => {
    event.preventDefault();
    clearErrors();

    const fullName = document.getElementById("fullname").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmpassword").value;
    const phone = document.getElementById("phone").value;
    const country = document.getElementById("country").value;

    let valid = true;

    if (fullName.length < 3) {
        document.getElementById("name-error").textContent = "Full name must be at least 3 characters.";
        valid = false;
    }

    if (!email.includes("@")) {
        document.getElementById("email-error").textContent = "Please enter a valid email.";
        valid = false;
    }

    if (password.length < 6 || !/\d/.test(password)) {
        document.getElementById("password-error").textContent = "Password must be at least 6 characters and contain a number.";
        valid = false;
    }

    if (password !== confirmPassword) {
        document.getElementById("confirm-error").textContent = "Passwords do not match.";
        valid = false;
    }

    if (!valid) return;

    auth.createUserWithEmailAndPassword(email, password)
        .then((res) => {
            const uid = res.user.uid;
            return db.collection("users").doc(uid).set({
                fullName,
                email,
                phone,
                country
            });
        })
        .then(() => {
            alert("Registration successful!");
            window.location.href = "loading.html";
        })
        .catch((err) => {
            if (err.code === "auth/email-already-in-use") {
                alert("Email already in use. Logging you in...");
                login(email, password);
            } else {
                alert("Signup failed: " + err.message);
            }
        });
};

const login = (email, password) => {
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            alert("Login successful!");
            window.location.href = "loading.html";
        })
        .catch((err) => {
            alert("Login failed: " + err.message);
        });
};
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 800,
        once: true
    });
    const droplet = document.getElementById('cursor-droplet');
    if (!('ontouchstart' in window)) {
        window.addEventListener('mousemove', (e) => {
            droplet.style.opacity = '1';
            droplet.style.left = e.clientX + 'px';
            droplet.style.top = e.clientY + 'px';
        });
        document.addEventListener('mouseleave', () => {
            droplet.style.opacity = '0';
        });
        const interactiveElements = document.querySelectorAll('a, button, input');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => droplet.classList.add('grow'));
            el.addEventListener('mouseleave', () => droplet.classList.remove('grow'));
        });
    } else {
        droplet.style.display = 'none';
    }
});
const handleLogin = (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then((res) => {
            return db.collection("users").doc(res.user.uid).get();
        })
        .then((doc) => {
            if (doc.exists) {
                alert("Login successful ✅");
                window.location.href = "Water testing.html";
            } else {
                alert("Login failed: user not found");
                auth.signOut();
            }
        })
        .catch((err) => {
            alert("Login failed: " + err.message);
        });
};