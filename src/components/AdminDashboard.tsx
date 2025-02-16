import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Gift, LogOut, Plus, Trash2, Check, X, Edit2, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Guest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  attending: boolean;
  guest_count: number;
  created_at: string;
};

type GiftItem = {
  id: string;
  name: string;
  url: string;
  price: number;
  purchased: boolean;
  purchased_by: string | null;
  created_at: string;
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'guests' | 'gifts'>('guests');
  const [guests, setGuests] = React.useState<Guest[]>([]);
  const [gifts, setGifts] = React.useState<GiftItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [newGift, setNewGift] = React.useState({ name: '', url: '', price: '' });
  const [showAddGift, setShowAddGift] = React.useState(false);
  const [editingGuest, setEditingGuest] = React.useState<string | null>(null);
  const [editedGuest, setEditedGuest] = React.useState<Partial<Guest>>({});

  React.useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [guestsResponse, giftsResponse] = await Promise.all([
        supabase.from('guests').select('*').order('created_at', { ascending: false }),
        supabase.from('gift_registry').select('*').order('created_at', { ascending: true })
      ]);

      if (guestsResponse.data) setGuests(guestsResponse.data);
      if (giftsResponse.data) setGifts(giftsResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleAddGift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('gift_registry').insert([
        {
          name: newGift.name,
          url: newGift.url,
          price: parseFloat(newGift.price),
        },
      ]);

      if (error) throw error;

      setNewGift({ name: '', url: '', price: '' });
      setShowAddGift(false);
      loadData();
    } catch (error) {
      console.error('Error adding gift:', error);
    }
  };

  const handleDeleteGift = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cadeau ?')) {
      try {
        const { error } = await supabase
          .from('gift_registry')
          .delete()
          .eq('id', id);

        if (error) throw error;
        loadData();
      } catch (error) {
        console.error('Error deleting gift:', error);
      }
    }
  };

  const handleToggleGiftPurchased = async (id: string, purchased: boolean) => {
    try {
      const { error } = await supabase
        .from('gift_registry')
        .update({ purchased })
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error updating gift:', error);
    }
  };

  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest.id);
    setEditedGuest(guest);
  };

  const handleSaveGuest = async () => {
    if (!editingGuest || !editedGuest) return;

    try {
      const { error } = await supabase
        .from('guests')
        .update(editedGuest)
        .eq('id', editingGuest);

      if (error) throw error;
      setEditingGuest(null);
      setEditedGuest({});
      loadData();
    } catch (error) {
      console.error('Error updating guest:', error);
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet invité ?')) {
      try {
        const { error } = await supabase
          .from('guests')
          .delete()
          .eq('id', id);

        if (error) throw error;
        loadData();
      } catch (error) {
        console.error('Error deleting guest:', error);
      }
    }
  };

  const totalAttending = guests.reduce((sum, guest) => {
    return guest.attending ? sum + guest.guest_count : sum;
  }, 0);

  const totalGifts = gifts.length;
  const purchasedGifts = gifts.filter(gift => gift.purchased).length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 text-sage-600 hover:text-sage-700"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-sage-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Invités Confirmés</h3>
              <p className="text-2xl font-bold text-sage-600">{totalAttending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <Gift className="w-8 h-8 text-sage-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Cadeaux</h3>
              <p className="text-2xl font-bold text-sage-600">
                {purchasedGifts}/{totalGifts}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('guests')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'guests'
                ? 'border-sage-600 text-sage-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Liste des Invités
          </button>
          <button
            onClick={() => setActiveTab('gifts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'gifts'
                ? 'border-sage-600 text-sage-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Liste de Naissance
          </button>
        </nav>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Chargement...</p>
        </div>
      ) : (
        <>
          {activeTab === 'guests' && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invités
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {guests.map((guest) => (
                    <tr key={guest.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingGuest === guest.id ? (
                          <input
                            type="text"
                            value={editedGuest.name || ''}
                            onChange={(e) => setEditedGuest({ ...editedGuest, name: e.target.value })}
                            className="w-full px-2 py-1 border rounded"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingGuest === guest.id ? (
                          <div className="space-y-2">
                            <input
                              type="email"
                              value={editedGuest.email || ''}
                              onChange={(e) => setEditedGuest({ ...editedGuest, email: e.target.value })}
                              className="w-full px-2 py-1 border rounded"
                              placeholder="Email"
                            />
                            <input
                              type="tel"
                              value={editedGuest.phone || ''}
                              onChange={(e) => setEditedGuest({ ...editedGuest, phone: e.target.value })}
                              className="w-full px-2 py-1 border rounded"
                              placeholder="Téléphone"
                            />
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            {guest.email && <div>{guest.email}</div>}
                            
                            {guest.phone && <div>{guest.phone}</div>}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingGuest === guest.id ? (
                          <select
                            value={editedGuest.attending ? 'true' : 'false'}
                            onChange={(e) => setEditedGuest({ ...editedGuest, attending: e.target.value === 'true' })}
                            className="w-full px-2 py-1 border rounded"
                          >
                            <option value="true">Présent</option>
                            <option value="false">Absent</option>
                          </select>
                        ) : (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            guest.attending
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {guest.attending ? 'Présent' : 'Absent'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingGuest === guest.id ? (
                          <input
                            type="number"
                            value={editedGuest.guest_count || 0}
                            onChange={(e) => setEditedGuest({ ...editedGuest, guest_count: parseInt(e.target.value) })}
                            className="w-full px-2 py-1 border rounded"
                            min="1"
                            max="4"
                          />
                        ) : (
                          <div className="text-sm text-gray-500">{guest.guest_count}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {editingGuest === guest.id ? (
                            <button
                              onClick={handleSaveGuest}
                              className="p-1 text-sage-600 hover:text-sage-700 rounded-full"
                            >
                              <Save className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEditGuest(guest)}
                              className="p-1 text-sage-600 hover:text-sage-700 rounded-full"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteGuest(guest.id)}
                            className="p-1 text-red-600 hover:text-red-700 rounded-full"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'gifts' && (
            <div>
              <div className="mb-6">
                <button
                  onClick={() => setShowAddGift(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un cadeau</span>
                </button>
              </div>

              {showAddGift && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <form onSubmit={handleAddGift} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom du cadeau</label>
                      <input
                        type="text"
                        value={newGift.name}
                        onChange={(e) => setNewGift(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-sage-500 focus:border-sage-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">URL</label>
                      <input
                        type="url"
                        value={newGift.url}
                        onChange={(e) => setNewGift(prev => ({ ...prev, url: e.target.value }))}
                        className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-sage-500 focus:border-sage-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Prix</label>
                      <input
                        type="number"
                        value={newGift.price}
                        onChange={(e) => setNewGift(prev => ({ ...prev, price: e.target.value }))}
                        className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-sage-500 focus:border-sage-500"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => setShowAddGift(false)}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700"
                      >
                        Ajouter
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cadeau
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {gifts.map((gift) => (
                      <tr key={gift.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{gift.name}</div>
                          {gift.url && (
                            <a
                              href={gift.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-sage-600 hover:text-sage-700"
                            >
                              Voir →
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {gift.price.toFixed(2)} €
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            gift.purchased
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {gift.purchased ? 'Acheté' : 'Disponible'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleGiftPurchased(gift.id, !gift.purchased)}
                              className={`p-1 rounded-full ${
                                gift.purchased
                                  ? 'text-green-600 hover:text-green-700'
                                  : 'text-gray-400 hover:text-gray-500'
                              }`}
                            >
                              {gift.purchased ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                            </button>
                            <button
                              onClick={() => handleDeleteGift(gift.id)}
                              className="p-1 text-red-600 hover:text-red-700 rounded-full"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminDashboard;