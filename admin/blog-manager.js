import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDoc,
  getDocs,
  Timestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

import { adminUid } from './firebase-config.js';
import { uploadImage } from './cloudinary-upload.js';

const DEFAULT_CATEGORY_OPTIONS = [
  'AI & Marketing',
  'SEO',
  'Digital Marketing',
  'Marketing Automation',
  'Analytics',
  'Google Ads',
  'Meta Ads',
  'Projects',
  'Growth Systems'
];

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `block-${Math.random().toString(36).slice(2, 10)}`;
}

function createEmptyBlock(type) {
  const id = generateId();
  switch (type) {
    case 'heading':
      return { id, type: 'heading', level: 'h2', content: '' };
    case 'paragraph':
      return { id, type: 'paragraph', content: '' };
    case 'image':
      return { id, type: 'image', url: '', alt: '', caption: '', publicId: '', width: null, height: null };
    case 'list':
      return { id, type: 'list', style: 'unordered', items: [''] };
    case 'quote':
      return { id, type: 'quote', content: '', attribution: '' };
    default:
      return { id, type: 'paragraph', content: '' };
  }
}

function createEmptyBlog() {
  return {
    title: '',
    slug: '',
    excerpt: '',
    category: '',
    tags: [],
    featuredImageUrl: '',
    contentBlocks: [],
    seo: {
      title: '',
      description: '',
      targetKeyword: '',
      secondaryKeywords: []
    },
    status: 'draft',
    publishedAt: null
  };
}

