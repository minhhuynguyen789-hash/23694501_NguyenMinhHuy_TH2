import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ShopStack from './ShopStack';
import CartScreen from '@screens/CartScreen';
import MeScreen from '@screens/MeScreen';
import { VARIANT } from '@constants/student';
import { COLORS } from '@constants/theme';
import { useCartStore } from '@stores/cartStore';

export type MainTabsParamList = {
  Shop: undefined;
  Cart: undefined;
  Me: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export const MainTabs: React.FC = () => {
  const totalQuantity = useCartStore((state) => state.getTotalQuantity());

  // tabBarBadge ẩn khi 0
  const badgeValue = totalQuantity > 0 ? totalQuantity : undefined;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}
    >
      {VARIANT.tabOrder === 'cartFirst' ? (
        <>
          <Tab.Screen
            name="Cart"
            component={CartScreen}
            options={{
              tabBarLabel: 'Giỏ hàng',
              tabBarBadge: badgeValue,
              tabBarBadgeStyle: {
                backgroundColor: COLORS.secondary,
                color: '#FFFFFF',
                fontSize: 11,
                fontWeight: '700',
              },
              tabBarIcon: ({ color }) => (
                <Text style={{ color, fontSize: 18 }}>🛒</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Shop"
            component={ShopStack}
            options={{
              tabBarLabel: 'Cửa hàng',
              tabBarIcon: ({ color }) => (
                <Text style={{ color, fontSize: 18 }}>🏪</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Me"
            component={MeScreen}
            options={{
              tabBarLabel: 'Tôi',
              tabBarIcon: ({ color }) => (
                <Text style={{ color, fontSize: 18 }}>👤</Text>
              ),
            }}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            name="Shop"
            component={ShopStack}
            options={{
              tabBarLabel: 'Cửa hàng',
              tabBarIcon: ({ color }) => (
                <Text style={{ color, fontSize: 18 }}>🏪</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Cart"
            component={CartScreen}
            options={{
              tabBarLabel: 'Giỏ hàng',
              tabBarBadge: badgeValue,
              tabBarBadgeStyle: {
                backgroundColor: COLORS.secondary,
                color: '#FFFFFF',
                fontSize: 11,
                fontWeight: '700',
              },
              tabBarIcon: ({ color }) => (
                <Text style={{ color, fontSize: 18 }}>🛒</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Me"
            component={MeScreen}
            options={{
              tabBarLabel: 'Tôi',
              tabBarIcon: ({ color }) => (
                <Text style={{ color, fontSize: 18 }}>👤</Text>
              ),
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
};

export default MainTabs;
