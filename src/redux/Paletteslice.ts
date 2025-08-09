// src/store/paletteSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid"; // For unique IDs

// Define types for form items
export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

interface Option {
  id: string;
  label: string;
}

export interface SelectedItem {
  id: string;
  type: string;
  label?: string;
  placeholder?: string;
  options?: Option[];
  validations?: ValidationRules; // Use object, not array
}

interface FormData {
  date_id: string;
  palette: SelectedItem[];
  formName: string;
}

interface PaletteState {
  palette: string[];
  storedData: { forms: FormData[] };
  selectedFormIndex: number;
  selectedItem: string;
}

// Load from localStorage
const savedDataRaw = localStorage.getItem("selectedData");
let storedData: { forms: FormData[] } = { forms: [] };
if (savedDataRaw) {
  try {
    const parsed = JSON.parse(savedDataRaw);
  let forms = Array.isArray(parsed.forms) ? parsed.forms : [];
  // Filter to only keep forms with empty formName
  forms = forms.filter((form: FormData) => !form.formName || form.formName.trim() === "");
    // If multiple, keep only the most recent (last one)
    if (forms.length > 1) {
      forms = [forms[forms.length - 1]];
    }
    storedData.forms = forms;
  } catch {
    storedData.forms = [];
  }
}
if (storedData.forms.length === 0) {
  storedData.forms.push({ date_id: Date.now().toString(), palette: [], formName: "" });
}

// Initial state for Redux
const initialState: PaletteState = {
  palette: [
    "Single-line Text",
    "Number Input",
    "Multiline Text",
    "Dropdown Select",
    "Radio Button Group",
    "Checkbox Group",
    "Date Picker",
    "Derived Field",
  ],
  storedData,
  selectedFormIndex: 0,
  selectedItem: "",
};

// Create Redux slice
const paletteSlice = createSlice({
  name: "palette",
  initialState,
  reducers: {
    // Create a brand new form and select it
    createForm(state) {
      const newForm: FormData = {
  date_id: Date.now().toString(),
        palette: [],
        formName: "",
      };
      state.storedData.forms.push(newForm);
      state.selectedFormIndex = state.storedData.forms.length - 1;
      state.selectedItem = "";
      localStorage.setItem("selectedData", JSON.stringify(state.storedData));
    },
    // Add a new item to the form
    addSelectedItem(state, action: { payload: string }) {
      const type = action.payload;
      const newItem: SelectedItem = {
        id: uuidv4(),
        type,
        label: "Label",
        placeholder: "Enter your text",
        options: [],
        validations: {},
      };

      // Add default options for dropdown, radio, or checkbox
      if (type === "Dropdown Select" || type === "Radio Button Group" || type === "Checkbox Group") {
        newItem.options = [
          { id: uuidv4(), label: "Option 1" },
          { id: uuidv4(), label: "Option 2" },
        ];
      }

      state.storedData.forms[state.selectedFormIndex].palette.push(newItem);
      localStorage.setItem("selectedData", JSON.stringify(state.storedData));
    },

    // Delete an item from the form
    deleteSelectedItem(state, action: { payload: string }) {
      const currentForm = state.storedData.forms[state.selectedFormIndex];
      currentForm.palette = currentForm.palette.filter(item => item.id !== action.payload);
      localStorage.setItem("selectedData", JSON.stringify(state.storedData));
      state.selectedItem = "";
    },

    // Set the selected item
    setSelectedItem(state, action: { payload: string }) {
      state.selectedItem = action.payload;
    },

    // Edit an existing item
    editSelectedItem(state, action: { payload: { id: string; changes: Partial<SelectedItem> } }) {
      const currentForm = state.storedData.forms[state.selectedFormIndex];
      const index = currentForm.palette.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        currentForm.palette[index] = { ...currentForm.palette[index], ...action.payload.changes };
        localStorage.setItem("selectedData", JSON.stringify(state.storedData));
      }
    },

    // Clear the current form
    clearSelectedData(state) {
      state.storedData.forms[state.selectedFormIndex] = {
        date_id: uuidv4(),
        palette: [],
        formName: "",
      };
      localStorage.setItem("selectedData", JSON.stringify(state.storedData));
      state.selectedItem = "";
    },

    // Swap two items in the form
    swapSelectedItems(state, action: { payload: { sourceId: string; targetId: string } }) {
      const { sourceId, targetId } = action.payload;
      const currentForm = state.storedData.forms[state.selectedFormIndex];
      const items = currentForm.palette;

      const srcIndex = items.findIndex(item => item.id === sourceId);
      const targetIndex = items.findIndex(item => item.id === targetId);

      if (srcIndex !== -1 && targetIndex !== -1) {
        [items[srcIndex], items[targetIndex]] = [items[targetIndex], items[srcIndex]];
        localStorage.setItem("selectedData", JSON.stringify(state.storedData));
      }
    },

    // Set the form name
    setFormName(state, action: { payload: string }) {
      state.storedData.forms[state.selectedFormIndex].formName = action.payload;
      localStorage.setItem("selectedData", JSON.stringify(state.storedData));
      const newForm: FormData = {
        date_id: Date.now().toString(),
        palette: [],
        formName: "",
      };
      state.storedData.forms.push(newForm);
      state.selectedFormIndex = state.storedData.forms.length - 1;
      state.selectedItem = "";
      localStorage.setItem("selectedData", JSON.stringify(state.storedData));
    },

    // Switch to another form
    setSelectedFormIndex(state, action: { payload: number }) {
      const idx = action.payload;
      if (idx >= 0 && idx < state.storedData.forms.length) {
        state.selectedFormIndex = idx;
        state.selectedItem = "";
      }
    },

    // Add a new empty form
    addNewForm(state) {
      const newForm: FormData = {
        date_id: uuidv4(),
        palette: [],
        formName: "",
      };
      state.storedData.forms.push(newForm);
      state.selectedFormIndex = state.storedData.forms.length - 1;
      state.selectedItem = "";
      localStorage.setItem("selectedData", JSON.stringify(state.storedData));
    },

    // Delete a form
    deleteForm(state, action: { payload: number }) {
      const idx = action.payload;
      if (idx >= 0 && idx < state.storedData.forms.length) {
        state.storedData.forms.splice(idx, 1);
        if (state.selectedFormIndex >= state.storedData.forms.length) {
          state.selectedFormIndex = state.storedData.forms.length - 1;
        }
        if (state.storedData.forms.length === 0) {
          state.storedData.forms.push({
            date_id: uuidv4(),
            palette: [],
            formName: "",
          });
          state.selectedFormIndex = 0;
        }
        state.selectedItem = "";
        localStorage.setItem("selectedData", JSON.stringify(state.storedData));
      }
    },
  },
});

// Export actions and reducer
export const {
  addSelectedItem,
  deleteSelectedItem,
  setSelectedItem,
  editSelectedItem,
  clearSelectedData,
  swapSelectedItems,
  setFormName,
  setSelectedFormIndex,
  addNewForm,
  deleteForm,
  createForm,
} = paletteSlice.actions;
export default paletteSlice.reducer;