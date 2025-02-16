import React from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { Plus, Trash2, Edit2, Gift, Users, Settings, Mail, Phone, Euro, Languages } from 'lucide-react';
import { Pagination } from './Pagination';

type Guest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  attending: boolean;
  guest_count: number;
  created_at: string;
};

type Gift = {
  id: string;
  name: string;
  url: string;
  price: number;
  purchased: boolean;
  purchased_by: string | null;
};

type Settings = {
  event_date: string;
  event_time_start: string;
  event_time_end: string;
  event_location: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  footer_text: string;
  footer_signature: string;
  registry_name: string;
  registry_url: string;
};

type EditingGuest = Partial<Guest> & { isNew?: boolean };
type EditingGift = Partial<Gift> & { isNew?: boolean };

const ITEMS_PER_PAGE = 6;

function AdminDashboard() {
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = React.useState<'guests' | 'gifts' | 'settings'>('guests');
  const [guests, setGuests] = React.useState<Guest[]>([]);
  const [gifts, setGifts] = React.useState<Gift[]>([]);
  const [editingGuest, setEditingGuest] = React.useState<EditingGuest | null>(null);
  const [editingGift, setEditingGift] = React.useState<EditingGift | null>(null);
  const [settings, setSettings] = React.useState<Settings>({
    event_date: '',
    event_time_start: '',
    event_time_end: '',
    event_location: '',
    hero_title: '',
    hero_subtitle: '',
    hero_image: '',
    footer_text: '',
    footer_signature: '',
    registry_name: '',
    registry_url: ''
  });
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = React.useState(false);
  const [guestsPage, setGuestsPage] = React.useState(1);
  const [giftsPage, setGiftsPage] = React.useState(1);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const [guestsResponse, giftsResponse, settingsResponse] = await Promise.all([
        supabase.from('guests').select('*').order('created_at', { ascending: false }),
        supabase.from('gift_registry').select('*').order('name'),
        supabase.from('settings').select('*')
      ]);

      if (guestsResponse.error) throw guestsResponse.error;
      if (giftsResponse.error) throw giftsResponse.error;
      if (settingsResponse.error) throw settingsResponse.error;

      setGuests(guestsResponse.data || []);
      setGifts(giftsResponse.data || []);

      if (settingsResponse.data) {
        const settingsObj: Record<string, string> = {};
        settingsResponse.data.forEach(setting => {
          settingsObj[setting.key] = setting.value;
        });
        setSettings(settingsObj as unknown as Settings);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message);
      
      if (err.message === 'Not authenticated') {
        window.location.href = '/login';
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (!confirm(t('dashboard.confirmDeleteGuest'))) return;

    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (err: any) {
      console.error('Error deleting guest:', err);
      setError(err.message);
    }
  };

  const handleDeleteGift = async (id: string) => {
    if (!confirm(t('dashboard.confirmDeleteGift'))) return;

    try {
      const { error } = await supabase
        .from('gift_registry')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (err: any) {
      console.error('Error deleting gift:', err);
      setError(err.message);
    }
  };

  const handleSaveGuest = async () => {
    if (!editingGuest) return;

    try {
      const guestData = {
        name: editingGuest.name || '',
        email: editingGuest.email || '',
        phone: editingGuest.phone || '',
        attending: editingGuest.attending || false,
        guest_count: editingGuest.guest_count || 1,
      };

      let error;
      if (editingGuest.isNew) {
        ({ error } = await supabase.from('guests').insert([guestData]));
      } else if (editingGuest.id) {
        ({ error } = await supabase
          .from('guests')
          .update(guestData)
          .eq('id', editingGuest.id));
      }

      if (error) throw error;
      setEditingGuest(null);
      loadData();
    } catch (err: any) {
      console.error('Error saving guest:', err);
      setError(err.message);
    }
  };

  const handleSaveGift = async () => {
    if (!editingGift) return;

    try {
      const giftData = {
        name: editingGift.name || '',
        url: editingGift.url || '',
        price: editingGift.price || 0,
        purchased: editingGift.purchased || false,
      };

      let error;
      if (editingGift.isNew) {
        ({ error } = await supabase.from('gift_registry').insert([giftData]));
      } else if (editingGift.id) {
        ({ error } = await supabase
          .from('gift_registry')
          .update(giftData)
          .eq('id', editingGift.id));
      }

      if (error) throw error;
      setEditingGift(null);
      loadData();
    } catch (err: any) {
      console.error('Error saving gift:', err);
      setError(err.message);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value),
      }));

      const { error } = await supabase
        .from('settings')
        .upsert(
          updates,
          { onConflict: 'key', ignoreDuplicates: false }
        );

      if (error) throw error;
      alert(t('settings.updateSuccess'));
    } catch (err: any) {
      console.error('Error updating settings:', err);
      setError(t('settings.updateError'));
    } finally {
      setIsSaving(false);
    }
  };

  const paginatedGuests = guests.slice(
    (guestsPage - 1) * ITEMS_PER_PAGE,
    guestsPage * ITEMS_PER_PAGE
  );

  const paginatedGifts = gifts.slice(
    (giftsPage - 1) * ITEMS_PER_PAGE,
    giftsPage * ITEMS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600">
          {t('common.loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('dashboard.title')}</h1>
          <p className="text-gray-600">
            {t('dashboard.description')}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
            title="Change Language"
          >
            <Languages className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-gray-700">
              {language === 'fr' ? 'Français' : 'English'}
            </span>
          </button>

          {isLanguageMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg p-2 z-50">
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setLanguage('fr');
                    setIsLanguageMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-sm rounded-lg text-left transition-colors ${
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
                    setIsLanguageMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-sm rounded-lg text-left transition-colors ${
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
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => setActiveTab('guests')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
            activeTab === 'guests'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Users className="w-5 h-5" />
          {t('dashboard.guestList')}
        </button>
        <button
          onClick={() => setActiveTab('gifts')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
            activeTab === 'gifts'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Gift className="w-5 h-5" />
          {t('dashboard.giftList')}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
            activeTab === 'settings'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Settings className="w-5 h-5" />
          {t('dashboard.settings')}
        </button>
      </div>

      {activeTab === 'guests' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setEditingGuest({ isNew: true })}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('common.add')} {t('dashboard.guest')}
            </button>
          </div>

          {editingGuest && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                <h3 className="text-xl font-semibold mb-4">
                  {editingGuest.isNew ? t('common.add') : t('common.edit')} {t('dashboard.guest')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('dashboard.name')}
                    </label>
                    <input
                      type="text"
                      value={editingGuest.name || ''}
                      onChange={(e) => setEditingGuest({ ...editingGuest, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('dashboard.email')}
                    </label>
                    <input
                      type="email"
                      value={editingGuest.email || ''}
                      onChange={(e) => setEditingGuest({ ...editingGuest, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('dashboard.phone')}
                    </label>
                    <input
                      type="tel"
                      value={editingGuest.phone || ''}
                      onChange={(e) => setEditingGuest({ ...editingGuest, phone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('dashboard.status')}
                    </label>
                    <select
                      value={editingGuest.attending ? 'yes' : 'no'}
                      onChange={(e) => setEditingGuest({ ...editingGuest, attending: e.target.value === 'yes' })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="yes">{t('dashboard.attending')}</option>
                      <option value="no">{t('dashboard.notAttending')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('dashboard.guestCount')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="4"
                      value={editingGuest.guest_count || 1}
                      onChange={(e) => setEditingGuest({ ...editingGuest, guest_count: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setEditingGuest(null)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleSaveGuest}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedGuests.map((guest) => (
              <div
                key={guest.id}
                className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{guest.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingGuest(guest)}
                      className="p-2 text-gray-600 hover:text-primary transition-colors rounded-lg hover:bg-gray-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGuest(guest.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {guest.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{guest.email}</span>
                    </div>
                  )}
                  {guest.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{guest.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        guest.attending
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {guest.attending ? t('dashboard.attending') : t('dashboard.notAttending')}
                    </span>
                    {guest.attending && (
                      <span className="text-sm text-gray-600">
                        ({guest.guest_count} {t('dashboard.guests')})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={guestsPage}
            totalItems={guests.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setGuestsPage}
          />
        </div>
      )}

      {activeTab === 'gifts' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setEditingGift({ isNew: true })}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('dashboard.addGift')}
            </button>
          </div>

          {editingGift && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                <h3 className="text-xl font-semibold mb-4">
                  {editingGift.isNew ? t('common.add') : t('common.edit')} {t('dashboard.gifts')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('dashboard.giftName')}
                    </label>
                    <input
                      type="text"
                      value={editingGift.name || ''}
                      onChange={(e) => setEditingGift({ ...editingGift, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('dashboard.giftUrl')}
                    </label>
                    <input
                      type="url"
                      value={editingGift.url || ''}
                      onChange={(e) => setEditingGift({ ...editingGift, url: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('dashboard.giftPrice')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editingGift.price || ''}
                      onChange={(e) => setEditingGift({ ...editingGift, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('dashboard.giftStatus')}
                    </label>
                    <select
                      value={editingGift.purchased ? 'yes' : 'no'}
                      onChange={(e) => setEditingGift({ ...editingGift, purchased: e.target.value === 'yes' })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="no">{t('dashboard.available')}</option>
                      <option value="yes">{t('dashboard.purchased')}</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setEditingGift(null)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleSaveGift}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedGifts.map((gift) => (
              <div
                key={gift.id}
                className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{gift.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingGift(gift)}
                      className="p-2 text-gray-600 hover:text-primary transition-colors rounded-lg hover:bg-gray-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGift(gift.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Euro className="w-4 h-4" />
                    <span className="text-sm">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(gift.price)}
                    </span>
                  </div>
                  {gift.url && (
                    <a
                      href={gift.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-dark transition-colors text-sm inline-flex items-center gap-1"
                    >
                      {t('dashboard.viewGift')} →
                    </a>
                  )}
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        gift.purchased
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {gift.purchased ? t('dashboard.purchased') : t('dashboard.available')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={giftsPage}
            totalItems={gifts.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setGiftsPage}
          />
        </div>
      )}

      {activeTab === 'settings' && (
        <form onSubmit={handleUpdateSettings} className="max-w-2xl mx-auto space-y-8">
          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t('settings.event.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.event.date')}
                </label>
                <input
                  type="date"
                  value={settings.event_date}
                  onChange={(e) =>
                    setSettings({ ...settings, event_date: e.target.value })
                  }
                  className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.event.location')}
                </label>
                <input
                  type="text"
                  value={settings.event_location}
                  onChange={(e) =>
                    setSettings({ ...settings, event_location: e.target.value })
                  }
                  className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.event.startTime')}
                </label>
                <input
                  type="time"
                  value={settings.event_time_start}
                  onChange={(e) =>
                    setSettings({ ...settings, event_time_start: e.target.value })
                  }
                  className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.event.endTime')}
                </label>
                <input
                  type="time"
                  value={settings.event_time_end}
                  onChange={(e) =>
                    setSettings({ ...settings, event_time_end: e.target.value })
                  }
                  className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t('settings.homepage.title')}
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.homepage.mainTitle')}
                </label>
                <input
                  type="text"
                  value={settings.hero_title}
                  onChange={(e) =>
                    setSettings({ ...settings, hero_title: e.target.value })
                  }
                  className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.homepage.subtitle')}
                </label>
                <input
                  type="text"
                  value={settings.hero_subtitle}
                  onChange={(e) =>
                    setSettings({ ...settings, hero_subtitle: e.target.value })
                  }
                  className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.homepage.backgroundImage')}
                </label>
                <input
                  type="url"
                  value={settings.hero_image}
                  onChange={(e) =>
                    setSettings({ ...settings, hero_image: e.target.value })
                  }
                  className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t('settings.registry.title')}
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.registry.name')}
                </label>
                <input
                  type="text"
                  value={settings.registry_name}
                  onChange={(e) =>
                    setSettings({ ...settings, registry_name: e.target.value })
                  }
                  className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Amazon, MyRegistry, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.registry.url')}
                </label>
                <input
                  type="url"
                  value={settings.registry_url}
                  onChange={(e) =>
                    setSettings({ ...settings, registry_url: e.target.value })
                  }
                  className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="https://www.amazon.fr/baby-reg/..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t('settings.footer.title')}
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.footer.text')}
                </label>
                <input
                  type="text"
                  value={settings.footer_text}
                  onChange={(e) =>
                    setSettings({ ...settings, footer_text: e.target.value })
                  }
                  className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.footer.signature')}
                </label>
                <input
                  type="text"
                  value={settings.footer_signature}
                  onChange={(e) =>
                    setSettings({ ...settings, footer_signature: e.target.value })
                  }
                  className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSaving ? t('settings.saving') : t('common.save')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AdminDashboard;