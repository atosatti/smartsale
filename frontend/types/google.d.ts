declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          oneTap: (config: any) => void;
          disableAutoSelect: () => void;
          revoke: (accessToken: string, callback?: () => void) => void;
          cancel: () => void;
        };
        oauth2: {
          initTokenClient: (config: any) => any;
          hasGrantedAllScopes: (tokenResponse: any, scope: string) => boolean;
          hasGrantedAnyScope: (tokenResponse: any, scope: string) => boolean;
        };
      };
    };
  }
}

export {};
