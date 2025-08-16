import React from 'react';
import { FiAward, FiUsers, FiTruck, FiShield } from 'react-icons/fi';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  const stats = [
    { icon: FiUsers, label: 'Happy Customers', value: '50,000+' },
    { icon: FiTruck, label: 'Orders Delivered', value: '100,000+' },
    { icon: FiAward, label: 'Years of Excellence', value: '10+' },
    { icon: FiShield, label: 'Trust Rating', value: '4.9/5' },
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg',
      description: 'Visionary leader with 15+ years in e-commerce and retail innovation.',
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg',
      description: 'Technology expert driving our digital transformation and innovation.',
    },
    {
      name: 'Emily Davis',
      role: 'Head of Design',
      image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg',
      description: 'Creative director ensuring beautiful and intuitive user experiences.',
    },
    {
      name: 'David Wilson',
      role: 'Head of Operations',
      image: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg',
      description: 'Operations expert ensuring seamless delivery and customer satisfaction.',
    },
  ];

  const values = [
    {
      title: 'Quality First',
      description: 'We source only the highest quality products from trusted suppliers worldwide.',
      icon: FiAward,
    },
    {
      title: 'Customer Centric',
      description: 'Every decision we make is guided by what\'s best for our customers.',
      icon: FiUsers,
    },
    {
      title: 'Innovation',
      description: 'We continuously embrace new technologies to enhance your shopping experience.',
      icon: FiShield,
    },
    {
      title: 'Sustainability',
      description: 'We\'re committed to responsible business practices and environmental stewardship.',
      icon: FiTruck,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              About ModernStore
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              We're on a mission to revolutionize online shopping by combining cutting-edge technology 
              with exceptional customer service and premium products.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto"></div>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-lg text-gray-600 dark:text-gray-300">
                <p>
                  Founded in 2014, ModernStore began as a small startup with a big dream: 
                  to create the most intuitive and enjoyable online shopping experience possible.
                </p>
                <p>
                  What started as a simple idea has grown into a global platform serving 
                  customers worldwide, powered by cutting-edge 3D visualization technology 
                  and a commitment to excellence in every interaction.
                </p>
                <p>
                  Today, we're proud to be at the forefront of e-commerce innovation, 
                  continuously pushing boundaries to deliver exceptional value and 
                  unforgettable experiences to our customers.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <img
                src="https://images.pexels.com/photos/7988086/pexels-photo-7988086.jpeg"
                alt="Our team working"
                className="rounded-lg shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              By the Numbers
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Our impact speaks for itself
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-8 rounded-2xl"
            >
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-lg opacity-90">
                To democratize access to premium products and exceptional shopping experiences 
                through innovative technology, while building a community of satisfied customers 
                who trust us with their most important purchases.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-8 rounded-2xl"
            >
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-lg opacity-90">
                To be the world's most customer-centric e-commerce platform, where technology 
                and human connection combine to create shopping experiences that exceed expectations 
                and inspire loyalty for generations to come.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white ml-4">
                      {value.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              The passionate people behind ModernStore
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {member.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Join Our Journey
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Be part of the ModernStore community and experience the future of online shopping.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/collections"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300"
              >
                Start Shopping
              </a>
              <a
                href="#"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;