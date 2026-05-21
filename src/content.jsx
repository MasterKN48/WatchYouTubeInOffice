import { render } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import './content.css';


// Coworker database with initials, names, and gradient backgrounds
const COWORKERS = [
  { name: 'Sarah Connor', role: 'Product Manager', initials: 'SC', bg: 'linear-gradient(135deg, #ff7675, #e84393)' },
  { name: 'David Miller', role: 'Tech Lead', initials: 'DM', bg: 'linear-gradient(135deg, #74b9ff, #0984e3)' },
  { name: 'Emily Davis', role: 'QA Analyst', initials: 'ED', bg: 'linear-gradient(135deg, #55efc4, #00b894)' },
  { name: 'James Smith', role: 'Director of Eng.', initials: 'JS', bg: 'linear-gradient(135deg, #a29bfe, #6c5ce7)' },
  { name: 'Linda Johnson', role: 'HR Manager', initials: 'LJ', bg: 'linear-gradient(135deg, #ffeaa7, #fdcb6e)' },
  { name: 'Robert Chen', role: 'Frontend Dev', initials: 'RC', bg: 'linear-gradient(135deg, #81ecec, #00cec9)' },
  { name: 'Patricia Garcia', role: 'UX Designer', initials: 'PG', bg: 'linear-gradient(135deg, #fab1a0, #e17055)' },
  { name: 'Thomas Wright', role: 'DevOps Architect', initials: 'TW', bg: 'linear-gradient(135deg, #d2dae2, #485460)' },
];

const CORPORATE_PHRASES = {
  'Sarah Connor': [
    "I think we should double check the budget for this project.",
    "Can we schedule a follow-up session next Tuesday?",
    "I agree with this approach, let's push forward.",
    "Do we have a target release date for these changes?"
  ],
  'David Miller': [
    "From a technical perspective, this architecture is very scalable.",
    "We need to run some load tests before deploying.",
    "I'll create the JIRA tickets for this work stream.",
    "We might want to double check the caching layer."
  ],
  'Emily Davis': [
    "I've completed testing on the staging environment. Looks solid.",
    "There is a minor alignment bug on mobile Safari we should fix.",
    "Are we planning to write unit tests for this?",
    "I'll sign off on this release once the hotfix is verified."
  ],
  'James Smith': [
    "Let's make sure we align this with our Q3 OKRs.",
    "I'll discuss this with the leadership team tomorrow.",
    "Great progress, team! Keep up the momentum.",
    "We need to monitor our burn rate for this sprint."
  ],
  'Linda Johnson': [
    "Please remember to submit your timesheets by Friday EOD.",
    "Welcome to the team, everyone!",
    "We have an upcoming team building event next month.",
    "Reach out if you need any support with HR tools."
  ],
  'Robert Chen': [
    "I've pushed the frontend code to the main branch.",
    "I will start working on the responsive layout today.",
    "We should use CSS Grid for this grid layout.",
    "I will optimize the bundle sizes this afternoon."
  ],
  'Patricia Garcia': [
    "The user flow looks very intuitive in these tests.",
    "I'll upload the Figma mockups by EOD.",
    "Can we get user feedback on this design prototype?",
    "I updated the design system components last night."
  ],
  'Thomas Wright': [
    "The CI/CD pipeline is now fully automated.",
    "I'm deploying the latest release to production.",
    "I'll investigate the database latency issues.",
    "We need to scale our database instances for Q4."
  ]
};

const TEAMS_FAVICON = 'https://statics.teams.cdn.office.net/evergreen-assets/apps/teams_v2_16x16.ico';

