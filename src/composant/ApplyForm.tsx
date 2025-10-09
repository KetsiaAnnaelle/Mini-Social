// components/ApplyForm.tsx
// import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from '@/utils/axiosInstance';

const ApplyForm = ({ jobId, onClose }: { jobId: number; onClose: () => void }) => {
  const initialValues = {
    name: '',
    email: '',
    filiere: '',
    niveau: '',
    etablissement: '',
    cv: null,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Nom requis'),
    email: Yup.string().email('Email invalide').required('Email requis'),
    filiere: Yup.string().required('Filière requise'),
    niveau: Yup.string().required('Niveau requis'),
    etablissement: Yup.string().required('Établissement requis'),
    cv: Yup.mixed().required('CV requis'),
  });

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (typeof value === 'string' || value instanceof Blob) formData.append(key, value);
    });

    try {
      //await axios.post(`/api/job-offers/${jobId}/apply`, formData);
      await axios.post(`/job-offers/${jobId}/apply`, formData);
      alert('Candidature envoyée avec succès !');
      resetForm();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la soumission');
    }
    setSubmitting(false);
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Postuler à l'offre</h2>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ setFieldValue, isSubmitting }) => (
          <Form className="space-y-4">
            <Field name="name" placeholder="Nom complet" className="w-full p-2 border rounded" />
            <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />

            <Field name="email" placeholder="Email" className="w-full p-2 border rounded" />
            <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />

            <Field name="filiere" placeholder="Filière" className="w-full p-2 border rounded" />
            <ErrorMessage name="filiere" component="div" className="text-red-500 text-sm" />

            <Field name="niveau" placeholder="Niveau" className="w-full p-2 border rounded" />
            <ErrorMessage name="niveau" component="div" className="text-red-500 text-sm" />

            <Field name="etablissement" placeholder="Établissement" className="w-full p-2 border rounded" />
            <ErrorMessage name="etablissement" component="div" className="text-red-500 text-sm" />

            <input
              name="cv"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) => setFieldValue('cv', event.currentTarget.files?.[0])}
              className="w-full"
            />
            <ErrorMessage name="cv" component="div" className="text-red-500 text-sm" />

            <div className="flex justify-between pt-4">
              <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded">
                {isSubmitting ? 'Envoi...' : 'Envoyer'}
              </button>
              <button type="button" onClick={onClose} className="text-gray-500 px-4 py-2">
                Annuler
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ApplyForm;
