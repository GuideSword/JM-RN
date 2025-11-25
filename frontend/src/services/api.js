import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL_KEY = '@api_base_url';
// 注意：不要使用localhost，手机无法访问电脑的localhost
// 请使用电脑的实际IP地址，例如: http://192.168.1.100:8000
const DEFAULT_API_URL = 'http://192.168.1.100:8000';

class ApiService {
  constructor() {
    this.baseURL = DEFAULT_API_URL;
    this.loadBaseURL();
  }

  async loadBaseURL() {
    try {
      const savedURL = await AsyncStorage.getItem(API_BASE_URL_KEY);
      if (savedURL) {
        console.log('ApiService: 加载保存的URL:', savedURL);
        this.baseURL = savedURL;
      } else {
        console.log('ApiService: 使用默认URL:', this.baseURL);
      }
    } catch (error) {
      console.error('加载API地址失败:', error);
    }
  }

  async setBaseURL(url) {
    try {
      console.log('ApiService: 设置URL:', url);
      await AsyncStorage.setItem(API_BASE_URL_KEY, url);
      this.baseURL = url;
      console.log('ApiService: URL已更新为:', this.baseURL);
    } catch (error) {
      console.error('保存API地址失败:', error);
      throw error;
    }
  }

  getBaseURL() {
    return this.baseURL;
  }

  getAxiosInstance() {
    // 确保使用最新的baseURL
    const currentURL = this.baseURL;
    console.log('创建Axios实例，baseURL:', currentURL);
    return axios.create({
      baseURL: currentURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async startDownload(albumId) {
    try {
      const response = await this.getAxiosInstance().post('/api/v1/download/album', {
        album_id: albumId,
      });
      return response.data;
    } catch (error) {
      console.error('开始下载失败:', error);
      throw new Error(error.response?.data?.detail || '开始下载失败');
    }
  }

  async getDownloadStatus(taskId) {
    try {
      const response = await this.getAxiosInstance().get(`/api/v1/download/status/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('获取下载状态失败:', error);
      throw new Error(error.response?.data?.detail || '获取下载状态失败');
    }
  }

  async getDownloadList() {
    try {
      const response = await this.getAxiosInstance().get('/api/v1/download/list');
      return response.data;
    } catch (error) {
      console.error('获取下载列表失败:', error);
      throw new Error(error.response?.data?.detail || '获取下载列表失败');
    }
  }

  getPDFUrl(albumId) {
    return `${this.baseURL}/api/v1/download/result/${albumId}`;
  }

  async getImagesInfo(albumId) {
    try {
      const response = await this.getAxiosInstance().get(`/api/v1/download/images/${albumId}`);
      return response.data;
    } catch (error) {
      console.error('获取图片信息失败:', error);
      throw new Error(error.response?.data?.detail || '获取图片信息失败');
    }
  }

  getImageUrl(albumId, imagePath) {
    const encodedPath = encodeURIComponent(imagePath);
    return `${this.baseURL}/api/v1/download/image/${albumId}/${encodedPath}`;
  }

  async checkHealth(url = null) {
    try {
      // 如果提供了URL参数，临时使用该URL
      const testURL = url || this.baseURL;
      const axiosInstance = url 
        ? axios.create({
            baseURL: testURL,
            timeout: 5000,
            headers: {
              'Content-Type': 'application/json',
            },
          })
        : this.getAxiosInstance();
      
      const response = await axiosInstance.get('/health', {
        timeout: 5000, // 5秒超时
      });
      return response.data;
    } catch (error) {
      console.error('健康检查失败:', error);
      // 提供更友好的错误信息
      const errorURL = url || this.baseURL;
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        throw new Error(`无法连接到服务器 ${errorURL}。请检查：\n1. 后端服务是否正在运行\n2. API地址是否正确（不能使用localhost）\n3. 手机和电脑是否在同一WiFi网络`);
      }
      throw error;
    }
  }
}

export default new ApiService();

