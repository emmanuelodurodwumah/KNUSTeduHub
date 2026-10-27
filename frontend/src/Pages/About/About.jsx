import { motion } from "framer-motion";
import {
  Users,
  Target,
  Rocket,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";

import PageWrapper from "../../Components/PageWrapper/PageWrapper";
import EBDenterpriseIMG from "../../assets/images/ebdenterprises.png"

const values = [
  {
    icon: <Target size={35} />,
    title: "Our Mission",
    description:
      "Empowering people with innovative digital solutions that simplify everyday life and create lasting impact.",
  },
  {
    icon: <Rocket size={35} />,
    title: "Our Vision",
    description:
      "To become a trusted technology platform recognized for creativity, quality, and continuous innovation.",
  },
  {
    icon: <ShieldCheck size={35} />,
    title: "Integrity",
    description:
      "We build products with honesty, transparency, and security at the center of everything we do.",
  },
];

const stats = [
  { number: "2", label: "Projects Completed" },
  { number: "2", label: "Happy Clients" },
  { number: "1", label: "Years Experience" },
  { number: "24/7", label: "Support" },
];

const About = () => {
  return (
    <PageWrapper>
      <section className="bg-slate-950 text-white overflow-hidden">
        {/* Hero */}
        <div className="relative">
          <div className="absolute inset-0 bg-linear-to-r from-blue-700/20 via-cyan-500/10 to-purple-600/20 blur-3xl"></div>

          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <p className="text-cyan-400 uppercase tracking-widest font-semibold mb-4">
                About Us
              </p>

              <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl md:text-6xl">
                Building Digital Experiences That Matter
              </h1>

              <p className="mt-5 text-base leading-7 text-slate-300 sm:mt-6 sm:text-lg sm:leading-8">
                We help businesses and individuals transform ideas into
                beautiful, scalable, and high-performing digital products using
                modern technologies.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Story */}
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:gap-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <img
              src={ EBDenterpriseIMG }
              alt="Team"
              className="aspect-[4/3] w-full rounded-2xl object-cover shadow-2xl sm:rounded-3xl lg:aspect-auto lg:h-125"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <span className="text-cyan-400 font-semibold uppercase tracking-wider">
              Who we are
            </span>

            <h2 className="mb-5 mt-4 text-3xl font-bold sm:mb-6 sm:text-4xl">
              Passionate creators driven by innovation.
            </h2>

            <p className="text-slate-300 leading-8 mb-6">
              We specialize in designing and developing websites, web
              applications, and digital solutions that combine beautiful user
              experiences with robust technology.
            </p>

            <p className="text-slate-300 leading-8 mb-8">
              Every project is approached with creativity, attention to detail,
              and a commitment to delivering value that exceeds expectations.
            </p>

          </motion.div>
        </div>

        {/* Values */}
        <div className="bg-slate-900 py-14 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-10 text-center sm:mb-16"
            >
              <h2 className="text-3xl font-bold sm:text-4xl">Our Core Values</h2>

              <p className="text-slate-400 mt-4">
                The principles that guide everything we do.
              </p>
            </motion.div>

            <div className="grid gap-5 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {values.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 70 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:rounded-3xl sm:p-8"
                >
                  <div className="mb-4 text-cyan-400 sm:mb-6">{item.icon}</div>

                  <h3 className="mb-3 text-xl font-bold sm:mb-4 sm:text-2xl">{item.title}</h3>

                  <p className="text-slate-300 leading-7">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="py-14 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4 lg:gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="rounded-2xl bg-slate-900 p-5 text-center sm:rounded-3xl sm:p-8 lg:p-10"
                >
                  <h2 className="text-3xl font-bold text-cyan-400 sm:text-5xl">
                    {stat.number}
                  </h2>

                  <p className="mt-3 text-slate-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-slate-900 py-14 sm:py-20 lg:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 70 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 text-3xl font-bold sm:mb-8 sm:text-4xl">Why Choose Us?</h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <Users className="text-cyan-400" />
                  <div>
                    <h4 className="font-semibold text-xl">Expert Delivery</h4>
                    <p className="text-slate-400">
                      Skilled professionals with experience across multiple
                      technologies.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <HeartHandshake className="text-cyan-400" />
                  <div>
                    <h4 className="font-semibold text-xl">Client First</h4>
                    <p className="text-slate-400">
                      We prioritize your goals and build solutions tailored to
                      your needs.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Rocket className="text-cyan-400" />
                  <div>
                    <h4 className="font-semibold text-xl">Modern Technology</h4>
                    <p className="text-slate-400">
                      Built using the latest technologies for speed,
                      scalability, and reliability.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              src={ EBDenterpriseIMG }
              alt="Office"
              className="w-full rounded-2xl object-cover shadow-2xl sm:rounded-3xl"
            />
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default About;
