'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/AppLayout';
import { apiClient } from '../../lib/api';
import * as XLSX from 'xlsx';

interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
}

interface ExcelFile {
  id: string;
  filename: string;
  created_at: string;
  size: number;
  download_url: string;
}

interface ExcelData {
  sheetNames: string[];
  currentSheet: string;
  data: any[][];
  workbook: XLSX.WorkBook | null;
}

export default function ComptablePage() {
  const [user, setUser] = useState<User | null>(null);
  const [excelFiles, setExcelFiles] = useState<ExcelFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'files' | 'viewer'>('files');
  const [excelData, setExcelData] = useState<ExcelData>({
    sheetNames: [],
    currentSheet: '',
    data: [],
    workbook: null
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
    fetchExcelFiles();
  }, []);

  const fetchUserProfile = async () => {
    const response = await apiClient.getUserProfile();
    
    if (response.data) {
      setUser(response.data as User);
    } else if (response.status === 401) {
      router.push('/login');
    } else {
      console.error('Erreur lors de la récupération du profil utilisateur :', response.error);
      router.push('/login');
    }
  };

  const fetchExcelFiles = async () => {
    try {
      // TODO: Remplacer par le véritable endpoint API
      setExcelFiles([]);
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers Excel :', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = (file: ExcelFile) => {
    // TODO: Implémenter la logique de téléchargement réelle
    console.log('Téléchargement du fichier :', file.filename);
    // Créer un lien de téléchargement temporaire
    const link = document.createElement('a');
    link.href = file.download_url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      return;
    }

    try {
      // TODO: Implémenter la véritable API de suppression
      setExcelFiles(excelFiles.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier :', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / (1024 * 1024)) + ' MB';
  };

  // Fonctions de visualisation Excel
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      readExcelFile(file);
    }
  };

  const readExcelFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (workbook.SheetNames.length > 0) {
          const firstSheet = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheet];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          setExcelData({
            sheetNames: workbook.SheetNames,
            currentSheet: firstSheet,
            data: jsonData as any[][],
            workbook
          });
          
          setCurrentView('viewer');
          setErrorMessage('');
          setHasUnsavedChanges(false);
        }        } catch (error) {
          setErrorMessage('Erreur lors de la lecture du fichier Excel : ' + (error as Error).message);
        }
    };
    
    reader.onerror = () => {
      setErrorMessage('Erreur lors de la lecture du fichier');
    };
    
    reader.readAsArrayBuffer(file);
  };

  const changeSheet = (sheetName: string) => {
    if (excelData.workbook) {
      const worksheet = excelData.workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      setExcelData(prev => ({
        ...prev,
        currentSheet: sheetName,
        data: jsonData as any[][]
      }));
      setHasUnsavedChanges(false);
    }
  };

  const updateCellData = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...excelData.data];
    
    // S'assurer que la ligne existe
    while (newData.length <= rowIndex) {
      newData.push([]);
    }
    
    // S'assurer que la colonne existe
    while (newData[rowIndex].length <= colIndex) {
      newData[rowIndex].push('');
    }
    
    newData[rowIndex][colIndex] = value;
    
    setExcelData(prev => ({
      ...prev,
      data: newData
    }));
    setHasUnsavedChanges(true);
  };

  const saveChanges = () => {
    if (!excelData.workbook || !uploadedFile) return;
    
    try {
      // Mettre à jour la feuille de calcul avec les données modifiées
      const ws = XLSX.utils.aoa_to_sheet(excelData.data);
      excelData.workbook.Sheets[excelData.currentSheet] = ws;
      
      // Convertir le classeur en données binaires
      const wbout = XLSX.write(excelData.workbook, { bookType: 'xlsx', type: 'array' });
      
      // Convertir en Blob
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      
      // Créer le lien de téléchargement
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      
      const originalName = uploadedFile.name.split('.').slice(0, -1).join('.');
      const extension = uploadedFile.name.split('.').pop();
      downloadLink.download = `${originalName}_modifié.${extension}`;
      
      // Déclencher le téléchargement
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      setHasUnsavedChanges(false);
      setErrorMessage('');
      
      // Afficher le message de succès
      setTimeout(() => {
        alert('Fichier sauvegardé avec succès !');
      }, 100);
      
    } catch (error) {
      setErrorMessage('Erreur lors de la sauvegarde : ' + (error as Error).message);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setExcelData({
      sheetNames: [],
      currentSheet: '',
      data: [],
      workbook: null
    });
    setCurrentView('files');
    setHasUnsavedChanges(false);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Interface Comptable</h1>
              <p className="text-gray-600 mt-2">
                {currentView === 'files' 
                  ? "Gérez vos fichiers Excel générés et téléchargez des fichiers pour correction"
                  : "Visualisez et modifiez votre fichier Excel"
                }
              </p>
            </div>
            {currentView === 'viewer' && (
              <button
                onClick={clearFile}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour à la Liste
              </button>
            )}
          </div>
        </div>

        {currentView === 'files' ? (
          // Vue de gestion des fichiers
          <>
            {/* Section de téléchargement */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 mb-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Télécharger un fichier Excel pour vérification</h2>
                  <p className="text-sm text-gray-600">Téléchargez un fichier Excel généré par notre système pour vérification et correction</p>
                </div>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
                >
                  Choisir un fichier Excel
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Formats supportés : .xlsx, .xls
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Informations du fichier */}
            {uploadedFile && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-green-800 font-medium">
                      {uploadedFile.name} ({formatFileSize(uploadedFile.size)})
                    </span>
                  </div>
                  <button
                    onClick={clearFile}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Fermer
                  </button>
                </div>
              </div>
            )}

            {/* Sélecteur de feuille */}
            {excelData.sheetNames.length > 1 && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Feuille à afficher :
                </label>
                <select
                  value={excelData.currentSheet}
                  onChange={(e) => changeSheet(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg bg-white min-w-48 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {excelData.sheetNames.map((sheetName) => (
                    <option key={sheetName} value={sheetName}>
                      {sheetName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Affichage des données Excel */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gray-50 px-8 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Données Excel - {excelData.currentSheet}
                  </h3>
                </div>
                <button
                  onClick={saveChanges}
                  disabled={!hasUnsavedChanges}
                  className={`px-6 py-2 rounded-lg text-white font-medium transition-all ${
                    hasUnsavedChanges
                      ? 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Sauvegarder les modifications
                </button>
              </div>
              
              <div className="overflow-auto max-h-96">
                <ExcelTable
                  data={excelData.data}
                  onCellChange={updateCellData}
                />
              </div>

              {excelData.data.length > 100 && (
                <div className="bg-gray-50 px-8 py-3 text-center text-gray-600 text-sm border-t border-gray-200">
                  Affichage limité aux 100 premières lignes pour des raisons de performance
                </div>
              )}
            </div>

            {hasUnsavedChanges && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-yellow-800 font-medium">
                    Vous avez des modifications non sauvegardées. N'oubliez pas de sauvegarder vos modifications.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Message d'erreur */}
        {errorMessage && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// Composant ExcelTable pour afficher et modifier les données Excel
interface ExcelTableProps {
  data: any[][];
  onCellChange: (rowIndex: number, colIndex: number, value: string) => void;
}

function ExcelTable({ data, onCellChange }: ExcelTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        Aucune donnée à afficher
      </div>
    );
  }

  const maxCols = Math.max(...data.map(row => row.length));
  const displayData = data.slice(0, 100); // Limiter à 100 lignes pour les performances

  const handleCellEdit = (rowIndex: number, colIndex: number, value: string) => {
    onCellChange(rowIndex, colIndex, value);
  };

  return (
    <table className="min-w-full border-collapse">
      <thead className="bg-gray-50">
        <tr>
          {Array.from({ length: maxCols }, (_, colIndex) => (
            <th
              key={colIndex}
              className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-b-2 border-gray-200"
            >
              {data[0] && data[0][colIndex] ? String(data[0][colIndex]) : `Col ${colIndex + 1}`}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {displayData.slice(1).map((row, rowIndex) => (
          <tr
            key={rowIndex + 1}
            className={`${(rowIndex + 1) % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-100`}
          >
            {Array.from({ length: maxCols }, (_, colIndex) => (
              <td
                key={colIndex}
                className="px-3 py-2 text-gray-700 border-r border-gray-100"
              >
                <input
                  type="text"
                  value={row[colIndex] || ''}
                  onChange={(e) => handleCellEdit(rowIndex + 1, colIndex, e.target.value)}
                  className="w-full border-none bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 px-1 py-1 rounded"
                  onFocus={(e) => e.target.select()}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
