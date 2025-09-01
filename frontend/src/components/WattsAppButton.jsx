import { FaWhatsapp, FaInstagram } from "react-icons/fa";

export default function SocialButtons() {
  return (
    <div className="fixed bottom-5 right-5 flex flex-col gap-3 z-50">
      {/* WhatsApp */}
      <a
        href="https://wa.me/919812345678" // ✅ replace with your number
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300"
      >
        <FaWhatsapp size={28} />
      </a>

      {/* Instagram */}
      <a
        href="https://www.instagram.com/daizly.in?igsh=MWpxNm56c3Jrb2NhaA=="
        target="_blank"
        rel="noopener noreferrer"
        className="bg-pink-600 text-white p-4 rounded-full shadow-lg hover:bg-pink-700 transition-all duration-300"
      >
        <FaInstagram size={28} />
      </a>
    </div>
  );
}
