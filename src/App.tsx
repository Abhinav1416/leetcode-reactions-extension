import { useEffect, useState } from "react";
import { DEFAULT_GIFS } from "./constants";
import { GifItem } from "./types";
import "./App.css";

function App() {
  const [masterSwitch, setMasterSwitch] = useState(true);
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [newGifUrl, setNewGifUrl] = useState("");
  const [newGifName, setNewGifName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    chrome.storage.sync.get(["gifs", "masterSwitch"], (result) => {
      if (Array.isArray(result.gifs) && result.gifs.length > 0) {
        setGifs(result.gifs as GifItem[]);
      } else {
        setGifs(DEFAULT_GIFS);
        chrome.storage.sync.set({ gifs: DEFAULT_GIFS });
      }
      if (result.masterSwitch !== undefined) {
        setMasterSwitch(result.masterSwitch as boolean);
      } else {
        setMasterSwitch(true);
      }
    });
  }, []);

  const saveToStorage = (updatedGifs: GifItem[], updatedSwitch: boolean) => {
    chrome.storage.sync.set({
      gifs: updatedGifs,
      masterSwitch: updatedSwitch,
    });
  };

  const handleMasterToggle = () => {
    const newVal = !masterSwitch;
    setMasterSwitch(newVal);
    saveToStorage(gifs, newVal);
  };

  const handleGifToggle = (id: string) => {
    const updatedGifs = gifs.map((g) =>
      g.id === id ? { ...g, enabled: !g.enabled } : g
    );
    setGifs(updatedGifs);
    saveToStorage(updatedGifs, masterSwitch);
  };

  const handleDelete = (id: string) => {
    const updatedGifs = gifs.filter((g) => g.id !== id);
    setGifs(updatedGifs);
    saveToStorage(updatedGifs, masterSwitch);
  };

  const handleAdd = () => {
    if (!newGifUrl || !newGifName) {
      setError("Please fill both fields");
      return;
    }
    if (gifs.length >= 10) {
      setError("Max 10 GIFs allowed!");
      return;
    }

    const newGif: GifItem = {
      id: Date.now().toString(),
      name: newGifName,
      url: newGifUrl,
      enabled: true,
      isDefault: false,
    };

    const updatedGifs = [...gifs, newGif];
    setGifs(updatedGifs);
    saveToStorage(updatedGifs, masterSwitch);
    setNewGifName("");
    setNewGifUrl("");
    setError("");
  };

  const handleResetDefaults = () => {
    if (confirm("Reset all GIFs to default?")) {
        setGifs(DEFAULT_GIFS);
        saveToStorage(DEFAULT_GIFS, masterSwitch);
    }
  };

  return (
    <div className="container">
      <header>
        <h2>LeetCode Reactions</h2>
        <label className="toggle-label">
          <span>{masterSwitch ? "Enabled" : "Disabled"}</span>
          <input
            type="checkbox"
            checked={masterSwitch}
            onChange={handleMasterToggle}
            className="master-toggle"
          />
        </label>
      </header>

      <div className="gif-list">
        {gifs.map((gif) => (
          <div key={gif.id} className="gif-card">
            <div className="gif-info">
              <input
                type="checkbox"
                checked={gif.enabled}
                onChange={() => handleGifToggle(gif.id)}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span className="gif-name" title={gif.name}>
                  {gif.name}
                </span>
                {gif.isDefault && <span className="badge">Default</span>}
              </div>
            </div>
            <button
              onClick={() => handleDelete(gif.id)}
              className="delete-btn"
              title="Delete GIF"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="add-section">
        <input
          type="text"
          className="input-field"
          placeholder="GIF Name (e.g. My Anime)"
          value={newGifName}
          onChange={(e) => setNewGifName(e.target.value)}
        />
        <input
          type="text"
          className="input-field"
          placeholder="GIF URL (https://...)"
          value={newGifUrl}
          onChange={(e) => setNewGifUrl(e.target.value)}
        />
        <button onClick={handleAdd} className="add-btn">
          Add Custom GIF
        </button>
        {error && <p className="error-msg">{error}</p>}
      </div>

      <div className="footer">
          <span style={{cursor: "pointer", textDecoration: "underline"}} onClick={handleResetDefaults}>Reset to Defaults</span>
          <br/>
          v1.1 • Built for LeetCoders
      </div>
    </div>
  );
}

export default App;