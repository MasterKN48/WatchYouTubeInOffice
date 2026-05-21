import { useState, useEffect } from 'preact/hooks';
import { Trash2, UserPlus } from 'lucide-react';

export function App() {
  const [enabled, setEnabled] = useState(true);
  const [meetingTitle, setMeetingTitle] = useState('Daily Scrum & Project Alignment Sync');
  const [panicUrl, setPanicUrl] = useState('https://outlook.office.com');
  const [viewMode, setViewMode] = useState('presentation'); // 'presentation', 'gallery', or 'presenting'
  const [myProfileName, setMyProfileName] = useState('N K');
  const [myProfileInitials, setMyProfileInitials] = useState('NK');
  const [colleagueName, setColleagueName] = useState('Boss');
  const [colleagueInitials, setColleagueInitials] = useState('B');
  const [extraParticipants, setExtraParticipants] = useState([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberInitials, setNewMemberInitials] = useState('');
  const [saved, setSaved] = useState(false);

  const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

  // Load settings on mount
  useEffect(() => {
    if (isExtension) {
      chrome.storage.local.get(
        [
          'enabled',
          'meetingTitle',
          'panicUrl',
          'viewMode',
          'myProfileName',
          'myProfileInitials',
          'colleagueName',
          'colleagueInitials',
          'extraParticipants'
        ],
        (result) => {
          if (result.enabled !== undefined) setEnabled(result.enabled);
          if (result.meetingTitle !== undefined) setMeetingTitle(result.meetingTitle);
          if (result.panicUrl !== undefined) setPanicUrl(result.panicUrl);
          if (result.viewMode !== undefined) setViewMode(result.viewMode);
          if (result.myProfileName !== undefined) setMyProfileName(result.myProfileName);
          if (result.myProfileInitials !== undefined) setMyProfileInitials(result.myProfileInitials);
          if (result.colleagueName !== undefined) setColleagueName(result.colleagueName);
          if (result.colleagueInitials !== undefined) setColleagueInitials(result.colleagueInitials);
          if (result.extraParticipants !== undefined) setExtraParticipants(result.extraParticipants);
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
      const cachedMyName = localStorage.getItem('myProfileName');
      if (cachedMyName) setMyProfileName(cachedMyName);
      const cachedMyInitials = localStorage.getItem('myProfileInitials');
      if (cachedMyInitials) setMyProfileInitials(cachedMyInitials);
      const cachedColName = localStorage.getItem('colleagueName');
      if (cachedColName) setColleagueName(cachedColName);
      const cachedColInitials = localStorage.getItem('colleagueInitials');
      if (cachedColInitials) setColleagueInitials(cachedColInitials);
      const cachedExtra = localStorage.getItem('extraParticipants');
      if (cachedExtra) setExtraParticipants(JSON.parse(cachedExtra));
    }
  }, []);

  // Save settings helper
  const saveSettings = (newEnabled, newTitle, newPanic, newMode, myName, myInit, colName, colInit, nextExtraParticipants) => {
    const sMyName = myName !== undefined ? myName : myProfileName;
    const sMyInit = myInit !== undefined ? myInit : myProfileInitials;
    const sColName = colName !== undefined ? colName : colleagueName;
    const sColInit = colInit !== undefined ? colInit : colleagueInitials;
    const sExtra = nextExtraParticipants !== undefined ? nextExtraParticipants : extraParticipants;

    if (isExtension) {
      chrome.storage.local.set({
        enabled: newEnabled,
        meetingTitle: newTitle,
        panicUrl: newPanic,
        viewMode: newMode,
        myProfileName: sMyName,
        myProfileInitials: sMyInit,
        colleagueName: sColName,
        colleagueInitials: sColInit,
        extraParticipants: sExtra
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
                viewMode: newMode,
                myProfileName: sMyName,
                myProfileInitials: sMyInit,
                colleagueName: sColName,
                colleagueInitials: sColInit,
                extraParticipants: sExtra
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
      localStorage.setItem('myProfileName', sMyName);
      localStorage.setItem('myProfileInitials', sMyInit);
      localStorage.setItem('colleagueName', sColName);
      localStorage.setItem('colleagueInitials', sColInit);
      localStorage.setItem('extraParticipants', JSON.stringify(sExtra));
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

  const handleMyNameChange = (e) => {
    const nextVal = e.target.value;
    setMyProfileName(nextVal);
    saveSettings(enabled, meetingTitle, panicUrl, viewMode, nextVal, myProfileInitials, colleagueName, colleagueInitials);
  };

  const handleMyInitialsChange = (e) => {
    const nextVal = e.target.value;
    setMyProfileInitials(nextVal);
    saveSettings(enabled, meetingTitle, panicUrl, viewMode, myProfileName, nextVal, colleagueName, colleagueInitials);
  };

  const handleColleagueNameChange = (e) => {
    const nextVal = e.target.value;
    setColleagueName(nextVal);
    saveSettings(enabled, meetingTitle, panicUrl, viewMode, myProfileName, myProfileInitials, nextVal, colleagueInitials);
  };

  const handleColleagueInitialsChange = (e) => {
    const nextVal = e.target.value;
    setColleagueInitials(nextVal);
    saveSettings(enabled, meetingTitle, panicUrl, viewMode, myProfileName, myProfileInitials, colleagueName, nextVal);
  };

  const handleAddExtraParticipant = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const name = newMemberName.trim();
    let initials = newMemberInitials.trim();
    if (!initials) {
      const parts = name.split(' ');
      if (parts.length > 1) {
        initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      } else {
        initials = name.substring(0, 2).toUpperCase();
      }
    }
    
    // Assign a soft Teams gradient color
    const AVATAR_COLORS = [
      { bg: '#f5d6c6', text: '#5a3d31' }, // Peach
      { bg: '#ebd3e8', text: '#54304d' }, // Lavender/Lilac
      { bg: '#d0e7f5', text: '#234a61' }, // Soft Blue
      { bg: '#d1f2d9', text: '#21522f' }, // Mint Green
      { bg: '#fdf1cb', text: '#615119' }, // Warm Yellow
      { bg: '#e0dbec', text: '#3c355c' }, // Cool Purple
      { bg: '#ffd6d6', text: '#6b2d2d' }, // Rose Pink
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % AVATAR_COLORS.length;
    const color = AVATAR_COLORS[colorIndex];

    const newParticipant = {
      id: Date.now().toString(),
      name,
      initials,
      color
    };

    const nextExtra = [...extraParticipants, newParticipant];
    setExtraParticipants(nextExtra);
    setNewMemberName('');
    setNewMemberInitials('');
    saveSettings(enabled, meetingTitle, panicUrl, viewMode, myProfileName, myProfileInitials, colleagueName, colleagueInitials, nextExtra);
  };

  const handleRemoveExtraParticipant = (id) => {
    const nextExtra = extraParticipants.filter(p => p.id !== id);
    setExtraParticipants(nextExtra);
    saveSettings(enabled, meetingTitle, panicUrl, viewMode, myProfileName, myProfileInitials, colleagueName, colleagueInitials, nextExtra);
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

        {/* Profile Customization */}
        <div className="space-y-3 pt-3 border-t border-[#2d2c33]">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#5b5fc7]">Profile Settings</h2>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-[#adadad]">My Name</label>
              <input
                type="text"
                value={myProfileName}
                onInput={handleMyNameChange}
                placeholder="e.g. N K"
                className="w-full text-xs px-2.5 py-1.5 bg-[#2d2c33] border border-[#484649] rounded-md text-white focus:outline-none focus:border-[#5b5fc7] transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-[#adadad]">My Initials</label>
              <input
                type="text"
                value={myProfileInitials}
                onInput={handleMyInitialsChange}
                placeholder="e.g. NK"
                className="w-full text-xs px-2.5 py-1.5 bg-[#2d2c33] border border-[#484649] rounded-md text-white focus:outline-none focus:border-[#5b5fc7] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-[#adadad]">Colleague Name</label>
              <input
                type="text"
                value={colleagueName}
                onInput={handleColleagueNameChange}
                placeholder="e.g. JK (Guest)"
                className="w-full text-xs px-2.5 py-1.5 bg-[#2d2c33] border border-[#484649] rounded-md text-white focus:outline-none focus:border-[#5b5fc7] transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-[#adadad]">Colleague Initials</label>
              <input
                type="text"
                value={colleagueInitials}
                onInput={handleColleagueInitialsChange}
                placeholder="e.g. J"
                className="w-full text-xs px-2.5 py-1.5 bg-[#2d2c33] border border-[#484649] rounded-md text-white focus:outline-none focus:border-[#5b5fc7] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Additional Participants */}
        <div className="space-y-3 pt-3 border-t border-[#2d2c33]">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#5b5fc7]">Additional Participants</h2>
          
          {/* List of current extra participants */}
          {extraParticipants.length > 0 ? (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {extraParticipants.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-md bg-[#252429] border border-[#2d2c33]/50 text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px]"
                      style={{ backgroundColor: p.color?.bg || '#ebd3e8', color: p.color?.text || '#54304d' }}
                    >
                      {p.initials}
                    </div>
                    <span className="font-medium truncate max-w-[120px]">{p.name}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveExtraParticipant(p.id)}
                    className="p-1 rounded text-[#adadad] hover:text-rose-400 hover:bg-[#2d2c33] transition-all"
                    title="Remove participant"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#adadad] italic">No additional participants added yet.</p>
          )}

          {/* Form to add a participant */}
          <form onSubmit={handleAddExtraParticipant} className="space-y-2 p-2.5 rounded-lg border border-[#2d2c33]/50 bg-[#201f24]">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <label className="block text-[10px] text-[#adadad]">Name</label>
                <input
                  type="text"
                  value={newMemberName}
                  onInput={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full text-xs px-2.5 py-1.5 bg-[#2d2c33] border border-[#484649] rounded-md text-white focus:outline-none focus:border-[#5b5fc7] transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] text-[#adadad]">Initials</label>
                <input
                  type="text"
                  value={newMemberInitials}
                  onInput={(e) => setNewMemberInitials(e.target.value)}
                  placeholder="JD"
                  maxLength={3}
                  className="w-full text-xs px-2.5 py-1.5 bg-[#2d2c33] border border-[#484649] rounded-md text-white focus:outline-none focus:border-[#5b5fc7] transition-colors"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!newMemberName.trim()}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#5b5fc7] hover:bg-[#4f52b2] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md transition-colors shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </form>
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
