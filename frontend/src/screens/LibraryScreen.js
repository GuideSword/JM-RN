import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import apiService from '../services/api';
import { useApi } from '../contexts/ApiContext';

export default function LibraryScreen({ navigation }) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isConnected } = useApi();

  useEffect(() => {
    if (isConnected) {
      loadAlbums();
    }
  }, [isConnected]);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDownloadList();
      setAlbums(response.albums || []);
    } catch (error) {
      console.error('加载专辑列表失败:', error);
      Alert.alert('错误', '加载专辑列表失败');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlbums();
    setRefreshing(false);
  };

  const handleAlbumPress = (album) => {
    // 如果有PDF，优先显示PDF；否则显示图片
    if (album.has_pdf) {
      navigation.navigate('PDFView', { albumId: album.album_id });
    } else if (album.has_images) {
      navigation.navigate('AlbumView', { albumId: album.album_id });
    } else {
      Alert.alert('提示', '该专辑暂无可用内容');
    }
  };

  const handlePDFPress = (albumId, event) => {
    event.stopPropagation(); // 阻止触发handleAlbumPress
    navigation.navigate('PDFView', { albumId });
  };

  const handleImagesPress = (albumId, event) => {
    event.stopPropagation(); // 阻止触发handleAlbumPress
    navigation.navigate('AlbumView', { albumId });
  };

  const renderAlbum = ({ item }) => (
    <TouchableOpacity
      style={styles.albumItem}
      onPress={() => handleAlbumPress(item)}
    >
      <View style={styles.albumInfo}>
        <Text style={styles.albumId}>ID: {item.album_id}</Text>
        {item.title && <Text style={styles.albumTitle}>{item.title}</Text>}
        <View style={styles.badges}>
          {item.has_pdf && (
            <TouchableOpacity
              style={[styles.badge, styles.pdfBadge]}
              onPress={(e) => handlePDFPress(item.album_id, e)}
            >
              <Text style={styles.badgeText}>PDF</Text>
            </TouchableOpacity>
          )}
          {item.has_images && (
            <TouchableOpacity
              style={[styles.badge, styles.imageBadge]}
              onPress={(e) => handleImagesPress(item.album_id, e)}
            >
              <Text style={styles.badgeText}>图片</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!isConnected) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>未连接到服务器</Text>
        <Text style={styles.emptySubtext}>请在设置中配置API地址</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  if (albums.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>暂无已下载的专辑</Text>
        <Text style={styles.emptySubtext}>在首页开始下载专辑</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={albums}
      renderItem={renderAlbum}
      keyExtractor={(item) => item.album_id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  list: {
    padding: 16,
  },
  albumItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  albumInfo: {
    flex: 1,
  },
  albumId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  albumTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pdfBadge: {
    backgroundColor: '#FF6B6B',
  },
  imageBadge: {
    backgroundColor: '#4ECDC4',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

