import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface FormData {
  date_id: string;
  formName: string;
  palette: Array<{
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    options?: string[];
    referenceItemId?: string;
    validations?: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
    };
  }>;
}

const containerClasses = "max-w-4xl mx-auto bg-zinc-900 p-6 sm:p-8 rounded-xl shadow-2xl mt-12 md:mt-16 border border-zinc-800";
const cardClasses = "bg-zinc-800 border border-zinc-700 rounded-lg p-4 sm:p-6 mb-4 hover:bg-zinc-700/50 transition-colors duration-200";
const titleClasses = "text-xl font-bold text-gray-100 mb-2";
const dateClasses = "text-sm text-gray-400 mb-3";
const buttonClasses = "px-4 py-2 bg-indigo-800 cursor-pointer text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200 focus:outline-none";

const FormList: React.FC = () => {
  const [forms, setForms] = useState<FormData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const selectedDataRaw = localStorage.getItem('selectedData');
      let storedForms: FormData[] = [];
      if (selectedDataRaw) {
        const parsed = JSON.parse(selectedDataRaw);
        if (Array.isArray(parsed)) {
          storedForms = parsed;
        } else if (Array.isArray(parsed.forms)) {
          storedForms = parsed.forms;
        }
      }
      setForms(storedForms);
      setError(null);
    } catch (err) {
      setError('Error loading forms');
    }
  }, []);

  // Format date_id (Unix timestamp string) to a readable date and time
  const formatDate = (dateId: string): string => {
    try {
      const timestamp = parseInt(dateId, 10);
      if (isNaN(timestamp)) return 'Invalid Date';
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const handlePreview = (dateId: string) => {
    navigate(`/form/${dateId}`);
  };

  if (error) {
    return (
      <div className={containerClasses}>
        <p className="text-red-400 text-center font-medium">{error}</p>
      </div>
    );
  }

  if (!forms.length) {
    return (
      <div className={containerClasses}>
        <p className="text-gray-400 text-center">No forms available.</p>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Your Forms</h1>
      <div className="space-y-4">
        {forms.map((form) => (
          <div key={form.date_id} className={cardClasses}>
            <h2 className={titleClasses}>{form.formName || 'Untitled Form'}</h2>
            <p className={dateClasses}>Created: {formatDate(form.date_id)}</p>
            <button
              onClick={() => handlePreview(form.date_id)}
              className={buttonClasses}
            >
              Preview
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormList;