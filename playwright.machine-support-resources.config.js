const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({testDir:'tests',testMatch:'epic-f-support-resources.spec.js',workers:1,timeout:45000,
  outputDir:'test-results/epic-f/f6/browser-artifacts',reporter:[['list'],['json',{outputFile:'test-results/epic-f/f6/playwright.json'}]],
  use:{browserName:'chromium',trace:'retain-on-failure'}});
