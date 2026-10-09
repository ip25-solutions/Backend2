export const convertirId = (valor) => {
  if (valor === null || valor === undefined) return valor;
  if (typeof valor === 'object' && valor._id !== undefined) return valor._id.toString();
  if (typeof valor === 'object' && valor.id !== undefined) return valor.id.toString();
  return valor.toString();
};

export const identificarDocumento = (documento) => {
  if (documento?._id !== undefined) return { _id: convertirId(documento._id) };
  if (documento?.id !== undefined) return { id: convertirId(documento.id) };
  return {};
};
