import create from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface Notification {
  type: string;
  message: string;
  description?: string;
  txid?: string;
}

interface NotificationStore {
  notifications: Notification[];
  set: (fn: (state: NotificationStore) => void) => void;
}

const useNotificationStore = create<NotificationStore>()(
  immer((set) => ({
    notifications: [],
    set: (fn) => set(fn),
  }))
);

export default useNotificationStore;
