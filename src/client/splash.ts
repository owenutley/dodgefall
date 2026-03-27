import { requestExpandedMode, context } from '@devvit/web/client';

const startButton = document.getElementById('start-button') as HTMLButtonElement;
const titleEl = document.getElementById('title') as HTMLSpanElement;

titleEl.textContent = context.username ?? 'anonymous';

startButton.addEventListener('click', (e) => {
  requestExpandedMode(e, 'game');
});