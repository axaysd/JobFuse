// Detect if current page is a LinkedIn job page
function isLinkedInJobPage() {
  const isJobPage = window.location.hostname === "www.linkedin.com" && window.location.pathname.startsWith("/jobs/view/");
  console.log(`[JobFuse] isLinkedInJobPage: ${isJobPage}`);
  return isJobPage;
}

// Extract job description from LinkedIn job page using robust selectors and fallbacks
function getLinkedInJobDescription() {
  // 1. Try the most specific/classic selector
  let jobDesc = document.querySelector('div[data-test-job-description], div.show-more-less-html__markup, div.description__text, div.description__text--rich');
  if (jobDesc && jobDesc.innerText.trim().length > 0) {
    console.log('[JobFuse] Job description found using main selector.');
    return jobDesc.innerText.trim();
  }
  // 2. Fallback: Look for an h2 containing 'About the job' and get its next sibling div
  const headings = document.querySelectorAll('h2');
  for (let h of headings) {
    if (/about the job/i.test(h.innerText)) {
      let sibling = h.nextElementSibling;
      while (sibling && sibling.tagName !== 'DIV') sibling = sibling.nextElementSibling;
      if (sibling && sibling.innerText.trim().length > 0) {
        console.log('[JobFuse] Job description found using fallback (About the job) selector.');
        return sibling.innerText.trim();
      }
    }
  }
  console.log('[JobFuse] Job description not found.');
  return null;
}

// Scan for the phrase 'Job Description' or similar in visible text nodes (legacy for non-LinkedIn pages)
function pageContainsJobDescription() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let node;
  while ((node = walker.nextNode())) {
    if (node.parentElement && node.parentElement.offsetParent !== null) { // visible
      if (/(job description|about the job|about this role|role overview|position summary|job overview|who we are|what you’ll do|responsibilities|about us)/i.test(node.textContent)) {
        console.log('[JobFuse] Found job description section header in visible text.');
        return true;
      }
    }
  }
  console.log('[JobFuse] No job description section header found in visible text.');
  return false;
}

function getStoredResume() {
  const resume = localStorage.getItem('jobb_resume_text');
  if (resume) {
    console.log('[JobFuse] Resume found in localStorage.');
  } else {
    console.log('[JobFuse] No resume found in localStorage. Will prompt user.');
  }
  return resume;
}

function storeResume(text) {
  localStorage.setItem('jobb_resume_text', text);
  console.log('[JobFuse] Resume saved to localStorage.');
}

