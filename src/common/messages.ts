export const ERROR_TYPE = {
  incorrect: 'incorrect',
  taken: 'taken',
  length: 'length',
} as const;

type ErrorType = keyof typeof ERROR_TYPE;

type Options = { min?: number; max: number };

export const getErrorText = (error: ErrorType, field: string, options?: Options) => {
  if (error === ERROR_TYPE.incorrect) return `Incorrect field value: ${field}`;

  if (error === ERROR_TYPE.taken) return `That ${field} is taken. Try another.`;

  if (error === ERROR_TYPE.length) {
    const betweenStr = options && `Must be between ${options.min || 1} and ${options.max} characters long`;
    return `Length error: ${field}. ${betweenStr || ''}`;
  }

  return `${field} error`;
};
