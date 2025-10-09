import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/utils/axiosInstance';
import { 
  Heart, 
  Search, 
  Filter, 
  Calendar, 
  Briefcase,
  Users
} from 'lucide-react';
import Swal from 'sweetalert2';
//import { useNavigate } from 'react-router-dom';
// Define JobType interface here since it's not exported from EspacePro
interface JobType {
  id: number;
  title: string;
  description: string;
  skills: string;
  link?: string;
  liked_by_user: boolean;
  like_count: number;
  company?: string;
  category?: string;
  published_at?: string;
}

const formatLink = (link: string) => {
  if (!link) return '#';

  // S'il commence par /, on le colle au domaine emploi.cm
  if (link.startsWith('/')) {
    return `https://www.emploi.cm${link}`;
  }

  // Sinon, on vérifie s'il contient déjà emploi.cm
  let cleaned = link.trim().replace(/^https?:\/\//, '').replace(/^www\./, '');
  if (!cleaned.includes('emploi.cm')) return '#';
  return `https://www.${cleaned}`;
};
//const navigate = useNavigate();

const fetchJobOffers = async () => {
  try {
    //const response = await axios.get('/api/job-offers');
    const response = await axios.get('/job-offers');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      Swal.fire({
        icon: 'warning',
        title: 'Accès restreint',
        text: 'Seuls les enseignants peuvent accéder à cette section.',
        confirmButtonText: 'Compris',
      }).then(() => {
        window.location.href = '/';
      //navigate('/')
      });
    }
    throw error; // re-propager l'erreur pour que useQuery détecte aussi l'échec
  }
};

const likeJobOffer = async (jobId: number) => {
  //await axios.post(`/api/job-offers/${jobId}/like`);
  await axios.post(`/job-offers/${jobId}/like`);
};

const shareJobOffer = async ({ jobId, comment }: { jobId: number; comment?: string }) => {
  //await axios.post(`/api/job-offers/${jobId}/share`, { comment });
  await axios.post(`/job-offers/${jobId}/share`, { comment });
};

