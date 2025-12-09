// ===== SPA Router =====
// Hash-based routing system for single page application

class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.previousRoute = null;
        this.beforeEach = null;
        this.afterEach = null;
        this.history = [];
        this.historyIndex = -1;
        this.isReady = false;
        
        // Listen for hash changes
        window.addEventListener('hashchange', (e) => {
            if (this.isReady) {
                this.handleRoute(e);
            }
        });
    }
    
    // Mark router as ready (call after routes are registered)
    ready() {
        this.isReady = true;
        return this;
    }

    // Register a route
    register(path, handler, options = {}) {
        this.routes.set(path, { handler, options });
        return this;
    }

    // Navigate to a route
    navigate(path, params = {}, replace = false) {
        if (replace) {
            window.history.replaceState(params, '', `#${path}`);
        } else {
            window.history.pushState(params, '', `#${path}`);
        }
        this.handleRoute();
    }

    // Handle current route
    async handleRoute(event) {
        // Wait until routes are registered
        if (this.routes.size === 0) {
            console.log('No routes registered yet');
            return;
        }
        
        const hash = window.location.hash.slice(1) || '/dashboard';
        const [path, queryString] = hash.split('?');
        const params = this.parseQueryString(queryString);
        
        // Find matching route
        let matchedRoute = null;
        let routeParams = {};
        
        for (const [routePath, routeConfig] of this.routes) {
            const match = this.matchPath(routePath, path);
            if (match) {
                matchedRoute = routeConfig;
                routeParams = match.params;
                break;
            }
        }
        
        if (!matchedRoute) {
            console.log('No matching route for:', path);
            // Default to dashboard if no route found
            if (path !== '/dashboard') {
                this.navigate('/dashboard', {}, true);
            }
            return;
        }
        
        // Before navigation hook
        if (this.beforeEach) {
            const canProceed = await this.beforeEach({
                path,
                params: { ...routeParams, ...params },
                from: this.currentRoute
            });
            if (!canProceed) return;
        }
        
        // Store previous route
        this.previousRoute = this.currentRoute;
        
        // Update current route
        this.currentRoute = {
            path,
            params: { ...routeParams, ...params },
            options: matchedRoute.options
        };
        
        // Update active nav item
        this.updateNavigation(path);
        
        // Execute route handler
        try {
            await matchedRoute.handler({ ...routeParams, ...params });
        } catch (error) {
            console.error('Route handler error:', error);
        }
        
        // After navigation hook
        if (this.afterEach) {
            this.afterEach({
                path,
                params: { ...routeParams, ...params },
                from: this.previousRoute
            });
        }
    }

    // Match path with route pattern (supports :param syntax)
    matchPath(pattern, path) {
        const patternParts = pattern.split('/').filter(Boolean);
        const pathParts = path.split('/').filter(Boolean);
        
        if (patternParts.length !== pathParts.length) {
            return null;
        }
        
        const params = {};
        
        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                // Dynamic parameter
                params[patternParts[i].slice(1)] = pathParts[i];
            } else if (patternParts[i] !== pathParts[i]) {
                return null;
            }
        }
        
        return { params };
    }

    // Parse query string
    parseQueryString(queryString) {
        if (!queryString) return {};
        
        const params = {};
        const pairs = queryString.split('&');
        
        for (const pair of pairs) {
            const [key, value] = pair.split('=');
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            }
        }
        
        return params;
    }

    // Update navigation active state
    updateNavigation(path) {
        const basePath = '/' + path.split('/')[1];
        
        document.querySelectorAll('.nav-item').forEach(item => {
            const itemRoute = item.getAttribute('data-route');
            if (itemRoute) {
                const isActive = basePath === '/' + itemRoute || 
                               path === '/' + itemRoute;
                item.classList.toggle('active', isActive);
            }
        });
    }

    // Set before navigation guard
    setBeforeEach(callback) {
        this.beforeEach = callback;
        return this;
    }

    // Set after navigation callback
    setAfterEach(callback) {
        this.afterEach = callback;
        return this;
    }

    // Get current route info
    getCurrentRoute() {
        return this.currentRoute;
    }

    // Go back
    back() {
        window.history.back();
    }

    // Go forward
    forward() {
        window.history.forward();
    }
}

// Create global router instance
const router = new Router();

// Export for use
window.router = router;

