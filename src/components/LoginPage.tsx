import logo from '../../assets/logo.svg';
import { COMMAND_KEY } from "../utils/platform"
import { useEffect, useRef } from "react";

export const LoginPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      const height = containerRef.current.scrollHeight || 600;
      const width = containerRef.current.scrollWidth || 800;
      window.electronAPI?.updateContentDimensions({ width, height });
    };

    // Force initial dimension update immediately
    updateDimensions();
    
    // Set a fallback timer to ensure dimensions are set
    const fallbackTimer = setTimeout(() => {
      window.electronAPI?.updateContentDimensions({ width: 800, height: 600 });
    });

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const url = 'https://www.interviewcoder.cn/auth/session';
    try {
      const api = (window as any).electronAPI;
      console.log('api:', api);
      
      if (api?.openExternal) {
        await api.openExternal(url);
      } else {
        window.open(url, '_blank');
      }
    } catch (error) {
      window.open(url, '_blank');
    }
  };

  return (
    <div ref={containerRef} className="bg-black min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-black border border-white/10 rounded-xl p-8 shadow-lg flex flex-col items-center">
        <div className="bg-white rounded-full w-28 h-28 flex items-center justify-center mb-8 shadow-md overflow-hidden">
          <img src={logo} alt="logo" className="w-28 h-28 object-cover rounded-full" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-4 text-center">Log in to Interview Coder</h1>
        <p className="text-white/70 text-base mb-6 text-center">
          Please follow the next steps. If you are not redirected automatically,
          <a
            href="https://www.interviewcoder.cn/auth/session"
            className="text-yellow-300 hover:underline ml-1"
            onClick={handleClick}
          >
            click here
          </a>
        </p>
        <hr className="border-white/10 w-full mb-6" />
        <div className="w-full">
          <h3 className="text-white/90 font-medium mb-2 text-left">Keyboard shortcuts</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-white/10 text-white/80 rounded px-2 py-1 text-sm font-mono">{COMMAND_KEY} + ][</span>
              <span className="text-white/80 text-sm">to light and shade</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white/10 text-white/80 rounded px-2 py-1 text-sm font-mono">{COMMAND_KEY} + B</span>
              <span className="text-white/80 text-sm">to toggle visibility</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white/10 text-white/80 rounded px-2 py-1 text-sm font-mono">{COMMAND_KEY} + Q</span>
              <span className="text-white/80 text-sm">to quit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
