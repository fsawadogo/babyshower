import React from 'react';
import { Heart, Gift, Calendar, MapPin, Clock, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

type EventSettings = {
  event_date: string;
  event_time_start: string;
  event_time_end: string;
  event_location: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  footer_text: string;
  footer_signature: string;
};

function PublicPage() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [attending, setAttending] = React.useState<'yes' | 'no' | null>(null);
  const [guests, setGuests] = React.useState(1);
  const [formError, setFormError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [settings, setSettings] = React.useState<EventSettings>({
    event_date: '2025-03-15',
    event_time_start: '14:30',
    event_time_end: '18:00',
    event_location: 'À confirmer',
    hero_title: 'Bienvenue Bébé Sawadogo',
    hero_subtitle: 'Rejoignez-nous pour célébrer notre petit miracle',
    hero_image: 'https://images.unsplash.com/photo-1558244661-d248897f7bc4?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80',
    footer_text: 'Avec amour,',
    footer_signature: 'La Famille Sawadogo'
  });

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*');

      if (error) throw error;

      if (data) {
        const settingsObj: Record<string, string> = {};
        data.forEach(setting => {
          settingsObj[setting.key] = setting.value;
        });
        setSettings(settingsObj as unknown as EventSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    if (!email && !phone) {
      setFormError('Veuillez fournir au moins un email ou un numéro de téléphone');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.from('guests').insert([
        {
          name,
          email,
          phone,
          attending: attending === 'yes',
          guest_count: attending === 'yes' ? guests : 0,
        },
      ]);

      if (error) throw error;

      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setAttending(null);
      setGuests(1);
      alert('Merci pour votre réponse !');
    } catch (err: any) {
      setFormError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm shadow-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-gray-200 focus:outline-none hover:border-primary";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <>
      {/* Hero Section */}
      <div 
        className="min-h-[60vh] md:h-[60vh] bg-cover bg-center relative"
        style={{
          backgroundImage: `url("${settings.hero_image}")`,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm">
          <div className="container mx-auto px-4 h-full flex flex-col items-center justify-center text-center py-12 md:py-0">
            <Heart className="w-12 h-12 md:w-16 md:h-16 text-primary mb-4 md:mb-6" />
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 md:mb-4 leading-tight">
              {settings.hero_title}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 px-4 max-w-3xl">
              {settings.hero_subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          <div className="text-center bg-white/50 backdrop-blur-sm p-4 md:p-6 rounded-lg shadow-sm">
            <Calendar className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800 mb-2">Date</h3>
            <p className="text-gray-600">{formatDate(settings.event_date)}</p>
          </div>
          <div className="text-center bg-white/50 backdrop-blur-sm p-4 md:p-6 rounded-lg shadow-sm">
            <Clock className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800 mb-2">Heure</h3>
            <p className="text-gray-600">{settings.event_time_start} - {settings.event_time_end}</p>
          </div>
          <div className="text-center bg-white/50 backdrop-blur-sm p-4 md:p-6 rounded-lg shadow-sm">
            <MapPin className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800 mb-2">Lieu</h3>
            <p className="text-gray-600">{settings.event_location}</p>
          </div>
        </div>
      </div>

      {/* Registry Section */}
      <div className="bg-white/50 py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-12">
            <Gift className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Liste de Naissance</h2>
            <p className="text-gray-600 max-w-2xl mx-auto px-4">
              Votre présence est notre plus beau cadeau, mais si vous souhaitez offrir quelque chose,
              nous avons créé une liste de naissance sur Amazon :
            </p>
          </div>
          <div className="max-w-md mx-auto px-4">
            <a
              href="#"
              className="block bg-white p-6 md:p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center active:transform active:scale-[0.98]"
            >
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">Amazon</h3>
              <p className="text-primary mt-2">Voir la Liste →</p>
            </a>
          </div>
        </div>
      </div>

      {/* RSVP Form */}
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-6 md:mb-12">
            <Send className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">RSVP</h2>
            <p className="text-gray-600 px-4">Merci de nous indiquer si vous pourrez être présent à notre célébration</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 bg-white/40 backdrop-blur-sm p-4 md:p-8 rounded-xl shadow-sm mx-4 md:mx-0">
            <div>
              <label htmlFor="name" className={labelClasses}>
                Nom
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClasses}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className={labelClasses}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClasses}
                  placeholder="Optionnel si téléphone fourni"
                />
              </div>
              <div>
                <label htmlFor="phone" className={labelClasses}>
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClasses}
                  placeholder="Optionnel si email fourni"
                />
              </div>
            </div>
            {formError && (
              <p className="text-red-500 text-sm mt-1">{formError}</p>
            )}
            <div>
              <label className={labelClasses}>
                Serez-vous présent ?
              </label>
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setAttending('yes')}
                  className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 active:transform active:scale-[0.98] ${
                    attending === 'yes'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-primary hover:bg-gray-50'
                  }`}
                >
                  Oui
                </button>
                <button
                  type="button"
                  onClick={() => setAttending('no')}
                  className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 active:transform active:scale-[0.98] ${
                    attending === 'no'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-primary hover:bg-gray-50'
                  }`}
                >
                  Non
                </button>
              </div>
            </div>
            {attending === 'yes' && (
              <div>
                <label htmlFor="guests" className={labelClasses}>
                  Nombre d'invités
                </label>
                <select
                  id="guests"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className={inputClasses}
                >
                  {[1, 2, 3, 4].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-3 px-6 rounded-lg shadow-md hover:bg-primary/90 transition-all duration-200 mt-6 disabled:opacity-50 active:transform active:scale-[0.98]"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer la réponse'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>{settings.footer_text}</p>
          <p className="font-semibold">{settings.footer_signature}</p>
        </div>
      </footer>
    </>
  );
}

export default PublicPage;