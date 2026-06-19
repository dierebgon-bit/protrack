export function getProgress(project) {
  if (project.manualProgress !== null) return project.manualProgress;
  if (!project.tasks.length) return 0;
  const done = project.tasks.filter((t) => t.status === 'Completada').length;
  return Math.round((done / project.tasks.length) * 100);
}

export function formatCurrency(n) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(n);
}

export function formatDate(d) {
  if (!d) return '-';
  return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getProjectBalance(project) {
  const inc = project.transactions
    .filter((t) => t.type === 'ingreso')
    .reduce((s, t) => s + t.amount, 0);
  const exp = project.transactions
    .filter((t) => t.type === 'gasto')
    .reduce((s, t) => s + t.amount, 0);
  return { inc, exp, bal: inc - exp };
}
