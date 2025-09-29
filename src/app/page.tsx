'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <h1 className="text-4xl font-bold text-blue-600" style={{ fontFamily: 'Dancing Script' }}>
                  Fluxy
                </h1>
              </div>
            </div>
            <div className="hidden md:block">
              <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-blue-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                Connexion
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="animate-fadeInUp">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Simplifiez l'extraction de vos 
                <span className="text-blue-600"> relevés bancaires</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Automatisez le traitement de vos documents bancaires avec notre solution basée sur l'intelligence artificielle. 
                Conçu spécialement pour les cabinets d'expertise comptable et les professionnels financiers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link 
                  href="/login"
                  className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-blue-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Commencer maintenant
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right Column - Illustration */}
            <div className="relative animate-float">
              <div className="relative">
                {/* Main Illustration Container */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 shadow-2xl">
                  {/* Document Stack Animation */}
                  <div className="relative h-64">
                    <div className="absolute inset-0 bg-white rounded-2xl shadow-lg transform rotate-3 animate-pulse-soft"></div>
                    <div className="absolute inset-0 bg-white rounded-2xl shadow-lg transform -rotate-2"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-100">
                      {/* Document Content Lines */}
                      <div className="p-6 space-y-3">
                        <div className="h-3 bg-gradient-to-r from-blue-200 to-blue-400 rounded-full w-3/4"></div>
                        <div className="h-3 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full w-1/2"></div>
                        <div className="h-3 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full w-2/3"></div>
                        <div className="h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full w-5/6"></div>
                        
                        {/* AI Magic Effect */}
                        <div className="flex items-center justify-center pt-8">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center animate-pulse-soft">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-400 rounded-full animate-float opacity-80"></div>
                <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-blue-500 rounded-full animate-float opacity-70" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 -right-8 w-8 h-8 bg-blue-300 rounded-full animate-float opacity-60" style={{animationDelay: '2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fonctionnalités puissantes pour les professionnels modernes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour rationaliser le traitement de vos documents financiers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 card-hover">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Extraction intelligente</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Analyse automatisée des relevés bancaires PDF avec reconnaissance intelligente et validation des données
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 card-hover">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Export Excel</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Génération automatique de fichiers Excel formatés, prêts pour vos workflows comptables
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 card-hover">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Traitement par lot</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Traitez plusieurs fichiers simultanément pour un maximum d'efficacité et de gain de temps
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir <span className="font-dancing font-bold text-blue-600">Fluxy</span> ?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="flex items-start space-x-4 group">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-lg">Gain de temps considérable</h4>
                <p className="text-gray-600 leading-relaxed">Réduisez le temps de saisie manuelle de 90%</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 group">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-lg">Précision maximale</h4>
                <p className="text-gray-600 leading-relaxed">IA avancée pour une reconnaissance précise des données</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 group">
              <div className="w-12 h-12 bg-blue-400 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-lg">Interface intuitive</h4>
                <p className="text-gray-600 leading-relaxed">Design conçu pour les professionnels comptables</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 group">
              <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-lg">Sécurité renforcée</h4>
                <p className="text-gray-600 leading-relaxed">Protection des données sensibles avec chiffrement</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à transformer votre flux de travail ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des professionnels qui ont déjà rationalisé leur traitement de documents avec Fluxy
          </p>
          <Link 
            href="/login"
            className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Commencer maintenant
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <h3 className="text-3xl font-bold" style={{ fontFamily: 'Dancing Script' }}>
                Fluxy
              </h3>
            </div>
            <p className="text-gray-400 text-lg mb-8">
              Révolutionner l'extraction de relevés bancaires avec l'IA
            </p>
            <div className="flex justify-center space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
              <a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a>
              <a href="mailto:perrierosas@gmail.com" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-gray-500">© 2025 Fluxy. Tous droits réservés.</p>
              <div className="text-gray-500 text-sm mt-2">
                Conçu avec ❤️ par <a href="https://rosasbehoundja.github.io" className="hover:text-white transition-colors">Todé Rosas Behoundja</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
