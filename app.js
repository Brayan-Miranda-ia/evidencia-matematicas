// Valores y cálculos del ejercicio; todos los montos se expresan en COP.
const byId = (id) => document.getElementById(id);
const numberValue = (id) => Number(byId(id).value);
const money = (value) => new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', maximumFractionDigits: 0
}).format(Math.round(value));
const decimal = (value, digits = 2) => new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: digits, maximumFractionDigits: digits
}).format(value);

const areaFields = ['length', 'width', 'height'];
const costFields = ['fixed-cost', 'variable-initial', 'variable-optimized', 'sale-price', 'quantity'];

function markInvalid(id, invalid) {
  byId(id).setAttribute('aria-invalid', String(invalid));
}

function calculateArea() {
  const values = areaFields.map(numberValue);
  const valid = values.every((value) => Number.isFinite(value) && value > 0);
  areaFields.forEach((id) => markInvalid(id, !(Number.isFinite(numberValue(id)) && numberValue(id) > 0)));
  byId('area-error').textContent = valid ? '' : 'Ingresa dimensiones mayores que cero para calcular el área.';
  if (!valid) {
    byId('area-cm').textContent = '—';
    byId('area-m').textContent = '—';
    byId('area-steps').textContent = '';
    return;
  }
  const [length, width, height] = values;
  const base = length * width;
  const longSides = 2 * length * height;
  const shortSides = 2 * width * height;
  const area = base + longSides + shortSides;
  byId('area-cm').textContent = `${decimal(area, 2)} cm²`;
  byId('area-m').textContent = `${decimal(area / 10000, 4)} m²`;
  byId('area-steps').textContent = `${decimal(length, 1)} × ${decimal(width, 1)} + 2 × ${decimal(length, 1)} × ${decimal(height, 1)} + 2 × ${decimal(width, 1)} × ${decimal(height, 1)} = ${decimal(area, 2)} cm²`;
}

function calculateCosts() {
  const values = costFields.map(numberValue);
  const validByField = costFields.map((id) => {
    const value = numberValue(id);
    const valid = Number.isFinite(value) && value >= 0 && (id !== 'quantity' || Number.isInteger(value));
    markInvalid(id, !valid);
    return valid;
  });
  const valid = validByField.every(Boolean);
  byId('cost-error').textContent = valid ? '' : 'Usa valores no negativos y una cantidad de camas entera.';
  if (!valid) {
    ['table-fixed-initial', 'table-fixed-opt', 'table-var-initial', 'table-var-opt', 'total-initial', 'total-optimized', 'income-initial', 'income-opt', 'profit-initial', 'profit-opt', 'savings-total', 'savings-unit'].forEach((id) => { byId(id).textContent = '—'; });
    byId('summary-quantity').textContent = '— camas';
    return;
  }
  const [fixed, variableInitial, variableOptimized, price, quantity] = values;
  const initialVariableTotal = variableInitial * quantity;
  const optimizedVariableTotal = variableOptimized * quantity;
  const initialTotal = fixed + initialVariableTotal;
  const optimizedTotal = fixed + optimizedVariableTotal;
  const income = price * quantity;
  byId('summary-quantity').textContent = `${quantity} ${quantity === 1 ? 'cama' : 'camas'}`;
  byId('table-fixed-initial').textContent = money(fixed);
  byId('table-fixed-opt').textContent = money(fixed);
  byId('table-var-initial').textContent = money(initialVariableTotal);
  byId('table-var-opt').textContent = money(optimizedVariableTotal);
  byId('total-initial').textContent = money(initialTotal);
  byId('total-optimized').textContent = money(optimizedTotal);
  byId('income-initial').textContent = money(income);
  byId('income-opt').textContent = money(income);
  byId('profit-initial').textContent = money(income - initialTotal);
  byId('profit-opt').textContent = money(income - optimizedTotal);
  const savingPerBed = variableInitial - variableOptimized;
  byId('savings-total').textContent = money(savingPerBed * quantity);
  byId('savings-copy').textContent = `ahorro en ${quantity} ${quantity === 1 ? 'cama' : 'camas'}`;
  byId('savings-unit').textContent = `${money(savingPerBed)} por cama`;
  calculateBreakEven(fixed, variableOptimized, price);
}

function calculateBreakEven(fixed, variable, price) {
  byId('be-equation').textContent = `${decimal(price, 0)}x = ${decimal(fixed, 0)} + ${decimal(variable, 0)}x`;
  const margin = price - variable;
  if (margin <= 0) {
    byId('be-work').textContent = 'El precio debe superar el costo variable.';
    byId('be-units').innerHTML = 'No <small>se alcanza</small>';
    byId('be-detail').textContent = 'Con estos valores, cada unidad no cubre su costo variable.';
    return;
  }
  const exactUnits = fixed / margin;
  const units = Math.ceil(exactUnits);
  byId('be-work').textContent = `${decimal(margin, 0)}x = ${decimal(fixed, 0)}  →  x = ${decimal(exactUnits, 2)}`;
  byId('be-units').innerHTML = `${units} <small>${units === 1 ? 'cama' : 'camas'}</small>`;
  byId('be-detail').textContent = `Mínimo ${units} ${units === 1 ? 'cama' : 'camas'} para cubrir los costos.`;
}

// Recalcular en cada edición mantiene conectados todos los resultados.
[...areaFields, ...costFields].forEach((id) => byId(id).addEventListener('input', () => {
  if (areaFields.includes(id)) calculateArea();
  else calculateCosts();
}));

calculateArea();
calculateCosts();
