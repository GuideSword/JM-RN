import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useApi } from '../contexts/ApiContext';
import { useStartDownload } from '../hooks/useDownload';
import { addActiveTask } from './DownloadScreen';
import apiService from '../services/api';

export default function HomeScreen({ navigation }) {
  const [albumId, setAlbumId] = useState('');
  const { isConnected } = useApi();
  const { startDownload, loading } = useStartDownload();

  const handleDownload = async () => {
    if (!albumId.trim()) {
      Alert.alert('错误', '请输入专辑ID');
      return;
    }

    if (!isConnected) {
      Alert.alert('错误', '无法连接到服务器，请检查设置中的API地址');
      return;
    }

    try {
      const response = await startDownload(albumId.trim());
      // 将任务添加到下载列表
      await addActiveTask({
        task_id: response.task_id,
        album_id: albumId.trim(),
      });
      Alert.alert('成功', '下载任务已启动', [
        {
          text: '确定',
          onPress: () => navigation.navigate('Download'),
        },
      ]);
      setAlbumId('');
    } catch (error) {
      Alert.alert('错误', error.message || '启动下载失败');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>JM图片下载器</Text>
        <View style={[styles.statusIndicator, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]}>
          <Text style={styles.statusText}>
            {isConnected ? '已连接' : '未连接'}
          </Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>专辑ID</Text>
        <TextInput
          style={styles.input}
          value={albumId}
          onChangeText={setAlbumId}
          placeholder="请输入专辑ID，例如: 350234"
          keyboardType="numeric"
          editable={!loading}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleDownload}
        disabled={loading || !isConnected}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>开始下载</Text>
        )}
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>使用说明：</Text>
        <Text style={styles.infoText}>1. 在JM网站找到要下载的专辑ID</Text>
        <Text style={styles.infoText}>2. 在上方输入框中输入专辑ID</Text>
        <Text style={styles.infoText}>3. 点击"开始下载"按钮</Text>
        <Text style={styles.infoText}>4. 在"下载"标签页查看下载进度</Text>
        <Text style={styles.infoText}>5. 下载完成后在"收藏"标签页查看</Text>
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
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
});

