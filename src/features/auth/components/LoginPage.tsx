import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { loginRequest } from "../api/auth.api";
import { Mail, Lock, MessageCircle } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("frano@gmail.com");
  const [password, setPassword] = useState("frano");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await loginRequest({
        email,
        password,
      });

      login({
        id: response.id,
        name: response.name,
        email: response.mail,
      });

      navigate("/chat");
    } catch (err) {
      setError("Neispravni podaci za prijavu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Lijeva strana - Form (Identično prema dizajnu) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo i naslov */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-semibold text-gray-900">ChatApp</h1>
            </div>
            <p className="text-gray-600 mt-4">Dobrodošli natrag! Prijavite se na svoj račun.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email adresa
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="ime@primjer.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Lozinka
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Unesite lozinku"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Zapamti me</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                Zaboravljena lozinka?
              </a>
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              {loading ? "Prijavljivanje..." : "Prijavite se"}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-gray-600">
            Nemate račun?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Registrirajte se
            </Link>
          </p>
        </div>
      </div>

      {/* Desna strana - Visual (Identično prema dizajnu) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 items-center justify-center p-12">
        <div className="max-w-lg text-white">
          <h2 className="text-4xl font-semibold mb-6">
            Povežite se sa svima, bilo gdje i bilo kada
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Moderna chat aplikacija koja omogućava instant komunikaciju sa vašim prijateljima, kolegama i porodicom.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Brze poruke u realnom vremenu</h3>
                <p className="text-blue-100 text-sm">Razmjenjujte poruke instant bez kašnjenja</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Sigurna komunikacija</h3>
                <p className="text-blue-100 text-sm">Vaše poruke su šifrirane i zaštićene</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Multiplatformska podrška</h3>
                <p className="text-blue-100 text-sm">Pristupite sa bilo kojeg uređaja</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}