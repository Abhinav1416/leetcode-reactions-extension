import { createRoot } from "react-dom/client";
import { DEFAULT_GIFS } from "../constants";
import { GifItem } from "../types";

const Overlay = ({ url, onClose }: { url: string; onClose: () => void }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999999,
        backdropFilter: "blur(5px)",
      }}
      onClick={onClose}
    >
      <div style={{ position: "relative" }}>
        <img
          src={url}
          alt="Success!"
          style={{
            maxWidth: "80vw",
            maxHeight: "80vh",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          }}
        />
        <div
          style={{
            color: "white",
            marginTop: "12px",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
            fontWeight: "bold",
            fontSize: "24px",
            textShadow: "0 2px 4px rgba(0,0,0,0.5)",
          }}
        >
          Accepted! 🎉
        </div>
      </div>
    </div>
  );
};

let hasCelebrated = false;

function showSuccessOverlay() {
  chrome.storage.sync.get(["gifs", "masterSwitch"], (result) => {
    if (result.masterSwitch === false) return;

    const allGifs: GifItem[] = (result.gifs as GifItem[]) || DEFAULT_GIFS;
    const enabledGifs = allGifs.filter((g) => g.enabled);

    if (enabledGifs.length === 0) return;

    const randomGif = enabledGifs[Math.floor(Math.random() * enabledGifs.length)];

    const container = document.createElement("div");
    container.id = "leetcode-reactions-overlay";
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(
      <Overlay
        url={randomGif.url}
        onClose={() => {
          root.unmount();
          container.remove();
        }}
      />
    );

    setTimeout(() => {
      if (document.body.contains(container)) {
        root.unmount();
        container.remove();
      }
    }, 4000);
  });
}

setInterval(() => {
  const successSelectors = [
    "[data-e2e-locator='submission-result-success-text-container']",
    ".text-green-s",
    "span[class*='text-green']"
  ];

  let successElement = null;
  for (const selector of successSelectors) {
    const el = document.querySelector(selector);
    if (el) {
      successElement = el;
      break;
    }
  }

  if (successElement && successElement.textContent?.includes("Accepted")) {
    if (!hasCelebrated) {
      showSuccessOverlay();
      hasCelebrated = true;
    }
  } else {
    hasCelebrated = false;
  }

}, 1000);

console.log("LeetCode Reactions: v1.1 Polling optimized with state check");