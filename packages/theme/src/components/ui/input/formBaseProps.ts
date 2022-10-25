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
