export function validateSignUp(data) {
    const { login, password, username, referralCode } = data;

    if (!login || typeof login !== 'string' || login.length < 3 || login.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(login)) {
        throw new Error('Login must be 3-50 characters, alphanumeric, _, -');
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
        throw new Error('Password must be at least 6 characters');
    }

    if (username && typeof username !== 'string' && username?.length < 3 || username?.length > 50) {
        throw new Error('Username must be 3-50 characters');
    }

    if (referralCode && (typeof referralCode !== 'string' || referralCode.length < 3 || referralCode.length > 50)) {
        throw new Error('Invalid referral code');
    }

    return true;
}

export function validateLogin(data) {
    const { login, password } = data;

    if (!login || typeof login !== 'string') {
        throw new Error('Login is required');
    }

    if (!password || typeof password !== 'string') {
        throw new Error('Password is required');
    }

    return true;
}