import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MonetarisLogo } from '../components/UI';
import { ArrowLeft, Shield } from 'lucide-react';

export const Datenschutz: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#020408] text-slate-900 dark:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#020408]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-monetaris-600 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Zurück</span>
          </button>
          <div className="flex items-center gap-2">
            <MonetarisLogo className="h-6 w-auto" />
            <span className="font-display font-bold">Monetaris</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-monetaris-100 dark:bg-monetaris-900/30 flex items-center justify-center">
            <Shield className="text-monetaris-600 dark:text-monetaris-400" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Datenschutzerklärung</h1>
            <p className="text-slate-500 dark:text-slate-400">Stand: Januar 2025</p>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">1. Verantwortlicher</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Verantwortlicher für die Datenverarbeitung auf dieser Website ist:
            </p>
            <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-4 mt-4">
              <p className="text-slate-700 dark:text-slate-300">
                Monetaris GmbH<br />
                Friedrichstraße 191<br />
                10117 Berlin<br />
                Deutschland<br /><br />
                E-Mail: datenschutz@monetaris.de<br />
                Telefon: +49 30 577 041 200
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">2. Erhebung und Speicherung personenbezogener Daten</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Beim Besuch unserer Website werden automatisch folgende Daten erhoben:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2">
              <li>IP-Adresse des anfragenden Rechners</li>
              <li>Datum und Uhrzeit des Zugriffs</li>
              <li>Name und URL der abgerufenen Datei</li>
              <li>Website, von der aus der Zugriff erfolgt (Referrer-URL)</li>
              <li>Verwendeter Browser und ggf. das Betriebssystem</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">3. Nutzung der Inkasso-Plattform</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Bei der Nutzung unserer Inkasso-Plattform verarbeiten wir folgende Kategorien personenbezogener Daten:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2">
              <li>Kontaktdaten (Name, Adresse, E-Mail, Telefonnummer)</li>
              <li>Forderungsdaten (Höhe, Fälligkeit, Rechtsgrund)</li>
              <li>Zahlungsinformationen</li>
              <li>Kommunikationsverlauf</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
              Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO zur Erfüllung eines Vertrags
              bzw. Art. 6 Abs. 1 lit. f DSGVO zur Wahrung berechtigter Interessen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">4. Ihre Rechte</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2">
              <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
              <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
              <li>Recht auf Löschung (Art. 17 DSGVO)</li>
              <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Recht auf Widerspruch (Art. 21 DSGVO)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">5. Datensicherheit</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Wir verwenden SSL-Verschlüsselung für eine sichere Datenübertragung. Alle Daten werden auf
              Servern in Deutschland gespeichert und unterliegen den strengen deutschen und europäischen
              Datenschutzgesetzen. Unsere Systeme entsprechen den höchsten Sicherheitsstandards der
              Finanzbranche.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">6. Kontakt</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Bei Fragen zum Datenschutz können Sie sich jederzeit an unseren Datenschutzbeauftragten wenden:
            </p>
            <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-4 mt-4">
              <p className="text-slate-700 dark:text-slate-300">
                E-Mail: datenschutz@monetaris.de
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/10 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-slate-500">
          © 2025 Monetaris GmbH. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
};
