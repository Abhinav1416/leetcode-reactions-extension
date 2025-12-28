import { useEffect, useState, useRef } from 'react';

interface Setting {
  url: string;
  enabled: boolean;
}

const DEFAULT: Setting = { 
  url: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExejIweXFvem5nNHZrczBjODI2bWF2ZmMxaDU5MWY4ODB2YmtrZXNlNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/fo2db15Hus2pFvxoHq/giphy.gif", 
  enabled: true 
};

export default function Overlay() {
  const [visible, setVisible] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  
  const isActiveRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);

  const closeOverlay = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
    setImgSrc('');
    isActiveRef.current = false;
  };

  useEffect(() => {
    const handleVerdict = () => {
      if (isActiveRef.current) return;
      
      console.log("⚡ SHOWING VERDICT: AC");

      if (chrome.storage) {
        chrome.storage.sync.get(['ac'], (result) => {
          let finalSetting: Setting = DEFAULT;

          if (result.ac) {
            if (typeof result.ac === 'string') {
              finalSetting = { url: result.ac, enabled: true };
            } else if (typeof result.ac === 'object' && 'url' in result.ac) {
              finalSetting = result.ac as Setting;
            }
          }

          if (finalSetting.enabled === false) return;

          isActiveRef.current = true;
          setImgSrc(finalSetting.url);
          setVisible(true);

          if (timerRef.current) clearTimeout(timerRef.current);

          timerRef.current = window.setTimeout(() => {
            closeOverlay();
          }, 8000); 
        });
      }
    };

    window.addEventListener('LEETCODE_VERDICT', handleVerdict);
    return () => {
      window.removeEventListener('LEETCODE_VERDICT', handleVerdict);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []); 

  if (!visible) return null;

  return (
    <div 
      onClick={closeOverlay}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center',
        alignItems: 'center', zIndex: 2147483647,
        pointerEvents: 'auto',
        backdropFilter: 'blur(5px)',
        cursor: 'pointer'
      }}>
      <div style={{ textAlign: 'center', animation: 'pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
        <img 
          src={imgSrc} 
          alt="Verdict GIF" 
          style={{
            maxWidth: '60vw', maxHeight: '60vh', borderRadius: '15px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '4px solid white',
            objectFit: 'cover', display: 'block'
          }} 
        />
      </div>
      <style>{`
        @keyframes pop-in {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}