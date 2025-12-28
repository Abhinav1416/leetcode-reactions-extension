import { useEffect, useState } from 'react';
import './App.css';

interface Setting {
  url: string;
  enabled: boolean;
}

const DEFAULT: Setting = { 
  url: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExejIweXFvem5nNHZrczBjODI2bWF2ZmMxaDU5MWY4ODB2YmtrZXNlNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/fo2db15Hus2pFvxoHq/giphy.gif", 
  enabled: true 
};

function App() {
  const [setting, setSetting] = useState<Setting>(DEFAULT);
  const [status, setStatus] = useState('');
  
  useEffect(() => {
    if (chrome.storage) {
      chrome.storage.sync.get(['ac'], (result) => {
        if (result.ac) {
           if (typeof result.ac === 'string') {
             setSetting({ url: result.ac, enabled: true });
           } else {
             setSetting(result.ac as Setting);
           }
        }
      });
    }
  }, []);

  const handleUrlChange = (val: string) => {
    setSetting(prev => ({ ...prev, url: val }));
  };

  const handleToggle = () => {
    setSetting(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const handleReset = () => {
    setSetting(DEFAULT);

    if (chrome.storage) {
      chrome.storage.sync.set({ ac: DEFAULT }, () => {
        setStatus('✅ Defaults Restored & Saved!');
        setTimeout(() => setStatus(''), 2000);
      });
    } else {
      setStatus('Dev: Defaults Restored');
    }
  };

  const handleSave = () => {
    if (chrome.storage) {
      chrome.storage.sync.set({ ac: setting }, () => {
        setStatus('✅ Settings Saved!');
        setTimeout(() => setStatus(''), 2000);
      });
    } else {
      setStatus('Dev Mode: Saved');
    }
  };

  return (
    <div className="card">
      <h2>LeetCode Reactions ⚙️</h2>
      
      <div className="input-group">
        <div className="header-row">
          <label>Accepted (AC)</label>
          <div className="toggle-wrapper">
            <span className="toggle-label">{setting.enabled ? 'ON' : 'OFF'}</span>
            <input 
              type="checkbox" 
              className="toggle-check"
              checked={setting.enabled}
              onChange={handleToggle}
            />
          </div>
        </div>
        
        {setting.enabled && (
          <input 
            type="text" 
            value={setting.url} 
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="Paste GIF URL..."
          />
        )}
      </div>

      <div className="footer" style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleSave} style={{ flex: 2 }}>
          Save Settings
        </button>
        
        <button 
          onClick={handleReset} 
          style={{ 
            flex: 1, 
            backgroundColor: '#757575', 
            fontSize: '0.8rem' 
          }}
        >
          Reset
        </button>
      </div>
      
      {status && <p className="status">{status}</p>}
    </div>
  );
}

export default App;