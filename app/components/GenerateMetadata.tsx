import { Metadata } from "next";
import WebsiteURL from "./WebsiteURL";

type GenerateMetadataProps = {
  title: string;
  description: string;
  keywords?: string[];
};

export function GenerateMetadata({
  title,
  description,
  keywords = [],
}: GenerateMetadataProps): Metadata {
  return {
    title,
    description,
    keywords: keywords.join(", "),
    openGraph: {
      images: [
        {
          url: `${WebsiteURL}/images/profile-photo.png`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: `${WebsiteURL}/images/profile-photo.png`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}
