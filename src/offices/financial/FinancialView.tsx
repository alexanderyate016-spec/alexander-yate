import React, { useState } from 'react';
import { FinancialOfficeData, CurrencyCode, TransactionNature } from '../../types/store';
import { FinancialStore } from './FinancialStore';
import { FinancialCalculations } from './FinancialCalculations';
import { getTodayDateString, getCurrentTimeString } from '../../utils/dates';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { Wallet, Landmark, ArrowUpRight, ArrowDownRight, RefreshCw, TrendingUp, Plus, Trash2, Calendar } from 'lucide-react';

interface Props {
  data: FinancialOfficeData;
}

export const FinancialView: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'transactions' | 'obligations' | 'investments'>('accounts');
  const todayStr = getTodayDateString();
  const timeStr = getCurrentTimeString();

  // New Account state
  const [accName, setAccName] = useState('');
  const [accInst, setAccInst] = useState('');
  const [accType, setAccType] = useState<'cash' | 'checking' | 'savings' | 'high_yield' | 'digital_wallet' | 'investment' | 'other'>('savings');
  const [accCurrency, setAccCurrency] = useState<CurrencyCode>('COP');
  const [accInitial, setAccInitial] = useState(0);
  const [accInterest, setAccInterest] = useState(0);

  // New Transaction state
  const [txNature, setTxNature] = useState<TransactionNature>('external_expense');
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState(0);
  const [txCurr, setTxCurr] = useState<CurrencyCode>('COP');
  const [txSourceAcc, setTxSourceAcc] = useState('');
  const [txDestAcc, setTxDestAcc] = useState('');

  // New Obligation state
  const [obTitle, setObTitle] = useState('');
  const [obAmount, setObAmount] = useState(0);
  const [obCurr, setObCurr] = useState<CurrencyCode>('COP');
  const [obDueDate, setObDueDate] = useState(todayStr);

  const liquidNW = FinancialCalculations.calculateLiquidNetWorth(data);
  const totalNW = FinancialCalculations.calculateTotalNetWorth(data);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName) return;
    FinancialStore.addAccount({
      name: accName,
      institution: accInst || 'Entidad financiera',
      type: accType,
      currency: accCurrency,
      initialBalance: Number(accInitial),
      annualInterestRate: accType === 'high_yield' ? Number(accInterest) : undefined
    });
    setAccName('');
    setAccInst('');
    setAccInitial(0);
  };

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc || txAmount <= 0) return;
    FinancialStore.addTransaction({
      date: todayStr,
      time: timeStr,
      nature: txNature,
      description: txDesc,
      amount: Number(txAmount),
      currency: txCurr,
      sourceAccountId: txSourceAcc || undefined,
      destinationAccountId: txDestAcc || undefined,
      tags: []
    });
    setTxDesc('');
    setTxAmount(0);
  };

  const handleCreateObligation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obTitle || obAmount <= 0) return;
    FinancialStore.addObligation({
      title: obTitle,
      amount: Number(obAmount),
      currency: obCurr,
      dueDate: obDueDate,
      frequency: 'monthly',
      category: 'Obligación general'
    });
    setObTitle('');
    setObAmount(0);
  };

  return (
    <div className="space-y-6">
      {/* 1. ENCABEZADO INSTITUCIONAL DE LA OFICINA */}
      <div className="bg-presidential-navy text-white p-6 rounded-lg border-b-2 border-gold-accent flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-900/60 rounded border border-amber-700/50 text-amber-300">
              <Landmark className="w-6 h-6 text-gold-accent" />
            </span>
            <h2 className="text-2xl font-serif-presidential font-bold tracking-tight text-white">
              Oficina Financiera
            </h2>
          </div>
          <p className="text-slate-300 text-sm mt-1">
            Agencia Superior de Gestión Patrimonial, Cuentas e Inversiones
          </p>
        </div>
      </div>

      {/* 2. PANEL GENERAL CON INDICADORES DE PATRIMONIO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="presidential-card p-4 rounded-lg">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patrimonio Líquido (COP)</div>
          <div className="text-2xl font-serif-presidential font-bold text-slate-900 mt-1">
            {formatCurrency(liquidNW.COP || 0, 'COP')}
          </div>
          <div className="text-xs text-slate-500 mt-1">Efectivo + Bancos + Billeteras</div>
        </div>

        <div className="presidential-card p-4 rounded-lg">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patrimonio Total (COP)</div>
          <div className="text-2xl font-serif-presidential font-bold text-amber-700 mt-1">
            {formatCurrency(totalNW.COP || 0, 'COP')}
          </div>
          <div className="text-xs text-slate-500 mt-1">Líquido + Inversiones + Alto Rendimiento</div>
        </div>

        <div className="presidential-card p-4 rounded-lg">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cuentas Registradas</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{data.accounts.length}</div>
          <div className="text-xs text-slate-500 mt-1">Monedas: {Array.from(new Set(data.accounts.map(a => a.currency))).join(', ') || 'Ninguna'}</div>
        </div>

        <div className="presidential-card p-4 rounded-lg">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Obligaciones Próximas</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            {data.obligations.filter(o => !o.isPaid).length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Pagos pendientes por saldar</div>
        </div>
      </div>

      {/* PESTAÑAS */}
      <div className="border-b border-slate-200 flex space-x-4">
        <button onClick={() => setActiveTab('accounts')} className={`pb-3 text-sm font-semibold border-b-2 ${activeTab === 'accounts' ? 'border-amber-700 text-amber-950' : 'border-transparent text-slate-500'}`}>
          Cuentas ({data.accounts.length})
        </button>
        <button onClick={() => setActiveTab('transactions')} className={`pb-3 text-sm font-semibold border-b-2 ${activeTab === 'transactions' ? 'border-amber-700 text-amber-950' : 'border-transparent text-slate-500'}`}>
          Movimientos Financieros ({data.transactions.length})
        </button>
        <button onClick={() => setActiveTab('obligations')} className={`pb-3 text-sm font-semibold border-b-2 ${activeTab === 'obligations' ? 'border-amber-700 text-amber-950' : 'border-transparent text-slate-500'}`}>
          Obligaciones Recurrentes ({data.obligations.length})
        </button>
      </div>

      {/* TAB 1: CUENTAS */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          <div className="presidential-card p-5 rounded-lg">
            <h3 className="font-serif-presidential font-bold text-slate-900 text-base mb-3">
              Registrar Nueva Cuenta
            </h3>
            <form onSubmit={handleCreateAccount} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 items-end">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre de la cuenta *</label>
                <input type="text" placeholder="Ej: Cuenta Ahorros Principal" value={accName} onChange={e => setAccName(e.target.value)} className="w-full text-xs p-2 border rounded bg-white" required />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Entidad / Banco</label>
                <input type="text" placeholder="Ej: Bancolombia" value={accInst} onChange={e => setAccInst(e.target.value)} className="w-full text-xs p-2 border rounded bg-white" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tipo & Moneda</label>
                <div className="flex gap-1">
                  <select value={accType} onChange={e => setAccType(e.target.value as any)} className="w-1/2 text-xs p-2 border rounded bg-white">
                    <option value="savings">Ahorros</option>
                    <option value="checking">Corriente</option>
                    <option value="cash">Efectivo</option>
                    <option value="high_yield">Alto Rendimiento</option>
                    <option value="digital_wallet">Billetera Digital</option>
                    <option value="investment">Inversión</option>
                  </select>
                  <select value={accCurrency} onChange={e => setAccCurrency(e.target.value as any)} className="w-1/2 text-xs p-2 border rounded bg-white font-bold">
                    <option value="COP">COP</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Saldo Inicial</label>
                <input type="number" value={accInitial} onChange={e => setAccInitial(Number(e.target.value))} className="w-full text-xs p-2 border rounded bg-white" />
              </div>

              <button type="submit" className="bg-amber-700 text-white font-bold text-xs p-2 rounded hover:bg-amber-800">
                + Crear Cuenta
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.accounts.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded border border-dashed border-slate-200">
                No hay cuentas bancarias registradas. Comienza registrando tu primera cuenta.
              </div>
            ) : (
              data.accounts.map(acc => {
                const calculatedBalance = FinancialCalculations.calculateAccountBalance(acc, data.transactions);
                const dailyEstYield = FinancialCalculations.calculateDailyYieldEstimated(acc, data.transactions);

                return (
                  <div key={acc.id} className="presidential-card p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-900 text-base">{acc.name}</span>
                        <div className="text-xs text-slate-500">{acc.institution} ({acc.type})</div>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        {acc.currency}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Balance Calculado</div>
                      <div className="text-2xl font-serif-presidential font-bold text-slate-900 mt-0.5">
                        {formatCurrency(calculatedBalance, acc.currency)}
                      </div>
                    </div>

                    {acc.type === 'high_yield' && acc.annualInterestRate && (
                      <div className="p-2 bg-amber-50 rounded border border-amber-200 text-xs text-amber-900">
                        <div>TEA: <strong>{acc.annualInterestRate}%</strong></div>
                        <div>Rendimiento diario est.: <strong>{formatCurrency(dailyEstYield, acc.currency)}/día</strong></div>
                      </div>
                    )}

                    <div className="text-right pt-1 border-t border-slate-100">
                      <button onClick={() => FinancialStore.deleteAccount(acc.id)} className="text-xs text-rose-600 hover:underline">
                        Eliminar Cuenta
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MOVIMIENTOS */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          <div className="presidential-card p-5 rounded-lg space-y-4">
            <h3 className="font-serif-presidential font-bold text-slate-900 text-base">
              Registrar Nuevo Movimiento Financiero
            </h3>
            <form onSubmit={handleCreateTransaction} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Naturaleza</label>
                <select value={txNature} onChange={e => setTxNature(e.target.value as any)} className="w-full text-xs p-2 border rounded bg-white text-slate-900">
                  <option value="external_expense">Gasto / Salida Externa</option>
                  <option value="external_income">Ingreso Externo</option>
                  <option value="internal_transfer">Transferencia Interna</option>
                  <option value="financial_yield">Rendimiento Financiero</option>
                  <option value="reconciliation_adj">Ajuste de Conciliación</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Descripción</label>
                <input type="text" placeholder="Ej: Compra de mercado semanal" value={txDesc} onChange={e => setTxDesc(e.target.value)} className="w-full text-xs p-2 border rounded bg-white text-slate-900" required />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Monto & Moneda</label>
                <div className="flex gap-1">
                  <input type="number" placeholder="Monto" value={txAmount || ''} onChange={e => setTxAmount(Number(e.target.value))} className="w-2/3 text-xs p-2 border rounded bg-white" required />
                  <select value={txCurr} onChange={e => setTxCurr(e.target.value as any)} className="w-1/3 text-xs p-2 border rounded bg-white font-bold">
                    <option value="COP">COP</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="bg-slate-900 text-white font-bold text-xs p-2 rounded hover:bg-slate-800">
                + Guardar Movimiento
              </button>
            </form>
          </div>

          <div className="space-y-2">
            {data.transactions.map(tx => (
              <div key={tx.id} className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{tx.description}</div>
                  <div className="text-xs text-slate-500">{tx.date} {tx.time} | Naturaleza: {tx.nature}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-serif-presidential font-bold text-sm ${tx.nature === 'external_income' || tx.nature === 'financial_yield' ? 'text-emerald-700' : 'text-slate-900'}`}>
                    {tx.nature === 'external_income' || tx.nature === 'financial_yield' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                  </span>
                  <button onClick={() => FinancialStore.deleteTransaction(tx.id)} className="text-slate-400 hover:text-rose-600">×</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: OBLIGACIONES */}
      {activeTab === 'obligations' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateObligation} className="presidential-card p-4 rounded-lg flex flex-wrap gap-2 items-center">
            <input type="text" placeholder="Obligación (Ej: Matrícula Universidad / Arriendo)" value={obTitle} onChange={e => setObTitle(e.target.value)} className="text-xs p-2 border rounded bg-white flex-1 min-w-[180px]" required />
            <input type="number" placeholder="Monto" value={obAmount || ''} onChange={e => setObAmount(Number(e.target.value))} className="w-24 text-xs p-2 border rounded bg-white" required />
            <input type="date" value={obDueDate} onChange={e => setObDueDate(e.target.value)} className="text-xs p-2 border rounded bg-white" />
            <button type="submit" className="text-xs bg-rose-700 text-white font-bold px-4 py-2 rounded hover:bg-rose-800">
              + Agregar Obligación
            </button>
          </form>

          <div className="space-y-2">
            {data.obligations.map(ob => (
              <div key={ob.id} className={`p-3 bg-white border rounded-lg flex justify-between items-center ${ob.isPaid ? 'opacity-60 bg-slate-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={ob.isPaid} onChange={() => FinancialStore.toggleObligationPaid(ob.id)} className="w-4 h-4 text-emerald-600 rounded cursor-pointer" />
                  <span className={`text-sm font-semibold ${ob.isPaid ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {ob.title} - {formatCurrency(ob.amount, ob.currency)}
                  </span>
                  <span className="text-xs text-slate-500">Vence: {ob.dueDate}</span>
                </div>
                <button onClick={() => FinancialStore.deleteObligation(ob.id)} className="text-slate-400 hover:text-rose-600">×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
