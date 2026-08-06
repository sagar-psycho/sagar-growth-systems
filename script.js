/*
	script.js
	Organized per project guidelines

	Sections:
	1. DOM references
	2. Navigation behavior
*/
function renderMarketingGallery(container){
		if(!container) return;
		// compact cards per marketingWork data
		container.innerHTML = marketingWork.map((item, idx)=>{
			const cardImage = item.image;
			return `
				<article class="marketing-card marketing-card-small item-${item.id}" data-index="${idx}">
					<div class="marketing-preview marketing-card-image">
						<img src="${cardImage}" alt="${escapeHtml(item.title)} — Digital Marketing Work by Kothakula Sagar" loading="lazy" class="marketing-image" onerror="this.outerHTML=createMarketingPlaceholder()">
					</div>
					<div class="marketing-card-body">
						<div class="marketing-card-top">
							<span class="marketing-card-number">${item.number}</span>
							<span class="marketing-card-category">${item.category}</span>
						</div>
						<h3>${escapeHtml(item.title)}</h3>
						<p class="marketing-short text-muted">${escapeHtml(item.shortDescription)}</p>
						<div class="mt-2">
							<button class="neu-button view-work-btn" data-index="${idx}">View Work →</button>
						</div>
					</div>
				</article>
			`;
		}).join('');

		// attach click handlers for View Work buttons
		container.querySelectorAll('.view-work-btn').forEach(btn=>{
			btn.addEventListener('click', (e)=>{
				const i = Number(btn.getAttribute('data-index'));
				openWorkModal(i);
			});
		});
	}

	/* -----------------------------
		DOM references
		-----------------------------*/
	const featuredProjectsContainer = document.getElementById('featuredProjects');
	const contactForm = document.getElementById('contactForm');
	const landingProjectsContainer = document.getElementById('landingProjects');
	const marketingGalleryContainer = document.getElementById('marketingGallery');
	const experienceTimelineLandingContainer = document.getElementById('experienceTimelineLanding');

	/* -----------------------------
		Shared landing/project data
		-----------------------------*/
	const projects = [
		{
			id: 'abra-crm',
			title: 'ABRA Logistics CRM',
			category: 'CRM',
			problem: 'Lead generation campaigns produced enquiries but lacked structured tracking and follow-up.',
			solution: 'A lead management system connecting marketing leads to sales workflows with assignment and status tracking.',
			whatIBuilt: 'Lead capture, assignment, status tracking, follow-up management and reporting interfaces.',
			technologies: ['HTML','CSS','JavaScript','Firebase','APIs','AI Integrations'],
			screenshot: 'assets/images/projects/abra-logistic.png',
			liveUrl: '#',
			githubUrl: '#',
			businessValue: 'Reduced manual lead handling and improved follow-up consistency across sales teams.'
		},
		{
			id: 'abra-zylo',
			title: 'ABRA Zylo AI SEO Generator',
			category: 'AI',
			problem: 'E-commerce sites need scalable SEO metadata and content for many products.',
			solution: 'AI-assisted workflow to generate SEO titles, meta descriptions, product content and alt text for review.',
			whatIBuilt: 'An AI-assisted metadata generator and simple workflow to review and publish SEO content.',
			technologies: ['HTML','CSS','JavaScript','Groq AI','SEO'],
			screenshot: 'assets/images/projects/abra-zylo-seo-portal.png',
			liveUrl: '#',
			githubUrl: '#',
			businessValue: 'Enables faster SEO publishing while keeping human review in the loop.'
		},
		{
			id: 'design-build-crm',
			title: 'ABRA Design & Build CRM',
			category: 'CRM',
			problem: 'Construction enquiries arrive from many channels and needed organized follow-up.',
			solution: 'A lead capture and status dashboard to route enquiries to the right teams.',
			whatIBuilt: 'Lead capture, assignment UI, status management and campaign source tracking.',
			technologies: ['HTML','CSS','JavaScript','Firebase'],
			screenshot: 'assets/images/projects/abra-design-build.png',
			liveUrl: '#',
			githubUrl: '#',
			businessValue: 'Improves sales handoff and reduces lost enquiries.'
		}
	];

	const certifications = [];

	/* -----------------------------
		Modal behaviour: open, close, populate, navigation
		-----------------------------*/
	const backdrop = document.getElementById('workModalBackdrop');
	const modal = document.getElementById('workModal');
	const modalContent = document.getElementById('workModalContent');
	const modalClose = document.querySelector('.work-modal-close');
	const workPrev = document.getElementById('workPrev');
	const workNext = document.getElementById('workNext');
	const imageLightbox = document.getElementById('imageLightbox');
	const lightboxImg = document.getElementById('lightboxImage');

	let currentWorkIndex = 0;
	let lastFocusedElement = null;

	function openWorkModal(index){
	    if(!backdrop || !modal || !modalContent) return;
		currentWorkIndex = index;
		lastFocusedElement = document.activeElement;
		populateModal(marketingWork[index]);
		// show backdrop + modal
		backdrop.hidden = false;
		backdrop.setAttribute('open','');
		backdrop.setAttribute('aria-hidden','false');
		modal.classList.add('open');
		document.body.classList.add('modal-open');
		// focus trap — move focus to modalContent
		setTimeout(()=>{ modalContent.focus(); }, 80);
		// prevent page scroll handled via body.modal-open
	}

	function closeWorkModal(){
	    if(!backdrop || !modal) return;
		backdrop.hidden = true;
		backdrop.removeAttribute('open');
		backdrop.setAttribute('aria-hidden','true');
		modal.classList.remove('open');
		document.body.classList.remove('modal-open');
		if(lastFocusedElement) lastFocusedElement.focus();
	}

	function populateModal(data){
		if(!data || !modalContent){ console.warn('Modal data or container missing.'); return; }
		// build HTML using the data-driven structure
		const activitiesHtml = data.activities.map(a=>`<div class="work-activity"><h5>${escapeHtml(a.title)}</h5><p class="text-muted small">${escapeHtml(a.description)}</p></div>`).join('');
		const galleryHtml = (data.gallery && data.gallery.length) ? data.gallery.map(src=>`<img src="${src}" alt="${escapeHtml(data.title)} screenshot" loading="lazy" onerror="this.outerHTML=createMarketingPlaceholder()" class="work-gallery-item">`).join('') : '<div class="preview-surface"><strong>No images</strong><span>Images will appear here.</span></div>';
		modalContent.innerHTML = `
			<div class="work-meta">
				<div>
					<div class="work-number">${escapeHtml(data.number)}</div>
					<div class="work-category">${escapeHtml(data.category)}</div>
				</div>
				<div class="text-muted">${escapeHtml(data.title)}</div>
			</div>
			<h2 id="workModalTitle">${escapeHtml(data.title)}</h2>
			<div class="work-intro">${escapeHtml(data.introduction)}</div>
			<div class="work-section">
				<div class="work-modal-image work-featured">
					<img src="${data.image}" alt="${escapeHtml(data.title)} — Featured marketing work image" loading="lazy" onerror="this.outerHTML=createMarketingPlaceholder()">
				</div>
			</div>
			<div class="work-section">
				<h4>What I worked on</h4>
				<div class="work-activities">${activitiesHtml}</div>
			</div>
			<div class="work-section">
				<h4>Tools</h4>
				<div class="work-tools">${escapeHtml(data.tools.join(' · '))}</div>
			</div>
			<div class="work-section">
				<h4>Selected work / Proof</h4>
				<div class="work-gallery">${galleryHtml}</div>
			</div>
			<div class="work-section">
				<h4>What I learned</h4>
				<div class="work-learning">${escapeHtml(data.learning)}</div>
			</div>
		`;

		// attach gallery image click handlers for lightbox
		modalContent.querySelectorAll('.work-gallery .work-gallery-item').forEach(img=>{
			img.addEventListener('click', ()=>openLightbox(img.src, img.alt));
		});
	}

	// Backdrop click closes modal when clicking outside
	if(backdrop){
		backdrop.addEventListener('click', (e)=>{
			if(e.target === backdrop) closeWorkModal();
		});
	}
	if(modalClose){ modalClose.addEventListener('click', closeWorkModal); }

	// Keyboard: ESC to close, arrow nav
	document.addEventListener('keydown', (e)=>{
		if(backdrop && !backdrop.hidden){
			if(e.key === 'Escape'){
				// close lightbox first
				if(!imageLightbox.hidden) closeLightbox(); else closeWorkModal();
			}
			if(e.key === 'ArrowRight') {
				navigateWork(1);
			}
			if(e.key === 'ArrowLeft') {
				navigateWork(-1);
			}
		}
	});

	if(workPrev) workPrev.addEventListener('click', ()=>navigateWork(-1));
	if(workNext) workNext.addEventListener('click', ()=>navigateWork(1));

	function navigateWork(delta){
		const next = (currentWorkIndex + delta + marketingWork.length) % marketingWork.length;
		currentWorkIndex = next;
		populateModal(marketingWork[next]);
	}

	/* -----------------------------
		 Lightbox functionality
		 -----------------------------*/
	function openLightbox(src, alt){
		lightboxImg.src = src;
		lightboxImg.alt = alt || '';
		imageLightbox.hidden = false;
		imageLightbox.setAttribute('open','');
		imageLightbox.setAttribute('aria-hidden','false');
	}

	function closeLightbox(){
		imageLightbox.hidden = true;
		imageLightbox.removeAttribute('open');
		imageLightbox.setAttribute('aria-hidden','true');
		lightboxImg.src = '';
	}

	const imageLightboxCloseBtn = document.querySelector('.image-lightbox-close');
	if(imageLightboxCloseBtn) imageLightboxCloseBtn.addEventListener('click', closeLightbox);
	if(imageLightbox) imageLightbox.addEventListener('click', (e)=>{ if(e.target===imageLightbox) closeLightbox(); });

	/* Focus trap (simple): keep focus within modal while open */
	document.addEventListener('focusin', (e)=>{
		if(!backdrop || backdrop.hidden) return;
		if(!modal.contains(e.target)){
			e.stopPropagation();
			modalContent.focus();
		}

	});

	/* Single source of marketing work data */
	const marketingWork = [
		{
			id: 'seo',
			number: '01',
			category: 'ORGANIC',
			title: 'SEO & Technical SEO',
			shortDescription: 'Search visibility, technical optimization and organic growth.',
			introduction: 'Worked across ABRA Group websites to improve crawling, indexing, metadata and on-page relevance to grow organic visibility.',
			image: 'assets/projects/SEO & Technical SEO.png',
			activities: [
				{title: 'Technical SEO', description: 'Worked on site structure, crawlability and performance improvements.'},
				{title: 'Indexing & Sitemaps', description: 'Used Search Console to diagnose indexing issues and manage sitemaps.'},
				{title: 'On-Page SEO', description: 'Metadata, headings, structured content and alt attributes.'},
				{title: 'Search Performance', description: 'Monitored organic visibility with GA4 and Search Console.'}
			],
			tools: ['Google Search Console','GA4','Rank Math','SEMrush','Ahrefs'],
			gallery: ['assets/images/marketing/seo-01.webp','assets/images/marketing/seo-02.webp','assets/images/marketing/seo-03.webp'],
			learning: 'Search visibility depends on technical structure, indexing, content relevance and continuous performance monitoring.'
		},
		{
			id: 'meta',
			number: '02',
			category: 'PAID SOCIAL',
			title: 'Meta Advertising',
			shortDescription: 'Lead generation, catalog and app-promotion campaigns.',
			introduction: 'Planned and executed Meta campaigns including audience strategy, catalog feeds and creative testing for lead and app campaigns.',
			image: 'assets/projects/Meta Advertising.png',
			activities: [
				{title: 'Lead Ads', description: 'Optimized lead-gen funnels and form capture strategies.'},
				{title: 'Catalog Ads', description: 'Managed product feeds and dynamic creative for catalog campaigns.'},
				{title: 'Audience Targeting', description: 'Built and refined lookalike and retargeting audiences.'}
			],
			tools: ['Meta Ads Manager'],
			gallery: ['assets/images/marketing/meta-01.webp','assets/images/marketing/meta-02.webp'],
			learning: 'Creative tests and audience segmentation drive efficient lead generation on social platforms.'
		},
		{
			id: 'google-ads',
			number: '03',
			category: 'PAID SEARCH',
			title: 'Google Ads',
			shortDescription: 'Search campaigns, keyword intent and lead generation.',
			introduction: 'Managed search and traffic campaigns focused on connecting high-intent queries to relevant offers and lead capture.',
			image: 'assets/projects/Google Ads.png',
			activities: [
				{title: 'Search Campaigns', description: 'Keyword planning and intent mapping.'},
				{title: 'Traffic & Leads', description: 'Optimized bidding, landing pages and conversion tracking.'}
			],
			tools: ['Google Ads'],
			gallery: ['assets/images/marketing/google-ads-01.webp','assets/images/marketing/google-ads-02.webp'],
			learning: 'Matching intent with landing experience increases lead quality and campaign efficiency.'
		},
		{
			id: 'ecommerce',
			number: '04',
			category: 'E-COMMERCE',
			title: 'ABRA Zylo Growth',
			shortDescription: 'Product visibility, catalog campaigns and e-commerce growth.',
			introduction: 'Supported e-commerce growth via product SEO, catalog advertising and promotional creatives to improve discovery and sales.',
			image: 'assets/projects/ABRA Zylo Growth.png',
			activities: [
				{title: 'Product SEO', description: 'Optimised product pages and metadata.'},
				{title: 'Catalog Campaigns', description: 'Managed feeds and catalog-based creative.'}
			],
			tools: ['Meta Ads','OpenCart','Google Search Console'],
			gallery: ['assets/images/marketing/ecommerce-01.webp','assets/images/marketing/ecommerce-02.webp'],
			learning: 'Catalog health, product information and creative combine to influence e-commerce performance.'
		},


		{
			id: 'creative',
			number: '05',
			category: 'CREATIVE',
			title: 'Content & Campaign Creatives',
			shortDescription: 'Campaign content, promotional creatives and advertising assets.',
			introduction: 'Created campaign creatives and social assets using a mix of design tools and AI-assisted workflows to scale production.',
			image: 'assets/projects/Content & Campaign Creatives.png',
			activities: [
				{title: 'Ad Creatives', description: 'Concepts, formats and design for paid placements.'},
				{title: 'Social Content', description: 'Short-form content and story-led creatives for engagement.'}
			],
			tools: ['Canva','AI Image Tools','AI Video Tools'],
			gallery: ['assets/images/marketing/creative-01.webp','assets/images/marketing/creative-02.webp','assets/images/marketing/creative-03.webp','assets/images/marketing/creative-04.webp'],
			learning: 'A clear creative brief and fast iteration improve campaign performance and production velocity.'
		},
		{
			id: 'analytics',
			number: '06',
			category: 'DATA',
			title: 'Analytics & Reporting',
			shortDescription: 'Marketing performance, traffic and search insights.',
			introduction: 'Used GA4, Search Console and campaign data to identify issues, measure outcomes and inform optimisation decisions.',
			image: 'assets/projects/Analytics & Reporting.png',
			activities: [
				{title: 'Campaign Reporting', description: 'Regular reporting and insight generation.'},
				{title: 'Traffic Analysis', description: 'Understanding sources and behaviour to improve funnels.'}
			],
			tools: ['GA4','Search Console'],
			gallery: ['assets/images/marketing/analytics-01.webp'],
			learning: 'Reliable data, consistent tagging and iterative reviews are essential for continuous improvement.'
		}
	];

