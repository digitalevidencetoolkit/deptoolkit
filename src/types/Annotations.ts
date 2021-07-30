import * as yup from 'yup';

/**
 * Annotations are user-created data _about_ the record,
 * most probably after the original archive through the UI
 */
export type Annotation = { description: string; [key: string]: any };

const DocSchema = yup
  .object()
  .shape({
    description: yup.string(),
  })
  .strict()
  .noUnknown();

export const validate = (obj: Annotation): Promise<any> =>
  DocSchema.validate(obj);
