// Init Scroll Animation
AOS.init({ duration: 800, once: true, offset: 50 });

// Mobile Menu
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');
let menuOpen = false;

mobileBtn.addEventListener('click', () => {
    menuOpen = !menuOpen;
    if(menuOpen) {
        mobileMenu.classList.remove('hidden');
        mobileMenu.classList.add('flex');
        mobileBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    } else {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
        mobileBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
        mobileBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        menuOpen = false;
    });
});

function toggleSkill(contentId, iconId) {
    const content = document.getElementById(contentId);
    const icon = document.getElementById(iconId);
    if (content.classList.contains('open')) {
        content.classList.remove('open');
        icon.classList.remove('rotate-180');
    } else {
        content.classList.add('open');
        icon.classList.add('rotate-180');
    }
}

/* --- CUSTOM MARKDOWN SYSTEM --- */
function parseCustomText(text) {
    if (!text) return '';
    return text
        .replace(/\*(.*?)\*/g, '<b>$1</b>') // *bold*
        .replace(/#(.*?)#/g, '<span class="text-primary font-bold">$1</span>') // #yellow#
        .replace(/:(.*?):/g, '<span class="custom-box-tag">$1</span>'); // :box:
}

/* =========================================================
   Google Sheet Fetch Logic (FIXED CSV LINKS)
   ========================================================= */
const STATS_CSV_URL = "https://docs.google.com/spreadsheets/d/1Wx2zxoZHX4s-A4-cBrdoLpoNFAjxNwumzhf4b6VSLaM/export?format=csv";
const PROJECTS_CSV_URL = "https://docs.google.com/spreadsheets/d/1-98oCDS4fgHyDfFiS6ALMeNiznRK2hlaj_vV6BmG9gg/export?format=csv";

let projectsData = [];

// 1. Fetch Stats Sheet
if(STATS_CSV_URL) {
    Papa.parse(STATS_CSV_URL, {
        download: true,
        header: true,
        complete: function(results) {
            renderStats(results.data.filter(row => row.title));
            setTimeout(() => { AOS.refresh(); }, 500);
        }
    });
}

// 2. Fetch Projects Sheet
if(PROJECTS_CSV_URL) {
    Papa.parse(PROJECTS_CSV_URL, {
        download: true,
        header: true,
        complete: function(results) {
            projectsData = results.data.filter(row => row.title);
            renderPortfolio(projectsData);
            setTimeout(() => { AOS.refresh(); }, 500);
        }
    });
}

// Render Functions
function renderStats(stats) {
    const container = document.getElementById('stats-container');
    if(stats.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-500">No stats found. Make sure Sheet is public.</div>';
        return;
    }
    container.innerHTML = ''; 
    stats.forEach(stat => {
        container.innerHTML += `
        <div class="bg-card p-6 rounded-2xl border border-gray-800 text-center hover:border-primary/50 transition-colors" data-aos="fade-up">
            <h4 class="text-4xl font-black text-primary mb-2">${stat.title}</h4>
            <p class="text-sm text-gray-500 font-medium">${stat.category}</p>
        </div>`;
    });
}

function renderPortfolio(data) {
    const container = document.getElementById('portfolio-container');
    if(data.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-500">No projects found. Make sure Sheet is public.</div>';
        return;
    }
    container.innerHTML = ''; 

    data.forEach((project, index) => {
        const parsedDesc = parseCustomText(project.short_desc);
        
        const cardHtml = `
        <div class="bg-card border border-gray-800 rounded-3xl overflow-hidden group cursor-pointer hover:border-primary/50 transition-all duration-300" onclick="openModal(${index})" data-aos="fade-up">
            <div class="w-full aspect-video bg-gray-900 relative overflow-hidden">
                <img src="${project.thumbnail}" alt="${project.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            </div>
            <div class="p-6 sm:p-8 relative">
                <div class="text-xs text-primary font-bold tracking-widest mb-3 uppercase">${project.category}</div>
                <h4 class="text-3xl font-bold mb-3">${project.title}</h4>
                <p class="text-gray-400 text-sm line-clamp-2">${parsedDesc}</p>
                <div class="absolute top-8 right-8 w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
                    <i class="fa-solid fa-arrow-right -rotate-45 text-xl"></i>
                </div>
            </div>
        </div>`;
        container.innerHTML += cardHtml;
    });
}

/* Modal Logic */
const modal = document.getElementById('project-modal');

function openModal(index) {
    const p = projectsData[index];
    document.getElementById('modal-category').innerText = p.category;
    document.getElementById('modal-title').innerText = p.title;
    
    document.getElementById('modal-desc').innerHTML = parseCustomText(p.short_desc); 
    document.getElementById('modal-about').innerHTML = parseCustomText(p.about);     
    
    // --- DEMO LINK FIX LOGIC ---
    let linkUrl = p.demo_link ? p.demo_link.trim() : "";
    let demoBtn = document.getElementById('modal-demo-btn');
    
    if (linkUrl) {
        if (!linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
            linkUrl = 'https://' + linkUrl;
        }
        demoBtn.href = linkUrl;
        demoBtn.style.display = 'inline-flex';
    } else {
        demoBtn.href = '#';
        demoBtn.style.display = 'none';
    }

    document.getElementById('modal-role').innerText = p.role;
    document.getElementById('modal-timeline').innerText = p.timeline;
    document.getElementById('modal-total-tech').innerText = p.total_tech;
    
    if(p.tech_stack) {
        document.getElementById('modal-tech-stack').innerHTML = p.tech_stack.split(',').map(t => 
            `<span class="bg-[#151515] border border-gray-800 px-5 py-2.5 rounded-full text-sm text-gray-200 font-semibold">${t.trim()}</span>`
        ).join('');
    } else {
        document.getElementById('modal-tech-stack').innerHTML = '';
    }

    if(p.features) {
        document.getElementById('modal-features').innerHTML = p.features.split('|').map(f => 
            `<li class="flex items-start gap-4"><i class="fa-solid fa-circle-check text-primary text-lg mt-1"></i> <span class="leading-relaxed">${parseCustomText(f.trim())}</span></li>`
        ).join('');
    } else {
        document.getElementById('modal-features').innerHTML = '';
    }

    const galleryContainer = document.getElementById('modal-gallery');
    if(p.gallery) {
        galleryContainer.innerHTML = p.gallery.split(',').map(img => 
            `<img src="${img.trim()}" class="w-full rounded-2xl border border-gray-800 shadow-lg mt-4">`
        ).join('');
    } else {
        galleryContainer.innerHTML = '';
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
}// Init Scroll Animation
AOS.init({ duration: 800, once: true, offset: 50 });

// Mobile Menu
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');
let menuOpen = false;

mobileBtn.addEventListener('click', () => {
    menuOpen = !menuOpen;
    if(menuOpen) {
        mobileMenu.classList.remove('hidden');
        mobileMenu.classList.add('flex');
        mobileBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    } else {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
        mobileBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
        mobileBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        menuOpen = false;
    });
});

function toggleSkill(contentId, iconId) {
    const content = document.getElementById(contentId);
    const icon = document.getElementById(iconId);
    if (content.classList.contains('open')) {
        content.classList.remove('open');
        icon.classList.remove('rotate-180');
    } else {
        content.classList.add('open');
        icon.classList.add('rotate-180');
    }
}

/* --- CUSTOM MARKDOWN SYSTEM --- */
function parseCustomText(text) {
    if (!text) return '';
    return text
        .replace(/\*(.*?)\*/g, '<b>$1</b>') // *bold*
        .replace(/#(.*?)#/g, '<span class="text-primary font-bold">$1</span>') // #yellow#
        .replace(/:(.*?):/g, '<span class="custom-box-tag">$1</span>'); // :box:
}

/* =========================================================
   Google Sheet Fetch Logic (FIXED CSV LINKS)
   ========================================================= */
const STATS_CSV_URL = "https://docs.google.com/spreadsheets/d/1Wx2zxoZHX4s-A4-cBrdoLpoNFAjxNwumzhf4b6VSLaM/export?format=csv";
const PROJECTS_CSV_URL = "https://docs.google.com/spreadsheets/d/1-98oCDS4fgHyDfFiS6ALMeNiznRK2hlaj_vV6BmG9gg/export?format=csv";

let projectsData = [];

// 1. Fetch Stats Sheet
if(STATS_CSV_URL) {
    Papa.parse(STATS_CSV_URL, {
        download: true,
        header: true,
        complete: function(results) {
            renderStats(results.data.filter(row => row.title));
            setTimeout(() => { AOS.refresh(); }, 500);
        }
    });
}

// 2. Fetch Projects Sheet
if(PROJECTS_CSV_URL) {
    Papa.parse(PROJECTS_CSV_URL, {
        download: true,
        header: true,
        complete: function(results) {
            projectsData = results.data.filter(row => row.title);
            renderPortfolio(projectsData);
            setTimeout(() => { AOS.refresh(); }, 500);
        }
    });
}

// Render Functions
function renderStats(stats) {
    const container = document.getElementById('stats-container');
    if(stats.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-500">No stats found. Make sure Sheet is public.</div>';
        return;
    }
    container.innerHTML = ''; 
    stats.forEach(stat => {
        container.innerHTML += `
        <div class="bg-card p-6 rounded-2xl border border-gray-800 text-center hover:border-primary/50 transition-colors" data-aos="fade-up">
            <h4 class="text-4xl font-black text-primary mb-2">${stat.title}</h4>
            <p class="text-sm text-gray-500 font-medium">${stat.category}</p>
        </div>`;
    });
}

function renderPortfolio(data) {
    const container = document.getElementById('portfolio-container');
    if(data.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-500">No projects found. Make sure Sheet is public.</div>';
        return;
    }
    container.innerHTML = ''; 

    data.forEach((project, index) => {
        const parsedDesc = parseCustomText(project.short_desc);
        
        const cardHtml = `
        <div class="bg-card border border-gray-800 rounded-3xl overflow-hidden group cursor-pointer hover:border-primary/50 transition-all duration-300" onclick="openModal(${index})" data-aos="fade-up">
            <div class="w-full aspect-video bg-gray-900 relative overflow-hidden">
                <img src="${project.thumbnail}" alt="${project.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            </div>
            <div class="p-6 sm:p-8 relative">
                <div class="text-xs text-primary font-bold tracking-widest mb-3 uppercase">${project.category}</div>
                <h4 class="text-3xl font-bold mb-3">${project.title}</h4>
                <p class="text-gray-400 text-sm line-clamp-2">${parsedDesc}</p>
                <div class="absolute top-8 right-8 w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
                    <i class="fa-solid fa-arrow-right -rotate-45 text-xl"></i>
                </div>
            </div>
        </div>`;
        container.innerHTML += cardHtml;
    });
}

/* Modal Logic */
const modal = document.getElementById('project-modal');

function openModal(index) {
    const p = projectsData[index];
    document.getElementById('modal-category').innerText = p.category;
    document.getElementById('modal-title').innerText = p.title;
    
    document.getElementById('modal-desc').innerHTML = parseCustomText(p.short_desc); 
    document.getElementById('modal-about').innerHTML = parseCustomText(p.about);     
    
    // --- DEMO LINK FIX LOGIC ---
    let linkUrl = p.demo_link ? p.demo_link.trim() : "";
    let demoBtn = document.getElementById('modal-demo-btn');
    
    if (linkUrl) {
        if (!linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
            linkUrl = 'https://' + linkUrl;
        }
        demoBtn.href = linkUrl;
        demoBtn.style.display = 'inline-flex';
    } else {
        demoBtn.href = '#';
        demoBtn.style.display = 'none';
    }

    document.getElementById('modal-role').innerText = p.role;
    document.getElementById('modal-timeline').innerText = p.timeline;
    document.getElementById('modal-total-tech').innerText = p.total_tech;
    
    if(p.tech_stack) {
        document.getElementById('modal-tech-stack').innerHTML = p.tech_stack.split(',').map(t => 
            `<span class="bg-[#151515] border border-gray-800 px-5 py-2.5 rounded-full text-sm text-gray-200 font-semibold">${t.trim()}</span>`
        ).join('');
    } else {
        document.getElementById('modal-tech-stack').innerHTML = '';
    }

    if(p.features) {
        document.getElementById('modal-features').innerHTML = p.features.split('|').map(f => 
            `<li class="flex items-start gap-4"><i class="fa-solid fa-circle-check text-primary text-lg mt-1"></i> <span class="leading-relaxed">${parseCustomText(f.trim())}</span></li>`
        ).join('');
    } else {
        document.getElementById('modal-features').innerHTML = '';
    }

    const galleryContainer = document.getElementById('modal-gallery');
    if(p.gallery) {
        galleryContainer.innerHTML = p.gallery.split(',').map(img => 
            `<img src="${img.trim()}" class="w-full rounded-2xl border border-gray-800 shadow-lg mt-4">`
        ).join('');
    } else {
        galleryContainer.innerHTML = '';
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
}
