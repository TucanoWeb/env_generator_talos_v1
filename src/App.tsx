import { useState } from "react";
import { Copy, Check, RefreshCw, ClipboardList } from "lucide-react";

const generatePassword = (length = 24) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

const generateHex = (bytes = 32) => {
  const chars = "0123456789abcdef";
  return Array.from(
    { length: bytes * 2 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

const generateFernetKey = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const base64 = btoa(String.fromCharCode(...array));
  return base64.replace(/\+/g, "-").replace(/\//g, "_");
};

export default function App() {
  const [keys, setKeys] = useState<{
    POSTGRES_PASSWORD?: string;
    FERNET_KEY?: string;
    SESSION_SECRET?: string;
    DATABASE_URL?: string;
  }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleGenerate = () => {
    const pwd = generatePassword(32);
    setKeys({
      POSTGRES_PASSWORD: pwd,
      FERNET_KEY: generateFernetKey(),
      SESSION_SECRET: generateHex(32),
      DATABASE_URL: `postgresql+psycopg://talosuser:${pwd}@postgres:5432/talos?sslmode=disable`,
    });
    setCopiedKey(null);
    setCopiedAll(false);
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyAll = () => {
    if (!keys.POSTGRES_PASSWORD) return;
    const text = `POSTGRES_PASSWORD=${keys.POSTGRES_PASSWORD}\nFERNET_KEY=${keys.FERNET_KEY}\nSESSION_SECRET=${keys.SESSION_SECRET}\nDATABASE_URL=${keys.DATABASE_URL}`;
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const renderDatabaseUrl = (url: string, pwd?: string) => {
    if (!pwd) return url;
    const parts = url.split(pwd);
    if (parts.length === 2) {
      return (
        <>
          {parts[0]}
          <span className="text-white bg-indigo-600/30 px-1 rounded">
            {pwd}
          </span>
          {parts[1]}
        </>
      );
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans p-6 sm:p-10 flex flex-col items-center">
      <div className="max-w-4xl w-full flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] shrink-0">
              <RefreshCw size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Talos Env Generator
              </h1>
              <p className="text-slate-500 text-sm">
                Gere credenciais seguras para seu ambiente local
              </p>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-8 rounded-full shadow-[0_0_25px_rgba(79,70,229,0.3)] transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            Gerar Novas Chaves
          </button>
        </div>

        {keys.POSTGRES_PASSWORD && (
          <div className="flex-grow grid grid-cols-1 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <button
                  onClick={copyAll}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors cursor-pointer"
                >
                  {copiedAll ? (
                    <Check size={16} />
                  ) : (
                    <ClipboardList size={16} />
                  )}
                  Copiar Tudo (.env)
                </button>
              </div>

              <div className="space-y-6 mt-12 sm:mt-8">
                {[
                  { label: "POSTGRES_PASSWORD", value: keys.POSTGRES_PASSWORD },
                  { label: "FERNET_KEY", value: keys.FERNET_KEY },
                  { label: "SESSION_SECRET", value: keys.SESSION_SECRET },
                  { label: "DATABASE_URL", value: keys.DATABASE_URL },
                ].map((item) => (
                  <div key={item.label} className="group relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">
                        {item.label}
                        {item.label === "DATABASE_URL" && (
                          <span className="ml-2 text-emerald-500 italic lowercase font-normal hidden sm:inline">
                            (senha injetada automaticamente)
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `${item.value}`,
                            item.label
                          )
                        }
                        className="text-slate-500 hover:text-white text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title={`Copiar ${item.label}`}
                      >
                        {copiedKey === item.label ? (
                          <>
                            <Check size={14} className="text-emerald-400" />{" "}
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy size={14} /> Copiar
                          </>
                        )}
                      </button>
                    </div>
                    <div
                      className={`border rounded-xl p-4 font-mono break-all text-sm sm:text-base ${
                        item.label === "DATABASE_URL"
                          ? "bg-slate-950 border-indigo-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                          : "bg-black/40 border-slate-700/50 text-indigo-400 shadow-inner"
                      }`}
                    >
                      {item.label === "DATABASE_URL"
                        ? renderDatabaseUrl(
                            item.value || "",
                            keys.POSTGRES_PASSWORD
                          )
                        : item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2 text-center">
              <p className="text-slate-600 text-xs italic">
                As chaves geradas são únicas e nunca armazenadas em nossos
                servidores.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
