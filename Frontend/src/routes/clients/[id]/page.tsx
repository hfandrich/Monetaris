import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenant } from '@/entities/tenant';
import { TenantDetailHeader, TenantStats } from '@/entities/tenant';
import { PageHeader, Button } from '@/shared/components/ui';
import { ArrowLeft, Edit, Settings } from 'lucide-react';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenant, loading, error } = useTenant(id || '');

  if (loading) {
    return <div className="p-4">Laden...</div>;
  }

  if (error || !tenant) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded">
        Fehler beim Laden: {error || 'Mandant nicht gefunden'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={tenant.name}
        subtitle={`Mandanten-ID: ${tenant.id}`}
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/clients')}>
              <ArrowLeft size={16} /> Zurück
            </Button>
            <Button variant="secondary">
              <Edit size={16} /> Bearbeiten
            </Button>
            <Button variant="secondary">
              <Settings size={16} /> Einstellungen
            </Button>
          </div>
        }
      />

      <TenantDetailHeader tenant={tenant} />

      <TenantStats tenantId={tenant.id} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-4">Forderungsübersicht</h3>
            <p className="text-gray-500">Forderungen und Vorgänge werden hier angezeigt.</p>
          </div>
        </div>

        <div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-4">Kontaktinformationen</h3>
            <p className="text-gray-500">Kontaktdaten werden hier angezeigt.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
