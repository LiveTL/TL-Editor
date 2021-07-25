import { getInstance } from '@/plugins/auth0';

// eslint-disable-next-line space-before-function-paren
export async function RouteAuthentication(to, from, next) {
  const authService = getInstance();

  function checkAuth() {
    if (authService.isAuthenticated) {
      return next();
    }

    authService.loginWithRedirect({ appState: { targetUrl: to.fullPath } });
  }

  if (authService.isLoading === false) {
    return checkAuth();
  }

  authService.$watch('isLoading', isLoading => {
    if (isLoading === false) {
      return checkAuth();
    }
  });
}
