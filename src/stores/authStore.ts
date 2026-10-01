import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STUDENT, examStamp } from '@constants/student';

interface AuthState {
  token: string | null;
  userIdentifier: string | null;
  login: (identifier: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userIdentifier: null,
      login: (identifier: string) => {
        const stamp = examStamp();
        const fakeToken = `ktxgo-${STUDENT.mssv}-${stamp}`;
        set({
          token: fakeToken,
          userIdentifier: identifier,
        });
      },
      logout: () => {
        set({
          token: null,
          userIdentifier: null,
        });
      },
    }),
    {
      name: `ktxgo-auth-${STUDENT.mssv}`,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useAuthStore;
