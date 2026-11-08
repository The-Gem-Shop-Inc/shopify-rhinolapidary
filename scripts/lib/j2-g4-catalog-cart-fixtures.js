'use strict';

const path = require('node:path');
const j2Fixture = require('./epic-j-j2-collection-fixtures');
const plan = require('../../data/epic-g-g4-catalog-navigation.json');

const catalogChildren = plan.adminMenuPlan.after.find(({ label }) => label === 'Catalog').children;

async function mount(page, options = {}) {
  const mounted = await j2Fixture.mount(page, options);
  for (const asset of [
    'assets/base.css',
    'assets/template-collection.css',
    'assets/component-card.css',
    'assets/quick-add.css',
    'assets/quantity-popover.css',
    'assets/rhino-g-catalog-navigation.css',
  ]) await page.addStyleTag({ path: path.resolve(asset) });
  await page.addStyleTag({
    content: `:root {
      --grid-mobile-horizontal-spacing: 1.5rem;
      --grid-mobile-vertical-spacing: 1.5rem;
      --grid-desktop-horizontal-spacing: 2rem;
      --grid-desktop-vertical-spacing: 2rem;
      --font-body-scale: 1;
      --inputs-border-width: 1px;
    }
    .grid__item { min-width: 0; }
    .card img { display: block; max-width: 100%; height: auto; }`,
  });
  await page.evaluate((children) => {
    document.title = 'Rhino Lapidary Products';
    document.documentElement.dataset.integrationRuntime = 'j2-g4';

    const links = children
      .map(({ label, route }) => `<li><a data-fixture-route href="${route}">${label}</a></li>`)
      .join('');
    const header = document.querySelector('header');
    header.insertAdjacentHTML(
      'afterbegin',
      `<details class="header__submenu catalog-disclosure"><summary>Catalog</summary><ul>${links}</ul></details>`,
    );

    const main = document.querySelector('main');
    main.querySelector('h1').textContent = 'Products';
    main.insertAdjacentHTML(
      'afterbegin',
      `<nav class="rhino-g-catalog-navigation" aria-label="Catalog categories"><ul>${links}</ul></nav>
       <nav class="catalog-controls" aria-label="Catalog controls">
         <a data-fixture-route href="/collections/all?filter.v.availability=1">Available Products</a>
         <a data-fixture-route href="/collections/all?sort_by=price-ascending">Sort by price</a>
       </nav>`,
    );

    const products = main.querySelector('.collection-quick-add-bulk');
    products.id = 'product-grid';
    products.className = 'grid product-grid grid--2-col-tablet-down grid--5-col-desktop collection-quick-add-bulk';
    const productDetails = [
      {
        title: 'Diamond Blade',
        media: `<img alt="Diamond Blade" width="400" height="400" style="display:block;max-width:100%;height:auto" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23ccd8cc'/%3E%3C/svg%3E">`,
        price: '$15.00',
      },
      {
        title: 'Saw Vice',
        media: '<div class="card--text" role="img" aria-label="No image available for Saw Vice">Saw Vice</div>',
        price: '$12.00',
      },
    ];
    [...products.children].forEach((item, index) => {
      const detail = productDetails[index];
      item.classList.add('grid__item', 'card__content');
      item.querySelector('quick-add-bulk').classList.add('quick-add-bulk');
      item.insertAdjacentHTML(
        'afterbegin',
        `<article class="card card--product">${detail.media}<h2>${detail.title}</h2><p>${detail.price}</p><p>Available</p></article>`,
      );
    });

    products.insertAdjacentHTML(
      'afterend',
      `<nav class="pagination-wrapper" aria-label="Pagination">
         <a data-fixture-route href="/collections/all?page=2">Next page</a>
       </nav>
       <section id="governed-directory" hidden>
         <h2>Product directory</h2>
         <nav aria-label="Product directory categories">
           <a data-fixture-route href="/collections/all?view=directory#g-replacement-parts">Replacement Parts</a>
           <a data-fixture-route href="/collections/all?view=directory#g-consumables">Consumables</a>
           <a data-fixture-route href="/collections/all?view=directory#g-accessories">Accessories</a>
         </nav>
         <section id="g-replacement-parts"><h3>Replacement Parts</h3><p>Governed role directory.</p></section>
         <section id="g-consumables"><h3>Consumables</h3><p>Governed role directory.</p></section>
         <section id="g-accessories"><h3>Accessories</h3><p>Governed role directory.</p></section>
       </section>`,
    );

    const pagination = main.querySelector('.pagination-wrapper');
    const directory = main.querySelector('#governed-directory');
    const heading = main.querySelector('h1');

    function renderRoute(href) {
      const url = new URL(href, location.origin);
      const directoryView = url.searchParams.get('view') === 'directory';
      document.body.dataset.catalogView = directoryView ? 'directory' : 'photographic';
      document.body.dataset.collectionPath = url.pathname;
      products.hidden = directoryView;
      products.classList.toggle('hidden', directoryView);
      pagination.hidden = directoryView;
      pagination.classList.toggle('hidden', directoryView);
      directory.hidden = !directoryView;
      directory.classList.toggle('hidden', !directoryView);
      heading.textContent = url.pathname === '/collections/machines' ? 'Machines' : 'Products';
      if (directoryView && url.hash) document.querySelector(url.hash)?.scrollIntoView();
    }

    document.addEventListener('click', (event) => {
      const link = event.target.closest('[data-fixture-route]');
      if (!link) return;
      event.preventDefault();
      history.pushState({}, '', link.href);
      renderRoute(link.href);
    });
    addEventListener('popstate', () => renderRoute(location.href));
    history.replaceState({}, '', '/collections/all');
    renderRoute(location.href);
  }, catalogChildren);

  return mounted;
}

module.exports = { mount, catalogChildren };
