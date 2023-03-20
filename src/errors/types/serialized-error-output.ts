export type SerializedErrorField = {
  [key: string]: string[];
};

export type SerializeErrorOutput = {
  errors: [{
    message: string;
    fields?: SerializedErrorField;
  }]
};