/* -----------------------------
	Experience journey (6-month marketing journey)
	Single source of truth used by landing and portfolio renderers
-----------------------------*/
const experienceJourney = [
	{
		month: "01",
		title: "Building the SEO Foundation",
		description:
			"Started by understanding the digital presence of ABRA Group businesses and implementing foundational SEO improvements.",
		focus: [
			"Keyword Research",
			"On-page SEO",
			"Search Console",
			"Technical SEO"
		],
		learning:
			"Search visibility starts with technical structure and relevant content."
	},

	{
		month: "02",
		title: "Expanding Into Social & Meta Advertising",
		description:
			"Expanded into social media management and Meta advertising activities across ABRA Group entities.",
		focus: [
			"Meta Ads",
			"Social Media",
			"Lead Generation",
			"Campaign Creatives"
		],
		learning:
			"Paid media needs clear targeting, relevant creative and consistent follow-up."
	},

	{
		month: "03",
		title: "Paid Search & Lead Generation",
		description:
			"Worked on Google Ads and lead-generation workflows focused on connecting search intent with business enquiries.",
		focus: [
			"Google Ads",
			"Keyword Planning",
			"Search Campaigns",
			"Lead Capture"
		],
		learning:
			"User intent and message relevance strongly influence lead quality."
	},

	{
		month: "04",
		title: "App & E-commerce Growth",
		description:
			"Focused on app promotion and e-commerce visibility activities, especially for ABRA Zylo.",
		focus: [
			"App Promotion",
			"E-commerce",
			"Catalog Ads",
			"Product Visibility"
		],
		learning:
			"Digital growth requires connecting product visibility, advertising and user experience."
	},

	{
		month: "05",
		title: "SEO Meets Product Development",
		description:
			"Started exploring how repetitive SEO activities could be converted into scalable marketing tools.",
		focus: [
			"SEO Automation",
			"AI",
			"Product SEO",
			"Web Development"
		],
		learning:
			"Repeated marketing problems can sometimes be solved by building reusable tools."
	},

	{
		month: "06",
		title: "From Marketing Tasks to Automation",
		description:
			"Explored CRM and automation workflows to connect marketing-generated leads with business operations.",
		focus: [
			"Automation",
			"CRM",
			"Lead Workflows",
			"AI"
		],
		learning:
			"Marketing becomes more scalable when campaigns, leads and follow-up systems are connected."
	}
];

