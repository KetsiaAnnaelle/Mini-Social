/* eslint-disable @typescript-eslint/no-explicit-any */
//import echo from './echo';

import echo from './echo';

export function subscribeToSharedMessages(queryClient: any) {
  const waitForEcho = () => {
    if (echo.connector && echo.connector.connected) {
      // ✅ Echo est prêt, on s'abonne
      echo.channel('messages.shared')
        .listen('MessageShared', (event: any) => {
          queryClient.setQueryData(['sharedOffers'], (oldData: any) => [...(oldData || []), event]);
        });
    } else {
      // 🔁 Attendre 200ms et réessayer
      setTimeout(waitForEcho, 200);
    }
  };

  waitForEcho();
}

