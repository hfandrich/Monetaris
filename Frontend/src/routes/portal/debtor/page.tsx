import React from 'react';
import { useAuth } from '@/entities/auth';
import { PageHeader, Button, Card } from '@/shared/components/ui';
import { FileText, CreditCard, Download, Mail } from 'lucide-react';

export default function DebtorPortalPage() {
  const { user } = useAuth();

  if (!user || user.role !== 'DEBTOR') {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded">
        Zugriff verweigert. Bitte melden Sie sich als Schuldner an.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Schuldnerportal"
        subtitle={`Willkommen, ${user.firstName} ${user.lastName}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded">
              <FileText size={24} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Meine Forderungen</h3>
              <p className="text-sm text-gray-600">
                Übersicht offener Forderungen und Mahnverfahren
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-50 rounded">
              <CreditCard size={24} className="text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Zahlung</h3>
              <p className="text-sm text-gray-600">
                Offene Beträge bezahlen oder Ratenzahlung beantragen
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-50 rounded">
              <Download size={24} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Dokumente</h3>
              <p className="text-sm text-gray-600">
                Mahnungen, Bescheide und Zahlungsbestätigungen
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-50 rounded">
              <Mail size={24} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Kontakt</h3>
              <p className="text-sm text-gray-600">
                Nachricht an Sachbearbeiter senden
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="font-semibold mb-4">Aktuelle Hinweise</h3>
        <p className="text-gray-500">
          Hier werden wichtige Informationen zu Ihren Forderungen angezeigt.
        </p>
      </div>
    </div>
  );
}
