import { FinancialOfficeData, UnifiedExecutiveEvent } from '../../types/store';

export const FinancialSync = {
  projectFinancialEvents(data: FinancialOfficeData, targetDateStr: string): UnifiedExecutiveEvent[] {
    const events: UnifiedExecutiveEvent[] = [];

    // Financial obligations due on or before target date
    (data?.obligations || []).forEach(ob => {
      if (ob.dueDate === targetDateStr && !ob.isPaid) {
        events.push({
          id: `fin_ob_${ob.id}`,
          sourceOffice: 'financiera',
          officeLabel: 'Oficina Financiera',
          color: '#D97706',
          title: `Pago Programado: ${ob.title}`,
          subtitle: `Monto: ${ob.amount} ${ob.currency} | Categoría: ${ob.category}`,
          date: ob.dueDate,
          startTime: '09:00',
          endTime: '10:00',
          type: 'obligation',
          priority: 'high',
          rawObject: ob
        });
      }
    });

    return events;
  }
};
