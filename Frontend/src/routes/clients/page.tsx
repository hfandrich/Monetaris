import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantList } from '@/entities/tenant';
import { TenantCard, TenantTable } from '@/entities/tenant';
import { PageHeader, Button } from '@/shared/components/ui';
import { Plus, Grid, List } from 'lucide-react';

export default function ClientsPage() {
  const { tenants, loading, error } = useTenantList();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const navigate = useNavigate();

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded">
        Fehler beim Laden: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Mandanten"
        subtitle="Gläubiger & Auftraggeber"
        action={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-gray-100' : ''}
            >
              <Grid size={16} />
            </Button>
            <Button
              variant="ghost"
              onClick={() => setViewMode('table')}
              className={viewMode === 'table' ? 'bg-gray-100' : ''}
            >
              <List size={16} />
            </Button>
            <Button variant="primary">
              <Plus size={16} /> Neuer Mandant
            </Button>
          </div>
        }
      />

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              Laden...
            </div>
          ) : (
            tenants.map(tenant => (
              <TenantCard
                key={tenant.id}
                tenant={tenant}
                onClick={() => navigate(`/clients/${tenant.id}`)}
              />
            ))
          )}
        </div>
      ) : (
        <TenantTable
          tenants={tenants}
          loading={loading}
          onTenantClick={(tenant) => navigate(`/clients/${tenant.id}`)}
        />
      )}
    </div>
  );
}
