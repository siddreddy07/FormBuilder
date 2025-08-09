import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Helper to calculate age from date string
function calculateAge(dob: string): string {
  if (!dob) return '';
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age.toString() : '';
}

interface ValidationErrors {
  [key: string]: string[];
}

interface FormField {
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
}

interface FormData {
  date_id: string;
  formName: string;
  palette: FormField[];
}

const inputClasses = "w-full p-3 bg-zinc-800 border border-zinc-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 hover:border-indigo-400 shadow-sm";
const errorClasses = "text-red-400 text-sm mt-1 font-medium";
const labelClasses = "block text-base font-medium text-gray-200 mb-2";
const containerClasses = "max-w-4xl mx-auto bg-zinc-900 p-6 sm:p-8 rounded-xl shadow-2xl mt-18 md:mt-24 border border-zinc-800";

const FormPreview: React.FC = () => {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<FormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('No form ID provided');
      return;
    }

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
      const selectedForm = storedForms.find((f) => f.date_id === id);
      if (selectedForm) {
        setForm(selectedForm);
        setError(null);
      } else {
        setError('Form not found');
        setForm(null);
      }
    } catch (err) {
      setError('Error loading form data');
      setForm(null);
    }
  }, [id]);

  const validateField = (field: FormField, value: any): string[] => {
    const errors: string[] = [];
    if (field.validations?.required && (!value || (Array.isArray(value) ? value.length === 0 : value.trim() === ''))) {
      errors.push('This field is required.');
    }
    if (field.validations?.minLength && typeof value === 'string' && value.length < field.validations.minLength) {
      errors.push(`Minimum length is ${field.validations.minLength} characters.`);
    }
    if (field.validations?.maxLength && typeof value === 'string' && value.length > field.validations.maxLength) {
      errors.push(`Maximum length is ${field.validations.maxLength} characters.`);
    }
    return errors;
  };

  const handleInputChange = (field: FormField, value: any) => {
    setFormValues((prev) => {
      const newValues = { ...prev, [field.id]: value };
      // Update derived fields that reference this field
      if (form && field.type !== 'Derived Field') {
        form.palette.forEach((f) => {
          if (f.type === 'Derived Field' && f.referenceItemId === field.id) {
            newValues[f.id] = calculateAge(value);
          }
        });
      }
      return newValues;
    });
    setValidationErrors((prev) => ({ ...prev, [field.id]: validateField(field, value) }));
  };

  const renderField = (field: FormField) => {
  if (!field.label) return null;
  const errors = validationErrors[field.id] || [];
  const isRequired = field.validations?.required === true;

    // Derived field logic
    let derivedValue = '';
    if (field.type === 'Derived Field' && field.referenceItemId && form) {
      const refField = form.palette.find(f => f.id === field.referenceItemId);
      if (refField && formValues[refField.id]) {
        derivedValue = calculateAge(formValues[refField.id]);
      }
    }

    switch (field.type) {
      case 'Single-line Text':
        return (
          <div key={field.id} className="mb-6">
            <label className={labelClasses}>
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              placeholder={field.placeholder || 'Enter text'}
              value={formValues[field.id] || ''}
              onChange={e => handleInputChange(field, e.target.value)}
              className={`${inputClasses} ${errors.length ? 'border-red-500 focus:ring-red-400' : ''}`}
            />
            {errors.map((err, idx) => (
              <p key={idx} className={errorClasses}>{err}</p>
            ))}
          </div>
        );
      case 'Number Input':
        return (
          <div key={field.id} className="mb-6">
            <label className={labelClasses}>
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              placeholder={field.placeholder || 'Enter number'}
              value={formValues[field.id] || ''}
              onChange={e => handleInputChange(field, e.target.value)}
              className={`${inputClasses} ${errors.length ? 'border-red-500 focus:ring-red-400' : ''}`}
            />
            {errors.map((err, idx) => (
              <p key={idx} className={errorClasses}>{err}</p>
            ))}
          </div>
        );
      case 'Multiline Text':
        return (
          <div key={field.id} className="mb-6">
            <label className={labelClasses}>
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              placeholder={field.placeholder || 'Enter text'}
              value={formValues[field.id] || ''}
              onChange={e => handleInputChange(field, e.target.value)}
              className={`${inputClasses} min-h-[140px] resize-y ${errors.length ? 'border-red-500 focus:ring-red-400' : ''}`}
            />
            {errors.map((err, idx) => (
              <p key={idx} className={errorClasses}>{err}</p>
            ))}
          </div>
        );
      case 'Dropdown Select':
        return (
          <div key={field.id} className="mb-6">
            <label className={labelClasses}>
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={formValues[field.id] || ''}
              onChange={e => handleInputChange(field, e.target.value)}
              className={`${inputClasses} appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMiA1TDggMTAuNUwxNCA1IiBzdHJva2U9IiM5QzlEOEUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-no-repeat bg-[right_1rem_center] bg-[length:12px_12px] ${errors.length ? 'border-red-500 focus:ring-red-400' : ''}`}
            >
              <option value="">{field.placeholder || 'Select an option'}</option>
              {field.options?.map((option: any, idx: number) => (
                <option key={option.id || idx} value={option.label || option}>
                  {option.label || String(option)}
                </option>
              ))}
            </select>
            {errors.map((err, idx) => (
              <p key={idx} className={errorClasses}>{err}</p>
            ))}
          </div>
        );
      case 'Radio Button Group':
        return (
          <div key={field.id} className="mb-6">
            <label className={labelClasses}>
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-3">
              {field.options?.length ? (
                field.options.map((option: any, idx: number) => (
                  <label key={option.id || idx} className="flex items-center cursor-pointer hover:bg-zinc-800/50 p-2 rounded-md transition-colors duration-200">
                    <input
                      type="radio"
                      name={field.id}
                      value={option.label || option}
                      checked={formValues[field.id] === (option.label || option)}
                      onChange={e => handleInputChange(field, e.target.value)}
                      className="h-5 w-5 text-indigo-500 focus:ring-indigo-500 border-zinc-600 bg-zinc-800 mr-3"
                    />
                    <span className="text-gray-200">{option.label || String(option)}</span>
                  </label>
                ))
              ) : (
                <p className="text-gray-400">No options available</p>
              )}
            </div>
            {errors.map((err, idx) => (
              <p key={idx} className={errorClasses}>{err}</p>
            ))}
          </div>
        );
      case 'Checkbox Group':
        return (
          <div key={field.id} className="mb-6">
            <label className={labelClasses}>
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-3">
              {field.options?.length ? (
                field.options.map((option: any, idx: number) => {
                  const checked = Array.isArray(formValues[field.id]) && formValues[field.id].includes(option.label || option);
                  return (
                    <label key={option.id || idx} className="flex items-center cursor-pointer hover:bg-zinc-800/50 p-2 rounded-md transition-colors duration-200">
                      <input
                        type="checkbox"
                        value={option.label || option}
                        checked={checked}
                        onChange={e => {
                          const prev = Array.isArray(formValues[field.id]) ? formValues[field.id] : [];
                          const value = option.label || option;
                          const newValues = e.target.checked
                            ? [...prev, value]
                            : prev.filter((v: any) => v !== value);
                          handleInputChange(field, newValues);
                        }}
                        className="h-5 w-5 text-indigo-500 focus:ring-indigo-500 border-zinc-600 bg-zinc-800 mr-3"
                      />
                      <span className="text-gray-200">{option.label || String(option)}</span>
                    </label>
                  );
                })
              ) : (
                <p className="text-gray-400">No options available</p>
              )}
            </div>
            {errors.map((err, idx) => (
              <p key={idx} className={errorClasses}>{err}</p>
            ))}
          </div>
        );
      case 'Date Picker':
        return (
          <div key={field.id} className="mb-6">
            <label className={labelClasses}>
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={formValues[field.id] || ''}
              onChange={e => handleInputChange(field, e.target.value)}
              className={`${inputClasses} ${errors.length ? 'border-red-500 focus:ring-red-400' : ''}`}
            />
            {errors.map((err, idx) => (
              <p key={idx} className={errorClasses}>{err}</p>
            ))}
          </div>
        );
      case 'Derived Field':
        return (
          <div key={field.id} className="mb-6">
            <label className={labelClasses}>
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={derivedValue}
              readOnly
              className={`${inputClasses} bg-zinc-700/50 cursor-not-allowed text-gray-400`}
            />
            {field.referenceItemId && (
              <p className="text-sm text-gray-400 mt-1">Derived from field ID: {field.referenceItemId}</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className={containerClasses}>
        <p className="text-red-400 text-center font-medium">{error}</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className={containerClasses}>
        <p className="text-gray-400 text-center">Loading...</p>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <h1 className="text-3xl font-bold text-gray-100 mb-8">{form.formName || 'Form Preview'}</h1>
      {form.palette.length ? (
        form.palette.map((field) => renderField(field))
      ) : (
        <p className="text-gray-400 text-center">No fields available in this form.</p>
      )}
    </div>
  );
};

export default FormPreview;