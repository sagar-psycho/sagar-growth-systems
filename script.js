/* =========================================================
   Kothakula Sagar — Portfolio
   Data + rendering
========================================================= */

/* ---------- What I Do ---------- */
const whatIDo = [
  { icon:'bi-search', title:'SEO', desc:'Technical SEO, on-page SEO, content optimization and authority building.' },
  { icon:'bi-megaphone', title:'Paid Advertising', desc:'Meta Ads, Google Ads, audience targeting, funnels and lead generation.' },
  { icon:'bi-bar-chart-line', title:'Analytics', desc:'GA4, GSC, Looker Studio and data-driven insights for better marketing decisions.' },
  { icon:'bi-robot', title:'AI & Automation', desc:'AI-assisted content, automation workflows and productivity systems that support repeatable growth.' }
];

/* ---------- Approach workflow ---------- */
const workflow = [
  { icon:'bi-eye', title:'Understand', desc:'Deep dive into the problem and goals.' },
  { icon:'bi-clipboard-data', title:'Research', desc:'Market, audience & competitor research.' },
  { icon:'bi-diagram-3', title:'Strategy', desc:'Data-driven strategy and execution plan.' },
  { icon:'bi-rocket-takeoff', title:'Execute', desc:'Implement, test and optimize campaigns.' },
  { icon:'bi-graph-up-arrow', title:'Analyze', desc:'Measure results and derive insights.' }
];

/* ---------- Experience Journey ---------- */
const experienceJourney = [
  { month:'01', title:'Building the SEO Foundation',
    description:'Started by understanding the digital presence of ABRA Group businesses and implementing foundational SEO improvements.',
    focus:['Keyword Research','On-page SEO','Search Console','Technical SEO'],
    learning:'Search visibility starts with technical structure and relevant content.' },
  { month:'02', title:'Expanding Into Social & Meta Advertising',
    description:'Expanded into social media management and Meta advertising activities across ABRA Group entities.',
    focus:['Meta Ads','Social Media','Lead Generation','Campaign Creatives'],
    learning:'Paid media needs clear targeting, relevant creative and consistent follow-up.' },
  { month:'03', title:'Paid Search & Lead Generation',
    description:'Worked on Google Ads and lead-generation workflows focused on connecting search intent with business enquiries.',
    focus:['Google Ads','Keyword Planning','Search Campaigns','Lead Capture'],
    learning:'User intent and message relevance strongly influence lead quality.' },
  { month:'04', title:'App & E-commerce Growth',
    description:'Focused on app promotion and e-commerce visibility activities, especially for ABRA Zylo.',
    focus:['App Promotion','E-commerce','Catalog Ads','Product Visibility'],
    learning:'Digital growth requires connecting product visibility, advertising and user experience.' },
  { month:'05', title:'SEO Meets Product Development',
    description:'Started exploring how repetitive SEO activities could be converted into scalable marketing tools.',
    focus:['SEO Automation','AI','Product SEO','Web Development'],
    learning:'Repeated marketing problems can sometimes be solved by building reusable tools.' },
  { month:'06', title:'From Marketing Tasks to Automation',
    description:'Explored CRM and automation workflows to connect marketing-generated leads with business operations.',
    focus:['Automation','CRM','Lead Workflows','AI'],
    learning:'Marketing becomes more scalable when campaigns, leads and follow-up systems are connected.' }
];

