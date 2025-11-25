import { useState, useEffect, useRef } from 'react';
import apiService from '../services/api';

export const useDownload = (taskId) => {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!taskId) return;

    const pollStatus = async () => {
      try {
        const statusData = await apiService.getDownloadStatus(taskId);
        setStatus(statusData);
        setError(null);

        // 如果任务完成或失败，停止轮询
        if (statusData.status === 'completed' || statusData.status === 'failed') {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (err) {
        setError(err.message);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    // 立即查询一次
    pollStatus();

    // 然后每2秒轮询一次
    intervalRef.current = setInterval(pollStatus, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [taskId]);

  return { status, error };
};

export const useStartDownload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taskId, setTaskId] = useState(null);

  const startDownload = async (albumId) => {
    setLoading(true);
    setError(null);
    setTaskId(null);

    try {
      const response = await apiService.startDownload(albumId);
      setTaskId(response.task_id);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { startDownload, loading, error, taskId };
};

