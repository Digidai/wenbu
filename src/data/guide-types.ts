export type GuideEdition = {
  answer: string;
  takeaways: string[];
  figure: { caption: string; description: string };
  table: { title: string; columns: string[]; rows: string[][] };
  example: { title: string; intro: string; steps: string[]; conclusion: string };
  faq: { question: string; answer: string }[];
  glossary: { term: string; definition: string }[];
};

export type GuideExpansion = {
  zh: GuideEdition;
  en: GuideEdition;
  sources: { title: string; url: string; noteZh: string; noteEn: string }[];
};
