import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ApiProvider } from './src/contexts/ApiContext';

// 导入页面组件
import HomeScreen from './src/screens/HomeScreen';
import DownloadScreen from './src/screens/DownloadScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AlbumViewScreen from './src/screens/AlbumViewScreen';
import PDFViewScreen from './src/screens/PDFViewScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen}
        options={{ title: 'JM下载器' }}
      />
    </Stack.Navigator>
  );
}

function DownloadStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="DownloadMain" 
        component={DownloadScreen}
        options={{ title: '下载管理' }}
      />
    </Stack.Navigator>
  );
}

function LibraryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="LibraryMain" 
        component={LibraryScreen}
        options={{ title: '我的收藏' }}
      />
      <Stack.Screen 
        name="AlbumView" 
        component={AlbumViewScreen}
        options={{ title: '查看专辑' }}
      />
      <Stack.Screen 
        name="PDFView" 
        component={PDFViewScreen}
        options={{ title: 'PDF查看' }}
      />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="SettingsMain" 
        component={SettingsScreen}
        options={{ title: '设置' }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ title: '首页' }}
      />
      <Tab.Screen 
        name="Download" 
        component={DownloadStack}
        options={{ title: '下载' }}
      />
      <Tab.Screen 
        name="Library" 
        component={LibraryStack}
        options={{ title: '收藏' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsStack}
        options={{ title: '设置' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ApiProvider>
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    </ApiProvider>
  );
}