// Refactored resume prompt using JobFuse modal
function promptForResume() {
  injectJobFuseStyles();
  return new Promise((resolve) => {
    const existing = document.getElementById('jobb-resume-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'jobb-resume-modal';
    modal.className = 'jobfuse-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.tabIndex = -1;
    // Card
    const card = document.createElement('div');
    card.className = 'jobfuse-modal__card';
    // Header
    const header = document.createElement('div');
    header.className = 'jobfuse-modal__header';
    const logo = document.createElement('div');
    logo.className = 'jobfuse-modal__logo';
    header.appendChild(logo);
    const title = document.createElement('div');
    title.className = 'jobfuse-modal__title';
    title.textContent = 'JobFuse';
    header.appendChild(title);
    card.appendChild(header);
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'jobfuse-modal__close';
    closeBtn.setAttribute('aria-label', 'Close resume modal');
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => { modal.remove(); resolve(null); };
    card.appendChild(closeBtn);
    // Progress
    const progress = document.createElement('div');
    progress.style.textAlign = 'center';
    progress.style.margin = '18px 0 0 0';
    progress.style.fontSize = '15px';
    progress.style.color = 'var(--jobfuse-brand)';
    progress.textContent = 'Step 1 of 2: Paste your resume';
    card.appendChild(progress);
    // Resume textarea
    const label = document.createElement('label');
    label.textContent = 'Paste your resume text (will be saved for future use):';
    label.style.margin = '18px 0 8px 0';
    label.style.fontWeight = '500';
    card.appendChild(label);
    const textarea = document.createElement('textarea');
    textarea.style.width = '100%';
    textarea.style.height = '180px';
    textarea.style.margin = '8px 0 0 0';
    textarea.style.padding = '10px';
    textarea.style.fontSize = '15px';
    textarea.style.border = '1px solid #ccc';
    textarea.style.borderRadius = '6px';
    textarea.style.fontFamily = 'var(--jobfuse-font)';
    textarea.required = true;
    card.appendChild(textarea);
    // Error message
    const errorMsg = document.createElement('div');
    errorMsg.style.color = '#b30000';
    errorMsg.style.fontSize = '14px';
    errorMsg.style.margin = '8px 0 0 0';
    errorMsg.style.display = 'none';
    card.appendChild(errorMsg);
    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.className = 'jobfuse-btn jobfuse-btn--primary';
    submitBtn.textContent = 'Save & Continue';
    submitBtn.style.margin = '18px 0 0 0';
    submitBtn.onclick = () => {
      if (!textarea.value.trim()) {
        errorMsg.textContent = 'Please paste your resume.';
        errorMsg.style.display = 'block';
        return;
      }
      errorMsg.style.display = 'none';
      storeResume(textarea.value.trim());
      modal.remove();
      resolve(textarea.value.trim());
    };
    card.appendChild(submitBtn);
    modal.appendChild(card);
    document.body.appendChild(modal);
    textarea.focus();
  });
}

function getStoredUserDetails() {
  const details = localStorage.getItem('jobb_user_details');
  if (details) {
    console.log('[JobFuse] User details found in localStorage.');
  } else {
    console.log('[JobFuse] No user details found in localStorage. Will prompt user.');
  }
  return details ? JSON.parse(details) : null;
}

function storeUserDetails(details) {
  localStorage.setItem('jobb_user_details', JSON.stringify(details));
  console.log('[JobFuse] User details saved to localStorage.');
}

// Refactored user details modal using JobFuse modal style
async function promptForUserDetails() {
  injectJobFuseStyles();
  return new Promise((resolve) => {
    const existing = document.getElementById('jobb-user-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'jobb-user-modal';
    modal.className = 'jobfuse-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.tabIndex = -1;
    // Card
    const card = document.createElement('div');
    card.className = 'jobfuse-modal__card';
    // Header
    const header = document.createElement('div');
    header.className = 'jobfuse-modal__header';
    const logo = document.createElement('div');
    logo.className = 'jobfuse-modal__logo';
    header.appendChild(logo);
    const title = document.createElement('div');
    title.className = 'jobfuse-modal__title';
    title.textContent = 'JobFuse';
    header.appendChild(title);
    card.appendChild(header);
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'jobfuse-modal__close';
    closeBtn.setAttribute('aria-label', 'Close user details modal');
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => { modal.remove(); resolve(null); };
    card.appendChild(closeBtn);
    // Progress
    const progress = document.createElement('div');
    progress.style.textAlign = 'center';
    progress.style.margin = '18px 0 0 0';
    progress.style.fontSize = '15px';
    progress.style.color = 'var(--jobfuse-brand)';
    progress.textContent = 'Step 2 of 2: Your details';
    card.appendChild(progress);
    // Form fields
    const fields = [
      { label: 'Full Name', id: 'jobb_name', type: 'text', required: true },
      { label: 'Email', id: 'jobb_email', type: 'email', required: true },
      { label: 'Phone', id: 'jobb_phone', type: 'text', required: true },
      { label: 'Address', id: 'jobb_address', type: 'text', required: false },
    ];
    const inputs = {};
    fields.forEach(f => {
      const label = document.createElement('label');
      label.textContent = f.label + (f.required ? ' *' : '');
      label.style.marginTop = '10px';
      label.style.fontWeight = '500';
      label.htmlFor = f.id;
      card.appendChild(label);
      const input = document.createElement('input');
      input.type = f.type;
      input.id = f.id;
      input.required = f.required;
      input.style.width = '100%';
      input.style.margin = '4px 0 12px 0';
      input.style.padding = '8px';
      input.style.fontSize = '15px';
      input.style.border = '1px solid #ccc';
      input.style.borderRadius = '5px';
      input.style.fontFamily = 'var(--jobfuse-font)';
      card.appendChild(input);
      inputs[f.id] = input;
    });
    // Visa status
    const visaLabel = document.createElement('label');
    visaLabel.textContent = 'US Visa Status *';
    visaLabel.style.marginTop = '10px';
    visaLabel.style.fontWeight = '500';
    visaLabel.htmlFor = 'jobb_visa';
    card.appendChild(visaLabel);
    const visaSelect = document.createElement('select');
    visaSelect.id = 'jobb_visa';
    visaSelect.required = true;
    visaSelect.style.width = '100%';
    visaSelect.style.margin = '4px 0 18px 0';
    visaSelect.style.padding = '8px';
    visaSelect.style.fontSize = '15px';
    visaSelect.style.border = '1px solid #ccc';
    visaSelect.style.borderRadius = '5px';
    visaSelect.style.fontFamily = 'var(--jobfuse-font)';
    ['','F1-OPT','H-1B'].forEach(opt => {
      const o = document.createElement('option');
      o.value = opt;
      o.textContent = opt ? opt : 'Select your visa status';
      visaSelect.appendChild(o);
    });
    card.appendChild(visaSelect);
    // Error message
    const errorMsg = document.createElement('div');
    errorMsg.style.color = '#b30000';
    errorMsg.style.fontSize = '14px';
    errorMsg.style.margin = '0 0 10px 0';
    errorMsg.style.display = 'none';
    card.appendChild(errorMsg);
    // Real-time validation
    function validate() {
      for (const f of fields) {
        if (f.required && !inputs[f.id].value.trim()) {
          errorMsg.textContent = 'Please fill in all required fields.';
          errorMsg.style.display = 'block';
          return false;
        }
      }
      if (!visaSelect.value) {
        errorMsg.textContent = 'Please select your visa status.';
        errorMsg.style.display = 'block';
        return false;
      }
      errorMsg.style.display = 'none';
      return true;
    }
    Object.values(inputs).forEach(input => {
      input.addEventListener('input', validate);
    });
    visaSelect.addEventListener('change', validate);
    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.className = 'jobfuse-btn jobfuse-btn--primary';
    submitBtn.textContent = 'Save & Continue';
    submitBtn.style.margin = '18px 0 0 0';
    submitBtn.onclick = () => {
      if (!validate()) return;
      const details = {
        name: inputs['jobb_name'].value.trim(),
        email: inputs['jobb_email'].value.trim(),
        phone: inputs['jobb_phone'].value.trim(),
        address: inputs['jobb_address'].value.trim(),
        visa: visaSelect.value
      };
      storeUserDetails(details);
      modal.remove();
      resolve(details);
    };
    card.appendChild(submitBtn);
    modal.appendChild(card);
    document.body.appendChild(modal);
    inputs['jobb_name'].focus();
  });
}

// --- OpenAI API Key Storage and Prompt Logic ---
function getStoredOpenAIApiKey() {
  const key = localStorage.getItem('jobb_openai_api_key');
  if (key) {
    console.log('[JobFuse] OpenAI API key found in localStorage.');
  } else {
    console.log('[JobFuse] No OpenAI API key found in localStorage. Will prompt user.');
  }
  return key;
}

function storeOpenAIApiKey(key) {
  localStorage.setItem('jobb_openai_api_key', key);
  console.log('[JobFuse] OpenAI API key saved to localStorage.');
}

function promptForOpenAIApiKey() {
  injectJobFuseStyles();
  return new Promise((resolve) => {
    const existing = document.getElementById('jobb-openai-key-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'jobb-openai-key-modal';
    modal.className = 'jobfuse-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.tabIndex = -1;
    // Card
    const card = document.createElement('div');
    card.className = 'jobfuse-modal__card';
    // Header
    const header = document.createElement('div');
    header.className = 'jobfuse-modal__header';
    const logo = document.createElement('div');
    logo.className = 'jobfuse-modal__logo';
    header.appendChild(logo);
    const title = document.createElement('div');
    title.className = 'jobfuse-modal__title';
    title.textContent = 'JobFuse';
    header.appendChild(title);
    card.appendChild(header);
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'jobfuse-modal__close';
    closeBtn.setAttribute('aria-label', 'Close API key modal');
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => { modal.remove(); resolve(null); };
    card.appendChild(closeBtn);
    // Progress
    const progress = document.createElement('div');
    progress.style.textAlign = 'center';
    progress.style.margin = '18px 0 0 0';
    progress.style.fontSize = '15px';
    progress.style.color = 'var(--jobfuse-brand)';
    progress.textContent = 'Enter your OpenAI API Key';
    card.appendChild(progress);
    // API key input
    const label = document.createElement('label');
    label.textContent = 'OpenAI API Key (will be saved for future use):';
    label.style.margin = '18px 0 8px 0';
    label.style.fontWeight = '500';
    card.appendChild(label);
    const input = document.createElement('input');
    input.type = 'password';
    input.style.width = '100%';
    input.style.margin = '8px 0 0 0';
    input.style.padding = '10px';
    input.style.fontSize = '15px';
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '6px';
    input.style.fontFamily = 'var(--jobfuse-font)';
    input.required = true;
    card.appendChild(input);
    // Error message
    const errorMsg = document.createElement('div');
    errorMsg.style.color = '#b30000';
    errorMsg.style.fontSize = '14px';
    errorMsg.style.margin = '8px 0 0 0';
    errorMsg.style.display = 'none';
    card.appendChild(errorMsg);
    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.className = 'jobfuse-btn jobfuse-btn--primary';
    submitBtn.textContent = 'Save & Continue';
    submitBtn.style.margin = '18px 0 0 0';
    submitBtn.onclick = () => {
      if (!input.value.trim()) {
        errorMsg.textContent = 'Please enter your OpenAI API key.';
        errorMsg.style.display = 'block';
        return;
      }
      errorMsg.style.display = 'none';
      storeOpenAIApiKey(input.value.trim());
      modal.remove();
      resolve(input.value.trim());
    };
    card.appendChild(submitBtn);
    modal.appendChild(card);
    document.body.appendChild(modal);
    input.focus();
  });
}

// Import the prompt template
// (Assume promptTemplate.js is loaded before this script or via a bundler)
// The variable 'generateCoverLetterPrompt' is available

// Import the lead search prompt template
// (Assume leadSearchPromptTemplate.js is loaded before this script or via a bundler)
// The variable 'generateLeadSearchPrompt' is available

// Utility to create a modal with tabs and editing
function showCoverLetterModal({ coverLetter, jobDescription, resume, openaiKey }) {
  injectJobFuseStyles();
  console.log('[JobFuse] Showing modal.');
  const existing = document.getElementById('jobb-modal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'jobb-modal';
  modal.className = 'jobfuse-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.tabIndex = -1;
  // Card
  const card = document.createElement('div');
  card.className = 'jobfuse-modal__card';
  // Header
  const header = document.createElement('div');
  header.className = 'jobfuse-modal__header';
  const logo = document.createElement('div');
  logo.className = 'jobfuse-modal__logo';
  header.appendChild(logo);
  const title = document.createElement('div');
  title.className = 'jobfuse-modal__title';
  title.textContent = 'JobFuse';
  header.appendChild(title);
  card.appendChild(header);
  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'jobfuse-modal__close';
  closeBtn.setAttribute('aria-label', 'Close JobFuse modal');
  closeBtn.innerHTML = '&times;';
  closeBtn.onclick = () => modal.remove();
  card.appendChild(closeBtn);
  // Tabs (only Cover Letter and Hiring Mgr. Leads remain)
  const tabNames = ['Cover Letter', 'Hiring Mgr. Leads'];
  const tabIcons = [
    '<svg width="18" height="18" fill="none" viewBox="0 0 18 18"><rect x="2" y="4" width="14" height="10" rx="2" stroke="#0073b1" stroke-width="1.5"/><path d="M6 8h6" stroke="#0073b1" stroke-width="1.5" stroke-linecap="round"/></svg>',
    '<svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M9 2v14M2 9h14" stroke="#0073b1" stroke-width="1.5" stroke-linecap="round"/></svg>'
  ];
  const tabContents = [];
  let activeTab = 0;
  const tabs = document.createElement('div');
  tabs.className = 'jobfuse-tabs';
  tabNames.forEach((name, i) => {
    const tab = document.createElement('button');
    tab.className = 'jobfuse-tab' + (i === 0 ? ' jobfuse-tab--active' : '');
    tab.innerHTML = tabIcons[i] + '<span>' + name + '</span>';
    tab.tabIndex = 0;
    tab.onclick = () => {
      tabContents.forEach((c, j) => c.style.display = j === i ? 'block' : 'none');
      Array.from(tabs.children).forEach((t, j) => {
        t.classList.toggle('jobfuse-tab--active', j === i);
      });
      activeTab = i;
      updateActionButtons();
    };
    tabs.appendChild(tab);
  });
  // Cover Letter tab (with placeholder highlighting and editing)
  const coverLetterDiv = document.createElement('div');
  coverLetterDiv.className = 'jobfuse-modal__content';
  coverLetterDiv.contentEditable = 'true';
  coverLetterDiv.spellcheck = true;
  function highlightPlaceholders(text) {
    text = text.replace(/\n/g, '<br>');
    return text.replace(/(\[\[.*?\]\]|<<.*?>>|\{\{.*?\}\})/g, match => `<span class=\"jobfuse-placeholder\">${match}</span>`);
  }
  coverLetterDiv.innerHTML = highlightPlaceholders(coverLetter);
  // Rich text toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'jobfuse-toolbar';
  toolbar.style.display = 'flex';
  toolbar.style.gap = '8px';
  toolbar.style.marginBottom = '8px';
  toolbar.style.alignItems = 'center';
  // Helper for toolbar buttons
  function makeToolbarBtn(icon, cmd, label, extraHandler) {
    const btn = document.createElement('button');
    btn.className = 'jobfuse-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', label);
    btn.innerHTML = icon;
    btn.tabIndex = 0;
    btn.onclick = (e) => {
      e.preventDefault();
      coverLetterDiv.focus();
      if (cmd) document.execCommand(cmd, false, null);
      if (extraHandler) extraHandler();
    };
    return btn;
  }
  // Bold
  toolbar.appendChild(makeToolbarBtn('<b>B</b>', 'bold', 'Bold'));
  // Italic
  toolbar.appendChild(makeToolbarBtn('<i>I</i>', 'italic', 'Italic'));
  // Undo
  toolbar.appendChild(makeToolbarBtn('<svg width="16" height="16" viewBox="0 0 16 16"><path d="M7 3L3 7l4 4" stroke="#0073b1" stroke-width="1.5" fill="none"/><path d="M3 7h6a4 4 0 110 8H7" stroke="#0073b1" stroke-width="1.5" fill="none"/></svg>', 'undo', 'Undo'));
  // Redo
  toolbar.appendChild(makeToolbarBtn('<svg width="16" height="16" viewBox="0 0 16 16"><path d="M9 3l4 4-4 4" stroke="#0073b1" stroke-width="1.5" fill="none"/><path d="M13 7H7a4 4 0 100 8h2" stroke="#0073b1" stroke-width="1.5" fill="none"/></svg>', 'redo', 'Redo'));
  // Copy to clipboard
  let copyMsgTimeout = null;
  const copyBtn = makeToolbarBtn('<svg width="16" height="16" viewBox="0 0 16 16"><rect x="4" y="2" width="8" height="12" rx="2" stroke="#0073b1" stroke-width="1.5" fill="none"/><path d="M6 6h4" stroke="#0073b1" stroke-width="1.5"/></svg>', null, 'Copy to clipboard', () => {
    const temp = document.createElement('div');
    temp.innerHTML = coverLetterDiv.innerHTML.replace(/<span class=\"jobfuse-placeholder\"[^>]*>(.*?)<\/span>/g, '$1');
    const text = temp.innerText;
    navigator.clipboard.writeText(text).then(() => {
      copyMsg.style.opacity = '1';
      clearTimeout(copyMsgTimeout);
      copyMsgTimeout = setTimeout(() => { copyMsg.style.opacity = '0'; }, 1200);
    });
  });
  toolbar.appendChild(copyBtn);
  // Copy confirmation message
  const copyMsg = document.createElement('span');
  copyMsg.textContent = 'Copied!';
  copyMsg.style.marginLeft = '8px';
  copyMsg.style.color = 'var(--jobfuse-accent)';
  copyMsg.style.fontWeight = 'bold';
  copyMsg.style.opacity = '0';
  copyMsg.style.transition = 'opacity 0.2s';
  toolbar.appendChild(copyMsg);
  // --- Add Job Description and Resume buttons ---
  const detailsBtnRow = document.createElement('div');
  detailsBtnRow.style.display = 'flex';
  detailsBtnRow.style.gap = '10px';
  detailsBtnRow.style.margin = '10px 0 0 0';
  // Job Description button
  const jobDescBtn = document.createElement('button');
  jobDescBtn.className = 'jobfuse-btn jobfuse-btn--accent';
  jobDescBtn.type = 'button';
  jobDescBtn.textContent = 'Show Job Description';
  jobDescBtn.setAttribute('aria-expanded', 'false');
  detailsBtnRow.appendChild(jobDescBtn);
  // Resume button
  const resumeBtn = document.createElement('button');
  resumeBtn.className = 'jobfuse-btn jobfuse-btn--accent';
  resumeBtn.type = 'button';
  resumeBtn.textContent = 'Show Resume';
  resumeBtn.setAttribute('aria-expanded', 'false');
  detailsBtnRow.appendChild(resumeBtn);
  // Expandable panels
  const jobDescPanel = document.createElement('div');
  jobDescPanel.style.display = 'none';
  jobDescPanel.style.margin = '12px 0 0 0';
  jobDescPanel.style.padding = '16px';
  jobDescPanel.style.background = '#f8fbff';
  jobDescPanel.style.border = '1px solid #cce0f5';
  jobDescPanel.style.borderRadius = '8px';
  jobDescPanel.style.fontSize = '15px';
  jobDescPanel.style.maxHeight = '180px';
  jobDescPanel.style.overflowY = 'auto';
  jobDescPanel.setAttribute('aria-label', 'Extracted Job Description');
  jobDescPanel.innerHTML = `<div style='font-weight:600;margin-bottom:8px;'>Extracted Job Description</div><div>${jobDescription.replace(/\n/g, '<br>')}</div>`;
  const resumePanel = document.createElement('div');
  resumePanel.style.display = 'none';
  resumePanel.style.margin = '12px 0 0 0';
  resumePanel.style.padding = '16px';
  resumePanel.style.background = '#f8fbff';
  resumePanel.style.border = '1px solid #cce0f5';
  resumePanel.style.borderRadius = '8px';
  resumePanel.style.fontSize = '15px';
  resumePanel.style.maxHeight = '180px';
  resumePanel.style.overflowY = 'auto';
  resumePanel.setAttribute('aria-label', 'Extracted Resume');
  resumePanel.innerHTML = `<div style='font-weight:600;margin-bottom:8px;'>Extracted Resume</div><div>${resume.replace(/\n/g, '<br>')}</div>`;
  // Toggle logic
  jobDescBtn.onclick = () => {
    const expanded = jobDescPanel.style.display === 'block';
    jobDescPanel.style.display = expanded ? 'none' : 'block';
    jobDescBtn.setAttribute('aria-expanded', String(!expanded));
    if (!expanded) {
      resumePanel.style.display = 'none';
      resumeBtn.setAttribute('aria-expanded', 'false');
    }
  };
  resumeBtn.onclick = () => {
    const expanded = resumePanel.style.display === 'block';
    resumePanel.style.display = expanded ? 'none' : 'block';
    resumeBtn.setAttribute('aria-expanded', String(!expanded));
    if (!expanded) {
      jobDescPanel.style.display = 'none';
      jobDescBtn.setAttribute('aria-expanded', 'false');
    }
  };
  // Assemble Cover Letter tab
  const coverLetterTab = document.createElement('div');
  coverLetterTab.className = 'jobfuse-tab-content';
  coverLetterTab.style.display = 'flex';
  coverLetterTab.style.flexDirection = 'column';
  coverLetterTab.appendChild(toolbar);
  coverLetterTab.appendChild(detailsBtnRow);
  coverLetterTab.appendChild(coverLetterDiv);
  coverLetterTab.appendChild(jobDescPanel);
  coverLetterTab.appendChild(resumePanel);
  // --- End details buttons/panels ---
  // Hiring Mgr. Leads tab (unchanged)
  const leadsDiv = document.createElement('div');
  leadsDiv.className = 'jobfuse-modal__content';
  leadsDiv.style.display = 'none';
  leadsDiv.className += ' jobfuse-tab-content';
  // Search leads button
  const searchLeadsBtn = document.createElement('button');
  searchLeadsBtn.className = 'jobfuse-btn jobfuse-btn--accent';
  searchLeadsBtn.textContent = 'Search leads';
  searchLeadsBtn.style.marginBottom = '18px';
  // Area to display the generated URLs
  const leadUrlsDiv = document.createElement('div');
  leadUrlsDiv.style.margin = '12px 0 0 0';
  leadUrlsDiv.style.fontSize = '15px';
  leadUrlsDiv.style.wordBreak = 'break-all';
  leadUrlsDiv.style.display = 'none';
  searchLeadsBtn.onclick = async () => {
    searchLeadsBtn.disabled = true;
    searchLeadsBtn.textContent = 'Searching...';
    leadUrlsDiv.style.display = 'none';
    try {
      const jobMeta = getLinkedInJobMeta ? getLinkedInJobMeta() : {};
      const prompt = generateLeadSearchPrompt({
        jobDescription,
        companyName: jobMeta.companyName,
        location: jobMeta.location,
        numUrls: 3
      });
      console.log('[JobFuse] Sending request to OpenAI API for 3 lead search URLs...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey || getStoredOpenAIApiKey()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.1',
          response_format: { type: 'text' },
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 600,
          temperature: 0.3
        })
      });
      if (!response.ok) {
        console.error(`[JobFuse] OpenAI API error (lead search): ${response.status} ${response.statusText}`);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      let urlsText = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content ? data.choices[0].message.content.trim() : null;
      if (urlsText) {
        const urls = urlsText.split(/\s+/).filter(u => u.startsWith('https://www.linkedin.com/sales/search/people'));
        if (urls.length > 0) {
          leadUrlsDiv.innerHTML = urls.map((url, idx) => `<a href="${url}" target="_blank" style="color:#0073b1;text-decoration:underline;display:block;margin-bottom:8px;">Strategy ${idx+1}: LinkedIn Sales Navigator Search</a>`).join('');
          leadUrlsDiv.style.display = 'block';
          console.log('[JobFuse] Lead search URLs generated successfully.');
        } else {
          leadUrlsDiv.textContent = 'No valid LinkedIn Sales Navigator URLs generated.';
          leadUrlsDiv.style.display = 'block';
          console.error('[JobFuse] No valid lead search URLs generated.');
        }
      } else {
        leadUrlsDiv.textContent = 'No valid LinkedIn Sales Navigator URLs generated.';
        leadUrlsDiv.style.display = 'block';
        console.error('[JobFuse] No valid lead search URLs generated.');
      }
    } catch (err) {
      leadUrlsDiv.textContent = 'Error generating lead search URLs: ' + err.message;
      leadUrlsDiv.style.display = 'block';
      console.error('[JobFuse] Error generating lead search URLs:', err);
    } finally {
      searchLeadsBtn.disabled = false;
      searchLeadsBtn.textContent = 'Search leads';
    }
  };
  leadsDiv.appendChild(searchLeadsBtn);
  leadsDiv.appendChild(leadUrlsDiv);
  tabContents.push(coverLetterTab, leadsDiv);
  // Tab content container
  const tabContentContainer = document.createElement('div');
  tabContentContainer.style.flex = '1';
  tabContentContainer.style.overflow = 'auto';
  tabContents.forEach((c, i) => {
    c.style.display = i === 0 ? 'block' : 'none';
    tabContentContainer.appendChild(c);
  });
  // Tab transition logic
  let lastTab = 0;
  function animateTabSwitch(from, to) {
    if (from === to) return;
    const out = tabContents[from];
    const inc = tabContents[to];
    out.style.transition = 'opacity 0.22s, transform 0.22s';
    inc.style.transition = 'opacity 0.22s, transform 0.22s';
    out.style.opacity = '1';
    inc.style.opacity = '0';
    inc.style.display = 'block';
    inc.style.transform = (to > from) ? 'translateX(40px)' : 'translateX(-40px)';
    setTimeout(() => {
      out.style.opacity = '0';
      out.style.transform = (to > from) ? 'translateX(-40px)' : 'translateX(40px)';
      inc.style.opacity = '1';
      inc.style.transform = 'translateX(0)';
    }, 10);
    setTimeout(() => {
      out.style.display = 'none';
      out.style.opacity = '';
      out.style.transform = '';
      inc.style.opacity = '';
      inc.style.transform = '';
    }, 240);
  }
  // Download button (only shown after cover letter is generated)
  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'jobfuse-btn jobfuse-btn--primary';
  downloadBtn.textContent = 'Download as Word';
  downloadBtn.onclick = () => {
    let html = coverLetterDiv.innerHTML;
    html = html.replace(/<span class=\"jobfuse-placeholder\"[^>]*>(.*?)<\/span>/g, '$1');
    html = html.replace(/<br\s*\/?>(?!\n)/g, '\n');
    html = html.replace(/<[^>]+>/g, '');
    const wordHtml = `<!DOCTYPE html><html><head><meta charset='utf-8'><style>body{font-family:Calibri;font-size:11pt;line-height:1.6;}</style></head><body>${html.replace(/\n/g, '<br>')}</body></html>`;
    const blob = new Blob([wordHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover_letter.doc';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
  downloadBtn.style.display = coverLetter && coverLetter.trim() ? 'inline-block' : 'none';
  // Generate Cover Letter button
  const generateBtn = document.createElement('button');
  generateBtn.className = 'jobfuse-btn jobfuse-btn--primary';
  generateBtn.textContent = 'Generate Cover Letter';
  generateBtn.onclick = async () => {
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    try {
      let userDetails = getStoredUserDetails();
      let resumeText = getStoredResume();
      if (!userDetails || !resumeText) {
        alert('User details and resume are required.');
        return;
      }
      const description = jobDescription;
      const jobMeta = getLinkedInJobMeta ? getLinkedInJobMeta() : {};
      await generateCoverLetter(description, resumeText, userDetails, openaiKey);
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = 'Generate Cover Letter';
    }
  };
  // Button row
  const btnRow = document.createElement('div');
  btnRow.className = 'jobfuse-btn-row';
  btnRow.appendChild(generateBtn);
  btnRow.appendChild(downloadBtn);
  // Assemble modal
  card.appendChild(tabs);
  card.appendChild(tabContentContainer);
  card.appendChild(btnRow);
  modal.appendChild(card);
  document.body.appendChild(modal);
  // Show/hide action buttons based on active tab and cover letter state
  function updateActionButtons() {
    if (activeTab === 0) {
      generateBtn.style.display = 'inline-block';
      downloadBtn.style.display = coverLetterDiv.innerText.trim() ? 'inline-block' : 'none';
    } else {
      generateBtn.style.display = 'none';
      downloadBtn.style.display = 'none';
    }
  }
  updateActionButtons();
  tabs.childNodes.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      if (activeTab !== i) {
        animateTabSwitch(activeTab, i);
        activeTab = i;
        updateActionButtons();
      }
      Array.from(tabs.children).forEach((t, j) => {
        t.classList.toggle('jobfuse-tab--active', j === i);
      });
    });
  });
}

// Extract role title, company name, and location from LinkedIn job page
function getLinkedInJobMeta() {
  let roleTitle = null, companyName = null, location = null;

  // Try selectors for role title
  let titleElem = document.querySelector('h1.top-card-layout__title, h1.top-card-layout__title, h1[data-test-job-title], h1');
  if (titleElem && titleElem.innerText.trim().length > 0) {
    roleTitle = titleElem.innerText.trim();
    console.log('[JobFuse] Extracted role title:', roleTitle);
  } else {
    console.log('[JobFuse] Could not extract role title.');
  }

  // Try selectors for company name
  let companyElem = document.querySelector('a.topcard__org-name-link, span.topcard__flavor, a[data-test-company-name], span[data-test-company-name], .topcard__org-name-link');
  if (companyElem && companyElem.innerText.trim().length > 0) {
    companyName = companyElem.innerText.trim();
    console.log('[JobFuse] Extracted company name:', companyName);
  } else {
    console.log('[JobFuse] Could not extract company name.');
  }

  // Try selectors for location
  let locationElem = document.querySelector('span.topcard__flavor--bullet, span.topcard__flavor--metadata, span[data-test-job-location], .topcard__flavor--bullet');
  if (locationElem && locationElem.innerText.trim().length > 0) {
    location = locationElem.innerText.trim();
    console.log('[JobFuse] Extracted location:', location);
  } else {
    console.log('[JobFuse] Could not extract location.');
  }

  return { roleTitle, companyName, location };
}

async function generateCoverLetter(jobDescription, resume, userDetails, openaiKey) {
  // Compose user details string for the prompt
  const jobMeta = getLinkedInJobMeta();
  const userDetailsString = `Candidate Details:\nName: ${userDetails.name}\nEmail: ${userDetails.email}\nPhone: ${userDetails.phone}\nAddress: ${userDetails.address}\nUS Visa Status: ${userDetails.visa}`;
  // Use the imported prompt template for readability
  const prompt = generateCoverLetterPrompt({
    userDetailsString,
    jobDescription,
    resume,
    roleTitle: jobMeta.roleTitle,
    companyName: jobMeta.companyName,
    location: jobMeta.location
  });

  try {
    console.log('[JobFuse] Sending request to OpenAI API for cover letter generation...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey || getStoredOpenAIApiKey()}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        response_format: { type: 'text' }, // request plain text
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 700,
        temperature: 0.7
      })
    });
    if (!response.ok) {
      console.error(`[JobFuse] OpenAI API error: ${response.status} ${response.statusText}`);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    let coverLetter = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content ? data.choices[0].message.content.trim() : null;
    if (coverLetter) {
      console.log('[JobFuse] Cover letter generated successfully.');
      showCoverLetterModal({ coverLetter, jobDescription, resume, openaiKey });
    } else {
      console.error('[JobFuse] No cover letter generated.');
      alert('No cover letter generated.');
    }
  } catch (err) {
    console.error('[JobFuse] Error generating cover letter:', err);
    alert('Error generating cover letter: ' + err.message);
  }
}

