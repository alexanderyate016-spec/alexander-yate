/**
 * Utility for Colombian Holidays (Festivos de Colombia)
 * Compliant with Ley Emiliani (Ley 51 de 1983) and Easter-based Catholic holidays.
 */

export interface HolidayInfo {
  isHoliday: boolean;
  name?: string;
  type?: 'fixed' | 'emiliani' | 'easter';
}

function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function moveEmiliani(year: number, monthZeroIndexed: number, day: number): Date {
  const date = new Date(year, monthZeroIndexed, day);
  const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon
  if (dayOfWeek === 1) {
    return date;
  }
  const addDays = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const res = new Date(date);
  res.setDate(date.getDate() + addDays);
  return res;
}

function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getColombianHolidaysForYear(year: number): Record<string, string> {
  const holidays: Record<string, string> = {};

  // 1. Fixed Holidays
  holidays[`${year}-01-01`] = 'Año Nuevo';
  holidays[`${year}-05-01`] = 'Día del Trabajo';
  holidays[`${year}-07-20`] = 'Día de la Independencia';
  holidays[`${year}-08-07`] = 'Batalla de Boyacá';
  holidays[`${year}-12-08`] = 'Inmaculada Concepción';
  holidays[`${year}-12-25`] = 'Navidad';

  // 2. Ley Emiliani Holidays (moved to next Monday)
  holidays[formatDateKey(moveEmiliani(year, 0, 6))] = 'Día de los Reyes Magos';
  holidays[formatDateKey(moveEmiliani(year, 2, 19))] = 'Día de San José';
  holidays[formatDateKey(moveEmiliani(year, 5, 29))] = 'San Pedro y San Pablo';
  holidays[formatDateKey(moveEmiliani(year, 7, 15))] = 'Asunción de la Virgen';
  holidays[formatDateKey(moveEmiliani(year, 9, 12))] = 'Día de la Raza';
  holidays[formatDateKey(moveEmiliani(year, 10, 1))] = 'Todos los Santos';
  holidays[formatDateKey(moveEmiliani(year, 10, 11))] = 'Independencia de Cartagena';

  // 3. Easter-relative Holidays
  const easter = getEasterSunday(year);

  // Jueves Santo (Easter - 3 days)
  const juevesSanto = new Date(easter);
  juevesSanto.setDate(easter.getDate() - 3);
  holidays[formatDateKey(juevesSanto)] = 'Jueves Santo';

  // Viernes Santo (Easter - 2 days)
  const viernesSanto = new Date(easter);
  viernesSanto.setDate(easter.getDate() - 2);
  holidays[formatDateKey(viernesSanto)] = 'Viernes Santo';

  // Ascensión del Señor (Easter + 43 days)
  const ascension = new Date(easter);
  ascension.setDate(easter.getDate() + 43);
  holidays[formatDateKey(ascension)] = 'Ascensión del Señor';

  // Corpus Christi (Easter + 64 days)
  const corpusChristi = new Date(easter);
  corpusChristi.setDate(easter.getDate() + 64);
  holidays[formatDateKey(corpusChristi)] = 'Corpus Christi';

  // Sagrado Corazón (Easter + 71 days)
  const sagradoCorazon = new Date(easter);
  sagradoCorazon.setDate(easter.getDate() + 71);
  holidays[formatDateKey(sagradoCorazon)] = 'Sagrado Corazón de Jesús';

  return holidays;
}

export function checkColombianHoliday(dateStr: string): HolidayInfo {
  if (!dateStr || dateStr.length < 10) return { isHoliday: false };
  const year = parseInt(dateStr.substring(0, 4), 10);
  if (isNaN(year)) return { isHoliday: false };

  const holidays = getColombianHolidaysForYear(year);
  if (holidays[dateStr]) {
    return {
      isHoliday: true,
      name: holidays[dateStr]
    };
  }

  return { isHoliday: false };
}
