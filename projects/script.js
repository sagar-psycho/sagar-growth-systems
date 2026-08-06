/* Projects page script: loads projects from parent script data via safe fetch of parent script file
   For simplicity, we replicate the same project objects here so the page works standalone.
*/

const projectsList = document.getElementById('projectsList');
const yearEl = document.getElementById('year');
yearEl.textContent = new Date().getFullYear();

const projects = [
  {
    id: 'abra-crm',
    title: 'ABRA Logistics CRM',
    category: 'CRM',
    problem: 'Lead generation campaigns produced enquiries but lacked structured tracking and follow-up.',
    solution: 'A lead management system connecting marketing leads to sales workflows with assignment and status tracking.',
    whatIBuilt: 'Lead capture, assignment, status tracking, follow-up management and reporting interfaces.',
    technologies: ['HTML','CSS','JavaScript','Firebase','APIs','AI Integrations'],
    image: '../assets/images/sagark.png',
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
    image: '../assets/images/ksagar.png',
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
    image: '../assets/images/sagark.png',
    liveUrl: '#',
    githubUrl: '#',
    businessValue: 'Improves sales handoff and reduces lost enquiries.'
  }
];

function renderProjects(list){
  projectsList.innerHTML = list.map(p=>`
    <div class="col-12 col-md-6 col-lg-4">
      <article class="project-card">
        <img src="${p.image}" alt="${p.title}" class="img-fluid mb-2">
        <div class="project-meta small text-muted">${p.category} · ${p.technologies.join(', ')}</div>
        <h5>${p.title}</h5>
        <p class="text-muted">${p.problem}</p>
        <p><strong>Solution:</strong> ${p.solution}</p>
        <p><strong>What I Built:</strong> ${p.whatIBuilt}</p>
        <div class="d-flex project-actions gap-2">
          <a class="btn btn-sm btn-primary" href="${p.liveUrl}">View Project</a>
          <a class="btn btn-sm btn-outline-light" href="${p.githubUrl}">View Case Study</a>
        </div>
      </article>
    </div>
  `).join('');
}

renderProjects(projects);

// Filtering
document.querySelectorAll('.filter-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');
    if(filter==='all') renderProjects(projects);
    else renderProjects(projects.filter(p=>p.category===filter || p.technologies.includes(filter)));
  });
});
