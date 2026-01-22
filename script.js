    /* =========================================
       1. CONFIGURATION & DONNÉES
       ========================================= */
    const CONFIG = {
        adminPhone: "261341108401",
        api: {
            sujets: "https://6945646bed253f51719b3a44.mockapi.io/documents/Sujetsetcorriges",
            cours: "https://6971ad9c32c6bacb12c422f5.mockapi.io/V1/Cours",
            resultats: "https://6971ad9c32c6bacb12c422f5.mockapi.io/V1/Resultats",
            pubs: "https://6945646bed253f51719b3a44.mockapi.io/documents/Pub",
        },
        images: {
            sujet: "sujet.jpg",
            corrige: "corrigé.jpg",
            video: "https://cdn-icons-png.flaticon.com/512/3074/3074767.png",
            pdf: "https://cdn-icons-png.flaticon.com/512/337/337946.png",
            trophy: "https://cdn-icons-png.flaticon.com/512/3176/3176388.png"
        }
    };

    // Données de secours
    const FALLBACK = [ {id:1, level:"CEPE", type:"Sujet", subject:"Mathématiques", year:"2024", price:"1000 Ar", password:"A", link:"#"} ];
    const FALLBACK_PUBS = [ {id:1, image:"https://images.unsplash.com/photo-1497215728101-856f4ea42174", title:"BIENVENUE", description:"La plateforme d'excellence", link:"#", buttonText:"EXPLORER"} ];

    let globalData = { sujets: [], cours: [], resultats: [] };
    let currentItem = null;
    let currentView = 'sujets'; // 'sujets', 'cours', 'resultats'

    /* =========================================
       2. INITIALISATION
       ========================================= */
    async function init() {
        initTheme();
        initPWA();
        
        await loadPubs();
        // Charge tout au début pour fluidité
        loadSujets(); // Charge la vue par défaut
    }

    /* =========================================
       3. LOGIQUE D'AFFICHAGE (RENDERERS)
       ========================================= */
    
    // --- VUE SUJETS & CORRIGÉS ---
    async function loadSujets() {
        showLoader(true);
        currentView = 'sujets';
        try {
            const res = await fetch(CONFIG.api.sujets);
            globalData.sujets = res.ok ? await res.json() : FALLBACK;
        } catch { globalData.sujets = FALLBACK; }
        
        showLoader(false);
        renderSujets(globalData.sujets);
    }

    function renderSujets(list) {
        const grid = document.getElementById('grid');
        grid.innerHTML = '';
        
        if(list.length === 0) { grid.innerHTML = '<p style="text-align:center; width:100%;">Aucun document trouvé.</br><small>Veuillez connecter à internet pour afficher les documents.</small></p>'; return; }

        list.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Couleurs par niveau
            let color = "#34495e";
            if(item.level === "CEPE") color = "var(--cepe)";
            if(item.level === "BEPC") color = "var(--bepc)";
            if(item.level === "BAC") color = "var(--bac)";

            // Badge Rouge (Corrigé) / Bleu (Sujet)
            let badgeClass = item.type === "Corrigé" ? "badge-corrige" : "badge-sujet";
            
            // Image
            let imgUrl = item.image || (item.type === "Corrigé" ? CONFIG.images.corrige : CONFIG.images.sujet);

            card.innerHTML = `
                <div class="card-header" style="background: linear-gradient(135deg, var(--bg-panel), ${color}33); border-bottom:2px solid ${color};">
                    <span class="level-badge" style="background:${color}">${item.level}</span>
                    <span class="type-badge ${badgeClass}">${item.type}</span>
                    <img src="${imgUrl}" class="card-img-icon" alt="${item.type}">
                </div>
                <div class="card-body">
                    <div class="card-title">${item.subject}</div>
                    <div class="card-sub">Session ${item.year}</div>
                    <span class="card-price">${item.price}</span>
                    <button class="btn-card" onclick="openModal('${item.id}')">OBTENIR</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function filterSujets(cat, btn) {
        currentView = 'sujets';
        updateActiveBtn(btn);
        
        // Si les données ne sont pas chargées, on recharge
        if(globalData.sujets.length === 0) { loadSujets().then(() => doFilter()); } 
        else { doFilter(); }

        function doFilter() {
            if(cat === 'all') renderSujets(globalData.sujets);
            else renderSujets(globalData.sujets.filter(i => i.level === cat));
        }
    }

    // --- VUE COURS ---
    async function showCours(btn) {
        currentView = 'cours';
        updateActiveBtn(btn);
        showLoader(true);

        try {
            const res = await fetch(CONFIG.api.cours);
            globalData.cours = res.ok ? await res.json() : [];
        } catch { globalData.cours = []; }

        showLoader(false);
        renderCours(globalData.cours);
    }

    function renderCours(list) {
        const grid = document.getElementById('grid');
        grid.innerHTML = '';
        
        if(list.length === 0) {
            // Fallback hardcodé si liste vide pour démo
            list = [
              /*  {niveau:"CM2", matiere:"Calcul", titre:"Les fractions", type:"pdf", link:"dépannage.html"},
                {niveau:"3ème", matiere:"SVT", titre:"L'Immunologie", type:"video", link:"dépannage.html"},
                {niveau:"Terminale", matiere:"Philo", titre:"La Conscience", type:"pdf", link:"dépannage.html"}*/
            ];
        }

        list.forEach(c => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Couleur cycle
            let color = "#8e44ad"; // Violet par défaut
            if(["CM1","CM2"].includes(c.niveau)) color = "#27ae60";
            if(["6ème","5ème","4ème","3ème"].includes(c.niveau)) color = "#2980b9";
            if(["Seconde","Première","Terminale"].includes(c.niveau)) color = "#c0392b";

            let imgUrl = c.image || (c.type === "video" ? CONFIG.images.video : CONFIG.images.pdf);

            card.innerHTML = `
                <div class="card-header" style="background: linear-gradient(135deg, var(--bg-panel), ${color}33); border-bottom:2px solid ${color};">
                    <span class="level-badge" style="background:${color}">${c.niveau}</span>
                    <img src="${imgUrl}" class="card-img-icon" alt="Cours">
                </div>
                <div class="card-body">
                    <div class="card-title" style="color:${color}">${c.matiere}</div>
                    <p class="card-sub">${c.titre}</p>
                    <button class="btn-card" style="border-color:${color}; color:${color}" onclick="window.open('${c.link}', '_blank')">
                        ${c.type === 'video' ? 'REGARDER' : 'LIRE'}
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // --- VUE RÉSULTATS ---
    async function showResults(btn) {
        currentView = 'resultats';
        updateActiveBtn(btn);
        showLoader(true);

        try {
            const res = await fetch(CONFIG.api.resultats);
            globalData.resultats = res.ok ? await res.json() : [];
        } catch { globalData.resultats = []; }

        showLoader(false);
        renderResults(globalData.resultats);
    }

    function renderResults(list) {
        const grid = document.getElementById('grid');
        grid.innerHTML = '';

        if(list.length === 0) {
            // Fallback Demo
            list = [
               /* {exam:"CEPE 2024", color:"#27ae60", link:"#"},
                {exam:"BEPC 2024", color:"#2980b9", link:"#"},
                {exam:"BAC 2024", color:"#c0392b", link:"#"}*/
            ];
        }

        list.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            let imgUrl = item.image || CONFIG.images.trophy;

            card.innerHTML = `
                <div class="card-header" style="background: linear-gradient(135deg, var(--bg-panel), ${item.color}33);">
                    <img src="${imgUrl}" class="card-img-icon" alt="Résultat">
                </div>
                <div class="card-body">
                    <div class="card-title" style="color:${item.color}">${item.exam}</div>
                    <p class="card-sub">Résultats Officiels</p>
                    <button class="btn-card" style="border-color:${item.color}; color:${item.color}" onclick="window.open('${item.link}', '_blank')">
                        CONSULTER
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    /* =========================================
       4. GESTION DU MODAL PAIEMENT
       ========================================= */
  /*  function openModal(id) {
        currentItem = globalData.sujets.find(i => i.id == id);
        if(!currentItem) return;

        document.getElementById('mTitle').innerText = `${currentItem.level} - ${currentItem.subject}`;
        document.getElementById('mPrice').innerText = currentItem.price;
        
        // Reset Form
        document.getElementById('proofFile').value = '';
        document.getElementById('fileStatus').innerText = '';
        const waBtn = document.getElementById('waBtn');
        waBtn.className = 'btn-wa';
        waBtn.innerHTML = '<i class="fab fa-whatsapp"></i> ENVOYER PREUVE';
        document.getElementById('codeInput').value = '';

        document.getElementById('modal').classList.add('active');
    }*/
    /* =========================================
   MISE À JOUR DES FONCTIONS MODAL & WHATSAPP
   ========================================= */

function openModal(id) {
    current = data.find(i => i.id == id);
    if(!current) return;
    
    document.getElementById('mTitle').innerText = `${current.level} - ${current.subject}`;
    document.getElementById('mPrice').innerText = current.price;
    
    // Réinitialiser le champ référence au lieu du fichier
    document.getElementById('paymentRef').value = ''; 
    
    const waBtn = document.getElementById('waBtn');
    waBtn.className = 'btn-wa ready'; // Le bouton est toujours actif maintenant
    waBtn.innerHTML = '<i class="fab fa-whatsapp"></i> ENVOYER RÉFÉRENCE';
    
    document.getElementById('codeInput').value = '';
    document.getElementById('modal').classList.add('active');
}

// Fonction modifiée pour envoyer la référence texte
function sendToWhatsApp() {
    if(!current) return;
    
    // Récupération de la référence saisie
    const ref = document.getElementById('paymentRef').value.trim();
    
    if(ref === "") {
        alert("Veuillez entrer la référence de la transaction mobile money.");
        return;
    }

    const msg = `Bonjour Admin,\nJe souhaite débloquer le document :\n*${current.level} - ${current.subject}*\nPrix: ${current.price}.\n\nVoici ma référence de paiement : *${ref}*`;
    
    const url = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}

// Vous pouvez supprimer la fonction handleFile() car elle n'est plus utilisée.

    function closeModal() { document.getElementById('modal').classList.remove('active'); }

  /*  function handleFile() {
        const file = document.getElementById('proofFile').files[0];
        if(file) {
            document.getElementById('fileStatus').innerText = "Image chargée : " + file.name;
            const btn = document.getElementById('waBtn');
            btn.className = 'btn-wa ready';
            btn.innerHTML = '<i class="fab fa-whatsapp"></i> ENVOYER MAINTENANT';
        }
    }

    function sendToWhatsApp() {
        if(!currentItem) return;
        const msg = `Bonjour Admin,\nJe souhaite débloquer le document :\n*${currentItem.level} - ${currentItem.subject}*\nPrix: ${currentItem.price}.\n\n(Veuillez joindre la photo de la preuve ci-dessous)`;
        const url = `https://wa.me/${CONFIG.adminPhone}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    }*/

    function verifyCode() {
        const input = document.getElementById('codeInput').value.trim();
        if(currentItem && input === currentItem.password) {
            alert("Code Valide ! Ouverture du document...");
            window.open(currentItem.link, '_blank');
            closeModal();
        } else {
            alert("Code incorrect. Vérifiez sur WhatsApp.");
        }
    }

    /* =========================================
       5. UTILITAIRES & UI
       ========================================= */
    function showLoader(show) {
        const loader = document.getElementById('loader');
        const grid = document.getElementById('grid');
        if(show) { loader.style.display = 'block'; grid.style.display = 'none'; }
        else { loader.style.display = 'none'; grid.style.display = 'grid'; }
    }

    function updateActiveBtn(btn) {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        if(btn) btn.classList.add('active');
    }

    // Recherche globale
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        
        // Recherche dans la vue active
        if(currentView === 'sujets') {
            renderSujets(globalData.sujets.filter(i => 
                i.subject.toLowerCase().includes(val) || i.level.toLowerCase().includes(val)
            ));
        } else if(currentView === 'cours') {
            renderCours(globalData.cours.filter(i => 
                i.matiere.toLowerCase().includes(val) || i.titre.toLowerCase().includes(val)
            ));
        }
    });

    // Theme Manager
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.getElementById('themeIcon').className = savedTheme==='dark'?'fas fa-moon':'fas fa-sun';
    }
    function toggleTheme() {
        const html = document.documentElement;
        const next = html.getAttribute('data-theme')==='dark'?'light':'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        document.getElementById('themeIcon').className = next==='dark'?'fas fa-moon':'fas fa-sun';
    }

    // PWA & Menu
    function toggleMenu() { 
        document.getElementById('sidebar').classList.toggle('active'); 
        /*document.querySelector('.overlay').classList.toggle('active'); */
    }
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });
    function installPWA() { if(deferredPrompt) deferredPrompt.prompt(); }
    function initPWA() { if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js'); }

    // Slider Logic (Simplifiée)
    let slideIdx = 0;
    async function loadPubs() {
        try {
            const res = await fetch(CONFIG.api.pubs);
            const data = await res.json();
            renderSlider(data.length ? data : FALLBACK_PUBS);
        } catch { renderSlider(FALLBACK_PUBS); }
    }
    function renderSlider(slides) {
        const container = document.getElementById('heroSection');
        if(!container) return;
        
        // HTML Structure
        let html = '';
        slides.forEach((s, i) => {
            const img = s.image && s.image.length > 5 ? s.image : FALLBACK_PUBS[0].image;
            html += `
            <div class="hero-slide ${i===0?'active':''}" style="background-image:url('${img}')">
                <div class="hero-overlay"></div>
                <div class="hero-content">
                    <h2>${s.title}</h2><p>${s.description}</p>
                    <a href="${s.link}" class="hero-cta">${s.buttonText||'VOIR'}</a>
                </div>
            </div>`;
        });
        // Controls
        html += `<div class="hero-controls"><button class="hero-btn" onclick="plusSlides(-1)">&#10094;</button><button class="hero-btn" onclick="plusSlides(1)">&#10095;</button></div>`;
        container.innerHTML = html;
        
        // Auto Play
        setInterval(() => plusSlides(1), 5000);
    }
    function plusSlides(n) {
        const slides = document.getElementsByClassName("hero-slide");
        if(slides.length < 2) return;
        slides[slideIdx].classList.remove("active");
        slideIdx = (slideIdx + n + slides.length) % slides.length;
        slides[slideIdx].classList.add("active");
    }
    

    // Start
    init();
