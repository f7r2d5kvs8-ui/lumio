import { lumioSupabase } from './cloud.js';

const ANONYMOUS_KEY = 'lumio-analytics-id-v1';
const FIRST_OPEN_KEY = 'lumio-analytics-first-open-v1';
const SESSION_KEY = 'lumio-analytics-session-v1';
const EVENT_NAMES = new Set([
  'first_open', 'session_start', 'language_selected',
  'lesson_started', 'lesson_completed', 'game_started', 'game_completed',
  'curriculum_progress', 'support_viewed', 'support_clicked'
]);
const SAFE_METADATA_KEYS = new Set(['source', 'activity_type', 'completion_reason', 'variant']);

let analyticsUser = null;
let analyticsContext = { platform: 'web', appVersion: 'unknown', language: null };
let started = false;

function randomId() {
  return globalThis.crypto?.randomUUID?.() || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, character => {
    const random = Math.floor(Math.random() * 16);
    return (character === 'x' ? random : (random & 3) | 8).toString(16);
  });
}

function storedId(storage, key) {
  try {
    let value = storage.getItem(key);
    if (!value) { value = randomId(); storage.setItem(key, value); }
    return value;
  } catch { return randomId(); }
}

const anonymousId = storedId(localStorage, ANONYMOUS_KEY);
const sessionId = storedId(sessionStorage, SESSION_KEY);

function safeMetadata(metadata = {}) {
  return Object.fromEntries(Object.entries(metadata).filter(([key, value]) =>
    SAFE_METADATA_KEYS.has(key) && ['string', 'number', 'boolean'].includes(typeof value) && String(value).length <= 80
  ));
}

export function setAnalyticsUser(user) { analyticsUser = user || null; }

export function setAnalyticsLanguage(language) { analyticsContext.language = language || null; }

export function trackEvent(eventName, details = {}) {
  if (!lumioSupabase || !EVENT_NAMES.has(eventName)) return;
  const payload = {
    anonymous_id: anonymousId,
    user_id: analyticsUser?.id || null,
    session_id: sessionId,
    event_name: eventName,
    platform: analyticsContext.platform,
    app_version: analyticsContext.appVersion,
    language_id: details.language || analyticsContext.language || null,
    activity_id: details.activityId || null,
    progress_current: Number.isInteger(details.progressCurrent) ? details.progressCurrent : null,
    progress_total: Number.isInteger(details.progressTotal) ? details.progressTotal : null,
    metadata: safeMetadata(details.metadata)
  };
  queueMicrotask(() => {
    void lumioSupabase.from('analytics_events').insert(payload).then(({ error }) => {
      if (error) console.debug('Lumio analytics event was skipped.');
    }).catch(() => {});
  });
}

export function startAnalytics({ user = null, appVersion, language } = {}) {
  setAnalyticsUser(user);
  analyticsContext = { ...analyticsContext, appVersion: appVersion || analyticsContext.appVersion, language: language || null };
  if (started) return;
  started = true;
  try {
    if (!localStorage.getItem(FIRST_OPEN_KEY)) {
      localStorage.setItem(FIRST_OPEN_KEY, new Date().toISOString());
      trackEvent('first_open');
    }
  } catch { /* Storage-disabled visits still get a session event. */ }
  trackEvent('session_start');
}

export const trackSupportViewed = source => trackEvent('support_viewed', { metadata: { source } });
export const trackSupportClicked = source => trackEvent('support_clicked', { metadata: { source } });
