import React from 'react';
import { useAuth } from '@/entities/auth';
import { PageHeader, Button, Card } from '@/shared/components/ui';
import { FileText, Upload, BarChart3, Settings } from 'lucide-react';

export default function ClientPortalPage() {
  const { user } = useAuth();

  if (!user || user.role !== 'CLIENT') {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded">
        Zugriff verweigert. Bitte melden Sie sich als Mandant an.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Mandantenportal"
        subtitle={`Willkommen, ${user.firstName} ${user.lastName}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded">
              <FileText size={24} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Meine Fälle</h3>
              <p className="text-sm text-gray-600">
                Übersicht eingereichte Forderungen und deren Status
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-50 rounded">
              <Upload size={24} className="text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Forderung einreichen</h3>
              <p className="text-sm text-gray-600">
                Neue Forderung zur Bearbeitung einreichen
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-50 rounded">
              <BarChart3 size={24} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Statistiken</h3>
              <p className="text-sm text-gray-600">
                Erfolgsquote und finanzielle Übersicht
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-50 rounded">
              <Settings size={24} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Einstellungen</h3>
              <p className="text-sm text-gray-600">
                Kontaktdaten und Benachrichtigungen verwalten
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="font-semibold mb-4">Neueste Aktivitäten</h3>
        <p className="text-gray-500">
          Hier werden die neuesten Aktivitäten zu Ihren Fällen angezeigt.
        </p>
      </div>
    </div>
  );
}
