import React from 'react';
import { Heart, Gift, Calendar, MapPin, Clock, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

function PublicPage() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [attending, setAttending] = React.useState<'yes' | 'no' | null>(null);
  const [guests, setGuests] = React.useState(1);
  const [formError, setFormError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  const inputClasses = "mt-1 block w-full px-4 py-3 rounded-lg border border-sage-200 bg-white/50 backdrop-blur-sm shadow-sm transition-all duration-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 focus:ring-opacity-50 focus:outline-none hover:border-sage-300";
  const labelClasses = "block text-sm font-medium text-sage-700 mb-1";

  return (
    <>
      {/* Hero Section */}
      <div 
        className="h-[60vh] bg-cover bg-center relative"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1558244661-d248897f7bc4?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80")'
        }}
      >
        <div className="absolute inset-0 bg-sage-100/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
            <Heart className="w-16 h-16 text-sage-600 mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
              Bienvenue Bébé Sawadogo
            </h1>
            <p className="text-xl md:text-2xl text-gray-600">
              Rejoignez-nous pour célébrer notre petit miracle
            </p>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <Calendar className="w-8 h-8 text-sage-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800">Date</h3>
            <p className="text-gray-600">15 Mars 2025</p>
          </div>
          <div className="text-center">
            <Clock className="w-8 h-8 text-sage-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800">Heure</h3>
            <p className="text-gray-600">14h30 - 18h00</p>
          </div>
          <div className="text-center">
            <MapPin className="w-8 h-8 text-sage-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800">Lieu</h3>
            <p className="text-gray-600">À confirmer</p>
          </div>
        </div>
      </div>

      {/* Registry Section */}
      <div className="bg-sage-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Gift className="w-12 h-12 text-sage-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Liste de Naissance</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Votre présence est notre plus beau cadeau, mais si vous souhaitez offrir quelque chose,
              nous avons créé une liste de naissance sur MyRegistry :
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <a
              href="https://www.myregistry.com/default.aspx?cloc=ca&lang=fr"
              className="block bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Registre</h3>
              <p className="text-sage-600 mt-2">Voir la Liste →</p>
            </a>
          </div>
        </div>
      </div>

      {/* RSVP Form */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <Send className="w-12 h-12 text-sage-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">RSVP</h2>
            <p className="text-gray-600">Merci de nous indiquer si vous pourrez être présent à notre célébration</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8 bg-white/40 backdrop-blur-sm p-8 rounded-xl shadow-sm">
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
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setAttending('yes')}
                  className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 ${
                    attending === 'yes'
                      ? 'bg-sage-600 text-white shadow-md'
                      : 'bg-white border border-sage-200 text-gray-700 hover:border-sage-300 hover:bg-sage-50'
                  }`}
                >
                  Oui
                </button>
                <button
                  type="button"
                  onClick={() => setAttending('no')}
                  className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 ${
                    attending === 'no'
                      ? 'bg-sage-600 text-white shadow-md'
                      : 'bg-white border border-sage-200 text-gray-700 hover:border-sage-300 hover:bg-sage-50'
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
              className="w-full bg-sage-600 text-white py-3 px-6 rounded-lg shadow-md hover:bg-sage-700 hover:shadow-lg transition-all duration-200 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer la réponse'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-sage-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>Avec amour,</p>
          <p className="font-semibold">La Famille Sawadogo</p>
        </div>
      </footer>
    </>
  );
}

export default PublicPage;