// Inject JobFuse styles once
function injectJobFuseStyles() {
  if (document.getElementById('jobfuse-style')) return;
  const style = document.createElement('style');
  style.id = 'jobfuse-style';
  style.textContent = `
    :root {
      --jobfuse-brand: #0073b1;
      --jobfuse-accent: #00a15f;
      --jobfuse-bg: #fff;
      --jobfuse-modal-bg: rgba(0,0,0,0.32);
      --jobfuse-shadow: 0 4px 32px rgba(0,0,0,0.18);
      --jobfuse-radius: 16px;
      --jobfuse-font: 'Segoe UI', Calibri, Arial, sans-serif;
      --jobfuse-placeholder-bg: #ffe066;
      --jobfuse-placeholder-color: #b36b00;
    }
    .jobfuse-fab {
      position: fixed; top: 24px; right: 24px; z-index: 99999;
      width: 56px; height: 56px; border-radius: 50%;
      background: var(--jobfuse-brand);
      color: #fff; border: none; box-shadow: 0 4px 16px rgba(0,0,0,0.10);
      display: flex; align-items: center; justify-content: center;
      font-size: 28px; cursor: pointer; opacity: 0.92; transition: opacity 0.2s, transform 0.1s;
      outline: none;
    }
    .jobfuse-fab:hover, .jobfuse-fab:focus { opacity: 1; transform: scale(1.08); }
    .jobfuse-fab:active { transform: scale(0.97); }
    .jobfuse-fab__tooltip {
      position: absolute; top: 64px; right: 0; background: #222; color: #fff;
      padding: 6px 14px; border-radius: 6px; font-size: 14px; white-space: nowrap;
      opacity: 0; pointer-events: none; transition: opacity 0.2s;
      z-index: 100000;
    }
    .jobfuse-fab:focus + .jobfuse-fab__tooltip,
    .jobfuse-fab:hover + .jobfuse-fab__tooltip { opacity: 1; }
    .jobfuse-modal {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: var(--jobfuse-modal-bg); z-index: 100000;
      display: flex; align-items: center; justify-content: center;
      animation: jobfuse-fadein 0.25s;
    }
    @keyframes jobfuse-fadein { from { opacity: 0; } to { opacity: 1; } }
    .jobfuse-modal__card {
      background: var(--jobfuse-bg); border-radius: var(--jobfuse-radius);
      box-shadow: var(--jobfuse-shadow); width: min(700px, 96vw);
      max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;
      position: relative; font-family: var(--jobfuse-font);
      animation: jobfuse-popin 0.22s cubic-bezier(.4,1.6,.6,1);
    }
    @keyframes jobfuse-popin { from { transform: scale(0.96); opacity: 0.7; } to { transform: scale(1); opacity: 1; } }
    .jobfuse-modal__header {
      display: flex; align-items: center; padding: 18px 28px 10px 28px;
      border-bottom: 1px solid #eee; background: #f7f7f7;
    }
    .jobfuse-modal__logo {
      width: 32px; height: 32px; margin-right: 12px;
      background: url('icon48.png') center/cover no-repeat;
      border-radius: 8px;
    }
    .jobfuse-modal__title {
      font-size: 22px; font-weight: bold; color: var(--jobfuse-brand);
      letter-spacing: 0.5px;
    }
    .jobfuse-modal__close {
      position: absolute; top: 16px; right: 24px; background: transparent;
      border: none; font-size: 28px; color: #888; cursor: pointer;
      transition: color 0.15s;
    }
    .jobfuse-modal__close:hover, .jobfuse-modal__close:focus { color: #b30000; }
    .jobfuse-tabs {
      display: flex; border-bottom: 1px solid #eee; background: #f7f7f7;
    }
    .jobfuse-tab {
      flex: 1; padding: 14px 0; border: none; background: transparent;
      font-size: 16px; font-weight: 500; color: #444; cursor: pointer;
      transition: background 0.15s, color 0.15s;
      outline: none;
      display: flex; align-items: center; justify-content: center;
      gap: 7px;
    }
    .jobfuse-tab--active {
      background: #fff; color: var(--jobfuse-brand); font-weight: bold;
      border-bottom: 2px solid var(--jobfuse-brand);
    }
    .jobfuse-modal__content {
      flex: 1; overflow: auto; padding: 24px; font-size: 16px;
      font-family: var(--jobfuse-font);
    }
    .jobfuse-btn-row {
      display: flex; justify-content: flex-end; gap: 12px;
      padding: 0 24px 24px 24px;
    }
    .jobfuse-btn {
      padding: 10px 18px; border: none; border-radius: 6px;
      font-size: 16px; cursor: pointer; font-family: var(--jobfuse-font);
      transition: background 0.15s, color 0.15s, box-shadow 0.15s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .jobfuse-btn--primary { background: var(--jobfuse-brand); color: #fff; }
    .jobfuse-btn--accent { background: var(--jobfuse-accent); color: #fff; }
    .jobfuse-btn:disabled { background: #ccc; color: #fff; cursor: not-allowed; }
    .jobfuse-placeholder {
      background: var(--jobfuse-placeholder-bg); color: var(--jobfuse-placeholder-color);
      padding: 2px 4px; border-radius: 4px; font-weight: 500;
      cursor: pointer;
    }
    .jobfuse-modal__content[contenteditable="true"]:focus {
      outline: 2px solid var(--jobfuse-brand);
      background: #f8fbff;
    }
    .jobfuse-toolbar {
      display: flex; gap: 8px; margin-bottom: 8px; align-items: center;
      background: #f0f0f0; padding: 8px 12px; border-radius: 6px;
      border: 1px solid #ccc;
    }
    .jobfuse-toolbar button {
      background: none; border: none; padding: 4px 8px;
      font-size: 14px; color: #333; cursor: pointer;
      transition: color 0.15s;
    }
    .jobfuse-toolbar button:hover { color: var(--jobfuse-brand); }
    .jobfuse-toolbar button:focus { outline: 1px solid var(--jobfuse-brand); }
    .jobfuse-toolbar button:active { transform: scale(0.9); }
    .jobfuse-tab-content { transition: opacity 0.22s, transform 0.22s; will-change: opacity, transform; }
    @media (max-width: 600px) {
      .jobfuse-modal__card { width: 98vw; min-width: 0; }
      .jobfuse-modal__header, .jobfuse-btn-row { padding-left: 10px; padding-right: 10px; }
      .jobfuse-modal__content { padding: 12px; }
    }
  `;
  document.head.appendChild(style);
}

