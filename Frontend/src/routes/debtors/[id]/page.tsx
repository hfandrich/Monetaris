import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDebtor } from '@/entities/debtor';
import { DebtorDetailHeader } from '@/entities/debtor';
import { PageHeader, Button } from '@/shared/components/ui';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

export default function DebtorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { debtor, loading, error } = useDebtor(id || '');

  if (loading) {
    return <div className="p-4">Laden...</div>;
  }

  if (error || !debtor) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded">
        Fehler beim Laden: {error || 'Schuldner nicht gefunden'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${debtor.firstName} ${debtor.lastName}`}
        subtitle={`Schuldner-ID: ${debtor.id}`}
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/debtors')}>
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

      <DebtorDetailHeader debtor={debtor} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Additional detail sections would go here */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-4">Weitere Details</h3>
            <p className="text-gray-500">Weitere Detailkomponenten werden hier angezeigt.</p>
          </div>
        </div>

        <div>
          {/* Sidebar content would go here */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-4">Aktionen</h3>
            <p className="text-gray-500">Schnellaktionen werden hier angezeigt.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
