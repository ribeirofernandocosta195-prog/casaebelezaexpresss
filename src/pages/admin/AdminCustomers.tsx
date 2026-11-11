import React, { useState } from 'react';
import { Search, Mail, Phone, MapPin, ShoppingBag } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const AdminCustomers: React.FC = () => {
  const { customers, orders } = useAdmin();
  const [search, setSearch] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.cpf.includes(search)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pb-6 border-b border-zinc-100">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900">
          Base de Clientes
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Histórico e contatos de clientes cadastrados através de pedidos e checkout.
        </p>
      </div>

      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Buscar por nome, e-mail ou CPF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none focus:border-[#E6007A]"
        />
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-100 text-[11px]">
              <tr>
                <th className="p-4">Cliente</th>
                <th className="p-4">Documento / Telefone</th>
                <th className="p-4">Localidade</th>
                <th className="p-4">Pedidos Realizados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 text-zinc-700">
              {filtered.map((c) => {
                const customerOrdersCount = orders.filter(
                  (o) => o.customer_email.toLowerCase() === c.email.toLowerCase()
                ).length;

                return (
                  <tr key={c.id} className="hover:bg-pink-50/20 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-zinc-900 block">{c.full_name}</span>
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {c.email}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-mono block text-zinc-800">{c.cpf}</span>
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {c.phone}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="text-zinc-800 block">{c.city} - {c.state}</span>
                      <span className="text-[11px] text-zinc-400">CEP: {c.cep}</span>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-pink-100 text-pink-800">
                        <ShoppingBag className="w-3 h-3" />
                        {customerOrdersCount} pedidos
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
