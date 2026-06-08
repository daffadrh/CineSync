import { registerUser, loginWithGoogle, observeAuthState } from './auth.js';

// TODO: point this at /home once the Home screen is built
const REDIRECT_TARGET = '/discover';

const form = document.getElementById('registerForm');
const displayNameInput = document.getElementById('displayName');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
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
    submitLabel.textContent = isLoading ? 'Creating account…' : 'Create Account';
}

function friendlyAuthError(error) {
    switch (error.code) {
        case 'auth/invalid-email': return 'That email address looks invalid.';
        case 'auth/email-already-in-use': return 'An account with this email already exists.';
        case 'auth/weak-password': return 'Please choose a password with at least 6 characters.';
        case 'auth/popup-closed-by-user': return 'Google sign-in was cancelled.';
        default: return 'Something went wrong. Please try again.';
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    if (passwordInput.value !== confirmPasswordInput.value) {
        showError('Passwords do not match.');
        return;
    }

    setLoading(true);
    try {
        await registerUser(emailInput.value.trim(), passwordInput.value, displayNameInput.value.trim());
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

// Already signed in? Skip straight past the registration screen.
observeAuthState((user) => {
    if (user) window.location.href = REDIRECT_TARGET;
});
