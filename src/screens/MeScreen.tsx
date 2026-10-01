import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { STUDENT, examStamp, ROOM_LABEL, BASE_SHIP_FEE, VARIANT } from '@constants/student';
import { COLORS } from '@constants/theme';
import { useAuthStore } from '@stores/authStore';
import { useCampusLocation, KTX_GATE_COORDS } from '@hooks/useCampusLocation';
import Watermark from '@components/Watermark';

export const MeScreen: React.FC = () => {
  const { userIdentifier, logout } = useAuthStore();
  const stamp = examStamp();

  const {
    permissionStatus,
    coords,
    distanceKm,
    calculatedFee,
    loading,
    errorMessage,
    requestPermission,
    openSettings,
    applyMockCoords,
  } = useCampusLocation();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi KTXGo?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  };

  const getStatusBadge = () => {
    switch (permissionStatus) {
      case 'granted':
        return { text: 'ĐÃ CẤP QUYỀN (GRANTED)', color: COLORS.success, bg: '#DCFCE7' };
      case 'denied':
        return { text: 'BỊ TỪ CHỐI (DENIED)', color: COLORS.secondary, bg: '#FFEDD5' };
      case 'blocked':
        return { text: 'BỊ CHẶN (BLOCKED)', color: COLORS.error, bg: '#FEE2E2' };
      default:
        return { text: 'ĐANG KIỂM TRA...', color: COLORS.textLight, bg: '#F1F5F9' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <SafeAreaView style={styles.safeArea}>
      {VARIANT.watermarkAtTop && <Watermark />}

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBox}>
          <Text style={styles.headerTitle}>Hồ Sơ Thí Sinh & Vị Trí</Text>
          <Text style={styles.headerSubtitle}>KTXGo — Kiểm tra thực hành TH2</Text>
        </View>

        {/* THẺ THÔNG TIN THÍ SINH */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông Tin Định Danh Thí Sinh</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Họ và tên:</Text>
            <Text style={styles.infoValueHighlight}>{STUDENT.hoTen}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã số sinh viên:</Text>
            <Text style={styles.infoValueHighlight}>{STUDENT.mssv}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Stamp bài thi:</Text>
            <Text style={styles.infoValue}>#{stamp}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phòng ký túc xá:</Text>
            <Text style={styles.infoValue}>{ROOM_LABEL}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tài khoản đăng nhập:</Text>
            <Text style={styles.infoValue}>{userIdentifier || 'Chưa xác định'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Công thức phí ship:</Text>
            <Text style={styles.infoValue}>
              Biến thể {VARIANT.shipFormula} (Số cuối {STUDENT.mssv.slice(-1)})
            </Text>
          </View>
        </View>

        {/* THẺ ĐỊNH VỊ GPS VÀ PHÍ VẬN CHUYỂN */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Định Vị GPS & Phí Giao Tận Phòng</Text>

          {/* Trạng thái quyền */}
          <View style={[styles.statusBox, { backgroundColor: statusBadge.bg }]}>
            <Text style={styles.statusLabel}>Trạng thái quyền vị trí:</Text>
            <Text style={[styles.statusValue, { color: statusBadge.color }]}>
              {statusBadge.text}
            </Text>
          </View>

          {errorMessage && (
            <Text style={styles.errorAlert}>⚠️ {errorMessage}</Text>
          )}

          {/* Cổng KTX mốc */}
          <View style={styles.detailBox}>
            <Text style={styles.detailTitle}>📍 Tọa độ Cổng KTX (Mốc tính):</Text>
            <Text style={styles.detailText}>
              Vĩ độ: {KTX_GATE_COORDS.latitude} | Kinh độ: {KTX_GATE_COORDS.longitude}
            </Text>
          </View>

          {/* Tọa độ hiện tại nếu đã có */}
          {coords ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultHeading}>🎯 Kết Quả Tính Khoảng Cách</Text>
              <Text style={styles.resultLine}>
                • Vị trí của bạn: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
              </Text>
              <Text style={styles.resultLine}>
                • Khoảng cách tới cổng KTX: <Text style={styles.bold}>{distanceKm} km</Text>
              </Text>
              <Text style={styles.resultLine}>
                • Phí cơ sở (BASE_SHIP_FEE): {BASE_SHIP_FEE.toLocaleString('vi-VN')} đ
              </Text>
              <Text style={styles.resultLine}>
                • Công thức B: {BASE_SHIP_FEE} + ({distanceKm} * 1500) + 2000
              </Text>

              <View style={styles.feeHighlightBox}>
                <Text style={styles.feeHighlightLabel}>ƯỚC TÍNH PHÍ GIAO HÀNG:</Text>
                <Text style={styles.feeHighlightAmount}>
                  {calculatedFee.toLocaleString('vi-VN')} đ
                </Text>
              </View>
              <Text style={styles.feeSyncHint}>
                ✓ Đã tự động đồng bộ sang Tab Giỏ hàng
              </Text>
            </View>
          ) : (
            <View style={styles.noLocationBox}>
              <Text style={styles.noLocationText}>
                Chưa có dữ liệu vị trí GPS. Vui lòng bấm nút bên dưới để cấp quyền và dò GPS.
              </Text>
            </View>
          )}

          {/* CÁC NÚT THAO TÁC QUYỀN */}
          <View style={styles.buttonGroup}>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 10 }} />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.actionBtnPrimary}
                  onPress={requestPermission}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnPrimaryText}>
                    📡 Xin quyền & Dò vị trí GPS
                  </Text>
                </TouchableOpacity>

                {permissionStatus === 'blocked' && (
                  <TouchableOpacity
                    style={styles.actionBtnWarning}
                    onPress={openSettings}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionBtnWarningText}>
                      ⚙️ Mở Cài Đặt Ứng Dụng (openSettings)
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.actionBtnOutline}
                  onPress={applyMockCoords}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnOutlineText}>
                    🧪 Mock Tọa Độ Máy Ảo (~1.2 km KTX)
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* NÚT ĐĂNG XUẤT */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutBtnText}>Đăng xuất khỏi KTXGo</Text>
        </TouchableOpacity>
      </ScrollView>

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
    padding: 16,
    paddingBottom: 30,
  },
  headerBox: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  infoValueHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statusBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  errorAlert: {
    color: COLORS.error,
    fontSize: 12,
    marginBottom: 8,
  },
  detailBox: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  detailTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  detailText: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  resultBox: {
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  resultHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 6,
  },
  resultLine: {
    fontSize: 12,
    color: COLORS.text,
    marginVertical: 2,
  },
  bold: {
    fontWeight: '700',
    color: COLORS.secondary,
  },
  feeHighlightBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  feeHighlightLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  feeHighlightAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  feeSyncHint: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: 6,
  },
  noLocationBox: {
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  noLocationText: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  buttonGroup: {
    marginTop: 4,
    gap: 8,
  },
  actionBtnPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  actionBtnWarning: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnWarningText: {
    color: '#B45309',
    fontWeight: '700',
    fontSize: 13,
  },
  actionBtnOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnOutlineText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  logoutBtnText: {
    color: COLORS.error,
    fontWeight: '800',
    fontSize: 15,
  },
});

export default MeScreen;
