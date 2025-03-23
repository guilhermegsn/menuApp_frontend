export const formatToCurrencyBR = (number) => {
    try {
      return number.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
      });
    } catch {
      return ""
    }
  }
  
  export const formatToDoubleBR = (number) => {
    try {
      return number.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    } catch {
      return ""
    }
  }
  
  export const formatCurrencyInput = (value) => {
    value = value.toString().replace(/\D/g, "")
    value = (parseFloat(value) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return value
  }
  