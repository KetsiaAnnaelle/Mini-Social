// import React from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const slides = [
  {
    title: 'Bienvenue sur StageSpeed',
    description: 'Votre mini réseau social académique pour trouver facilement un stage, échanger avec d\'autres étudiants et booster votre carrière !',
    buttonText: 'Commencer maintenant',
    buttonLink: '/offers',
    imageUrl: '/img/banniere2.jpg',
  },
  {
    title: 'Trouvez facilement des stages',
    description: 'Explorez des centaines d\'offres de stage correspondant à votre domaine d\'étude.',
    buttonText: 'Voir les offres',
    buttonLink: '/offers',
    imageUrl: '/img/banniere2.jpg',
  },
  {
    title: 'Connectez-vous avec d\'autres étudiants',
    description: 'Échangez avec une communauté d\'étudiants et partagez des opportunités.',
    buttonText: 'Tableau de bord',
    buttonLink: '/dashboard',
    imageUrl: '/img/banniere2.jpg',
  },
];

const CarouselApp = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    arrows: false,
  };

  return (
    <div className="bg-gray-50 py-10">
      <Slider {...settings} className="max-w-6xl mx-auto px-4">
        {slides.map((slide, index) => (
          <div key={index}>
            <div className="flex flex-col md:flex-row items-center gap-8 bg-white rounded-xl shadow-lg overflow-hidden p-6">
              <div className="md:w-1/2">
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-72 object-cover rounded-lg"
                />
              </div>
              <div className="md:w-1/2 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-blue-700 mb-4">
                  {slide.title}
                </h2>
                <p className="text-gray-600 mb-6 text-lg">{slide.description}</p>
                <Link
                  to={slide.buttonLink}
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full shadow hover:bg-blue-700 transition"
                >
                  {slide.buttonText}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default CarouselApp;