function MeetingRoom() {
  const [enabled, setEnabled] = useState(true);
  const [meetingTitle, setMeetingTitle] = useState('Daily Scrum & Project Alignment Sync');
  const [panicUrl, setPanicUrl] = useState('https://outlook.office.com');
  const [viewMode, setViewMode] = useState('presentation'); // 'presentation' or 'gallery'
  const [activeSidebar, setActiveSidebar] = useState(null); // 'chat' or 'participants' or null

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [reactions, setReactions] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'David Miller', initials: 'DM', message: "Hi team, starting shortly.", time: "10:00 AM", isMe: false },
    { id: 2, sender: 'Sarah Connor', initials: 'SC', message: "Perfect, I have the slides ready.", time: "10:01 AM", isMe: false }
  ]);
  const [meetingDuration, setMeetingDuration] = useState(1320); // starts at 22:00 mins
  const [speakerStates, setSpeakerStates] = useState({});
  const [customTitleInput, setCustomTitleInput] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [chatInputValue, setChatInputValue] = useState('');

  const placeholderRef = useRef(null);
  const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

  // Load configuration and listen to changes
  useEffect(() => {
    const loadSettings = (data) => {
      if (data.enabled !== undefined) {
        setEnabled(data.enabled);
        if (data.enabled) {
          document.documentElement.classList.add('teams-stealth-active');
        } else {
          document.documentElement.classList.remove('teams-stealth-active');
          // Reset fixed styling of YT player
          const ytPlayer = document.getElementById('movie_player');
          if (ytPlayer) {
            ytPlayer.removeAttribute('style');
          }
        }
      }
      if (data.meetingTitle !== undefined) {
        setMeetingTitle(data.meetingTitle);
        setCustomTitleInput(data.meetingTitle);
      }
      if (data.panicUrl !== undefined) setPanicUrl(data.panicUrl);
      if (data.viewMode !== undefined) setViewMode(data.viewMode);
    };

    if (isExtension) {
      chrome.storage.local.get(['enabled', 'meetingTitle', 'panicUrl', 'viewMode'], loadSettings);

      const listener = (message) => {
        if (message.action === 'updateSettings') {
          loadSettings(message.settings);
        }
      };
      chrome.runtime.onMessage.addListener(listener);
      return () => chrome.runtime.onMessage.removeListener(listener);
    } else {
      // Local testing
      const cached = {
        enabled: localStorage.getItem('enabled') !== 'false',
        meetingTitle: localStorage.getItem('meetingTitle') || 'Daily Scrum & Project Alignment Sync',
        panicUrl: localStorage.getItem('panicUrl') || 'https://outlook.office.com',
        viewMode: localStorage.getItem('viewMode') || 'presentation'
      };
      loadSettings(cached);
    }
  }, []);

  // Update meeting duration timer
  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      setMeetingDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [enabled]);

  // Mask page title and favicon periodically
  useEffect(() => {
    if (!enabled) return;

    const maskTab = () => {
      // Title
      if (document.title !== meetingTitle) {
        document.title = meetingTitle;
      }
      // Favicon
      let icon = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
      if (!icon) {
        icon = document.createElement('link');
        icon.rel = 'icon';
        document.head.appendChild(icon);
      }
      if (icon.href !== TEAMS_FAVICON) {
        icon.href = TEAMS_FAVICON;
      }
    };

    maskTab();
    const interval = setInterval(maskTab, 500);
    return () => clearInterval(interval);
  }, [enabled, meetingTitle]);

  // Handle Video Element Overlay Anchoring
  useEffect(() => {
    if (!enabled) return;

    const ytPlayer = document.getElementById('movie_player');
    if (!ytPlayer) return;

    const updatePlayerPosition = () => {
      if (!placeholderRef.current) return;
      const rect = placeholderRef.current.getBoundingClientRect();

      ytPlayer.style.setProperty('top', `${rect.top}px`, 'important');
      ytPlayer.style.setProperty('left', `${rect.left}px`, 'important');
      ytPlayer.style.setProperty('width', `${rect.width}px`, 'important');
      ytPlayer.style.setProperty('height', `${rect.height}px`, 'important');
    };

    // Watch resizing of the placeholder
    const resizeObserver = new ResizeObserver(() => {
      updatePlayerPosition();
    });

    if (placeholderRef.current) {
      resizeObserver.observe(placeholderRef.current);
    }

    // Trigger update on resize and animation frames to ensure alignment
    window.addEventListener('resize', updatePlayerPosition);
    let rafId = requestAnimationFrame(function tick() {
      updatePlayerPosition();
      rafId = requestAnimationFrame(tick);
    });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updatePlayerPosition);
      cancelAnimationFrame(rafId);
    };
  }, [enabled, viewMode, activeSidebar]);

  // Handle video play/pause and mute via click pass-through or Teams buttons
  useEffect(() => {
    const video = document.querySelector('video');
    if (!video) return;

    // Synchronize initial state
    setIsMuted(video.muted);

    const handlePlayPause = () => {
      setIsCameraOn(!video.paused);
    };
    const handleVolumeChange = () => {
      setIsMuted(video.muted || video.volume === 0);
    };

    video.addEventListener('play', handlePlayPause);
    video.addEventListener('pause', handlePlayPause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('play', handlePlayPause);
      video.removeEventListener('pause', handlePlayPause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [enabled]);

  // Random Coworker Chat & Speaking simulation
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      // Pick random coworker to speak
      const speakerIndex = Math.floor(Math.random() * COWORKERS.length);
      const speaker = COWORKERS[speakerIndex];

      // Update speaker state
      setSpeakerStates({ [speaker.name]: true });

      // Clean up speaking outline after 4 seconds
      setTimeout(() => {
        setSpeakerStates({});
      }, 4000);

      // 55% chance coworker writes in chat
      if (Math.random() < 0.55) {
        const phrases = CORPORATE_PHRASES[speaker.name];
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setChatMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            sender: speaker.name,
            initials: speaker.initials,
            message: phrase,
            time: timeStr,
            isMe: false
          }
        ].slice(-30)); // Keep last 30 messages
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [enabled]);

  // Scrape YouTube comments to inject as meeting chat
  useEffect(() => {
    if (!enabled) return;

    const scrapeComments = () => {
      const commentNodes = document.querySelectorAll('ytd-comment-thread-renderer');
      if (commentNodes.length === 0) return;

      // Extract up to 5 comments randomly or chronologically
      const scraped = [];
      const len = Math.min(commentNodes.length, 10);
      for (let i = 0; i < len; i++) {
        const node = commentNodes[i];
        const author = node.querySelector('#author-text')?.textContent?.trim() || 'Anonymous Colleague';
        const content = node.querySelector('#content-text')?.textContent?.trim() || '';
        if (content) {
          // Map random commenter names to clean names (like John H., Sarah W. or keep professional)
          const cleanAuthor = author.replace(/[^a-zA-Z ]/g, '').substring(0, 16) || 'Colleague';
          const initials = cleanAuthor.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'C';
          
          scraped.push({
            author: cleanAuthor,
            initials,
            content
          });
        }
      }

      if (scraped.length > 0) {
        // Inject a scraped comment into our chat logs
        const randomComment = scraped[Math.floor(Math.random() * scraped.length)];
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setChatMessages(prev => {
          // Avoid duplicate messages
          if (prev.some(m => m.message === randomComment.content)) return prev;

          return [
            ...prev,
            {
              id: Date.now(),
              sender: randomComment.author,
              initials: randomComment.initials,
              message: randomComment.content,
              time: timeStr,
              isMe: false
            }
          ].slice(-30);
        });
      }
    };

    // Scrape every 20 seconds if comments are loaded in the background
    const interval = setInterval(scrapeComments, 20000);
    return () => clearInterval(interval);
  }, [enabled]);

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
    const drift = (Math.random() * 200 - 100) + 'px'; // Random side movement
    const leftOffset = (50 + Math.random() * 30 - 15) + '%'; // Random bottom start position

    setReactions(prev => [...prev, { id, emoji, style: { '--drift': drift, left: leftOffset } }]);

    // Clean up reaction
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
        sender: 'You (Nitin Kumar)',
        initials: 'NK',
        message: chatInputValue,
        time: timeStr,
        isMe: true
      }
    ]);

    setChatInputValue('');
  };

  const handleRenameTitleSubmit = (e) => {
    e.preventDefault();
    if (customTitleInput.trim()) {
      setMeetingTitle(customTitleInput);
      setIsEditingTitle(false);
      if (isExtension) {
        chrome.storage.local.set({ meetingTitle: customTitleInput });
      }
    }
  };

  const formatDuration = (sec) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!enabled) return null;

  return (
    <div className="teams-wrapper h-full w-full bg-[#1b1a1f] flex flex-col text-sm leading-normal">
      {/* Reaction Container (Floats above layout) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5000]">
        {reactions.map(r => (
          <span key={r.id} className="reaction-emoji" style={r.style}>
            {r.emoji}
          </span>
        ))}
      </div>

      {/* TOP HEADER */}
      <header className="teams-interactive flex items-center justify-between px-4 py-2 bg-[#201f24] border-b border-[#2d2c33] select-none h-12">
        <div className="flex items-center gap-3">
          {/* Time Counter */}
          <div className="text-[13px] font-medium text-[#adadad] font-mono tracking-wider">
            {formatDuration(meetingDuration)}
          </div>
          <div className="w-[1px] h-4 bg-[#484649]" />
          {/* Meeting Title */}
          {isEditingTitle ? (
            <form onSubmit={handleRenameTitleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={customTitleInput}
                onInput={(e) => setCustomTitleInput(e.target.value)}
                className="bg-[#2d2c33] text-white px-2 py-0.5 text-xs rounded border border-[#5b5fc7] focus:outline-none"
                autoFocus
                onBlur={() => setIsEditingTitle(false)}
              />
            </form>
          ) : (
            <div
              className="text-xs font-semibold text-[#f3f4f6] cursor-pointer hover:underline flex items-center gap-1.5"
              onClick={() => setIsEditingTitle(true)}
              title="Click to rename meeting"
            >
              <span>{meetingTitle}</span>
              <svg className="w-3.5 h-3.5 fill-[#adadad]" viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
              </svg>
            </div>
          )}
        </div>

        {/* TOP CONTROLS (ICONS & MICROPHONE ETC) */}
        <div className="flex items-center gap-1 bg-[#29282e] p-1 rounded-lg">
          {/* People list toggle */}
          <button
            onClick={() => setActiveSidebar(activeSidebar === 'participants' ? null : 'participants')}
            className={`p-1.5 rounded hover:bg-[#3d3b42] transition-colors ${activeSidebar === 'participants' ? 'bg-[#3d3b42]' : ''}`}
            title="People"
          >
            <svg className="w-5 h-5 fill-[#f3f4f6]" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 1.34 5 8s1.34 3 8 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          </button>

          {/* Chat toggle */}
          <button
            onClick={() => setActiveSidebar(activeSidebar === 'chat' ? null : 'chat')}
            className={`p-1.5 rounded hover:bg-[#3d3b42] transition-colors ${activeSidebar === 'chat' ? 'bg-[#3d3b42]' : ''}`}
            title="Chat"
          >
            <svg className="w-5 h-5 fill-[#f3f4f6]" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
            </svg>
          </button>

          {/* Raise Hand toggle */}
          <button
            onClick={() => setIsHandRaised(!isHandRaised)}
            className={`p-1.5 rounded hover:bg-[#3d3b42] transition-colors ${isHandRaised ? 'bg-[#5b5fc7]/25 hover:bg-[#5b5fc7]/40' : ''}`}
            title="Raise Hand"
          >
            <svg className={`w-5 h-5 ${isHandRaised ? 'fill-[#c084fc]' : 'fill-[#f3f4f6]'}`} viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </button>

          {/* React Dropdown */}
          <div className="relative group/react">
            <button className="p-1.5 rounded hover:bg-[#3d3b42] transition-colors" title="React">
              <span className="text-base leading-none">😊</span>
            </button>
            {/* Reaction Floating Panel */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-[#201f24] border border-[#2d2c33] p-1.5 rounded-lg shadow-xl hidden group-hover/react:flex gap-1.5 z-[10000] w-max">
              {['👍', '❤️', '👏', '😂', '😮'].map(emoji => (
                <button
                  onClick={() => addReaction(emoji)}
                  className="p-1 hover:bg-[#3d3b42] rounded text-base transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="w-[1.5px] h-5 bg-[#484649] mx-1" />

          {/* Toggle View Mode */}
          <button
            onClick={() => setViewMode(viewMode === 'presentation' ? 'gallery' : 'presentation')}
            className="p-1.5 rounded hover:bg-[#3d3b42] transition-colors"
            title={viewMode === 'presentation' ? 'Switch to Gallery Mode' : 'Switch to Presentation Mode'}
          >
            {viewMode === 'presentation' ? (
              <svg className="w-5 h-5 fill-[#f3f4f6]" viewBox="0 0 24 24">
                {/* Gallery Grid Icon */}
                <path d="M4 11h5V5H4v6zm0 8h5v-6H4v6zm7 0h5v-6h-5v6zm0-14v6h5V5h-5zM4 19h16v-2H4v2zm0-4h16v-2H4v2zm0-4h16V9H4v2zm0-6v2h16V5H4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 fill-[#f3f4f6]" viewBox="0 0 24 24">
                {/* Presentation Layout Icon */}
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7V7h10v6z" />
              </svg>
            )}
          </button>

          <div className="w-[1.5px] h-5 bg-[#484649] mx-1" />

          {/* Camera Button (Fake) */}
          <button
            onClick={togglePlay}
            className={`p-1.5 rounded hover:bg-[#3d3b42] transition-colors ${isCameraOn ? 'bg-[#5b5fc7]/25' : ''}`}
            title="Camera (Play/Pause)"
          >
            {isCameraOn ? (
              <svg className="w-5 h-5 fill-[#5b5fc7]" viewBox="0 0 24 24">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 fill-[#e57373]" viewBox="0 0 24 24">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z M19.78 4.7l-1.42-1.42L3.3 18.35l1.42 1.42L19.78 4.7z" />
              </svg>
            )}
          </button>

          {/* Mic Button */}
          <button
            onClick={toggleMute}
            className={`p-1.5 rounded hover:bg-[#3d3b42] transition-colors ${!isMuted ? 'bg-[#5b5fc7]/25' : ''}`}
            title="Microphone (Mute/Unmute)"
          >
            {!isMuted ? (
              <svg className="w-5 h-5 fill-[#5b5fc7]" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.42 2.72 6.2 6 6.72V21h2v-3.28c3.28-.52 6-3.3 6-6.72h-1.7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 fill-[#e57373]" viewBox="0 0 24 24">
                <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.34 3 3 3 .74 0 1.41-.26 1.95-.7l3.77 3.77c-.88.62-1.89.93-3.02.93-3 0-5.3-2.1-5.3-5.1H6.7c0 3.42 2.72 6.2 6 6.72V21h2v-3.28c1.33-.2 2.53-.74 3.55-1.52L19.73 21 21 19.73 4.27 3z" />
              </svg>
            )}
          </button>

          {/* Red LEAVE Panic Button */}
          <button
            onClick={handlePanicLeave}
            className="ml-2 px-3 py-1.5 rounded-md bg-[#e81123] hover:bg-[#b80f1d] active:bg-[#910a14] font-semibold text-xs flex items-center gap-1 shadow transition-colors text-white"
            title="Leave Meeting (Panic Button!)"
          >
            <span className="text-[10px] leading-none">📞</span>
            Leave
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* VIDEO DISPLAY AND USER GRID AREA */}
        <div className="flex-1 flex flex-col p-4 bg-[#1f1f1f] gap-4 relative overflow-hidden">
          
          {viewMode === 'presentation' ? (
            /* ---------------- PRESENTATION MODE ---------------- */
            <div className="flex-1 flex flex-col min-h-0 gap-4">
              {/* Presentation Main Window (Transparent overlay for YouTube player) */}
              <div className="flex-1 bg-[#151419] rounded-lg border border-[#2d2c33] flex flex-col relative overflow-hidden">
                {/* Presenter Name Banner */}
                <div className="teams-interactive absolute top-3 left-3 bg-[#111014]/80 px-2 py-1 rounded text-xs text-[#adadad] font-medium z-10 select-none">
                  📌 External Presenter is sharing screen
                </div>
                
                {/* Transparent Anchor Target for YouTube Video positioning */}
                <div
                  ref={placeholderRef}
                  id="teams-video-placeholder"
                  className="w-full h-full bg-transparent border-0 opacity-100 flex items-center justify-center"
                >
                  {/* Invisible placeholder content. Light DOM video overlays this area */}
                </div>
              </div>

              {/* Bottom Participant Grid Strip */}
              <div className="teams-interactive h-28 flex justify-center gap-2 items-center overflow-x-auto select-none py-1">
                {/* Card 1: You */}
                <div className="h-full w-40 rounded-lg bg-[#29282e] border border-[#3d3b42] flex flex-col items-center justify-center p-2 relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6264a7] to-[#4f46e5] flex items-center justify-center text-sm font-semibold text-white shadow">
                    NK
                  </div>
                  <span className="text-[11px] font-medium mt-1 text-[#f3f4f6]">You (Nitin Kumar)</span>
                  {isHandRaised && (
                    <span className="absolute top-1.5 right-1.5 text-xs text-purple-400">✋</span>
                  )}
                </div>

                {/* Other Coworker Cards */}
                {COWORKERS.slice(0, 4).map((cw) => {
                  const isSpeaking = speakerStates[cw.name];
                  return (
                    <div
                      key={cw.name}
                      className={`h-full w-40 rounded-lg bg-[#29282e] flex flex-col items-center justify-center p-2 relative shrink-0 transition-all ${
                        isSpeaking ? 'ring-2 ring-[#5b5fc7] shadow-[0_0_12px_rgba(91,95,199,0.3)]' : 'border border-[#3d3b42]'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow"
                        style={{ background: cw.bg }}
                      >
                        {cw.initials}
                      </div>
                      <span className="text-[11px] font-medium mt-1 text-[#f3f4f6]">{cw.name}</span>
                      
                      {/* Speaker indicator inside card */}
                      {isSpeaking && (
                        <div className="absolute top-1.5 right-1.5 flex items-end h-3">
                          <span className="voice-bar voice-bar-1"></span>
                          <span className="voice-bar voice-bar-2"></span>
                          <span className="voice-bar voice-bar-3"></span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ---------------- GALLERY MODE (3x3 GRID) ---------------- */
            <div className="flex-1 grid grid-cols-3 grid-rows-3 gap-3">
              
              {/* Row 1, Col 1: YouTube Video slot */}
              <div className="rounded-lg bg-[#151419] border border-[#2d2c33] relative flex flex-col items-center justify-center overflow-hidden">
                <div className="teams-interactive absolute top-2 left-2 bg-[#111014]/80 px-2 py-0.5 rounded text-[10px] text-[#adadad] font-medium z-10">
                  🎥 Main Stream
                </div>
                
                {/* Transparency Overlay Anchor for Video */}
                <div
                  ref={placeholderRef}
                  id="teams-video-placeholder"
                  className="w-full h-full bg-transparent border-0 opacity-100"
                >
                  {/* Invisible placeholder for grid mode */}
                </div>
              </div>

              {/* Row 1, Col 2: Card: You */}
              <div className="rounded-lg bg-[#29282e] border border-[#3d3b42] relative flex flex-col items-center justify-center p-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#6264a7] to-[#4f46e5] flex items-center justify-center text-xl font-bold text-white shadow-lg">
                  NK
                </div>
                <div className="absolute bottom-2 left-3 text-xs font-semibold text-[#f3f4f6]">
                  You (Nitin Kumar)
                </div>
                {isHandRaised && (
                  <span className="absolute top-2 right-2 text-sm text-purple-400">✋</span>
                )}
              </div>

              {/* Coworker Cards (7 Cards remaining to make it 9 slots) */}
              {COWORKERS.slice(0, 7).map((cw) => {
                const isSpeaking = speakerStates[cw.name];
                return (
                  <div
                    key={cw.name}
                    className={`rounded-lg bg-[#29282e] flex flex-col items-center justify-center p-3 relative transition-all ${
                      isSpeaking ? 'ring-2 ring-[#5b5fc7] shadow-[0_0_12px_rgba(91,95,199,0.3)]' : 'border border-[#3d3b42]'
                    }`}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg"
                      style={{ background: cw.bg }}
                    >
                      {cw.initials}
                    </div>
                    <div className="absolute bottom-2 left-3 text-xs font-semibold text-[#f3f4f6]">
                      {cw.name}
                    </div>

                    {isSpeaking && (
                      <div className="absolute top-2 right-2 flex items-end h-3.5">
                        <span className="voice-bar voice-bar-1"></span>
                        <span className="voice-bar voice-bar-2"></span>
                        <span className="voice-bar voice-bar-3"></span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SIDEBAR PANELS */}
        {activeSidebar && (
          <aside className="teams-interactive w-[320px] bg-[#201f24] border-l border-[#2d2c33] flex flex-col select-none z-[6000] shrink-0">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-3 border-b border-[#2d2c33]">
              <h2 className="text-sm font-semibold text-[#f3f4f6]">
                {activeSidebar === 'chat' ? 'Meeting chat' : 'People'}
              </h2>
              <button
                onClick={() => setActiveSidebar(null)}
                className="text-[#adadad] hover:text-white p-1 rounded hover:bg-[#3d3b42]"
              >
                ✕
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto">
              {activeSidebar === 'chat' ? (
                /* ---------------- CHAT LOG ---------------- */
                <div className="p-3 space-y-4">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className="flex gap-2">
                      {/* Avatar initials badge */}
                      <div
                        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm mt-0.5"
                        style={{
                          background: msg.isMe 
                            ? 'linear-gradient(135deg, #6264a7, #4f46e5)' 
                            : (COWORKERS.find(c => c.name === msg.sender)?.bg || 'linear-gradient(135deg, #888, #444)')
                        }}
                      >
                        {msg.initials}
                      </div>
                      
                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[11px] font-semibold text-[#f3f4f6] truncate">{msg.sender}</span>
                          <span className="text-[9px] text-[#adadad]">{msg.time}</span>
                        </div>
                        <div className={`mt-1 p-2 rounded-lg text-xs leading-normal break-words ${
                          msg.isMe 
                            ? 'bg-[#3b3a3f] text-[#f3f4f6] border border-[#4d4c52]' 
                            : 'bg-[#29282e] text-[#e3e4e6] border border-[#37353b]'
                        }`}>
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* ---------------- PARTICIPANTS LIST ---------------- */
                <div className="p-3 space-y-3">
                  <div className="text-[10px] font-bold text-[#adadad] tracking-wider uppercase mb-1">
                    In this meeting ({1 + COWORKERS.length})
                  </div>

                  {/* Organizer: Nitin Kumar */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#6264a7] to-[#4f46e5] flex items-center justify-center text-xs font-semibold text-white">
                        NK
                      </div>
                      <div className="leading-tight">
                        <div className="text-xs font-semibold text-white">You (Nitin Kumar)</div>
                        <div className="text-[10px] text-[#adadad]">Organizer</div>
                      </div>
                    </div>
                    {isHandRaised && <span className="text-xs">✋</span>}
                  </div>

                  {/* Other Attendees */}
                  {COWORKERS.map(cw => {
                    const isSpeaking = speakerStates[cw.name];
                    return (
                      <div key={cw.name} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                            style={{ background: cw.bg }}
                          >
                            {cw.initials}
                          </div>
                          <div className="leading-tight">
                            <div className="text-xs font-medium text-white">{cw.name}</div>
                            <div className="text-[10px] text-[#adadad]">{cw.role}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isSpeaking && (
                            <div className="flex items-end h-3">
                              <span className="voice-bar voice-bar-1"></span>
                              <span className="voice-bar voice-bar-2"></span>
                              <span className="voice-bar voice-bar-3"></span>
                            </div>
                          )}
                          <span className="text-xs opacity-50">🎙️</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Chat Send Input Box */}
            {activeSidebar === 'chat' && (
              <form onSubmit={handleSendChatMessage} className="p-3 border-t border-[#2d2c33] flex items-center gap-2">
                <input
                  type="text"
                  value={chatInputValue}
                  onInput={(e) => setChatInputValue(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-[#2d2c33] text-xs px-3 py-2 rounded-md border border-[#3d3b42] text-white focus:outline-none focus:border-[#5b5fc7] placeholder-[#adadad]"
                />
                <button
                  type="submit"
                  className="p-2 bg-[#5b5fc7] hover:bg-[#484ab2] text-white rounded-md text-xs font-semibold shrink-0"
                >
                  Send
                </button>
              </form>
            )}
          </aside>
        )}

      </div>
    </div>
  );
}

// Extension entry logic
const initStealthExtension = () => {
  // Prevent duplicate mounts
  if (document.getElementById('teams-stealth-root')) return;

  const host = document.createElement('div');
  host.id = 'teams-stealth-root';
  document.body.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: 'open' });

  // Attach content styling compiled by Vite & Tailwind
  const styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  const isDev = typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.getURL;
  styleLink.href = isDev ? '/src/content.css' : chrome.runtime.getURL('content.css');
  shadowRoot.appendChild(styleLink);

  // Mount Preact app inside Shadow DOM
  render(<MeetingRoom />, shadowRoot);
};

// Wait for document to be fully loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initStealthExtension();
} else {
  document.addEventListener('DOMContentLoaded', initStealthExtension);
}
