import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import apiService from '../services/api';

export default function AlbumViewScreen({ route, navigation }) {
  const { albumId } = route.params;
  const [imagesInfo, setImagesInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewingIndex, setViewingIndex] = useState(-1);
  const [viewingImages, setViewingImages] = useState([]);
  const [hasPDF, setHasPDF] = useState(false);

  useEffect(() => {
    loadImages();
  }, [albumId]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const info = await apiService.getImagesInfo(albumId);
      setImagesInfo(info);

      // 准备图片查看器所需的URL列表
      const imageUrls = info.images.map((img) =>
        apiService.getImageUrl(albumId, img.path)
      );
      setViewingImages(imageUrls);

      // 检查是否有PDF
      try {
        const pdfUrl = apiService.getPDFUrl(albumId);
        // 简单的检查：如果URL存在，假设PDF存在
        // 实际检查会在PDFViewScreen中处理
        setHasPDF(true);
      } catch (e) {
        setHasPDF(false);
      }
    } catch (error) {
      console.error('加载图片信息失败:', error);
      Alert.alert('错误', '加载图片信息失败');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleViewPDF = () => {
    navigation.navigate('PDFView', { albumId });
  };

  const handleImagePress = (index) => {
    setViewingIndex(index);
  };

  const renderImage = ({ item, index }) => {
    const imageUrl = apiService.getImageUrl(albumId, item.path);
    return (
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => handleImagePress(index)}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <Text style={styles.imageName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  if (!imagesInfo || imagesInfo.images.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>没有找到图片</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          专辑 {albumId} ({imagesInfo.total} 张图片)
        </Text>
        {hasPDF && (
          <TouchableOpacity
            style={styles.pdfButton}
            onPress={handleViewPDF}
          >
            <Text style={styles.pdfButtonText}>查看PDF</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={imagesInfo.images}
        renderItem={renderImage}
        keyExtractor={(item, index) => `image-${index}`}
        numColumns={2}
        contentContainerStyle={styles.list}
      />

      {viewingIndex >= 0 && (
        <ImageViewing
          images={viewingImages.map((url) => ({ uri: url }))}
          imageIndex={viewingIndex}
          visible={viewingIndex >= 0}
          onRequestClose={() => setViewingIndex(-1)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
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
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  pdfButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  pdfButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 8,
  },
  imageContainer: {
    flex: 1,
    margin: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 0.7,
    backgroundColor: '#f0f0f0',
  },
  imageName: {
    padding: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