function formatDate(value) {
  if (!value) return '—';
  if (value instanceof Timestamp) {
    return value.toDate().toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  if (value?.toDate) {
    return value.toDate().toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return value;
}

function formatDateTime(value) {
  if (!value) return '—';
  if (value instanceof Timestamp) {
    return value.toDate().toLocaleString('en', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return value;
}

function createMessageEl(message, tone = 'info') {
  const wrapper = document.createElement('div');
  wrapper.className = `admin-message admin-message--${tone}`;
  wrapper.textContent = message;
  return wrapper;
}

export function initBlogManager({ auth, db, publishedBlogsCount, draftBlogsCount, monthlyBlogStatus, moduleContent, activityHeading, dashboardTitle, greetingHeading }) {
  const blogsCollection = collection(db, 'blogs');
  let blogs = [];
  let currentFilter = 'all';
  let editingId = null;
  let currentDraft = createEmptyBlog();
  let isDirty = false;
  let unsubscribe = null;
  let isSaving = false;
  let isDeleting = false;
  let currentUserUid = null;
  let activeUpload = false;

  function setMessage(message, tone = 'info') {
    const existing = moduleContent.querySelector('.admin-message');
    if (existing) existing.remove();
    if (message) {
      moduleContent.prepend(createMessageEl(message, tone));
    }
  }

  function setBusyState(isBusy, text = 'Saving…') {
    const button = document.getElementById('saveDraftButton');
    if (button) button.disabled = isBusy;
    const publishButton = document.getElementById('publishButton');
    if (publishButton) publishButton.disabled = isBusy;
  }

  function renderDashboard() {
    if (!auth.currentUser) return;

    const currentUserUid = auth.currentUser?.uid;
    if (adminUid && currentUserUid !== adminUid) {
      moduleContent.innerHTML = '<div class="empty-state"><p>You are not authorized to manage blogs.</p></div>';
      return;
    }

    moduleContent.innerHTML = '<div class="blog-loading">Loading blog activity…</div>';
    const q = query(blogsCollection, orderBy('updatedAt', 'desc'));
    unsubscribe = onSnapshot(q, (snapshot) => {
      blogs = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      const publishedCount = blogs.filter((blog) => blog.status === 'published').length;
      const draftCount = blogs.filter((blog) => blog.status === 'draft').length;
      const currentMonthPublished = blogs.filter((blog) => {
        if (blog.status !== 'published') return false;
        const publishedAt = getTimestampValue(blog.publishedAt);
        if (!publishedAt) return false;
        const date = publishedAt instanceof Date ? publishedAt : new Date(publishedAt);
        return Number.isFinite(date.getTime()) && date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear();
      }).length;
      publishedBlogsCount.textContent = String(publishedCount);
      draftBlogsCount.textContent = String(draftCount);
      monthlyBlogStatus.textContent = currentMonthPublished > 0 ? 'Published' : 'Pending';

      const recent = blogs.slice(0, 5);
      if (recent.length === 0) {
        moduleContent.innerHTML = `
          <div class="empty-state">
            <p>No blog posts yet.</p>
            <p>Your published and draft articles will appear here.</p>
          </div>
        `;
        return;
      }

      moduleContent.innerHTML = `
        <div class="activity-list">
          ${recent.map((blog) => `
            <article class="activity-item">
              <div>
                <h4>${blog.title || 'Untitled blog'}</h4>
                <p>${blog.status === 'published' ? 'Published' : 'Draft'} • ${formatDate(blog.status === 'published' ? blog.publishedAt : blog.updatedAt)}</p>
              </div>
              <span class="status-pill ${blog.status === 'published' ? 'published' : 'draft'}">${blog.status === 'published' ? 'Published' : 'Draft'}</span>
            </article>
          `).join('')}
        </div>
      `;
    }, (error) => {
      console.error(error);
      moduleContent.innerHTML = '<div class="empty-state"><p>Unable to load blog activity right now.</p></div>';
    });
  }

  async function ensureAuthorized() {
    if (!auth.currentUser) {
      throw new Error('Authentication required');
    }
    currentUserUid = auth.currentUser.uid;
    if (adminUid && currentUserUid !== adminUid) {
      throw new Error('You are not authorized to manage blogs.');
    }
    return true;
  }

  function renderBlogsView() {
    if (!auth.currentUser) return;

    const currentUserUid = auth.currentUser?.uid;
    if (adminUid && currentUserUid !== adminUid) {
      moduleContent.innerHTML = '<div class="empty-state"><p>You are not authorized to manage blogs.</p></div>';
      return;
    }

    activityHeading.textContent = 'Blog Management';
    dashboardTitle.textContent = 'Blog Management';
    moduleContent.innerHTML = '<div class="blog-loading">Loading blogs…</div>';

    const q = query(blogsCollection, orderBy('updatedAt', 'desc'));
    unsubscribe = onSnapshot(q, (snapshot) => {
      blogs = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      renderBlogList();
    }, (error) => {
      console.error(error);
      moduleContent.innerHTML = '<div class="empty-state"><p>Unable to load blogs right now.</p></div>';
    });
  }

  function renderBlogList() {
    const filtered = blogs.filter((blog) => {
      if (currentFilter === 'published') return blog.status === 'published';
      if (currentFilter === 'drafts') return blog.status === 'draft';
      return true;
    });

    if (filtered.length === 0) {
      moduleContent.innerHTML = `
        <div class="blog-manager-shell">
          <div class="blog-manager-header">
            <div>
              <h3>Blog Management</h3>
              <p>Manage your articles, drafts and published posts.</p>
            </div>
            <button class="btn btn-primary" id="createBlogButton" type="button">+ Create Blog</button>
          </div>
          <div class="filter-row">
            <button class="filter-pill ${currentFilter === 'all' ? 'active' : ''}" data-filter="all" type="button">All</button>
            <button class="filter-pill ${currentFilter === 'published' ? 'active' : ''}" data-filter="published" type="button">Published</button>
            <button class="filter-pill ${currentFilter === 'drafts' ? 'active' : ''}" data-filter="drafts" type="button">Drafts</button>
          </div>
          <div class="empty-state">
            <p>No blog posts yet.</p>
            <p>Create your first article to start building your blog.</p>
            <button class="btn btn-primary" id="emptyCreateBlogButton" type="button">Create Blog</button>
          </div>
        </div>
      `;
      attachListEvents();
      return;
    }

    moduleContent.innerHTML = `
      <div class="blog-manager-shell">
        <div class="blog-manager-header">
          <div>
            <h3>Blog Management</h3>
            <p>Manage your articles, drafts and published posts.</p>
          </div>
          <button class="btn btn-primary" id="createBlogButton" type="button">+ Create Blog</button>
        </div>
        <div class="filter-row">
          <button class="filter-pill ${currentFilter === 'all' ? 'active' : ''}" data-filter="all" type="button">All</button>
          <button class="filter-pill ${currentFilter === 'published' ? 'active' : ''}" data-filter="published" type="button">Published</button>
          <button class="filter-pill ${currentFilter === 'drafts' ? 'active' : ''}" data-filter="drafts" type="button">Drafts</button>
        </div>
        <div class="blog-list">
          ${filtered.map((blog) => `
            <article class="blog-row">
              <div class="blog-row__main">
                <h4>${blog.title || 'Untitled blog'}</h4>
                <p>${blog.category || 'Uncategorized'}</p>
              </div>
              <div class="blog-row__meta">
                <span class="status-pill ${blog.status === 'published' ? 'published' : 'draft'}">${blog.status === 'published' ? 'Published' : 'Draft'}</span>
                <span>${blog.status === 'published' ? formatDate(blog.publishedAt) : formatDate(blog.updatedAt)}</span>
              </div>
              <div class="blog-row__actions">
                <button class="btn btn-outline btn-small" data-action="edit" data-id="${blog.id}" type="button">Edit</button>
                <button class="btn btn-outline btn-small" data-action="preview" data-id="${blog.id}" type="button">Preview</button>
                ${blog.status === 'published' ? `<button class="btn btn-outline btn-small" data-action="unpublish" data-id="${blog.id}" type="button">Unpublish</button>` : `<button class="btn btn-outline btn-small" data-action="publish" data-id="${blog.id}" type="button">Publish</button>`}
                <button class="btn btn-outline btn-small danger" data-action="delete" data-id="${blog.id}" type="button">Delete</button>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    `;
    attachListEvents();
  }

  function attachListEvents() {
    const createButton = moduleContent.querySelector('#createBlogButton');
    const emptyCreateButton = moduleContent.querySelector('#emptyCreateBlogButton');
    if (createButton) createButton.addEventListener('click', () => openEditor());
    if (emptyCreateButton) emptyCreateButton.addEventListener('click', () => openEditor());

    moduleContent.querySelectorAll('.filter-pill').forEach((button) => {
      button.addEventListener('click', () => {
        currentFilter = button.dataset.filter;
        renderBlogList();
      });
    });

    moduleContent.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', async () => {
        const action = button.dataset.action;
        const id = button.dataset.id;
        if (!id) return;
        const blog = blogs.find((item) => item.id === id);
        if (!blog) return;
        if (action === 'edit') {
          await openEditor(blog.id);
        } else if (action === 'preview') {
          openPreview(blog);
        } else if (action === 'publish') {
          await publishBlog(blog.id);
        } else if (action === 'unpublish') {
          await unpublishBlog(blog.id);
        } else if (action === 'delete') {
          await deleteBlog(blog.id);
        }
      });
    });
  }

  async function openEditor(blogId = null) {
    isDirty = false;
    editingId = blogId;
    if (blogId) {
      const ref = doc(blogsCollection, blogId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        setMessage('The selected blog could not be found.', 'error');
        return;
      }
      currentDraft = { ...createEmptyBlog(), ...snap.data(), id: snap.id };
      if (!currentDraft.contentBlocks || !Array.isArray(currentDraft.contentBlocks)) currentDraft.contentBlocks = [];
      if (!currentDraft.seo) currentDraft.seo = { title: '', description: '', targetKeyword: '', secondaryKeywords: [] };
      if (!currentDraft.tags) currentDraft.tags = [];
      if (currentDraft.featuredImage && typeof currentDraft.featuredImage === 'object') {
        currentDraft.featuredImage = {
          url: currentDraft.featuredImage.url || '',
          publicId: currentDraft.featuredImage.publicId || '',
          alt: currentDraft.featuredImage.alt || '',
          width: currentDraft.featuredImage.width || null,
          height: currentDraft.featuredImage.height || null
        };
      } else if (currentDraft.featuredImageUrl) {
        currentDraft.featuredImage = {
          url: currentDraft.featuredImageUrl,
          publicId: '',
          alt: '',
          width: null,
          height: null
        };
      } else {
        currentDraft.featuredImage = { url: '', publicId: '', alt: '', width: null, height: null };
      }
      currentDraft.featuredImageUrl = currentDraft.featuredImage.url;
      if (currentDraft.contentBlocks.length === 0) {
        currentDraft.contentBlocks.push(createEmptyBlock('paragraph'));
      }
    } else {
      currentDraft = createEmptyBlog();
      currentDraft.contentBlocks = [createEmptyBlock('paragraph')];
    }
    renderEditor();
  }

  function renderEditor() {
    moduleContent.innerHTML = `
      <div class="blog-manager-shell">
        <div class="blog-manager-header blog-manager-header--stacked">
          <div>
            <button class="btn btn-outline btn-small" id="backToBlogsButton" type="button">← Back to Blogs</button>
            <h3>${editingId ? 'Edit Blog' : 'Create Blog'}</h3>
            <p class="editor-subtitle">Build a structured article draft or publish it when you are ready.</p>
          </div>
          <div class="editor-actions">
            <button class="btn btn-outline btn-small" id="saveDraftButton" type="button">Save Draft</button>
            <button class="btn btn-primary btn-small" id="publishButton" type="button">Publish</button>
          </div>
        </div>
        <div class="editor-grid">
          <section class="editor-card">
            <h4>Blog Details</h4>
            <div class="field-group field-group--stacked">
              <label for="blogTitle">Title *</label>
              <input id="blogTitle" type="text" value="${escapeHtml(currentDraft.title)}">
            </div>
            <div class="field-group field-group--stacked">
              <label for="blogSlug">Slug *</label>
              <input id="blogSlug" type="text" value="${escapeHtml(currentDraft.slug)}">
            </div>
            <div class="field-group field-group--stacked">
              <label for="blogExcerpt">Excerpt *</label>
              <textarea id="blogExcerpt" rows="4">${escapeHtml(currentDraft.excerpt)}</textarea>
              <p class="hint">Recommended length: 120–180 characters.</p>
              <p class="hint" id="excerptCounter">${currentDraft.excerpt.length}/180</p>
            </div>
            <div class="field-group field-group--stacked">
              <label for="blogCategory">Category</label>
              <select id="blogCategory">
                <option value="">Select a category</option>
                ${DEFAULT_CATEGORY_OPTIONS.map((category) => `<option value="${category}" ${currentDraft.category === category ? 'selected' : ''}>${category}</option>`).join('')}
                ${currentDraft.category && !DEFAULT_CATEGORY_OPTIONS.includes(currentDraft.category) ? `<option value="${currentDraft.category}" selected>${currentDraft.category}</option>` : ''}
              </select>
            </div>
            <div class="field-group field-group--stacked">
              <label for="blogTags">Tags</label>
              <div class="tag-input-row">
                <input id="blogTagsInput" type="text" placeholder="Add tags">
                <button class="btn btn-outline btn-small" id="addTagButton" type="button">Add</button>
              </div>
              <div class="tag-list" id="tagList">${currentDraft.tags.map((tag) => `<span class="tag-chip">${escapeHtml(tag)} <button type="button" data-remove-tag="${escapeHtml(tag)}">×</button></span>`).join('')}</div>
            </div>
            <div class="field-group field-group--stacked">
              <label>Featured Image</label>
              <div class="upload-card">
                <div class="upload-dropzone" data-drop-zone="featured">
                  <label class="upload-picker" for="featuredImageInput">
                    <input id="featuredImageInput" type="file" accept="image/jpeg,image/png,image/webp">
                    <span>Choose Image</span>
                  </label>
                  <p class="hint">Drop image here or choose one from your computer.</p>
                </div>
                <p class="hint">JPG, PNG, or WebP • Max 5 MB</p>
                <div id="featuredImageStatus" class="upload-status">Choose an image from your computer to upload it automatically.</div>
                <div id="featuredImagePreview" class="image-preview-shell">${renderFeaturedImagePreview()}</div>
                ${getFeaturedImageUrl(currentDraft) ? `<div class="upload-actions">
                  <button class="btn btn-outline btn-small" id="replaceFeaturedImageButton" type="button">Replace Image</button>
                  <button class="btn btn-outline btn-small" id="removeFeaturedImageButton" type="button">Remove Image</button>
                </div>` : ''}
                <button class="text-link" id="showFeaturedUrlButton" type="button">Use image URL instead</button>
                <div class="url-fallback" id="featuredUrlFallback" hidden>
                  <label for="blogFeaturedImage">Image URL</label>
                  <input id="blogFeaturedImage" type="text" value="${escapeHtml(getFeaturedImageUrl(currentDraft))}">
                </div>
                <label for="featuredImageAlt">Alt Text</label>
                <input id="featuredImageAlt" type="text" value="${escapeHtml(getFeaturedImageMeta(currentDraft).alt)}" placeholder="Describe the image for accessibility and SEO.">
                <p class="hint">Describe the image for accessibility and SEO.</p>
              </div>
            </div>
            <div class="field-group field-group--stacked">
              <label>Article Content</label>
              <div class="block-toolbar">
                <button class="btn btn-outline btn-small" data-block-action="heading" type="button">+ Heading</button>
                <button class="btn btn-outline btn-small" data-block-action="paragraph" type="button">+ Paragraph</button>
                <button class="btn btn-outline btn-small" data-block-action="image" type="button">+ Image</button>
                <button class="btn btn-outline btn-small" data-block-action="list" type="button">+ List</button>
                <button class="btn btn-outline btn-small" data-block-action="quote" type="button">+ Quote</button>
              </div>
              <div id="contentBlocks">${renderBlocks()}</div>
            </div>
          </section>
          <aside class="editor-card editor-card--side">
            <h4>SEO Settings</h4>
            <div class="field-group field-group--stacked">
              <label for="seoTitle">SEO Title</label>
              <input id="seoTitle" type="text" value="${escapeHtml(currentDraft.seo.title)}">
              <p class="hint" id="seoTitleCounter">0/60</p>
            </div>
            <div class="field-group field-group--stacked">
              <label for="seoDescription">Meta Description</label>
              <textarea id="seoDescription" rows="4">${escapeHtml(currentDraft.seo.description)}</textarea>
              <p class="hint" id="seoDescriptionCounter">0/160</p>
            </div>
            <div class="field-group field-group--stacked">
              <label for="seoTargetKeyword">Target Keyword</label>
              <input id="seoTargetKeyword" type="text" value="${escapeHtml(currentDraft.seo.targetKeyword)}">
            </div>
            <div class="field-group field-group--stacked">
              <label for="seoSecondaryKeywords">Secondary Keywords</label>
              <input id="seoSecondaryKeywords" type="text" value="${escapeHtml(currentDraft.seo.secondaryKeywords.join(', '))}">
            </div>
            <div class="search-preview">
              <h5>Search Preview</h5>
              <p class="preview-domain">sagar-psycho.github.io/sagar-growth-systems/blog/</p>
              <h6 id="previewTitle">${escapeHtml(currentDraft.seo.title || currentDraft.title || 'Blog title')}</h6>
              <p id="previewSlug">/${escapeHtml(currentDraft.slug || 'your-slug')}/</p>
              <p id="previewDescription">${escapeHtml(currentDraft.seo.description || currentDraft.excerpt || 'Your meta description preview will appear here.')}</p>
            </div>
          </aside>
        </div>
      </div>
    `;
    attachEditorEvents();
    syncEditorCounters();
  }

  function renderBlocks() {
    if (!currentDraft.contentBlocks.length) {
      return '<p class="empty-state">No content blocks yet.</p>';
    }
    return currentDraft.contentBlocks.map((block) => {
      const blockId = block.id;
      if (block.type === 'heading') {
        return `
          <div class="content-block" data-block-id="${blockId}">
            <div class="content-block__head">
              <strong>Heading</strong>
              <div class="block-actions">
                <button type="button" data-block-move="up" data-block-id="${blockId}">Move Up</button>
                <button type="button" data-block-move="down" data-block-id="${blockId}">Move Down</button>
                <button type="button" data-block-delete="${blockId}">Delete</button>
              </div>
            </div>
            <label>Heading Level</label>
            <select data-block-field="level" data-block-id="${blockId}">
              <option value="h2" ${block.level === 'h2' ? 'selected' : ''}>H2</option>
              <option value="h3" ${block.level === 'h3' ? 'selected' : ''}>H3</option>
            </select>
            <label>Heading</label>
            <input data-block-field="content" data-block-id="${blockId}" value="${escapeHtml(block.content)}">
          </div>
        `;
      }
      if (block.type === 'paragraph') {
        return `
          <div class="content-block" data-block-id="${blockId}">
            <div class="content-block__head">
              <strong>Paragraph</strong>
              <div class="block-actions">
                <button type="button" data-block-move="up" data-block-id="${blockId}">Move Up</button>
                <button type="button" data-block-move="down" data-block-id="${blockId}">Move Down</button>
                <button type="button" data-block-delete="${blockId}">Delete</button>
              </div>
            </div>
            <textarea data-block-field="content" data-block-id="${blockId}" rows="6">${escapeHtml(block.content)}</textarea>
          </div>
        `;
      }
      if (block.type === 'image') {
        return `
          <div class="content-block" data-block-id="${blockId}">
            <div class="content-block__head">
              <strong>Image</strong>
              <div class="block-actions">
                <button type="button" data-block-move="up" data-block-id="${blockId}">Move Up</button>
                <button type="button" data-block-move="down" data-block-id="${blockId}">Move Down</button>
                <button type="button" data-block-delete="${blockId}">Delete</button>
              </div>
            </div>
            <div class="upload-card">
              <div class="upload-dropzone" data-drop-zone="content" data-drop-block-id="${blockId}">
                <label class="upload-picker" for="contentImageInput-${blockId}">
                  <input class="content-image-input" type="file" accept="image/jpeg,image/png,image/webp" data-block-id="${blockId}" id="contentImageInput-${blockId}">
                  <span>Choose Image</span>
                </label>
                <p class="hint">Drop image here or choose one from your computer.</p>
              </div>
              <p class="hint">JPG, PNG, or WebP • Max 5 MB</p>
              <div class="upload-status" data-block-status="${blockId}">Choose an image from your computer to upload it automatically.</div>
              ${block.url ? `<div class="image-preview-shell"><img class="preview-image" src="${escapeHtml(block.url)}" alt="${escapeHtml(block.alt || '')}" onerror="this.style.display='none'"></div>
              <div class="upload-actions">
                <button class="btn btn-outline btn-small" type="button" data-upload-block-image="${blockId}">Replace Image</button>
                <button class="btn btn-outline btn-small" type="button" data-remove-block-image="${blockId}">Remove Image</button>
              </div>` : ''}
              <div class="field-group field-group--stacked">
                <label>Alt Text</label>
                <input data-block-field="alt" data-block-id="${blockId}" value="${escapeHtml(block.alt || '')}">
                <p class="hint">Describe the image for accessibility and SEO.</p>
                <label>Caption</label>
                <input data-block-field="caption" data-block-id="${blockId}" value="${escapeHtml(block.caption || '')}">
              </div>
            </div>
          </div>
        `;
      }
      if (block.type === 'list') {
        return `
          <div class="content-block" data-block-id="${blockId}">
            <div class="content-block__head">
              <strong>List</strong>
              <div class="block-actions">
                <button type="button" data-block-move="up" data-block-id="${blockId}">Move Up</button>
                <button type="button" data-block-move="down" data-block-id="${blockId}">Move Down</button>
                <button type="button" data-block-delete="${blockId}">Delete</button>
              </div>
            </div>
            <label>List Type</label>
            <select data-block-field="style" data-block-id="${blockId}">
              <option value="unordered" ${block.style === 'unordered' ? 'selected' : ''}>Bulleted</option>
              <option value="ordered" ${block.style === 'ordered' ? 'selected' : ''}>Numbered</option>
            </select>
            <div class="list-items">
              ${block.items.map((item, index) => `
                <div class="list-item-row">
                  <input data-block-list-item="${index}" data-block-id="${blockId}" value="${escapeHtml(item)}">
                  <button type="button" data-remove-list-item="${blockId}" data-list-index="${index}">×</button>
                </div>
              `).join('')}
            </div>
            <button class="btn btn-outline btn-small" data-add-list-item="${blockId}" type="button">+ Add Item</button>
          </div>
        `;
      }
      return `
        <div class="content-block" data-block-id="${blockId}">
          <div class="content-block__head">
            <strong>Quote</strong>
            <div class="block-actions">
              <button type="button" data-block-move="up" data-block-id="${blockId}">Move Up</button>
              <button type="button" data-block-move="down" data-block-id="${blockId}">Move Down</button>
              <button type="button" data-block-delete="${blockId}">Delete</button>
            </div>
          </div>
          <label>Quote</label>
          <textarea data-block-field="content" data-block-id="${blockId}" rows="4">${escapeHtml(block.content || '')}</textarea>
          <label>Attribution</label>
          <input data-block-field="attribution" data-block-id="${blockId}" value="${escapeHtml(block.attribution || '')}">
        </div>
      `;
    }).join('');
  }

  function attachEditorEvents() {
    const backButton = moduleContent.querySelector('#backToBlogsButton');
    if (backButton) backButton.addEventListener('click', () => {
      if (isDirty) {
        if (window.confirm('You have unsaved changes. Leave without saving?')) {
          currentDraft = createEmptyBlog();
          isDirty = false;
          renderBlogsView();
        }
      } else {
        currentDraft = createEmptyBlog();
        renderBlogsView();
      }
    });

    moduleContent.querySelectorAll('[data-block-action]').forEach((button) => {
      button.addEventListener('click', () => {
        currentDraft.contentBlocks.push(createEmptyBlock(button.dataset.blockAction));
        isDirty = true;
        renderEditor();
      });
    });

    moduleContent.querySelectorAll('[data-block-delete]').forEach((button) => {
      button.addEventListener('click', () => {
        const blockId = button.getAttribute('data-block-delete');
        currentDraft.contentBlocks = currentDraft.contentBlocks.filter((block) => block.id !== blockId);
        isDirty = true;
        renderEditor();
      });
    });

    moduleContent.querySelectorAll('[data-block-move]').forEach((button) => {
      button.addEventListener('click', () => {
        const blockId = button.getAttribute('data-block-id');
        const index = currentDraft.contentBlocks.findIndex((block) => block.id === blockId);
        if (index < 0) return;
        const targetIndex = button.dataset.blockMove === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= currentDraft.contentBlocks.length) return;
        const [block] = currentDraft.contentBlocks.splice(index, 1);
        currentDraft.contentBlocks.splice(targetIndex, 0, block);
        isDirty = true;
        renderEditor();
      });
    });

    moduleContent.querySelectorAll('[data-add-list-item]').forEach((button) => {
      button.addEventListener('click', () => {
        const blockId = button.getAttribute('data-add-list-item');
        const block = currentDraft.contentBlocks.find((item) => item.id === blockId);
        if (block) {
          block.items.push('');
          isDirty = true;
          renderEditor();
        }
      });
    });

    moduleContent.querySelectorAll('[data-remove-list-item]').forEach((button) => {
      button.addEventListener('click', () => {
        const blockId = button.getAttribute('data-remove-list-item');
        const index = Number(button.dataset.listIndex);
        const block = currentDraft.contentBlocks.find((item) => item.id === blockId);
        if (block) {
          block.items.splice(index, 1);
          isDirty = true;
          renderEditor();
        }
      });
    });

    moduleContent.querySelectorAll('[data-block-field]').forEach((field) => {
      field.addEventListener('input', (event) => {
        const blockId = field.getAttribute('data-block-id');
        const block = currentDraft.contentBlocks.find((item) => item.id === blockId);
        if (!block) return;
        const key = field.getAttribute('data-block-field');
        if (key === 'level' || key === 'style') {
          block[key] = field.value;
        } else {
          block[key] = field.value;
        }
        isDirty = true;
        syncEditorCounters();
      });
    });

    moduleContent.querySelectorAll('[data-block-list-item]').forEach((field) => {
      field.addEventListener('input', () => {
        const blockId = field.getAttribute('data-block-id');
        const block = currentDraft.contentBlocks.find((item) => item.id === blockId);
        if (!block) return;
        const index = Number(field.getAttribute('data-block-list-item'));
        block.items[index] = field.value;
        isDirty = true;
      });
    });

    const titleInput = moduleContent.querySelector('#blogTitle');
    const slugInput = moduleContent.querySelector('#blogSlug');
    const excerptInput = moduleContent.querySelector('#blogExcerpt');
    const categorySelect = moduleContent.querySelector('#blogCategory');
    const featuredImageUrlInput = moduleContent.querySelector('#blogFeaturedImage');
    const featuredImageAltInput = moduleContent.querySelector('#featuredImageAlt');
    const featuredFileInput = moduleContent.querySelector('#featuredImageInput');
    const showFeaturedUrlButton = moduleContent.querySelector('#showFeaturedUrlButton');
    const featuredUrlFallback = moduleContent.querySelector('#featuredUrlFallback');
    const replaceFeaturedImageButton = moduleContent.querySelector('#replaceFeaturedImageButton');
    const removeFeaturedImageButton = moduleContent.querySelector('#removeFeaturedImageButton');
    const seoTitleInput = moduleContent.querySelector('#seoTitle');
    const seoDescriptionInput = moduleContent.querySelector('#seoDescription');
    const seoTargetKeywordInput = moduleContent.querySelector('#seoTargetKeyword');
    const seoSecondaryKeywordsInput = moduleContent.querySelector('#seoSecondaryKeywords');
    const tagInput = moduleContent.querySelector('#blogTagsInput');
    const addTagButton = moduleContent.querySelector('#addTagButton');
    const tagList = moduleContent.querySelector('#tagList');

    titleInput.addEventListener('input', () => {
      currentDraft.title = titleInput.value;
      currentDraft.slug = slugInput.value || slugify(titleInput.value);
      slugInput.value = currentDraft.slug;
      isDirty = true;
      syncEditorCounters();
    });

    slugInput.addEventListener('input', () => {
      currentDraft.slug = slugInput.value;
      isDirty = true;
      syncEditorCounters();
    });

    excerptInput.addEventListener('input', () => {
      currentDraft.excerpt = excerptInput.value;
      isDirty = true;
      syncEditorCounters();
    });

    categorySelect.addEventListener('change', () => {
      currentDraft.category = categorySelect.value;
      isDirty = true;
    });

    if (featuredImageUrlInput) {
      featuredImageUrlInput.addEventListener('input', () => {
        setFeaturedImageFromUrl(featuredImageUrlInput.value);
        isDirty = true;
      });
    }

    if (showFeaturedUrlButton && featuredUrlFallback) {
      showFeaturedUrlButton.addEventListener('click', () => {
        featuredUrlFallback.hidden = !featuredUrlFallback.hidden;
      });
    }

    featuredImageAltInput.addEventListener('input', () => {
      if (!currentDraft.featuredImage) {
        currentDraft.featuredImage = { url: '', publicId: '', alt: '', width: null, height: null };
      }
      currentDraft.featuredImage.alt = featuredImageAltInput.value;
      currentDraft.featuredImageUrl = currentDraft.featuredImage.url;
      isDirty = true;
    });

    if (replaceFeaturedImageButton) {
      replaceFeaturedImageButton.addEventListener('click', () => featuredFileInput.click());
    }
    if (removeFeaturedImageButton) {
      removeFeaturedImageButton.addEventListener('click', () => {
        removeFeaturedImage();
      });
    }
    if (featuredFileInput) {
      featuredFileInput.addEventListener('change', async () => {
        const file = featuredFileInput.files && featuredFileInput.files[0];
        if (!file) return;
        await uploadFeaturedImage(file);
      });
    }

    moduleContent.querySelectorAll('[data-upload-block-image]').forEach((button) => {
      button.addEventListener('click', () => {
        const blockId = button.getAttribute('data-upload-block-image');
        const fileInput = moduleContent.querySelector(`.content-image-input[data-block-id="${blockId}"]`);
        if (fileInput) fileInput.click();
      });
    });

    moduleContent.querySelectorAll('[data-remove-block-image]').forEach((button) => {
      button.addEventListener('click', () => {
        const blockId = button.getAttribute('data-remove-block-image');
        removeBlockImage(blockId);
      });
    });

    moduleContent.querySelectorAll('.content-image-input').forEach((fileInput) => {
      fileInput.addEventListener('change', async () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        const blockId = fileInput.getAttribute('data-block-id');
        await uploadBlockImage(file, blockId);
      });
    });

    moduleContent.querySelectorAll('[data-drop-zone]').forEach((dropZone) => {
      dropZone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropZone.classList.add('is-dragover');
      });
      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('is-dragover');
      });
      dropZone.addEventListener('drop', async (event) => {
        event.preventDefault();
        dropZone.classList.remove('is-dragover');
        const files = event.dataTransfer?.files;
        const file = files && files[0];
        if (!file) return;
        if (dropZone.dataset.dropZone === 'featured') {
          await uploadFeaturedImage(file);
        } else if (dropZone.dataset.dropZone === 'content') {
          await uploadBlockImage(file, dropZone.dataset.dropBlockId);
        }
      });
    });

    seoTitleInput.addEventListener('input', () => {
      currentDraft.seo.title = seoTitleInput.value;
      isDirty = true;
      syncEditorCounters();
    });

    seoDescriptionInput.addEventListener('input', () => {
      currentDraft.seo.description = seoDescriptionInput.value;
      isDirty = true;
      syncEditorCounters();
    });

    seoTargetKeywordInput.addEventListener('input', () => {
      currentDraft.seo.targetKeyword = seoTargetKeywordInput.value;
      isDirty = true;
    });

    seoSecondaryKeywordsInput.addEventListener('input', () => {
      currentDraft.seo.secondaryKeywords = seoSecondaryKeywordsInput.value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      isDirty = true;
    });

    addTagButton.addEventListener('click', () => addTag(tagInput.value));
    tagInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        addTag(tagInput.value);
      }
    });

    if (tagList) {
      tagList.querySelectorAll('[data-remove-tag]').forEach((chip) => {
        chip.addEventListener('click', () => {
          const value = chip.getAttribute('data-remove-tag');
          currentDraft.tags = currentDraft.tags.filter((tag) => tag !== value);
          isDirty = true;
          renderEditor();
        });
      });
    }

    const saveButton = moduleContent.querySelector('#saveDraftButton');
    if (saveButton) saveButton.addEventListener('click', () => saveBlog('draft'));

    const publishButton = moduleContent.querySelector('#publishButton');
    if (publishButton) publishButton.addEventListener('click', () => saveBlog('published'));
  }

  function syncEditorCounters() {
    const excerptCounter = moduleContent.querySelector('#excerptCounter');
    if (excerptCounter) {
      excerptCounter.textContent = `${currentDraft.excerpt.length}/180`;
    }
    const seoTitleCounter = moduleContent.querySelector('#seoTitleCounter');
    if (seoTitleCounter) {
      seoTitleCounter.textContent = `${currentDraft.seo.title.length}/60`;
    }
    const seoDescriptionCounter = moduleContent.querySelector('#seoDescriptionCounter');
    if (seoDescriptionCounter) {
      seoDescriptionCounter.textContent = `${currentDraft.seo.description.length}/160`;
    }

    const previewTitle = moduleContent.querySelector('#previewTitle');
    const previewSlug = moduleContent.querySelector('#previewSlug');
    const previewDescription = moduleContent.querySelector('#previewDescription');
    if (previewTitle) previewTitle.textContent = currentDraft.seo.title || currentDraft.title || 'Blog title';
    if (previewSlug) previewSlug.textContent = `/${currentDraft.slug || 'your-slug'}/`;
    if (previewDescription) previewDescription.textContent = currentDraft.seo.description || currentDraft.excerpt || 'Your meta description preview will appear here.';
  }

  function addTag(tagText) {
    const value = tagText.trim();
    if (!value) return;
    if (!currentDraft.tags.includes(value)) {
      currentDraft.tags.push(value);
      isDirty = true;
      renderEditor();
    }
  }

  function getTimestampValue(value) {
    if (!value) return null;
    if (value instanceof Timestamp) return value.toDate();
    if (value?.toDate) return value.toDate();
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
      const parsed = new Date(value);
      return Number.isFinite(parsed.getTime()) ? parsed : null;
    }
    return null;
  }

  function getFeaturedImageMeta(blog) {
    const featured = blog?.featuredImage;
    if (featured && typeof featured === 'object') {
      return {
        url: featured.url || '',
        publicId: featured.publicId || '',
        alt: featured.alt || '',
        width: featured.width || null,
        height: featured.height || null
      };
    }
    return {
      url: blog?.featuredImageUrl || '',
      publicId: '',
      alt: '',
      width: null,
      height: null
    };
  }

  function getFeaturedImageUrl(blog) {
    return getFeaturedImageMeta(blog).url;
  }

  function renderFeaturedImagePreview() {
    const image = getFeaturedImageMeta(currentDraft);
    if (!image.url) {
      return '<p class="hint">Choose an image from your computer to upload it automatically.</p>';
    }
    return `<img class="preview-image" src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt || currentDraft.title || 'Featured image')}" onerror="this.style.display='none'">`;
  }

  function setFeaturedImageFromUrl(url) {
    const normalized = String(url || '').trim();
    currentDraft.featuredImage = {
      url: normalized,
      publicId: currentDraft.featuredImage?.publicId || '',
      alt: currentDraft.featuredImage?.alt || '',
      width: currentDraft.featuredImage?.width || null,
      height: currentDraft.featuredImage?.height || null
    };
    currentDraft.featuredImageUrl = normalized;
  }

  function removeFeaturedImage() {
    currentDraft.featuredImage = { url: '', publicId: '', alt: '', width: null, height: null };
    currentDraft.featuredImageUrl = '';
    isDirty = true;
    renderEditor();
  }

  function removeBlockImage(blockId) {
    const block = currentDraft.contentBlocks.find((item) => item.id === blockId);
    if (!block) return;
    block.url = '';
    block.publicId = '';
    block.width = null;
    block.height = null;
    isDirty = true;
    renderEditor();
  }

  async function uploadFeaturedImage(file) {
    if (activeUpload) {
      setMessage('Please wait for image uploads to finish.', 'info');
      return;
    }
    if (!file) return;
    const status = moduleContent.querySelector('#featuredImageStatus');
    if (status) status.textContent = 'Uploading image...';
    activeUpload = true;
    setBusyState(true);
    try {
      const data = await uploadImage(file, {
        folder: 'portfolio/blogs/featured',
        onProgress: (percentage) => {
          if (status) status.textContent = `Uploading image... ${percentage}%`;
        }
      });
      currentDraft.featuredImage = {
        url: data.url,
        publicId: data.publicId,
        alt: currentDraft.featuredImage?.alt || '',
        width: data.width,
        height: data.height
      };
      currentDraft.featuredImageUrl = data.url;
      isDirty = true;
      renderEditor();
      if (status) status.textContent = 'Image uploaded successfully.';
      setMessage('Image uploaded successfully.', 'success');
    } catch (error) {
      if (status) status.textContent = error.message || 'Unable to upload image. Please try again.';
      setMessage(error.message || 'Unable to upload image. Please try again.', 'error');
    } finally {
      activeUpload = false;
      setBusyState(false);
    }
  }

  async function uploadBlockImage(file, blockId) {
    if (activeUpload) {
      setMessage('Please wait for image uploads to finish.', 'info');
      return;
    }
    const statusEl = moduleContent.querySelector(`[data-block-status="${blockId}"]`);
    if (statusEl) statusEl.textContent = 'Uploading image...';
    activeUpload = true;
    setBusyState(true);
    try {
      const data = await uploadImage(file, {
        folder: 'portfolio/blogs/content',
        onProgress: (percentage) => {
          if (statusEl) statusEl.textContent = `Uploading image... ${percentage}%`;
        }
      });
      const block = currentDraft.contentBlocks.find((item) => item.id === blockId);
      if (!block) return;
      block.url = data.url;
      block.publicId = data.publicId;
      block.width = data.width;
      block.height = data.height;
      isDirty = true;
      renderEditor();
      if (statusEl) statusEl.textContent = 'Image uploaded successfully.';
      setMessage('Image uploaded successfully.', 'success');
    } catch (error) {
      if (statusEl) statusEl.textContent = error.message || 'Unable to upload image. Please try again.';
      setMessage(error.message || 'Unable to upload image. Please try again.', 'error');
    } finally {
      activeUpload = false;
      setBusyState(false);
    }
  }

  async function saveBlog(status) {
    try {
      await ensureAuthorized();
      if (isSaving) return;
      isSaving = true;
      setBusyState(true);
      const normalizedSlug = slugify(currentDraft.slug || currentDraft.title);
      currentDraft.slug = normalizedSlug;

      if (!currentDraft.title || !currentDraft.slug || !currentDraft.excerpt) {
        throw new Error('Title, slug, and excerpt are required.');
      }

      if (status === 'published') {
        if (!currentDraft.contentBlocks || currentDraft.contentBlocks.length === 0) {
          throw new Error('Add at least one meaningful content block before publishing.');
        }
        const duplicate = blogs.find((blog) => blog.slug === currentDraft.slug && blog.id !== editingId);
        if (duplicate) {
          throw new Error('A blog with this slug already exists. Choose a different slug.');
        }
      }

      if (activeUpload) {
        throw new Error('Please wait for image uploads to finish.');
      }

      const payload = {
        title: currentDraft.title,
        slug: currentDraft.slug,
        excerpt: currentDraft.excerpt,
        category: currentDraft.category,
        tags: currentDraft.tags,
        featuredImage: currentDraft.featuredImage || (currentDraft.featuredImageUrl ? { url: currentDraft.featuredImageUrl, publicId: '', alt: '', width: null, height: null } : null),
        featuredImageUrl: currentDraft.featuredImageUrl,
        contentBlocks: currentDraft.contentBlocks,
        seo: currentDraft.seo,
        status,
        updatedAt: serverTimestamp(),
        publishedAt: status === 'published' ? (currentDraft.publishedAt || serverTimestamp()) : null
      };

      if (!editingId) {
        payload.createdAt = serverTimestamp();
      }

      if (editingId) {
        const ref = doc(blogsCollection, editingId);
        await updateDoc(ref, payload);
      } else {
        await addDoc(blogsCollection, payload);
      }

      setMessage(status === 'published' ? 'Blog published successfully.' : 'Draft saved successfully.', 'success');
      isDirty = false;
      currentDraft = createEmptyBlog();
      editingId = null;
      renderBlogsView();
    } catch (error) {
      console.error(error);
      const message = error.message || 'Unable to save blog right now.';
      setMessage(message, 'error');
    } finally {
      isSaving = false;
      setBusyState(false);
    }
  }

  async function publishBlog(blogId) {
    try {
      await ensureAuthorized();
      const ref = doc(blogsCollection, blogId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const data = snap.data();
      if (!data.title || !data.slug || !data.excerpt || !Array.isArray(data.contentBlocks) || data.contentBlocks.length === 0) {
        throw new Error('Complete the title, slug, excerpt, and content before publishing.');
      }
      const duplicate = blogs.find((blog) => blog.slug === data.slug && blog.id !== blogId);
      if (duplicate) {
        throw new Error('A blog with this slug already exists. Choose a different slug.');
      }
      await updateDoc(ref, {
        status: 'published',
        publishedAt: data.publishedAt || serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setMessage('Blog published successfully.', 'success');
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Unable to publish blog right now.', 'error');
    }
  }

  async function unpublishBlog(blogId) {
    try {
      await ensureAuthorized();
      const ref = doc(blogsCollection, blogId);
      await updateDoc(ref, {
        status: 'draft',
        updatedAt: serverTimestamp()
      });
      setMessage('Blog moved to drafts.', 'success');
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Unable to unpublish blog right now.', 'error');
    }
  }

  async function deleteBlog(blogId) {
    if (!window.confirm('Delete this blog? This action cannot be undone.')) return;
    try {
      await ensureAuthorized();
      const ref = doc(blogsCollection, blogId);
      await deleteDoc(ref);
      setMessage('Blog deleted successfully.', 'success');
      if (editingId === blogId) {
        currentDraft = createEmptyBlog();
        editingId = null;
      }
      renderBlogsView();
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Unable to delete blog right now.', 'error');
    }
  }

  function openPreview(blog) {
    moduleContent.innerHTML = `
      <div class="blog-manager-shell">
        <div class="blog-manager-header blog-manager-header--stacked">
          <div>
            <button class="btn btn-outline btn-small" id="backToBlogsButton" type="button">← Back to Blogs</button>
            <h3>Preview</h3>
            <p class="editor-subtitle">Review the article structure before publishing.</p>
          </div>
        </div>
        <article class="preview-card">
          <p class="preview-meta">${escapeHtml(blog.category || 'Uncategorized')} • ${blog.status === 'published' ? 'Published' : 'Draft'}</p>
          <h4>${escapeHtml(blog.title || 'Untitled blog')}</h4>
          <p class="preview-excerpt">${escapeHtml(blog.excerpt || '')}</p>
          ${(getFeaturedImageUrl(blog) ? `<img class="preview-image" src="${escapeHtml(getFeaturedImageUrl(blog))}" alt="${escapeHtml(getFeaturedImageMeta(blog).alt || blog.title || '')}" onerror="this.style.display='none'">` : '')}
          ${renderPreviewBlocks(blog.contentBlocks || [])}
        </article>
      </div>
    `;
    moduleContent.querySelector('#backToBlogsButton').addEventListener('click', () => renderBlogsView());
  }

  function renderPreviewBlocks(blocks) {
    return blocks.map((block) => {
      if (block.type === 'heading') {
        return `<${block.level || 'h2'}>${escapeHtml(block.content || '')}</${block.level || 'h2'}>`;
      }
      if (block.type === 'paragraph') {
        return `<p>${escapeHtml(block.content || '')}</p>`;
      }
      if (block.type === 'image') {
        return `<figure><img class="preview-image" src="${escapeHtml(block.url || '')}" alt="${escapeHtml(block.alt || '')}"><figcaption>${escapeHtml(block.caption || '')}</figcaption></figure>`;
      }
      if (block.type === 'list') {
        const tag = block.style === 'ordered' ? 'ol' : 'ul';
        const items = (block.items || []).map((item) => `<li>${escapeHtml(item || '')}</li>`).join('');
        return `<${tag}>${items}</${tag}>`;
      }
      return `<blockquote>${escapeHtml(block.content || '')}</blockquote>`;
    }).join('');
  }

  return {
    renderDashboard,
    renderBlogsView,
    openEditor
  };
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
