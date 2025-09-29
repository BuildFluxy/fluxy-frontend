'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/AppLayout';
import { apiClient } from '../../lib/api';

interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
}

interface SystemStats {
  total_users: number;
  active_users: number;
  total_extractions: number;
  system_health: string;
}

interface UserStats {
  user_id: string;
  email: string;
  is_active: boolean;
  total_extractions: number;
  successful_extractions: number;
  failed_extractions: number;
  success_rate: number;
  last_activity: string | null;
}

interface CreateUserForm {
  email: string;
  password: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
}

interface EditUserForm {
  id: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [createUserForm, setCreateUserForm] = useState<CreateUserForm>({
    email: '',
    password: '',
    is_active: true,
    is_verified: false,
    is_superuser: false
  });
  const [editUserForm, setEditUserForm] = useState<EditUserForm>({
    id: '',
    email: '',
    is_active: true,
    is_verified: false,
    is_superuser: false
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
    fetchSystemStats();
  }, []);

  useEffect(() => {
    if (user?.is_superuser && activeTab === 'users') {
      fetchUsers();
    }
  }, [user, activeTab]);

  const fetchUserProfile = async () => {
    const response = await apiClient.getUserProfile();
    
    if (response.data) {
      const userData = response.data as User;
      setUser(userData);
      
      // Check if user is admin
      if (!userData.is_superuser) {
        router.push('/dashboard');
        return;
      }
    } else if (response.status === 401) {
      router.push('/login');
    } else {
      console.error('Error fetching user profile:', response.error);
      router.push('/login');
    }
  };

