const KEY = 'lumio-profile-v1';

const freshProfile = () => ({
  account: null,
  appLanguage: null,
  childName: '',
  localizedNames: {},
  selectedLanguage: null,
  selectedGame: null,
  homeLanguage: 'nl',
  learningLanguage: 'nl',
  templateId: 'default',
  progress: {},
  rewards: { stars: 0, streak: 0, lastPractice: null },
  preferences: { reducedMotion: false, adsEnabled: true }
});

export function loadProfile() {
  try {
    const profile = { ...freshProfile(), ...JSON.parse(localStorage.getItem(KEY) || '{}') };
    if (profile.selectedLanguage === 'nl-BE') profile.selectedLanguage = 'nl';
    if (profile.learningLanguage === 'nl-BE') profile.learningLanguage = 'nl';
    if (profile.homeLanguage === 'nl-BE') profile.homeLanguage = 'nl';
    if (profile.progress?.['nl-BE']) {
      profile.progress.nl = profile.progress.nl || profile.progress['nl-BE'];
      delete profile.progress['nl-BE'];
    }
    return profile;
  }
  catch { return freshProfile(); }
}

export function saveProfile(profile) { localStorage.setItem(KEY, JSON.stringify(profile)); }

export function languageProgress(profile, languageId) {
  return profile.progress[languageId] || { completed: [], tracingCompleted: [], activeLesson: 0, mistakes: 0, dailyCount: 0 };
}

export function updateLanguageProgress(profile, languageId, change) {
  const current = languageProgress(profile, languageId);
  profile.progress[languageId] = { ...current, ...change };
  saveProfile(profile);
}

export function rewardPractice(profile, stars = 1) {
  const today = new Date().toISOString().slice(0, 10);
  if (profile.rewards.lastPractice !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    profile.rewards.streak = profile.rewards.lastPractice === yesterday ? profile.rewards.streak + 1 : 1;
    profile.rewards.lastPractice = today;
  }
  profile.rewards.stars += stars;
  saveProfile(profile);
}
