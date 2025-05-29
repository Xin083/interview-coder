import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { PythonShell } from 'python-shell';
import { app } from 'electron';

const execAsync = promisify(exec);

export interface TikTokVideo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  timestamp: string;
}

export class TikTokService {
  private downloadPath: string;
  private pythonPath: string;
  private ytDlpPath: string;

  constructor() {
    // 设置下载路径为应用数据目录
    this.downloadPath = path.join(app.getPath('userData'), 'downloads');
    if (!fs.existsSync(this.downloadPath)) {
      fs.mkdirSync(this.downloadPath, { recursive: true });
    }

    // 设置 Python 和 yt-dlp 路径
    if (process.platform === 'win32') {
      this.pythonPath = path.join(process.resourcesPath, 'python', 'python.exe');
      this.ytDlpPath = path.join(process.resourcesPath, 'python', 'yt-dlp');
    } else {
      this.pythonPath = '/usr/local/bin/python3';
      this.ytDlpPath = 'yt-dlp';
    }

    console.log('Python path:', this.pythonPath);
    console.log('yt-dlp path:', this.ytDlpPath);
  }

  private async ensurePythonEnvironment(): Promise<void> {
    try {
      // 检查 Python 环境是否存在
      if (!fs.existsSync(this.pythonPath)) {
        console.error('Python not found at:', this.pythonPath);
        throw new Error('Python 环境未找到，请重新安装应用');
      }

      // 验证 Python 环境
      console.log('Verifying Python environment...');
      const options = {
        mode: 'text' as const,
        pythonPath: this.pythonPath,
        args: ['--version']
      };

      await new Promise((resolve, reject) => {
        PythonShell.runString('import sys; print(sys.version)', options)
          .then(() => {
            console.log('Python environment verified successfully');
            resolve(true);
          })
          .catch((error) => {
            console.error('Python environment verification failed:', error);
            reject(error);
          });
      });

      // 验证 yt-dlp
      console.log('Verifying yt-dlp...');
      const ytDlpCommand = process.platform === 'win32' 
        ? `"${this.pythonPath}" "${this.ytDlpPath}" --version`
        : `${this.ytDlpPath} --version`;

      const { stdout: ytDlpVersion } = await execAsync(ytDlpCommand);
      console.log('yt-dlp version:', ytDlpVersion);

    } catch (error) {
      console.error('Python 环境检查失败:', error);
      throw new Error('Python 环境初始化失败，请重新安装应用');
    }
  }

  async fetchUserVideos(username: string): Promise<TikTokVideo[]> {
    try {
      console.log('Starting to fetch videos for username:', username);
      if (!username || !username.trim()) {
        throw new Error('用户名不能为空');
      }
      // 验证用户名格式
      if (!/^[a-zA-Z0-9._]+$/.test(username)) {
        throw new Error('用户名格式不正确，只能包含字母、数字、下划线和点');
      }
      // 移除可能的 @ 前缀
      username = username.replace(/^@/, '');
      console.log('Normalized username:', username);

      // 确保 Python 环境可用
      await this.ensurePythonEnvironment();

      // 使用内置的 Python 和 yt-dlp 获取视频信息
      const command = process.platform === 'win32'
        ? `"${this.pythonPath}" "${this.ytDlpPath}" --flat-playlist --dump-json --no-playlist-reverse --no-warnings "https://www.tiktok.com/@${username}"`
        : `${this.ytDlpPath} --flat-playlist --dump-json --no-playlist-reverse --no-warnings "https://www.tiktok.com/@${username}"`;

      console.log('Executing command:', command);
      let stdout = '', stderr = '';
      try {
        const result = await execAsync(command, { 
          timeout: 60000,
          env: { ...process.env, PATH: process.env.PATH },
          shell: process.platform === 'win32' ? undefined : '/bin/zsh'
        });
        stdout = result.stdout;
        stderr = result.stderr;
        // 只在调试时输出
        if (process.env.NODE_ENV === 'development') {
          console.log('Command stdout:', stdout);
          console.log('Command stderr:', stderr);
        }
      } catch (execErr: unknown) {
        if (execErr && typeof execErr === 'object' && 'killed' in execErr && execErr.killed) {
          console.error('yt-dlp 执行超时');
          throw new Error('抓取超时，请稍后重试');
        }
        if (execErr && typeof execErr === 'object' && 'code' in execErr && 'stderr' in execErr && 
            execErr.code === 1 && typeof execErr.stderr === 'string' && execErr.stderr.includes('HTTP Error 404')) {
          throw new Error('用户不存在或 TikTok 页面无法访问');
        }
        console.error('yt-dlp 执行失败:', execErr);
        throw new Error('抓取失败，可能是网络或 TikTok 限制');
      }
      if (stderr) {
        console.warn('yt-dlp stderr:', stderr);
      }
      if (!stdout) {
        console.error('No output from yt-dlp');
        throw new Error('未获取到视频数据');
      }

      // 解析输出
      const videos: TikTokVideo[] = [];
      const lines = stdout.split('\n').filter(line => line.trim());
      console.log('Found', lines.length, 'videos');

      // 从输出中提取视频信息
      for (const line of lines) {
        try {
          // 解析 JSON 输出
          const videoInfo = JSON.parse(line);
          if (!videoInfo.id || !videoInfo.webpage_url) {
            continue;
          }

          // 提取视频 ID
          const id = videoInfo.id;
          const title = videoInfo.title || 'Untitled';
          const duration = videoInfo.duration ? this.formatDuration(videoInfo.duration) : '0:00';
          const timestamp = videoInfo.timestamp ? new Date(videoInfo.timestamp * 1000).toLocaleString() : new Date().toLocaleString();

          videos.push({
            id,
            title,
            url: `https://www.tiktok.com/@${username}/video/${id}`,
            thumbnail: `https://p16-sign.tiktokcdn.com/tos-maliva-p-0068/${id}~tplv-obj2:1080:1080:0:0.webp`,
            duration,
            timestamp
          });
        } catch (e) {
          console.error('解析视频信息出错:', e);
          console.error('出错行:', line);
        }
      }

      if (videos.length === 0) {
        throw new Error('该用户没有视频或全部解析失败');
      }
      console.log('Successfully processed', videos.length, 'videos');
      return videos;
    } catch (error: unknown) {
      console.error('fetchUserVideos 捕获到异常:', error);
      if (error instanceof Error) {
        throw new Error(`获取视频失败: ${error.message}`);
      }
      throw new Error('获取视频失败，未知错误');
    }
  }

  private formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
} 