/* -----------------------------
	 Rendering helpers
	 -----------------------------*/
function renderFeaturedProjects(){
	if(!featuredProjectsContainer) return;
	if(!Array.isArray(projects) || projects.length===0){
		console.warn('Featured projects data is unavailable.');
		featuredProjectsContainer.innerHTML = '';
		return;
	}
	const featured = projects.slice(0,3);
	featuredProjectsContainer.innerHTML = featured.map(p=>`
		<div class="col-md-6 col-lg-4">
			<div class="project-card">
				<img src="${p.screenshot}" alt="${p.title}" loading="lazy" class="img-fluid mb-3">
				<div class="text-muted small mb-1">${p.category} · ${p.technologies.join(', ')}</div>
				<h5>${p.title}</h5>
				<p class="text-muted">${p.problem}</p>
				<a href="/portfolio/index.html#${p.id}" class="neu-button mt-2">Explore →</a>
			</div>
		</div>
	`).join('');
}

function renderPortfolioExperience(container){
	if(!container) return;
	if(!Array.isArray(experienceJourney) || experienceJourney.length===0){
		console.warn('Experience journey data is unavailable.');
		container.innerHTML = '<p class="eyebrow text-muted">EXPERIENCE</p><div class="text-muted">No experience data available.</div>';
		return;
	}
	const items = experienceJourney.map((e,i)=>{
		const focus = e.focus && e.focus.length ? `<ul class="focus-list">${e.focus.map(f=>`<li>${f}</li>`).join('')}</ul>` : '';
		const learning = e.learning ? `<div class="mt-2"><strong>Learning:</strong> <span class="text-muted">${e.learning}</span></div>` : '';
		let branches = '';
		if(e.month==='05') branches = `<div class="timeline-branch">Related: <a href="/portfolio/index.html#abra-zylo">ABRA Zylo AI SEO Generator →</a></div>`;
		if(e.month==='06') branches = `<div class="timeline-branch">Related: <a href="/portfolio/index.html#abra-crm">ABRA Logistics CRM →</a> · <a href="/portfolio/index.html#design-build-crm">ABRA Design & Build CRM →</a></div>`;
		return `
		<div class="timeline-item" data-index="${i}">
			<div class="neu-card p-3" data-index="${e.month}">
				<div style="min-width:64px;font-weight:800;font-size:1.4rem;color:var(--accent)">${e.month}</div>
				<div>
					<h5>${e.title}</h5>
					<p class="text-muted small">${e.description}</p>
					${focus}
					${learning}
					${branches}
				</div>
			</div>
		</div>`;
	}).join('');

	container.innerHTML = `
		<p class="eyebrow text-muted">EXPERIENCE</p>
		<h2>6 MONTHS. FROM MARKETING EXECUTION TO AUTOMATION.</h2>
		<div class="timeline-rail mt-4">
			<div class="timeline-track"></div>
			<div class="timeline-items mt-3">${items}</div>
		</div>
	`;
	// animate timeline track and items
	const track = container.querySelector('.timeline-track');
	const itemsEls = container.querySelectorAll('.timeline-item');
	const io = new IntersectionObserver((entries, obs)=>{
		entries.forEach(en=>{
			if(en.isIntersecting){
				track.style.transform='scaleY(1)';
				itemsEls.forEach((it,idx)=>setTimeout(()=>it.querySelector('.neu-card').classList.add('reveal-up','in-view'), idx*160));
				obs.disconnect();
			}
		});
	}, {threshold:0.2});
	io.observe(container);
}

