import React from 'react';
import { useTheme } from '../lib/theme/ThemeContext';
import { Palette } from 'lucide-react';
import { supabase } from '../lib/supabase';

const colorPresets = [
  {
    name: 'Sage',
    colors: {
      primary: '#4c584c',
      secondary: '#637363',
      accent: '#a3b1a3',
      background: '#f6f7f6',
      text: '#2d312d',
    },
  },
  {
    name: 'Ocean',
    colors: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#93c5fd',
      background: '#f0f9ff',
      text: '#1e3a8a',
    },
  },
  {
    name: 'Rose',
    colors: {
      primary: '#9d174d',
      secondary: '#db2777',
      accent: '#fbcfe8',
      background: '#fff1f2',
      text: '#831843',
    },
  },
];

export function ThemeCustomizer() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const applyPreset = async (preset: typeof colorPresets[0]) => {
    setTheme({
      ...theme,
      colors: preset.colors,
    });

    try {
      const { error } = await supabase
        .from('settings')
        .upsert(
          { 
            key: 'theme_colors', 
            value: JSON.stringify(preset.colors)
          },
          { 
            onConflict: 'key',
            ignoreDuplicates: false 
          }
        );
      
      if (error) throw error;
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving theme settings:', error);
      alert('Error saving theme settings');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Choose Theme"
      >
        <Palette className="w-5 h-5 text-primary" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg p-4 z-50">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-text mb-2">Color Theme</h3>
            <div className="grid gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="p-2 text-sm rounded-lg hover:bg-gray-100 transition-colors text-left flex items-center gap-2"
                >
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: preset.colors.primary }}
                  />
                  <span style={{ color: preset.colors.text }}>
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}