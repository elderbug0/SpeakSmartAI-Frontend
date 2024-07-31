import React from 'react';
import { useTranslation } from 'react-i18next';
import { RxAvatar } from "react-icons/rx";

const testimonials = [
  {
    name: 'Tokhtar Kumisbek',
    feedback: 'This app is amazing! It has helped me improve my speaking skills significantly.',
    avatar: <RxAvatar className="w-16 h-16 mx-auto" />
  },
  {
    name: 'Dias Nugumanov',
    feedback: 'I love how easy it is to use this app. The analysis is spot-on!',
    avatar: <RxAvatar className="w-16 h-16 mx-auto" />
  },
  {
    name: 'Imanali Koksal',
    feedback: 'A game changer for public speaking. Highly recommend it!',
    avatar: <RxAvatar className="w-16 h-16 mx-auto" />
  }
];

const Testimonials = () => {
  const { t } = useTranslation();
  
  return (
    <section className=" mt-32 mx-8 sm:mx-20">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">{t('What other people say')}</h2>
      </div>
      <div className="flex flex-col sm:flex-row justify-center overflow-hidden relative">
        <div className="flex sm:flex-row flex-col space-y-4 sm:space-y-0 sm:space-x-16 my-4 mt-3">

          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial bg-white rounded-xl p-8 shadow-lg flex-shrink-0 w-80 border border-gray-200">
              <div className="w-16 h-16 rounded-full mx-auto">
                {testimonial.avatar}
              </div>
              <h3 className="text-lg font-semibold text-center mt-4">{t(testimonial.name)}</h3>
              <p className="text-gray-600 text-center mt-2">{t(testimonial.feedback)}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-100 to-transparent"></div>
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-100 to-transparent"></div>
    </section>
  );
};

export default Testimonials;
