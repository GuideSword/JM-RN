import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useApi } from '../contexts/ApiContext';
import apiService from '../services/api';

export default function SettingsScreen() {
  const { baseURL, isConnected, updateBaseURL, checkConnection } = useApi();
  const [inputURL, setInputURL] = useState(baseURL);
  const [testing, setTesting] = useState(false);

  // 当baseURL改变时，更新inputURL
  useEffect(() => {
    setInputURL(baseURL);
  }, [baseURL]);

  const handleSave = async () => {
    if (!inputURL.trim()) {
      Alert.alert('错误', '请输入API地址');
      return;
    }

    // 简单的URL格式验证
    if (!inputURL.startsWith('http://') && !inputURL.startsWith('https://')) {
      Alert.alert('错误', 'API地址必须以 http:// 或 https:// 开头');
      return;
    }

    try {
      const trimmedURL = inputURL.trim();
      console.log('Settings: 保存API地址:', trimmedURL);
      await updateBaseURL(trimmedURL);
      // 更新本地inputURL以反映保存的值
      setInputURL(trimmedURL);
      Alert.alert('成功', 'API地址已更新');
    } catch (error) {
      console.error('Settings: 保存失败:', error);
      Alert.alert('错误', `更新API地址失败: ${error.message}`);
    }
  };

  const handleTest = async () => {
    if (!inputURL.trim()) {
      Alert.alert('错误', '请输入API地址');
      return;
    }

    // 简单的URL格式验证
    if (!inputURL.startsWith('http://') && !inputURL.startsWith('https://')) {
      Alert.alert('错误', 'API地址必须以 http:// 或 https:// 开头');
      return;
    }

    setTesting(true);
    try {
      // 直接使用输入框中的URL进行测试，不保存
      const trimmedURL = inputURL.trim();
      const testResult = await apiService.checkHealth(trimmedURL);
      Alert.alert('测试结果', '连接成功！', [
        {
          text: '保存',
          onPress: () => handleSave(),
          style: 'default',
        },
        {
          text: '取消',
          style: 'cancel',
        },
      ]);
    } catch (error) {
      Alert.alert('测试结果', error.message || '连接失败，请检查地址和网络');
    } finally {
      setTesting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API设置</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>API地址</Text>
          <TextInput
            style={styles.input}
            value={inputURL}
            onChangeText={setInputURL}
            placeholder="例如: http://192.168.1.100:8000"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.hint}>
            请输入后端API服务器的地址和端口
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={handleTest}
            disabled={testing}
          >
            {testing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>测试连接</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>保存</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>连接状态:</Text>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: isConnected ? '#4CAF50' : '#F44336' },
              ]}
            >
              <Text style={styles.statusText}>
                {isConnected ? '已连接' : '未连接'}
              </Text>
            </View>
          </View>
          <Text style={styles.currentURL}>当前地址: {baseURL}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>使用说明</Text>
        <Text style={styles.instructionText}>
          1. 确保后端API服务正在运行{'\n'}
          2. 如果后端运行在本地电脑，使用电脑的IP地址（不是localhost）{'\n'}
          3. 默认端口为8000，可根据实际情况修改{'\n'}
          4. 点击"测试连接"检查是否能正常连接{'\n'}
          5. 连接成功后点击"保存"保存设置
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于</Text>
        <Text style={styles.aboutText}>JM图片下载器 v1.0.0</Text>
        <Text style={styles.aboutText}>
          基于React Native Expo开发
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#999',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#FF9800',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  statusIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  currentURL: {
    fontSize: 12,
    color: '#999',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

