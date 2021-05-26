import * as yup from 'yup';

export const RecordSchema = yup
  .object()
  .shape({
    sku: yup.string().required(),
    url: yup.string().url().required(),
    title: yup.string().required(),
  })
  .strict()
  .noUnknown();
