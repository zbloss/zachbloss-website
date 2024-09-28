"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
interface ProjectItem {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  icon?: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  useEffect(() => {
    async function fetchProjects() {
      const response = await fetch("/data/projects.json");
      const items = await response.json();
      setProjects(items);
    }
    fetchProjects();
  }, []);

  return (
    <section id="projects" className="py-16 px-6 bg-black bg-opacity-80">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-7xl font-bold text-white mb-12 text-left">
          Projects
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {projects.map((item: ProjectItem, index: number) => {

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="
                    bg-gradient-to-br 
                    from-black 
                    to-gray-900 
                    p-6 
                    border 
                    border-purple-400
                    flex
                    flex-col
                    "
                key={index}
              >
                <Link href={item.link} className="flex-grow">
                  
                  <div className="flex items-center mb-2">
                    <h3 className="text-2xl font-semibold mr-2">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-gray-300 mb-4 font-light">
                    {item.description}
                  </p>
                </Link>
                <div className="flex justify-center items-center mt-auto">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={200}
                    height={100}
                    objectFit="contain"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
