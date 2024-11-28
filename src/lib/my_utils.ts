//Formato de número a precios
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('es-ES', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
};
