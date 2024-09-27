"use client";
import { useState, useEffect } from "react";

interface CertificateItem {
  title: string;
  description: string;
  imageUrl: string;
}

interface CertificateProps {
  items: CertificateItem[];
}

export default function Certifications() {
  const [certifications, setCertifications] = useState<CertificateItem[]>([]);

  useEffect(() => {
    async function fetchCertifications() {
      const response = await fetch('/data/certifications.json');
      const items = await response.json();
      setCertifications(items);
    }
    fetchCertifications();
  }, []);


  console.log("items", certifications);

  return (
    <div>
      {certifications.map((item: CertificateItem, index: number) => (
        <div key={index}>
          <h2>{item.title}</h2>
          <p>{item.description}</p>
          <img src={item.imageUrl} alt={item.title} />
        </div>
      ))}
    </div>
  );
}

// export async function getStaticProps() {
//   // const filePath = path.join(process.cwd(), 'public', 'certifications.json');
//   // const jsonData = fs.readFileSync(filePath, 'utf8');
//   // const items: CertificateItem[] = JSON.parse(jsonData);

//   const response = await fetch("/data/certifications.json");
//   const items = await response.json();

//   console.log("items", items);

//   return {
//     props: {
//       items,
//     },
//   };
// }