// Refactored floating button with icon, tooltip, and new styles
function createFloatingButton() {
  injectJobFuseStyles();
  if (document.getElementById('jobb-cover-letter-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'jobb-cover-letter-btn';
  btn.className = 'jobfuse-fab';
  btn.setAttribute('aria-label', 'Open JobFuse');
  btn.innerHTML = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="14" fill="#0073b1"/><path d="M8.5 14.5L12 18L19.5 10.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  btn.tabIndex = 0;
  btn.onmouseenter = () => tooltip.style.opacity = '1';
  btn.onmouseleave = () => tooltip.style.opacity = '0';
  btn.onfocus = () => tooltip.style.opacity = '1';
  btn.onblur = () => tooltip.style.opacity = '0';
  btn.onclick = async () => {
    console.log('[JobFuse] Floating button clicked.');
    let openaiKey = getStoredOpenAIApiKey();
    if (!openaiKey) {
      openaiKey = await promptForOpenAIApiKey();
      if (!openaiKey) {
        alert('OpenAI API key is required to use JobFuse.');
        console.log('[JobFuse] User cancelled OpenAI API key input.');
        return;
      }
    }
    let resume = getStoredResume();
    if (!resume) {
      resume = await promptForResume();
      if (!resume) {
        alert('Resume is required to use JobFuse.');
        console.log('[JobFuse] User cancelled resume input.');
        return;
      }
    }
    let userDetails = getStoredUserDetails();
    if (!userDetails) {
      userDetails = await promptForUserDetails();
      if (!userDetails) {
        alert('User details are required to use JobFuse.');
        console.log('[JobFuse] User cancelled user details input.');
        return;
      }
    }
    if (isLinkedInJobPage()) {
      const description = getLinkedInJobDescription();
      if (!description) {
        alert('Could not extract job description.');
        console.log('[JobFuse] Could not extract job description.');
        return;
      }
      // Pass the key to the modal for downstream API calls
      showCoverLetterModal({ coverLetter: '', jobDescription: description, resume, openaiKey });
    } else {
      alert('This feature is only available on LinkedIn job pages.');
      console.log('[JobFuse] Not a LinkedIn job page.');
    }
  };
  // Tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'jobfuse-fab__tooltip';
  tooltip.textContent = 'Open JobFuse';
  btn.appendChild(tooltip);
  document.body.appendChild(btn);
  console.log('[JobFuse] Floating button created and added to page.');
}

// Wait for job description to load, retrying if necessary
function waitForJobDescriptionAndShowButton(tries = 0) {
  const description = getLinkedInJobDescription();
  if (description) {
    createFloatingButton();
    return;
  }
  if (tries < 10) {
    setTimeout(() => waitForJobDescriptionAndShowButton(tries + 1), 500);
    if (tries === 0) {
      console.log('[JobFuse] Waiting for job description to load...');
    }
  } else {
    console.log('[JobFuse] Gave up waiting for job description after 10 tries.');
  }
}

if (isLinkedInJobPage()) {
  waitForJobDescriptionAndShowButton();
} else if (pageContainsJobDescription()) {
  createFloatingButton();
} 