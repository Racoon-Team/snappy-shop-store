import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import { useEffect, useState } from 'react';

//internal import

import Navbar from '@layout/navbar/Navbar';
import Footer from '@layout/footer/Footer';
import NavBarTop from './navbar/NavBarTop';
import FooterTop from '@layout/footer/FooterTop';
import MobileFooter from '@layout/footer/MobileFooter';
import FeatureCard from '@components/feature-card/FeatureCard';
import WhatsAppButton from '@components/whatsAppButton';
import SettingServices from '@services/SettingServices';
import ChatWidget from '@components/chat-widget/ChatWidget';

const Layout = ({ title, description, children }) => {
  const [whatsappConfig, setWhatsappConfig] = useState({ phone: '', message: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await SettingServices.getGlobalSetting();
        if (res) {
          setWhatsappConfig({
            phone: res.whatsapp_phone,
            message: res.whatsapp_message,
          });
        }
      } catch (err) {
        console.error('Error fetching WhatsApp settings:', err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <>
      <ToastContainer />
      <div className="font-sans">
        <Head>
          <title>{title ? `KachaBazar | ${title}` : 'KachaBazar'}</title>
          {description && <meta name="description" content={description} />}
          <link href="/favicon.png" />
        </Head>
        <NavBarTop />
        <Navbar />
        <div className="bg-gray-50">{children}</div>
        <MobileFooter />
        <div className="w-full">
          <FooterTop />
          <div className="hidden relative lg:block mx-auto max-w-screen-2xl py-6 px-3 sm:px-10">
            <FeatureCard />
          </div>
          <hr className="hr-line" />
          <div className="border-t border-gray-100 w-full">
            <Footer />
          </div>
        </div>
        <WhatsAppButton phoneNumber={whatsappConfig.phone} message={whatsappConfig.message} />
        <ChatWidget />
      </div>
    </>
  );
};

export default Layout;
