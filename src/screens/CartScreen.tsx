import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { STUDENT, ROOM_LABEL, PRICE_MULTIPLIER, VARIANT } from '@constants/student';
import { COLORS } from '@constants/theme';
import { useCartStore, CartItem } from '@stores/cartStore';
import Watermark from '@components/Watermark';

export const CartScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    items,
    shippingFee,
    changeQuantity,
    removeItem,
    clearCart,
    getProductTotal,
    getFinalTotal,
  } = useCartStore();

  const productTotal = getProductTotal();
  const finalTotal = getFinalTotal();

  const handleCheckout = () => {
    Alert.alert(
      'Ghi Nhận Đặt Hàng KTX',
      `Đơn hàng sẽ được chuyển tới:\nPhòng: ${ROOM_LABEL}\nThí sinh: ${STUDENT.mssv} — ${STUDENT.hoTen}\nTổng tiền: ${finalTotal.toLocaleString('vi-VN')} đ\n\n(Lưu ý: Không thanh toán online trong giờ thi)`
    );
  };

  const renderCartItem = (item: CartItem) => {
    const itemUnitPrice = Math.round(item.product.price * PRICE_MULTIPLIER);
    const itemTotal = itemUnitPrice * item.quantity;

    return (
      <View key={`${STUDENT.mssv}-${item.product.id}`} style={styles.itemCard}>
        <Image
          source={{ uri: item.product.image }}
          style={styles.itemImage}
          resizeMode="contain"
        />
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.product.title}
          </Text>
          <Text style={styles.itemPrice}>
            {itemUnitPrice.toLocaleString('vi-VN')} đ
          </Text>
          <Text style={styles.itemSubTotal}>
            Thành tiền: {itemTotal.toLocaleString('vi-VN')} đ
          </Text>
        </View>

        <View style={styles.actionColumn}>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => removeItem(item.product.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.removeBtnText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => changeQuantity(item.product.id, item.quantity - 1)}
            >
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => changeQuantity(item.product.id, item.quantity + 1)}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {VARIANT.watermarkAtTop && <Watermark />}

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Giỏ Hàng KTXGo</Text>
          <Text style={styles.headerSubtitle}>Giao tận {ROOM_LABEL}</Text>
        </View>
        {items.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              Alert.alert('Xác nhận', 'Bạn có muốn làm rỗng giỏ hàng?', [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Xóa hết', style: 'destructive', onPress: clearCart },
              ]);
            }}
          >
            <Text style={styles.clearBtnText}>Xóa hết</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Giỏ hàng đang trống</Text>
          <Text style={styles.emptySub}>
            Bạn chưa chọn món nào từ Cửa hàng KTX
          </Text>
          <TouchableOpacity
            style={styles.shopNowBtn}
            onPress={() => navigation.navigate('Shop')}
            activeOpacity={0.8}
          >
            <Text style={styles.shopNowText}>Chọn món ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollList}>
          <View style={styles.deliveryBadge}>
            <Text style={styles.deliveryBadgeText}>
              📍 Nơi nhận: Phòng {ROOM_LABEL} (Ký túc xá)
            </Text>
            <Text style={styles.deliveryStudent}>
              Thí sinh: {STUDENT.mssv} — {STUDENT.hoTen}
            </Text>
          </View>

          {items.map(renderCartItem)}

          {/* HÓA ĐƠN CHI TIẾT */}
          <View style={styles.billCard}>
            <Text style={styles.billTitle}>Chi Tiết Thanh Toán</Text>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Tổng tiền món ({items.length} món):</Text>
              <Text style={styles.billValue}>
                {productTotal.toLocaleString('vi-VN')} đ
              </Text>
            </View>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>
                Phí ship GPS {shippingFee > 0 ? '(Tab Tôi)' : '(Chưa tính)'}:
              </Text>
              <Text
                style={[
                  styles.billValue,
                  { color: shippingFee > 0 ? COLORS.secondary : COLORS.textLight },
                ]}
              >
                {shippingFee > 0
                  ? `${shippingFee.toLocaleString('vi-VN')} đ`
                  : 'Vào Tab Tôi để định vị'}
              </Text>
            </View>

            <View style={styles.billDivider} />

            <View style={styles.billRowTotal}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalValue}>
                {finalTotal.toLocaleString('vi-VN')} đ
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleCheckout}
              activeOpacity={0.8}
            >
              <Text style={styles.checkoutBtnText}>Xác nhận đặt hàng KTX</Text>
            </TouchableOpacity>

            <Text style={styles.noteFooter}>
              * Lưu trữ giỏ hàng tự động bằng AsyncStorage (`ktxgo-cart-${STUDENT.mssv}`)
            </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '700',
    marginTop: 2,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.error,
  },
  scrollList: {
    padding: 16,
    paddingBottom: 24,
  },
  deliveryBadge: {
    backgroundColor: '#DBEAFE',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  deliveryBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  deliveryStudent: {
    fontSize: 11,
    color: COLORS.text,
    marginTop: 2,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  itemSubTotal: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  actionColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
  },
  removeBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  qtyText: {
    paddingHorizontal: 8,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  billCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  billValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  billDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  billRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  noteFooter: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  shopNowBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default CartScreen;
