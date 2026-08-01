import React, { useState } from 'react';
import { MasterState } from '../../types/store';
import { OvalOfficeCalculations } from './OvalOfficeCalculations';
import { AcademicCalculations } from '../academic/AcademicCalculations';
import { DailyLifeCalculations } from '../dailyLife/DailyLifeCalculations';
import { FinancialCalculations } from '../financial/FinancialCalculations';
import { SocialCalculations } from '../social/SocialCalculations';
import { MedicalCalculations } from '../medical/MedicalCalculations';
import { getTodayDateString, getGreetingByTime, formatLongDate } from '../../utils/dates';
import { formatCurrency } from '../../utils/formatters';
import { Crown, Calendar, AlertTriangle, ShieldAlert, Clock, CheckCircle2, Flag, Landmark, Activity, Heart, BookOpen } from 'lucide-react';

interface Props {
  state: MasterState;
  onNavigateToOffice: (officeKey: string) => void;
  onActivateEmergencyLock: () => void;
}

export const OvalOfficeView: React.FC<Props> = ({ state, onNavigateToOffice, onActivateEmergencyLock }) => {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const todayStr = getTodayDateString();
  const greeting = getGreetingByTime(state.security.userProfile?.fullName?.split(' ')[0] || 'Alex');

  // Unified projected events for selected date
  const events = OvalOfficeCalculations.getUnifiedEventsForDate(state, selectedDate);
  const conflicts = OvalOfficeCalculations.detectScheduleConflicts(events);

  // Office summaries
  const gpa = AcademicCalculations.calculateGlobalGPA(state.offices.academica);
  const habitComp = DailyLifeCalculations.calculateHabitComplianceToday(state.offices.vidaDiaria, selectedDate);
  const liquidNW = FinancialCalculations.calculateLiquidNetWorth(state.offices.financiera);
  const todayMMDD = selectedDate.substring(5);
  const bdaysToday = SocialCalculations.getTodayBirthdays(state.offices.vidaSocial.people, todayMMDD);
  const todayHoliday = SocialCalculations.getTodayColombianHoliday(todayMMDD);
  const healthMetrics = MedicalCalculations.getLatestHealthMetrics(state.offices.medica);

  return (
    <div className="space-y-6">
      {/* 1. HERO INSTITUCIONAL DESPACHO OVAL */}
      <div className="bg-[#0A192F] text-white p-6 md:p-8 border border-[#D1C7B7] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 translate-x-12 -translate-y-12 w-64 h-64 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059]">
                <Crown className="w-5 h-5" />
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-[#C5A059]">
                Centro de Inteligencia y Coordinación Ejecutiva
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-white">
              Despacho Oval
            </h1>
            <p className="text-white/70 text-xs font-serif italic mt-1">
              {greeting} • {formatLongDate(selectedDate)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-white/10 text-white border border-white/20 text-xs font-sans px-3 py-1.5 focus:outline-none focus:border-[#C5A059]"
            />
            <button
              onClick={onActivateEmergencyLock}
              className="bg-rose-900/80 hover:bg-rose-800 border border-rose-500/50 text-rose-100 text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 uppercase tracking-wider transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-300" /> Cierre de Emergencia
            </button>
          </div>
        </div>
      </div>

      {/* ALERTAS DE CONFLICТО EN HORARIO */}
      {conflicts.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-300 border-l-4 border-l-rose-700 space-y-1">
          <div className="flex items-center gap-2 font-bold text-rose-900 text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-rose-700" />
            Conflicto de Horario Detectado en la Agenda
          </div>
          {conflicts.map((c, idx) => (
            <div key={idx} className="text-xs text-rose-950 font-sans">
              • Solapamiento entre <strong>{c.eventA.title}</strong> ({c.eventA.startTime}-{c.eventA.endTime}) y <strong>{c.eventB.title}</strong> ({c.eventB.startTime}-{c.eventB.endTime}).
            </div>
          ))}
        </div>
      )}

      {/* 2. ESTADO GENERAL DEL DÍA (RESÚMENES POR OFICINA) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Académica */}
        <div
          onClick={() => onNavigateToOffice('academica')}
          className="bg-white border border-[#D1C7B7] border-l-4 border-l-blue-900 p-4 hover:border-[#C5A059] cursor-pointer transition-all space-y-1 shadow-sm"
        >
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-[#8B8378]">
            <span className="flex items-center gap-1 text-blue-900"><BookOpen className="w-3.5 h-3.5" /> Académica</span>
            <span className="text-[#8B8378]">→</span>
          </div>
          <div className="text-2xl font-serif font-bold text-[#0A192F] mt-1">
            {gpa !== null ? gpa.toFixed(2) : 'N/A'} <span className="text-xs font-sans font-normal text-[#8B8378]">PGA</span>
          </div>
          <div className="text-[11px] text-[#8B8378] truncate">
            {state.offices.academica.evaluations.filter(e => e.date === selectedDate).length} eval. hoy
          </div>
        </div>

        {/* Vida Diaria */}
        <div
          onClick={() => onNavigateToOffice('vidaDiaria')}
          className="bg-white border border-[#D1C7B7] border-l-4 border-l-emerald-800 p-4 hover:border-[#C5A059] cursor-pointer transition-all space-y-1 shadow-sm"
        >
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-[#8B8378]">
            <span className="flex items-center gap-1 text-emerald-800"><Activity className="w-3.5 h-3.5" /> Vida Diaria</span>
            <span className="text-[#8B8378]">→</span>
          </div>
          <div className="text-2xl font-serif font-bold text-[#0A192F] mt-1">
            {habitComp.percent}% <span className="text-xs font-sans font-normal text-[#8B8378]">hábitos</span>
          </div>
          <div className="text-[11px] text-[#8B8378] truncate">
            {habitComp.completed}/{habitComp.total} cumplidos hoy
          </div>
        </div>

        {/* Financiera */}
        <div
          onClick={() => onNavigateToOffice('financiera')}
          className="bg-white border border-[#D1C7B7] border-l-4 border-l-[#C5A059] p-4 hover:border-[#C5A059] cursor-pointer transition-all space-y-1 shadow-sm"
        >
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-[#8B8378]">
            <span className="flex items-center gap-1 text-[#C5A059]"><Landmark className="w-3.5 h-3.5" /> Financiera</span>
            <span className="text-[#8B8378]">→</span>
          </div>
          <div className="text-lg font-serif font-bold text-[#0A192F] mt-1 truncate">
            {formatCurrency(liquidNW.COP || 0, 'COP')}
          </div>
          <div className="text-[11px] text-[#8B8378] truncate">
            {state.offices.financiera.obligations.filter(o => !o.isPaid).length} obligaciones pend.
          </div>
        </div>

        {/* Vida Social */}
        <div
          onClick={() => onNavigateToOffice('vidaSocial')}
          className="bg-white border border-[#D1C7B7] border-l-4 border-l-rose-800 p-4 hover:border-[#C5A059] cursor-pointer transition-all space-y-1 shadow-sm"
        >
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-[#8B8378]">
            <span className="flex items-center gap-1 text-rose-800"><Flag className="w-3.5 h-3.5" /> Vida Social</span>
            <span className="text-[#8B8378]">→</span>
          </div>
          <div className="text-2xl font-serif font-bold text-[#0A192F] mt-1">
            {bdaysToday.length > 0 ? `🎂 ${bdaysToday.length}` : 'Ordinario'}
          </div>
          <div className="text-[11px] text-[#8B8378] truncate">
            {todayHoliday ? todayHoliday.title : 'Sin festivos patrios'}
          </div>
        </div>

        {/* Médica */}
        <div
          onClick={() => onNavigateToOffice('medica')}
          className="bg-white border border-[#D1C7B7] border-l-4 border-l-cyan-900 p-4 hover:border-[#C5A059] cursor-pointer transition-all space-y-1 shadow-sm"
        >
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-[#8B8378]">
            <span className="flex items-center gap-1 text-cyan-900"><Heart className="w-3.5 h-3.5" /> Médica</span>
            <span className="text-[#8B8378]">→</span>
          </div>
          <div className="text-2xl font-serif font-bold text-[#0A192F] mt-1">
            {healthMetrics.sleep !== null ? `${healthMetrics.sleep}h sueño` : 'Sin datos'}
          </div>
          <div className="text-[11px] text-[#8B8378] truncate">
            {state.offices.medica.appointments.length} citas registradas
          </div>
        </div>
      </div>

      {/* 3. HORARIO EJECUTIVO (TIMELINE DE HOY) */}
      <div className="bg-white border border-[#D1C7B7] p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-[#E8E4D8] pb-3">
          <div>
            <h3 className="font-serif font-bold text-[#0A192F] text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#C5A059]" /> Horario Ejecutivo Unificado
            </h3>
            <p className="text-xs text-[#8B8378] italic font-serif">
              Proyección cronológica integrada para {selectedDate}
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold bg-[#F4F1EA] text-[#0A192F] px-3 py-1 border border-[#D1C7B7]">
            {events.length} Eventos Proyectados
          </span>
        </div>

        {events.length === 0 ? (
          <div className="p-8 text-center text-[#8B8378] bg-[#F9F7F2] border border-dashed border-[#D1C7B7]">
            No hay eventos u obligaciones programadas para esta fecha en ninguna oficina.
          </div>
        ) : (
          <div className="space-y-3 relative before:absolute before:inset-0 before:left-24 before:w-px before:bg-[#D1C7B7]">
            {events.map((evt, idx) => (
              <div key={evt.id || idx} className="flex items-start gap-4 relative z-10">
                {/* Time Badge */}
                <div className="w-20 text-right text-xs font-mono font-bold text-[#0A192F] pt-2 shrink-0">
                  {evt.startTime || '08:00'} - {evt.endTime || '09:00'}
                </div>

                {/* Card */}
                <div
                  className="flex-1 p-3.5 bg-[#F9F7F2] border border-[#E8E4D8] hover:border-[#D1C7B7] transition-all flex justify-between items-center"
                  style={{ borderLeftWidth: '4px', borderLeftColor: evt.color || '#C5A059' }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-[#0A192F] text-white">
                        {evt.officeLabel}
                      </span>
                      {evt.priority === 'high' && (
                        <span className="text-[9px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 border border-rose-200 uppercase tracking-widest">
                          Prioritario
                        </span>
                      )}
                    </div>
                    <div className="font-bold font-serif text-[#0A192F] text-base mt-1">{evt.title}</div>
                    {evt.subtitle && <div className="text-xs text-[#8B8378] mt-0.5 font-sans">{evt.subtitle}</div>}
                  </div>

                  <button
                    onClick={() => onNavigateToOffice(evt.sourceOffice)}
                    className="text-[10px] uppercase tracking-wider text-[#0A192F] font-bold px-3 py-1 bg-white hover:bg-[#F4F1EA] border border-[#D1C7B7] transition-colors"
                  >
                    Ver Oficina →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
