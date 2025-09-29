'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import ExtractionParametersModal from '@/components/ExtractionParametersModal';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
}

interface DashboardStats {
  total_extractions: number;
  successful_extractions: number;
  failed_extractions: number;
  success_rate: number;
  recent_files: {
    filename: string;
    status: string;
    submitted_at: string;
  }[];
}

interface ExtractionResult {
  success: boolean;
  blob?: Blob;
  filename?: string;
  message?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [showParametersModal, setShowParametersModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
    fetchStats();
  }, []);

  const fetchUserProfile = async () => {
    const response = await apiClient.getUserProfile();
    
    if (response.data) {
      setUser(response.data as User);
    } else if (response.status === 401) {
      router.push('/login');
    } else {
      console.error('Error fetching user profile:', response.error);
      router.push('/login');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.getDashboardStats();
      
      if (response.data) {
        setStats(response.data as DashboardStats);
      } else {
        console.error('Error fetching dashboard stats:', response.error);
        
        // Show different error messages based on the type of error
        if (response.status === 0) {
          console.error('Cannot connect to backend server. Make sure the server is running on the correct port.');
        } else if (response.status === 401) {
          console.error('Authentication required. Redirecting to login...');
          router.push('/login');
        } else {
          console.error(`API Error (${response.status}):`, response.error);
        }
      }
    } catch (error) {
      console.error('Unexpected error fetching stats:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Veuillez sélectionner un fichier PDF');
        return;
      }
      setSelectedFile(file);
      setError('');
      setExtractionResult(null);
    }
  };

  const handleExtractData = async () => {
    if (!selectedFile) return;
    setShowParametersModal(true);
  };

  const handleParametersSubmit = async (params: {
    documentNumber: string;
    bankCode: string;
    accountNumber: string;
  }) => {
    if (!selectedFile) return;

    setShowParametersModal(false);
    setIsExtracting(true);
    setError('');
    setExtractionResult(null);

    const response = await apiClient.extractFromFile(
      selectedFile,
      params.documentNumber,
      params.bankCode,
      params.accountNumber
    );

    if (response.data) {
      const { blob, filename } = response.data as { blob: Blob; filename: string };
      setExtractionResult({
        success: true,
        blob,
        filename,
        message: 'Extraction successful!'
      });
      fetchStats(); // Refresh stats after successful extraction
    } else {
      const errorMessage = typeof response.error === 'string' 
        ? response.error 
        : 'Error during extraction';
      setError(errorMessage);
    }

    setIsExtracting(false);
  };

  const downloadExcel = () => {
    if (extractionResult?.blob && extractionResult?.filename) {
      console.log('Download filename:', extractionResult.filename);
      const url = window.URL.createObjectURL(extractionResult.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = extractionResult.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      console.log('Missing blob or filename:', { 
        hasBlob: !!extractionResult?.blob, 
        filename: extractionResult?.filename 
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout user={user}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bon retour !</h1>
              <p className="text-gray-600 mt-1">Prêt à traiter vos relevés bancaires ?</p>
            </div>
            <div className="hidden sm:block">
              <div className="bg-blue-50 p-4 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total des extractions</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_extractions}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Réussies</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.successful_extractions}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Échouées</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{stats.failed_extractions}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taux de réussite</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {stats.success_rate}%
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Fallback UI when stats are not available
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-yellow-800">Statistiques indisponibles</h3>
                <p className="text-yellow-700 mt-1">
                  Impossible de charger les statistiques du tableau de bord. Veuillez vérifier votre connexion et vous assurer que le serveur backend fonctionne.
                </p>
                <button 
                  onClick={fetchStats}
                  className="mt-3 text-sm bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* File Upload Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Extraction de relevé bancaire</h2>
                  <p className="text-sm text-gray-600">Téléchargez un fichier PDF pour extraire les données de transaction</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Sélectionner le fichier PDF
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-blue-600 hover:text-blue-500">Cliquez pour télécharger</span> ou glissez-déposez
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Fichiers PDF uniquement</p>
                      </div>
                    </label>
                  </div>
                </div>

                {selectedFile && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{Math.round(selectedFile.size / 1024)} KB</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setError('');
                          setExtractionResult(null);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-red-700">
                        {typeof error === 'string' ? error : 'An error occurred during processing'}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleExtractData}
                  disabled={!selectedFile || isExtracting}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isExtracting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Extract Data</span>
                    </>
                  )}
                </button>

                {extractionResult?.success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-green-700 font-medium">Extraction completed successfully!</p>
                      </div>
                      <button
                        onClick={downloadExcel}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                <div className="space-y-3">
                  <Link 
                    href="/batch" 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="bg-purple-50 p-2 rounded-lg group-hover:bg-purple-100 transition-colors">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Traitement par lot</p>
                      <p className="text-xs text-gray-500">Traiter plusieurs fichiers</p>
                    </div>
                  </Link>

                  <Link 
                    href="/comptable" 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="bg-green-50 p-2 rounded-lg group-hover:bg-green-100 transition-colors">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Interface comptable</p>
                      <p className="text-xs text-gray-500">Voir les données traitées</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Recent Files */}
              {stats?.recent_files && stats.recent_files.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Fichiers récents</h3>
                  <div className="space-y-3">
                    {stats.recent_files.slice(0, 5).map((file, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                        <div className={`p-1 rounded ${
                          file.status === 'success' ? 'bg-green-50' : 
                          file.status === 'failed' ? 'bg-red-50' : 
                          file.status === 'processing' ? 'bg-yellow-50' : 'bg-blue-50'
                        }`}>
                          <svg className={`w-4 h-4 ${
                            file.status === 'success' ? 'text-green-600' : 
                            file.status === 'failed' ? 'text-red-600' : 
                            file.status === 'processing' ? 'text-yellow-600' : 'text-blue-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {file.status === 'success' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            ) : file.status === 'failed' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : file.status === 'processing' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            )}
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                          <p className="text-xs text-gray-500">
                            {file.status} • {new Date(file.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Extraction Parameters Modal */}
      <ExtractionParametersModal
        isOpen={showParametersModal}
        onClose={() => setShowParametersModal(false)}
        onSubmit={handleParametersSubmit}
        title="Paramètres de relevé bancaire"
        description="Veuillez fournir les informations suivantes pour traiter votre relevé bancaire :"
      />
    </AppLayout>
  );
}
