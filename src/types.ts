// src/types.ts
export interface GifItem {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  isDefault: boolean;
}

export interface StorageState {
  gifs: GifItem[];
  masterSwitch: boolean; // Main ON/OFF switch for the whole extension
}