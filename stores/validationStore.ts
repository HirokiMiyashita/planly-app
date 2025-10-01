import { create } from "zustand";

interface ValidationState {
  errors: Record<string, string>;
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  hasErrors: () => boolean;
  getError: (field: string) => string | undefined;
}

export const useValidationStore = create<ValidationState>((set, get) => ({
  errors: {},

  setError: (field: string, message: string) =>
    set((state) => ({
      errors: { ...state.errors, [field]: message },
    })),

  clearError: (field: string) =>
    set((state) => {
      const newErrors = { ...state.errors };
      delete newErrors[field];
      return { errors: newErrors };
    }),

  clearAllErrors: () => set({ errors: {} }),

  hasErrors: () => Object.keys(get().errors).length > 0,

  getError: (field: string) => get().errors[field],
}));
