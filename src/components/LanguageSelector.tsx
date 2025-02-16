import React from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { Languages } from 'lucide-react';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Change Language"
      >
        <Languages className="w-5 h-5 text-primary" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg p-2 z-50">
          <div className="space-y-1">
            <button
              onClick={() => {
                setLanguage('fr');
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-sm rounded-lg text-left transition-colors ${
                language === 'fr'
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Français
            </button>
            <button
              onClick={() => {
                setLanguage('en');
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-sm rounded-lg text-left transition-colors ${
                language === 'en'
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              English
            </button>
          </div>
        </div>
      )}
    </div>
  );
}