import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    // Ensure documentElement starts clean for each test
    document.documentElement.classList.remove('dark');
    localStorage.clear();
    service = new ThemeService();
  });

  it('enables dark mode and persists preference', () => {
    service.enableDarkMode();
    expect(document.documentElement.classList.contains('dark')).toBeTrue();
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(service.isDarkMode()).toBeTrue();
  });

  it('disables dark mode and persists preference', () => {
    service.enableDarkMode();
    service.disableDarkMode();
    expect(document.documentElement.classList.contains('dark')).toBeFalse();
    expect(localStorage.getItem('theme')).toBe('light');
    expect(service.isDarkMode()).toBeFalse();
  });

  it('toggle switches between themes', () => {
    service.toggleDarkMode();
    expect(service.isDarkMode()).toBeTrue();
    service.toggleDarkMode();
    expect(service.isDarkMode()).toBeFalse();
  });
});
