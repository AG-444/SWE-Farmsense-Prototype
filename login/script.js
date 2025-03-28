document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
    });

    signupTab.addEventListener('click', () => {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
    });

    // Temporary user storage
    if (!sessionStorage.getItem('users')) {
        sessionStorage.setItem('users', JSON.stringify([]));
    }

    // Signup functionality
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        
        const users = JSON.parse(sessionStorage.getItem('users'));
        
        // Check if user already exists
        if (users.some(user => user.email === email)) {
            document.getElementById('signupSuccess').textContent = 'User already exists! Please login.';
            return;
        }
        
        // Add new user
        users.push({ name, email, password });
        sessionStorage.setItem('users', JSON.stringify(users));
        sessionStorage.setItem('currentUser', JSON.stringify({ name, email }));
        
        document.getElementById('signupSuccess').textContent = 'Account created successfully!';
        signupForm.reset();
        
        // Switch to login tab after successful signup
        setTimeout(() => {
            loginTab.click();
        }, 1500);
    });

    // Login functionality
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const users = JSON.parse(sessionStorage.getItem('users'));
        
        const user = users.find(user => user.email === email && user.password === password);
        
        if (user) {
            sessionStorage.setItem('currentUser', JSON.stringify({ name: user.name, email: user.email }));
            window.location.href = '../index.html'; // Redirect to landing page
        } else {
            document.getElementById('loginError').textContent = 'Invalid email or password!';
        }
    });
});
