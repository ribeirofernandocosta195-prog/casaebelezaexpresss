import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { maskPhone } from '../utils/validators';

export const ContactPage: React.FC = () => {
  const { storeSettings, submitContactMessage } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    const res = await submitContactMessage({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      subject: subject.trim() || 'Dúvida Geral',
      message: message.trim(),
    });

    setFeedback({ success: res.success, text: res.message });
    setIsSubmitting(false);

    if (res.success) {
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-xs font-bold text-[#E6007A] uppercase tracking-widest">Fale Conosco</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900 mt-1">
          Central de Atendimento
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-2">
          Estamos prontos para atender você com dedicação, carinho e rapidez.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Contact Info & WhatsApp */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FFF0F6]/70 border border-pink-100 space-y-6">
            <h2 className="font-serif text-xl font-bold text-zinc-900">Canais Oficiais</h2>
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#E6007A] flex items-center justify-center shadow-sm flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-zinc-900">Telefone / Central</p>
                  <p className="text-zinc-600">{storeSettings.phone}</p>
                  <p className="text-[10px] text-zinc-400">Segunda a Sexta, das 9h às 18h</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm flex-shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-zinc-900">WhatsApp Oficial</p>
                  <p className="text-zinc-600">{storeSettings.whatsapp}</p>
                  <a
                    href={`https://wa.me/55${storeSettings.whatsapp.replace(/\D/g, '')}?text=Ol%C3%A1%2C+preciso+de+ajuda+com+minha+compra`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#E6007A] font-bold hover:underline inline-block mt-0.5"
                  >
                    Conversar agora →
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#E6007A] flex items-center justify-center shadow-sm flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-zinc-900">E-mail de Suporte</p>
                  <p className="text-zinc-600">{storeSettings.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#E6007A] flex items-center justify-center shadow-sm flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-zinc-900">Endereço Comercial</p>
                  <p className="text-zinc-600">{storeSettings.address}</p>
                  <p className="text-[10px] text-zinc-400">CNPJ: {storeSettings.cnpj}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Message Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-10 rounded-3xl bg-white border border-pink-100 shadow-xl space-y-6">
            <h2 className="font-serif text-xl font-bold text-zinc-900">Envie uma Mensagem</h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Seu Nome *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carla Mendes"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">E-mail para Retorno *</label>
                  <input
                    type="email"
                    required
                    placeholder="carla@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="(11) 98765-4321"
                    maxLength={15}
                    value={phone}
                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Assunto</label>
                  <input
                    type="text"
                    placeholder="Ex: Dúvida sobre entrega"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Mensagem *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escreva sua mensagem com detalhes..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#E6007A] hover:bg-[#D0006E] text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Enviando mensagem...' : 'Enviar Mensagem'}</span>
              </button>

              {feedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    feedback.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{feedback.text}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
