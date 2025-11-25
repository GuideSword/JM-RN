import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import apiService from '../services/api';

// 尝试导入react-native-pdf，如果不可用则使用备用方案
let Pdf = null;
try {
  Pdf = require('react-native-pdf').default;
} catch (e) {
  console.warn('react-native-pdf不可用，将使用分享功能:', e.message);
}

export default function PDFViewScreen({ route, navigation }) {
  const { albumId } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfAvailable, setPdfAvailable] = useState(Pdf !== null);

  const pdfUrl = apiService.getPDFUrl(albumId);

  useEffect(() => {
    // 如果PDF查看器不可用，提示用户使用分享功能
    if (!pdfAvailable) {
      setLoading(false);
      Alert.alert(
        '提示',
        'PDF查看器需要原生模块支持。\n\n您可以使用"分享"功能，在系统默认的PDF阅读器中打开。',
        [{ text: '确定' }]
      );
    }
  }, [pdfAvailable]);

  const handleShare = async () => {
    try {
      // 检查是否支持分享
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('提示', '当前设备不支持分享功能');
        return;
      }

      // 下载PDF到本地临时文件
      const fileUri = FileSystem.documentDirectory + `${albumId}.pdf`;
      const downloadResult = await FileSystem.downloadAsync(pdfUrl, fileUri);

      if (downloadResult.status === 200) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: 'application/pdf',
          dialogTitle: `分享 ${albumId}.pdf`,
        });
      } else {
        Alert.alert('错误', '下载PDF失败');
      }
    } catch (error) {
      console.error('分享失败:', error);
      Alert.alert('错误', '分享失败');
    }
  };

  const handleLoadComplete = (numberOfPages) => {
    setLoading(false);
    setTotalPages(numberOfPages);
  };

  const handlePageChanged = (page, numberOfPages) => {
    setPage(page);
    setTotalPages(numberOfPages);
  };

  const handleError = (error) => {
    console.error('PDF加载错误:', error);
    setLoading(false);
    setError('加载PDF失败。可能是PDF文件不存在或格式不正确。');
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={handleShare}>
          <Text style={styles.buttonText}>尝试分享PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>
          专辑 {albumId} {totalPages > 0 && `(${page}/${totalPages})`}
        </Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Text style={styles.shareButtonText}>分享</Text>
        </TouchableOpacity>
      </View>

      {loading && pdfAvailable && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>加载PDF中...</Text>
        </View>
      )}

      {pdfAvailable ? (
        <Pdf
          source={{ uri: pdfUrl, cache: true }}
          onLoadComplete={handleLoadComplete}
          onPageChanged={handlePageChanged}
          onError={handleError}
          style={styles.pdf}
          enablePaging={true}
          horizontal={false}
          spacing={10}
          fitPolicy={0}
        />
      ) : (
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackText}>
            PDF查看功能需要开发构建版本
          </Text>
          <Text style={styles.fallbackSubtext}>
            当前在Expo Go中无法直接查看PDF
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleShare}>
            <Text style={styles.buttonText}>分享并打开PDF</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
      android: {
        paddingTop: 12,
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  shareButton: {
    padding: 8,
  },
  shareButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  pdf: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f5f5f5',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  fallbackText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  fallbackSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  backButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

