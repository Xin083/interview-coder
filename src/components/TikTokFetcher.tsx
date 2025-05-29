import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { TikTokVideo } from '../services/tiktokService';
import { useToast } from '../contexts/toast';

export const TikTokFetcher: React.FC = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleFetch = async () => {
    if (loading) return;
    if (!username.trim()) {
      setError('请输入 TikTok 用户名');
      return;
    }

    setLoading(true);
    setError(null);
    setVideos([]);

    try {
      const result = await window.electron.ipcRenderer.invoke('fetch-tiktok-videos', username);
      if (result.success) {
        setVideos(result.data);
        if (result.data.length === 0) {
          showToast('无视频', '该用户没有找到视频', 'neutral');
        } else {
          showToast('成功', `共找到 ${result.data.length} 个视频`, 'success');
        }
      } else {
        const errorMessage = result.error || '获取视频失败';
        setError(errorMessage);
        showToast('错误', errorMessage, 'error');
      }
    } catch (err) {
      let errorMessage = '获取视频时发生未知错误';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
      showToast('错误', errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleFetch();
    }
  };

  return (
    <div className="p-4 space-y-4 bg-gray-900 min-h-screen">
      <div className="flex gap-2">
        <Input
          placeholder="请输入 TikTok 用户名（不带@）"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-gray-800 text-white border-gray-700"
          disabled={loading}
        />
        <Button onClick={handleFetch} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Fetch Videos
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/50 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {videos.map((video) => (
          <Card key={video.id} className="p-4 bg-gray-800 border-gray-700">
            <div className="flex gap-4">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-48 h-48 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 text-white">{video.title}</h3>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>Duration: {video.duration}</p>
                  <p>Posted: {video.timestamp}</p>
                </div>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 hover:underline text-sm mt-2 inline-block"
                >
                  View on TikTok
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}; 