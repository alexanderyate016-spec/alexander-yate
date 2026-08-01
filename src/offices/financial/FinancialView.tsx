import React, { useState } from 'react';
import { FinancialOfficeData, CurrencyCode, TransactionNature } from '../../types/store';
import { FinancialStore } from './FinancialStore';
import { FinancialCalculations } from './FinancialCalculations';
import { getTodayDateString, getCurrentTimeString } from '../../utils/dates';
import { formatCurrency } from '../../utils/formatters';
import {
  GlassPanel,
  ExecutiveCard,
  ExecutiveButton,
  ExecutiveMetricCard,
  ExecutiveSectionHeader,
  ExecutiveBadge,
  ExecutiveEmptyState,
  ExecutiveInput,
  ExecutiveSelect,
  ExecutiveForm,
} from '../../components/executive';
import {
  Landmark,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Plus,
  Trash2,
  Calendar,
  CreditCard,
  DollarSign,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Props {
  data: FinancialOfficeData;
}

export const FinancialView: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'transactions' | 'obligations'>('accounts');
  const [searchQuery, setSearchQuery] = useState('');
  const todayStr = getTodayDateString();
  const timeStr = getCurrentTimeString();

  // New Account state
  const [accName, setAccName] = useState('');
  const [accInst, setAccInst] = useState('');
  const [accType, setAccType] = useState<'cash' | 'checking' | 'savings' | 'high_yield' | 'digital_wallet' | 'investment' | 'other'>('savings');
  const [accCurrency, setAccCurrency] = useState<CurrencyCode>('COP');
  const [accInitial, setAccInitial] = useState<number | ''>('');
  const [accInterest, setAccInterest] = useState<number | ''>('');

  // New Transaction state
  const [txNature, setTxNature] = useState<TransactionNature>('external_expense');
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState<number | ''>('');
  const [txCurr, setTxCurr] = useState<CurrencyCode>('COP');
  const [txSourceAcc, setTxSourceAcc] = useState('');

  // New Obligation state
  const [obTitle, setObTitle] = useState('');
  const [obAmount, setObAmount] = useState<number | ''>('');
  const [obCurr, setObCurr] = useState<CurrencyCode>('COP');
  const [obDueDate, setObDueDate] = useState(todayStr);

  const liquidNW = FinancialCalculations.calculateLiquidNetWorth(data);
  const totalNW = FinancialCalculations.calculateTotalNetWorth(data);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName) return;
    FinancialStore.addAccount({
      name: accName,
      institution: accInst || 'Entidad Financiera',
      type: accType,
      currency: accCurrency,
      initialBalance: Number(accInitial || 0),
      annualInterestRate: accType === 'high_yield' && accInterest ? Number(accInterest) : undefined
    });
    setAccName('');
    setAccInst('');
    setAccInitial('');
    setAccInterest('');
  };

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc || !txAmount || Number(txAmount) <= 0) return;
    FinancialStore.addTransaction({
      date: todayStr,
      time: timeStr,
      nature: txNature,
      description: txDesc,
      amount: Number(txAmount),
      currency: txCurr,
      sourceAccountId: txSourceAcc || undefined,
      tags: []
    });
    setTxDesc('');
    setTxAmount('');
  };

  const handleCreateObligation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obTitle || !obAmount || Number(obAmount) <= 0) return;
    FinancialStore.addObligation({
      title: obTitle,
      amount: Number(obAmount),
      currency: obCurr,
      dueDate: obDueDate,
      frequency: 'monthly',
      category: 'Obligación Recurrente'
    });
    setObTitle('');
    setObAmount('');
  };

  const filteredTransactions = data.transactions.filter(t => 
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.nature.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-12">
      {/* 1. SECTION HEADER INSTITUCIONAL (EMERALD ACCENT) */}
      <ExecutiveSectionHeader
        title="Oficina Financiera"
        subtitle="Agencia Superior de Gestión Patrimonial, Cuentas y Control Presupuestario"
        icon={<Landmark className="w-6 h-6 text-emerald-400" />}
        accentColor="emerald"
        badgeText="Patrimonio & Cuentas"
        searchQuery={activeTab === 'transactions' ? searchQuery : undefined}
        onSearchChange={activeTab === 'transactions' ? setSearchQuery : undefined}
        searchPlaceholder="Buscar en movimientos..."
      />

      {/* 2. DASHBOARD DE INDICADORES FINANCIEROS REALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ExecutiveMetricCard
          title="Patrimonio Líquido (COP)"
          value={formatCurrency(liquidNW.COP || 0, 'COP')}
          subtitle="Efectivo + Bancos + Billeteras"
          icon={<Wallet className="w-5 h-5" />}
          accentColor="emerald"
        />

        <ExecutiveMetricCard
          title="Patrimonio Total (COP)"
          value={formatCurrency(totalNW.COP || 0, 'COP')}
          subtitle="Líquido + Alto Rendimiento + Inversiones"
          icon={<TrendingUp className="w-5 h-5 text-emerald-300" />}
          accentColor="emerald"
        />

        <ExecutiveMetricCard
          title="Cuentas Registradas"
          value={data.accounts.length}
          subtitle={`Monedas: ${Array.from(new Set(data.accounts.map(a => a.currency))).join(', ') || 'Sin cuentas'}`}
          icon={<CreditCard className="w-5 h-5" />}
          accentColor="emerald"
        />

        <ExecutiveMetricCard
          title="Obligaciones Pendientes"
          value={data.obligations.filter(o => !o.isPaid).length}
          subtitle="Pagos recurrentes por saldar"
          icon={<AlertCircle className="w-5 h-5 text-rose-400" />}
          accentColor="rose"
        />
      </div>

      {/* 3. TABS DE NAVEGACIÓN DE LA OFICINA */}
      <div className="flex border-b border-white/10 space-x-2">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'accounts'
              ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Cuentas & Tesorería ({data.accounts.length})
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'transactions'
              ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Movimientos ({data.transactions.length})
        </button>

        <button
          onClick={() => setActiveTab('obligations')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'obligations'
              ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Obligaciones Recurrentes ({data.obligations.length})
        </button>
      </div>

      {/* TAB 1: CUENTAS BANCARIAS Y BILLETERAS */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          <GlassPanel accentColor="emerald" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              Apertura y Registro de Nueva Cuenta Financiera
            </h3>

            <ExecutiveForm onSubmit={handleCreateAccount}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                <div className="lg:col-span-2">
                  <ExecutiveInput
                    label="Nombre de la Cuenta *"
                    placeholder="Ej: Ahorros Principal Bancolombia"
                    value={accName}
                    onChange={e => setAccName(e.target.value)}
                    accentColor="emerald"
                    required
                  />
                </div>

                <div>
                  <ExecutiveInput
                    label="Entidad / Banco"
                    placeholder="Ej: Bancolombia / Lulo Bank"
                    value={accInst}
                    onChange={e => setAccInst(e.target.value)}
                    accentColor="emerald"
                  />
                </div>

                <div>
                  <ExecutiveSelect
                    label="Tipo de Cuenta"
                    value={accType}
                    onChange={e => setAccType(e.target.value as any)}
                    accentColor="emerald"
                    options={[
                      { value: 'savings', label: 'Ahorros' },
                      { value: 'checking', label: 'Corriente' },
                      { value: 'cash', label: 'Efectivo' },
                      { value: 'high_yield', label: 'Alto Rendimiento (Nu/Lulo)' },
                      { value: 'digital_wallet', label: 'Billetera Digital (Nequi/Daviplata)' },
                      { value: 'investment', label: 'Inversión' }
                    ]}
                  />
                </div>

                <div>
                  <ExecutiveSelect
                    label="Moneda Principal"
                    value={accCurrency}
                    onChange={e => setAccCurrency(e.target.value as any)}
                    accentColor="emerald"
                    options={[
                      { value: 'COP', label: 'COP ($)' },
                      { value: 'USD', label: 'USD ($)' },
                      { value: 'EUR', label: 'EUR (€)' },
                      { value: 'BTC', label: 'BTC (₿)' },
                      { value: 'ETH', label: 'ETH (Ξ)' }
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
                <ExecutiveInput
                  label="Saldo Inicial / Actual"
                  type="number"
                  placeholder="0.00"
                  value={accInitial}
                  onChange={e => setAccInitial(e.target.value === '' ? '' : Number(e.target.value))}
                  accentColor="emerald"
                />

                {accType === 'high_yield' && (
                  <ExecutiveInput
                    label="Tasa de Interés Anual (E.A. %)"
                    type="number"
                    step="0.1"
                    placeholder="Ej: 13.0"
                    value={accInterest}
                    onChange={e => setAccInterest(e.target.value === '' ? '' : Number(e.target.value))}
                    accentColor="emerald"
                    helperText="Calcula rendimiento diario automático"
                  />
                )}

                <div className="sm:col-span-1 flex justify-end">
                  <ExecutiveButton type="submit" variant="primary" accentColor="emerald" icon={<Plus className="w-4 h-4" />}>
                    Crear Cuenta
                  </ExecutiveButton>
                </div>
              </div>
            </ExecutiveForm>
          </GlassPanel>

          {/* LISTA DE CUENTAS */}
          {data.accounts.length === 0 ? (
            <ExecutiveEmptyState
              icon={<Landmark className="w-8 h-8 text-emerald-400" />}
              title="Sin Cuentas Registradas"
              description="No hay cuentas de tesorería registradas. Registra tu primera cuenta bancaria, efectivo o billetera digital arriba."
              accentColor="emerald"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.accounts.map(acc => {
                const calculatedBalance = FinancialCalculations.calculateAccountBalance(acc, data.transactions);
                const dailyYieldEst = FinancialCalculations.calculateDailyYieldEstimated(acc, data.transactions);

                return (
                  <ExecutiveCard
                    key={acc.id}
                    accentColor="emerald"
                    accentBorderLeft
                    header={
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-serif font-bold text-white text-base">{acc.name}</h4>
                          <p className="text-xs text-slate-400">{acc.institution} • {acc.type}</p>
                        </div>
                        <ExecutiveBadge variant="subtle" accentColor="emerald">
                          {acc.currency}
                        </ExecutiveBadge>
                      </div>
                    }
                    footer={
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-mono text-[10px]">ID: {acc.id.slice(0, 8)}</span>
                        <ExecutiveButton
                          variant="ghost"
                          size="sm"
                          onClick={() => FinancialStore.deleteAccount(acc.id)}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Eliminar
                        </ExecutiveButton>
                      </div>
                    }
                  >
                    <div className="space-y-3 py-1">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Balance Calculado</span>
                        <div className="text-2xl font-serif font-bold text-emerald-400 mt-0.5">
                          {formatCurrency(calculatedBalance, acc.currency)}
                        </div>
                      </div>

                      {acc.type === 'high_yield' && acc.annualInterestRate && (
                        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 space-y-0.5">
                          <div className="font-bold">TEA: {acc.annualInterestRate}%</div>
                          <div className="text-[11px] text-emerald-300">
                            Rendimiento diario est.: <strong>{formatCurrency(dailyYieldEst, acc.currency)}/día</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  </ExecutiveCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MOVIMIENTOS FINANCIEROS */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          <GlassPanel accentColor="emerald" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              Nuevo Registro de Movimiento Financiero
            </h3>

            <ExecutiveForm onSubmit={handleCreateTransaction}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                <div>
                  <ExecutiveSelect
                    label="Naturaleza *"
                    value={txNature}
                    onChange={e => setTxNature(e.target.value as any)}
                    accentColor="emerald"
                    options={[
                      { value: 'external_expense', label: 'Gasto / Salida Externa' },
                      { value: 'external_income', label: 'Ingreso Externo' },
                      { value: 'internal_transfer', label: 'Transferencia Interna' },
                      { value: 'financial_yield', label: 'Rendimiento Financiero' },
                      { value: 'reconciliation_adj', label: 'Ajuste de Conciliación' }
                    ]}
                  />
                </div>

                <div className="lg:col-span-2">
                  <ExecutiveInput
                    label="Descripción *"
                    placeholder="Ej: Pago de supermercado o nómina"
                    value={txDesc}
                    onChange={e => setTxDesc(e.target.value)}
                    accentColor="emerald"
                    required
                  />
                </div>

                <div>
                  <ExecutiveInput
                    label="Monto *"
                    type="number"
                    placeholder="0.00"
                    value={txAmount}
                    onChange={e => setTxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    accentColor="emerald"
                    required
                  />
                </div>

                <div>
                  <ExecutiveSelect
                    label="Cuenta de Origen"
                    value={txSourceAcc}
                    onChange={e => setTxSourceAcc(e.target.value)}
                    accentColor="emerald"
                    options={[
                      { value: '', label: '-- Sin especificar --' },
                      ...data.accounts.map(a => ({ value: a.id, label: `${a.name} (${a.currency})` }))
                    ]}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <ExecutiveButton type="submit" variant="primary" accentColor="emerald" icon={<Plus className="w-4 h-4" />}>
                  Guardar Movimiento
                </ExecutiveButton>
              </div>
            </ExecutiveForm>
          </GlassPanel>

          {/* HISTORIAL DE MOVIMIENTOS */}
          {filteredTransactions.length === 0 ? (
            <ExecutiveEmptyState
              icon={<DollarSign className="w-8 h-8 text-emerald-400" />}
              title="Sin Movimientos Registrados"
              description="No hay transacciones guardadas. Agrega tu primer movimiento financiero para actualizar balances."
              accentColor="emerald"
            />
          ) : (
            <div className="space-y-2.5">
              {filteredTransactions.map(tx => {
                const isIncome = tx.nature === 'external_income' || tx.nature === 'financial_yield';

                return (
                  <div
                    key={tx.id}
                    className="p-4 bg-[#132337]/80 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-between gap-4 hover:border-white/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${isIncome ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'}`}>
                        {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-white text-sm">{tx.description}</h4>
                        <div className="text-xs text-slate-400 font-mono">
                          {tx.date} • {tx.time} | <span className="uppercase text-slate-300">{tx.nature.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`text-base font-serif font-bold ${isIncome ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                      </span>
                      <button
                        onClick={() => FinancialStore.deleteTransaction(tx.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                        title="Eliminar movimiento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: OBLIGACIONES RECURRENTES */}
      {activeTab === 'obligations' && (
        <div className="space-y-6">
          <GlassPanel accentColor="emerald" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              Registrar Obligación / Pago Recurrente
            </h3>

            <ExecutiveForm onSubmit={handleCreateObligation}>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
                <div className="lg:col-span-2">
                  <ExecutiveInput
                    label="Concepto de la Obligación *"
                    placeholder="Ej: Matrícula Semestral / Arriendo"
                    value={obTitle}
                    onChange={e => setObTitle(e.target.value)}
                    accentColor="emerald"
                    required
                  />
                </div>

                <ExecutiveInput
                  label="Monto *"
                  type="number"
                  placeholder="0.00"
                  value={obAmount}
                  onChange={e => setObAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  accentColor="emerald"
                  required
                />

                <ExecutiveInput
                  label="Fecha Límite Vencimiento"
                  type="date"
                  value={obDueDate}
                  onChange={e => setObDueDate(e.target.value)}
                  accentColor="emerald"
                />
              </div>

              <div className="flex justify-end pt-2">
                <ExecutiveButton type="submit" variant="primary" accentColor="emerald" icon={<Plus className="w-4 h-4" />}>
                  Agregar Obligación
                </ExecutiveButton>
              </div>
            </ExecutiveForm>
          </GlassPanel>

          {data.obligations.length === 0 ? (
            <ExecutiveEmptyState
              icon={<Calendar className="w-8 h-8 text-emerald-400" />}
              title="Sin Obligaciones Pendientes"
              description="No hay compromisos u obligaciones financieras registradas."
              accentColor="emerald"
            />
          ) : (
            <div className="space-y-3">
              {data.obligations.map(ob => (
                <div
                  key={ob.id}
                  className={`p-4 bg-[#132337]/80 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-between gap-4 transition-all ${
                    ob.isPaid ? 'opacity-60 bg-[#0B1528]/50' : 'hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={ob.isPaid}
                      onChange={() => FinancialStore.toggleObligationPaid(ob.id)}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 cursor-pointer accent-emerald-500"
                    />
                    <div>
                      <h4 className={`font-serif font-bold text-sm ${ob.isPaid ? 'line-through text-slate-400' : 'text-white'}`}>
                        {ob.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">
                        Monto: <strong className="text-emerald-300">{formatCurrency(ob.amount, ob.currency)}</strong> • Vence: {ob.dueDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ExecutiveBadge variant={ob.isPaid ? 'subtle' : 'solid'} accentColor={ob.isPaid ? 'emerald' : 'rose'}>
                      {ob.isPaid ? 'PAGADO' : 'PENDIENTE'}
                    </ExecutiveBadge>
                    <button
                      onClick={() => FinancialStore.deleteObligation(ob.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
