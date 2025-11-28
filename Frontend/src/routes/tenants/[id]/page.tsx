import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenant } from '@/entities/tenant';
import { TenantDetailHeader, TenantStats } from '@/entities/tenant';
import { PageHeader, Button } from '@/shared/components/ui';
import { ArrowLeft, Edit, Trash2, Users, FileText } from 'lucide-react';

export default function TenantDetailPage() {
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
            <Button variant="ghost" onClick={() => navigate('/tenants')}>
              <ArrowLeft size={16} /> Zurück
            </Button>
            <Button variant="secondary">
              <Edit size={16} /> Bearbeiten
            </Button>
            <Button variant="danger">
              <Trash2 size={16} /> Löschen
            </Button>
          </div>
        }
      />

      <TenantDetailHeader tenant={tenant} />

      <TenantStats tenantId={tenant.id} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users size={20} />
              Benutzer
            </h3>
            <p className="text-gray-500">Benutzer dieses Mandanten werden hier angezeigt.</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText size={20} />
              Forderungen
            </h3>
            <p className="text-gray-500">Forderungen dieses Mandanten werden hier angezeigt.</p>
          </div>
        </div>

        <div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-4">Systemeinstellungen</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2 font-medium">
                  {tenant.isActive ? 'Aktiv' : 'Inaktiv'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Erstellt:</span>
                <span className="ml-2 font-medium">
                  {new Date(tenant.createdAt).toLocaleDateString('de-DE')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
