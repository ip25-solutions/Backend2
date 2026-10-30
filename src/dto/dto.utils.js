export const obtenerId = (recurso) => {
  if (recurso === null || recurso === undefined) return recurso;

  if (typeof recurso !== 'object') return recurso.toString();

  const id = recurso._id ?? recurso.id;
  return id?.toString();
};
