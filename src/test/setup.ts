import '@testing-library/jest-dom/vitest';

// jsdom has no layout or scrolling; the app scrolls to the top when opening a page.
window.scrollTo = (() => {}) as typeof window.scrollTo;
