import React from "react"

interface LanguageSelectorProps {
  currentLanguage: string
  setLanguage: (language: string) => void
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  setLanguage
}) => {
  const handleLanguageChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newLanguage = e.target.value
    
    try {
      // Save language preference to electron store
      await window.electronAPI.updateConfig({ language: newLanguage })
      
      // Update global language variable
      window.__LANGUAGE__ = newLanguage
      
      // Update state in React
      setLanguage(newLanguage)
      
      console.log(`Language changed to ${newLanguage}`);
    } catch (error) {
      console.error("Error updating language:", error)
    }
  }

  return (
    <div className="mb-3 px-2 space-y-1">
      <div className="flex items-center justify-between cursor-pointer hover:bg-white/10 rounded px-2 py-1 transition-colors">
        <span>语言</span>
        <select
          value={currentLanguage}
          onChange={handleLanguageChange}
          className="flex items-center justify-between cursor-pointer hover:bg-white/10 rounded px-2 py-1 transition-colors"
          style={{ WebkitAppearance: 'menulist' }}
        >
          <option value="python" className="bg-black text-white">Python</option>
          <option value="javascript" className="bg-black text-white">JavaScript</option>
          <option value="java" className="bg-black text-white">Java</option>
          <option value="golang" className="bg-black text-white">Go</option>
          <option value="cpp" className="bg-black text-white">C++</option>
          <option value="swift" className="bg-black text-white">Swift</option>
          <option value="kotlin" className="bg-black text-white">Kotlin</option>
          <option value="ruby" className="bg-black text-white">Ruby</option>
          <option value="sql" className="bg-black text-white">SQL</option>
          <option value="r" className="bg-black text-white">R</option>
        </select>
      </div>
    </div>
  )
}