function renderExpertise(container){
  if(!container) return;
  // replicate landing bento on portfolio for consistency
  container.innerHTML = document.querySelector('.bento-grid') ? document.querySelector('.bento-grid').outerHTML : '';
}

function escapeHtml(value){
  return String(value)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function createFallbackPreview(label){
  return `
    <div class="preview-surface">
      <div class="browser-bar">
        <span class="browser-dot"></span><span class="browser-dot"></span><span class="browser-dot"></span>
        <span class="browser-title">${escapeHtml(label)}</span>
      </div>
      <strong>PROJECT UI PREVIEW</strong>
      <span>Screenshot will be added here.</span>
    </div>`;
}

function renderExperienceTimelineLanding(container){
	if(!container) return;
	if(!Array.isArray(experienceJourney) || experienceJourney.length===0){
		console.warn('Experience journey data is unavailable for landing.');
		container.innerHTML = '';
		return;
	}
	container.innerHTML = experienceJourney.map((item,index)=>`
		<article class="journey-entry reveal-up" data-index="${index}">
			<div class="journey-month">${item.month}</div>
			<div class="journey-content">
				<h3>${escapeHtml(item.title)}</h3>
				<p>${escapeHtml(item.description)}</p>
				<div class="journey-focus">${item.focus.map(f=>`<span>${escapeHtml(f)}</span>`).join('')}</div>
				<div class="journey-learning">What I learned: ${escapeHtml(item.learning)}</div>
				${item.month === '05' ? '<div class="journey-branch">Related: <a href="/portfolio/index.html#abra-zylo">ABRA Zylo AI SEO Generator →</a></div>' : ''}
				${item.month === '06' ? '<div class="journey-branch">Related: <a href="/portfolio/index.html#abra-crm">ABRA Logistics CRM →</a> · <a href="/portfolio/index.html#design-build-crm">ABRA Design & Build CRM →</a></div>' : ''}
			</div>
		</article>
	`).join('');
}

function renderLandingProjects(container){
	if(!container) return;
	if(!Array.isArray(projects) || projects.length===0){
		console.warn('Landing projects data is unavailable.');
		container.innerHTML = '';
		return;
	}
	container.innerHTML = projects.map((project,index)=>`
		<article class="project-showcase ${index % 2 === 1 ? 'reverse' : ''}">
			<div class="project-copy">
				<p class="project-kicker">PROJECT / ${String(index + 1).padStart(2, '0')}</p>
				<p class="project-kicker">${escapeHtml(project.category.toUpperCase())}</p>
				<h3>${escapeHtml(project.title)}</h3>
				<p>${escapeHtml(project.problem)}</p>
				<h4>The Solution</h4>
				<p>${escapeHtml(project.solution)}</p>
				<h4>Why I Built It</h4>
				<p>${escapeHtml(project.whatIBuilt)}</p>
				<div class="project-meta">${project.technologies.map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div>
				<a class="project-link" href="/portfolio/index.html#${project.id}">Explore Case Study ↗</a>
			</div>
			<div class="project-media">
				<div class="device-frame">
					<div class="browser-bar">
						<span class="browser-dot"></span><span class="browser-dot"></span><span class="browser-dot"></span>
						<span class="browser-title">${escapeHtml(project.title)}</span>
					</div>
					<img src="${project.screenshot}" alt="${escapeHtml(project.title)}" loading="lazy" class="project-image" onerror="this.outerHTML=createFallbackPreview('${escapeHtml(project.title).replace(/'/g,'\\\'')}')">
				</div>
			</div>
		</article>
	`).join('');
}



function resolveAssetPath(src){
  const prefix = window.location.pathname.includes('/portfolio/') ? '../' : '';
  return `${prefix}${src}`;
}

function renderMarketingWork(container){
  if(!container) return;
  container.innerHTML = `<p class="eyebrow text-muted">SELECTED MARKETING WORK</p><h2>Marketing in Practice</h2><div class="marketing-grid mt-3">` + marketingWork.map(item=>`
    <div class="marketing-card">
      <div class="img-wrap">${createImgTag(resolveAssetPath(item.image), item.title)}</div>
      <h6>${escapeHtml(item.title)}</h6>
      <p class="text-muted small">Objective, approach and tools used. Click to expand.</p>
    </div>
  `).join('') + '</div>';
}

function renderHowIThink(container){
  if(!container) return;
  const steps = ['UNDERSTAND','RESEARCH','BUILD','MEASURE','OPTIMIZE','AUTOMATE'];
  container.innerHTML = `<p class="eyebrow text-muted">NOT JUST TOOLS.</p><h2>A WAY OF THINKING</h2><div class="how-i-think mt-3">` + steps.map((s,i)=>`<div class="how-step"><div class="h4">0${i+1}</div><div class="fw-bold mt-2">${s}</div><div class="text-muted small mt-2">${describeStep(s)}</div></div>`).join('') + '</div>';
}

function describeStep(step){
  const map = {
    'UNDERSTAND':'Define business problem and goals.',
    'RESEARCH':'Audience, competitors and search intent.',
    'BUILD':'Campaigns, content and workflows.',
    'MEASURE':'Data, KPIs and lead quality.',
    'OPTIMIZE':'A/B tests and iterative improvements.',
    'AUTOMATE':'Use AI and automation to reduce repetitive work.'
  };
  return map[step] || '';
}

function renderToolStack(container){
  if(!container) return;
  const groups = {
    'SEARCH':['Google Search Console','Google Analytics','SEMrush','Ahrefs','Rank Math'],
    'PAID MEDIA':['Meta Ads Manager','Google Ads'],
    'CREATIVE':['Canva','AI Image Tools','AI Video Tools'],
    'WEB':['WordPress','Elementor','HTML','CSS','JavaScript'],
    'TECH':['Firebase','Groq AI','APIs','OpenCart']
  };
  container.innerHTML = `<p class="eyebrow text-muted">THE STACK BEHIND THE WORK</p><h2>Tools & Platforms</h2><div class="mt-3">` + Object.keys(groups).map(k=>`<div class="mb-3"><div class="fw-semibold mb-2">${k}</div>` + groups[k].map(t=>`<span class="tool-chip">${t}</span>`).join('') + '</div>').join('') + '</div>';
}

function createImgTag(path, title){
  const fallback = path.endsWith('.webp') ? path.replace(/\.webp$/i, '.svg') : '';
  return `<img src="${path}" alt="${title}" data-fallback="${fallback}" onerror="if(this.dataset.fallback){this.src=this.dataset.fallback;this.dataset.fallback='';}else{this.outerHTML=createPlaceholder('${title}','${path}')}}">`;
}

function createPlaceholder(title, path){
  return `<div class=\"img-placeholder\"><div>${title}<br><small>${path}</small></div></div>`;
}
function createMarketingPlaceholder(){
  return `
    <div class="marketing-placeholder">
      <i class="bi bi-image"></i>
      <strong>MARKETING WORK</strong>
      <span>Add screenshot</span>
    </div>`;
}
function animateTimeline(items){
	if(!items || items.length===0) return;
	let triggered=false;
	const io = new IntersectionObserver((entries, obs)=>{
		entries.forEach(en=>{
			if(en.isIntersecting && !triggered){
				triggered=true;
				items.forEach((it, i)=>{
					setTimeout(()=>{ it.querySelector('.neu-card').style.transform='translateY(-6px)'; it.querySelector('.neu-card').style.transition='transform .4s ease'; }, i*150);
				});
				obs.disconnect();
			}
		});
	}, {threshold:0.2});
	// observe last item container
	const target = items[0] && items[0].parentElement.parentElement;
	if(target) io.observe(target);
}

function renderPortfolioProjects(container){
	if(!container) return;
	if(!Array.isArray(projects) || projects.length===0){
		console.warn('Projects data is unavailable.');
		container.innerHTML = '';
		return;
	}
	const assetPrefix = window.location.pathname.includes('/portfolio/') ? '../' : '';
	container.innerHTML = '<p class="eyebrow text-muted">PROJECTS</p><h2>Selected Case Studies</h2><div class="row g-4 mt-3">' + projects.map(p=>{
		const imgSrc = `${assetPrefix}${p.screenshot}`;
		return `
		<div id="${p.id}" class="col-12">
			<div class="row align-items-center gy-3">
				<div class="col-md-6">
					<img src="${imgSrc}" alt="${p.title}" class="img-fluid rounded" onerror="this.outerHTML=createFallbackPreview('${escapeHtml(p.title).replace(/'/g,'\\\'')}')">
				</div>
				<div class="col-md-6">
					<div class="neu-card p-4">
						<h4>${p.title}</h4>
						<div class="text-muted small mb-2">${p.category} · ${p.technologies.join(', ')}</div>
						<h6>Problem</h6>
						<p class="text-muted small">${p.problem}</p>
						<h6>Solution</h6>
						<p class="text-muted small">${p.solution}</p>
						<a href="${p.liveUrl}" class="neu-button mt-2 me-2">View Project</a>
						<a href="${p.githubUrl}" class="neu-button-outline mt-2">Case Study</a>
					</div>
				</div>
			</div>
		</div>`;
	}).join('') + '</div>';
}

function renderCertifications(container){
	if(!container) return;
	if(!Array.isArray(certifications) || certifications.length===0){
		container.innerHTML = '<p class="eyebrow text-muted">CERTIFICATIONS</p><div class="text-muted">No certifications added. Add objects in <code>script.js</code>.</div>';
		return;
	}
	container.innerHTML = '<div class="row g-3">' + certifications.map(c=>`
		<div class="col-md-4">
			<div class="neu-card p-3 d-flex gap-3 align-items-center">
				<img src="${c.image}" alt="${c.name}" style="width:80px;height:60px;object-fit:contain">
				<div>
					<div class="fw-bold">${c.name}</div>
					<div class="small text-muted">${c.issuer} · ${c.year} · <a href="${c.link}" target="_blank">Credential</a></div>
				</div>
			</div>
		</div>
	`).join('') + '</div>';
}

/* -----------------------------
	 Projects page rendering + filtering (used by /projects/index.html)
	 -----------------------------*/
function renderProjectsList(container){
	if(!container) return;
	if(!Array.isArray(projects) || projects.length===0){
		console.warn('Projects list data is unavailable.');
		container.innerHTML = '';
		return;
	}
	container.innerHTML = projects.map(p=>`
		<div class="col-12 col-md-6 col-lg-4">
			<article class="project-card">
				<img src="${p.screenshot}" alt="${p.title}" class="img-fluid mb-2">
				<div class="project-meta small text-muted">${p.category} · ${p.technologies.join(', ')}</div>
				<h5>${p.title}</h5>
				<p class="text-muted">${p.problem}</p>
				<p class="text-muted small"><strong>Solution:</strong> ${p.solution}</p>
				<div class="d-flex project-actions gap-2 mt-2">
					<a class="neu-button" href="${p.liveUrl}">View Project</a>
					<a class="neu-button-outline" href="${p.githubUrl}">Case Study</a>
				</div>
			</article>
		</div>
	`).join('');
}

function initProjectsPage(){
	const list = document.getElementById('projectsList');
	if(!list) return;
	renderProjectsList(list);
	document.querySelectorAll('.filter-btn').forEach(btn=>{
		btn.addEventListener('click', ()=>{
			document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
			btn.classList.add('active');
			const filter = btn.getAttribute('data-filter');
			if(filter==='all') renderProjectsList(list);
			else renderProjectsList(projects.filter(p=>p.category===filter || p.technologies.includes(filter)));
		});
	});
}

/* -----------------------------
	 Contact form handling
	 -----------------------------*/
if(contactForm){
	contactForm.addEventListener('submit', (e)=>{
		e.preventDefault();
		const f = e.target;
		if(!f.checkValidity()){ f.querySelectorAll(':invalid').forEach(n=>n.classList.add('is-invalid')); return; }
		alert('Thanks — this form is frontend-only. Connect Formspree or EmailJS to send.');
		f.reset();
	});
}

/* -----------------------------
	 Initialization for landing and portfolio
	 -----------------------------*/
function initLanding(){
	renderFeaturedProjects();
	renderExperienceTimelineLanding(experienceTimelineLandingContainer);
	renderLandingProjects(landingProjectsContainer);
	renderMarketingGallery(marketingGalleryContainer);
	// modest floating animation for badges
	document.querySelectorAll('.floating-cards .neu-badge').forEach((b,i)=>{ b.style.transition='transform .8s ease'; setTimeout(()=>b.style.transform='translateY(-6px)',100*i); setTimeout(()=>b.style.transform='translateY(0)',1000+100*i); });
	const revealTargets = document.querySelectorAll('.reveal-up');
	const revealObserver = new IntersectionObserver((entries, observer)=>{
		entries.forEach(entry=>{
			if(entry.isIntersecting){
				entry.target.classList.add('in-view');
				if(entry.target.id === 'workflowSection'){ entry.target.classList.add('is-visible'); }
				if(entry.target.classList.contains('journey-section')){ entry.target.classList.add('is-visible'); }
				observer.unobserve(entry.target);
			}
		});
	}, {threshold:0.18});
	revealTargets.forEach(item=>revealObserver.observe(item));
}

function initPortfolio(){
	const expContainer = document.getElementById('experienceJourney');
	const projContainer = document.getElementById('projectsShowcase');
	const certContainer = document.getElementById('certificationsPanel');
	renderPortfolioExperience(expContainer);
	renderExpertise(document.getElementById('expertise'));
	renderMarketingWork(document.getElementById('marketingWork'));
	renderHowIThink(document.getElementById('howIThink'));
	renderToolStack(document.getElementById('toolStack'));
	renderPortfolioProjects(projContainer);
	renderCertifications(certContainer);

	// small reveal for sections
	document.querySelectorAll('main section').forEach((s,i)=>{ s.classList.add('reveal-up'); setTimeout(()=>s.classList.add('in-view'), 120*i); });
}

// Set copyright year on both pages
document.addEventListener('DOMContentLoaded', ()=>{
	const copy = document.getElementById('copyYear'); if(copy) copy.textContent = new Date().getFullYear();
	// Landing page
	const landingShell = document.getElementById('experienceTimelineLanding') || document.getElementById('landingProjects') || document.getElementById('marketingGallery') || document.getElementById('featuredProjects');
	if(landingShell) initLanding();
	// Portfolio page
	if(document.location.pathname.includes('/portfolio/') || document.location.pathname.endsWith('portfolio') ){
		if(typeof initPortfolio === 'function') initPortfolio();
	}
	// Projects listing page
	if(document.location.pathname.includes('/projects/') || document.getElementById('projectsList')){
		initProjectsPage();
	}
});


