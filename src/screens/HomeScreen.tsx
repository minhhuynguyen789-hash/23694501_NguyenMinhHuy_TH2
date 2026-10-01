import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { STUDENT, ROOM_LABEL, DEBOUNCE_MS, STALE_TIME_MS, VARIANT } from '@constants/student';
import { COLORS } from '@constants/theme';
import { getProducts, Product } from '@services/productApi';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import ProductCard from '@components/ProductCard';
import Watermark from '@components/Watermark';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebouncedValue(searchText, DEBOUNCE_MS);

  // React Query fetch data
  const {
    data: products,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => getProducts(12),
    staleTime: STALE_TIME_MS,
  });

  // Filter products by debounced search
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!debouncedSearch.trim()) return products;
    const query = debouncedSearch.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }, [products, debouncedSearch]);

  const handleCardPress = (product: Product) => {
    navigation.navigate('Detail', { id: String(product.id) });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.brandTitle}>KTXGO</Text>
          <Text style={styles.roomSubtitle}>Giao tận {ROOM_LABEL}</Text>
        </View>
        <View style={styles.studentBadge}>
          <Text style={styles.studentBadgeText}>MSSV: {STUDENT.mssv}</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm món ăn, nước uống, đồ dùng..."
          placeholderTextColor={COLORS.textLight}
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            style={styles.clearSearchBtn}
            onPress={() => setSearchText('')}
          >
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Danh Sách Món KTX ({filteredProducts.length})</Text>
        <Text style={styles.filterHint}>
          {debouncedSearch ? `Lọc: "${debouncedSearch}"` : 'Tất cả 12 món'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {VARIANT.watermarkAtTop && <Watermark />}

      <View style={styles.container}>
        {/* CẢNH 1: ĐANG TẢI */}
        {isLoading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải danh sách món KTX...</Text>
            <Text style={styles.loadingSub}>MSSV: {STUDENT.mssv} · {STUDENT.hoTen}</Text>
          </View>
        )}

        {/* CẢNH 3: LỖI MẠNG */}
        {isError && !isLoading && (
          <View style={styles.centerBox}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Lỗi kết nối máy chủ</Text>
            <Text style={styles.errorMessage}>
              {(error as Error)?.message || 'Không thể tải danh sách sản phẩm.'}
            </Text>
            <Text style={styles.errorStudentInfo}>
              Thí sinh: {STUDENT.mssv} — {STUDENT.hoTen}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refetch()}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CẢNH 2: CÓ DỮ LIỆU LƯỚI (FlashList 2 cột) */}
        {!isLoading && !isError && (
          <FlashList
            data={filteredProducts}
            renderItem={({ item }: { item: any }) => (
              <ProductCard
                product={item as Product}
                onPress={() => handleCardPress(item as Product)}
              />
            )}
            numColumns={2}
            keyExtractor={(item: any) => `${STUDENT.mssv}-${item.id}`}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContent}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Không tìm thấy món phù hợp</Text>
                <Text style={styles.emptySub}>Vui lòng thử từ khóa khác</Text>
              </View>
            }
          />
        )}
      </View>

      {!VARIANT.watermarkAtTop && <Watermark />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  roomSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: 2,
  },
  studentBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  studentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  searchBox: {
    position: 'relative',
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 12,
    top: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearSearchText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  filterHint: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  listContent: {
    paddingHorizontal: 6,
    paddingBottom: 20,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  loadingSub: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textLight,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.error,
    marginBottom: 6,
  },
  errorMessage: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 10,
  },
  errorStudentInfo: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
});

export default HomeScreen;
