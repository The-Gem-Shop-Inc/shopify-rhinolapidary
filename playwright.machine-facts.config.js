const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({testDir:'tests',testMatch:'epic-f-facts.spec.js',workers:1,timeout:45000,
  outputDir:'test-results/epic-f/f4/browser-artifacts',reporter:[['list'],['json',{outputFile:'test-results/epic-f/f4/playwright.json'}]],
  use:{browserName:'chromium',trace:'retain-on-failure'}});
