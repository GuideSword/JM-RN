import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';

const API_BASE_URL_KEY = '@api_base_url';
const ApiContext = createContext();

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within ApiProvider');
  }
  return context;
};

export const ApiProvider = ({ children }) => {
  const [baseURL, setBaseURL] = useState(apiService.getBaseURL());
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时从AsyncStorage加载API地址
  useEffect(() => {
    const loadSavedURL = async () => {
      try {
        setIsLoading(true);
        // 先从AsyncStorage加载
        const savedURL = await AsyncStorage.getItem(API_BASE_URL_KEY);
        if (savedURL) {
          console.log('从存储加载API地址:', savedURL);
          // 同时更新apiService和state
          await apiService.setBaseURL(savedURL);
          setBaseURL(savedURL);
        } else {
          // 如果没有保存的地址，确保apiService使用当前baseURL
          await apiService.setBaseURL(baseURL);
        }
      } catch (error) {
        console.error('加载API地址失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedURL();
  }, []);

  // 当baseURL改变时检查连接
  useEffect(() => {
    if (!isLoading) {
      checkConnection();
    }
  }, [baseURL, isLoading]);

  const checkConnection = async () => {
    try {
      // 确保apiService的baseURL与state同步
      const currentURL = apiService.getBaseURL();
      if (currentURL !== baseURL) {
        await apiService.setBaseURL(baseURL);
      }
      console.log('检查连接，API地址:', apiService.getBaseURL());
      await apiService.checkHealth();
      setIsConnected(true);
      console.log('连接成功');
    } catch (error) {
      setIsConnected(false);
      // 静默失败，不显示错误（避免首次加载时显示错误）
      console.log('连接检查失败:', error.message);
    }
  };

  const updateBaseURL = async (newURL) => {
    console.log('更新API地址:', newURL);
    // 先更新AsyncStorage和apiService
    await apiService.setBaseURL(newURL);
    // 再更新state，这会触发useEffect重新检查连接
    setBaseURL(newURL);
  };

  return (
    <ApiContext.Provider
      value={{
        baseURL,
        isConnected,
        updateBaseURL,
        checkConnection,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

