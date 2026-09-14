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

/* --- KUSTOM MARKDOWN SYSTEM --- */
function parseCustomText(text) {
    if (!text) return '';
    return text
        .replace(/\*(.*?)\*/g, '<b>$1</b>') // *bold*
        .replace(/#(.*?)#/g, '<span class="text-primary font-bold">$1</span>') // #yellow#
        .replace(/:(.*?):/g, '<span class="custom-box-tag">$1</span>'); // :box:
}

/* --- SAFE COLUMN READER (To prevent spelling/space issues in Sheet) --- */
function getVal(row, keyName) {
    for (let key in row) {
        if (key.trim().toLowerCase() === keyName.toLowerCase()) {
            return row[key] ? row[key].trim() : "";
        }
    }
    return "";
}

/* =========================================================
   Google Sheet Fetch Logic
   ========================================================= */

// NOTE TO USER: "Publish to Web" link is REQUIRED. Do not use "/export?format=csv" directly as browsers block it (CORS error).
// How to get it: Google Sheet -> File -> Share -> Publish to Web -> Select "Comma-separated values (.csv)" -> Publish.
const STATS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTIf62O7E-vE_Dblz60zX-zXm-sM1_xU1uD0_8B6s2Z2e1z_1m4X1n1_Z0mD1zZ1_0m4X1n1_Z0mD1zZ1/pub?output=csv"; // Ekhane apnar PUBLISHED Stats csv link diben
const PROJECTS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTIf62O7E-vE_Dblz60zX-zXm-sM1_xU1uD0_8B6s2Z2e1z_1m4X1n1_Z0mD1zZ1_0m4X1n1_Z0mD1zZ1/pub?output=csv"; // Ekhane apnar PUBLISHED Projects csv link diben

let projectsData = [];

// 1. Fetch Stats Sheet
if(STATS_CSV_URL) {
    Papa.parse(STATS_CSV_URL, {
        download: true,
        header: true,
        complete: function(results) {
            renderStats(results.data);
            setTimeout(() => { AOS.refresh(); }, 500);
        },
        error: function(error) {
            document.getElementById('stats-container').innerHTML = `<div class="col-span-full text-center text-red-500">Error loading stats. Check Google Sheet published link.</div>`;
        }
    });
}

// 2. Fetch Projects Sheet
if(PROJECTS_CSV_URL) {
    Papa.parse(PROJECTS_CSV_URL, {
        download: true,
        header: true,
        complete: function(results) {
            projectsData = results.data;
            renderPortfolio(projectsData);
            setTimeout(() => { AOS.refresh(); }, 500);
        },
        error: function(error) {
            document.getElementById('portfolio-container').innerHTML = `<div class="col-span-full text-center text-red-500">Error loading projects. Check Google Sheet published link.</div>`;
        }
    });
}

// Render Functions
function renderStats(stats) {
    const container = document.getElementById('stats-container');
    let validStats = stats.filter(row => getVal(row, 'title'));
    
    if(validStats.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-500">No stats found. Make sure Sheet is published.</div>';
        return;
    }
    
    container.innerHTML = ''; 
    validStats.forEach(stat => {
        let title = getVal(stat, 'title');
        let category = getVal(stat, 'category');
        container.innerHTML += `
        <div class="bg-card p-6 rounded-2xl border border-gray-800 text-center hover:border-primary/50 transition-colors" data-aos="fade-up">
            <h4 class="text-4xl font-black text-primary mb-2">${title}</h4>
            <p class="text-sm text-gray-500 font-medium">${category}</p>
        </div>`;
    });
}

function renderPortfolio(data) {
    const container = document.getElementById('portfolio-container');
    let validProjects = data.filter(row => getVal(row, 'title'));

    if(validProjects.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-500">No projects found. Make sure Sheet is published.</div>';
        return;
    }
    
    container.innerHTML = ''; 
    validProjects.forEach((project, index) => {
        let title = getVal(project, 'title');
        let category = getVal(project, 'category');
        let short_desc = parseCustomText(getVal(project, 'short_desc'));
        let thumbnail = getVal(project, 'thumbnail');

        const cardHtml = `
        <div class="bg-card border border-gray-800 rounded-3xl overflow-hidden group cursor-pointer hover:border-primary/50 transition-all duration-300" onclick="openModal(${index})" data-aos="fade-up">
            <div class="w-full aspect-video bg-gray-900 relative overflow-hidden">
                <img src="${thumbnail}" alt="${title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            </div>
            <div class="p-6 sm:p-8 relative">
                <div class="text-xs text-primary font-bold tracking-widest mb-3 uppercase">${category}</div>
                <h4 class="text-3xl font-bold mb-3">${title}</h4>
                <p class="text-gray-400 text-sm line-clamp-2">${short_desc}</p>
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
    // We need to filter again because index matches validProjects
    let validProjects = projectsData.filter(row => getVal(row, 'title'));
    const p = validProjects[index];
    
    document.getElementById('modal-category').innerText = getVal(p, 'category');
    document.getElementById('modal-title').innerText = getVal(p, 'title');
    
    document.getElementById('modal-desc').innerHTML = parseCustomText(getVal(p, 'short_desc')); 
    document.getElementById('modal-about').innerHTML = parseCustomText(getVal(p, 'about'));     
    
    // --- BULLETPROOF DEMO LINK LOGIC ---
    let linkUrl = getVal(p, 'demo_link');
    let demoBtn = document.getElementById('modal-demo-btn');
    
    if (linkUrl && linkUrl !== "") {
        if (!linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
            linkUrl = 'https://' + linkUrl;
        }
        demoBtn.href = linkUrl;
        // Show Button
        demoBtn.classList.remove('hidden');
        demoBtn.classList.add('inline-flex');
    } else {
        demoBtn.href = '#';
        // Hide Button
        demoBtn.classList.add('hidden');
        demoBtn.classList.remove('inline-flex');
    }

    document.getElementById('modal-role').innerText = getVal(p, 'role');
    document.getElementById('modal-timeline').innerText = getVal(p, 'timeline');
    document.getElementById('modal-total-tech').innerText = getVal(p, 'total_tech');
    
    let techStack = getVal(p, 'tech_stack');
    if(techStack) {
        document.getElementById('modal-tech-stack').innerHTML = techStack.split(',').map(t => 
            `<span class="bg-[#151515] border border-gray-800 px-5 py-2.5 rounded-full text-sm text-gray-200 font-semibold">${t.trim()}</span>`
        ).join('');
    } else {
        document.getElementById('modal-tech-stack').innerHTML = '';
    }

    let features = getVal(p, 'features');
    if(features) {
        document.getElementById('modal-features').innerHTML = features.split('|').map(f => 
            `<li class="flex items-start gap-4"><i class="fa-solid fa-circle-check text-primary text-lg mt-1"></i> <span class="leading-relaxed">${parseCustomText(f.trim())}</span></li>`
        ).join('');
    } else {
        document.getElementById('modal-features').innerHTML = '';
    }

    let gallery = getVal(p, 'gallery');
    const galleryContainer = document.getElementById('modal-gallery');
    if(gallery) {
        galleryContainer.innerHTML = gallery.split(',').map(img => 
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
