
export interface CulturalData {
  country: string;
  officialName: string;
  capital: string;
  geographyFact: string;
  anthropology: string;
  culture: string;
  languageName: string;
  languageGreeting: string;
  phoneticGreeting: string;
  outfitDescription: string;
  historicalContext: string;
}

export interface CountryGeo {
  id: string;
  name: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING_DATA = 'LOADING_DATA',
  LOADING_AUDIO = 'LOADING_AUDIO',
  ERROR = 'ERROR'
}
