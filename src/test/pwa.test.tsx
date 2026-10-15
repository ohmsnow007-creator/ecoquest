import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import viteConfig from '../../vite.config.ts?raw';
import { MemoryRouter } from 'react-router-dom';
import { Install } from '../pages/Install';
import { ConnectionBanner } from '../components/layout/ConnectionBanner';
import { pwaStore, initPwaListeners, promptInstall, detectBrowser } from '../services/pwaService';

const renderInstall = () => render(<MemoryRouter><Install /></MemoryRouter>);

function fakePrompt(outcome: 'accepted' | 'dismissed') {
  const e = new Event('beforeinstallprompt') as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
  e.prompt = () => Promise.resolve();
  e.userChoice = Promise.resolve({ outcome });
  return e;
}

beforeEach(() => {
  pwaStore.reset();
  initPwaListeners();
});
afterEach(cleanup);

describe('install prompt', () => {
  it('shows no install button when the browser never offered one', () => {
    renderInstall();
    expect(screen.queryByRole('button', { name: 'ติดตั้ง EcoQuest' })).not.toBeInTheDocument();
    expect(screen.getByText(/ทำตามขั้นตอนสำหรับ/)).toBeInTheDocument();
  });

  it('promptInstall reports unavailable without a browser prompt', async () => {
    expect(await promptInstall()).toBe('unavailable');
  });

  it('shows the button after beforeinstallprompt, and accepting does not claim success', async () => {
    renderInstall();
    act(() => void window.dispatchEvent(fakePrompt('accepted')));
    const btn = await screen.findByRole('button', { name: 'ติดตั้ง EcoQuest' });
    await act(async () => fireEvent.click(btn));
    expect(screen.getByText(/เบราว์เซอร์กำลังติดตั้ง/)).toBeInTheDocument();
    expect(screen.queryByText(/^ติดตั้งแล้ว/)).not.toBeInTheDocument();

    act(() => void window.dispatchEvent(new Event('appinstalled')));
    expect(screen.getByText(/ติดตั้งแล้ว/)).toBeInTheDocument();
  });

  it('dismissing returns to the manual steps', async () => {
    renderInstall();
    act(() => void window.dispatchEvent(fakePrompt('dismissed')));
    await act(async () => fireEvent.click(await screen.findByRole('button', { name: 'ติดตั้ง EcoQuest' })));
    expect(screen.getByText(/ยกเลิกการติดตั้งแล้ว/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'ติดตั้ง EcoQuest' })).not.toBeInTheDocument();
  });

  it('picks instructions by browser', () => {
    expect(detectBrowser('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit Safari/604.1', 5)).toBe('ios');
    expect(detectBrowser('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit Version/17.0 Safari/605.1.15', 5)).toBe('ios');
    expect(detectBrowser('Mozilla/5.0 (Linux; Android 14) AppleWebKit Chrome/128.0 Mobile Safari/537.36', 5)).toBe('android-chrome');
    expect(detectBrowser('Mozilla/5.0 (Linux; Android 14) SamsungBrowser/25.0 Chrome/121.0 Mobile Safari/537.36', 5)).toBe('android-samsung');
    expect(detectBrowser('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0', 0)).toBe('desktop-firefox');
    expect(detectBrowser('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit Chrome/128.0 Safari/537.36 Edg/128.0', 0)).toBe('desktop-chromium');
  });
});

describe('offline status', () => {
  it('banner appears only while offline, and the install page reports it', () => {
    render(<MemoryRouter><ConnectionBanner /></MemoryRouter>);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    act(() => void window.dispatchEvent(new Event('offline')));
    expect(screen.getByRole('status')).toHaveTextContent('ออฟไลน์อยู่');
    act(() => void window.dispatchEvent(new Event('online')));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('does not claim offline readiness before the service worker cached the app', () => {
    renderInstall();
    expect(screen.getByTestId('offline-ready')).toHaveTextContent('ยังไม่ได้เก็บไฟล์แอปไว้ในเครื่อง');
  });
});

describe('manifest config', () => {
  const config = viteConfig;
  const publicPngs = Object.keys(import.meta.glob('../../public/*.png')).map((k) => k.split('/').pop());
  it('declares names, colors, display, scope and PNG icons that exist', () => {
    for (const key of ['name:', 'short_name:', 'theme_color:', 'background_color:', "display: 'standalone'", 'start_url:', 'scope:']) {
      expect(config).toContain(key);
    }
    for (const icon of ['pwa-192x192.png', 'pwa-512x512.png', 'maskable-icon-512x512.png', 'apple-touch-icon-180x180.png']) {
      expect(config).toContain(icon);
      expect(publicPngs).toContain(icon);
    }
    expect(config).toContain("purpose: 'maskable'");
    expect(config).toContain('cleanupOutdatedCaches: true');
    expect(config).toContain("registerType: 'autoUpdate'");
    expect(config).toContain('skipWaiting: true');
  });
});
