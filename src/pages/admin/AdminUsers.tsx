import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Trash2, CheckCircle2, Lock } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const AdminUsers: React.FC = () => {
  const { adminUsers, currentAdmin, createAdminUser, deleteAdminUser } = useAdmin();

  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'super_admin' | 'admin' | 'manager'>('admin');
  const [feedback, setFeedback] = useState<{ success: boolean; text: string } | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) return;

    const ok = await createAdminUser(newEmail.trim(), newName.trim(), newRole);
    if (ok) {
      setFeedback({ success: true, text: `Administrador "${newName}" adicionado com sucesso!` });
      setNewEmail('');
      setNewName('');
    } else {
      setFeedback({ success: false, text: 'Já existe um administrador com este endereço de e-mail.' });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <div className="pb-6 border-b border-zinc-100">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900">
          Equipe Administrativa
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Gerencie os usuários com permissão para acessar o painel privado /admin e operar a loja.
        </p>
      </div>

      {/* Add Admin Form */}
      <form onSubmit={handleCreate} className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-4 text-xs">
        <div className="flex items-center gap-2 font-serif text-base font-bold text-zinc-900">
          <UserPlus className="w-4 h-4 text-[#E6007A]" />
          <span>Cadastrar Novo Administrador</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Nome do Administrador *</label>
            <input
              type="text"
              required
              placeholder="Ex: Gabriela Santos"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">E-mail Corporativo *</label>
            <input
              type="email"
              required
              placeholder="gabriela@casabelezexpress.com.br"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Nível de Permissão</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
            >
              <option value="admin">Administrador (Total)</option>
              <option value="manager">Gerente de Pedidos</option>
              <option value="super_admin">Super Administrador</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {feedback ? (
            <p className={`text-xs font-semibold ${feedback.success ? 'text-emerald-600' : 'text-rose-600'}`}>
              {feedback.text}
            </p>
          ) : <div />}

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#E6007A] hover:bg-[#D0006E] text-white font-bold rounded-xl shadow-md shadow-pink-500/20 transition-colors"
          >
            Adicionar Administrador
          </button>
        </div>
      </form>

      {/* Admin Users Table */}
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-100 text-[11px]">
              <tr>
                <th className="p-4">Administrador</th>
                <th className="p-4">Função / Cargo</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 text-zinc-700">
              {adminUsers.map((u) => (
                <tr key={u.id} className="hover:bg-pink-50/20 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-zinc-900 block">{u.name}</span>
                    <span className="text-[11px] text-zinc-400">{u.email}</span>
                  </td>

                  <td className="p-4">
                    <span className="font-mono text-[11px] bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded-md font-semibold">
                      {u.role === 'super_admin' ? 'Super Admin' : u.role === 'admin' ? 'Administrador' : 'Gerente'}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Autorizado
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    {u.id !== currentAdmin?.id && adminUsers.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remover acesso administrativo de "${u.name}"?`)) {
                            deleteAdminUser(u.id);
                          }
                        }}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Remover acesso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-zinc-400 italic">Sessão Atual</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
