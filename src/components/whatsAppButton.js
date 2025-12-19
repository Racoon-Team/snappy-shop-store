import { FaWhatsapp } from 'react-icons/fa';
const WhatsAppButton = ({ phoneNumber, message }) => {
  if (!phoneNumber) return null;

  const encodedMessage = encodeURIComponent(message || 'Hola, necesito más información');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Contactar por WhatsApp"
    >
      <FaWhatsapp size={32} color="white" />
    </a>
  );
};

export default WhatsAppButton;
