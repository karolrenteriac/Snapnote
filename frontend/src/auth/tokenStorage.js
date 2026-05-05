const TOKEN_KEY = 'snapnote_token';
const USER_EMAIL_KEY = 'snapnote_user_email';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getUserEmail() {
  return localStorage.getItem(USER_EMAIL_KEY);
}

export function setUserEmail(email) {
  if (email == null || email === '') {
    localStorage.removeItem(USER_EMAIL_KEY);
    return;
  }
  localStorage.setItem(USER_EMAIL_KEY, String(email).trim().toLowerCase());
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
}
