import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '@stores/authStore';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

export const RootNavigator: React.FC = () => {
  const token = useAuthStore((state) => state.token);

  return (
    <NavigationContainer>
      {token ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default RootNavigator;
