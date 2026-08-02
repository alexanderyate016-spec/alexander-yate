/**
 * Date and Time utilities for Casa Blanca Personal
 */

export interface ColombianHoliday {
  title: string;
  monthDay: string; // "MM-DD"
  message: string;
}

export const COLOMBIAN_NATIONAL_HOLIDAYS: ColombianHoliday[] = [
  { title: 'Año Nuevo', monthDay: '01-01', message: '¡Feliz Año Nuevo! Inicio de un nuevo periodo ejecutivo.' },
  { title: 'Día del Trabajo', monthDay: '05-01', message: 'Homenaje a la dedicación y el esfuerzo de los trabajadores.' },
  { title: 'Grito de Independencia (20 de Julio)', monthDay: '07-20', message: '¡Conmemoración de la Independencia Nacional de Colombia!' },
  { title: 'Batalla de Boyacá (7 de Agosto)', monthDay: '08-07', message: '¡Honor a la gesta libertadora y las Fuerzas Armadas de Colombia!' },
  { title: 'Día de la Raza', monthDay: '10-12', message: 'Celebración de la diversidad e identidad hispanoamericana.' },
  { title: 'Independencia de Cartagena', monthDay: '11-11', message: 'Conmemoración del heroísmo cartagenero.' },
  { title: 'Día de las Velitas / Inmaculada Concepción', monthDay: '12-08', message: 'Noche de velitas y luz en los hogares colombianos.' },
  { title: 'Navidad', monthDay: '12-25', message: '¡Feliz Navidad y paz en unión familiar!' }
];

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getDayOfWeekNumber(dateStr: string): number {
  // Returns 1 for Monday ... 7 for Sunday
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay();
  return day === 0 ? 7 : day;
}

export function getDayOfWeekName(dayNum: number): string {
  const names = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  return names[dayNum - 1] || 'Lunes';
}

export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return d.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatLongDate(dateStr: string): string {
  return formatFriendlyDate(dateStr);
}

export function getGreetingByTime(name: string): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return `Buenos días, ${name}`;
  } else if (hour >= 12 && hour < 19) {
    return `Buenas tardes, ${name}`;
  } else {
    return `Buenas noches, ${name}`;
  }
}

export function getDaysDifference(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const diffTime = d2.getTime() - d1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function addDaysToDateStr(dateStr: string, daysToAdd: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + daysToAdd);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getWeekDaysForDate(dateStr: string): Array<{ dateStr: string; dayNum: number; dayShort: string; dayNumberStr: string; isToday: boolean }> {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay(); // 0 is Sunday, 1 is Monday...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  const todayStr = getTodayDateString();
  const days = [];
  const shortNames = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(cur.getDate()).padStart(2, '0');
    const curDateStr = `${y}-${m}-${dayOfMonth}`;

    days.push({
      dateStr: curDateStr,
      dayNum: i + 1,
      dayShort: shortNames[i],
      dayNumberStr: dayOfMonth,
      isToday: curDateStr === todayStr
    });
  }

  return days;
}
