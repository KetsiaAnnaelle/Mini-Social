import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Share2, Heart, MessageCircle, Send, Users } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuthStore } from '@/store/useAuthStore';

// Define JobType interface at the top
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
  let cleaned = link.trim().replace(/^https?:\/\//, '').replace(/^www\./, '');
  if (!cleaned.includes('emploi.cm')) return '#';
  return `https://www.${cleaned}`;
};

const SearchResult = () => {
  const { token, user } = useAuthStore();  
  const queryClient = useQueryClient();

  if (!user || user.role !== 'teacher') {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold text-red-600">Accès réservé aux enseignants</p>
      </div>
    );
  }

  // ✅ Fonction de récupération des offres (maintenant à l'intérieur du composant)
  const fetchJobOffers = async () => {
    //const response = await axios.get('http://localhost:8000/api/job-offers'
    
    const response = await axios.get(`${import.meta.env.VITE_API_BACKEND_URL}/job-offers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  };

  // ✅ Fonction de like d'une offre
  const likeJobOffer = async (jobId: string) => {
    await axios.post(
      `${import.meta.env.VITE_API_BACKEND_URL}/job-offers/${jobId}/like`,
      //`http://localhost:8000/api/job-offers/${jobId}/like`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      } 
    );
  };

  const { data: jobs = [], isLoading, isError } = useQuery<JobType[]>({
    queryKey: ['jobs'],
    queryFn: fetchJobOffers,
    enabled: !!token,
    // Remove onError if not supported by your React Query version
  });

  const likeMutation = useMutation({
    mutationFn: likeJobOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: () => {
      Swal.fire('Erreur', 'Impossible de liker cette offre', 'error');
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Offres d'emploi disponibles</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job: JobType) => (
          <div key={job.id} className="bg-white rounded-xl shadow-md p-6 relative hover:shadow-lg transition">

            <button
              onClick={() =>
                navigator.share?.({
                  title: job.title,
                  text: `${job.description} - ${job.company}`,
                  url: formatLink(job.link || ''),
                })
              }
              className="absolute top-4 right-4 text-gray-500 hover:text-blue-500"
              title="Partager"
            >
              <Share2 size={20} />
            </button>

            <h3 className="text-lg font-semibold text-red-600 mb-1">{job.title}</h3>
            <p className="text-sm text-gray-600 font-medium mb-3">{job.company}</p>
            <p className="text-gray-700 line-clamp-3 mb-4">{job.description}</p>

            <div className="text-right mb-4">
              <button
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => {
                  Swal.fire({
                    title: job.title,
                    html: `
                      <p><strong>Entreprise:</strong> ${job.company}</p>
                      <p>
                        <a href="${formatLink(job.link || '')}"
                           target="_blank"
                           rel="noopener noreferrer"
                           style="color: #3b82f6; text-decoration: underline;">
                           Voir l'Offre
                        </a>
                      </p>
                      <p><strong>Compétences:</strong> ${job.skills}</p>
                      <p><strong>Date de publication:</strong> ${job.published_at}</p>
                    `,
                    confirmButtonText: 'Fermer',
                  });
                }}
              >
                Consulter l'offre
              </button>
            </div>

            <div className="flex justify-around border-t pt-4 text-gray-600">
              <button
                className="flex items-center gap-2 hover:text-red-500 transition"
                onClick={() => likeMutation.mutate(String(job.id))}
              >
                <Heart size={18} /> J'aime
              </button>

              <button className="flex items-center gap-2 hover:text-blue-500 transition">
                <MessageCircle size={18} /> Commenter
              </button>

              <button
                className="flex items-center gap-2 hover:text-green-500 transition"
                onClick={() => {
                  Swal.fire({
                    title: "Postuler à l'offre",
                    html: `
                      <input type="text" id="name" class="swal2-input" placeholder="Nom complet">
                      <input type="email" id="email" class="swal2-input" placeholder="Email">
                      <input type="file" id="cv" class="swal2-file" placeholder="Importer CV">
                    `,
                    confirmButtonText: 'Envoyer la candidature',
                    focusConfirm: false,
                    preConfirm: () => {
                      Swal.fire("Candidature envoyée !", '', 'success');
                    }
                  });
                }}
              >
                <Send size={18} /> Postuler
              </button>
            </div>

            <div className="flex justify-center mt-4">
              <button
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full shadow hover:bg-purple-700 transition"
                onClick={() => Swal.fire('Partagé avec succès aux étudiants !')}
              >
                <Users size={18} /> Partager aux étudiants
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResult;
