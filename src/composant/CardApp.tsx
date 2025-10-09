// import React from 'react';
import { FaClipboardList, FaComments, FaBell } from 'react-icons/fa';

const CardApp = () => {
  return (
    <div className="bg-white py-12">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-blue-600 mb-8">Principales fonctionnalités</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-50 shadow-lg rounded-lg p-6 flex items-center">
            <FaClipboardList className="text-blue-600 mr-4 text-2xl" />
            <div>
              <h3 className="text-xl font-bold mb-2">Mes Candidatures</h3>
              <p className="text-gray-600">Suivez l'état de vos candidatures de stage.</p>
            </div>
          </div>
          <div className="bg-gray-50 shadow-lg rounded-lg p-6 flex items-center">
            <FaComments className="text-blue-600 mr-4 text-2xl" />
            <div>
              <h3 className="text-xl font-bold mb-2">Forum</h3>
              <p className="text-gray-600">Discutez avec d'autres étudiants.</p>
            </div>
          </div>
          <div className="bg-gray-50 shadow-lg rounded-lg p-6 flex items-center">
            <FaBell className="text-blue-600 mr-4 text-2xl" />
            <div>
              <h3 className="text-xl font-bold mb-2">Notifications</h3>
              <p className="text-gray-600">Recevez les dernières mises à jour.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardApp;
