import { render } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { 
  UserPlus, 
  Trash2, 
  Smile, 
  Send, 
  ShieldCheck, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  MessageSquare, 
  Users, 
  Hand, 
  LayoutGrid,
  MoreHorizontal, 
  Share2, 
  Phone,
  PhoneOff, 
  ChevronDown, 
  CalendarPlus 
} from 'lucide-react';
import './content.css';

// Immediate check to apply stealth style as early as possible and avoid flicker
const checkStealthInitialState = () => {
  const isExt = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  if (isExt) {
    chrome.storage.local.get(['enabled'], (data) => {
      if (data.enabled !== false) {
        document.documentElement.classList.add('teams-stealth-active');
      }
    });
  } else {
    if (localStorage.getItem('enabled') !== 'false') {
      document.documentElement.classList.add('teams-stealth-active');
    }
  }
};
checkStealthInitialState();

const TEAMS_FAVICON = chrome.runtime && chrome.runtime.getURL ? chrome.runtime.getURL('image.png') : 'https://statics.teams.cdn.office.net/evergreen-assets/apps/teams_v2_16x16.ico';

function MeetingRoom() {
  const [enabled, setEnabled] = useState(true);
  const [meetingTitle, setMeetingTitle] = useState('Daily Scrum & Project Alignment Sync');
  const [panicUrl, setPanicUrl] = useState('https://outlook.office.com');
  const [viewMode, setViewMode] = useState('presentation'); // 'presentation' or 'gallery'
  const [activeSidebar, setActiveSidebar] = useState(null); // 'chat' or 'participants' or null

  const [myProfileName, setMyProfileName] = useState('N K');
  const [myProfileInitials, setMyProfileInitials] = useState('NK');
  const [colleagueName, setColleagueName] = useState('Boss');
  const [colleagueInitials, setColleagueInitials] = useState('B');
  const [extraParticipants, setExtraParticipants] = useState([]);

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [reactions, setReactions] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Boss', initials: 'B', message: "Hi team, glad to join this sync.", time: "10:00 AM", isMe: false },
    { id: 2, sender: 'Boss', initials: 'B', message: "Can you see my screen share properly?", time: "10:01 AM", isMe: false }
  ]);
  const [meetingDuration, setMeetingDuration] = useState(51); // starts at 00:51 mins
  const [speakerStates, setSpeakerStates] = useState({});
  const [chatInputValue, setChatInputValue] = useState('');
  const [newParticipantInput, setNewParticipantInput] = useState('');

  const placeholderRef = useRef(null);
  const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  const [isWatchPage, setIsWatchPage] = useState(window.location.pathname.startsWith('/watch'));
  const isStealthActive = enabled && isWatchPage;

  const AVATAR_COLORS = [
    { bg: '#f5d6c6', text: '#5a3d31' }, // Peach
    { bg: '#ebd3e8', text: '#54304d' }, // Lavender/Lilac
    { bg: '#d0e7f5', text: '#234a61' }, // Soft Blue
    { bg: '#d1f2d9', text: '#21522f' }, // Mint Green
    { bg: '#fdf1cb', text: '#615119' }, // Warm Yellow
    { bg: '#e0dbec', text: '#3c355c' }, // Cool Purple
    { bg: '#ffd6d6', text: '#6b2d2d' }, // Rose Pink
  ];

  const getAvatarColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  };

  const handleAddParticipant = (name) => {
    if (!name.trim()) return;
    const parts = name.trim().split(' ');
    let initials = '';
    if (parts.length > 1) {
      initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else {
      initials = parts[0].substring(0, 2).toUpperCase();
    }
    const color = getAvatarColor(name);
    const newParticipant = {
      id: Date.now().toString(),
      name: name.trim(),
      initials,
      color
    };
    const updated = [...extraParticipants, newParticipant];
    setExtraParticipants(updated);
    
    if (isExtension) {
      chrome.storage.local.set({ extraParticipants: updated });
    } else {
      localStorage.setItem('extraParticipants', JSON.stringify(updated));
    }
  };

  const handleRemoveParticipant = (id) => {
    const updated = extraParticipants.filter(p => p.id !== id);
    setExtraParticipants(updated);
    if (isExtension) {
      chrome.storage.local.set({ extraParticipants: updated });
    } else {
      localStorage.setItem('extraParticipants', JSON.stringify(updated));
    }
  };

  // SPA navigation listener & URL polling
  useEffect(() => {
    const handleUrlChange = () => {
      const watch = window.location.pathname.startsWith('/watch');
      if (watch !== isWatchPage) {
        setIsWatchPage(watch);
      }
    };

    window.addEventListener('yt-navigate-finish', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    const interval = setInterval(handleUrlChange, 500);

    return () => {
      window.removeEventListener('yt-navigate-finish', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
      clearInterval(interval);
    };
  }, [isWatchPage]);

  // Synchronize CSS class and restore style on disable/leave
  useEffect(() => {
    if (isStealthActive) {
      document.documentElement.classList.add('teams-stealth-active');
    } else {
      document.documentElement.classList.remove('teams-stealth-active');
      const ytPlayer = document.getElementById('player-container') || 
                       document.getElementById('ytd-player') || 
                       document.getElementById('movie_player');
      if (ytPlayer) {
        ytPlayer.removeAttribute('style');
        ytPlayer.classList.remove('teams-stealth-positioned-player');
      }
    }
  }, [isStealthActive]);

  // Load configuration and listen to changes
  useEffect(() => {
    const loadSettings = (data) => {
      if (data.enabled !== undefined) {
        setEnabled(data.enabled);
      }
      if (data.meetingTitle !== undefined) {
        setMeetingTitle(data.meetingTitle);
      }
      if (data.panicUrl !== undefined) setPanicUrl(data.panicUrl);
      if (data.viewMode !== undefined) setViewMode(data.viewMode);
      if (data.myProfileName !== undefined) setMyProfileName(data.myProfileName);
      if (data.myProfileInitials !== undefined) setMyProfileInitials(data.myProfileInitials);
      if (data.colleagueName !== undefined) setColleagueName(data.colleagueName);
      if (data.colleagueInitials !== undefined) setColleagueInitials(data.colleagueInitials);
      if (data.extraParticipants !== undefined) {
        setExtraParticipants(data.extraParticipants);
      }
    };

    if (isExtension) {
      chrome.storage.local.get([
        'enabled', 
        'meetingTitle', 
        'panicUrl', 
        'viewMode', 
        'myProfileName', 
        'myProfileInitials', 
        'colleagueName', 
        'colleagueInitials',
        'extraParticipants'
      ], loadSettings);

      const listener = (message) => {
        if (message.action === 'updateSettings') {
          loadSettings(message.settings);
        }
      };
      chrome.runtime.onMessage.addListener(listener);
      return () => chrome.runtime.onMessage.removeListener(listener);
    } else {
      const cached = {
        enabled: localStorage.getItem('enabled') !== 'false',
        meetingTitle: localStorage.getItem('meetingTitle') || 'Daily Scrum & Project Alignment Sync',
        panicUrl: localStorage.getItem('panicUrl') || 'https://outlook.office.com',
        viewMode: localStorage.getItem('viewMode') || 'presentation',
        myProfileName: localStorage.getItem('myProfileName') || 'N K',
        myProfileInitials: localStorage.getItem('myProfileInitials') || 'NK',
        colleagueName: localStorage.getItem('colleagueName') || 'Boss',
        colleagueInitials: localStorage.getItem('colleagueInitials') || 'B',
        extraParticipants: JSON.parse(localStorage.getItem('extraParticipants') || '[]')
      };
      loadSettings(cached);
    }
  }, []);

  // Update meeting duration timer
  useEffect(() => {
    if (!isStealthActive) return;
    const interval = setInterval(() => {
      setMeetingDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isStealthActive]);

  // Mask page title and favicon periodically
  useEffect(() => {
    if (!isStealthActive) return;

    const maskTab = () => {
      if (document.title !== meetingTitle) {
        document.title = meetingTitle;
      }
      const icons = document.querySelectorAll('link[rel*="icon"]');
      if (icons.length === 0) {
        const icon = document.createElement('link');
        icon.rel = 'icon';
        icon.href = TEAMS_FAVICON;
        document.head.appendChild(icon);
      } else {
        icons.forEach(icon => {
          if (icon.href !== TEAMS_FAVICON) {
            icon.href = TEAMS_FAVICON;
          }
        });
      }
    };

    maskTab();
    const interval = setInterval(maskTab, 500);
    return () => clearInterval(interval);
  }, [isStealthActive, meetingTitle]);

  // Handle Video Element Overlay Anchoring
  useEffect(() => {
    if (!isStealthActive) return;

    const updatePlayerPosition = () => {
      if (!placeholderRef.current) return;
      const rect = placeholderRef.current.getBoundingClientRect();

      const activePlayer = document.getElementById('movie_player') || 
                           document.getElementById('ytd-player') || 
                           document.getElementById('player-container');
      if (!activePlayer) return;

      if (!activePlayer.classList.contains('teams-stealth-positioned-player')) {
        activePlayer.classList.add('teams-stealth-positioned-player');
      }

      activePlayer.style.setProperty('top', `${rect.top}px`, 'important');
      activePlayer.style.setProperty('left', `${rect.left}px`, 'important');
      activePlayer.style.setProperty('width', `${rect.width}px`, 'important');
      activePlayer.style.setProperty('height', `${rect.height}px`, 'important');
    };

    const resizeObserver = new ResizeObserver(() => {
      updatePlayerPosition();
    });

    if (placeholderRef.current) {
      resizeObserver.observe(placeholderRef.current);
    }

    window.addEventListener('resize', updatePlayerPosition);
    let rafId = requestAnimationFrame(function tick() {
      updatePlayerPosition();
      rafId = requestAnimationFrame(tick);
    });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updatePlayerPosition);
      cancelAnimationFrame(rafId);

      const activePlayer = document.getElementById('player-container') || 
                           document.getElementById('ytd-player') || 
                           document.getElementById('movie_player');
      if (activePlayer) {
        activePlayer.removeAttribute('style');
        activePlayer.classList.remove('teams-stealth-positioned-player');
      }
    };
  }, [isStealthActive, viewMode, activeSidebar]);

  // Handle video play/pause and mute via click pass-through or Teams buttons
  useEffect(() => {
    if (!isStealthActive) return;

    let currentVideo = null;

    const handlePlayPause = () => {
      if (currentVideo) {
        setIsCameraOn(!currentVideo.paused);
      }
    };
    const handleVolumeChange = () => {
      if (currentVideo) {
        setIsMuted(currentVideo.muted || currentVideo.volume === 0);
      }
    };

    const bindVideo = (videoEl) => {
      if (!videoEl || currentVideo === videoEl) return;
      
      if (currentVideo) {
        currentVideo.removeEventListener('play', handlePlayPause);
        currentVideo.removeEventListener('pause', handlePlayPause);
        currentVideo.removeEventListener('volumechange', handleVolumeChange);
      }

      currentVideo = videoEl;
      setIsCameraOn(!videoEl.paused);
      setIsMuted(videoEl.muted || videoEl.volume === 0);

      videoEl.addEventListener('play', handlePlayPause);
      videoEl.addEventListener('pause', handlePlayPause);
      videoEl.addEventListener('volumechange', handleVolumeChange);
    };

    const interval = setInterval(() => {
      const video = document.querySelector('video');
      if (video) {
        bindVideo(video);
      } else {
        if (currentVideo) {
          currentVideo = null;
          setIsCameraOn(false);
        }
      }
    }, 500);

    return () => {
      clearInterval(interval);
      if (currentVideo) {
        currentVideo.removeEventListener('play', handlePlayPause);
        currentVideo.removeEventListener('pause', handlePlayPause);
        currentVideo.removeEventListener('volumechange', handleVolumeChange);
      }
    };
  }, [isStealthActive]);

  // Random Colleague Chat & Speaking simulation
  useEffect(() => {
    if (!isStealthActive) return;

    const interval = setInterval(() => {
      setSpeakerStates({ [colleagueName]: true });

      setTimeout(() => {
        setSpeakerStates({});
      }, 4000);

      if (Math.random() < 0.55) {
        const phrases = [
          "Let's make sure we align on this design.",
          "I think we should double check the budget for this project.",
          "Can we schedule a follow-up session next Tuesday?",
          "I agree with this approach, let's push forward.",
          "Do we have a target release date for these changes?",
          "From a technical perspective, this is very scalable.",
          "We need to run some load tests before deploying.",
          "I'll create the tickets for this work stream.",
          "Great progress, team! Keep up the momentum."
        ];
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setChatMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            sender: colleagueName,
            initials: colleagueInitials,
            message: phrase,
            time: timeStr,
            isMe: false
          }
        ].slice(-30));
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [isStealthActive, colleagueName, colleagueInitials]);

  // Scrape YouTube comments to inject as meeting chat
  useEffect(() => {
    if (!isStealthActive) return;

    const scrapeComments = () => {
      const commentNodes = document.querySelectorAll('ytd-comment-thread-renderer');
      if (commentNodes.length === 0) return;

      const scraped = [];
      const len = Math.min(commentNodes.length, 10);
      for (let i = 0; i < len; i++) {
        const node = commentNodes[i];
        const content = node.querySelector('#content-text')?.textContent?.trim() || '';
        if (content) {
          scraped.push(content);
        }
      }

      if (scraped.length > 0) {
        const randomCommentContent = scraped[Math.floor(Math.random() * scraped.length)];
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setChatMessages(prev => {
          if (prev.some(m => m.message === randomCommentContent)) return prev;

          return [
            ...prev,
            {
              id: Date.now(),
              sender: colleagueName,
              initials: colleagueInitials,
              message: randomCommentContent,
              time: timeStr,
              isMe: false
            }
          ].slice(-30);
        });
      }
    };

    const interval = setInterval(scrapeComments, 20000);
    return () => clearInterval(interval);
  }, [isStealthActive, colleagueName, colleagueInitials]);

  const toggleMute = () => {
    const video = document.querySelector('video');
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  const togglePlay = () => {
    const video = document.querySelector('video');
    if (video) {
      if (video.paused) {
        video.play();
        setIsCameraOn(true);
      } else {
        video.pause();
        setIsCameraOn(false);
      }
    }
  };

  const handlePanicLeave = () => {
    if (panicUrl === 'close') {
      window.close();
    } else {
      window.location.href = panicUrl;
    }
  };

  const addReaction = (emoji) => {
    const id = Date.now() + Math.random();
    const drift = (Math.random() * 200 - 100) + 'px';
    const leftOffset = (50 + Math.random() * 30 - 15) + '%';

    setReactions(prev => [...prev, { id, emoji, style: { '--drift': drift, left: leftOffset } }]);

    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 3000);
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInputValue.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: myProfileName,
        initials: myProfileInitials,
        message: chatInputValue,
        time: timeStr,
        isMe: true
      }
    ]);

    setChatInputValue('');
  };

  const formatDuration = (sec) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isStealthActive) return null;

  return (
    <div className="teams-wrapper h-full w-full bg-transparent flex flex-col text-sm leading-normal">
      {/* Reaction Container (Floats above layout) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5000]">
        {reactions.map(r => (
          <span key={r.id} className="reaction-emoji" style={r.style}>
            {r.emoji}
          </span>
        ))}
      </div>

      {/* CALL TOOLBAR (Now at the very top, full width) */}
      <div className="teams-interactive w-full h-20 bg-[#202023] border-b border-[#2d2c33]/70 flex items-center justify-between px-6 select-none shrink-0 z-[5500]">
        {/* Left: Shield icon + Time */}
        <div className="flex items-center gap-3.5">
          <div className="text-emerald-500 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="text-[16px] font-bold text-[#adadad] font-mono tracking-wider">
            {formatDuration(meetingDuration)}
          </div>
        </div>

        {/* Right: Action buttons with text underneath */}
        <div className="flex items-center gap-2">
          {/* Chat Button with active indicator underline */}
          <button
            onClick={() => setActiveSidebar(activeSidebar === 'chat' ? null : 'chat')}
            className={`flex flex-col items-center justify-center w-20 h-16 text-[#adadad] hover:text-white transition-colors relative ${activeSidebar === 'chat' ? 'text-white after:absolute after:bottom-0 after:left-1 after:right-1 after:h-[4px] after:bg-[#7f85f5]' : ''}`}
          >
            <MessageSquare className="w-7 h-7" />
            <span className="text-sm font-semibold mt-1">Chat</span>
          </button>

          {/* People Button with active indicator underline */}
          <button
            onClick={() => setActiveSidebar(activeSidebar === 'participants' ? null : 'participants')}
            className={`flex flex-col items-center justify-center w-20 h-16 text-[#adadad] hover:text-white transition-colors relative ${activeSidebar === 'participants' ? 'text-white after:absolute after:bottom-0 after:left-1 after:right-1 after:h-[4px] after:bg-[#7f85f5]' : ''}`}
          >
            <div className="relative flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <span className="text-sm font-semibold mt-1">People</span>
          </button>

          <button
            onClick={() => setIsHandRaised(!isHandRaised)}
            className={`flex flex-col items-center justify-center w-20 h-16 rounded-lg text-[#adadad] hover:text-white hover:bg-[#1f1f22] transition-colors ${isHandRaised ? 'bg-[#5b5fc7]/20 text-white' : ''}`}
          >
            <Hand className="w-7 h-7" />
            <span className="text-sm font-semibold mt-1">{isHandRaised ? 'Raised' : 'Raise'}</span>
          </button>

          <div className="relative group/react flex flex-col items-center justify-center">
            <button className="flex flex-col items-center justify-center w-20 h-16 rounded-lg text-[#adadad] hover:text-white hover:bg-[#1f1f22] transition-colors">
              <Smile className="w-7 h-7" />
              <span className="text-sm font-semibold mt-1">React</span>
            </button>
            <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-[#201f24] border border-[#2d2c33] p-2.5 rounded-lg shadow-xl hidden group-hover/react:flex gap-2 z-[10000] w-max">
              {['👍', '❤️', '👏', '😂', '😮'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => addReaction(emoji)}
                  className="p-1.5 hover:bg-[#3d3b42] rounded text-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setViewMode(viewMode === 'presentation' ? 'gallery' : 'presentation')}
            className={`flex flex-col items-center justify-center w-20 h-16 rounded-lg text-[#adadad] hover:text-white hover:bg-[#1f1f22] transition-colors`}
          >
            <LayoutGrid className="w-7 h-7" />
            <span className="text-sm font-semibold mt-1">View</span>
          </button>

          <button className="flex flex-col items-center justify-center w-20 h-16 rounded-lg text-[#adadad] hover:text-white hover:bg-[#1f1f22] transition-colors">
            <MoreHorizontal className="w-7 h-7" />
            <span className="text-sm font-semibold mt-1">More</span>
          </button>

          <div className="w-[1.5px] h-8 bg-[#2d2c33] mx-2" />

          {/* Camera (Play/Pause video) */}
          <div className="flex items-center">
            <button
              onClick={togglePlay}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-l-lg hover:text-white hover:bg-[#1f1f22] transition-colors ${isCameraOn ? 'bg-[#5b5fc7]/20 text-[#5b5fc7]' : 'text-rose-400'}`}
            >
              {isCameraOn ? <Video className="w-7 h-7" /> : <VideoOff className="w-7 h-7" />}
              <span className="text-sm font-semibold mt-1">Camera</span>
            </button>
            <button className="flex items-center justify-center w-6 h-16 rounded-r-lg hover:text-white hover:bg-[#1f1f22] text-[#adadad] transition-colors border-l border-[#2d2c33]/50">
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Mic (Mute/Unmute) */}
          <div className="flex items-center">
            <button
              onClick={toggleMute}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-l-lg hover:text-white hover:bg-[#1f1f22] transition-colors ${!isMuted ? 'bg-[#5b5fc7]/20 text-[#5b5fc7]' : 'text-rose-400'}`}
            >
              {!isMuted ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
              <span className="text-sm font-semibold mt-1">Mic</span>
            </button>
            <button className="flex items-center justify-center w-6 h-16 rounded-r-lg hover:text-white hover:bg-[#1f1f22] text-[#adadad] transition-colors border-l border-[#2d2c33]/50">
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          <button className="flex flex-col items-center justify-center w-20 h-16 rounded-lg text-[#adadad] hover:text-white hover:bg-[#1f1f22] transition-colors">
            <Share2 className="w-7 h-7" />
            <span className="text-sm font-semibold mt-1">Share</span>
          </button>

          {/* Leave Button */}
          <div className="flex items-center ml-3.5 teams-interactive">
            <button
              onClick={handlePanicLeave}
              className="flex items-center gap-2.5 h-11 px-6 rounded-md bg-[#a82528] hover:bg-[#8b1e21] transition-colors text-white font-bold text-[16px] shadow"
            >
              <Phone className="w-5 h-5 fill-current rotate-[135deg]" />
              <span>Leave</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN MEETING ROOM BODY */}
      <div className="flex-1 flex flex-row min-h-0 overflow-hidden bg-transparent">
        {/* CALL WORKSPACE BODY */}
        <div className="flex-1 flex min-h-0 relative">
          {/* CALL STAGE */}
          <div className="flex-1 flex flex-col p-4 relative min-w-0 bg-transparent">
            <div className={`flex-1 ${isCameraOn ? 'bg-transparent' : 'bg-[#1b1a1f]'} rounded-xl flex items-center justify-center relative overflow-hidden shadow-inner border border-[#2f2f35]`}>
              {viewMode === 'presentation' ? (
                <>
                  {/* Transparent Anchor Target for YouTube Video positioning */}
                  <div
                    ref={placeholderRef}
                    id="teams-video-placeholder"
                    className={`w-full h-full bg-transparent transition-opacity duration-300 ${isCameraOn ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  />

                  {/* Avatar shown when camera is off - SWAPPED to User NK */}
                  {!isCameraOn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#1b1a1f] select-none">
                      <div 
                        className="w-36 h-36 rounded-full flex items-center justify-center text-5xl font-bold shadow-2xl transition-all duration-300 transform scale-100 hover:scale-105"
                        style={{ backgroundColor: '#f5d6c6', color: '#5a3d31' }}
                      >
                        {myProfileInitials}
                      </div>
                    </div>
                  )}

                  {/* Overlay UI (Name tag & Avatars) hidden when video is playing to avoid blocking controls */}
                  {!isCameraOn && (
                    <>
                      {/* User name tag (bottom left) - pointer-events-none to click-through */}
                  <div className="absolute bottom-4 left-4 bg-[#111014]/75 backdrop-blur-md px-3.5 py-1.75 rounded-lg text-sm font-semibold text-white flex items-center gap-2 select-none border border-[#ffffff]/10 z-10 pointer-events-none">
                    <span className="truncate max-w-[180px]">{myProfileName}</span>
                    <MicOff className="w-4 h-4 text-[#adadad]" />
                  </div>

                  {/* Dynamic Participant Cards strip (bottom right) - pointer-events-none to pass through clicks to YT player */}
                  <div className="absolute bottom-4 right-4 flex gap-3 items-center z-20 pointer-events-none select-none max-w-[calc(100%-220px)] overflow-x-auto scrollbar-none">
                    {/* Boss Card */}
                    <div className={`participant-card participant-card-presentation ${speakerStates[colleagueName] ? 'speaking' : ''}`}>
                      <div className="flex flex-col items-center justify-center w-full h-full relative bg-[#1b1a1f] select-none">
                        <div 
                          className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shadow-md"
                          style={{ backgroundColor: '#ebd3e8', color: '#54304d' }}
                        >
                          {colleagueInitials}
                        </div>
                        <div className="absolute bottom-2 left-2 bg-[#111014]/80 px-2 py-0.5 rounded text-xs text-white flex items-center gap-1">
                          <span className="truncate max-w-[100px]">{colleagueName}</span>
                          {speakerStates[colleagueName] ? (
                            <div className="flex items-end h-2 gap-0.5 px-0.5">
                              <span className="w-1 h-2 bg-[#4caf50] animate-pulse" />
                              <span className="w-1 h-3 bg-[#4caf50] animate-pulse" style={{ animationDelay: '0.2s' }} />
                              <span className="w-1 h-1.5 bg-[#4caf50] animate-pulse" style={{ animationDelay: '0.4s' }} />
                            </div>
                          ) : (
                            <MicOff className="w-4 h-4 text-[#adadad]" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Extra Participants Cards */}
                    {extraParticipants.map(p => (
                      <div key={p.id} className={`participant-card participant-card-presentation ${speakerStates[p.name] ? 'speaking' : ''}`}>
                        <div className="flex flex-col items-center justify-center w-full h-full relative bg-[#1b1a1f] select-none">
                          <div 
                            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shadow-md"
                            style={{ backgroundColor: p.color?.bg || '#ebd3e8', color: p.color?.text || '#54304d' }}
                          >
                            {p.initials}
                          </div>
                          <div className="absolute bottom-2 left-2 bg-[#111014]/80 px-2 py-0.5 rounded text-xs text-white flex items-center gap-1">
                            <span className="truncate max-w-[100px]">{p.name}</span>
                            {speakerStates[p.name] ? (
                              <div className="flex items-end h-2 gap-0.5 px-0.5">
                                <span className="w-1 h-2 bg-[#4caf50] animate-pulse" />
                                <span className="w-1 h-3 bg-[#4caf50] animate-pulse" style={{ animationDelay: '0.2s' }} />
                                <span className="w-1 h-1.5 bg-[#4caf50] animate-pulse" style={{ animationDelay: '0.4s' }} />
                              </div>
                            ) : (
                              <MicOff className="w-4 h-4 text-[#adadad]" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Me (NK) self-preview Card at the end */}
                    <div className="participant-card participant-card-presentation">
                      <div className="flex flex-col items-center justify-center w-full h-full relative bg-[#1b1a1f] select-none">
                        <div 
                          className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shadow-md"
                          style={{ backgroundColor: '#f5d6c6', color: '#5a3d31' }}
                        >
                          {myProfileInitials}
                        </div>
                        <div className="absolute bottom-2 left-2 bg-[#111014]/80 px-2 py-0.5 rounded text-xs text-white flex items-center gap-1">
                          <span className="truncate max-w-[100px]">{myProfileName} (Me)</span>
                          <MicOff className="w-4 h-4 text-[#adadad]" />
                        </div>
                      </div>
                    </div>
                  </div>
                    </>
                  )}
                </>
              ) : (
                /* Gallery Grid View with dynamic avatar sizing */
                (() => {
                  const totalCount = 2 + extraParticipants.length;
                  const avatarSizeClass = totalCount <= 2 ? 'w-36 h-36 text-6xl' : totalCount <= 4 ? 'w-24 h-24 text-4xl' : 'w-20 h-20 text-3xl';
                  return (
                    <div className={`w-full h-full p-4 grid gap-3 pointer-events-none select-none ${
                      totalCount <= 2 ? 'grid-cols-2 grid-rows-1' :
                      totalCount <= 4 ? 'grid-cols-2 grid-rows-2' :
                      'grid-cols-3'
                    }`}>
                      {/* Boss Card (housing the video stream/presentation if camera is on) */}
                      <div className={`${isCameraOn ? 'bg-transparent' : 'bg-[#1b1a1f]'} rounded-xl overflow-hidden border relative flex items-center justify-center shadow-lg transition-all duration-300 ${
                        speakerStates[colleagueName] ? 'border-[#7f85f5] ring-2 ring-[#7f85f5]' : 'border-[#484649]/60'
                      }`}>
                        <div
                          ref={placeholderRef}
                          id="teams-video-placeholder"
                          className={`absolute inset-0 bg-transparent transition-opacity duration-300 ${isCameraOn ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        />
                        {!isCameraOn && (
                          <div 
                            className={`rounded-full flex items-center justify-center font-bold shadow-md transition-all duration-300 ${avatarSizeClass}`}
                            style={{ backgroundColor: '#ebd3e8', color: '#54304d' }}
                          >
                            {colleagueInitials}
                          </div>
                        )}
                        <div className="absolute bottom-3 left-3 bg-[#111014]/85 px-2.5 py-1 rounded text-sm text-white flex items-center gap-1.5 z-10">
                          <span className="truncate max-w-[120px]">{colleagueName}</span>
                          {speakerStates[colleagueName] ? (
                            <div className="flex items-end h-2.5 gap-0.5">
                              <span className="w-1 h-2.5 bg-[#4caf50] animate-pulse" />
                              <span className="w-1 h-3.5 bg-[#4caf50] animate-pulse" style={{ animationDelay: '0.2s' }} />
                              <span className="w-1 h-2 bg-[#4caf50] animate-pulse" style={{ animationDelay: '0.4s' }} />
                            </div>
                          ) : (
                            <MicOff className="w-4 h-4 text-[#adadad]" />
                          )}
                        </div>
                      </div>

                      {/* Me Card (NK) */}
                      <div className="bg-[#1b1a1f] rounded-xl overflow-hidden border border-[#484649]/60 relative flex items-center justify-center shadow-lg">
                        <div 
                          className={`rounded-full flex items-center justify-center font-bold shadow-md transition-all duration-300 ${avatarSizeClass}`}
                          style={{ backgroundColor: '#f5d6c6', color: '#5a3d31' }}
                        >
                          {myProfileInitials}
                        </div>
                        <div className="absolute bottom-3 left-3 bg-[#111014]/85 px-2.5 py-1 rounded text-sm text-white flex items-center gap-1.5 z-10">
                          <span className="truncate max-w-[120px]">{myProfileName} (Me)</span>
                          <MicOff className="w-4 h-4 text-[#adadad]" />
                        </div>
                      </div>

                      {/* Extra Participants Cards */}
                      {extraParticipants.map(p => (
                        <div key={p.id} className={`bg-[#1b1a1f] rounded-xl overflow-hidden border relative flex items-center justify-center shadow-lg transition-all duration-300 ${
                          speakerStates[p.name] ? 'border-[#7f85f5] ring-2 ring-[#7f85f5]' : 'border-[#484649]/60'
                        }`}>
                          <div 
                            className={`rounded-full flex items-center justify-center font-bold shadow-md transition-all duration-300 ${avatarSizeClass}`}
                            style={{ backgroundColor: p.color?.bg || '#ebd3e8', color: p.color?.text || '#54304d' }}
                          >
                            {p.initials}
                          </div>
                          <div className="absolute bottom-3 left-3 bg-[#111014]/85 px-2.5 py-1 rounded text-sm text-white flex items-center gap-1.5 z-10">
                            <span className="truncate max-w-[120px]">{p.name}</span>
                            {speakerStates[p.name] ? (
                              <div className="flex items-end h-2.5 gap-0.5">
                                <span className="w-1 h-2.5 bg-[#4caf50] animate-pulse" />
                                <span className="w-1 h-3.5 bg-[#4caf50] animate-pulse" style={{ animationDelay: '0.2s' }} />
                                <span className="w-1 h-2 bg-[#4caf50] animate-pulse" style={{ animationDelay: '0.4s' }} />
                              </div>
                            ) : (
                              <MicOff className="w-4 h-4 text-[#adadad]" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
            </div>
          </div>

          {/* SIDEBAR PANELS */}
          {activeSidebar === 'participants' && (
            <aside className="teams-interactive w-[320px] bg-[#201f24] border-l border-[#2d2c33] flex flex-col select-none z-[6000] shrink-0">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#2d2c33]">
                <h2 className="text-lg font-semibold text-[#f3f4f6]">Participants</h2>
                <button
                  onClick={() => setActiveSidebar(null)}
                  className="text-[#adadad] hover:text-white p-1.5 rounded text-lg hover:bg-[#3d3b42] transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Share invite */}
                <button className="w-full py-3 px-4 rounded-md border border-[#484649] text-[#f3f4f6] hover:bg-[#2d2c33] transition-colors text-base font-semibold flex items-center justify-center gap-2">
                  <Share2 className="w-5 h-5 text-[#adadad]" />
                  <span>Share invite</span>
                </button>

                {/* Add participant input form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddParticipant(newParticipantInput);
                    setNewParticipantInput('');
                  }}
                  className="relative flex items-center my-3"
                >
                  <input
                    type="text"
                    value={newParticipantInput}
                    onInput={(e) => setNewParticipantInput(e.target.value)}
                    placeholder="Invite someone or start typing..."
                    className="w-full pl-3 pr-8 py-2.5 text-base bg-[#1f1f22] border border-[#484649] focus:border-[#7f85f5] rounded-md text-[#f3f4f6] placeholder-[#adadad] outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 text-[#adadad] hover:text-white transition-colors"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                </form>

                {/* Participant list */}
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between text-sm font-bold text-[#adadad] uppercase tracking-wider">
                    <span>In this meeting ({2 + extraParticipants.length})</span>
                    <ChevronDown className="w-4 h-4" />
                  </div>

                  {/* Colleague (Boss) - Listed First */}
                  <div className="flex items-center justify-between py-1.5 hover:bg-[#2d2c33]/40 px-1 rounded-md transition-colors">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-sm"
                        style={{ backgroundColor: '#ebd3e8', color: '#54304d' }}
                      >
                        {colleagueInitials}
                      </div>
                      <div className="leading-tight">
                        <div className="text-base font-semibold text-white">{colleagueName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {speakerStates[colleagueName] ? (
                        <div className="flex items-end h-3 gap-0.5">
                          <span className="voice-bar voice-bar-1"></span>
                          <span className="voice-bar voice-bar-2"></span>
                          <span className="voice-bar voice-bar-3"></span>
                        </div>
                      ) : (
                        <MicOff className="w-4 h-4 text-[#adadad]" />
                      )}
                    </div>
                  </div>

                  {/* Extra Participants */}
                  {extraParticipants.map(p => (
                    <div key={p.id} className="flex items-center justify-between py-1.5 hover:bg-[#2d2c33]/40 px-1 rounded-md transition-colors group/member">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-sm"
                          style={{ backgroundColor: p.color?.bg || '#ebd3e8', color: p.color?.text || '#54304d' }}
                        >
                          {p.initials}
                        </div>
                        <div className="leading-tight">
                          <div className="text-base font-semibold text-white">{p.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRemoveParticipant(p.id)}
                          className="text-[#adadad] hover:text-rose-400 p-1 rounded hover:bg-[#3d3b42] opacity-80 md:opacity-0 md:group-hover/member:opacity-100 transition-opacity"
                          title="Remove participant"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <MicOff className="w-5 h-5 text-[#adadad]" />
                      </div>
                    </div>
                  ))}

                  {/* Me (N K) - Listed Last as Organiser */}
                  <div className="flex items-center justify-between py-1.5 hover:bg-[#2d2c33]/40 px-1 rounded-md transition-colors">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: '#f5d6c6', color: '#5a3d31' }}
                      >
                        {myProfileInitials}
                      </div>
                      <div className="leading-tight">
                        <div className="text-sm font-semibold text-white">{myProfileName}</div>
                        <div className="text-xs text-[#adadad]">Organiser</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MicOff className="w-3.5 h-3.5 text-[#adadad]" />
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}

          {activeSidebar === 'chat' && (
            <aside className="teams-interactive w-[320px] bg-[#201f24] border-l border-[#2d2c33] flex flex-col select-none z-[6000] shrink-0">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#2d2c33]">
                <h2 className="text-lg font-semibold text-[#f3f4f6]">Meeting chat</h2>
                <button
                  onClick={() => setActiveSidebar(null)}
                  className="text-[#adadad] hover:text-white p-1.5 rounded text-lg hover:bg-[#3d3b42] transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Message logs */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* System invitation message */}
                <div className="flex items-start gap-2 text-base text-[#adadad] select-none py-1 border-b border-[#2d2c33]/30 pb-3">
                  <CalendarPlus className="w-5 h-5 shrink-0 text-[#adadad] mt-0.5" />
                  <span>{colleagueName} (Guest) was invited to the meeting.</span>
                </div>

                {chatMessages.map(msg => (
                  <div key={msg.id} className="flex gap-2.5">
                    <div
                      className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold shadow-sm"
                      style={{
                        backgroundColor: msg.isMe ? '#f5d6c6' : '#ebd3e8',
                        color: msg.isMe ? '#5a3d31' : '#54304d'
                      }}
                    >
                      {msg.isMe ? myProfileInitials : colleagueInitials}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-[#f3f4f6] truncate">
                          {msg.isMe ? myProfileName : colleagueName}
                        </span>
                        <span className="text-xs text-[#adadad]">{msg.time}</span>
                      </div>
                      <div className="mt-1 p-2 rounded-lg text-[15px] leading-normal break-words bg-[#2d2c33] text-[#e3e4e6] border border-[#3d3b42]/70">
                        {msg.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Input box nested in border with icons in bottom-right */}
              <form onSubmit={handleSendChatMessage} className="p-3 border-t border-[#2d2c33]">
                <div className="relative border border-[#2d2c33] focus-within:border-[#5b5fc7] rounded bg-[#252429] flex flex-col p-2.5">
                  <textarea
                    value={chatInputValue}
                    onInput={(e) => setChatInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChatMessage(e);
                      }
                    }}
                    placeholder="Type a message"
                    rows={2}
                    className="bg-transparent text-[15px] text-white placeholder-[#adadad] resize-none outline-none w-full pr-12 pb-2"
                  />
                  <div className="flex items-center justify-end gap-1.5 self-end mt-1">
                    <button
                      type="button"
                      onClick={() => setChatInputValue(prev => prev + '😊')}
                      className="p-1.5 hover:bg-[#3d3b42] rounded text-[#adadad] hover:text-white transition-colors"
                      title="Add emoji"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={!chatInputValue.trim()}
                      className={`p-1.5 rounded transition-colors ${chatInputValue.trim() ? 'text-[#7f85f5] hover:bg-[#3d3b42]' : 'text-[#484649] cursor-not-allowed'}`}
                      title="Send message"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </form>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

// Extension entry logic
const initStealthExtension = () => {
  if (document.getElementById('teams-stealth-root')) return;

  const host = document.createElement('div');
  host.id = 'teams-stealth-root';
  document.body.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: 'open' });

  const styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  const isDev = typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.getURL;
  styleLink.href = isDev ? '/src/content.css' : chrome.runtime.getURL('content.css');
  shadowRoot.appendChild(styleLink);

  render(<MeetingRoom />, shadowRoot);
};

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initStealthExtension();
} else {
  document.addEventListener('DOMContentLoaded', initStealthExtension);
}
