import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Settings } from "lucide-react";
import { useToast } from "../../contexts/toast";

type APIProvider = "openai" | "gemini" | "anthropic";

type AIModel = {
  id: string;
  name: string;
  description: string;
};

type ModelCategory = {
  key: 'extractionModel' | 'solutionModel' | 'debuggingModel';
  title: string;
  description: string;
  openaiModels: AIModel[];
  geminiModels: AIModel[];
  anthropicModels: AIModel[];
};

// Define available models for each category
const modelCategories: ModelCategory[] = [
  {
    key: 'extractionModel',
    title: '问题提取',
    description: '分析屏幕截图和提取问题细节的模型',
    openaiModels: [
      {
        id: "gpt-4o",
        name: "gpt-4o",
        description: "问题整体性能提取的最佳"
      },
      {
        id: "gpt-4o-mini",
        name: "gpt-4o-mini",
        description: "更快、更具成本效益的选择"
      }
    ],
    geminiModels: [
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        description: "问题整体性能提取的最佳"
      },
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        description: "更快、更具成本效益的选择"
      }
    ],
    anthropicModels: [
      {
        id: "claude-3-7-sonnet-20250219",
        name: "Claude 3.7 Sonnet",
        description: "问题整体性能提取的最佳"
      },
      {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        description: "在性能和速度间平衡"
      },
      {
        id: "claude-3-opus-20240229",
        name: "Claude 3 Opus",
        description: "顶尖的智力、流利度和理解力"
      }
    ]
  },
  {
    key: 'solutionModel',
    title: '生成解决方案',
    description: '用于生成编码解决方案的模型',
    openaiModels: [
      {
        id: "gpt-4o",
        name: "gpt-4o",
        description: "编码任务的整体性能强劲"
      },
      {
        id: "gpt-4o-mini",
        name: "gpt-4o-mini",
        description: "更快、更具成本效益的选择"
      }
    ],
    geminiModels: [
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        description: "编码任务的整体性能强劲"
      },
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        description: "更快、更具成本效益的选择"
      }
    ],
    anthropicModels: [
      {
        id: "claude-3-7-sonnet-20250219",
        name: "Claude 3.7 Sonnet",
        description: "编码任务的整体性能强劲"
      },
      {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        description: "在性能和速度间平衡"
      },
      {
        id: "claude-3-opus-20240229",
        name: "Claude 3 Opus",
        description: "顶尖的智力、流利度和理解力"
      }
    ]
  },
  {
    key: 'debuggingModel',
    title: 'Debugging',
    description: '用于调试和改进解决方案的模型',
    openaiModels: [
      {
        id: "gpt-4o",
        name: "gpt-4o",
        description: "最适合分析代码和错误消息"
      },
      {
        id: "gpt-4o-mini",
        name: "gpt-4o-mini",
        description: "更快、更具成本效益的选择"
      }
    ],
    geminiModels: [
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        description: "最适合分析代码和错误消息"
      },
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        description: "更快、更具成本效益的选择"
      }
    ],
    anthropicModels: [
      {
        id: "claude-3-7-sonnet-20250219",
        name: "Claude 3.7 Sonnet",
        description: "最适合分析代码和错误消息"
      },
      {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        description: "在性能和速度间平衡"
      },
      {
        id: "claude-3-opus-20240229",
        name: "Claude 3 Opus",
        description: "顶尖的智力、流利度和理解力"
      }
    ]
  }
];

interface SettingsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SettingsDialog({ open: externalOpen, onOpenChange }: SettingsDialogProps) {
  const [open, setOpen] = useState(externalOpen || false);
  const [apiKey, setApiKey] = useState("");
  const [apiProvider, setApiProvider] = useState<APIProvider>("openai");
  const [extractionModel, setExtractionModel] = useState("gpt-4o");
  const [solutionModel, setSolutionModel] = useState("gpt-4o");
  const [debuggingModel, setDebuggingModel] = useState("gpt-4o");
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  // Sync with external open state
  useEffect(() => {
    if (externalOpen !== undefined) {
      setOpen(externalOpen);
    }
  }, [externalOpen]);

