document.addEventListener('DOMContentLoaded', () => {

    // --- Header Shrink on Scroll ---
    const header = document.querySelector('.header');
    const scrollThreshold = 50; // pixels to scroll before shrinking

    window.addEventListener('scroll', () => {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Data Source (Regionalizado para Corrientes Capital) ---
    // --- Data Source ---
    let properties = [];

    async function fetchProperties() {
        try {
            // Check if supabase is initialized
            if (!window.supabaseClient) {
                console.error("Supabase client not initialized");
                return;
            }

            const { data, error } = await window.supabaseClient
                .from('properties')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            properties = data;
            // Normalize data for render if needed (db columns match JS props mostly)
            // DB: image_url, JS: image. We'll handle this in render.

            // Render after fetching
            renderProperties(currentFilter);

        } catch (error) {
            console.error('Error fetching properties:', error);
            propertiesGrid.innerHTML = '<div class="error-msg">Error al cargar propiedades. Por favor intente más tarde.</div>';
        }
    }

    // --- State ---
    let currentFilter = {
        operation: 'buy', // 'buy', 'rent', or 'favorites'
        property_type: '',
        location: ''
    };

    let favorites = JSON.parse(localStorage.getItem('jm_favorites')) || [];

    // --- DOM Elements ---
    const propertiesGrid = document.querySelector('.properties-grid');
    const searchTabs = document.querySelectorAll('.search-tab');
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
    const searchSelect = document.querySelector('.search-select');
    const modal = document.getElementById('propertyModal');
    const closeModal = document.querySelector('.close-modal');
    const favoritesBtn = document.getElementById('favoritesBtn');

    // Modal Views
    const modalDetails = document.getElementById('modalDetails');
    const modalForm = document.getElementById('modalForm');
    const formSuccess = document.getElementById('formSuccess');
    const contactAgentBtn = document.getElementById('contactAgentBtn');
    const cancelContactBtn = document.getElementById('cancelContactBtn');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');
    const contactForm = document.getElementById('contactForm');

    // --- Functions ---

    // Función para formatear precios mejor y regionalmente
    function formatPrice(price, currency, operation) {
        // Default to USD if currency not specified
        const currencyCode = currency || 'USD';
        const isARS = currencyCode === 'ARS';
        let formattedPrice = price.toLocaleString('es-AR', {
            style: 'currency',
            currency: isARS ? 'ARS' : 'USD',
            minimumFractionDigits: isARS ? 0 : 2,
            maximumFractionDigits: isARS ? 0 : 2
        });

        // Ajuste para mostrar el símbolo de moneda correctamente en el formato
        if (isARS) {
            formattedPrice = formattedPrice.replace('ARS', '$');
        } else {
            formattedPrice = formattedPrice.replace('USD', 'USD ');
        }

        const suffix = operation === 'rent' ? ' / mes' : '';

        return formattedPrice + suffix;
    }

    function saveFavorites() {
        localStorage.setItem('jm_favorites', JSON.stringify(favorites));
    }

    function toggleFavorite(id, event) {
        event.stopPropagation(); // Prevent modal opening

        const index = favorites.indexOf(id);
        if (index === -1) {
            favorites.push(id);
        } else {
            favorites.splice(index, 1);
        }
        saveFavorites();

        // Re-render to update icons or remove from list if in favorites view
        renderProperties(currentFilter);
    }

    function showLoading() {
        propertiesGrid.innerHTML = `
            <div class="loading-container">
                <div class="loader"></div>
            </div>
        `;
    }

    function hideLoading() {
        // Content will be overwritten by render logic
    }

    function renderProperties(filter) {
        showLoading();

        setTimeout(() => {
            propertiesGrid.innerHTML = '';

            let filteredProps = properties;

            if (filter.operation === 'favorites') {
                filteredProps = properties.filter(prop => favorites.includes(prop.id));
            } else {
                filteredProps = properties.filter(prop => {
                    const matchOperation = prop.type === filter.operation;
                    const matchPropertyType = filter.property_type ? prop.property_type === filter.property_type : true;
                    const matchLocation = filter.location ? prop.location.toLowerCase().includes(filter.location.toLowerCase()) : true;
                    return matchOperation && matchPropertyType && matchLocation;
                });
            }

            if (filteredProps.length === 0) {
                const msg = filter.operation === 'favorites'
                    ? 'No tenés propiedades favoritas guardadas.'
                    : 'No se encontraron propiedades con esos criterios.';
                propertiesGrid.innerHTML = `<div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">${msg}</div>`;
                return;
            }

            filteredProps.forEach((prop, index) => {
                const isFav = favorites.includes(prop.id);
                const card = document.createElement('article');
                card.className = 'property-card fade-in';
                card.style.animationDelay = `${index * 0.05}s`;

                // Uso de la nueva función de formato de precio
                const priceDisplay = formatPrice(prop.price, prop.currency, prop.operation);

                const imgGradient = prop.operation === 'rent' ? 'linear-gradient(45deg, #e6e6e6, #f0f0f0)' : 'linear-gradient(45deg, #f0f0f0, #e6e6e6)';

                const imageSrc = prop.image_url || prop.image; // Support both DB (image_url) and legacy (image)

                let imageHtml;
                if (imageSrc) {
                    imageHtml = `<div class="property-image-container" style="height: 250px; overflow: hidden;">
                                    <img src="${imageSrc}" alt="${prop.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;">
                                 </div>`;
                } else {
                    imageHtml = `<div class="placeholder-img" style="background: ${imgGradient}; height: 250px; display: flex; align-items: center; justify-content: center; color: #999;">
                                    <i class="fas fa-image fa-3x"></i>
                                 </div>`;
                }

                card.innerHTML = `
                    <div class="property-image">
                        <div class="property-tag ${prop.type === 'rent' ? 'rent' : ''}">${prop.type === 'rent' ? 'Alquiler' : 'Venta'}</div>
                        <button class="property-favorite ${isFav ? 'active' : ''}" onclick="window.toggleFavorite(${prop.id}, event)">
                            <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                        ${imageHtml}
                        <div class="property-price">${priceDisplay}</div>
                    </div>
                    <div class="property-content">
                        <h3 class="property-title">${prop.title}</h3>
                        <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${prop.location}</p>
                        <div class="property-features">
                            ${(prop.bedrooms || prop.beds) > 0 ? `<span><i class="fas fa-bed"></i> ${prop.bedrooms || prop.beds} Dorm</span>` : ''}
                            ${(prop.bathrooms || prop.baths) > 0 ? `<span><i class="fas fa-bath"></i> ${prop.bathrooms || prop.baths} Baños</span>` : ''}
                            <span><i class="fas fa-ruler-combined"></i> ${prop.size_m2 || prop.size} m²</span>
                        </div>
                    </div>
                `;

                card.addEventListener('click', () => openModal(prop));
                propertiesGrid.appendChild(card);
            });
        }, 500); // Simulate 500ms network delay
    }

    // Expose toggleFavorite to window so onclick works
    window.toggleFavorite = toggleFavorite;

    function openModal(prop) {
        if (!modal) return;

        // Reset Views
        modalDetails.style.display = 'block';
        modalForm.classList.remove('active');
        formSuccess.style.display = 'none';

        // Uso de la nueva función de formato de precio
        const priceDisplay = formatPrice(prop.price, prop.currency, prop.operation);

        document.getElementById('modalTitle').textContent = prop.title;
        document.getElementById('modalPrice').textContent = priceDisplay;
        document.getElementById('modalLocation').textContent = prop.location;
        document.getElementById('modalDescription').textContent = prop.description;

        // Handle Image / Carousel
        const placeholder = document.querySelector('.modal-image-placeholder');
        // Clean previous content
        placeholder.innerHTML = '';

        // Normalize images
        let images = [];
        if (prop.images && Array.isArray(prop.images) && prop.images.length > 0) {
            images = prop.images;
        } else if (prop.image_url) {
            images = [prop.image_url];
        } else if (prop.image) {
            images = [prop.image];
        }

        if (images.length > 1) {
            // Build Carousel
            let slidesHtml = '';
            let dotsHtml = '';

            images.forEach((img, index) => {
                slidesHtml += `
                    <div class="carousel-slide">
                        <img src="${img}" alt="${prop.title} - Foto ${index + 1}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                `;
                dotsHtml += `<div class="carousel-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>`;
            });

            placeholder.innerHTML = `
                <div class="carousel-track" style="width: ${images.length * 100}%">
                    ${slidesHtml}
                </div>
                <button class="carousel-btn prev"><i class="fas fa-chevron-left"></i></button>
                <button class="carousel-btn next"><i class="fas fa-chevron-right"></i></button>
                <div class="carousel-dots">
                    ${dotsHtml}
                </div>
            `;

            // Initialize Carousel Logic
            // Small timeout to ensure DOM is ready inside modal
            setTimeout(() => initCarousel(placeholder, images.length), 0);

        } else if (images.length === 1) {
            // Single Image
            placeholder.innerHTML = `<img src="${images[0]}" alt="${prop.title}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            // No Image
            placeholder.innerHTML = '<i class="fas fa-image fa-5x"></i>';
        }

        const featuresHtml = `
            ${(prop.bedrooms || prop.beds) > 0 ? `<span><i class="fas fa-bed"></i> ${prop.bedrooms || prop.beds} Dormitorios</span>` : ''}
            ${(prop.bathrooms || prop.baths) > 0 ? `<span><i class="fas fa-bath"></i> ${prop.bathrooms || prop.baths} Baños</span>` : ''}
            <span><i class="fas fa-ruler-combined"></i> ${prop.size_m2 || prop.size} m² Totales</span>
            <span><i class="fas fa-check-circle"></i> ${prop.type.charAt(0).toUpperCase() + prop.type.slice(1)}</span>
        `;
        document.getElementById('modalFeatures').innerHTML = featuresHtml;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function initCarousel(container, totalSlides) {
        const track = container.querySelector('.carousel-track');
        const nextBtn = container.querySelector('.next');
        const prevBtn = container.querySelector('.prev');
        const dots = container.querySelectorAll('.carousel-dot');

        let currentSlide = 0;

        function updateSlide() {
            track.style.transform = `translateX(-${currentSlide * (100 / totalSlides)}%)`;
            dots.forEach((dot, index) => {
                if (index === currentSlide) dot.classList.add('active');
                else dot.classList.remove('active');
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentSlide = (currentSlide + 1) % totalSlides;
                updateSlide();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                updateSlide();
            });
        }

        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                currentSlide = parseInt(dot.getAttribute('data-index'));
                updateSlide();
            });
        });
    }

    function closeModalFunc() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // --- Helper Functions for Validation ---
    function showError(input, message) {
        const group = input.parentElement;
        group.classList.add('error');
        let errorDisplay = group.querySelector('.error-message');
        if (!errorDisplay) {
            errorDisplay = document.createElement('div');
            errorDisplay.className = 'error-message';
            group.appendChild(errorDisplay);
        }
        errorDisplay.textContent = message;
    }

    function clearErrors(form) {
        form.querySelectorAll('.form-group.error').forEach(g => g.classList.remove('error'));
        form.querySelectorAll('.error-message').forEach(e => e.remove());
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validateForm(inputs, formElement) {
        clearErrors(formElement);
        let isValid = true;

        inputs.forEach(inputDef => {
            const input = formElement.querySelector(`#${inputDef.id}`);
            if (!input) return;

            const value = input.value.trim();
            let error = false;

            // Check custom validator function
            if (inputDef.validator) {
                if (!inputDef.validator(value)) {
                    error = true;
                }
            }
            // Check for emptiness if no specific validator is provided
            else if (value === '') {
                error = true;
            }

            if (error) {
                showError(input, inputDef.message);
                isValid = false;
            }
        });

        return isValid;
    }


    // --- Event Listeners ---

    // Mobile Menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // --- Autocomplete Logic (Mantener la funcionalidad) ---
    if (searchInput) {
        // 1. Create Suggestions List DOM
        const suggestionsList = document.createElement('div');
        suggestionsList.className = 'suggestions-list';
        searchInput.parentElement.appendChild(suggestionsList);

        let debounceTimeout;

        // 3. Input Event Listener
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();

            clearTimeout(debounceTimeout);
            suggestionsList.innerHTML = '';

            if (query.length < 3) { // Start searching after 3 chars
                suggestionsList.classList.remove('active');
                return;
            }

            // Debounce API calls
            debounceTimeout = setTimeout(() => {
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`)
                    .then(response => response.json())
                    .then(data => {
                        suggestionsList.innerHTML = '';

                        if (data.length > 0) {
                            data.forEach(place => {
                                const item = document.createElement('div');
                                item.className = 'suggestion-item';

                                // Format display text
                                const displayName = place.display_name;
                                // Simple bolding of matched query (case insensitive)
                                const regex = new RegExp(`(${query})`, 'gi');
                                const highlightedName = displayName.replace(regex, '<strong>$1</strong>');

                                item.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${highlightedName}`;

                                item.addEventListener('click', () => {
                                    searchInput.value = displayName; // Or place.name
                                    suggestionsList.classList.remove('active');
                                    currentFilter.location = displayName;
                                });

                                suggestionsList.appendChild(item);
                            });
                            suggestionsList.classList.add('active');
                        } else {
                            suggestionsList.classList.remove('active');
                        }
                    })
                    .catch(err => console.error('Error fetching locations:', err));
            }, 300); // 300ms delay
        });

        // 4. Close on Click Outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
                suggestionsList.classList.remove('active');
            }
        });

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim().length > 0) {
                searchInput.dispatchEvent(new Event('input'));
            }
        });
    }

    // Search Tabs & Favorites Logic (Mejorada)
    searchTabs.forEach(tab => {
        tab.addEventListener('click', () => {

            searchTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const isFavorites = tab.id === 'favoritesBtn';

            if (isFavorites) {
                currentFilter.operation = 'favorites';
                // Deshabilitar filtros cuando se está en Favoritos
                if (searchInput) {
                    searchInput.disabled = true;
                    searchInput.value = '';
                    currentFilter.location = '';
                }
                if (searchSelect) {
                    searchSelect.disabled = true;
                    searchSelect.value = '';
                    currentFilter.type = '';
                }
            } else {
                const type = tab.getAttribute('data-type');
                currentFilter.operation = type;
                // Habilitar filtros si no se está en Favoritos
                if (searchInput) searchInput.disabled = false;
                if (searchSelect) searchSelect.disabled = false;
            }

            renderProperties(currentFilter);
        });
    });

    // --- Search Form ---
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const locationValue = searchInput.value.trim();
            const typeValue = document.getElementById('propertyType').value;

            // Si estábamos en favoritos, volvemos a comprar/alquilar con el filtro
            if (currentFilter.operation === 'favorites') {
                currentFilter.operation = 'buy';
                searchTabs.forEach(t => t.classList.remove('active'));
                document.querySelector('[data-type="buy"]').classList.add('active');
            }

            currentFilter.location = locationValue;
            currentFilter.property_type = typeValue;

            renderProperties(currentFilter);

            // Scroll to properties section
            document.getElementById('propiedades').scrollIntoView({ behavior: 'smooth' });
        });

        searchSelect.addEventListener('change', () => {
            if (currentFilter.operation === 'favorites') return;
            currentFilter.type = searchSelect.value;
            renderProperties(currentFilter);
        });
    }

    // Modal Interactions
    if (closeModal) closeModal.addEventListener('click', closeModalFunc);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModalFunc();
    });

    // Contact Form Logic (Refactorizado con la nueva función validateForm)
    if (contactAgentBtn) {
        contactAgentBtn.addEventListener('click', () => {
            modalDetails.style.display = 'none';
            modalForm.classList.add('active');
            clearErrors(contactForm); // Limpiar errores al abrir
        });
    }

    if (cancelContactBtn) {
        cancelContactBtn.addEventListener('click', () => {
            modalForm.classList.remove('active');
            modalDetails.style.display = 'block';
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Definición de validación para el formulario del modal
            const validationInputs = [
                { id: 'name', message: 'Por favor ingresá tu nombre' },
                { id: 'email', message: 'Por favor ingresá un email válido', validator: isValidEmail },
                { id: 'phone', message: 'Por favor ingresá un teléfono válido (mínimo 8 números)', validator: (v) => v.trim().length >= 8 }
            ];

            if (!validateForm(validationInputs, contactForm)) return;

            // Simulate API call
            const btn = contactForm.querySelector('.contact-agent-btn');
            const originalText = btn.textContent;
            btn.classList.add('btn-loading');
            btn.disabled = true;

            setTimeout(() => {
                modalForm.classList.remove('active');
                formSuccess.style.display = 'block';
                contactForm.reset();
                btn.classList.remove('btn-loading');
                btn.textContent = originalText;
                btn.disabled = false;
            }, 1500);
        });
    }

    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', closeModalFunc);
    }

    // Scroll Animations
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        section.classList.add('scroll-hidden');
        observer.observe(section);
    });

    // --- Handle URL Search Params ---
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');

    if (typeParam) {
        if (typeParam === 'buy' || typeParam === 'rent') {
            currentFilter.operation = typeParam;

            // Update active tab UI
            searchTabs.forEach(t => t.classList.remove('active'));
            const activeTab = document.querySelector(`.search-tab[data-type="${typeParam}"]`);
            if (activeTab) activeTab.classList.add('active');
        }
    }

    // --- Initial Render ---
    if (propertiesGrid) {
        // renderProperties(currentFilter); // Removed, fetched by async function
        fetchProperties();
    }
    // --- Scroll to Top Button Logic ---
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");

    if (scrollToTopBtn) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add("show");
            } else {
                scrollToTopBtn.classList.remove("show");
            }
        });

        scrollToTopBtn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

});