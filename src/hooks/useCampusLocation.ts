import { useState, useCallback, useEffect } from 'react';
import { Linking, Platform, PermissionsAndroid } from 'react-native';
import * as Location from 'expo-location';
import { BASE_SHIP_FEE, VARIANT } from '@constants/student';
import { useCartStore } from '@stores/cartStore';

export type PermissionStatus = 'checking' | 'granted' | 'denied' | 'blocked';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

// Tọa độ Cổng KTX IUH (Cố định trong code)
export const KTX_GATE_COORDS: LocationCoords = {
  latitude: 10.8222,
  longitude: 106.6875,
};

// Công thức khoảng cách Haversine (km)
export function calculateHaversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// Tính phí ship theo biến thể A hoặc B
export function calculateShippingFee(distanceKm: number): number {
  if (VARIANT.shipFormula === 'A') {
    return BASE_SHIP_FEE + Math.round(distanceKm * 2000);
  } else {
    // Biến thể B (cho MSSV 23694501 số cuối 1)
    return BASE_SHIP_FEE + Math.round(distanceKm * 1500) + 2000;
  }
}

export function useCampusLocation() {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('checking');
  const [coords, setCoords] = useState<LocationCoords | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [calculatedFee, setCalculatedFee] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setShippingFee = useCartStore((state) => state.setShippingFee);

  const checkPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (hasPermission) {
          setPermissionStatus('granted');
          return true;
        }
      }

      const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionStatus('granted');
        return true;
      } else if (!canAskAgain) {
        setPermissionStatus('blocked');
        return false;
      } else {
        setPermissionStatus('denied');
        return false;
      }
    } catch {
      setPermissionStatus('denied');
      return false;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      let isGranted = false;

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'KTXGo cần quyền vị trí',
            message: 'KTXGo cần quyền vị trí GPS để ước tính khoảng cách và phí giao tận phòng.',
            buttonPositive: 'Đồng ý',
            buttonNegative: 'Từ chối',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          isGranted = true;
          setPermissionStatus('granted');
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          setPermissionStatus('blocked');
          setLoading(false);
          return;
        } else {
          setPermissionStatus('denied');
          setLoading(false);
          return;
        }
      } else {
        const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          isGranted = true;
          setPermissionStatus('granted');
        } else if (!canAskAgain) {
          setPermissionStatus('blocked');
          setLoading(false);
          return;
        } else {
          setPermissionStatus('denied');
          setLoading(false);
          return;
        }
      }

      if (isGranted) {
        // Lấy vị trí
        try {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const userCoords: LocationCoords = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
          applyCoords(userCoords);
        } catch {
          // Fallback mock nếu GPS máy ảo chưa bật
          applyMockCoords();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi yêu cầu quyền vị trí');
      applyMockCoords();
    } finally {
      setLoading(false);
    }
  }, []);

  const applyCoords = (userCoords: LocationCoords) => {
    setCoords(userCoords);
    const dist = calculateHaversine(
      userCoords.latitude,
      userCoords.longitude,
      KTX_GATE_COORDS.latitude,
      KTX_GATE_COORDS.longitude
    );
    setDistanceKm(dist);
    const fee = calculateShippingFee(dist);
    setCalculatedFee(fee);
    setShippingFee(fee);
  };

  const applyMockCoords = () => {
    // Vị trí mẫu trong khuôn viên KTX (cách cổng ~1.2 km)
    const mockUserCoords: LocationCoords = {
      latitude: 10.8290,
      longitude: 106.6940,
    };
    setPermissionStatus('granted');
    applyCoords(mockUserCoords);
  };

  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    permissionStatus,
    coords,
    distanceKm,
    calculatedFee,
    loading,
    errorMessage,
    requestPermission,
    openSettings,
    applyMockCoords,
  };
}

export default useCampusLocation;
