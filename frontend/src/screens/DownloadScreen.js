import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDownload } from '../hooks/useDownload';
import apiService from '../services/api';

const ACTIVE_TASKS_KEY = '@active_tasks';

export default function DownloadScreen() {
  const [activeTasks, setActiveTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadActiveTasks();
  }, []);

  const loadActiveTasks = async () => {
    try {
      const tasksJson = await AsyncStorage.getItem(ACTIVE_TASKS_KEY);
      if (tasksJson) {
        const tasks = JSON.parse(tasksJson);
        setActiveTasks(tasks);
      }
    } catch (error) {
      console.error('加载任务列表失败:', error);
    }
  };

  const saveActiveTasks = async (tasks) => {
    try {
      await AsyncStorage.setItem(ACTIVE_TASKS_KEY, JSON.stringify(tasks));
      setActiveTasks(tasks);
    } catch (error) {
      console.error('保存任务列表失败:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActiveTasks();
    setRefreshing(false);
  };

  const removeTask = async (taskId) => {
    const filtered = activeTasks.filter((t) => t.task_id !== taskId);
    await saveActiveTasks(filtered);
  };

  const renderTask = ({ item }) => (
    <TaskItem
      task={item}
      onRemove={() => removeTask(item.task_id)}
    />
  );

  if (activeTasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>暂无下载任务</Text>
        <Text style={styles.emptySubtext}>在首页输入专辑ID开始下载</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={activeTasks}
      renderItem={renderTask}
      keyExtractor={(item) => item.task_id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

function TaskItem({ task, onRemove }) {
  const { status, error } = useDownload(task.task_id);

  const getStatusText = () => {
    if (!status) return '查询中...';
    switch (status.status) {
      case 'pending':
        return '等待中';
      case 'downloading':
        return '下载中';
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
      default:
        return '未知';
    }
  };

  const getStatusColor = () => {
    if (!status) return '#999';
    switch (status.status) {
      case 'pending':
        return '#FFA500';
      case 'downloading':
        return '#2196F3';
      case 'completed':
        return '#4CAF50';
      case 'failed':
        return '#F44336';
      default:
        return '#999';
    }
  };

  return (
    <View style={styles.taskItem}>
      <View style={styles.taskHeader}>
        <Text style={styles.albumId}>专辑ID: {task.album_id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusBadgeText}>{getStatusText()}</Text>
        </View>
      </View>

      {status && (
        <>
          {status.status === 'downloading' && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${status.progress * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(status.progress * 100)}%
              </Text>
            </View>
          )}

          {status.message && (
            <Text style={styles.message}>{status.message}</Text>
          )}

          {status.error && (
            <Text style={styles.error}>{status.error}</Text>
          )}

          {status.current_image && status.total_images && (
            <Text style={styles.imageInfo}>
              {status.current_image} / {status.total_images} 张图片
            </Text>
          )}
        </>
      )}

      {(status?.status === 'completed' || status?.status === 'failed') && (
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Text style={styles.removeButtonText}>移除</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// 导出函数以便从其他页面添加任务
export const addActiveTask = async (task) => {
  try {
    const tasksJson = await AsyncStorage.getItem(ACTIVE_TASKS_KEY);
    const tasks = tasksJson ? JSON.parse(tasksJson) : [];
    
    // 避免重复添加
    if (!tasks.find((t) => t.task_id === task.task_id)) {
      tasks.unshift(task);
      await AsyncStorage.setItem(ACTIVE_TASKS_KEY, JSON.stringify(tasks));
    }
    return true;
  } catch (error) {
    console.error('添加任务失败:', error);
    return false;
  }
};

const styles = StyleSheet.create({
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
  taskItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  albumId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    minWidth: 40,
    textAlign: 'right',
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  error: {
    fontSize: 14,
    color: '#F44336',
    marginBottom: 4,
  },
  imageInfo: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  removeButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#666',
    fontSize: 14,
  },
});

