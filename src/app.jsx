import { useState, useEffect } from 'preact/hooks';

export function App() {
  const [enabled, setEnabled] = useState(true);
  const [meetingTitle, setMeetingTitle] = useState('Daily Scrum & Project Alignment Sync');
  const [panicUrl, setPanicUrl] = useState('https://outlook.office.com');
  const [viewMode, setViewMode] = useState('presentation'); // 'presentation' or 'gallery'
  const [saved, setSaved] = useState(false);

  const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

  // Load settings on mount
  useEffect(() => {
    if (isExtension) {
      chrome.storage.local.get(
        ['enabled', 'meetingTitle', 'panicUrl', 'viewMode'],
        (result) => {
          if (result.enabled !== undefined) setEnabled(result.enabled);
          if (result.meetingTitle !== undefined) setMeetingTitle(result.meetingTitle);
          if (result.panicUrl !== undefined) setPanicUrl(result.panicUrl);
          if (result.viewMode !== undefined) setViewMode(result.viewMode);
        }
      );
    } else {
      // LocalStorage fallback for web dev
      const cachedEnabled = localStorage.getItem('enabled');
      if (cachedEnabled !== null) setEnabled(cachedEnabled === 'true');
      const cachedTitle = localStorage.getItem('meetingTitle');
      if (cachedTitle) setMeetingTitle(cachedTitle);
      const cachedPanic = localStorage.getItem('panicUrl');
      if (cachedPanic) setPanicUrl(cachedPanic);
      const cachedMode = localStorage.getItem('viewMode');
      if (cachedMode) setViewMode(cachedMode);
    }
  }, []);

  // Save settings helper
  const saveSettings = (newEnabled, newTitle, newPanic, newMode) => {
    if (isExtension) {
      chrome.storage.local.set({
        enabled: newEnabled,
        meetingTitle: newTitle,
        panicUrl: newPanic,
        viewMode: newMode
      }, () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);

        // Send message to active tab content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'updateSettings',
              settings: {
                enabled: newEnabled,
                meetingTitle: newTitle,
                panicUrl: newPanic,
                viewMode: newMode
              }
            }).catch(() => {
              // Ignore errors if script isn't loaded on non-youtube pages
            });
          }
        });
      });
    } else {
      localStorage.setItem('enabled', String(newEnabled));
      localStorage.setItem('meetingTitle', newTitle);
      localStorage.setItem('panicUrl', newPanic);
      localStorage.setItem('viewMode', newMode);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  const handleToggle = () => {
    const nextVal = !enabled;
    setEnabled(nextVal);
    saveSettings(nextVal, meetingTitle, panicUrl, viewMode);
  };

  const handleTitleChange = (e) => {
    const nextVal = e.target.value;
    setMeetingTitle(nextVal);
    saveSettings(enabled, nextVal, panicUrl, viewMode);
  };

  const handlePanicChange = (e) => {
    const nextVal = e.target.value;
    setPanicUrl(nextVal);
    saveSettings(enabled, meetingTitle, nextVal, viewMode);
  };

  const handleModeChange = (mode) => {
    setViewMode(mode);
    saveSettings(enabled, meetingTitle, panicUrl, mode);
  };

  const setPresetPanic = (url) => {
    setPanicUrl(url);
    saveSettings(enabled, meetingTitle, url, viewMode);
  };

  return (
    <div className="flex flex-col h-full bg-[#1b1a1f] text-[#f3f4f6]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#2d2c33] bg-[#201f24]">
        <div className="flex items-center gap-2">
          {/* MS Teams Logo Representation */}
          <div className="w-8 h-8 rounded-lg bg-[#5b5fc7] flex items-center justify-center font-bold text-white shadow-md">
            T
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide">Teams Stealth Disguise</h1>
            <p className="text-[10px] text-[#adadad]">Watch YouTube in Office Safely</p>
          </div>
        </div>
        <div>
          <button
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              enabled ? 'bg-[#5b5fc7]' : 'bg-[#484649]'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </header>

      {/* Main Settings Body */}
      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Disguise Active Indicator */}
        <div className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-colors ${
          enabled 
            ? 'bg-[#1e3a27] border-[#2e7d32]/30 text-[#81c784]' 
            : 'bg-[#332222] border-[#e57373]/20 text-[#e57373]'
        }`}>
          <span>Status: <strong>{enabled ? 'Teams Disguise Enabled' : 'Disabled (Standard YouTube)'}</strong></span>
          <span className={`w-2.5 h-2.5 rounded-full ${enabled ? 'bg-[#4caf50] animate-pulse' : 'bg-[#e57373]'}`} />
        </div>

        {/* Meeting Title Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#adadad]">Meeting Disguise Name</label>
          <input
            type="text"
            value={meetingTitle}
            onInput={handleTitleChange}
            placeholder="e.g., Weekly Sync"
            className="w-full text-xs px-3 py-2 bg-[#2d2c33] border border-[#484649] rounded-md text-white focus:outline-none focus:border-[#5b5fc7] transition-colors"
          />
        </div>

        {/* Default View Mode */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#adadad]">Default Display Mode</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleModeChange('presentation')}
              className={`py-2 px-3 rounded-md border text-center transition-all ${
                viewMode === 'presentation'
                  ? 'bg-[#5b5fc7] border-[#5b5fc7] text-white font-semibold'
                  : 'bg-[#2d2c33] border-[#484649] text-[#adadad] hover:text-white'
              }`}
            >
              📊 Screen Share
            </button>
            <button
              onClick={() => handleModeChange('gallery')}
              className={`py-2 px-3 rounded-md border text-center transition-all ${
                viewMode === 'gallery'
                  ? 'bg-[#5b5fc7] border-[#5b5fc7] text-white font-semibold'
                  : 'bg-[#2d2c33] border-[#484649] text-[#adadad] hover:text-white'
              }`}
            >
              👥 3x3 Grid
            </button>
          </div>
        </div>

        {/* Panic Redirect Configuration */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-medium text-[#adadad]">Panic URL (Red "Leave" Button)</label>
          </div>
          <input
            type="text"
            value={panicUrl}
            onInput={handlePanicChange}
            placeholder="Redirect URL"
            className="w-full text-xs px-3 py-2 bg-[#2d2c33] border border-[#484649] rounded-md text-white focus:outline-none focus:border-[#5b5fc7] transition-colors"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              onClick={() => setPresetPanic('https://outlook.office.com')}
              className="text-[10px] bg-[#252429] hover:bg-[#2d2c33] border border-[#484649] text-[#adadad] px-2 py-1 rounded"
            >
              📧 Outlook Web
            </button>
            <button
              onClick={() => setPresetPanic('https://www.office.com')}
              className="text-[10px] bg-[#252429] hover:bg-[#2d2c33] border border-[#484649] text-[#adadad] px-2 py-1 rounded"
            >
              🏢 MS Office
            </button>
            <button
              onClick={() => setPresetPanic('https://docs.google.com')}
              className="text-[10px] bg-[#252429] hover:bg-[#2d2c33] border border-[#484649] text-[#adadad] px-2 py-1 rounded"
            >
              📝 Google Docs
            </button>
            <button
              onClick={() => setPresetPanic('https://www.google.com')}
              className="text-[10px] bg-[#252429] hover:bg-[#2d2c33] border border-[#484649] text-[#adadad] px-2 py-1 rounded"
            >
              🔍 Google Search
            </button>
          </div>
        </div>
      </main>

      {/* Footer / Status Indicator */}
      <footer className="px-4 py-2 bg-[#201f24] border-t border-[#2d2c33] text-center flex items-center justify-between text-[10px] text-[#adadad]">
        <span>Version 1.0.0</span>
        {saved ? (
          <span className="text-[#81c784] font-semibold animate-pulse">✓ Saved & Synced</span>
        ) : (
          <span>Auto-saves changes</span>
        )}
      </footer>
    </div>
  );
}
