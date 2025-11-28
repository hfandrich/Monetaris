import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Button } from '@/shared/components/ui';
import { Plus, Filter, Download } from 'lucide-react';

export default function ClaimsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  // Note: Case entity hooks will be used here when available
  // For now, this is a placeholder structure

  return (
    <div className="space-y-8">
      <PageHeader
        title="Forderungsmanagement"
        subtitle="Inkassovorgänge & Mahnverfahren"
        action={
          <div className="flex gap-2">
            <Button variant="ghost">
              <Filter size={16} /> Filter
            </Button>
            <Button variant="ghost">
              <Download size={16} /> Export
            </Button>
            <Button variant="primary">
              <Plus size={16} /> Neue Forderung
            </Button>
          </div>
        }
      />

      <div className="flex gap-2 mb-6">
        <Button
          variant={statusFilter === 'all' ? 'primary' : 'ghost'}
          onClick={() => setStatusFilter('all')}
        >
          Alle
        </Button>
        <Button
          variant={statusFilter === 'active' ? 'primary' : 'ghost'}
          onClick={() => setStatusFilter('active')}
        >
          Aktiv
        </Button>
        <Button
          variant={statusFilter === 'pending' ? 'primary' : 'ghost'}
          onClick={() => setStatusFilter('pending')}
        >
          In Bearbeitung
        </Button>
        <Button
          variant={statusFilter === 'closed' ? 'primary' : 'ghost'}
          onClick={() => setStatusFilter('closed')}
        >
          Abgeschlossen
        </Button>
      </div>

      <div className="p-12 bg-white rounded-lg shadow text-center">
        <p className="text-gray-500">
          Forderungsübersicht wird hier angezeigt.
          <br />
          Case Entity Integration ausstehend.
        </p>
      </div>
    </div>
  );
}
