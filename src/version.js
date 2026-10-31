/**
 * Build metadata. `scripts/build.mjs` replaces these identifiers with values
 * read from package.json and the build clock; the fallbacks keep source-level
 * tests and development bundles working without the define step.
 */
export const PLUGIN_VERSION = typeof __AINP_VERSION__ === 'string' ? __AINP_VERSION__ : 'dev'
export const PLUGIN_BUILD_TIME = typeof __AINP_BUILD_TIME__ === 'string' ? __AINP_BUILD_TIME__ : ''
