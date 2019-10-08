export const clientId = process.env.ONE_DRIVE_CLIENT_ID;
export const redirectUri = process.env.ONE_DRIVE_REDIRECT_PAGE;
export const redirectUriLogout = process.env.ONE_DRIVE_REDIRECT_LOGOUT;

export function authenticate() {
  window.open(`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&scope=User.Read&response_type=code&redirect_uri=${redirectUri}`, '_self');
}

export function logoutAccount() {
  window.open(`https://login.live.com/oauth20_logout.srf?client_id=${clientId}&redirect_uri=${redirectUriLogout}`, '_self');
}
