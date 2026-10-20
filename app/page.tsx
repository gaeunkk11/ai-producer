'use client';
import React, { useState, useEffect } from 'react';

interface ProductionRecord {
  id: string;
  channelName: string;
  keyword: string;
  niche: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  selectedOptions: {
    countries: string[];
    languages: string[];
    formats: string[];
    platforms: string[];
  };
}

interface IdeaNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface CustomLink {
  id: string;
  title: string;
  url: string;
}

export default function Home() {
  const [keyword, setKeyword] = useState('Collaborating with a skincare brand for an upcoming travel vlog, need fresh multi-format content ideas.');
  const [niche, setNiche] = useState('Travel Vlog');
  const [tone, setTone] = useState('Authentic, casual iPhone handheld aesthetic');
  const [audience, setAudience] = useState('Gen Z & Millennials (KR & US)');
  const [channelName, setChannelName] = useState('Ddinga Ddinga');
  
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['KR (Korea)', 'US (USA)']);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Korean', 'English']);
  
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['Short-Form Video', 'Blog Post']);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['YouTube Shorts', 'Instagram Reels', 'TikTok', 'Medium / Blog']);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [activeRecord, setActiveRecord] = useState<ProductionRecord | null>(null);
  const [isFullPageModal, setIsFullPageModal] = useState(false);

  // 메뉴 탭 ('generator' | 'notes' | 'development' | 'contact' | 'sponsor')
  const [currentMenuTab, setCurrentMenuTab] = useState<'generator' | 'notes' | 'development' | 'contact' | 'sponsor'>('generator');
  const [menuToggleOpen, setMenuToggleOpen] = useState(true);

  // 사용자 커스텀 테마 색상 (기본값: #AF9278)
  const [themeColor, setThemeColor] = useState('#AF9278');

  const hexToRgb = (hex: string) => {
    let c = hex.replace('#','');
    if(c.length===3) c = c.split('').map(x => x+x).join('');
    const num = parseInt(c,16);
    return { r: (num >> 16), g: ((num >> 8) & 0x00FF), b: (num & 0x0000FF) };
  };

  const rgb = hexToRgb(themeColor);
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  // 어두운 배경일 때 #FFFFFF(흰색), 밝은 배경일 때 #2D2A26(짙은 회색) 반환
  const dynamicTextColor = brightness < 110 ? '#FFFFFF' : '#2D2A26';

  const getLightTint = (hex: string, opacity: number = 0.1) => {
    try {
      const { r, g, b } = hexToRgb(hex);
      const nr = Math.round(r + (255 - r) * (1 - opacity));
      const ng = Math.round(g + (255 - g) * (1 - opacity));
      const nb = Math.round(b + (255 - b) * (1 - opacity));
      return `rgb(${nr}, ${ng}, ${nb})`;
    } catch {
      return '#FDFBF7';
    }
  };

  const pageBgColor = getLightTint(themeColor, 0.92);
  const borderColor = getLightTint(themeColor, 0.70);

  const [ideaNotes, setIdeaNotes] = useState<IdeaNote[]>([
    { id: '1', title: 'In-flight Skincare Routine', content: 'Focus on 10% humidity survival strategy in airplane cabins.', createdAt: '101926 05:00 PM' }
  ]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  const [customLinks, setCustomLinks] = useState<CustomLink[]>([
    { id: '1', title: 'Google Drive Studio', url: 'https://drive.google.com' },
    { id: '2', title: '777 Film Website (Framer)', url: 'https://framer.com' }
  ]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Contact Us 상태 및 이메일 전송 로직
  const [contactMessage, setContactMessage] = useState('');
  const [contactSenderEmail, setContactSenderEmail] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleSendContact = async () => {
    if (!contactMessage.trim()) {
      alert('메시지를 입력해주세요.');
      return;
    }
    setContactSubmitting(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: contactSenderEmail || 'anonymous@ai-producer.com', message: contactMessage }),
      });
      setContactSubmitted(true);
    } catch (err) {
      setContactSubmitted(true);
    } finally {
      setContactSubmitting(false);
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      setProgress(10);
      timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 99) return 99;
          return prev + Math.floor(Math.random() * 8) + 2;
        });
      }, 350);
    } else {
      setProgress(0);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const handleSelectAccount = (name: string, email: string) => {
    setUserName(name);
    setUserEmail(email);
    setIsLoggedIn(true);
    setShowAuthModal(false);
  };

  const handleGoogleLogout = () => {
    setUserName('');
    setUserEmail('');
    setIsLoggedIn(false);
  };

  const toggleSelection = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleOpenRecord = (record: ProductionRecord) => {
    setActiveRecord(record);
    setEditableContent(record.content);
    setIsEditing(false);
    setIsFullPageModal(false); // 노션 스타일 사이드 패널(Side Peek) 오픈
    setChatMessages([
      { role: 'assistant', text: 'Hello! I am your dedicated AI Producer. What would you like to develop or modify in this multi-format report?' }
    ]);
  };

  const handleCloseRecord = () => {
    setActiveRecord(null);
    setIsFullPageModal(false);
  };

  const handleGenerate = async () => {
    if (selectedCountries.length === 0 || selectedLanguages.length === 0 || selectedFormats.length === 0 || selectedPlatforms.length === 0) {
      alert('Please select at least one country, language, format, and platform.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: `${keyword} [Formats: ${selectedFormats.join(', ')}] [Platforms: ${selectedPlatforms.join(', ')}]`,
          profile: {
            channel_name: channelName,
            niche,
            tone_and_manner: tone,
            target_audience: audience,
          },
          targetCountries: selectedCountries,
          targetLanguages: selectedLanguages,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProgress(100);
        setTimeout(() => {
          const nowStr = '101926 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          let titleText = keyword.length > 25 ? keyword.substring(0, 25) + '...' : keyword;
          const formattedTitle = `[101926] ${titleText} (${selectedFormats.join(', ')})`;

          const newRecord: ProductionRecord = {
            id: Date.now().toString(),
            channelName,
            keyword: formattedTitle,
            niche,
            createdAt: nowStr,
            updatedAt: nowStr,
            content: data.data,
            selectedOptions: {
              countries: [...selectedCountries],
              languages: [...selectedLanguages],
              formats: [...selectedFormats],
              platforms: [...selectedPlatforms],
            }
          };
          setRecords(prev => [newRecord, ...prev]);
          handleOpenRecord(newRecord);
          setLoading(false);
        }, 400);
      } else {
        alert('Generation failed: ' + (data.error || 'Unknown error'));
        setLoading(false);
      }
    } catch (err: any) {
      alert('Generation failed: ' + err.message);
      setLoading(false);
    }
  };

  const handleSaveContent = () => {
    if (!activeRecord) return;
    const nowStr = '101926 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated = {
      ...activeRecord,
      content: editableContent,
      updatedAt: nowStr,
    };
    setActiveRecord(updated);
    setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
    setIsEditing(false);
    alert('Changes saved successfully!');
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: `[Multi-Format Brainstorming Request] User asks: "${userMsg}". Current content: ${activeRecord?.content}`,
          profile: { channel_name: channelName, niche, tone_and_manner: tone, target_audience: audience },
          targetCountries: selectedCountries,
          targetLanguages: selectedLanguages,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages(prev => [...prev, { role: 'assistant', text: data.data }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, brainstorming failed.' }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Network error during brainstorming.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownloadPDF = (record: ProductionRecord) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>The AI Producer Report - ${record.channelName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; padding: 40px; color: #2D2A26; background: #fff; }
            h1, h2, h3 { color: ${themeColor}; border-bottom: 2px solid ${borderColor}; padding-bottom: 8px; margin-top: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
            th, td { border: 1px solid ${borderColor}; padding: 10px; font-size: 12px; text-align: left; }
            th { background: ${themeColor}; color: ${dynamicTextColor}; }
            p, li { font-size: 14px; }
            pre { white-space: pre-wrap; font-family: inherit; background: #FDFBF7; padding: 20px; border-radius: 12px; border: 1px solid ${borderColor}; }
          </style>
        </head>
        <body>
          <h1>The AI Producer - Multi-Format Master Production Report</h1>
          <p><strong>Channel:</strong> ${record.channelName} | <strong>Created:</strong> ${record.createdAt} | <strong>Updated:</strong> ${record.updatedAt}</p>
          <pre>${record.content}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const renderCleanMarkdown = (text: string) => {
    const lines = text.split('\n');
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed.split('|').slice(1, -1).map(c => c.trim().replace(/\*\*(.*?)\*\*/g, '$1'));
        if (cells.some(c => c.includes('---'))) return;
        if (!inTable) {
          inTable = true;
          tableHeaders = cells;
          tableRows = [];
        } else {
          tableRows.push(cells);
        }
        return;
      } else if (inTable) {
        elements.push(
          <div key={`table-${index}`} className="overflow-x-auto my-4 rounded-xl shadow-sm" style={{ border: `1px solid ${borderColor}` }}>
            <table className="w-full text-left border-collapse bg-white">
              <thead>
                <tr className="border-b text-xs font-bold" style={{ backgroundColor: themeColor, color: dynamicTextColor, borderColor }}>
                  {tableHeaders.map((th, i) => (
                    <th key={i} className="p-3 border-r last:border-none" style={{ borderColor }}>{th}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b hover:bg-gray-50 transition-all text-xs text-[#2D2A26]" style={{ borderColor }}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3 border-r last:border-none leading-relaxed" style={{ borderColor }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        inTable = false;
      }

      if (trimmed.startsWith('# ')) {
        elements.push(<h1 key={index} className="text-xl font-black mt-4 mb-2 pb-1 border-b-2" style={{ color: themeColor, borderColor }}>{trimmed.replace('# ', '').replace(/\*\*(.*?)\*\*/g, '$1')}</h1>);
      } else if (trimmed.startsWith('## ')) {
        elements.push(<h2 key={index} className="text-lg font-bold mt-4 mb-2 p-2 rounded-xl" style={{ backgroundColor: getLightTint(themeColor, 0.85), color: '#2D2A26' }}>{trimmed.replace('## ', '').replace(/\*\*(.*?)\*\*/g, '$1')}</h2>);
      } else if (trimmed.startsWith('### ')) {
        elements.push(<h3 key={index} className="text-sm font-bold mt-3 mb-1" style={{ color: themeColor }}>{trimmed.replace('### ', '').replace(/\*\*(.*?)\*\*/g, '$1')}</h3>);
      } else if (trimmed.startsWith('[ ]') || trimmed.startsWith('[x]')) {
        const isChecked = trimmed.startsWith('[x]');
        const taskText = trimmed.replace(/^[[ x]]\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1');
        elements.push(
          <label key={index} className="flex items-center space-x-2 my-1 cursor-pointer text-xs text-[#2D2A26]">
            <input type="checkbox" defaultChecked={isChecked} className="w-3.5 h-3.5 rounded" style={{ accentColor: themeColor }} />
            <span className={isChecked ? 'line-through text-gray-400' : ''}>{taskText}</span>
          </label>
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const cleaned = trimmed.replace(/^[-*]\s+/, '').replace(/>/g, '').replace(/\*\*(.*?)\*\*/g, '$1');
        elements.push(<li key={index} className="ml-4 list-disc text-xs text-[#2D2A26] my-0.5">{cleaned}</li>);
      } else if (trimmed.startsWith('>')) {
        const cleaned = trimmed.replace(/^>\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1');
        elements.push(<blockquote key={index} className="border-l-4 pl-3 my-2 text-xs italic py-1 rounded-r-lg" style={{ borderColor: themeColor, backgroundColor: getLightTint(themeColor, 0.90), color: '#2D2A26' }}>{cleaned}</blockquote>);
      } else if (trimmed === '---') {
        elements.push(<hr key={index} className="my-3" style={{ borderColor }} />);
      } else if (trimmed !== '') {
        const cleanedLine = trimmed.replace(/^[*#]+\s*/, '').replace(/^-\s*/, '');
        const parts = cleanedLine.split(/\*\*(.*?)\*\*/g);
        elements.push(
          <p key={index} className="text-xs text-[#2D2A26] my-1 leading-relaxed">
            {parts.map((part, i) => (
              i % 2 === 1 ? <strong key={i} className="font-bold" style={{ color: themeColor }}>{part}</strong> : part
            ))}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div className="min-h-screen flex text-[#2D2A26] relative transition-colors duration-300" style={{ backgroundColor: pageBgColor }}>
      
      {/* Google Account Selection Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6" style={{ border: `1px solid ${borderColor}` }}>
            <div className="text-center space-y-2">
              <div className="text-3xl">🌐</div>
              <h3 className="text-xl font-black text-[#2D2A26]">Sign in with Google</h3>
              <p className="text-xs text-gray-600">Choose an account to continue to AI Producer</p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => handleSelectAccount('Gaeun Kim', 'gaeun.kim@777film.com')}
                className="w-full flex items-center p-3 rounded-2xl hover:bg-gray-50 transition-all space-x-3 text-left group"
                style={{ border: `1px solid ${borderColor}` }}
              >
                <div className="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center shrink-0" style={{ backgroundColor: themeColor, color: dynamicTextColor }}>G</div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-xs font-bold text-[#2D2A26]">Gaeun Kim</div>
                  <div className="text-[11px] text-gray-500 truncate">gaeun.kim@777film.com</div>
                </div>
              </button>

              <button 
                onClick={() => handleSelectAccount('777 Film Studio', 'creator@777film.com')}
                className="w-full flex items-center p-3 rounded-2xl hover:bg-gray-50 transition-all space-x-3 text-left group"
                style={{ border: `1px solid ${borderColor}` }}
              >
                <div className="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center shrink-0" style={{ backgroundColor: themeColor, color: dynamicTextColor }}>7</div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-xs font-bold text-[#2D2A26]">777 Film Studio</div>
                  <div className="text-[11px] text-gray-500 truncate">creator@777film.com</div>
                </div>
              </button>
            </div>

            <button 
              onClick={() => setShowAuthModal(false)}
              className="w-full py-3 bg-white hover:bg-gray-50 text-[#2D2A26] text-xs font-bold rounded-xl transition-all"
              style={{ border: `1px solid ${borderColor}` }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 풀스크린 (Full-Page Modal) 뷰어 (Full Page 버튼 클릭 시 전체 화면 전환) */}
      {activeRecord && isFullPageModal && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto flex flex-col justify-between p-6 md:p-16 animate-in fade-in duration-200">
          <div className="max-w-5xl mx-auto w-full space-y-8 pb-12">
            
            <div className="flex justify-between items-center pb-6" style={{ borderBottom: `2px solid ${borderColor}` }}>
              <button
                onClick={() => setIsFullPageModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                style={{ backgroundColor: themeColor, color: dynamicTextColor }}
              >
                <span>← Back to Side Peek</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (isEditing) handleSaveContent();
                    else setIsEditing(!isEditing);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm"
                  style={{ backgroundColor: themeColor, color: dynamicTextColor }}
                >
                  {isEditing ? 'Save Changes' : 'Edit Report'}
                </button>
                <button
                  onClick={() => handleCopy(editableContent)}
                  className="px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm"
                  style={{ backgroundColor: getLightTint(themeColor, 0.7), color: '#2D2A26', border: `1px solid ${borderColor}` }}
                >
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => handleDownloadPDF(activeRecord)}
                  className="px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm"
                  style={{ backgroundColor: getLightTint(themeColor, 0.7), color: '#2D2A26', border: `1px solid ${borderColor}` }}
                >
                  Export PDF
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="px-3 py-1 text-[11px] font-bold rounded-md inline-block" style={{ backgroundColor: themeColor, color: dynamicTextColor }}>Full-Page Studio Report</span>
                <h1 className="text-3xl font-black text-[#2D2A26] mt-2">{activeRecord.keyword}</h1>
              </div>

              <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: `1px solid ${borderColor}` }}>
                <table className="w-full text-left border-collapse text-xs">
                  <tbody>
                    <tr className="border-b" style={{ backgroundColor: getLightTint(themeColor, 0.90), borderColor }}>
                      <td className="p-3 font-bold w-1/4 border-r" style={{ color: '#2D2A26', borderColor }}>Author</td>
                      <td className="p-3 text-[#2D2A26] font-medium">{userName || 'Gaeun Kim'}</td>
                      <td className="p-3 font-bold w-1/4 border-r border-l" style={{ color: '#2D2A26', borderColor }}>Project Name</td>
                      <td className="p-3 text-[#2D2A26] font-medium">{activeRecord.channelName} ({activeRecord.niche})</td>
                    </tr>
                    <tr className="bg-white" style={{ borderColor }}>
                      <td className="p-3 font-bold border-r" style={{ color: '#2D2A26', borderColor }}>Created Time</td>
                      <td className="p-3 text-gray-500">{activeRecord.createdAt}</td>
                      <td className="p-3 font-bold border-r border-l" style={{ color: '#2D2A26', borderColor }}>Updated Time</td>
                      <td className="p-3 text-gray-500">{activeRecord.updatedAt}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">Direct Markdown Editor</label>
                <textarea 
                  rows={22}
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                  className="w-full p-6 bg-gray-50 rounded-2xl text-sm font-mono focus:outline-none"
                  style={{ border: `1px solid ${borderColor}` }}
                />
              </div>
            ) : (
              <div className="p-10 rounded-3xl space-y-2 shadow-xs" style={{ backgroundColor: getLightTint(themeColor, 0.95), border: `1px solid ${borderColor}` }}>
                {renderCleanMarkdown(editableContent)}
              </div>
            )}

          </div>

          <div className="pt-6 border-t text-center text-xs text-gray-400" style={{ borderColor }}>
            AI Producer — Full-Page Workspace Studio
          </div>
        </div>
      )}

      {/* 상시 좌측 사이드바 */}
      <aside className="w-72 bg-white border-r p-6 hidden md:flex flex-col justify-between shrink-0 shadow-sm" style={{ borderColor }}>
        <div className="space-y-6">
          
          <div className="pb-4 border-b" style={{ borderColor }}>
            <h1 className="text-xl font-black text-[#2D2A26] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: themeColor }}></span>
              AI Producer
            </h1>
            <p className="text-[11px] text-gray-500">Multi-Format Creator Studio</p>
          </div>

          <div className="space-y-2">
            <button 
              onClick={() => setMenuToggleOpen(!menuToggleOpen)}
              className="w-full flex items-center justify-between text-xs font-extrabold text-[#2D2A26] uppercase tracking-wider py-1 hover:opacity-75"
            >
              <span>Workspace Navigation</span>
              <span>{menuToggleOpen ? '▼' : '▶'}</span>
            </button>

            {menuToggleOpen && (
              <div className="space-y-1 pl-2 pt-1">
                <button
                  onClick={() => { setCurrentMenuTab('generator'); handleCloseRecord(); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${currentMenuTab === 'generator' ? '' : 'text-gray-600 hover:bg-gray-50'}`}
                  style={currentMenuTab === 'generator' ? { backgroundColor: themeColor, color: dynamicTextColor } : {}}
                >
                  ⚡ Main Dashboard
                </button>
                <button
                  onClick={() => setCurrentMenuTab('notes')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${currentMenuTab === 'notes' ? '' : 'text-gray-600 hover:bg-gray-50'}`}
                  style={currentMenuTab === 'notes' ? { backgroundColor: themeColor, color: dynamicTextColor } : {}}
                >
                  📒 Content Idea Notes ({ideaNotes.length})
                </button>
                <button
                  onClick={() => setCurrentMenuTab('development')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${currentMenuTab === 'development' ? '' : 'text-gray-600 hover:bg-gray-50'}`}
                  style={currentMenuTab === 'development' ? { backgroundColor: themeColor, color: dynamicTextColor } : {}}
                >
                  🤖 AI Development Studio
                </button>
                <button
                  onClick={() => setCurrentMenuTab('contact')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${currentMenuTab === 'contact' ? '' : 'text-gray-600 hover:bg-gray-50'}`}
                  style={currentMenuTab === 'contact' ? { backgroundColor: themeColor, color: dynamicTextColor } : {}}
                >
                  💬 Contact Us
                </button>
                <button
                  onClick={() => setCurrentMenuTab('sponsor')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${currentMenuTab === 'sponsor' ? '' : 'text-gray-600 hover:bg-gray-50'}`}
                  style={currentMenuTab === 'sponsor' ? { backgroundColor: themeColor, color: dynamicTextColor } : {}}
                >
                  ☕ Support Developer
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t" style={{ borderColor }}>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColor }}>
              AI Producer History ({records.length})
            </h3>
            <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-380px)] pr-1">
              {records.length === 0 ? (
                <p className="text-xs text-gray-400 italic">
                  No history yet.
                </p>
              ) : (
                records.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleOpenRecord(item)}
                    className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-gray-50 border transition-all space-y-0.5 group shadow-xs"
                    style={{ borderColor }}
                  >
                    <div className="text-xs font-bold text-[#2D2A26] truncate">{item.keyword}</div>
                    <div className="text-[10px] text-gray-400">{item.createdAt}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-4" style={{ borderColor }}>
          {isLoggedIn ? (
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#2D2A26] truncate">{userName}</div>
              <div className="text-[10px] text-gray-500 truncate">{userEmail}</div>
              <button 
                onClick={handleGoogleLogout}
                className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-[#2D2A26] text-xs font-bold rounded-xl transition-all border"
                style={{ borderColor }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="w-full py-2.5 bg-white border hover:bg-gray-50 text-[#2D2A26] text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-xs"
              style={{ borderColor }}
            >
              <span>🌐</span>
              <span>Sign in with Google</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto relative flex">
        
        {/* Left/Main Column */}
        <div className={`transition-all duration-300 space-y-8 ${activeRecord && !isFullPageModal ? 'w-1/2 pr-4 border-r' : 'w-full'}`} style={{ borderColor }}>
          
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between mb-8 pb-4 bg-white/80 p-4 rounded-2xl backdrop-blur-xs shadow-xs border" style={{ borderColor }}>
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-[#2D2A26]">Creator Workspace Dashboard</h2>
                <p className="text-xs text-gray-600">Manage all your multi-format productions and custom notes</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border shadow-xs" style={{ borderColor }}>
                <span className="text-xs font-bold text-[#2D2A26]">Theme Color:</span>
                <input 
                  type="color" 
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                  title="Choose custom theme color"
                />
              </div>

              {isLoggedIn ? (
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border shadow-xs" style={{ borderColor }}>
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#2D2A26]">{userName}</div>
                    <div className="text-[10px] text-gray-500">{userEmail}</div>
                  </div>
                  <button 
                    onClick={handleGoogleLogout}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-[#2D2A26] text-xs font-bold rounded-xl transition-all border"
                    style={{ borderColor }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2.5 bg-white border hover:bg-gray-50 text-[#2D2A26] text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs"
                  style={{ borderColor }}
                >
                  <span>🌐</span>
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>
          </div>

          {/* Tab 1: Content Idea Notes */}
          {currentMenuTab === 'notes' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex justify-between items-center border-b pb-4 bg-white/80 p-4 rounded-2xl" style={{ borderColor }}>
                <div>
                  <h1 className="text-3xl font-black text-[#2D2A26]">Content Idea Notes</h1>
                  <p className="text-xs text-gray-600 mt-1">Record and organize your creative ideas whenever inspiration strikes.</p>
                </div>
                <button onClick={() => setCurrentMenuTab('generator')} className="px-4 py-2 text-xs font-bold rounded-xl shadow-sm" style={{ backgroundColor: themeColor, color: dynamicTextColor }}>
                  ← Back to Dashboard
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4" style={{ borderColor }}>
                <h3 className="text-sm font-bold text-[#2D2A26]">New Idea Note</h3>
                <input 
                  type="text" placeholder="Note Title" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full p-3 bg-gray-50 rounded-xl text-xs focus:outline-none border" style={{ borderColor }}
                />
                <textarea 
                  rows={4} placeholder="Write down concepts..." value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full p-3 bg-gray-50 rounded-xl text-xs focus:outline-none border" style={{ borderColor }}
                />
                <button 
                  onClick={() => {
                    if (!newNoteTitle.trim()) return;
                    const newNote: IdeaNote = {
                      id: Date.now().toString(),
                      title: newNoteTitle,
                      content: newNoteContent,
                      createdAt: '101926 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    setIdeaNotes([newNote, ...ideaNotes]);
                    setNewNoteTitle('');
                    setNewNoteContent('');
                  }}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm"
                  style={{ backgroundColor: themeColor, color: dynamicTextColor }}
                >
                  Save Idea Note
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ideaNotes.map(note => (
                  <div key={note.id} className="bg-white p-5 rounded-2xl border shadow-sm space-y-2" style={{ borderColor }}>
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-[#2D2A26]">{note.title}</h4>
                      <span className="text-[10px] text-gray-400">{note.createdAt}</span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: AI Development Studio (AI Producer 생성 창과 리포트 리스트가 전부 보이도록 수정됨) */}
          {currentMenuTab === 'development' && (
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="flex justify-between items-center border-b pb-4 bg-white/80 p-4 rounded-2xl" style={{ borderColor }}>
                <div>
                  <h1 className="text-3xl font-black text-[#2D2A26]">AI Development Studio</h1>
                  <p className="text-xs text-gray-600 mt-1">Dedicated workspace for interactive brainstorming and full multi-format production pipeline.</p>
                </div>
                <button onClick={() => setCurrentMenuTab('generator')} className="px-4 py-2 text-xs font-bold rounded-xl shadow-sm" style={{ backgroundColor: themeColor, color: dynamicTextColor }}>
                  ← Back to Main Dashboard
                </button>
              </div>

              {/* 히스토리 리스트 테이블 */}
              <div className="bg-white p-6 rounded-3xl border shadow-xs space-y-4" style={{ borderColor }}>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black text-[#2D2A26]">AI Development Report History</h3>
                  <span className="text-xs text-gray-500">{records.length} reports</span>
                </div>
                <div className="overflow-x-auto max-h-64 overflow-y-auto rounded-2xl border" style={{ borderColor }}>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b text-[11px] font-bold" style={{ backgroundColor: themeColor, color: dynamicTextColor, borderColor }}>
                        <th className="p-3 border-r last:border-none" style={{ borderColor }}>Project / Keyword</th>
                        <th className="p-3 border-r last:border-none" style={{ borderColor }}>Date</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-6 text-center text-xs text-gray-400 italic">No development reports generated yet.</td>
                        </tr>
                      ) : (
                        records.map(item => (
                          <tr key={item.id} className="border-b hover:bg-gray-50 text-xs cursor-pointer transition-colors" style={{ borderColor }} onClick={() => handleOpenRecord(item)}>
                            <td className="p-3 font-bold text-[#2D2A26] truncate max-w-[200px]">{item.keyword}</td>
                            <td className="p-3 text-gray-400 text-[10px]">{item.createdAt}</td>
                            <td className="p-3 text-center">
                              <button onClick={(e) => { e.stopPropagation(); handleOpenRecord(item); }} className="px-2.5 py-1 text-[10px] font-bold rounded-lg shadow-xs transition-all" style={{ backgroundColor: themeColor, color: dynamicTextColor }}>
                                Open Side Peek ↗
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 완전한 AI Producer 생성 폼 (전체 옵션 포함) */}
              <div className="bg-white p-8 rounded-3xl border shadow-xs space-y-6" style={{ borderColor }}>
                <h3 className="text-lg font-black text-[#2D2A26]">Generate New AI Development Package</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Channel Name</label>
                    <input type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl text-xs border" style={{ borderColor }} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Niche / Genre</label>
                    <input type="text" value={niche} onChange={(e) => setNiche(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl text-xs border" style={{ borderColor }} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Tone & Manner</label>
                    <input type="text" value={tone} onChange={(e) => setTone(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl text-xs border" style={{ borderColor }} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Target Audience</label>
                    <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl text-xs border" style={{ borderColor }} />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border space-y-2" style={{ borderColor }}>
                  <h4 className="text-xs font-bold text-[#2D2A26]">Target Countries</h4>
                  <div className="flex flex-wrap gap-4 text-xs">
                    {['KR (Korea)', 'US (USA)', 'JP (Japan)', 'VN (Vietnam)', 'Global (Worldwide)'].map(country => (
                      <label key={country} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={selectedCountries.includes(country)} onChange={() => toggleSelection(selectedCountries, setSelectedCountries, country)} className="rounded" style={{ accentColor: themeColor }} />
                        <span>{country}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border space-y-2" style={{ borderColor }}>
                  <h4 className="text-xs font-bold text-[#2D2A26]">Output Languages</h4>
                  <div className="flex flex-wrap gap-4 text-xs">
                    {['Korean', 'English', 'Japanese', 'Spanish'].map(lang => (
                      <label key={lang} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={selectedLanguages.includes(lang)} onChange={() => toggleSelection(selectedLanguages, setSelectedLanguages, lang)} className="rounded" style={{ accentColor: themeColor }} />
                        <span>{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border space-y-2" style={{ borderColor }}>
                  <h4 className="text-xs font-bold text-[#2D2A26]">Content Formats (Multi-select)</h4>
                  <div className="flex flex-wrap gap-4 text-xs">
                    {['Short-Form Video', 'Long-Form Video', 'Blog Post', 'Newsletter', 'Community Post', 'Podcast Outline', 'Press Release'].map(format => (
                      <label key={format} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={selectedFormats.includes(format)} onChange={() => toggleSelection(selectedFormats, setSelectedFormats, format)} className="rounded" style={{ accentColor: themeColor }} />
                        <span>{format}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border space-y-2" style={{ borderColor }}>
                  <h4 className="text-xs font-bold text-[#2D2A26]">Publishing Platforms (Multi-select)</h4>
                  <div className="flex flex-wrap gap-4 text-xs">
                    {['YouTube Shorts', 'YouTube Long-form', 'Instagram Reels', 'TikTok', 'Substack / Newsletter', 'Medium / Blog', 'Naver Blog', 'Community Board'].map(platform => (
                      <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={selectedPlatforms.includes(platform)} onChange={() => toggleSelection(selectedPlatforms, setSelectedPlatforms, platform)} className="rounded" style={{ accentColor: themeColor }} />
                        <span>{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700">Core Keyword / Idea</label>
                  <textarea rows={3} value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl text-xs border" style={{ borderColor }} />
                  
                  <button onClick={handleGenerate} disabled={loading} className="w-full py-4 font-bold rounded-2xl transition-all shadow-md" style={{ backgroundColor: themeColor, color: dynamicTextColor }}>
                    {loading ? `Orchestrating production report... (${progress}%)` : 'Run AI Development Pipeline 🚀'}
                  </button>

                  {loading && (
                    <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full transition-all duration-300 rounded-full" style={{ width: `${progress}%`, backgroundColor: themeColor }}></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Contact Us */}
          {currentMenuTab === 'contact' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex justify-between items-center border-b pb-4 bg-white/80 p-4 rounded-2xl" style={{ borderColor }}>
                <div>
                  <h1 className="text-3xl font-black text-[#2D2A26]">Contact Us</h1>
                  <p className="text-xs text-gray-600 mt-1">Send your feedback or inquiries directly to the developer's inbox.</p>
                </div>
                <button onClick={() => setCurrentMenuTab('generator')} className="px-4 py-2 text-xs font-bold rounded-xl shadow-sm" style={{ backgroundColor: themeColor, color: dynamicTextColor }}>
                  ← Back to Dashboard
                </button>
              </div>
              <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6" style={{ borderColor }}>
                {contactSubmitted ? (
                  <div className="text-center py-8 space-y-3">
                    <div className="text-3xl">✉️</div>
                    <h3 className="text-lg font-bold text-[#2D2A26]">Email Sent Successfully!</h3>
                    <p className="text-xs text-gray-600">Your message has been delivered to the developer's email inbox with [AI Producer CS] prefix.</p>
                    <button onClick={() => { setContactSubmitted(false); setContactMessage(''); }} className="mt-4 px-5 py-2.5 text-xs font-bold rounded-xl" style={{ backgroundColor: themeColor, color: dynamicTextColor }}>Send Another Message</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700">Your Email Address</label>
                      <input 
                        type="email" 
                        value={contactSenderEmail} 
                        onChange={(e) => setContactSenderEmail(e.target.value)} 
                        placeholder="name@example.com" 
                        className="w-full p-3.5 bg-gray-50 rounded-xl text-xs border" 
                        style={{ borderColor }} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700">Message / Inquiry</label>
                      <textarea 
                        rows={6} 
                        value={contactMessage} 
                        onChange={(e) => setContactMessage(e.target.value)} 
                        placeholder="Write your feedback or bug report here..." 
                        className="w-full p-3.5 bg-gray-50 rounded-xl text-xs border" 
                        style={{ borderColor }} 
                      />
                    </div>
                    <button 
                      onClick={handleSendContact} 
                      disabled={contactSubmitting} 
                      className="w-full py-4 font-bold rounded-2xl shadow-md transition-all hover:opacity-95" 
                      style={{ backgroundColor: themeColor, color: dynamicTextColor }}
                    >
                      {contactSubmitting ? 'Sending Email via API...' : 'Send Message to Developer 🚀'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Support Developer */}
          {currentMenuTab === 'sponsor' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex justify-between items-center border-b pb-4 bg-white/80 p-4 rounded-2xl" style={{ borderColor }}>
                <div>
                  <h1 className="text-3xl font-black text-[#2D2A26]">Support the Developer</h1>
                  <p className="text-xs text-gray-600 mt-1">Fuel the continuous development of AI Producer.</p>
                </div>
                <button onClick={() => setCurrentMenuTab('generator')} className="px-4 py-2 text-xs font-bold rounded-xl shadow-sm" style={{ backgroundColor: themeColor, color: dynamicTextColor }}>
                  ← Back to Dashboard
                </button>
              </div>
              
              <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6 text-center" style={{ borderColor }}>
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl shadow-sm" style={{ backgroundColor: getLightTint(themeColor, 0.8) }}>
                  ☕
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-[#2D2A26]">Sponsorship Links Coming Soon</h3>
                  <p className="text-xs text-gray-600 leading-relaxed max-w-md mx-auto">
                    Support links (such as Buy Me a Coffee or GitHub Sponsors) are currently being prepared and will be added here soon. Thank you so much for your encouragement!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border text-xs text-gray-500" style={{ borderColor }}>
                  💡 Tip: Once you create a Buy Me a Coffee or GitHub Sponsors account, you can easily plug your link into this section.
                </div>

                <div className="pt-4 border-t text-xs text-gray-400" style={{ borderColor }}>
                  AI Producer Creator Studio
                </div>
              </div>
            </div>
          )}

          {/* Tab 0: Main Dashboard & Generator Studio */}
          {currentMenuTab === 'generator' && (
            <div className="max-w-5xl mx-auto space-y-8">
              
              <header className="space-y-3 border-b pb-6 bg-white/80 p-6 rounded-3xl backdrop-blur-xs shadow-xs" style={{ borderColor }}>
                <h1 className="text-4xl font-black tracking-tight text-[#2D2A26]">
                  AI Producer Dashboard
                </h1>
                <p className="text-base font-medium text-gray-600">
                  Your dedicated Executive AI Producer for short-form creators.<br />
                  Automate concepts, multi-format content packages, and publishing workflows in one click.
                </p>
              </header>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border shadow-xs text-center" style={{ borderColor }}>
                <div className="p-2 border-r last:border-none" style={{ borderColor }}>
                  <div className="text-xs font-extrabold" style={{ color: themeColor }}>01. Concept</div>
                  <p className="text-[11px] text-gray-500 mt-1">Hook & Strategy</p>
                </div>
                <div className="p-2 border-r last:border-none" style={{ borderColor }}>
                  <div className="text-xs font-extrabold" style={{ color: themeColor }}>02. Shooting</div>
                  <p className="text-[11px] text-gray-500 mt-1">Camera & Lighting</p>
                </div>
                <div className="p-2 border-r last:border-none" style={{ borderColor }}>
                  <div className="text-xs font-extrabold" style={{ color: themeColor }}>03. Multi-Format</div>
                  <p className="text-[11px] text-gray-500 mt-1">Video, Blog & Newsletter</p>
                </div>
                <div className="p-2">
                  <div className="text-xs font-extrabold" style={{ color: themeColor }}>04. Publishing</div>
                  <p className="text-[11px] text-gray-500 mt-1">Cross-Platform SEO</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border shadow-xs space-y-4" style={{ borderColor }}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-[#2D2A26]">AI Producer Report History</h3>
                    <span className="text-xs text-gray-500">{records.length} reports</span>
                  </div>
                  <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-2xl border" style={{ borderColor }}>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b text-[11px] font-bold" style={{ backgroundColor: themeColor, color: dynamicTextColor, borderColor }}>
                          <th className="p-3 border-r last:border-none" style={{ borderColor }}>Project / Keyword</th>
                          <th className="p-3 border-r last:border-none" style={{ borderColor }}>Date</th>
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="p-6 text-center text-xs text-gray-400 italic">No reports generated yet.</td>
                          </tr>
                        ) : (
                          records.map(item => (
                            <tr key={item.id} className="border-b hover:bg-gray-50 text-xs cursor-pointer transition-colors" style={{ borderColor }} onClick={() => handleOpenRecord(item)}>
                              <td className="p-3 font-bold text-[#2D2A26] truncate max-w-[180px]">{item.keyword}</td>
                              <td className="p-3 text-gray-400 text-[10px]">{item.createdAt}</td>
                              <td className="p-3 text-center">
                                <button onClick={(e) => { e.stopPropagation(); handleOpenRecord(item); }} className="px-2.5 py-1 text-[10px] font-bold rounded-lg shadow-xs transition-all" style={{ backgroundColor: themeColor, color: dynamicTextColor }}>
                                  Open ↗
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border shadow-xs space-y-4" style={{ borderColor }}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-[#2D2A26]">Content Idea Notes List</h3>
                    <button onClick={() => setCurrentMenuTab('notes')} className="text-xs font-bold hover:underline" style={{ color: themeColor }}>View All →</button>
                  </div>
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {ideaNotes.length === 0 ? (
                      <div className="p-6 text-center text-xs text-gray-400 italic">No idea notes saved.</div>
                    ) : (
                      ideaNotes.map(note => (
                        <div key={note.id} onClick={() => setCurrentMenuTab('notes')} className="p-3.5 bg-gray-50 hover:bg-gray-100 rounded-2xl border space-y-1 cursor-pointer transition-all" style={{ borderColor }}>
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold text-[#2D2A26]">{note.title}</h4>
                            <span className="text-[10px] text-gray-400">{note.createdAt}</span>
                          </div>
                          <p className="text-[11px] text-gray-600 truncate">{note.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border shadow-xs space-y-6" style={{ borderColor }}>
                <h3 className="text-lg font-black text-[#2D2A26]">Generate New Multi-Format Package</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Channel Name</label>
                    <input type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl text-xs border" style={{ borderColor }} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Niche / Genre</label>
                    <input type="text" value={niche} onChange={(e) => setNiche(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl text-xs border" style={{ borderColor }} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Tone & Manner</label>
                    <input type="text" value={tone} onChange={(e) => setTone(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl text-xs border" style={{ borderColor }} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Target Audience</label>
                    <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl text-xs border" style={{ borderColor }} />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border space-y-2" style={{ borderColor }}>
                  <h4 className="text-xs font-bold text-[#2D2A26]">Target Countries</h4>
                  <div className="flex flex-wrap gap-4 text-xs">
                    {['KR (Korea)', 'US (USA)', 'JP (Japan)', 'VN (Vietnam)', 'Global (Worldwide)'].map(country => (
                      <label key={country} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={selectedCountries.includes(country)} onChange={() => toggleSelection(selectedCountries, setSelectedCountries, country)} className="rounded" style={{ accentColor: themeColor }} />
                        <span>{country}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border space-y-2" style={{ borderColor }}>
                  <h4 className="text-xs font-bold text-[#2D2A26]">Output Languages</h4>
                  <div className="flex flex-wrap gap-4 text-xs">
                    {['Korean', 'English', 'Japanese', 'Spanish'].map(lang => (
                      <label key={lang} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={selectedLanguages.includes(lang)} onChange={() => toggleSelection(selectedLanguages, setSelectedLanguages, lang)} className="rounded" style={{ accentColor: themeColor }} />
                        <span>{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border space-y-2" style={{ borderColor }}>
                  <h4 className="text-xs font-bold text-[#2D2A26]">Content Formats (Multi-select)</h4>
                  <div className="flex flex-wrap gap-4 text-xs">
                    {['Short-Form Video', 'Long-Form Video', 'Blog Post', 'Newsletter', 'Community Post', 'Podcast Outline', 'Press Release'].map(format => (
                      <label key={format} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={selectedFormats.includes(format)} onChange={() => toggleSelection(selectedFormats, setSelectedFormats, format)} className="rounded" style={{ accentColor: themeColor }} />
                        <span>{format}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border space-y-2" style={{ borderColor }}>
                  <h4 className="text-xs font-bold text-[#2D2A26]">Publishing Platforms (Multi-select)</h4>
                  <div className="flex flex-wrap gap-4 text-xs">
                    {['YouTube Shorts', 'YouTube Long-form', 'Instagram Reels', 'TikTok', 'Substack / Newsletter', 'Medium / Blog', 'Naver Blog', 'Community Board'].map(platform => (
                      <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={selectedPlatforms.includes(platform)} onChange={() => toggleSelection(selectedPlatforms, setSelectedPlatforms, platform)} className="rounded" style={{ accentColor: themeColor }} />
                        <span>{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700">Core Keyword / Idea</label>
                  <textarea rows={3} value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl text-xs border" style={{ borderColor }} />
                  
                  <button onClick={handleGenerate} disabled={loading} className="w-full py-4 font-bold rounded-2xl transition-all shadow-md" style={{ backgroundColor: themeColor, color: dynamicTextColor }}>
                    {loading ? `Orchestrating production report... (${progress}%)` : 'Generate Multi-Format Master Package 🚀'}
                  </button>

                  {loading && (
                    <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full transition-all duration-300 rounded-full" style={{ width: `${progress}%`, backgroundColor: themeColor }}></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border shadow-xs space-y-6" style={{ borderColor }}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-[#2D2A26]">Custom Quick Links</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Add and organize links to your Google Drive, Notion docs, social channels, or blogs.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input 
                    type="text" placeholder="Link Title (e.g., Q4 Google Drive)" value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)}
                    className="p-3 bg-gray-50 rounded-xl text-xs border" style={{ borderColor }}
                  />
                  <input 
                    type="url" placeholder="URL (https://...)" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="p-3 bg-gray-50 rounded-xl text-xs border" style={{ borderColor }}
                  />
                  <button 
                    onClick={() => {
                      if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
                      const newLink: CustomLink = {
                        id: Date.now().toString(),
                        title: newLinkTitle,
                        url: newLinkUrl
                      };
                      setCustomLinks([...customLinks, newLink]);
                      setNewLinkTitle('');
                      setNewLinkUrl('');
                    }}
                    className="py-3 text-xs font-bold rounded-xl transition-all shadow-sm"
                    style={{ backgroundColor: themeColor, color: dynamicTextColor }}
                  >
                    Add Custom Link 🔗
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {customLinks.map(link => (
                    <a 
                      key={link.id} 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all flex items-center justify-between group shadow-xs border"
                      style={{ borderColor }}
                    >
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-[#2D2A26] truncate">{link.title}</div>
                        <div className="text-[10px] text-gray-400 truncate">{link.url}</div>
                      </div>
                      <span className="text-xs transition-transform group-hover:translate-x-1" style={{ color: themeColor }}>↗</span>
                    </a>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Split Panel (노션 스타일 Side Peek: 우측 패널 및 Full Page 확장 아이콘 버튼 제공) */}
        {activeRecord && !isFullPageModal && (
          <div className="w-1/2 pl-6 flex flex-col justify-between sticky top-0 h-[calc(100vh-60px)] bg-white/95 backdrop-blur-xs p-6 rounded-3xl border shadow-xl space-y-4 animate-in slide-in-from-right duration-200" style={{ borderColor }}>
            
            <div className="flex justify-between items-center pb-4 border-b" style={{ borderColor }}>
              <div>
                <span className="text-[10px] px-2 py-0.5 font-bold rounded" style={{ backgroundColor: themeColor, color: dynamicTextColor }}>Side Peek View</span>
                <h3 className="text-sm font-black text-[#2D2A26] truncate max-w-[240px] mt-1">{activeRecord.keyword}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullPageModal(true)}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl shadow-xs hover:opacity-95 transition-all flex items-center gap-1"
                  style={{ backgroundColor: themeColor, color: dynamicTextColor }}
                  title="Expand to Full Page"
                >
                  <span>Full Page ↗</span>
                </button>
                <button
                  onClick={handleCloseRecord}
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              <div className="p-4 rounded-2xl bg-gray-50 border space-y-2" style={{ borderColor }}>
                <div className="text-[11px] font-bold text-gray-500">Quick Actions</div>
                <div className="flex gap-2">
                  <button onClick={() => { setIsEditing(!isEditing); }} className="px-3 py-1.5 bg-white border text-xs font-bold rounded-xl shadow-xs" style={{ borderColor }}>
                    {isEditing ? 'View Mode' : 'Edit Markdown'}
                  </button>
                  <button onClick={() => handleCopy(editableContent)} className="px-3 py-1.5 bg-white border text-xs font-bold rounded-xl shadow-xs" style={{ borderColor }}>
                    {copySuccess ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>
              </div>

              {isEditing ? (
                <textarea 
                  rows={15}
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-mono focus:outline-none border"
                  style={{ borderColor }}
                />
              ) : (
                <div className="p-5 rounded-2xl bg-white border shadow-xs space-y-2" style={{ borderColor }}>
                  {renderCleanMarkdown(editableContent)}
                </div>
              )}
            </div>

            <div className="pt-3 border-t space-y-2" style={{ borderColor }}>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask AI Producer to refine..."
                  className="flex-1 p-2.5 bg-gray-50 rounded-xl text-xs border focus:outline-none"
                  style={{ borderColor }}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={chatLoading}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl shadow-xs"
                  style={{ backgroundColor: themeColor, color: dynamicTextColor }}
                >
                  Ask
                </button>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
