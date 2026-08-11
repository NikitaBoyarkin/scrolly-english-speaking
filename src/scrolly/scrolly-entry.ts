import { initScrollyRuntime } from './scrolly-runtime';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollyRuntime);
} else {
  initScrollyRuntime();
}
