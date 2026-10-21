'use strict';
// Exact additive native Catalog children. Navigation only; no Product/fit authority.
const fs=require('node:fs'),assert=require('node:assert/strict'),E=require('./epic-e-owner-response-adapter'),R=require('./epic-g-catalog');
const FILES=['snippets/header-mega-menu.liquid','snippets/header-drawer.liquid'];
function original(path){assert(FILES.includes(path));const row=E.read(R.DIR+'/header-entry-preflight.json').data.theme.files.nodes.find(n=>n.filename===path);assert(row);assert.equal(E.hash(row.body.content),E.read(R.DIR+'/repository-before.json').files.find(r=>r.path===path).sha256);return row.body.content;}
function expected(path){const before=original(path),marker='{%- for childlink in link.links -%}';assert.equal(before.split(marker).length,2);const drawer=path.includes('drawer'),id=drawer?'HeaderDrawer-g-catalog-entry':'HeaderMenu-g-catalog-entry',classes=drawer?'menu-drawer__menu-item link link--text list-menu__item focus-inset':'mega-menu__link mega-menu__link--level-2 link';return before.replace(marker,`{%- assign g_catalog_existing = link.links | where: 'url', routes.all_products_collection_url -%}\n{%- if link.handle == 'catalog' and g_catalog_existing == empty -%}\n<li><a id="${id}" href="{{ routes.all_products_collection_url }}" class="${classes}" data-rhino-g-catalog-entry>Parts and supplies</a></li>\n{%- endif -%}\n${marker}`);}
function assertFile(path,text=fs.readFileSync(path,'utf8')){assert.equal(text,expected(path),'Only the exact Catalog child may extend the native menu');return true;}
function verify(){for(const path of FILES)assertFile(path);return FILES;}
module.exports={FILES,original,expected,assertFile,verify};
