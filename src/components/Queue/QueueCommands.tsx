import React, { useState, useEffect, useRef } from "react"
import { createRoot } from "react-dom/client"
import { createClient } from '@supabase/supabase-js'

import { useToast } from "../../contexts/toast"
import { LanguageSelector } from "../shared/LanguageSelector"
import { COMMAND_KEY } from "../../utils/platform"
import { SUPABASE_CONFIG } from '../../config/supabase'

const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)

interface QueueCommandsProps {
  onTooltipVisibilityChange: (visible: boolean, height: number) => void
  screenshotCount?: number
  credits: number
  currentLanguage: string
  setLanguage: (language: string) => void
  onDeleteLastScreenshot?: () => Promise<void>
}

const QueueCommands: React.FC<QueueCommandsProps> = ({
  onTooltipVisibilityChange,
  screenshotCount = 0,
  credits,
  currentLanguage,
  setLanguage,
  onDeleteLastScreenshot
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const [userEmail, setUserEmail] = useState<string>("")
  const tooltipRef = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()
  const [isPro, setIsPro] = useState<boolean>(false)
  const [checkingSub, setCheckingSub] = useState<boolean>(true)

  useEffect(() => {
    // 从 localStorage 获取用户邮箱
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      try {
        const parts = accessToken.split('.')
        if (parts.length !== 3) {
          return
        }
        const base64Payload = parts[1]
        const decodedPayload = base64UrlDecode(base64Payload)
        const payload = JSON.parse(decodedPayload)
        setUserEmail(payload.email || '')
      } catch (error) {
        // ignore
      }
    }

    // 添加登录状态变化监听
    const handleLoginStateChange = (event: CustomEvent<boolean>) => {
      if (event.detail) {
        const newAccessToken = localStorage.getItem('accessToken')
        if (newAccessToken) {
          try {
            const parts = newAccessToken.split('.')
            if (parts.length !== 3) {
              return
            }
            const base64Payload = parts[1]
            const decodedPayload = base64UrlDecode(base64Payload)
            const payload = JSON.parse(decodedPayload)
            setUserEmail(payload.email || '')
          } catch (error) {
            // ignore
          }
        }
      } else {
        setUserEmail('')
      }
    }

    window.addEventListener('loginStateChange', handleLoginStateChange as unknown as EventListener)
    return () => {
      window.removeEventListener('loginStateChange', handleLoginStateChange as unknown as EventListener)
    }
  }, [])

  useEffect(() => {
    const checkSubscription = async () => {
      setCheckingSub(true)
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) {
        setIsPro(false)
        setCheckingSub(false)
        return
      }
      try {
        const payload = JSON.parse(base64UrlDecode(accessToken.split('.')[1]))
        const userId = payload.sub
        const { data, error } = await supabase
          .from('subscriptions')
          .select('plan,status')
          .eq('user_id', userId)
          .maybeSingle()
        if (data && data.plan === 'pro' && data.status === 'active') {
          setIsPro(true)
        } else {
          setIsPro(false)
        }
      } catch (e) {
        setIsPro(false)
      }
      setCheckingSub(false)
    }
    checkSubscription()
  }, [])

  // Extract the repeated language selection logic into a separate function
  const extractLanguagesAndUpdate = (direction?: 'next' | 'prev') => {
    // Create a hidden instance of LanguageSelector to extract languages
    const hiddenRenderContainer = document.createElement('div');
    hiddenRenderContainer.style.position = 'absolute';
    hiddenRenderContainer.style.left = '-9999px';
    document.body.appendChild(hiddenRenderContainer);
    
    // Create a root and render the LanguageSelector temporarily
    const root = createRoot(hiddenRenderContainer);
    root.render(
      <LanguageSelector 
        currentLanguage={currentLanguage} 
        setLanguage={() => {}}
      />
    );
    
    // Use a small delay to ensure the component has rendered
    // 50ms is generally enough for React to complete a render cycle
    setTimeout(() => {
      // Extract options from the rendered select element
      const selectElement = hiddenRenderContainer.querySelector('select');
      if (selectElement) {
        const options = Array.from(selectElement.options);
        const values = options.map(opt => opt.value);
        
        // Find current language index
        const currentIndex = values.indexOf(currentLanguage);
        let newIndex = currentIndex;
        
        if (direction === 'prev') {
          // Go to previous language
          newIndex = (currentIndex - 1 + values.length) % values.length;
        } else {
          // Default to next language
          newIndex = (currentIndex + 1) % values.length;
        }
        
        if (newIndex !== currentIndex) {
          setLanguage(values[newIndex]);
          window.electronAPI.updateConfig({ language: values[newIndex] });
        }
      }
      
      // Clean up
      root.unmount();
      document.body.removeChild(hiddenRenderContainer);
    }, 50);
  };

  useEffect(() => {
    let tooltipHeight = 0
    if (tooltipRef.current && isTooltipVisible) {
      tooltipHeight = tooltipRef.current.offsetHeight + 10
    }
    onTooltipVisibilityChange(isTooltipVisible, tooltipHeight)
  }, [isTooltipVisible])

  const handleSignOut = async () => {
    try {
      // Clear any local storage or electron-specific data
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear the API key in the configuration
      await window.electronAPI.updateConfig({
        apiKey: '',
      });
      
      showToast('Success', 'Logged out successfully', 'success');
      
      // Reload the app after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Error logging out:", err);
      showToast('Error', 'Failed to log out', 'error');
    }
  }

  const handleMouseEnter = () => {
    setIsTooltipVisible(true)
  }

  const handleMouseLeave = () => {
    setIsTooltipVisible(false)
  }

  return (
    <div>
      <div className="pt-2 w-fit select-none" >
        <div className="text-xs text-white/90 backdrop-blur-md bg-black/60 rounded-lg py-2 px-4 flex items-center justify-center gap-4">
          
        <div className="flex items-center gap-4 truncate">
            {/* Unlock Pro 按钮 */}
            {/* <button
            
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded-lg transition-colors"
              onClick={() => {
                window.electronAPI?.openExternal?.("https://www.interviewcoder.cn/#pricing");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-6V9a6 6 0 10-12 0v2a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2z"
                />
              </svg>
              Unlock Pro
            </button> */}

            
            {checkingSub ? (
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded-lg transition-colors">查询中...</button>
            ) : isPro ? (
              <button className="flex items-center gap-2 bg-green-600 text-white font-bold px-4 py-1.5 rounded-lg" disabled>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8V7a5 5 0 00-10 0v1m12 4v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7a2 2 0 012-2h10a2 2 0 012 2z"
                  />
                </svg>
                已解锁 Pro
              </button>
            ) : (
              <button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded-lg transition-colors"
                onClick={() => {
                  window.electronAPI?.openExternal?.("http://localhost:3000/#pricing")
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-6V9a6 6 0 10-12 0v2a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2z"
                />
              </svg>
              解锁 Pro
            </button>
            )}
            {/* 其它按钮... */}
          </div>
          
          {/* Screenshot */}
          <div
            className="flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 hover:bg-white/10 transition-colors"
            onClick={async () => {
              try {
                const result = await window.electronAPI.triggerScreenshot()
                if (!result.success) {
                  console.error("Failed to take screenshot:", result.error)
                  showToast("Error", "Failed to take screenshot", "error")
                }
              } catch (error) {
                console.error("Error taking screenshot:", error)
                showToast("Error", "Failed to take screenshot", "error")
              }
            }}
          >
            <span className="text-[11px] leading-none truncate">
              {screenshotCount === 0
                ? "使用快捷键截屏"
                : screenshotCount === 1
                ? "第1张截图"
                : screenshotCount === 2
                ? "第2张截图"
                : screenshotCount === 3
                ? "第3张截图"
                : screenshotCount === 4
                ? "第4张截图"
                : screenshotCount === 4
                ? "第5张截图"
                : "下一步将替换第一个截图"}
            </span>
            <div className="flex gap-1">
              <button className="bg-white/10 rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
                {COMMAND_KEY}
              </button>
              <button className="bg-white/10 rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
                H
              </button>
            </div>
          </div>

          {/* Solve Command */}
          {screenshotCount > 0 && (
            <div
              className={`flex flex-col cursor-pointer rounded px-2 py-1.5 hover:bg-white/10 transition-colors truncate ${
                credits <= 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={async () => {

                try {
                  const result =
                    await window.electronAPI.triggerProcessScreenshots()
                  if (!result.success) {
                    console.error(
                      "Failed to process screenshots:",
                      result.error
                    )
                    showToast("Error", "Failed to process screenshots", "error")
                  }
                } catch (error) {
                  console.error("Error processing screenshots:", error)
                  showToast("Error", "Failed to process screenshots", "error")
                }
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] leading-none">解答 </span>
                <div className="flex gap-1 ml-2">
                  <button className="bg-white/10 rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
                    {COMMAND_KEY}
                  </button>
                  <button className="bg-white/10 rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
                    ↵
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Solve Command */}
          {screenshotCount >= 0 && (
            <div
              className={`flex items-center cursor-pointer rounded px-2 py-1.5 hover:bg-white/10 transition-colors truncate ${
                screenshotCount > 0 && credits > 0
                  ? ""
                  : "opacity-50 cursor-not-allowed pointer-events-none"
              }`}
              onClick={async () => {
                if (screenshotCount === 0 || credits <= 0) return;
                try {
                  const result = await window.electronAPI.triggerReset();
                  if (!result.success) {
                    showToast("Error", "Failed to reset screenshots", "error");
                  }
                } catch (error) {
                  showToast("Error", "Failed to reset screenshots", "error");
                }
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] leading-none">重置 </span>
                <div className="flex gap-1 ml-2">
                  <button className="bg-white/10 rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
                    {COMMAND_KEY}
                  </button>
                  <button className="bg-white/10 rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
                    R
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Separator */}
          <div className="mx-2 h-4 w-px bg-white/20" />

          {/* Settings with Tooltip */}
          <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Gear icon */}
            <div className="w-4 h-4 flex items-center justify-center cursor-pointer text-white/70 hover:text-white/90 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>

            {/* Tooltip Content */}
            {isTooltipVisible && (
              <div
                ref={tooltipRef}
                className="absolute top-full left-0 mt-2 w-80 transform -translate-x-[calc(50%-12px)]"
                style={{ zIndex: 100 }}
              >
                {/* Add transparent bridge */}
                <div className="absolute -top-2 right-0 w-full h-2" />
                <div className="p-3 text-xs bg-black/80 backdrop-blur-md rounded-lg border border-white/10 text-white/90 shadow-lg">
                  <div className="space-y-4">
                    <h3 className="font-medium truncate">键盘指引</h3>



                    <LanguageSelector
                        currentLanguage={currentLanguage}
                        setLanguage={setLanguage}
                      />

                      {/* Simplified Language Selector */}
                      {/* <div className="space-y-3">
                        <div 
                          className="cursor-pointer rounded px-2 py-1.5 hover:bg-white/10 transition-colors"
                          onClick={() => extractLanguagesAndUpdate('next')}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                              extractLanguagesAndUpdate('prev');
                            } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                              extractLanguagesAndUpdate('next');
                            }
                          }}
                        >
                          <span className="ttruncate">切换语言</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] text-white/90">{currentLanguage}</span>
                            <div className="text-white/40 text-[8px]">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div> */}


                    <div className="space-y-3">
                      {/* Toggle Command */}
                      <div
                          className="cursor-pointer rounded px-2 py-1.5 hover:bg-white/10 transition-colors"
                          onClick={async () => {
                            try {
                              const result =
                                  await window.electronAPI.toggleMainWindow()
                              if (!result.success) {
                                console.error(
                                    "Failed to toggle window:",
                                    result.error
                                )
                                showToast(
                                    "Error",
                                    "Failed to toggle window",
                                    "error"
                                )
                              }
                            } catch (error) {
                              console.error("Error toggling window:", error)
                              showToast(
                                  "Error",
                                  "Failed to toggle window",
                                  "error"
                              )
                            }
                          }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">切换窗口</span>
                          <div className="flex gap-1 flex-shrink-0">
                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              {COMMAND_KEY}
                            </span>
                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              B
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] leading-relaxed text-white/70 truncate mt-1">
                          显示或隐藏界面
                        </p>
                      </div>

                      {/* Screenshot Command */}
                      {/* <div
                        className="cursor-pointer rounded px-2 py-1.5 hover:bg-white/10 transition-colors"
                        onClick={async () => {
                          try {
                            const result =
                              await window.electronAPI.triggerScreenshot()
                            if (!result.success) {
                              console.error(
                                "Failed to take screenshot:",
                                result.error
                              )
                              showToast(
                                "Error",
                                "Failed to take screenshot",
                                "error"
                              )
                            }
                          } catch (error) {
                            console.error("Error taking screenshot:", error)
                            showToast(
                              "Error",
                              "Failed to take screenshot",
                              "error"
                            )
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">截图</span>
                          <div className="flex gap-1 flex-shrink-0">
                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              {COMMAND_KEY}
                            </span>
                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              H
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] leading-relaxed text-white/70 truncate mt-1">
                          截取问题描述的屏幕截图。
                        </p>
                      </div> */}

                      {/* Solve Command */}
                      {/* <div
                        className={`cursor-pointer rounded px-2 py-1.5 hover:bg-white/10 transition-colors ${
                          screenshotCount > 0
                            ? ""
                            : "opacity-50 cursor-not-allowed"
                        }`}
                        onClick={async () => {
                          if (screenshotCount === 0) return

                          try {
                            const result =
                              await window.electronAPI.triggerProcessScreenshots()
                            if (!result.success) {
                              console.error(
                                "Failed to process screenshots:",
                                result.error
                              )
                              showToast(
                                "Error",
                                "Failed to process screenshots",
                                "error"
                              )
                            }
                          } catch (error) {
                            console.error(
                              "Error processing screenshots:",
                              error
                            )
                            showToast(
                              "Error",
                              "Failed to process screenshots",
                              "error"
                            )
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">解答</span>
                          <div className="flex gap-1 flex-shrink-0">
                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              {COMMAND_KEY}
                            </span>
                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              ↵
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] leading-relaxed text-white/70 truncate mt-1">
                          {screenshotCount > 0
                            ? "根据当前问题生成解决方案。"
                            : "首先截取一个屏幕截图来生成一个解决方案。"}
                        </p>
                      </div> */}

                      {/* Delete Last Screenshot Command */}


                      <div
                          className="cursor-pointer rounded px-2 py-1.5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">调整窗口</span>
                          <div className="flex gap-1 flex-shrink-0">
                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              {COMMAND_KEY}
                            </span>
                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              -+
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] leading-relaxed text-white/70 truncate mt-1">
                          窗口放大缩小
                        </p>
                      </div>


                      <div
                          className="cursor-pointer rounded px-2 py-1.5 hover:bg-white/10 transition-colors"
                          // onClick={async () => {
                          //   try {
                          //     const result =
                          //       // await window.electronAPI.toggleMainWindow()
                          //     if (!result.success) {
                          //       console.error(
                          //         "Failed to toggle window:",
                          //         result.error
                          //       )
                          //       showToast(
                          //         "Error",
                          //         "Failed to toggle window",
                          //         "error"
                          //       )
                          //     }
                          //   } catch (error) {
                          //     console.error("Error toggling window:", error)
                          //     showToast(
                          //       "Error",
                          //       "Failed to toggle window",
                          //       "error"
                          //     )
                          //   }
                          // }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">移动窗口</span>
                          <div className="flex gap-1 flex-shrink-0">
                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              {COMMAND_KEY}
                            </span>
                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              ↑→↓←
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] leading-relaxed text-white/70 truncate mt-1">
                          键盘上下移动窗口
                        </p>
                      </div>


                      <div
                          className={`cursor-pointer rounded px-2 py-1.5 hover:bg-white/10 transition-colors ${
                              screenshotCount > 0
                                  ? ""
                                  : "opacity-50 cursor-not-allowed"
                          }`}
                          onClick={async () => {
                            if (screenshotCount === 0) return

                            try {
                              const result = await window.electronAPI.deleteLastScreenshot()
                              if (!result.success) {
                                console.error(
                                    "Failed to delete last screenshot:",
                                    result.error
                                )
                                showToast(
                                    "Error",
                                    result.error || "Failed to delete screenshot",
                                    "error"
                                )
                              } else {
                                // 删除成功后调用回调函数
                                await onDeleteLastScreenshot?.()
                              }
                            } catch (error) {
                              console.error("Error deleting screenshot:", error)
                              showToast(
                                  "Error",
                                  "Failed to delete screenshot",
                                  "error"
                              )
                            }
                          }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">删除上一张截图</span>
                          <div className="flex gap-1 flex-shrink-0">
                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              {COMMAND_KEY}
                            </span>
                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              L
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] leading-relaxed text-white/70 truncate mt-1">
                          {screenshotCount > 0
                              ? "删除当前屏幕截图"
                              : "没有截图可以删除"}
                        </p>
                      </div>


                      <div
                          className="cursor-pointer rounded px-2 py-1.5 hover:bg-white/10 transition-colors"
                          onClick={async () => {
                            try {
                              const result =
                                  await window.electronAPI.quit()
                              if (!result.success) {
                                console.error(
                                    "Failed to quit app",
                                    result.error
                                )
                                showToast(
                                    "Error",
                                    "Failed to quit app",
                                    "error"
                                )
                              }
                            } catch (error) {
                              console.error("Error quitting app:", error)
                              showToast(
                                  "Error",
                                  "Failed to quit app",
                                  "error"
                              )
                            }
                          }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">退出程序</span>
                          <div className="flex gap-1 flex-shrink-0">
                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              {COMMAND_KEY}
                            </span>
                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              Q
                            </span>
                          </div>
                        </div>
                        {/* <p className="text-[10px] leading-relaxed text-white/70 truncate mt-1">
                          退出程序。
                        </p> */}
                      </div>


                    </div>

                    <div className="pt-3 mt-3 border-t border-white/10">

                      {/* API Key Settings */}
                      {/*<div className="mb-3 px-2 space-y-1">
                        <div className="flex items-center justify-between text-[13px] font-medium text-white/90">
                          <span>OpenAI API 设置</span>
                          <button
                            className="bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-[11px]"
                            onClick={() => window.electronAPI.openSettingsPortal()}
                          >
                            配置
                          </button>
                        </div>
                      </div>*/}

                      {/* personnel information */}
                      <div className="mb-3 px-2 space-y-1">
                        <div className="flex items-center justify-between text-[13px] font-medium text-white/90">
                          <span>登陆用户 {userEmail || '未登录'}</span>
                        </div>
                      </div>

                      {/* Separator and Log Out */}
                      <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 text-[11px] text-red-400 hover:text-red-300 transition-colors w-full"
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-3 h-3"
                          >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                          </svg>
                        </div>
                        退出登陆
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function base64UrlDecode(str: string) {
  // 替换 URL 安全字符
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  // 补齐 padding
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
}

export default QueueCommands
