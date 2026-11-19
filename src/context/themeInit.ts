import { STORAGE_KEYS } from '@/constants/storage';

/** Runs before hydration (inlined in the root layout) so `data-theme` is right on first paint. */
export const themeInitScript = `try{var m=localStorage.getItem('${STORAGE_KEYS.themeMode}');if(m!=='light'&&m!=='dark')m=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=m}catch(e){}`;
