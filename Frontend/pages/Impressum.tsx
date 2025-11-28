import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MonetarisLogo } from '../components/UI';
import { ArrowLeft, Building2 } from 'lucide-react';

export const Impressum: React.FC = () => {
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
            <Building2 className="text-monetaris-600 dark:text-monetaris-400" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Impressum</h1>
            <p className="text-slate-500 dark:text-slate-400">Angaben gemäß § 5 TMG</p>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Anbieter</h2>
            <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-6">
              <p className="text-slate-700 dark:text-slate-300 text-lg font-semibold mb-2">
                Monetaris GmbH
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Friedrichstraße 191<br />
                10117 Berlin<br />
                Deutschland
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Kontakt</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Telefon</p>
                <p className="text-slate-700 dark:text-slate-300 font-medium">+49 30 577 041 200</p>
              </div>
              <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">E-Mail</p>
                <p className="text-slate-700 dark:text-slate-300 font-medium">info@monetaris.de</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Vertretungsberechtigte</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Geschäftsführer: Dr. Alexander Weber, Julia Bergmann
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Registereintrag</h2>
            <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-4">
              <p className="text-slate-600 dark:text-slate-300">
                Eintragung im Handelsregister<br />
                Registergericht: Amtsgericht Berlin-Charlottenburg<br />
                Registernummer: HRB 221847 B
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Umsatzsteuer-ID</h2>
            <p className="text-slate-600 dark:text-slate-300">
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
              DE 341 285 671
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Aufsichtsbehörde</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Registriert als Inkassounternehmen gemäß § 10 Abs. 1 Nr. 1 RDG bei:<br /><br />
              Präsident des Landgerichts Berlin<br />
              Littenstraße 12-17<br />
              10179 Berlin
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Berufsrechtliche Regelungen</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Berufsbezeichnung: Inkassodienstleister<br />
              Zuständige Kammer: Keine Kammerzugehörigkeit<br />
              Berufsrechtliche Regelungen: Rechtsdienstleistungsgesetz (RDG)
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Streitschlichtung</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
            </p>
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-monetaris-600 dark:text-monetaris-400 hover:underline"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Haftung für Inhalte</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
              Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
              Tätigkeit hinweisen.
            </p>
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