  const fetchSystemStats = async () => {
    try {
      const response = await apiClient.getAdminDashboard();
      
      if (response.data) {
        setSystemStats(response.data as SystemStats);
      } else {
        console.error('Error fetching admin dashboard:', response.error);
      }
      
      // Also fetch user stats
      const userStatsResponse = await apiClient.getAdminUsersStats();
      if (userStatsResponse.data) {
        const data = userStatsResponse.data as { users: UserStats[] };
        setUserStats(data.users);
      } else {
        console.error('Error fetching user stats:', userStatsResponse.error);
      }
    } catch (error) {
      console.error('Error fetching system stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    const response = await apiClient.getUsers();
    
    if (response.data) {
      setUsers(response.data as User[]);
    } else {
      console.error('Error fetching users:', response.error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError('');

    const response = await apiClient.createUser({
      email: createUserForm.email,
      password: createUserForm.password,
      is_active: createUserForm.is_active,
      is_verified: createUserForm.is_verified,
      is_superuser: createUserForm.is_superuser
    });

    if (response.data) {
      // Reset form and close modal
      setCreateUserForm({
        email: '',
        password: '',
        is_active: true,
        is_verified: false,
        is_superuser: false
      });
      setShowCreateUser(false);
      // Refresh users list
      fetchUsers();        } else {
      setCreateError(response.error || 'Échec de la création de l\'utilisateur');
    }

    setIsCreating(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditUserForm({
      id: user.id,
      email: user.email,
      is_active: user.is_active,
      is_verified: user.is_verified,
      is_superuser: user.is_superuser
    });
    setShowEditUser(true);
    setEditError('');
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(true);
    setEditError('');

    const response = await apiClient.updateUser(editUserForm.id, {
      email: editUserForm.email,
      is_active: editUserForm.is_active,
      is_verified: editUserForm.is_verified,
      is_superuser: editUserForm.is_superuser
    });

    if (response.data) {
      setShowEditUser(false);
      setEditingUser(null);
      // Refresh users list
      fetchUsers();
    } else {
      setEditError(response.error || 'Échec de la mise à jour de l\'utilisateur');
    }

    setIsEditing(false);
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userEmail}" ? Cette action ne peut pas être annulée.`)) {
      return;
    }

    const response = await apiClient.deleteUser(userId);

    if (response.status === 200 || response.status === 204) {
      // Refresh users list
      fetchUsers();
    } else {
      alert('Échec de la suppression de l\'utilisateur : ' + (response.error || 'Erreur inconnue'));
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

  if (!user.is_superuser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600">Vous n'avez pas la permission d'accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
          <p className="text-gray-600 mt-2">
            Aperçu du système et outils de gestion
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Aperçu du système
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Gestion des utilisateurs
            </button>
          </nav>
        </div>

        {/* System Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* System Stats */}
            {systemStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total utilisateurs</h3>
                      <p className="text-2xl font-bold text-gray-900">{systemStats.total_users}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Utilisateurs actifs</h3>
                      <p className="text-2xl font-bold text-green-600">{systemStats.active_users}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total extractions</h3>
                      <p className="text-2xl font-bold text-purple-600">{systemStats.total_extractions}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">État du système</h3>
                      <p className="text-2xl font-bold text-green-600 capitalize">{systemStats.system_health}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Health */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 mb-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">État du système</h2>
                  <p className="text-sm text-gray-600">Tous les systèmes opérationnels</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12l5 5L20 7" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">Base de données</h3>
                  <p className="text-sm text-green-600">Opérationnelle</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12l5 5L20 7" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">API</h3>
                  <p className="text-sm text-green-600">Opérationnelle</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12l5 5L20 7" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">Stockage fichiers</h3>
                  <p className="text-sm text-green-600">Opérationnel</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Header with Add User Button */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Gestion des utilisateurs</h2>
                <p className="text-gray-600">Gérez les comptes utilisateurs et leurs permissions</p>
              </div>
              <button
                onClick={() => setShowCreateUser(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter un utilisateur
              </button>
            </div>

            {/* Users Management Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rôle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vérifié
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((userItem) => (
                      <tr key={userItem.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mr-3">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{userItem.email}</div>
                              <div className="text-sm text-gray-500">ID: {userItem.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            userItem.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {userItem.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            userItem.is_superuser 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {userItem.is_superuser ? 'Administrateur' : 'Utilisateur'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            userItem.is_verified 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {userItem.is_verified ? 'Vérifié' : 'Non vérifié'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditUser(userItem)}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteUser(userItem.id, userItem.email)}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors"
                              disabled={userItem.id === user?.id}
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                            <p className="text-lg font-medium text-gray-900 mb-1">Aucun utilisateur trouvé</p>
                            <p className="text-gray-600">Commencez par créer votre premier utilisateur.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Statistics Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Statistiques des utilisateurs</h3>
                <p className="text-sm text-gray-600">Visualisez l'activité des utilisateurs et les statistiques d'extraction</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total extractions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Taux de succès
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dernière activité
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userStats.map((userItem) => (
                      <tr key={userItem.user_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mr-3">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{userItem.email}</div>
                              <div className="text-sm text-gray-500">ID: {userItem.user_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            userItem.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {userItem.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{userItem.total_extractions}</div>
                          <div className="text-xs text-gray-500">
                            {userItem.successful_extractions} réussies, {userItem.failed_extractions} échouées
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`text-sm font-medium ${
                              userItem.success_rate >= 80 ? 'text-green-600' :
                              userItem.success_rate >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {userItem.success_rate}%
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userItem.last_activity 
                            ? new Date(userItem.last_activity).toLocaleDateString('fr-FR')
                            : 'Jamais'
                          }
                        </td>
                      </tr>
                    ))}
                    {userStats.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="text-lg font-medium text-gray-900 mb-1">Aucune statistique disponible</p>
                            <p className="text-gray-600">Les statistiques d'utilisation apparaîtront ici une fois que les utilisateurs commenceront à utiliser le système.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Créer un nouvel utilisateur</h3>
                <button
                  onClick={() => setShowCreateUser(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={createUserForm.email}
                    onChange={(e) => setCreateUserForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    value={createUserForm.password}
                    onChange={(e) => setCreateUserForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={createUserForm.is_active}
                      onChange={(e) => setCreateUserForm(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Actif</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={createUserForm.is_verified}
                      onChange={(e) => setCreateUserForm(prev => ({ ...prev, is_verified: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Vérifié</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={createUserForm.is_superuser}
                      onChange={(e) => setCreateUserForm(prev => ({ ...prev, is_superuser: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Administrateur</span>
                  </label>
                </div>

                {createError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {createError}
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateUser(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isCreating ? 'Création...' : 'Créer l\'utilisateur'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditUser && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Modifier l'utilisateur</h3>
                <button
                  onClick={() => setShowEditUser(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editUserForm.email}
                    onChange={(e) => setEditUserForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editUserForm.is_active}
                      onChange={(e) => setEditUserForm(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Actif</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editUserForm.is_verified}
                      onChange={(e) => setEditUserForm(prev => ({ ...prev, is_verified: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Vérifié</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editUserForm.is_superuser}
                      onChange={(e) => setEditUserForm(prev => ({ ...prev, is_superuser: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      disabled={editingUser.id === user?.id}
                    />
                    <span className="ml-2 text-sm text-gray-700">Administrateur</span>
                    {editingUser.id === user?.id && (
                      <span className="ml-2 text-xs text-gray-500">(Vous ne pouvez pas modifier vos propres privilèges)</span>
                    )}
                  </label>
                </div>

                {editError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {editError}
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditUser(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isEditing}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isEditing ? 'Mise à jour...' : 'Mettre à jour'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
