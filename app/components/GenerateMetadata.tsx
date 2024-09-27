import { Metadata } from "next";
import { DefaultKeywords } from "./DefaultKeywords";

type GenerateMetadataProps = {
  title: string;
  description: string;
  keywords?: string[];
};

export function GenerateMetadata({
  title,
  description,
  keywords = DefaultKeywords,
}: GenerateMetadataProps): Metadata {
  return {
    title,
    description,
    keywords: keywords.join(", "),
  };
}
