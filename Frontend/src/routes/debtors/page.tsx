import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebtorList } from '@/entities/debtor';
import { DebtorCard, DebtorTable } from '@/entities/debtor';
import { PageHeader, Button } from '@/shared/components/ui';
import { Plus, Grid, List } from 'lucide-react';

export default function DebtorsPage() {
  const { debtors, loading, error } = useDebtorList();
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
        title="Schuldnerkartei"
        subtitle="Datenbank & Bonitätsprüfung"
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
              <Plus size={16} /> Neuer Schuldner
            </Button>
          </div>
        }
      />

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {debtors.map(debtor => (
            <DebtorCard
              key={debtor.id}
              debtor={debtor}
              onClick={() => navigate(`/debtors/${debtor.id}`)}
            />
          ))}
        </div>
      ) : (
        <DebtorTable
          debtors={debtors}
          loading={loading}
          onDebtorClick={(debtor) => navigate(`/debtors/${debtor.id}`)}
        />
      )}
    </div>
  );
}
