import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Search, Bell, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const Home = () => {
  const { user } = useAuth();
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [ctaRef, ctaInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <Layout>
      <div className="space-y-20 py-16">
        {/* Hero Section */}
        <motion.section 
          ref={heroRef}
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-bold tracking-tight"
            variants={fadeIn}
          >
            Campus Item Finder
          </motion.h1>
          <motion.p 
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            variants={fadeIn}
          >
            The easiest way to report and find lost items on campus.
            Connect with others and help reunite people with their belongings.
          </motion.p>
          <motion.div 
            className="flex flex-wrap justify-center gap-4 mt-8"
            variants={staggerChildren}
          >
            {user ? (
              <>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button asChild size="lg" className="bg-[#1a73e8] hover:bg-[#1557b0] transition-all duration-300">
                    <Link to="/dashboard">
                      View Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button asChild variant="outline" size="lg" className="transition-all duration-300">
                    <Link to="/report-lost">Report Lost Item</Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button asChild variant="outline" size="lg" className="transition-all duration-300">
                    <Link to="/report-found">Report Found Item</Link>
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button asChild size="lg" className="bg-[#1a73e8] hover:bg-[#1557b0] transition-all duration-300">
                    <Link to="/register">
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button asChild variant="outline" size="lg" className="transition-all duration-300">
                    <Link to="/login">Login</Link>
                  </Button>
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.section>

        {/* Features Section */}
        <motion.section 
          ref={featuresRef}
          initial="hidden"
          animate={featuresInView ? "visible" : "hidden"}
          variants={staggerChildren}
          className="py-8"
        >
          <motion.h2 
            variants={fadeIn}
            className="text-3xl font-bold text-center mb-16"
          >
            How It Works
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto px-4">
            {[
              {
                icon: Bell,
                title: "Report Items",
                description: "Whether you've lost something or found someone else's belongings, quickly report it with our easy-to-use forms."
              },
              {
                icon: Search,
                title: "Browse Dashboard",
                description: "Check our comprehensive dashboard to see if someone has found your item or to find the owner of something you've found."
              },
              {
                icon: CheckCircle,
                title: "Get Connected",
                description: "Our platform connects people who have lost items with those who have found them, making campus a more helpful community."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={{ y: -5 }}
                className="flex flex-col items-center text-center space-y-4 feature-card"
              >
                <motion.div 
                  className="bg-[#1a73e8]/10 p-6 rounded-full mb-2 relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <feature.icon className="h-10 w-10 text-[#1a73e8] relative z-10" />
                  <motion.div 
                    className="absolute inset-0 bg-[#1a73e8]/5"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                </motion.div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>
        
        {/* CTA Section */}
        <motion.section 
          ref={ctaRef}
          initial="hidden"
          animate={ctaInView ? "visible" : "hidden"}
          variants={fadeIn}
          className="bg-[#1a73e8]/5 rounded-xl p-8 md:p-12 text-center relative overflow-hidden"
        >
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-[#1a73e8]/10 to-transparent"
            animate={{ 
              x: ["-100%", "100%"],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <motion.h2 
              variants={fadeIn}
              className="text-3xl font-bold"
            >
              Ready to find what you're looking for?
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-xl text-muted-foreground"
            >
              Join our campus community today and help make lost items found again.
            </motion.p>
            <motion.div 
              className="mt-8"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {user ? (
                <Button asChild size="lg" className="bg-[#1a73e8] hover:bg-[#1557b0] transition-all duration-300">
                  <Link to="/dashboard">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="bg-[#1a73e8] hover:bg-[#1557b0] transition-all duration-300">
                  <Link to="/register">
                    Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
            </motion.div>
          </div>
        </motion.section>
      </div>
    </Layout>
  );
};

export default Home;
