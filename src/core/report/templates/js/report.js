document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            document.querySelector('.tab-container').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        });
    });
    
    // Keyboard navigation for tabs
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            const activeTab = document.querySelector('.tab-btn.active');
            const tabIndex = Array.from(tabButtons).indexOf(activeTab);
            
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    tabButtons[0].click();
                    break;
                case '2':
                    e.preventDefault();
                    if (tabButtons[1]) tabButtons[1].click();
                    break;
                case '3':
                    e.preventDefault();
                    if (tabButtons[2]) tabButtons[2].click();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    const prevIndex = tabIndex > 0 ? tabIndex - 1 : tabButtons.length - 1;
                    tabButtons[prevIndex].click();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    const nextIndex = tabIndex < tabButtons.length - 1 ? tabIndex + 1 : 0;
                    tabButtons[nextIndex].click();
                    break;
            }
        }
    });

    // Add scroll to top functionality
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '↑';
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
    `;
    
    document.body.appendChild(scrollToTopBtn);
    
    // Show/hide scroll to top button
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.opacity = '1';
            scrollToTopBtn.style.visibility = 'visible';
        } else {
            scrollToTopBtn.style.opacity = '0';
            scrollToTopBtn.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top functionality
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Add animation to stat cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);
    
    // Observe all stat cards and sections
    document.querySelectorAll('.stat-card, .section').forEach(el => {
        observer.observe(el);
    });
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .scroll-to-top:hover {
            background: #5a67d8 !important;
            transform: translateY(-2px);
        }
        
        .badge {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .stat-card {
            opacity: 0;
            transform: translateY(30px);
        }
        
        .section {
            opacity: 0;
            transform: translateY(30px);
        }
        
        .tab-btn {
            position: relative;
        }
        
        .tab-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.1);
            transform: scaleX(0);
            transition: transform 0.3s ease;
            transform-origin: left;
        }
        
        .tab-btn:hover::before {
            transform: scaleX(1);
        }
        
        .package-link {
            transition: all 0.2s ease;
        }
        
        .package-link:hover {
            transform: translateX(3px);
        }
        
        .package-link strong {
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
    
    // Add table sorting functionality
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        const headers = table.querySelectorAll('th');
        headers.forEach((header, index) => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => sortTable(table, index));
        });
    });
    
    function sortTable(table, column) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        const sortedRows = rows.sort((a, b) => {
            const aText = a.cells[column].textContent.trim();
            const bText = b.cells[column].textContent.trim();
            
            // Try to parse as numbers first
            const aNum = parseFloat(aText);
            const bNum = parseFloat(bText);
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return aNum - bNum;
            }
            
            // Fall back to string comparison
            return aText.localeCompare(bText);
        });
        
        // Clear tbody and append sorted rows
        tbody.innerHTML = '';
        sortedRows.forEach(row => tbody.appendChild(row));
    }
    
    // Style package links
    document.querySelectorAll('.package-link').forEach(packageLink => {
        packageLink.style.textDecoration = 'none';
        packageLink.style.color = '#667eea';
        packageLink.style.fontWeight = 'bold';
        packageLink.title = 'Click to view package on npm';
        
        packageLink.addEventListener('mouseenter', function() {
            this.style.textDecoration = 'underline';
            this.style.color = '#5a67d8';
        });
        
        packageLink.addEventListener('mouseleave', function() {
            this.style.textDecoration = 'none';
            this.style.color = '#667eea';
        });
    });
    
    // Add keyboard shortcuts help tooltip
    const helpTooltip = document.createElement('div');
    helpTooltip.innerHTML = `
        <div style="position: fixed; bottom: 80px; right: 20px; background: rgba(0, 0, 0, 0.8); color: white; padding: 10px; border-radius: 8px; font-size: 0.8rem; opacity: 0; visibility: hidden; transition: all 0.3s ease; z-index: 1001;" id="keyboard-help">
            <strong>Keyboard Shortcuts:</strong><br>
            Ctrl/Cmd + 1, 2, 3: Switch tabs<br>
            Ctrl/Cmd + ←/→: Navigate tabs
        </div>
    `;
    document.body.appendChild(helpTooltip);
    
    // Show help on first visit
    setTimeout(() => {
        const help = document.getElementById('keyboard-help');
        help.style.opacity = '1';
        help.style.visibility = 'visible';
        
        setTimeout(() => {
            help.style.opacity = '0';
            help.style.visibility = 'hidden';
        }, 3000);
    }, 1000);
}); 