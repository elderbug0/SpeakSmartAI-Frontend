// src/components/Footer.js

import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-gray-500 py-8 mt-8">
      <div className="text-center text-gray-300 text-base">
        <p>© 2024 Speak Smart AI. {t('All Rights Reserved')}</p>
        <div className="flex justify-center space-x-4 mt-9 mb-3">
          <a href="/privacy-policy" >{t('Privacy Policy')}</a>
          <a href="/terms-of-service" >{t('Terms of Service')}</a>
          <a href="/contact-us" >{t('Contact Us')}</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
