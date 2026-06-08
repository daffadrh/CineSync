import { loginUser, loginWithGoogle, observeAuthState } from './auth.js';

// TODO: point this at /home once the Home screen is built
const REDIRECT_TARGET = '/discover';

const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');
const submitLabel = document.getElementById('submitLabel');
const submitSpinner = document.getElementById('submitSpinner');
const googleBtn = document.getElementById('googleBtn');
const errorBanner = document.getElementById('errorBanner');

function showError(message) {
    errorBanner.textContent = message;
    errorBanner.classList.remove('hidden');
}

function clearError() {
    errorBanner.classList.add('hidden');
    errorBanner.textContent = '';
}

function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    googleBtn.disabled = isLoading;
    submitSpinner.classList.toggle('hidden', !isLoading);
    submitLabel.textContent = isLoading ? 'Logging in…' : 'Log In';
}

function friendlyAuthError(error) {
    switch (error.code) {
        case 'auth/invalid-email': return 'That email address looks invalid.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential': return 'Incorrect email or password.';
        case 'auth/too-many-requests': return 'Too many attempts. Please wait a moment and try again.';
        case 'auth/popup-closed-by-user': return 'Google sign-in was cancelled.';
        default: return 'Something went wrong. Please try again.';
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    try {
        await loginUser(emailInput.value.trim(), passwordInput.value);
        window.location.href = REDIRECT_TARGET;
    } catch (error) {
        showError(friendlyAuthError(error));
        setLoading(false);
    }
});

googleBtn.addEventListener('click', async () => {
    clearError();
    setLoading(true);
    try {
        await loginWithGoogle();
        window.location.href = REDIRECT_TARGET;
    } catch (error) {
        showError(friendlyAuthError(error));
        setLoading(false);
    }
});

// Already signed in? Skip straight past the login screen.
observeAuthState((user) => {
    if (user) window.location.href = REDIRECT_TARGET;
});