/* ---------- Featured Projects ---------- */
const projects = [
  { id:'abra-crm', title:'ABRA Logistics CRM', category:'CRM',
    problem:'Lead generation campaigns produced enquiries but lacked structured tracking and follow-up.',
    solution:'A lead management system connecting marketing leads to sales workflows with assignment and status tracking.',
    technologies:['HTML','CSS','JavaScript','Firebase'],
    screenshot:'assets/images/projects/abra-logistic.png', icon:'bi-diagram-3' },
  { id:'abra-zylo', title:'ABRA Zylo AI SEO Generator', category:'AI · SEO',
    problem:'E-commerce sites need scalable SEO metadata and content for many products.',
    solution:'AI-assisted workflow to generate SEO titles, meta descriptions, product content and alt text for review.',
    technologies:['HTML','CSS','JavaScript','Groq AI'],
    screenshot:'assets/images/projects/abra-zylo-seo-portal.png', icon:'bi-stars' },
  { id:'design-build-crm', title:'ABRA Design & Build CRM', category:'CRM',
    problem:'Construction enquiries arrive from many channels and needed organized follow-up.',
    solution:'A lead capture and status dashboard to route enquiries to the right teams.',
    technologies:['HTML','CSS','JavaScript','Firebase'],
    screenshot:'assets/images/projects/abra-design-build.png', icon:'bi-building' }
];

/* ---------- Marketing Work ---------- */
const marketingWork = [
  { id:'seo', number:'01', category:'ORGANIC', title:'SEO & Technical SEO',
    shortDescription:'Search visibility, technical optimization and organic growth.',
    introduction:'Worked across ABRA Group websites to improve crawling, indexing, metadata and on-page relevance to grow organic visibility.',
    image:'assets/projects/seo-technical-seo.png', icon:'bi-search',
    activities:[{title:'Technical SEO',description:'Site structure, crawlability and performance improvements.'},
      {title:'Indexing & Sitemaps',description:'Used Search Console to diagnose indexing issues and manage sitemaps.'},
      {title:'On-Page SEO',description:'Metadata, headings, structured content and alt attributes.'},
      {title:'Search Performance',description:'Monitored organic visibility with GA4 and Search Console.'}],
    tools:['Google Search Console','GA4','SEMrush','Ahrefs'],
    learning:'Search visibility depends on technical structure, indexing, content relevance and continuous performance monitoring.' },
  { id:'meta', number:'02', category:'PAID SOCIAL', title:'Meta Advertising',
    shortDescription:'Lead generation, catalog and app-promotion campaigns.',
    introduction:'Planned and executed Meta campaigns including audience strategy, catalog feeds and creative testing for lead and app campaigns.',
    image:'assets/projects/meta-advertising.png', icon:'bi-facebook',
    activities:[{title:'Lead Ads',description:'Optimized lead-gen funnels and form capture strategies.'},
      {title:'Catalog Ads',description:'Managed product feeds and dynamic creative for catalog campaigns.'},
      {title:'Audience Targeting',description:'Built and refined lookalike and retargeting audiences.'}],
    tools:['Meta Ads Manager'],
    learning:'Creative tests and audience segmentation drive efficient lead generation on social platforms.' },
  { id:'google-ads', number:'03', category:'PAID SEARCH', title:'Google Ads',
    shortDescription:'Search campaigns, keyword intent and lead generation.',
    introduction:'Managed search and traffic campaigns focused on connecting high-intent queries to relevant offers and lead capture.',
    image:'assets/projects/google-ads.png', icon:'bi-google',
    activities:[{title:'Search Campaigns',description:'Keyword planning and intent mapping.'},
      {title:'Traffic & Leads',description:'Optimized bidding, landing pages and conversion tracking.'}],
    tools:['Google Ads'],
    learning:'Matching intent with landing experience increases lead quality and campaign efficiency.' },
  { id:'ecommerce', number:'04', category:'E-COMMERCE', title:'ABRA Zylo Growth',
    shortDescription:'Product visibility, catalog campaigns and e-commerce growth.',
    introduction:'Supported e-commerce growth via product SEO, catalog advertising and promotional creatives to improve discovery and sales.',
    image:'assets/projects/abra-zylo-growth.png', icon:'bi-cart3',
    activities:[{title:'Product SEO',description:'Optimised product pages and metadata.'},
      {title:'Catalog Campaigns',description:'Managed feeds and catalog-based creative.'}],
    tools:['Meta Ads','OpenCart','Google Search Console'],
    learning:'Catalog health, product information and creative combine to influence e-commerce performance.' },
  { id:'creative', number:'05', category:'CREATIVE', title:'Content & Campaign Creatives',
    shortDescription:'Campaign content, promotional creatives and advertising assets.',
    introduction:'Created campaign creatives and social assets using a mix of design tools and AI-assisted workflows to scale production.',
    image:'assets/projects/content-campaign-creatives.png', icon:'bi-brush',
    activities:[{title:'Ad Creatives',description:'Concepts, formats and design for paid placements.'},
      {title:'Social Content',description:'Short-form content and story-led creatives for engagement.'}],
    tools:['Canva','AI Image Tools','AI Video Tools'],
    learning:'A clear creative brief and fast iteration improve campaign performance and production velocity.' },
  { id:'analytics', number:'06', category:'DATA', title:'Analytics & Reporting',
    shortDescription:'Marketing performance, traffic and search insights.',
    introduction:'Used GA4, Search Console and campaign data to identify issues, measure outcomes and inform optimisation decisions.',
    image:'assets/projects/analytics-reporting.png', icon:'bi-graph-up',
    activities:[{title:'Campaign Reporting',description:'Regular reporting and insight generation.'},
      {title:'Traffic Analysis',description:'Understanding sources and behaviour to improve funnels.'}],
    tools:['GA4','Search Console'],
    learning:'Reliable data, consistent tagging and iterative reviews are essential for continuous improvement.' }
];

