import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Product } from '@services/productApi';
import { PRICE_MULTIPLIER, VARIANT } from '@constants/student';
import { COLORS } from '@constants/theme';
import { useCartStore } from '@stores/cartStore';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const addItem = useCartStore((state) => state.addItem);

  const formattedPrice = (
    Math.round(product.price * PRICE_MULTIPLIER)
  ).toLocaleString('vi-VN') + ' đ';

  const handleAdd = () => {
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
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.category} numberOfLines={1}>
          {product.category}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={styles.bottomRow}>
          <Text style={styles.price}>{formattedPrice}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAdd}
            activeOpacity={0.7}
          >
            <Text style={styles.addText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    margin: 6,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  image: {
    width: '90%',
    height: '90%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 18,
    height: 36,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    flex: 1,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
});

export default ProductCard;
