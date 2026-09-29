import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { Linking } from 'react-native';
import { parseImportLink } from '../Utils/reelLinks';
import { logger } from '../Utils/debugger';

interface ShareIntentContextType {
  /** Text shared into the app (usually a reel link) that hasn't been handled yet. */
  pendingShare: string | null;
  clearPendingShare: () => void;
}

const ShareIntentContext = createContext<ShareIntentContextType | undefined>(undefined);

/**
 * Receives `nextup://import?url=…` links from the iOS share extension and the
 * Android share intent (MainActivity rewrites SEND into this link), both on
 * cold start (getInitialURL) and while the app is running ('url' events).
 * Kept outside navigation so shares arriving during loading or onboarding are
 * held until AppNavigator can show them.
 */
export const ShareIntentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pendingShare, setPendingShare] = useState<string | null>(null);

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      const sharedText = parseImportLink(url);
      if (sharedText) {
        logger.info('ShareIntent', 'Received shared content', { length: sharedText.length });
        setPendingShare(sharedText);
      }
    };

    Linking.getInitialURL()
      .then(handleUrl)
      .catch(error => logger.error('ShareIntent', 'Failed to read initial URL', error));

    const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => subscription.remove();
  }, []);

  const clearPendingShare = useCallback(() => setPendingShare(null), []);

  return (
    <ShareIntentContext.Provider value={{ pendingShare, clearPendingShare }}>
      {children}
    </ShareIntentContext.Provider>
  );
};

export const useShareIntent = (): ShareIntentContextType => {
  const context = useContext(ShareIntentContext);
  if (!context) {
    throw new Error('useShareIntent must be used within a ShareIntentProvider');
  }
  return context;
};