  // Handle open state changes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    // Only call onOpenChange when there's actually a change
    if (onOpenChange && newOpen !== externalOpen) {
      onOpenChange(newOpen);
    }
  };
  
  // Load current config on dialog open
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      interface Config {
        apiKey?: string;
        apiProvider?: APIProvider;
        extractionModel?: string;
        solutionModel?: string;
        debuggingModel?: string;
      }

      window.electronAPI
        .getConfig()
        .then((config: Config) => {
          setApiKey(config.apiKey || "");
          setApiProvider(config.apiProvider || "openai");
          setExtractionModel(config.extractionModel || "gpt-4o");
          setSolutionModel(config.solutionModel || "gpt-4o");
          setDebuggingModel(config.debuggingModel || "gpt-4o");
        })
        .catch((error: unknown) => {
          console.error("Failed to load config:", error);
          showToast("Error", "Failed to load settings", "error");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, showToast]);

  // Handle API provider change
  const handleProviderChange = (provider: APIProvider) => {
    setApiProvider(provider);
    
    // Reset models to defaults when changing provider
    if (provider === "openai") {
      setExtractionModel("gpt-4o");
      setSolutionModel("gpt-4o");
      setDebuggingModel("gpt-4o");
    } else if (provider === "gemini") {
      setExtractionModel("gemini-1.5-pro");
      setSolutionModel("gemini-1.5-pro");
      setDebuggingModel("gemini-1.5-pro");
    } else if (provider === "anthropic") {
      setExtractionModel("claude-3-7-sonnet-20250219");
      setSolutionModel("claude-3-7-sonnet-20250219");
      setDebuggingModel("claude-3-7-sonnet-20250219");
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await window.electronAPI.updateConfig({
        apiKey,
        apiProvider,
        extractionModel,
        solutionModel,
        debuggingModel,
      });
      
      if (result) {
        showToast("Success", "Settings saved successfully", "success");
        handleOpenChange(false);
        
        // Force reload the app to apply the API key
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      showToast("Error", "Failed to save settings", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Mask API key for display
  const maskApiKey = (key: string) => {
    if (!key || key.length < 10) return "";
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  };

  // Open external link handler
  const openExternalLink = (url: string) => {
    window.electronAPI.openLink(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-md bg-black border border-white/10 text-white settings-dialog"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(450px, 90vw)',
          height: 'auto',
          minHeight: '400px',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 9999,
          margin: 0,
          padding: '20px',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
          animation: 'fadeIn 0.25s ease forwards',
          opacity: 0.98
        }}
      >        
        <DialogHeader>
          <DialogTitle>API 配置</DialogTitle>
          <DialogDescription className="text-white/70">
            配置您的API密钥和模型偏好。您需要自己的API密钥才能使用此应用程序。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* API Provider Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">API 提供商</label>
            <div className="flex gap-2">
              <div
                className={`flex-1 p-2 rounded-lg cursor-pointer transition-colors ${
                  apiProvider === "openai"
                    ? "bg-white/10 border border-white/20"
                    : "bg-black/30 border border-white/5 hover:bg-white/5"
                }`}
                onClick={() => handleProviderChange("openai")}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      apiProvider === "openai" ? "bg-white" : "bg-white/20"
                    }`}
                  />
                  <div className="flex flex-col">
                    <p className="font-medium text-white text-sm">OpenAI</p>
                    <p className="text-xs text-white/60">GPT-4o models</p>
                  </div>
                </div>
              </div>
              <div
                className={`flex-1 p-2 rounded-lg cursor-pointer transition-colors ${
                  apiProvider === "gemini"
                    ? "bg-white/10 border border-white/20"
                    : "bg-black/30 border border-white/5 hover:bg-white/5"
                }`}
                onClick={() => handleProviderChange("gemini")}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      apiProvider === "gemini" ? "bg-white" : "bg-white/20"
                    }`}
                  />
                  <div className="flex flex-col">
                    <p className="font-medium text-white text-sm">Gemini</p>
                    <p className="text-xs text-white/60">Gemini 1.5 models</p>
                  </div>
                </div>
              </div>
              <div
                className={`flex-1 p-2 rounded-lg cursor-pointer transition-colors ${
                  apiProvider === "anthropic"
                    ? "bg-white/10 border border-white/20"
                    : "bg-black/30 border border-white/5 hover:bg-white/5"
                }`}
                onClick={() => handleProviderChange("anthropic")}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      apiProvider === "anthropic" ? "bg-white" : "bg-white/20"
                    }`}
                  />
                  <div className="flex flex-col">
                    <p className="font-medium text-white text-sm">Claude</p>
                    <p className="text-xs text-white/60">Claude 3 models</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white" htmlFor="apiKey">
            {apiProvider === "openai" ? "OpenAI API 密钥" :
             apiProvider === "gemini" ? "Gemini API 密钥" :
             "Anthropic API Key"}
            </label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                apiProvider === "openai" ? "sk-..." : 
                apiProvider === "gemini" ? "Enter your Gemini API key" :
                "sk-ant-..."
              }
              className="bg-black/50 border-white/10 text-white"
            />
            {apiKey && (
              <p className="text-xs text-white/50">
                Current: {maskApiKey(apiKey)}
              </p>
            )}
            <p className="text-xs text-white/50">
              您的API密钥存储在本地 除了 {apiProvider === "openai" ? "OpenAI" : "Google"}
            </p>
            <div className="mt-2 p-2 rounded-md bg-white/5 border border-white/10">
              <p className="text-xs text-white/80 mb-1">你没有API密钥吗？</p>
              {apiProvider === "openai" ? (
                <>
                  <p className="text-xs text-white/60 mb-1">1. 创建一个账户 <button
                    onClick={() => openExternalLink('https://platform.openai.com/signup')} 
                    className="text-blue-400 hover:underline cursor-pointer">OpenAI</button>
                  </p>
                  <p className="text-xs text-white/60 mb-1">2. 前往 <button
                    onClick={() => openExternalLink('https://platform.openai.com/api-keys')} 
                    className="text-blue-400 hover:underline cursor-pointer">API Keys</button> section
                  </p>
                  <p className="text-xs text-white/60">3. 创建一个新的API密钥并粘贴到这里</p>
                </>
              ) : apiProvider === "gemini" ?  (
                <>
                  <p className="text-xs text-white/60 mb-1">1. 创建一个账户 <button
                    onClick={() => openExternalLink('https://aistudio.google.com/')} 
                    className="text-blue-400 hover:underline cursor-pointer">Google AI Studio</button>
                  </p>
                  <p className="text-xs text-white/60 mb-1">2. 前往 <button
                    onClick={() => openExternalLink('https://aistudio.google.com/app/apikey')} 
                    className="text-blue-400 hover:underline cursor-pointer">API Keys</button> section
                  </p>
                  <p className="text-xs text-white/60">3. 创建一个新的API密钥并粘贴到这里</p>
                </>
              ) : (
                <>
                  <p className="text-xs text-white/60 mb-1">1. 创建一个账户 <button
                    onClick={() => openExternalLink('https://console.anthropic.com/signup')} 
                    className="text-blue-400 hover:underline cursor-pointer">Anthropic</button>
                  </p>
                  <p className="text-xs text-white/60 mb-1">2. 前往 <button
                    onClick={() => openExternalLink('https://console.anthropic.com/settings/keys')} 
                    className="text-blue-400 hover:underline cursor-pointer">API Keys</button> section
                  </p>
                  <p className="text-xs text-white/60">3. 创建一个新的API密钥并粘贴到这里</p>
                </>
              )}
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium text-white mb-2 block">键盘快捷键</label>
            <div className="bg-black/30 border border-white/10 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <div className="text-white/70">切换可见性</div>
                <div className="text-white/90 font-mono">Ctrl+B / Cmd+B</div>
                
                <div className="text-white/70">截图</div>
                <div className="text-white/90 font-mono">Ctrl+H / Cmd+H</div>
                
                <div className="text-white/70">处理截图</div>
                <div className="text-white/90 font-mono">Ctrl+Enter / Cmd+Enter</div>
                
                <div className="text-white/70">删除最后截图</div>
                <div className="text-white/90 font-mono">Ctrl+L / Cmd+L</div>
                
                <div className="text-white/70">重置视图</div>
                <div className="text-white/90 font-mono">Ctrl+R / Cmd+R</div>
                
                <div className="text-white/70">退出应用程序</div>
                <div className="text-white/90 font-mono">Ctrl+Q / Cmd+Q</div>
                
                <div className="text-white/70">移动窗口</div>
                <div className="text-white/90 font-mono">Ctrl+Arrow Keys</div>
                
                <div className="text-white/70">减少透明度</div>
                <div className="text-white/90 font-mono">Ctrl+[ / Cmd+[</div>
                
                <div className="text-white/70">增加透明度</div>
                <div className="text-white/90 font-mono">Ctrl+] / Cmd+]</div>
                
                <div className="text-white/70">缩小</div>
                <div className="text-white/90 font-mono">Ctrl+- / Cmd+-</div>
                
                <div className="text-white/70">重置</div>
                <div className="text-white/90 font-mono">Ctrl+0 / Cmd+0</div>
                
                <div className="text-white/70">放大</div>
                <div className="text-white/90 font-mono">Ctrl+= / Cmd+=</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 mt-4">
            <label className="text-sm font-medium text-white">AI 模型选择</label>
            <p className="text-xs text-white/60 -mt-3 mb-2">
              为每个阶段选择要使用的模型
            </p>
            
            {modelCategories.map((category) => {
              // Get the appropriate model list based on selected provider
              const models = 
                apiProvider === "openai" ? category.openaiModels : 
                apiProvider === "gemini" ? category.geminiModels :
                category.anthropicModels;
              
              return (
                <div key={category.key} className="mb-4">
                  <label className="text-sm font-medium text-white mb-1 block">
                    {category.title}
                  </label>
                  <p className="text-xs text-white/60 mb-2">{category.description}</p>
                  
                  <div className="space-y-2">
                    {models.map((m) => {
                      // Determine which state to use based on category key
                      const currentValue = 
                        category.key === 'extractionModel' ? extractionModel :
                        category.key === 'solutionModel' ? solutionModel :
                        debuggingModel;
                      
                      // Determine which setter function to use
                      const setValue = 
                        category.key === 'extractionModel' ? setExtractionModel :
                        category.key === 'solutionModel' ? setSolutionModel :
                        setDebuggingModel;
                        
                      return (
                        <div
                          key={m.id}
                          className={`p-2 rounded-lg cursor-pointer transition-colors ${
                            currentValue === m.id
                              ? "bg-white/10 border border-white/20"
                              : "bg-black/30 border border-white/5 hover:bg-white/5"
                          }`}
                          onClick={() => setValue(m.id)}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                currentValue === m.id ? "bg-white" : "bg-white/20"
                              }`}
                            />
                            <div>
                              <p className="font-medium text-white text-xs">{m.name}</p>
                              <p className="text-xs text-white/60">{m.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="border-white/10 hover:bg-white/5 text-white"
          >
            取消
          </Button>
          <Button
            className="px-4 py-3 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors"
            onClick={handleSave}
            disabled={isLoading || !apiKey}
          >
            {isLoading ? "正在保存中..." : "保存设置"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
