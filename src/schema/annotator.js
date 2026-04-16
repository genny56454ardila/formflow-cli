// annotator.js — add/remove/list annotations on schema fields

function annotateField(field, key, value) {
  if (!field || typeof field !== 'object') throw new Error('Invalid field');
  if (!key || typeof key !== 'string') throw new Error('Annotation key must be a string');
  const annotations = field.annotations ? { ...field.annotations } : {};
  annotations[key] = value;
  return { ...field, annotations };
}

function removeAnnotation(field, key) {
  if (!field || typeof field !== 'object') throw new Error('Invalid field');
  if (!field.annotations) return field;
  const annotations = { ...field.annotations };
  delete annotations[key];
  return { ...field, annotations };
}

function listAnnotations(field) {
  if (!field || typeof field !== 'object') throw new Error('Invalid field');
  return field.annotations ? { ...field.annotations } : {};
}

function annotateSchema(schema, fieldName, key, value) {
  if (!schema || !Array.isArray(schema.fields)) throw new Error('Invalid schema');
  const fields = schema.fields.map(f =>
    f.name === fieldName ? annotateField(f, key, value) : f
  );
  return { ...schema, fields };
}

function removeSchemaAnnotation(schema, fieldName, key) {
  if (!schema || !Array.isArray(schema.fields)) throw new Error('Invalid schema');
  const fields = schema.fields.map(f =>
    f.name === fieldName ? removeAnnotation(f, key) : f
  );
  return { ...schema, fields };
}

module.exports = { annotateField, removeAnnotation, listAnnotations, annotateSchema, removeSchemaAnnotation };