/* ---------- Principles ---------- */
const principles = [
  { icon:'bi-clipboard-data', title:'Data First', desc:'Every decision is backed by data and insights.' },
  { icon:'bi-lightning-charge', title:'Test & Learn', desc:'Small tests, learn fast and scale what works.' },
  { icon:'bi-diagram-3', title:'Systems Thinking', desc:'Build repeatable systems, not one-off campaigns.' },
  { icon:'bi-gear', title:'Automation', desc:'Automate repetitive tasks to focus on strategy.' },
  { icon:'bi-bullseye', title:'Impact Driven', desc:'Focus on metrics that truly move the business.' }
];

/* ---------- Tools ---------- */
const tools = [
  { icon:'bi-bar-chart', label:'Google Analytics' },
  { icon:'bi-search', label:'Google Search Console' },
  { icon:'bi-google', label:'Google Ads' },
  { icon:'bi-facebook', label:'Meta Ads Manager' },
  { icon:'bi-easel', label:'Looker Studio' },
  { icon:'bi-graph-up', label:'GA4' },
  { icon:'bi-wordpress', label:'WordPress' },
  { icon:'bi-shop', label:'Shopify' },
  { icon:'bi-code-slash', label:'HTML5 / CSS3 / JS' },
  { icon:'bi-fire', label:'Firebase' },
  { icon:'bi-vector-pen', label:'Figma' },
  { icon:'bi-stars', label:'AI Tools' },
  { icon:'bi-journal-text', label:'Notion' }
];

/* ---------- Certifications ---------- */
const certifications = [
  { icon:'bi-google', name:'Google Ads', issuer:'Search Certification' },
  { icon:'bi-bar-chart-fill', name:'Google Analytics', issuer:'Individual Qualification' },
  { icon:'bi-facebook', name:'Meta', issuer:'Blueprint Certified Media Buying' },
  { icon:'bi-hexagon', name:'HubSpot', issuer:'Inbound Marketing Certification' },
  { icon:'bi-google', name:'Google', issuer:'Digital Garage Fundamentals' }
];

