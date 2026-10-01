import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { STUDENT, VARIANT, ROOM_LABEL } from '@constants/student';
import { COLORS } from '@constants/theme';
import { useAuthStore } from '@stores/authStore';
import Watermark from '@components/Watermark';

export const LoginScreen: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const login = useAuthStore((state) => state.login);

  const isPhone = VARIANT.authField === 'phone';
  const labelText = isPhone ? 'Số điện thoại sinh viên' : 'Email sinh viên';
  const placeholderText = isPhone ? 'Nhập số điện thoại (VD: 0901234567)' : 'Nhập email SV (@iuh.edu.vn)';

  const handleLogin = () => {
    const trimmed = identifier.trim();
    if (!trimmed) {
      Alert.alert('Thông báo', `Vui lòng nhập ${labelText.toLowerCase()} để tiếp tục.`);
      return;
    }

    if (isPhone && trimmed.length < 9) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ (tối thiểu 9 số).');
      return;
    }

    login(trimmed);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {VARIANT.watermarkAtTop && <Watermark />}

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerBox}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>KTX</Text>
            </View>
            <Text style={styles.appTitle}>KTXGo</Text>
            <Text style={styles.appSubtitle}>
              Dịch vụ giao đồ tận phòng {ROOM_LABEL}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Đăng Nhập Thí Sinh</Text>
            <Text style={styles.cardDesc}>
              MSSV: {STUDENT.mssv} — {STUDENT.hoTen}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{labelText}</Text>
              <TextInput
                style={styles.input}
                placeholder={placeholderText}
                placeholderTextColor={COLORS.textLight}
                value={identifier}
                onChangeText={setIdentifier}
                keyboardType={isPhone ? 'phone-pad' : 'email-address'}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Vào cửa hàng</Text>
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                • Biến thể: {isPhone ? 'Phone' : 'Email'} login
              </Text>
              <Text style={styles.infoText}>
                • Phòng giao mặc định: {ROOM_LABEL}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {!VARIANT.watermarkAtTop && <Watermark />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  logoBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  infoBox: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginVertical: 2,
  },
});

export default LoginScreen;
