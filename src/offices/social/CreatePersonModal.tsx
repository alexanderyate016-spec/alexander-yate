import React, { useState } from 'react';
import { SocialStore } from './SocialStore';
import { X, UserPlus, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePersonModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [relationship, setRelationship] = useState('');
  const [category, setCategory] = useState<'Familia' | 'Amigos' | 'Compañeros de universidad' | 'Profesores' | 'Trabajo' | 'Otros'>('Amigos');
  const [importanceLevel, setImportanceLevel] = useState<'Muy importante' | 'Importante' | 'Frecuente' | 'Ocasional'>('Importante');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [birthday, setBirthday] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    SocialStore.addPerson({
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      relationship: relationship.trim() || category,
      category,
      importanceLevel,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      city: city.trim() || undefined,
      birthday: birthday || undefined,
      photoUrl: photoUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      tags: []
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#09111e] border border-purple-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 text-slate-900 shadow-2xl relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-700 hover:text-slate-900"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pr-8">
          <div className="p-2.5 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-purple-300">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-900">Registrar Nueva Persona</h3>
            <p className="text-xs text-slate-500">Añadir una persona importante a tu red de relaciones</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Nombre Completo *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Ej. Laura Gómez"
                className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Apodo (Opcional)</label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="Ej. Lau"
                className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Relación Conmigo</label>
              <input
                type="text"
                value={relationship}
                onChange={e => setRelationship(e.target.value)}
                placeholder="Ej. Amiga de infancia, Prima"
                className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Categoría</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
              >
                <option value="Amigos">Amigos</option>
                <option value="Familia">Familia</option>
                <option value="Compañeros de universidad">Compañeros de universidad</option>
                <option value="Trabajo">Trabajo</option>
                <option value="Profesores">Profesores</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Importancia</label>
              <select
                value={importanceLevel}
                onChange={e => setImportanceLevel(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
              >
                <option value="Muy importante">⭐ Muy importante (Prioridad)</option>
                <option value="Importante">🔹 Importante</option>
                <option value="Frecuente">💬 Frecuente</option>
                <option value="Ocasional">🌱 Ocasional</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Cumpleaños</label>
              <input
                type="date"
                value={birthday}
                onChange={e => setBirthday(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Teléfono</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+57 300 000 0000"
                className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Fotografía (URL)</label>
              <input
                type="url"
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-900"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-slate-900 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Persona</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
