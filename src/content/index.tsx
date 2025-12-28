import { createRoot } from 'react-dom/client';
import Overlay from './components/Overlay';

console.log("LeetCode GIF Reactions: Content script active!");

const rootDiv = document.createElement('div');
rootDiv.id = 'leetcode-reaction-root';
document.body.appendChild(rootDiv);
createRoot(rootDiv).render(<Overlay />);

let isSubmitting = false;

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const submitBtn = target.closest('[data-e2e-locator="console-submit-button"]');
  
  if (submitBtn || target.textContent?.includes("Submit")) {
    console.log("🖱️ Submit clicked - Watching for Accepted...");
    isSubmitting = true;
  }
}, { capture: true });

const observer = new MutationObserver(() => {
  if (!isSubmitting) return;

  const bodyText = document.body.innerText.toLowerCase();

  if (bodyText.includes("pending") || bodyText.includes("judging") || bodyText.includes("running")) {
    return;
  }

  const successElement = document.querySelector('[class*="text-green"]');
  const hasSuccessText = bodyText.includes("accepted");

  if (successElement && hasSuccessText) {
    console.log("✅ ACCEPTED DETECTED");
    isSubmitting = false; 
    window.dispatchEvent(new CustomEvent('LEETCODE_VERDICT', { detail: 'ac' }));
  }
});

observer.observe(document.body, { childList: true, subtree: true });