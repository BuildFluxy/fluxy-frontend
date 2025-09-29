'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/AppLayout';
import ExtractionParametersModal from '../../components/ExtractionParametersModal';
import { apiClient } from '../../lib/api';

interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
}

interface BatchFile {
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: { blob: Blob; filename: string };
  error?: string;
}

export default function BatchPage() {
  const [user, setUser] = useState<User | null>(null);
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showParametersModal, setShowParametersModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
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

  const handleFilesSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const batchFiles: BatchFile[] = selectedFiles.map(file => ({
      file,
      status: 'pending',
    }));
    setFiles(batchFiles);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const processBatch = async () => {
    if (files.length === 0) return;
    setShowParametersModal(true);
  };

  const handleParametersSubmit = async (params: {
    documentNumber: string;
    bankCode: string;
    accountNumber: string;
  }) => {
    if (files.length === 0) return;

    setShowParametersModal(false);
    setIsProcessing(true);
    setProcessingProgress(0);

    // Use the batch API endpoint
    const fileList = files.map(f => f.file);
    const response = await apiClient.batchExtractFromFiles(
      fileList,
      params.documentNumber,
      params.bankCode,
      params.accountNumber
    );

    if (response.data) {
      const { blob, filename } = response.data as { blob: Blob; filename: string };
      
      // Update all files as completed and provide download
      const updatedFiles = files.map(f => ({
        ...f,
        status: 'completed' as const,
        result: { blob, filename }
      }));
      
      setFiles(updatedFiles);
      setProcessingProgress(100);

      // Auto-download the ZIP file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      // Mark all files as error
      const errorMessage = typeof response.error === 'string' 
        ? response.error 
        : 'Erreur lors du traitement';
      const updatedFiles = files.map(f => ({
        ...f,
        status: 'error' as const,
        error: errorMessage
      }));
      setFiles(updatedFiles);
    }

    setIsProcessing(false);
  };

  const downloadAllResults = () => {
    // Since the batch API returns a ZIP file, this is already handled
    // in the processBatch function. This could be used for re-downloading
    const completedFiles = files.filter(f => f.status === 'completed' && f.result);
    if (completedFiles.length > 0 && completedFiles[0].result) {
      const { blob, filename } = completedFiles[0].result;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': 
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'processing': 
        return (
          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'completed': 
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error': 
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default: 
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-gray-500';
      case 'processing': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-500';
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

  const completedFiles = files.filter(f => f.status === 'completed');
  const errorFiles = files.filter(f => f.status === 'error');

  return (
    <AppLayout user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Traitement par lot</h1>
          <p className="text-gray-600 mt-2">
            Traitez plusieurs relevés bancaires simultanément pour gagner du temps.
          </p>
        </div>

        {/* File Upload Section */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Sélection de fichiers</h2>
              <p className="text-sm text-gray-600">Téléchargez plusieurs fichiers PDF pour traitement par lot</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sélectionner plusieurs fichiers PDF
              </label>
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFilesSelect}
                disabled={isProcessing}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 file:transition-colors"
              />
              <p className="text-sm text-gray-500 mt-2">
                Vous pouvez sélectionner plusieurs fichiers en une fois pour le traitement par lot.
              </p>
            </div>

            {files.length > 0 && !isProcessing && (
              <button
                onClick={processBatch}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m2-7a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Traiter tous les fichiers ({files.length})
              </button>
            )}
          </div>
        </div>

        {/* Progress Section */}
        {isProcessing && (
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Progression du traitement</h2>
                <p className="text-sm text-gray-600">Traitement de vos fichiers...</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${processingProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              {Math.round(processingProgress)}% terminé
            </p>
          </div>
        )}

        {/* Results Summary */}
        {files.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total des fichiers</h3>
                  <p className="text-2xl font-bold text-gray-900">{files.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Traités avec succès</h3>
                  <p className="text-2xl font-bold text-green-600">{completedFiles.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Erreurs</h3>
                  <p className="text-2xl font-bold text-red-600">{errorFiles.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Files List */}
        {files.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Fichiers à traiter</h2>
              </div>
              {completedFiles.length > 0 && (
                <button
                  onClick={downloadAllResults}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Télécharger tous les résultats
                </button>
              )}
            </div>
            
            <div className="divide-y divide-gray-100">
              {files.map((batchFile, index) => (
                <div key={index} className="px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${getStatusColor(batchFile.status)}`}>
                      {getStatusIcon(batchFile.status)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{batchFile.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {Math.round(batchFile.file.size / 1024)} KB
                      </p>
                      {batchFile.error && (
                        <p className="text-sm text-red-600 mt-1">
                          {typeof batchFile.error === 'string' ? batchFile.error : 'Error occurred'}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {batchFile.status === 'completed' && (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Télécharger
                      </button>
                    )}
                    {!isProcessing && batchFile.status === 'pending' && (
                      <button
                        onClick={() => removeFile(index)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {files.length === 0 && (
          <div className="bg-white p-16 rounded-xl shadow-lg border border-gray-100 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Aucun fichier sélectionné
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Sélectionnez plusieurs fichiers PDF pour commencer le traitement par lot. Vous pouvez télécharger plusieurs fichiers en une fois pour un traitement efficace.
            </p>
          </div>
        )}
      </div>

      {/* Extraction Parameters Modal */}
      <ExtractionParametersModal
        isOpen={showParametersModal}
        onClose={() => setShowParametersModal(false)}
        onSubmit={handleParametersSubmit}
        title="Paramètres de traitement par lot"
        description="Veuillez fournir les informations suivantes qui seront appliquées à tous les fichiers du lot :"
      />
    </AppLayout>
  );
}