/* =========================================================
   Helpers
========================================================= */
function escapeHtml(v){
  return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function mediaFallback(icon){
  return `<div class="media-fallback"><i class="bi ${icon}"></i></div>`;
}
function imgWithFallback(src, alt, icon){
  return `<img src="${src}" alt="${escapeHtml(alt)}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'media-fallback',innerHTML:'<i class=\\'bi ${icon}\\'></i>'}))">`;
}
function shouldRender(el){
  return el && !el.hasChildNodes();
}
function attachWorkCardListeners(el){
  if(!el) return;
  el.querySelectorAll('.work-card').forEach(card => {
    if(card.dataset.workAttached === 'true') return;
    const index = Number(card.dataset.index);
    if(Number.isFinite(index)){
      card.addEventListener('click', () => openWorkModal(index));
      card.dataset.workAttached = 'true';
    }
  });
}

/* =========================================================
   Renderers
========================================================= */
function renderWhatIDo(){
  const el = document.getElementById('whatIDoGrid');
  if(!shouldRender(el)) return;
  el.innerHTML = whatIDo.map(item => `
    <div class="feature-card reveal-up">
      <div class="feature-icon"><i class="bi ${item.icon}"></i></div>
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
    </div>
  `).join('');
}

function renderWorkflow(){
  const el = document.getElementById('workflowDiagram');
  if(!shouldRender(el)) return;
  const steps = workflow.map((s,i) => `
    <div class="workflow-step">
      <div class="wf-icon"><i class="bi ${s.icon}"></i></div>
      <div class="wf-title">${String(i+1).padStart(2,'0')} ${s.title}</div>
      <div class="wf-desc">${s.desc}</div>
    </div>
    ${i < workflow.length-1 ? '<span class="workflow-arrow"><i class="bi bi-arrow-right"></i></span>' : ''}
  `).join('');
  el.innerHTML = `
    <div class="workflow-row">${steps}</div>
    <div class="workflow-scale">
      <div class="wf-title">AUTOMATE &amp; SCALE</div>
      <div class="wf-desc">Build systems that generate consistent growth.</div>
    </div>
  `;
}

function renderTimeline(){
  const el = document.getElementById('timelineTrack');
  if(!shouldRender(el)) return;
  el.innerHTML = experienceJourney.map(item => `
    <div class="timeline-item reveal-up">
      <div class="timeline-num">${item.month}</div>
      <div class="timeline-card">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description)}</p>
        <div class="timeline-focus">${item.focus.map(f=>`<span>${escapeHtml(f)}</span>`).join('')}</div>
        <div class="timeline-learning"><b>What I learned:</b> ${escapeHtml(item.learning)}</div>
      </div>
    </div>
  `).join('');
}

function renderProjects(){
  const el = document.getElementById('projectsGrid');
  if(!shouldRender(el)) return;
  el.innerHTML = projects.map(p => `
    <div class="proj-card reveal-up">
      <div class="proj-media">
        <span class="proj-tag">${p.category}</span>
        ${imgWithFallback(p.screenshot, p.title, p.icon)}
      </div>
      <div class="proj-body">
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.problem)}</p>
        <div class="tag-row">${p.technologies.map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div>
        <a class="card-link" href="#${p.id}">View Case Study <i class="bi bi-arrow-right"></i></a>
      </div>
    </div>
  `).join('');
}

function renderMarketingGrid(){
  const el = document.getElementById('marketingGrid');
  if(!el) return;
  if(!shouldRender(el)){
    attachWorkCardListeners(el);
    return;
  }
  el.innerHTML = marketingWork.map((item, idx) => `
    <div class="work-card reveal-up" data-index="${idx}">
      <div class="work-media">
        ${imgWithFallback(item.image, item.title, item.icon)}
      </div>
      <div class="work-body">
        <div class="work-num-cat"><span class="num">${item.number}</span><span>${item.category}</span></div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.shortDescription)}</p>
        <span class="card-link">View Work <i class="bi bi-arrow-right"></i></span>
      </div>
    </div>
  `).join('');
  attachWorkCardListeners(el);
}

function renderPrinciples(){
  const el = document.getElementById('principlesGrid');
  if(!shouldRender(el)) return;
  el.innerHTML = principles.map(p => `
    <div class="principle-card reveal-up">
      <i class="bi ${p.icon}"></i>
      <h4>${p.title}</h4>
      <p>${p.desc}</p>
    </div>
  `).join('');
}

function renderTools(){
  const el = document.getElementById('toolRow');
  if(!shouldRender(el)) return;
  el.innerHTML = tools.map(t => `<span class="tool-chip"><i class="bi ${t.icon}"></i>${t.label}</span>`).join('');
}

function renderCertifications(){
  const el = document.getElementById('certRow');
  if(!shouldRender(el)) return;
  el.innerHTML = certifications.map(c => `
    <div class="cert-card reveal-up">
      <i class="bi ${c.icon}"></i>
      <h4>${escapeHtml(c.name)}</h4>
      <span>${escapeHtml(c.issuer)}</span>
    </div>
  `).join('');
}

/* =========================================================
   Work modal
========================================================= */
const backdrop = document.getElementById('workBackdrop');
const modal = document.getElementById('workModal');
const modalBody = document.getElementById('workModalBody');
const modalClose = document.getElementById('workModalClose');
const prevBtn = document.getElementById('workPrev');
const nextBtn = document.getElementById('workNext');
let currentIndex = 0;

function populateModal(item){
  modalBody.innerHTML = `
    <div class="wm-category">${item.number} · ${escapeHtml(item.category)}</div>
    <h2 id="workModalTitle">${escapeHtml(item.title)}</h2>
    <p class="wm-intro">${escapeHtml(item.introduction)}</p>
    <div class="wm-block">
      <h5>What I worked on</h5>
      <div class="wm-activities">${item.activities.map(a=>`<div><strong>${escapeHtml(a.title)}</strong><span>${escapeHtml(a.description)}</span></div>`).join('')}</div>
    </div>
    <div class="wm-block">
      <h5>Tools</h5>
      <div class="wm-tools">${item.tools.map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div>
    </div>
    <div class="wm-block">
      <h5>What I learned</h5>
      <div class="wm-learning">${escapeHtml(item.learning)}</div>
    </div>
  `;
}

function openWorkModal(index){
  currentIndex = index;
  populateModal(marketingWork[index]);
  backdrop.hidden = false;
  modal.classList.add('open');
  document.body.classList.add('modal-open');
  setTimeout(()=> modalBody.focus(), 60);
}
function closeWorkModal(){
  backdrop.hidden = true;
  modal.classList.remove('open');
  document.body.classList.remove('modal-open');
}
function navigateWork(delta){
  currentIndex = (currentIndex + delta + marketingWork.length) % marketingWork.length;
  populateModal(marketingWork[currentIndex]);
}

if(backdrop) backdrop.addEventListener('click', closeWorkModal);
if(modalClose) modalClose.addEventListener('click', closeWorkModal);
if(prevBtn) prevBtn.addEventListener('click', ()=>navigateWork(-1));
if(nextBtn) nextBtn.addEventListener('click', ()=>navigateWork(1));
document.addEventListener('keydown', (e) => {
  if(backdrop && !backdrop.hidden){
    if(e.key === 'Escape') closeWorkModal();
    if(e.key === 'ArrowRight') navigateWork(1);
    if(e.key === 'ArrowLeft') navigateWork(-1);
  }
});

/* =========================================================
   Mobile nav
========================================================= */
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
if(navToggle){
  navToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded','false');
  }));
}

/* =========================================================
   Reveal on scroll
========================================================= */
function initReveal(){
  const targets = document.querySelectorAll('.reveal-up');
  if(!('IntersectionObserver' in window)){
    targets.forEach(t => t.classList.add('in-view'));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold:0, rootMargin:'0px 0px -8% 0px' });
  targets.forEach(t => io.observe(t));

  // Safety net: never leave content permanently invisible
  setTimeout(() => {
    document.querySelectorAll('.reveal-up:not(.in-view)').forEach(t => t.classList.add('in-view'));
  }, 1800);
}

/* =========================================================
   Init
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  renderWhatIDo();
  renderWorkflow();
  renderTimeline();
  renderProjects();
  renderMarketingGrid();
  renderPrinciples();
  renderTools();
  renderCertifications();
  initReveal();

  const yearEl = document.getElementById('copyYear');
  if(yearEl) yearEl.textContent = new Date().getFullYear();
});