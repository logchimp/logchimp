export interface IFormBaseProps {
  label?: string;
  placeholder?: string;
  description?: string;
  /**
   * @default false
   */
  disabled?: boolean;
  /**
   * @default FormFieldErrorType
   */
  error?: FormFieldErrorType;
}

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
