import { FaWhatsapp } from "react-icons/fa";
const WhatsAppButton = ({
  phoneNumber = "59171234567",
  message = "Hola, necesito más información"
}) => {
  const encodedMessage = encodeURIComponent(message);
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
