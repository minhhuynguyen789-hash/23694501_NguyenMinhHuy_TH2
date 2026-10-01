import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { STUDENT, PRICE_MULTIPLIER, VARIANT, ROOM_LABEL } from '@constants/student';
import { COLORS } from '@constants/theme';
import { getProductById, Product } from '@services/productApi';
import { useCartStore } from '@stores/cartStore';
import Watermark from '@components/Watermark';

export const DetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const productId = route.params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductById(productId);
        if (isMounted) setProduct(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Không thể tải chi tiết món');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (productId) {
      fetchDetail();
    }
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product);

    // Haptic theo VARIANT.hapticOnAdd
    if (VARIANT.hapticOnAdd === 'impact') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        Vibration.vibrate(40);
      }
    } else {
      // 'selection' cho MSSV 23694501
      try {
        Haptics.selectionAsync();
      } catch {
        Vibration.vibrate(20);
      }
    }

    Alert.alert(
      'Thành công',
      `Đã thêm "${product.title}" vào giỏ hàng KTX!\nMSSV: ${STUDENT.mssv} — ${STUDENT.hoTen}`
    );
  };

  const formattedPrice = product
    ? (Math.round(product.price * PRICE_MULTIPLIER)).toLocaleString('vi-VN') + ' đ'
    : '';

  return (
    <SafeAreaView style={styles.safeArea}>
      {VARIANT.watermarkAtTop && <Watermark />}

      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          Chi tiết món #{productId}
        </Text>
        <View style={styles.roomTag}>
          <Text style={styles.roomTagText}>{ROOM_LABEL}</Text>
        </View>
      </View>

      {loading && (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải chi tiết món #{productId}...</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Text style={styles.studentNote}>MSSV: {STUDENT.mssv}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryBtnText}>Quay lại danh sách</Text>
          </TouchableOpacity>
        </View>
      )}

      {product && !loading && (
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.imageCard}>
            <Image
              source={{ uri: product.image }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.categoryBadge}>{product.category}</Text>
            <Text style={styles.productTitle}>{product.title}</Text>
            <Text style={styles.price}>{formattedPrice}</Text>

            <View style={styles.divider} />

            <Text style={styles.descHeading}>Mô tả món hàng KTX</Text>
            <Text style={styles.descText}>{product.description}</Text>

            <View style={styles.deliveryInfoBox}>
              <Text style={styles.deliveryTitle}>🚚 Thông tin giao nhận KTXGo</Text>
              <Text style={styles.deliveryDetail}>
                • Điểm giao: Tận phòng {ROOM_LABEL} (Nội khu KTX)
              </Text>
              <Text style={styles.deliveryDetail}>
                • Thí sinh phụ trách: {STUDENT.mssv} — {STUDENT.hoTen}
              </Text>
              <Text style={styles.deliveryDetail}>
                • Giờ thi: 120 phút — Không thanh toán online
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addToCartBtn}
              onPress={handleAddToCart}
              activeOpacity={0.8}
            >
              <Text style={styles.addToCartBtnText}>
                Thêm vào giỏ ({formattedPrice})
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {!VARIANT.watermarkAtTop && <Watermark />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  navTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  roomTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roomTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  imageCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 10,
  },
  price: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 14,
  },
  descHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  descText: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: 16,
  },
  deliveryInfoBox: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  deliveryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 6,
  },
  deliveryDetail: {
    fontSize: 12,
    color: COLORS.text,
    marginVertical: 2,
  },
  addToCartBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addToCartBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 15,
    color: COLORS.error,
    fontWeight: '700',
    marginBottom: 8,
  },
  studentNote: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default DetailScreen;
