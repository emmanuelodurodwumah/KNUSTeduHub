import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import { Link } from "react-router-dom";
import { quickLinks } from "../../data/Quicklinks";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid justify-center gap-9 sm:gap-12 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold text-white">
              eduHub
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-7 text-gray-400 sm:text-base">
              eduHub is a platform dedicated to providing high-quality and trustworthy products.
            </p>

          </div>

          {/* Quick Links */}
          <div> 
            <h3 className="text-lg font-semibold text-white">
              Quick Links
            </h3>

            <ul className="mt-5 space-y-3 sm:space-y-4">
              {quickLinks.map((link) => (
                <li key={link.title}>
                  <Link
                    to={link.url}
                    className="hover:text-red-500 transition-colors duration-300"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>

          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white">
              Contact
            </h3>

            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="text-blue-500" size={18} />
                <span>Kumasi, Ghana</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="text-blue-500" size={18} />
                <a href="tel:+233538070293" className="break-all hover:text-white">+233 53 807 0293</a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="text-blue-500" size={18} />
                <a href="mailto:eduHub@gmail.com" className="break-all hover:text-white">eduHub@gmail.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-7 h-px bg-slate-800 sm:my-10"></div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-400 md:flex-row">
          <p>
            © {new Date().getFullYear()} eduHub. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
};

export default Footer;