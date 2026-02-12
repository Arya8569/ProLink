import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 'normal',
    contrast: 'normal',
    reducedMotion: false
  });

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    // Apply settings to document
    const root = document.documentElement;
    
    // Font size
    root.classList?.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
    switch (settings?.fontSize) {
      case 'small': root.classList?.add('text-sm');
        break;
      case 'large': root.classList?.add('text-lg');
        break;
      case 'extra-large': root.classList?.add('text-xl');
        break;
      default:
        root.classList?.add('text-base');
    }
    
    // Contrast
    root.classList?.remove('high-contrast');
    if (settings?.contrast === 'high') {
      root.classList?.add('high-contrast');
    }
    
    // Reduced motion
    if (settings?.reducedMotion) {
      root.style?.setProperty('--animation-duration', '0s');
    } else {
      root.style?.removeProperty('--animation-duration');
    }
    
    // Save to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings({
      fontSize: 'normal',
      contrast: 'normal',
      reducedMotion: false
    });
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card"
        aria-label="Accessibility menu"
      >
        <Icon name="Settings" size={20} />
      </Button>
      {isOpen && (
        <div className="absolute top-14 right-0 w-80 bg-card border border-border rounded-lg shadow-prominent p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Accessibility</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8"
            >
              <Icon name="X" size={16} />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Font Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'small', label: 'Small' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'large', label: 'Large' },
                  { value: 'extra-large', label: 'Extra Large' }
                ]?.map((option) => (
                  <Button
                    key={option?.value}
                    variant={settings?.fontSize === option?.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSettingChange('fontSize', option?.value)}
                    className="text-xs"
                  >
                    {option?.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Contrast */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Contrast
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'normal', label: 'Normal' },
                  { value: 'high', label: 'High Contrast' }
                ]?.map((option) => (
                  <Button
                    key={option?.value}
                    variant={settings?.contrast === option?.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSettingChange('contrast', option?.value)}
                    className="text-xs"
                  >
                    {option?.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Reduced Motion */}
            <div>
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Reduce Motion</span>
                <Button
                  variant={settings?.reducedMotion ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSettingChange('reducedMotion', !settings?.reducedMotion)}
                  className="text-xs"
                >
                  {settings?.reducedMotion ? 'On' : 'Off'}
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Reduces animations and transitions
              </p>
            </div>

            {/* Reset Button */}
            <div className="pt-4 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetSettings}
                className="w-full text-xs"
              >
                <Icon name="RotateCcw" size={14} className="mr-2" />
                Reset to defaults
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default AccessibilityMenu;