const SearchResult = () => {
  const queryClient = useQueryClient();
  const [likedJobs, setLikedJobs] = React.useState<number[]>([]);
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const jobsPerPage = 6;

  // Reset to first page when search changes - moved to top with other hooks
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const { isLoading, isError, data: jobs = [] } = useQuery<JobType[]>({
    queryKey: ['jobs'],
    queryFn: fetchJobOffers,
  });

  const likeMutation = useMutation({
    mutationFn: likeJobOffer,
    onSuccess: (_, jobId) => {
      const isAlreadyLiked = likedJobs.includes(jobId);
      const updatedLiked = isAlreadyLiked
        ? likedJobs.filter((id) => id !== jobId)
        : [...likedJobs, jobId];
      setLikedJobs(updatedLiked);

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: isAlreadyLiked ? 'info' : 'success',
        title: isAlreadyLiked ? 'Like retiré !' : 'Offre likée avec succès ❤️',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });

      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error: any) => {
      Swal.fire('Erreur', error.message || 'Impossible de liker cette offre', 'error');
    },
  });

  const shareMutation = useMutation({
    mutationFn: shareJobOffer,
    onSuccess: () => {
      Swal.fire('Succès', "L'offre a été partagée avec succès dans l'espace pro.", 'success');
    },
    onError: () => {
      Swal.fire('Erreur', "Impossible de partager cette offre.", 'error');
    },
  });

  if (isLoading) {
    Swal.showLoading();
    return null;
  }

  if (isError) {
    Swal.close();
    return null;
  }

  Swal.close();

  // Enhanced search functionality - search across multiple fields
  const filteredJobs = searchTerm
    ? jobs.filter((job: JobType) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          job.title?.toLowerCase().includes(searchLower) ||
          job.company?.toLowerCase().includes(searchLower) ||
          job.category?.toLowerCase().includes(searchLower) ||
          job.description?.toLowerCase().includes(searchLower) ||
          job.skills?.toLowerCase().includes(searchLower)
        );
      })
    : jobs;

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Offres d'emploi disponibles
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez les meilleures opportunités professionnelles partagées par notre communauté
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-gradient-to-r from-white to-blue-50 rounded-2xl shadow-lg p-6 mb-8 border border-blue-100">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
        <input
          type="text"
                placeholder="Rechercher par titre, entreprise, catégorie, compétences..."
                className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
            <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
            >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
            </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-100 px-4 py-2 rounded-lg font-medium">
              <Filter className="w-4 h-4" />
              <span>{filteredJobs.length} offre{filteredJobs.length !== 1 ? 's' : ''} trouvée{filteredJobs.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {currentJobs.map((job: JobType) => (
            <div key={job.id} className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-blue-100 overflow-hidden group">
              {/* Job Header */}
              <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                     
                      <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent line-clamp-2 group-hover:from-purple-600 group-hover:to-indigo-600 transition-all duration-300">
                        {job.title}
                      </h3>
                    </div>
                    <div className="text-blue-700 mb-2">
                      <span className="font-semibold">{job.company}</span>
        </div>
      </div>

            <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      likedJobs.includes(job.id)
                        ? 'text-red-600 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border border-red-200'
                        : 'text-gray-600 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50'
                    }`}
                    onClick={() => likeMutation.mutate(job.id)}
                    disabled={likeMutation.isPending}
                  >
                    <Heart size={18} className={likedJobs.includes(job.id) ? 'fill-current' : ''} />
                    <span className="text-sm font-medium">
                      {likedJobs.includes(job.id) ? 'Aimé' : 'J\'aime'}
                    </span>
            </button>
                </div>
              </div>

              {/* Job Content */}
              <div className="p-6">
                <p className="text-gray-700 line-clamp-3 mb-4 leading-relaxed">{job.description}</p>
                
                <div className="flex items-center gap-2 text-sm text-purple-600 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Publié le {new Date(job.published_at || '').toLocaleDateString('fr-FR')}</span>
                </div>

                {/* Skills Tags */}
                {job.skills && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {job.skills.split(',').slice(0, 3).map((skill: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs rounded-full font-medium border border-blue-200 shadow-sm">
                          {skill.trim()}
                        </span>
                      ))}
                      {job.skills.split(',').length > 3 && (
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full border border-purple-200 shadow-sm">
                          +{job.skills.split(',').length - 3} autres
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 justify-between pt-4 border-t border-blue-100">
                 

                  {/* Share to EspacePro button (for teachers only) */}
                  {(() => {
                    // Get user from localStorage (same as EspacePro)
                    const authStorage = localStorage.getItem('auth-storage');
                    const parsedAuth = JSON.parse(authStorage || '{}');
                    const user = parsedAuth.state?.user;
                    if (user?.role === 'teacher') {
                      return (
                        <button
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                          onClick={async () => {
                            const { value: comment } = await Swal.fire({
                              title: 'Partager cette offre',
                              input: 'textarea',
                              inputLabel: 'Commentaire (optionnel)',
                              inputPlaceholder: 'Ajoutez un commentaire pour vos étudiants...',
                              showCancelButton: true,
                              confirmButtonText: 'Partager',
                              cancelButtonText: 'Annuler',
                              confirmButtonColor: '#8b5cf6',
                              cancelButtonColor: '#6b7280',
                            });
                            if (comment !== undefined) {
                              shareMutation.mutate({ jobId: job.id, comment });
                              // Optionally, refresh shared offers in EspacePro
                              queryClient.invalidateQueries({ queryKey: ['sharedOffers'] });
                            }
                          }}
                        >
                          <Users size={16} /> Partager
                        </button>
                      );
                    }
                    return null;
                  })()}

              <button
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                onClick={() => {
                  Swal.fire({
                        title: (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                             {job.company}
                            </div>
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                             {job.title}
                            </span>
                          </div>
                        ),
                    html: `
                          <div class="text-left space-y-3">
                            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                              <p class="mb-2"><strong class="text-blue-700">Entreprise:</strong> <span class="text-blue-600 font-semibold">${job.company}</span></p>
                              <p class="mb-2"><strong class="text-blue-700">Compétences:</strong> ${job.skills}</p>
                              <p class="mb-4"><strong class="text-blue-700">Date de publication:</strong> ${new Date(job.published_at || '').toLocaleDateString('fr-FR')}</p>
                            </div>
                            <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                              <p class="text-purple-700 font-semibold mb-2">Description:</p>
                              <p class="text-gray-700">${job.description}</p>
                            </div>
                            <a href="${formatLink(job.link || '')}" target="_blank" rel="noopener noreferrer" class="inline-block w-full text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors duration-200 font-medium shadow-md">Voir l'offre complète</a>
                          </div>
                    `,
                    confirmButtonText: 'Fermer',
                        confirmButtonColor: '#6b7280',
                        width: '600px',
                  });
                }}
              >
                    {/*<Send size={16} />*/}
                    Details
              </button>
                </div>
              </div>
            </div>
          ))}
            </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 bg-gradient-to-r from-white to-blue-50 rounded-xl shadow-lg p-2 border border-blue-100">
              <button
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-blue-600 hover:bg-blue-100 hover:text-blue-700'
                }`}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === index + 1 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                      : 'text-blue-600 hover:bg-blue-100 hover:text-blue-700'
                  }`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}

              <button
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === totalPages 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-blue-600 hover:bg-blue-100 hover:text-blue-700'
                }`}
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {currentJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-200">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {searchTerm ? 'Aucune offre trouvée' : 'Aucune offre disponible'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? `Aucune offre ne correspond à "${searchTerm}". Essayez de modifier vos critères de recherche.` 
                : 'Aucune offre disponible pour le moment.'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors duration-200 shadow-md"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResult;
