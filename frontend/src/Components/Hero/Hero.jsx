import { useState, useEffect } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import HeroImg from '../../assets/images/eduhub.png'
import api from "../../services/api";

import {
  Search,
  User,
  ShoppingCart,
  ChevronDown,
  Menu,
  X,
  Phone,
  MapPin,
  ChevronRight
} from "lucide-react";

const Hero = () => {
  return (
    <div >
      {/* ================= HERO ================= */}
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative min-h-75 overflow-hidden rounded-xl bg-cover bg-center bg-no-repeat sm:min-h-87.5 lg:min-h-97.5"
          style={{ backgroundImage: `url(${HeroImg})`}}
        >

          {/* Hero Text */}
          <div className="relative z-10 flex h-full min-h-75 w-full items-center px-7 py-10 sm:min-h-87.5 sm:px-12 lg:min-h-97.5 lg:px-20">

            <div className="max-w-xl">

              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-700"
              >
                WELCOME TO THE SHOP
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, x: -25 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="text-3xl font-extrabold leading-tight text-emerald-950 sm:text-4xl lg:text-5xl"
              >
                Unlock Your Potential with Our Products
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 max-w-md text-sm leading-6 text-gray-600 sm:text-base"
              >
                Learn Better. Achieve More
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <Link
                  to="/cart"
                  className="inline-flex items-center rounded-full bg-emerald-800 px-7 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
                >
                  View Cart
                </Link>
              </motion.div>

            </div>

          </div>



          {/* Mobile decorative circle */}
          <div className="absolute -bottom-20 -right-20 h-52 w-52 rounded-full bg-purple-200/60 lg:hidden" />

        </motion.div>

      </div>
    </div>
  )
}

export default Hero
