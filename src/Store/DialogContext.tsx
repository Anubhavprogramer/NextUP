import React, { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { ActionSheet, ActionSheetAction, ActionSheetOptions } from '../Components/Regular/ActionSheet';

interface DialogContextType {
  /** Show the themed bottom sheet (replaces Alert.alert action menus). */
  showActionSheet: (options: ActionSheetOptions) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [options, setOptions] = useState<ActionSheetOptions | null>(null);
  const [visible, setVisible] = useState(false);

  const showActionSheet = useCallback((next: ActionSheetOptions) => {
    setOptions(next);
    setVisible(true);
  }, []);

  const handleClosed = useCallback((action?: ActionSheetAction) => {
    setVisible(false);
    setOptions(null);
    action?.onPress();
  }, []);

  return (
    <DialogContext.Provider value={{ showActionSheet }}>
      {children}
      {options && <ActionSheet {...options} visible={visible} onClosed={handleClosed} />}
    </DialogContext.Provider>
  );
};

export const useDialog = (): DialogContextType => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
