document.addEventListener('DOMContentLoaded', () => {
    // ═══════════════════════════════════════
    // NAVBAR & MOBILE MENU
    // ═══════════════════════════════════════
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    // Sticky Navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navLinks.classList.toggle('open');
    });

    // Close Mobile Menu on Link Click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navLinks.classList.remove('open');
        });
    });

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Adjust scroll position for fixed navbar
                const navbarHeight = navbar.offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ═══════════════════════════════════════
    // SCROLL REVEAL & ANIMATIONS
    // ═══════════════════════════════════════
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // If it's the chart wrapper, trigger the bar animations
                if (entry.target.id === 'chart-wrapper') {
                    animateChartBars();
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Chart Animation
    function animateChartBars() {
        const barRows = document.querySelectorAll('.chart-bar-row');
        barRows.forEach((row, index) => {
            setTimeout(() => {
                const targetPct = row.getAttribute('data-pct');
                const bar = row.querySelector('.chart-bar');
                const pctLabel = row.querySelector('.chart-pct');
                
                bar.style.width = targetPct + '%';
                
                // Animate numbers
                let currentPct = 0;
                const maxPct = parseInt(targetPct);
                const duration = 1000;
                const startTime = performance.now();
                
                function animateNumber(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Easing out cubic
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    currentPct = Math.round(maxPct * easeOut);
                    pctLabel.innerText = currentPct + '%';
                    
                    if (progress < 1) {
                        requestAnimationFrame(animateNumber);
                    } else {
                        pctLabel.innerText = targetPct + '%';
                    }
                }
                requestAnimationFrame(animateNumber);
                
            }, index * 100); // Stagger animation
        });
    }

    // ═══════════════════════════════════════
    // ANALYZER LOGIC
    // ═══════════════════════════════════════
    const contractInput = document.getElementById('contract-input');
    const charCount = document.getElementById('char-count');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultsArea = document.getElementById('results-area');
    const placeholderState = document.getElementById('placeholder-state');
    const clauseGrid = document.getElementById('clause-grid');
    const entitiesGrid = document.getElementById('entities-grid');

    // Update Character Count
    contractInput.addEventListener('input', () => {
        const count = contractInput.value.length;
        charCount.innerText = `${count} character${count !== 1 ? 's' : ''}`;
    });

    // Mock Data Models for Clause Types based on requirements
    const CLAUSE_DEFINITIONS = [
        { id: 'party', label: 'Party Names', icon: '🏢', theme: 'blue' },
        { id: 'effective_date', label: 'Effective Date', icon: '📅', theme: 'green' },
        { id: 'expiry_date', label: 'Expiry Date', icon: '⏳', theme: 'orange' },
        { id: 'payment', label: 'Payment Amount', icon: '💰', theme: 'gold' },
        { id: 'gov_law', label: 'Governing Law', icon: '⚖️', theme: 'purple' },
        { id: 'confidentiality', label: 'Confidentiality Clause', icon: '🔒', theme: 'red' },
        { id: 'termination', label: 'Termination Clause', icon: '🛑', theme: 'teal' },
        { id: 'obligations', label: 'Obligations', icon: '📋', theme: 'navy'}
    ];

    // Analyze Button Click Handler
    analyzeBtn.addEventListener('click', () => {
        const text = contractInput.value.trim();
        
        if (!text) {
            alert('Please paste some contract text to analyze.');
            contractInput.focus();
            return;
        }

        // Show loading state
        const originalBtnContent = analyzeBtn.innerHTML;
        analyzeBtn.innerHTML = '<span class="spinner"></span> Analyzing...';
        analyzeBtn.disabled = true;

        // Simulate API call processing delay (1.5 - 2.5s)
        const processTime = Math.floor(Math.random() * 1000) + 1500;
        
        setTimeout(() => {
            // Restore button
            analyzeBtn.innerHTML = originalBtnContent;
            analyzeBtn.disabled = false;
            
            // Generate Mock Results based on input text
            const results = analyzeTextMock(text);
            
            // Render Results
            renderResults(results);
            
            // Show Results Area
            placeholderState.style.display = 'none';
            resultsArea.style.display = 'block';
            
            // Scroll slightly to results
            const offset = resultsArea.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: offset, behavior: 'smooth' });
            
        }, processTime);
    });

    // Mock Analysis Logic - extracts basic patterns for demo purposes
    function analyzeTextMock(text) {
        const lowerText = text.toLowerCase();
        
        // Mock Clause Detection
        const clauses = {};
        
        // 1. Party Names (Look for capitalized words near 'between' or 'Inc/Corp/LLC')
        if (text.match(/between (.*?) and (.*?)/i)) {
            const match = text.match(/between ([A-Z][\w\s]+?)(?:,|and|\() /i);
            const match2 = text.match(/and ([A-Z][\w\s]+?)(?:,|and|\() /i);
            const parties = [];
            if (match && match[1].length > 3) parties.push(match[1].trim());
            if (match2 && match2[1].length > 3) parties.push(match2[1].trim());
            
            if (parties.length > 0) {
                 clauses['party'] = parties.join(' · ');
            } else {
                 clauses['party'] = "Acme Corp · TechSolutions Inc"; // Fallback if match fails but 'between' exists
            }
        } else if (text.match(/\b(Inc\.|Corp\.|LLC|Ltd\.)\b/i)) {
            const matches = [...text.matchAll(/([A-Z][\w\s]+?)\s+(Inc\.|Corp\.|LLC|Ltd\.)/g)];
            if (matches.length > 0) {
                clauses['party'] = matches.map(m => m[0].trim()).slice(0, 2).join(' · ');
            }
        }

        // 2. Dates
        const dateRegex = /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,\s+\d{4}/ig;
        const dates = [...text.matchAll(dateRegex)].map(m => m[0]);
        
        if (lowerText.includes('effective date') && dates.length > 0) {
            clauses['effective_date'] = dates[0];
        } else if (dates.length > 0) {
             // Just guess the first date is effective
            clauses['effective_date'] = dates[0];
        }

        if ((lowerText.includes('expire') || lowerText.includes('terminate')) && dates.length > 1) {
             clauses['expiry_date'] = dates[dates.length - 1]; // Guess last date
        }

        // 3. Payment
        const moneyRegex = /\$[\d,]+(?:\.\d{2})?(?:\s*(?:per|a)\s*(?:month|year|hour|day))?/i;
        const moneyMatch = text.match(moneyRegex);
        if (moneyMatch) {
            clauses['payment'] = moneyMatch[0];
        }

        // 4. Governing Law
        if (lowerText.includes('governed by') || lowerText.includes('laws of')) {
            const stateMatch = text.match(/State of ([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/);
            if (stateMatch) {
                clauses['gov_law'] = `State of ${stateMatch[1]}`;
            } else {
                clauses['gov_law'] = "Detected (Generic)";
            }
        }

        // 5. Confidentiality
        if (lowerText.includes('confidential') || lowerText.includes('non-disclosure')) {
             clauses['confidentiality'] = "Standard Confidentiality detected";
        }

        // 6. Termination
        if (lowerText.includes('terminate') || lowerText.includes('termination')) {
             const daysMatch = text.match(/(\d+)\s+days.*notice/i);
             if (daysMatch) {
                 clauses['termination'] = `${daysMatch[1]} days written notice`;
             } else {
                 clauses['termination'] = "Termination rights detected";
             }
        }
        
        // 7. Obligations
        if (lowerText.includes('shall') || lowerText.includes('agrees to')) {
            clauses['obligations'] = "Standard performance obligations found";
        }

        // Mock NER Entities
        const entities = [];
        
        // Count typical entities based on rough heuristic
        const orgCount = (text.match(/\b(Inc\.|Corp\.|LLC|Company|Ltd)\b/g) || []).length * 2 || (clauses['party'] ? 2 : 0);
        if (orgCount > 0) entities.push({ type: 'ORG', count: orgCount, examples: clauses['party'] ? clauses['party'].split(' · ') : ['Acme Corp'] });
        
        const dateCount = dates.length || (clauses['effective_date'] ? 1 : 0);
        if (dateCount > 0) entities.push({ type: 'DATE', count: dateCount + 1, examples: dates.slice(0, 2) });
        
        const moneyCount = (text.match(/\$/g) || []).length;
        if (moneyCount > 0) entities.push({ type: 'MONEY', count: moneyCount, examples: moneyMatch ? [moneyMatch[0]] : [] });
        
        // Guess a location
        const gpeMatch = text.match(/\b(New York|California|London|Delaware|Texas)\b/i);
        if (gpeMatch || clauses['gov_law']) {
             entities.push({ type: 'GPE', count: 1, examples: gpeMatch ? [gpeMatch[0]] : ['New York']});
        }

        return { clauses, entities };
    }

    // Render logic
    function renderResults(data) {
        // Render Clauses
        clauseGrid.innerHTML = '';
        let foundCount = 0;

        CLAUSE_DEFINITIONS.forEach((def, index) => {
            const value = data.clauses[def.id];
            const isFound = value !== undefined;
            const displayValue = isFound ? value : 'Not Detected';
            const valueClass = isFound ? 'tile-value' : 'tile-value not-detected';
            
            // Only use theme color if found, otherwise grey out slightly
            const themeClass = isFound ? `tile-${def.theme}` : 'tile-navy';
            
            if (isFound) foundCount++;

            const tileHTML = `
                <div class="clause-tile ${themeClass}" style="animation-delay: ${index * 0.05}s">
                    <div class="tile-header">
                        <span class="tile-icon">${def.icon}</span>
                        <span class="tile-label">${def.label}</span>
                    </div>
                    <div class="${valueClass}">${displayValue}</div>
                </div>
            `;
            clauseGrid.insertAdjacentHTML('beforeend', tileHTML);
        });

        // Update badge
        const badge = document.getElementById('clauses-found-badge');
        badge.innerText = `${foundCount} of 8 clauses detected`;
        if (foundCount === 0) {
             badge.style.backgroundColor = 'var(--gray-600)';
        } else {
             badge.style.backgroundColor = 'var(--navy)';
        }

        // Render NER Entities
        entitiesGrid.innerHTML = '';
        if (data.entities.length === 0) {
             entitiesGrid.innerHTML = '<p style="color:var(--gray-400); font-size: 0.9rem;">No named entities clearly identified.</p>';
        } else {
             data.entities.forEach(ent => {
                 let examplesHtml = '';
                 if (ent.examples && ent.examples.length > 0) {
                     examplesHtml = `<div class="entity-list">
                         ${ent.examples.map(ex => `<span class="entity-item">${ex}</span>`).join('')}
                     </div>`;
                 }
                 
                 const entClass = ent.type.toLowerCase();
                 const cardHTML = `
                     <div class="entity-card">
                         <div class="entity-type ${entClass}">${ent.type} ×${ent.count}</div>
                         ${examplesHtml}
                     </div>
                 `;
                 entitiesGrid.insertAdjacentHTML('beforeend', cardHTML);
             });
        }
    }
});
