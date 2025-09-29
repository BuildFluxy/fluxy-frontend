'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    const response = await apiClient.forgotPassword(email);

    if (response.status >= 200 && response.status < 300) {
      setEmailSent(true);
      setMessage('Un email de réinitialisation a été envoyé à votre adresse email.');
    } else {
      setError(response.error || 'Une erreur est survenue lors de l\'envoi de l\'email.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-2xl rounded-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-6 6c-1.2 0-2.28-.3-3.24-.84L7.5 17.5A2.5 2.5 0 015 20a2.5 2.5 0 01-2.5-2.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5c0 .28-.05.54-.14.78l2.26-2.26C9.7 15.72 10 14.6 10 13.4c0-3.31 2.69-6 6-6s6 2.69 6 6z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mot de passe oublié</h1>
            <p className="text-gray-600">
              {emailSent 
                ? "Vérifiez votre boîte email" 
                : "Entrez votre adresse email pour recevoir un lien de réinitialisation"
              }
            </p>
          </div>

          {emailSent ? (
            /* Success State */
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Email envoyé !</h2>
                <p className="text-gray-600 mb-4">
                  Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Si vous ne recevez pas l'email dans quelques minutes, vérifiez votre dossier spam.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                    setMessage('');
                  }}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Envoyer à une autre adresse
                </button>
                
                <Link
                  href="/login"
                  className="block w-full text-center bg-gray-100 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Retour à la connexion
                </Link>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="votre-email@exemple.com"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Envoi en cours...
                  </div>
                ) : (
                  'Envoyer le lien de réinitialisation'
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Vous vous souvenez de votre mot de passe ?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
