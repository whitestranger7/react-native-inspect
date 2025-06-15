document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const drawer = document.getElementById('drawer');
    const drawerToggle = document.getElementById('drawerToggle');
    const drawerClose = document.getElementById('drawerClose');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Drawer functionality
    function openDrawer() {
        drawer.classList.add('open');
        drawerOverlay.classList.add('active');
        drawerToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeDrawer() {
        drawer.classList.remove('open');
        drawerOverlay.classList.remove('active');
        drawerToggle.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Event listeners for drawer
    if (drawerToggle) {
        drawerToggle.addEventListener('click', openDrawer);
    }
    
    if (drawerClose) {
        drawerClose.addEventListener('click', closeDrawer);
    }
    
    if (drawerOverlay) {
        drawerOverlay.addEventListener('click', closeDrawer);
    }
    
    // Navigation functionality
    function switchToSection(targetSection) {
        // Remove active class from all nav items and content sections
        navItems.forEach(item => item.classList.remove('active'));
        contentSections.forEach(section => section.classList.remove('active'));
        
        // Add active class to target nav item and content section
        const targetNavItem = document.querySelector(`[data-section="${targetSection}"]`);
        const targetContentSection = document.getElementById(targetSection);
        
        if (targetNavItem) {
            targetNavItem.classList.add('active');
        }
        
        if (targetContentSection) {
            targetContentSection.classList.add('active');
        }
        
        // Close drawer on mobile after navigation
        if (window.innerWidth <= 768) {
            closeDrawer();
        }
        
        // Smooth scroll to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Update URL hash
        window.location.hash = targetSection;
    }
    
    // Navigation item click handlers
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            switchToSection(targetSection);
        });
    });
    
    // Handle direct URL hash navigation
    function handleHashNavigation() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            switchToSection(hash);
        }
    }
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashNavigation);
    
    // Handle initial page load
    handleHashNavigation();
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            const activeNavItem = document.querySelector('.nav-item.active');
            const allNavItems = Array.from(navItems);
            const currentIndex = allNavItems.indexOf(activeNavItem);
            
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    switchToSection('dependencies');
                    break;
                case '2':
                    e.preventDefault();
                    switchToSection('security');
                    break;
                case '3':
                    e.preventDefault();
                    switchToSection('react-native');
                    break;
                case '4':
                    e.preventDefault();
                    switchToSection('summary');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : allNavItems.length - 1;
                    const prevSection = allNavItems[prevIndex].getAttribute('data-section');
                    switchToSection(prevSection);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    const nextIndex = currentIndex < allNavItems.length - 1 ? currentIndex + 1 : 0;
                    const nextSection = allNavItems[nextIndex].getAttribute('data-section');
                    switchToSection(nextSection);
                    break;
            }
        }
        
        // Escape key to close drawer
        if (e.key === 'Escape') {
            closeDrawer();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeDrawer();
        }
    });
    
    // Scroll to top button
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '↑';
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
    scrollToTopBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 20px;
        cursor: pointer;
        box-shadow: var(--shadow-medium);
        opacity: 0;
        visibility: hidden;
        transition: all var(--transition-speed) ease;
        z-index: 1000;
    `;
    
    document.body.appendChild(scrollToTopBtn);
    
    // Show/hide scroll to top button
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.opacity = '1';
            scrollToTopBtn.style.visibility = 'visible';
        } else {
            scrollToTopBtn.style.opacity = '0';
            scrollToTopBtn.style.visibility = 'hidden';
        }
        
        // Add scrolling indicator
        clearTimeout(scrollTimeout);
        document.body.classList.add('scrolling');
        scrollTimeout = setTimeout(() => {
            document.body.classList.remove('scrolling');
        }, 150);
    });
    
    // Scroll to top functionality
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Enhanced hover effects for scroll button
    scrollToTopBtn.addEventListener('mouseenter', function() {
        this.style.background = 'var(--secondary-color)';
        this.style.transform = 'translateY(-2px) scale(1.05)';
    });
    
    scrollToTopBtn.addEventListener('mouseleave', function() {
        this.style.background = 'var(--primary-color)';
        this.style.transform = 'translateY(0) scale(1)';
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animations
    document.querySelectorAll('.stat-card, .content-body, .recommendations-card').forEach(el => {
        el.style.cssText += `
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        `;
        observer.observe(el);
    });
    
    // Table sorting functionality
    function sortTable(table, column, direction = 'asc') {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        rows.sort((a, b) => {
            const aValue = a.cells[column].textContent.trim();
            const bValue = b.cells[column].textContent.trim();
            
            // Handle numeric values
            if (!isNaN(aValue) && !isNaN(bValue)) {
                return direction === 'asc' ? aValue - bValue : bValue - aValue;
            }
            
            // Handle text values
            if (direction === 'asc') {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });
        
        // Remove existing rows
        rows.forEach(row => tbody.removeChild(row));
        
        // Add sorted rows
        rows.forEach(row => tbody.appendChild(row));
    }
    
    // Add sorting to tables
    document.querySelectorAll('table').forEach(table => {
        const headers = table.querySelectorAll('th');
        headers.forEach((header, index) => {
            header.style.cursor = 'pointer';
            header.style.userSelect = 'none';
            header.setAttribute('data-sort', 'asc');
            
            // Add sort indicator
            const sortIndicator = document.createElement('span');
            sortIndicator.innerHTML = ' ↕';
            sortIndicator.style.opacity = '0.5';
            header.appendChild(sortIndicator);
            
            header.addEventListener('click', function() {
                const currentSort = this.getAttribute('data-sort');
                const newSort = currentSort === 'asc' ? 'desc' : 'asc';
                
                // Reset all headers
                headers.forEach(h => {
                    h.setAttribute('data-sort', 'asc');
                    h.querySelector('span').innerHTML = ' ↕';
                    h.querySelector('span').style.opacity = '0.5';
                });
                
                // Update current header
                this.setAttribute('data-sort', newSort);
                this.querySelector('span').innerHTML = newSort === 'asc' ? ' ↑' : ' ↓';
                this.querySelector('span').style.opacity = '1';
                
                // Sort table
                sortTable(table, index, newSort);
            });
        });
    });
    
    // Enhanced package link interactions
    document.querySelectorAll('.package-link').forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(3px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
    
    // Add loading states and error handling
    function showLoading(element) {
        element.style.opacity = '0.5';
        element.style.pointerEvents = 'none';
    }
    
    function hideLoading(element) {
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';
    }
    
    // Add tooltips for badges
    document.querySelectorAll('.badge').forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            if (this.classList.contains('critical')) {
                this.title = 'Critical severity - Immediate action required';
            } else if (this.classList.contains('high')) {
                this.title = 'High severity - Should be addressed soon';
            } else if (this.classList.contains('moderate')) {
                this.title = 'Moderate severity - Consider addressing';
            } else if (this.classList.contains('low')) {
                this.title = 'Low severity - Low priority';
            }
        });
    });
    
    // Add focus management for accessibility
    function manageFocus() {
        const activeSection = document.querySelector('.content-section.active');
        if (activeSection) {
            const firstFocusable = activeSection.querySelector('a, button, input, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }
    }
    
    // Enhanced error handling for external links
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        link.addEventListener('click', function(e) {
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        });
    });
    
    // Add print styles
    const printStyles = document.createElement('style');
    printStyles.textContent = `
        @media print {
            .drawer, .mobile-header, .scroll-to-top, .drawer-overlay {
                display: none !important;
            }
            
            .main-content {
                margin-left: 0 !important;
                padding: 0 !important;
            }
            
            .content-section {
                display: block !important;
                page-break-before: always;
                padding: 20px !important;
            }
            
            .content-section:first-child {
                page-break-before: auto;
            }
            
            .section-header h1 {
                color: #000 !important;
            }
            
            .section-description {
                color: #666 !important;
            }
        }
    `;
    document.head.appendChild(printStyles);
    
    // Initialize tooltips and accessibility features
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', function() {
            // Create tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            tooltip.style.cssText = `
                position: absolute;
                background: #333;
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 0.8rem;
                z-index: 1000;
                pointer-events: none;
                white-space: nowrap;
            `;
            document.body.appendChild(tooltip);
            
            // Position tooltip
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
        });
        
        element.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
    
    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
            }, 0);
        });
    }
    
    console.log('React Native Inspect Report initialized successfully');
}); 