import React, { useState } from 'react';
import { useTemplateList } from '@/entities/template';
import { PageHeader, Button } from '@/shared/components/ui';
import { Plus, FileText } from 'lucide-react';

export default function TemplatesPage() {
  const { templates, loading, error } = useTemplateList();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

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
        title="Vorlagen"
        subtitle="Mahnungen & Dokumente"
        action={
          <Button variant="primary">
            <Plus size={16} /> Neue Vorlage
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Laden...
          </div>
        ) : templates.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Keine Vorlagen vorhanden
          </div>
        ) : (
          templates.map(template => (
            <div
              key={template.id}
              className={`p-6 bg-white rounded-lg shadow cursor-pointer transition-all ${
                selectedTemplate === template.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded">
                  <FileText size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {template.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
