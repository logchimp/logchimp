export interface IFormBaseProps {
  label?: string;
  placeholder?: string;
  description?: string;
  /**
   * @default false
   */
  required?: boolean;
  /**
   * @default false
   */
  disabled?: boolean;
  /**
   * @default { show: false, message: "" }
   */
  error?: FormFieldErrorType;
}

export type FormBasePropsV2 = Omit<IFormBaseProps, "error"> & {
  error?: string | null;
};

export const formBaseProps = {
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Object,
    default: () => {
      return {
        show: false,
        message: "",
      };
    },
  },
};

export interface FormFieldErrorType {
  show: boolean;
  message: string;
}
