'use client';

import React, { useState } from 'react';

interface ExtractionParametersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: {
    documentNumber: string;
    bankCode: string;
    accountNumber: string;
  }) => void;
  title?: string;
  description?: string;
}

export default function ExtractionParametersModal({
  isOpen,
  onClose,
  onSubmit,
  title = "Paramètres d'extraction",
  description = "Veuillez fournir les informations suivantes pour le traitement de votre relevé bancaire :"
}: ExtractionParametersModalProps) {
  const [documentNumber, setDocumentNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setDocumentNumber('');
    setBankCode('');
    setAccountNumber('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!documentNumber.trim()) {
      newErrors.documentNumber = 'Le numéro de document est requis';
    }
    
    if (!bankCode.trim()) {
      newErrors.bankCode = 'Le code banque est requis';
    }
    
    if (!accountNumber.trim()) {
      newErrors.accountNumber = 'Le numéro de compte est requis';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit the form
    onSubmit({
      documentNumber: documentNumber.trim(),
      bankCode: bankCode.trim(),
      accountNumber: accountNumber.trim()
    });

    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Document Number */}
            <div>
              <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de document
              </label>
              <input
                type="text"
                id="documentNumber"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.documentNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Entrez le numéro de document"
              />
              {errors.documentNumber && (
                <p className="text-red-600 text-sm mt-1">{errors.documentNumber}</p>
              )}
            </div>

            {/* Bank Code */}
            <div>
              <label htmlFor="bankCode" className="block text-sm font-medium text-gray-700 mb-2">
                Code banque
              </label>
              <input
                type="text"
                id="bankCode"
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.bankCode ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Entrez le code banque"
              />
              {errors.bankCode && (
                <p className="text-red-600 text-sm mt-1">{errors.bankCode}</p>
              )}
            </div>

            {/* Account Number */}
            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de compte
              </label>
              <input
                type="text"
                id="accountNumber"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.accountNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Entrez le numéro de compte"
              />
              {errors.accountNumber && (
                <p className="text-red-600 text-sm mt-1">{errors.accountNumber}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Continuer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
