import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { GripHorizontal, PlusCircle, SquarePen, Trash } from 'lucide-react';
import FieldPallet from '../components/FieldPallet';
import { v4 as uuidv4 } from "uuid";
import Modal from './Modal.js'
import { useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../redux/store';
import { deleteSelectedItem, editSelectedItem, setSelectedItem, swapSelectedItems } from '../redux/Paletteslice';
// Update the path below to the correct file where SelectedItem is exported.
// For example, if SelectedItem is exported from Paletteslice.ts:
import type { SelectedItem, ValidationRules } from '../redux/Paletteslice';
import { useDispatch } from 'react-redux';
import { useEffect, useRef, useState } from 'react';


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#18181B',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: (theme.vars ?? theme).palette.text.secondary,
  border: '1px solid #A1A1AA',
}));

export default function AutoGrid() {

    // inside your AutoGrid component, before the return:
const renderInputField = (item: SelectedItem) => {
  switch (item.type) {
    case "Single-line Text":
      return <input type="text" placeholder={item.label} className="w-full p-2 rounded-md border border-zinc-600 bg-zinc-900 text-zinc-200" />;

    case "Number Input":
      return <input type="number" placeholder={item.label} className="w-full p-2 rounded-md border border-zinc-600 bg-zinc-900 text-zinc-200" />;

    case "Multiline Text":
      return <textarea placeholder={item.label} className="w-full p-2 rounded-md border border-zinc-600 bg-zinc-900 text-zinc-200" rows={4} />;

    case "Dropdown Select":
      return (
        <select className="w-full p-2 rounded-md border border-zinc-600 bg-zinc-900 text-zinc-200">
          <option value="">Select {item.label}</option>
          {item.options?.map((opt: { id: string; label: string }) => (
            <option key={opt.id} value={opt.label}>{opt.label}</option>
          ))}
        </select>
      );

    case "Radio Button Group":
      return (
        <div className="flex gap-4 text-zinc-200">
          {item.options?.map((opt: { id: string; label: string }) => (
            <label key={opt.id}>
              <input type="radio" name={item.id} value={opt.label} /> {opt.label}
            </label>
          ))}
        </div>
      );

    case "Checkbox Group":
      return (
        <div className="flex gap-4 text-zinc-200">
          {item.options?.map((opt: { id: string; label: string }) => (
            <label key={opt.id}>
              <input type="checkbox" value={opt.label} /> {opt.label}
            </label>
          ))}
        </div>
      );

    case "Date Picker":
      return <input type="date" className="w-full p-2 rounded-md border border-zinc-600 bg-zinc-900 text-zinc-200" />;

    case "Derived Field":
      return <input type="text" placeholder={item.label} disabled className="w-full p-2 rounded-md border border-zinc-600 bg-zinc-700 text-zinc-500" />;

    default:
      return <div className="text-red-500">Unknown field type: {item.type}</div>;
  }
};

const FieldRenderer = ({ items }: { items: SelectedItem[] }) => {
  const dispatch = useDispatch();
  const [validationChecks, setValidationChecks] = useState<{
    [key: string]: { required: boolean; minLength: boolean; maxLength: boolean; pattern: boolean };
  }>({});
  const [changes, setChanges] = useState<{
    [key: string]: {
      label?: string;
      placeholder?: string;
      options?: { id: string; label: string }[];
      validations?: ValidationRules;
      referenceItemId?: string;
    };
  }>({});

  useEffect(() => {
    const initialChecks: {
      [key: string]: { required: boolean; minLength: boolean; maxLength: boolean; pattern: boolean };
    } = {};
    items.forEach((item) => {
      const validations = item.validations || {};
      initialChecks[item.id] = {
        required: !!validations.required,
        minLength: !!validations.minLength,
        maxLength: !!validations.maxLength,
        pattern: !!validations.pattern,
      };
    });
    setValidationChecks(initialChecks);
  }, [items]);

  type ValidationField = 'required' | 'minLength' | 'maxLength' | 'pattern';

  const toggleValidation = (itemId: string, field: ValidationField) => {
    setValidationChecks((prev) => {
      const newChecks = {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          [field]: !prev[itemId]?.[field as ValidationField],
        },
      };
      const item = items.find((i) => i.id === itemId);
      if (item) {
        const validations: ValidationRules = {
          required: newChecks[itemId]?.required ? true : undefined,
          minLength: newChecks[itemId]?.minLength
            ? changes[itemId]?.validations?.minLength || item.validations?.minLength || 0
            : undefined,
          maxLength: newChecks[itemId]?.maxLength
            ? changes[itemId]?.validations?.maxLength || item.validations?.maxLength || 0
            : undefined,
          pattern: newChecks[itemId]?.pattern
            ? changes[itemId]?.validations?.pattern || item.validations?.pattern || ''
            : undefined,
        };
        setChanges((prev) => ({
          ...prev,
          [itemId]: { ...prev[itemId], validations },
        }));
      }
      return newChecks;
    });
  };

  const handleLabelChange = (itemId: string, value: string) => {
    setChanges((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], label: value },
    }));
  };

  const handlePlaceholderChange = (itemId: string, value: string) => {
    setChanges((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], placeholder: value },
    }));
  };

  const handleOptionChange = (itemId: string, optionId: string, label: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      const currentOptions = changes[itemId]?.options || item.options || [];
      const updatedOptions = currentOptions.map((opt: { id: string; label: string }) =>
        opt.id === optionId ? { ...opt, label } : opt
      );
      setChanges((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], options: updatedOptions },
      }));
    }
  };

  const addOption = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      const newOption = {
        id: uuidv4(),
        label: `Option ${(changes[itemId]?.options?.length || item.options?.length || 0) + 1}`,
      };
      const updatedOptions = [...(changes[itemId]?.options || item.options || []), newOption];
      setChanges((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], options: updatedOptions },
      }));
    }
  };

  const removeOption = (itemId: string, optionId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      const currentOptions = changes[itemId]?.options || item.options || [];
      const updatedOptions = currentOptions.filter((opt: { id: string; label: string }) => opt.id !== optionId);
      setChanges((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], options: updatedOptions },
      }));
    }
  };

  const handleValidationChange = (itemId: string, field: string, value: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      const currentValidations: ValidationRules = changes[itemId]?.validations || item.validations || {};
      const validations: ValidationRules = {
        ...currentValidations,
        [field]: field === 'pattern' ? value : Number(value),
      };
      setChanges((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], validations },
      }));
    }
  };

  const handleReferenceItemIdChange = (itemId: string, value: string) => {
    setChanges((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], referenceItemId: value },
    }));
  };

  const saveChanges = (itemId: string) => {
    if (changes[itemId]) {
      dispatch(editSelectedItem({ id: itemId, changes: changes[itemId] }));
      const savedValidations: ValidationRules = changes[itemId].validations || {};
      setValidationChecks((prev) => ({
        ...prev,
        [itemId]: {
          required: !!savedValidations.required,
          minLength: !!savedValidations.minLength,
          maxLength: !!savedValidations.maxLength,
          pattern: !!savedValidations.pattern,
        },
      }));
      setChanges((prev) => {
        const newChanges = { ...prev };
        delete newChanges[itemId];
        return newChanges;
      });
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-4 py-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="p-4 border border-zinc-700 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-900 shadow-lg hover:shadow-xl transition-shadow duration-300 w-full max-w-2xl mx-auto"
        >
          <div className="mb-4">
            <label className="text-sm font-medium text-zinc-300 block mb-1">Label</label>
            <input
              type="text"
              defaultValue={changes[item.id]?.label || item.label || item.type}
              onChange={(e) => handleLabelChange(item.id, e.target.value)}
              className="w-full p-2 rounded-lg border border-zinc-600 bg-zinc-950 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
          </div>

          {['Single-line Text', 'Number Input', 'Multiline Text'].includes(item.type) && (
            <div className="mb-4">
              <label className="text-sm font-medium text-zinc-300 block mb-1">Placeholder</label>
              <input
                type="text"
                defaultValue={changes[item.id]?.placeholder || item.placeholder || ''}
                onChange={(e) => handlePlaceholderChange(item.id, e.target.value)}
                className="w-full p-2 rounded-lg border border-zinc-600 bg-zinc-950 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
          )}

          {item.type === 'Derived Field' && (
            <div className="mb-4">
              <label className="text-sm font-medium text-zinc-300 block mb-1">DOB Item ID (Age Calculation)</label>
              <input
                type="text"
                defaultValue={changes[item.id]?.referenceItemId || ''}
                onChange={(e) => handleReferenceItemIdChange(item.id, e.target.value)}
                className="w-full p-2 rounded-lg border border-zinc-600 bg-zinc-950 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                placeholder="Enter the ID of the DOB field"
              />
            </div>
          )}

          {['Dropdown Select', 'Radio Button Group', 'Checkbox Group'].includes(item.type) && (
            <div className="mb-4">
              <label className="text-sm font-medium text-zinc-300 block mb-1">Options</label>
              <ul className="space-y-2">
                {(changes[item.id]?.options || item.options)?.length ? (
                  ((changes[item.id]?.options || item.options) ?? []).map((opt: { id: string; label: string }) => (
                    <li key={opt.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        defaultValue={opt.label}
                        onChange={(e) => handleOptionChange(item.id, opt.id, e.target.value)}
                        className="flex-1 p-2 rounded-lg border border-zinc-600 bg-zinc-950 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      />
                      <button
                        onClick={() => removeOption(item.id, opt.id)}
                        className="p-2 rounded-full bg-red-900/50 hover:bg-red-800 transition-colors duration-200"
                      >
                        <Trash className="w-4 h-4 text-red-400 hover:text-red-300" />
                      </button>
                    </li>
                  ))
                ) : (
                  <div className="text-zinc-400 text-sm">No options available</div>
                )}
              </ul>
              <button
                onClick={() => addOption(item.id)}
                className="mt-2 flex items-center gap-1 px-3 py-1 bg-blue-900/50 hover:bg-blue-800 text-blue-300 rounded-lg text-sm transition-colors duration-200"
              >
                <PlusCircle className="w-4 h-4" /> Add Option
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Text fields: Required, Min Length, Max Length */}
            {['Single-line Text', 'Number Input', 'Multiline Text'].includes(item.type) && (
              <>
                <div>
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={validationChecks[item.id]?.required || false}
                      onChange={() => toggleValidation(item.id, 'required')}
                      className="text-blue-500 focus:ring-blue-500 rounded"
                    />
                    Required
                  </label>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={validationChecks[item.id]?.minLength || false}
                      onChange={() => toggleValidation(item.id, 'minLength')}
                      className="text-blue-500 focus:ring-blue-500 rounded"
                    />
                    Min Length
                  </label>
                  {validationChecks[item.id]?.minLength && (
                    <input
                      type="number"
                      defaultValue={
                        changes[item.id]?.validations?.minLength ?? item.validations?.minLength ?? ''
                      }
                      onChange={(e) => handleValidationChange(item.id, 'minLength', e.target.value)}
                      className="w-full p-1 rounded-lg border border-zinc-600 bg-zinc-950 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    />
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={validationChecks[item.id]?.maxLength || false}
                      onChange={() => toggleValidation(item.id, 'maxLength')}
                      className="text-blue-500 focus:ring-blue-500 rounded"
                    />
                    Max Length
                  </label>
                  {validationChecks[item.id]?.maxLength && (
                    <input
                      type="number"
                      defaultValue={
                        changes[item.id]?.validations?.maxLength ?? item.validations?.maxLength ?? ''
                      }
                      onChange={(e) => handleValidationChange(item.id, 'maxLength', e.target.value)}
                      className="w-full p-1 rounded-lg border border-zinc-600 bg-zinc-950 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    />
                  )}
                </div>
              </>
            )}
            {/* Date, Checkbox, Radio, Select: Only Required */}
            {['Date Picker', 'Checkbox Group', 'Radio Button Group', 'Dropdown Select'].includes(item.type) && (
              <div>
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={validationChecks[item.id]?.required || false}
                    onChange={() => toggleValidation(item.id, 'required')}
                    className="text-blue-500 focus:ring-blue-500 rounded"
                  />
                  Required
                </label>
              </div>
            )}
            {/* Derived Field: No validations */}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => saveChanges(item.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Save Changes
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};



    const dispatch = useDispatch<AppDispatch>()

      const selectedFormIndex = useSelector(
    (state: RootState) => state.palette.selectedFormIndex
  );

  const selectedItem = useSelector(
    (state: RootState) => state.palette.selectedItem
  );

  // Get the selected form data safely
  const form = useSelector(
    (state: RootState) => state.palette.storedData.forms[selectedFormIndex]
  );
  const items: SelectedItem[] = form?.palette ?? [];

  // Safely extract items or fallback to empty array if un

     function handleSort() {
  if (dragPerson.current && dragOverPerson.current) {
    dispatch(
      swapSelectedItems({
        sourceId: dragPerson.current,
        targetId: dragOverPerson.current,
      })
    );
  }
  dragPerson.current = null;
  dragOverPerson.current = null;
}

     const dragPerson = useRef<string | null>(null)
     const dragOverPerson = useRef<string | null>(null)

     
useEffect(()=>{

},[selectedFormIndex,items])


const [copied] = useState<boolean>(false)


     console.log("Items ",items)

  return (
    <Box sx={{ flexGrow: 1, height: '100%' }}>
      <Grid container sx={{ height: '100%' }} spacing={0}>
          <Item sx={{flexGrow:1}}>

                <div className='flex sticky top-0 gap-4 text-zinc-300 font-bold py-4 text-xl flex-col items-center'>
                    <h1>Add fields</h1>
                    <hr className='zinc-400 w-full'/>
                    <FieldPallet/>
                </div>

          </Item>
        
          <Item sx={{ flexGrow: 1 }}>

                <div className='w-full z-50 max-h-screen sticky top-18 bg-zinc-900 font-bold p-2 flex items-center justify-between'>
                    <h1 className='text-zinc-200 text-lg'>Design Your Form</h1>
                    <div className='flex items-center text-zinc-200 justify-center gap-4'>
            <Modal/>

           
                    </div>
                </div>

                <div className='w-full mt-4 scroll-smooth flex overflow-auto flex-col bg-zinc-800'>
                        {items.map((item)=>(
                             <div draggable onDragStart={()=>(dragPerson.current = item.id)} onDragEnter={()=> (dragOverPerson.current = item.id)} onDragEnd={handleSort} onDragOver={(e)=> e.preventDefault()} key={item.id} className="relative cursor-grab p-4 border-b border-zinc-700">
                                <div><GripHorizontal color='white'/></div>
    <div className="absolute top-2 right-2 flex gap-2 opacity-70 hover:opacity-100 cursor-pointer">
  <SquarePen onClick={()=>{dispatch(setSelectedItem(item.id))}} size={16} className="text-zinc-400 hover:text-blue-400" />
      <Trash onClick={()=>{dispatch(deleteSelectedItem(item.id))}} size={16} className="text-zinc-400 hover:text-red-500" />
    </div>

    <label className="block mb-1 text-start font-semibold text-zinc-300">{item.type}</label>
    {
      item.type === 'Date Picker' ? (
        <div className="flex items-center gap-2 mb-1">
          <label className="block text-start font-semibold text-[12px] text-zinc-300">{item.id}</label>
          <button
            type="button"
            className="text-zinc-400 hover:text-blue-400 p-1 rounded"
            onClick={() => {
              navigator.clipboard.writeText(item.id);
              alert('Copied')
            }}
            title="Copy ID to clipboard"
          >{
            copied ? 
            <p>Copied</p> 
            : 
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/><rect x="3" y="3" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/></svg>
          }
          </button>
        </div>
      ) : ""
    }
    {/* {renderInputField(item.type)} */}
    {renderInputField(item)}
  </div>
                        ))}
                </div>
                
          </Item>
        
        
          <Item sx={{ flexGrow: 6 }}>
            <div className='w-full max-h-full sticky top-18'>
            <div className='flex sticky gap-4 text-zinc-300 font-bold py-4 text-xl flex-col items-center'>
                    <h1>Add fields</h1>
                    <hr className='zinc-400 w-full'/>
                    
                </div>

                <div className='w-full max-h-full'>
                  {
                    <FieldRenderer items={items.filter(item => item.id === selectedItem)} />
                  }
                </div>
            </div>
          </Item>
        
      </Grid>
    </Box>
  );
}
