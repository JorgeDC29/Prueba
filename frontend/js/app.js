    /* ========================================================= */
    /* ESTADO GENERAL */
    /* ========================================================= */

    let selectedRole = 'usuario';
    let currentAccount = null;
    let heroSlideIndex = 0;

    let products = [];
    let markets = [];
    let favoriteProducts = [];

    let productSearch = '';
    let priceOrder = '';
    let selectedCategory = '';
    let dateOrder = '';
    let setOperation = 'todos';
    let companyPassword = '1234';
    let companyMarketId = 1;
    let saleModeActive = false;

    const userDashboardOptions = [
      { name: 'Inicio', section: 'inicio', icon: 'home' },
      { name: 'Productos', section: 'productos', icon: 'inventory_2' },
      { name: 'Mercados', section: 'mercados', icon: 'storefront' },
      { name: 'Favoritos', section: 'favoritos', icon: 'favorite' },
      { name: 'Perfil', section: 'perfil', icon: 'person' }
    ];

    const companyDashboardOptions = [
      { name: 'Productos', section: 'productos', icon: 'inventory_2' },
      { name: 'Modo venta', section: 'venta', icon: 'point_of_sale' },
      { name: 'Perfil', section: 'perfil', icon: 'business' }
    ];

    const baseImages = [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'
    ];

    function getDefaultRating(productId) {
      const ratings = {
        1: 4, 2: 5, 3: 3, 4: 4, 5: 5,
        6: 3, 7: 4, 8: 5, 9: 3, 10: 4,
        11: 5, 12: 4, 13: 5, 14: 3, 15: 4,
        16: 4, 17: 5, 18: 3, 19: 4, 20: 5,
        21: 3, 22: 4
      };

      return ratings[productId] || 3;
    }

    function getStars(rating) {
      const value = Number(rating) || 0;
      let stars = '';

      for (let i = 1; i <= 5; i++) {
        stars += i <= value ? '★' : '☆';
      }

      return stars;
    }

    /* ========================================================= */
    /* DATOS SIMULADOS Y LOCALSTORAGE */
    /* ========================================================= */

    function loadData() {
      const savedProducts = localStorage.getItem('tiendaTechProductos');
      const savedMarkets = localStorage.getItem('tiendaTechMercados');
      const savedFavorites = localStorage.getItem('tiendaTechFavoritos');

      markets = savedMarkets ? JSON.parse(savedMarkets) : [
        { id: 1, name: 'Tech Store Panama', logo: 'TS', description: 'Marca enfocada en productos tecnologicos, accesorios y dispositivos para uso diario.' },
        { id: 2, name: 'Smart Office', logo: 'SO', description: 'Empresa orientada a productos de oficina, organizacion y herramientas de productividad.' },
        { id: 3, name: 'Gaming Center', logo: 'GC', description: 'Mercado dedicado a accesorios gaming, perifericos y productos para entretenimiento.' },
        { id: 4, name: 'Audio Max', logo: 'AM', description: 'Marca centrada en audio, audifonos, bocinas y productos multimedia.' },
        { id: 5, name: 'Smart Home', logo: 'SH', description: 'Empresa dedicada a productos inteligentes para el hogar y automatizacion.' }
      ];

      products = savedProducts ? JSON.parse(savedProducts) : [
        { id: 1, marketId: 1, name: '1. Laptop', category: 'Tecnologia', price: 750, date: '2026-05-01', economical: false, recommended: false, description: 'Laptop ligera para estudio, trabajo y navegacion diaria.', image: baseImages[0] },
        { id: 2, marketId: 1, name: '2. Mouse', category: 'Gaming', price: 15, date: '2026-05-03', economical: true, recommended: true, description: 'Mouse preciso con diseno comodo para largas sesiones.', image: baseImages[1] },
        { id: 3, marketId: 2, name: '3. Teclado', category: 'Gaming', price: 35, date: '2026-05-06', economical: true, recommended: false, description: 'Teclado mecanico compacto con iluminacion personalizable.', image: baseImages[4] },
        { id: 4, marketId: 2, name: '4. Monitor', category: 'Oficina', price: 180, date: '2026-04-15', economical: false, recommended: true, description: 'Monitor amplio para productividad, estudio y entretenimiento.', image: baseImages[3] },
        { id: 5, marketId: 4, name: '5. Audifonos', category: 'Audio', price: 45, date: '2026-04-25', economical: true, recommended: true, description: 'Audifonos con sonido claro para musica, clases y llamadas.', image: baseImages[2] },
        { id: 6, marketId: 2, name: '6. Impresora', category: 'Oficina', price: 120, date: '2026-04-28', economical: false, recommended: false, description: 'Impresora para oficina, tareas y documentos importantes.', image: baseImages[3] },
        { id: 7, marketId: 1, name: '7. USB', category: 'Tecnologia', price: 10, date: '2026-05-09', economical: true, recommended: false, description: 'Memoria USB compacta para archivos y respaldo rapido.', image: baseImages[0] },
        { id: 8, marketId: 1, name: '8. Disco SSD', category: 'Tecnologia', price: 70, date: '2026-04-18', economical: false, recommended: true, description: 'Unidad SSD para mejorar velocidad y almacenamiento.', image: baseImages[4] },
        { id: 9, marketId: 5, name: '9. Router', category: 'Tecnologia', price: 55, date: '2026-05-08', economical: true, recommended: false, description: 'Router estable para mejorar la conexion en casa.', image: baseImages[4] },
        { id: 10, marketId: 3, name: '10. Silla Gamer', category: 'Gaming', price: 210, date: '2026-05-07', economical: false, recommended: false, description: 'Silla comoda para estudio, trabajo y juegos.', image: baseImages[1] },
        { id: 11, marketId: 4, name: '11. Microfono', category: 'Audio', price: 60, date: '2026-05-02', economical: false, recommended: true, description: 'Microfono ideal para reuniones, grabaciones y streaming.', image: baseImages[0] },
        { id: 12, marketId: 1, name: '12. Webcam', category: 'Tecnologia', price: 50, date: '2026-05-10', economical: false, recommended: true, description: 'Camara web para clases, reuniones y transmisiones.', image: baseImages[3] },
        { id: 13, marketId: 5, name: '13. Tablet', category: 'Tecnologia', price: 230, date: '2026-05-12', economical: false, recommended: true, description: 'Tablet practica para estudio, dibujo y entretenimiento.', image: baseImages[0] },
        { id: 14, marketId: 5, name: '14. Cargador', category: 'Tecnologia', price: 25, date: '2026-05-11', economical: true, recommended: false, description: 'Cargador rapido y compacto para dispositivos diarios.', image: baseImages[4] },
        { id: 15, marketId: 4, name: '15. Parlantes', category: 'Audio', price: 40, date: '2026-04-20', economical: true, recommended: false, description: 'Parlantes compactos con sonido claro para escritorio.', image: baseImages[2] },
        { id: 16, marketId: 1, name: '16. Cable USB-C', category: 'Tecnologia', price: 8, date: '2026-05-13', economical: true, recommended: true, description: 'Cable resistente para carga y transferencia de datos.', image: baseImages[4] },
        { id: 17, marketId: 2, name: '17. Pad Mouse', category: 'Gaming', price: 12, date: '2026-05-14', economical: true, recommended: true, description: 'Alfombrilla comoda para mejorar el movimiento del mouse.', image: baseImages[1] },
        { id: 18, marketId: 4, name: '18. Adaptador Audio', category: 'Audio', price: 9, date: '2026-05-15', economical: true, recommended: false, description: 'Adaptador pequeno para conectar audifonos y equipos de sonido.', image: baseImages[2] },
        { id: 19, marketId: 5, name: '19. Foco Inteligente', category: 'Hogar', price: 18, date: '2026-05-16', economical: true, recommended: true, description: 'Foco inteligente para controlar la iluminacion del hogar.', image: baseImages[4] },
        { id: 20, marketId: 1, name: '20. Soporte Celular', category: 'Tecnologia', price: 14, date: '2026-05-17', economical: true, recommended: true, description: 'Soporte practico para escritorio, clases y videollamadas.', image: baseImages[0] },
        { id: 21, marketId: 3, name: '21. Grip Control', category: 'Gaming', price: 16, date: '2026-05-18', economical: true, recommended: false, description: 'Accesorio para mejorar el agarre durante partidas largas.', image: baseImages[1] },
        { id: 22, marketId: 2, name: '22. Organizador Cables', category: 'Oficina', price: 7, date: '2026-05-19', economical: true, recommended: true, description: 'Organizador simple para mantener el escritorio mas limpio.', image: baseImages[3] }
      ];

      favoriteProducts = savedFavorites ? JSON.parse(savedFavorites) : [];

      products = products.map((product) => ({
        ...product,
        rating: product.rating || getDefaultRating(product.id)
      }));

      saveAll();
    }

    function saveAll() {
      localStorage.setItem('tiendaTechProductos', JSON.stringify(products));
      localStorage.setItem('tiendaTechMercados', JSON.stringify(markets));
      localStorage.setItem('tiendaTechFavoritos', JSON.stringify(favoriteProducts));
    }

    /* ========================================================= */
    /* ELEMENTOS HTML */
    /* ========================================================= */

    const loginPage = document.getElementById('loginPage');
    const appPage = document.getElementById('appPage');
    const loginForm = document.getElementById('loginForm');
    const emailLabel = document.getElementById('emailLabel');
    const loginSubmit = document.getElementById('loginSubmit');
    const loginTypeButtons = document.querySelectorAll('.login-type-button');

    const dashboard = document.getElementById('dashboard');
    const sectionTitle = document.getElementById('sectionTitle');
    const sectionActions = document.getElementById('sectionActions');
    const dynamicContent = document.getElementById('dynamicContent');
    const sessionTypeText = document.getElementById('sessionTypeText');
    const logoutButton = document.getElementById('logoutButton');

    /* ========================================================= */
    /* LOGIN */
    /* ========================================================= */

    function selectLoginType(role) {
      selectedRole = role;

      loginTypeButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.role === role);
      });

      if (role === 'usuario') {
        emailLabel.textContent = 'Correo del usuario';
        loginSubmit.textContent = 'Entrar como usuario';
      } else {
        emailLabel.textContent = 'Correo de la empresa';
        loginSubmit.textContent = 'Entrar como empresa';
      }
    }

    function startSession(role, account) {
      currentAccount = account;
      loginPage.classList.add('hidden');
      appPage.classList.remove('hidden');

      saleModeActive = false;
      appPage.classList.remove('sale-mode');

      if (role === 'empresa') {
        companyPassword = account.contrasena || '1234';
        companyMarketId = account.marketId || 1;
      }

      sessionTypeText.textContent = role === 'usuario' ? 'Sesion: Usuario' : 'Sesion: Empresa';
      renderDashboard(role);
      changeSection(role === 'usuario' ? 'inicio' : 'productos');
    }

    function logout() {
      saleModeActive = false;
      appPage.classList.remove('sale-mode');
      appPage.classList.add('hidden');
      loginPage.classList.remove('hidden');
      sectionActions.innerHTML = '';
    }

    /* ========================================================= */
    /* DASHBOARD */
    /* ========================================================= */

    function renderDashboard(role) {
      const options = role === 'usuario' ? userDashboardOptions : companyDashboardOptions;

      dashboard.innerHTML = options.map((option, index) => `
        <button class="dashboard-item ${index === 0 ? 'active' : ''} ${option.section === 'perfil' ? 'profile-bottom' : ''}" type="button" data-section="${option.section}">
          <span class="material-symbols-outlined">${option.icon}</span>
          <span>${option.name}</span>
        </button>
      `).join('');

      document.querySelectorAll('.dashboard-item').forEach((item) => {
        item.addEventListener('click', () => changeSection(item.dataset.section));
      });
    }

    function setActiveDashboardItem(sectionName) {
      document.querySelectorAll('.dashboard-item').forEach((item) => {
        item.classList.toggle('active', item.dataset.section === sectionName);
      });
    }

    function changeSection(sectionName) {
      if (saleModeActive && sectionName !== 'venta') {
        renderSaleModeCatalog();
        return;
      }

      setActiveDashboardItem(sectionName);
      sectionActions.innerHTML = '';

      if (sectionName === 'inicio') renderHome();
      if (sectionName === 'productos') renderProductsSection();
      if (sectionName === 'mercados') renderMarkets();
      if (sectionName === 'favoritos') renderFavorites();
      if (sectionName === 'perfil') renderProfile();
      if (sectionName === 'venta') startSaleMode();
    }

    /* ========================================================= */
    /* INICIO */
    /* ========================================================= */

    function getHeroVisibleCards() {
      return window.innerWidth >= 900 ? 3 : 1;
    }

    function setupHeroSlider() {
      const heroTrack = document.getElementById('heroTrack');
      if (!heroTrack) return;

      const visibleCards = getHeroVisibleCards();
      heroSlideIndex = visibleCards;
      heroTrack.classList.add('no-transition');
      heroTrack.style.transform = `translateX(-${heroSlideIndex * (100 / visibleCards)}%)`;

      requestAnimationFrame(() => {
        heroTrack.classList.remove('no-transition');
      });
    }

    function moveHeroSlide(direction) {
      const heroTrack = document.getElementById('heroTrack');
      if (!heroTrack) return;

      const visibleCards = getHeroVisibleCards();
      const totalCards = 6;
      const movement = 100 / visibleCards;

      heroSlideIndex += direction;
      heroTrack.classList.remove('no-transition');
      heroTrack.style.transform = `translateX(-${heroSlideIndex * movement}%)`;

      heroTrack.ontransitionend = () => {
        if (heroSlideIndex >= totalCards + visibleCards) {
          heroSlideIndex = visibleCards;
          heroTrack.classList.add('no-transition');
          heroTrack.style.transform = `translateX(-${heroSlideIndex * movement}%)`;
        }

        if (heroSlideIndex < visibleCards) {
          heroSlideIndex = totalCards + visibleCards - 1;
          heroTrack.classList.add('no-transition');
          heroTrack.style.transform = `translateX(-${heroSlideIndex * movement}%)`;
        }
      };
    }

    function createInterestRow(items) {
      return `
        <section class="home-interest-grid">
          ${items.map((item) => `
            <div class="interest-card">
              <h3>${item[0]}</h3>
              <p>${item[1]}</p>
            </div>
          `).join('')}
        </section>
      `;
    }

    function createHomeProductSection(title, description, productList) {
      return `
        <section class="home-product-section">
          <div class="home-product-header">
            <div>
              <h3>${title}</h3>
              <p>${description}</p>
            </div>
            <span>${productList.length} productos</span>
          </div>

          ${productList.length === 0 ? `
            <div class="empty-state">
              <h3>Sin productos</h3>
              <p>No hay productos que cumplan con esta categoria.</p>
            </div>
          ` : `
            <div class="product-grid">${productList.map(createProductCard).join('')}</div>
          `}
        </section>
      `;
    }

    function renderHome() {
      sectionTitle.textContent = 'Inicio';
      heroSlideIndex = 0;

      const heroCards = [
        ['Ofertas destacadas', 'Espacio para promociones importantes, novedades o productos recomendados.'],
        ['Mercados populares', 'Empresas o categorias con mayor movimiento dentro de la plataforma.'],
        ['Recomendado para ti', 'Contenido sugerido segun busquedas, favoritos o intereses.'],
        ['Novedades', 'Productos, mercados o publicaciones nuevas dentro de la plataforma.'],
        ['Tendencias', 'Contenido que esta teniendo mas actividad entre usuarios.'],
        ['Empresas verificadas', 'Espacio para destacar negocios confiables o recomendados.']
      ];

      const visibleCards = getHeroVisibleCards();
      const clonedCards = [
        ...heroCards.slice(-visibleCards),
        ...heroCards,
        ...heroCards.slice(0, visibleCards)
      ];

      const economicProducts = products
        .filter((product) => Number(product.price) < 30)
        .slice(0, 10);

      const recommendedProducts = products
        .filter((product) => Number(product.rating) > 3);

      const economicRecommendedProducts = products
        .filter((product) => Number(product.price) < 30 && Number(product.rating) > 3);

      dynamicContent.innerHTML = `
        <div class="home-layout">
          <section class="hero-slider">
            <button class="slider-arrow left" type="button" onclick="moveHeroSlide(-1)">‹</button>

            <div id="heroTrack" class="hero-track">
              ${clonedCards.map((card) => `
                <div class="hero-slide-card">
                  <div class="home-banner">
                    <h3>${card[0]}</h3>
                    <p>${card[1]}</p>
                  </div>
                </div>
              `).join('')}
            </div>

            <button class="slider-arrow right" type="button" onclick="moveHeroSlide(1)">›</button>
          </section>

          ${createHomeProductSection('Economicos', 'Hasta 10 productos con precio menor a $30.', economicProducts)}
          ${createHomeProductSection('Recomendados', 'Productos con calificacion mayor a 3 estrellas.', recommendedProducts)}
          ${createHomeProductSection('Economicos y recomendados', 'Productos que cuestan menos de $30 y tienen mas de 3 estrellas.', economicRecommendedProducts)}
        </div>
      `;

      setupHeroSlider();
    }

    /* ========================================================= */
    /* FUNCIONALIDAD DE CONJUNTOS APLICADA EN JS */
    /* ========================================================= */

    function getVector(productsList, predicate) {
      return productsList.map((product) => predicate(product) ? 1 : 0);
    }

    function formatVector(vector) {
      return '[' + vector.map((value) => String(value).padStart(2, ' ')).join(', ') + ']';
    }

    function getSetResult(productsList) {
      const vectorA = getVector(productsList, (product) => product.economical);
      const vectorB = getVector(productsList, (product) => product.recommended);
      const result = [];

      for (let i = 0; i < productsList.length; i++) {
        const a = vectorA[i];
        const b = vectorB[i];

        if (setOperation === 'todos') result.push(1);
        if (setOperation === 'union') result.push(a === 1 || b === 1 ? 1 : 0);
        if (setOperation === 'interseccion') result.push(a === 1 && b === 1 ? 1 : 0);
        if (setOperation === 'complemento') result.push(a === 1 && b === 0 ? 1 : 0);
        if (setOperation === 'diferencia') result.push(a !== b ? 1 : 0);
      }

      return {
        vectorA,
        vectorB,
        result
      };
    }

    function getSetDescription() {
      const descriptions = {
        todos: 'Muestra todos los productos sin aplicar operacion de conjuntos.',
        union: 'A U B: muestra productos economicos, recomendados o ambas cosas.',
        interseccion: 'A ∩ B: muestra productos economicos y recomendados al mismo tiempo.',
        complemento: 'A - B: muestra productos economicos que no estan dentro de los recomendados.',
        diferencia: 'A Δ B: muestra productos que cumplen solo una condicion, pero no ambas.'
      };

      return descriptions[setOperation];
    }

    /* ========================================================= */
    /* PRODUCTOS */
    /* ========================================================= */

    function createProductCard(product) {
      const isFavorite = favoriteProducts.includes(product.id);
      const market = markets.find((item) => item.id === product.marketId);
      const marketName = market ? market.name : 'Sin mercado';

      return `
        <article class="product-card">
          <div class="product-image-box">
            <img class="product-image" src="${product.image}" alt="${product.name}">
          </div>

          <div class="product-info">
            <div>
              <h3 class="product-title">${product.name}</h3>
              <p class="product-description">${product.description}</p>

              <div class="product-meta">
                <span>$${product.price}</span>
                <span>${product.category}</span>
              </div>

              <div class="rating-row">
                <span>${getStars(product.rating)}</span>
                <strong>${product.rating}/5</strong>
              </div>

              <div class="tag-row">
                <span class="tag">${marketName}</span>
                ${product.economical ? '<span class="tag">Economico</span>' : ''}
                ${product.recommended ? '<span class="tag">Recomendado</span>' : ''}
              </div>
            </div>

            <div class="card-actions">
              ${selectedRole === 'usuario' ? `
                <button class="small-button ${isFavorite ? 'active' : ''}" type="button" onclick="toggleFavorite(${product.id})">${isFavorite ? 'Guardado' : 'Guardar'}</button>
              ` : `
                <button class="small-button" type="button" onclick="showProductForm(${product.id})">Editar</button>
                <button class="small-button danger" type="button" onclick="deleteProduct(${product.id})">Eliminar</button>
              `}
            </div>
          </div>
        </article>
      `;
    }

    function getFilteredProducts() {
      let filtered = [...products];

      if (productSearch.trim() !== '') {
        const term = productSearch.toLowerCase();
        filtered = filtered.filter((product) => {
          return product.name.toLowerCase().includes(term) ||
                 product.description.toLowerCase().includes(term) ||
                 product.category.toLowerCase().includes(term);
        });
      }

      if (selectedCategory !== '') {
        filtered = filtered.filter((product) => product.category === selectedCategory);
      }

      const setData = getSetResult(filtered);
      filtered = filtered.filter((product, index) => setData.result[index] === 1);

      if (priceOrder === 'asc') filtered.sort((a, b) => a.price - b.price);
      if (priceOrder === 'desc') filtered.sort((a, b) => b.price - a.price);
      if (dateOrder === 'new') filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      if (dateOrder === 'old') filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

      return filtered;
    }

    function renderProductsSection() {
      sectionTitle.textContent = selectedRole === 'empresa' ? 'Mis productos' : 'Productos';

      if (selectedRole === 'empresa') {
        sectionActions.innerHTML = `<button class="primary-button" type="button" onclick="showProductForm()">Agregar producto</button>`;
      }

      const filteredProducts = getFilteredProducts();
      const setData = getSetResult(products);
      const total = filteredProducts.reduce((sum, product) => sum + Number(product.price), 0);

      dynamicContent.innerHTML = `
        <div class="toolbar">
          <input id="productSearchInput" class="search-input" type="text" placeholder="Buscar producto..." value="${productSearch}">

          <div class="filter-row">
            <select id="priceFilter" class="filter-select">
              <option value="">Orden de precio</option>
              <option value="asc" ${priceOrder === 'asc' ? 'selected' : ''}>Menor a mayor</option>
              <option value="desc" ${priceOrder === 'desc' ? 'selected' : ''}>Mayor a menor</option>
            </select>

            <select id="categoryFilter" class="filter-select">
              <option value="">Categoria</option>
              ${getCategories().map((category) => `<option value="${category}" ${selectedCategory === category ? 'selected' : ''}>${category}</option>`).join('')}
            </select>

            <select id="dateFilter" class="filter-select">
              <option value="">Fecha de publicacion</option>
              <option value="new" ${dateOrder === 'new' ? 'selected' : ''}>Mas recientes</option>
              <option value="old" ${dateOrder === 'old' ? 'selected' : ''}>Mas antiguos</option>
            </select>

            <select id="setFilter" class="filter-select">
              <option value="todos" ${setOperation === 'todos' ? 'selected' : ''}>Todos</option>
              <option value="union" ${setOperation === 'union' ? 'selected' : ''}>Economicos o recomendados</option>
              <option value="interseccion" ${setOperation === 'interseccion' ? 'selected' : ''}>Economicos y recomendados</option>
              <option value="complemento" ${setOperation === 'complemento' ? 'selected' : ''}>Economicos no recomendados</option>
              <option value="diferencia" ${setOperation === 'diferencia' ? 'selected' : ''}>Solo una condicion</option>
            </select>
          </div>
        </div>

        ${filteredProducts.length === 0 ? `
          <div class="empty-state">
            <h3>Sin resultados</h3>
            <p>No hay productos que coincidan con los filtros seleccionados.</p>
          </div>
        ` : `
          <div class="product-grid">${filteredProducts.map(createProductCard).join('')}</div>
        `}
      `;

      document.getElementById('productSearchInput').addEventListener('input', (event) => {
        productSearch = event.target.value;
        renderProductsSection();
      });

      document.getElementById('priceFilter').addEventListener('change', (event) => {
        priceOrder = event.target.value;
        renderProductsSection();
      });

      document.getElementById('categoryFilter').addEventListener('change', (event) => {
        selectedCategory = event.target.value;
        renderProductsSection();
      });

      document.getElementById('dateFilter').addEventListener('change', (event) => {
        dateOrder = event.target.value;
        renderProductsSection();
      });

      document.getElementById('setFilter').addEventListener('change', (event) => {
        setOperation = event.target.value;
        renderProductsSection();
      });
    }

    function getCategories() {
      return [...new Set(products.map((product) => product.category))].sort();
    }

    function toggleFavorite(productId) {
      if (favoriteProducts.includes(productId)) {
        favoriteProducts = favoriteProducts.filter((id) => id !== productId);
      } else {
        favoriteProducts.push(productId);
      }

      saveAll();

      const activeSection = document.querySelector('.dashboard-item.active')?.dataset.section;

      if (activeSection === 'favoritos') renderFavorites();
      if (activeSection === 'productos') renderProductsSection();
    }

    /* ========================================================= */
    /* FORMULARIO DE PRODUCTOS PARA EMPRESA */
    /* ========================================================= */

    function showProductForm(productId = null) {
      const editing = productId !== null;
      const product = editing ? products.find((item) => item.id === productId) : null;

      sectionTitle.textContent = editing ? 'Editar producto' : 'Agregar producto';
      sectionActions.innerHTML = `<button class="secondary-button" type="button" onclick="changeSection('productos')">Volver</button>`;

      dynamicContent.innerHTML = `
        <div class="panel">
          <h3>${editing ? 'Editar producto' : 'Nuevo producto'}</h3>
          <p>Completa los datos del producto. Los campos Economico y Recomendado alimentan los conjuntos A y B.</p>

          <form id="productForm" class="form-grid">
            <div class="form-group">
              <label class="form-label">Nombre</label>
              <input id="productName" class="form-input" type="text" value="${product ? product.name : ''}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Precio</label>
              <input id="productPrice" class="form-input" type="number" min="0" value="${product ? product.price : ''}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Estrellas</label>
              <input id="productRating" class="form-input" type="number" min="1" max="5" value="${product ? product.rating : 3}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Categoria</label>
              <input id="productCategory" class="form-input" type="text" value="${product ? product.category : ''}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Mercado</label>
              <select id="productMarket" class="form-select">
                ${markets.map((market) => `<option value="${market.id}" ${product && product.marketId === market.id ? 'selected' : ''}>${market.name}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Fecha de publicacion</label>
              <input id="productDate" class="form-input" type="date" value="${product ? product.date : new Date().toISOString().slice(0, 10)}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Imagen URL</label>
              <input id="productImage" class="form-input" type="text" value="${product ? product.image : baseImages[0]}">
            </div>

            <div class="form-group">
              <label class="form-label">Descripcion</label>
              <textarea id="productDescription" class="form-textarea">${product ? product.description : ''}</textarea>
            </div>

            <div class="form-group">
              <label class="checkbox-line">
                <input id="productEconomical" type="checkbox" ${product && product.economical ? 'checked' : ''}>
                Pertenece a A: Economico
              </label>

              <label class="checkbox-line">
                <input id="productRecommended" type="checkbox" ${product && product.recommended ? 'checked' : ''}>
                Pertenece a B: Recomendado
              </label>
            </div>

            <button class="primary-button" type="submit">${editing ? 'Guardar cambios' : 'Crear producto'}</button>
          </form>
        </div>
      `;

      document.getElementById('productForm').addEventListener('submit', (event) => {
        event.preventDefault();

        const data = {
          id: editing ? product.id : getNextProductId(),
          marketId: Number(document.getElementById('productMarket').value),
          name: document.getElementById('productName').value.trim(),
          category: document.getElementById('productCategory').value.trim(),
          price: Number(document.getElementById('productPrice').value),
          rating: Number(document.getElementById('productRating').value),
          date: document.getElementById('productDate').value,
          economical: document.getElementById('productEconomical').checked,
          recommended: document.getElementById('productRecommended').checked,
          description: document.getElementById('productDescription').value.trim(),
          image: document.getElementById('productImage').value.trim() || baseImages[0]
        };

        if (editing) {
          products = products.map((item) => item.id === product.id ? data : item);
        } else {
          products.push(data);
        }

        saveAll();
        changeSection('productos');
      });
    }

    function getNextProductId() {
      if (products.length === 0) return 1;
      return Math.max(...products.map((product) => product.id)) + 1;
    }

    function deleteProduct(productId) {
      const confirmDelete = confirm('Seguro que deseas eliminar este producto?');

      if (!confirmDelete) return;

      products = products.filter((product) => product.id !== productId);
      favoriteProducts = favoriteProducts.filter((id) => id !== productId);
      saveAll();
      renderProductsSection();
    }

    /* ========================================================= */
    /* MERCADOS */
    /* ========================================================= */

    function createMarketCard(market) {
      const totalProducts = products.filter((product) => product.marketId === market.id).length;

      return `
        <article class="market-card" onclick="showMarketCatalog(${market.id})">
          <div>
            <div class="market-logo">${market.logo}</div>
            <h3 class="market-name">${market.name}</h3>
            <p class="market-description">${market.description}</p>
          </div>
          <div class="market-footer">${totalProducts} productos disponibles</div>
        </article>
      `;
    }

    function renderMarkets() {
      sectionTitle.textContent = 'Mercados';
      sectionActions.innerHTML = '';
      dynamicContent.innerHTML = `<div class="market-grid">${markets.map(createMarketCard).join('')}</div>`;
    }

    function showMarketCatalog(marketId) {
      const market = markets.find((item) => item.id === marketId);
      const marketProducts = products.filter((product) => product.marketId === marketId);

      sectionTitle.textContent = market.name;
      sectionActions.innerHTML = `<button class="secondary-button" type="button" onclick="renderMarkets()">Volver</button>`;

      dynamicContent.innerHTML = `
        <div class="catalog-header">
          <div class="catalog-header-top">
            <div class="market-logo">${market.logo}</div>
            <div>
              <h3 class="catalog-title">${market.name}</h3>
              <p class="catalog-description">${market.description}</p>
            </div>
          </div>
        </div>

        ${marketProducts.length === 0 ? `
          <div class="empty-state"><h3>Sin productos</h3><p>Este mercado todavia no tiene productos publicados.</p></div>
        ` : `
          <div class="product-grid">${marketProducts.map(createProductCard).join('')}</div>
        `}
      `;
    }

    /* ========================================================= */
    /* MODO VENTA */
    /* ========================================================= */

    function startSaleMode() {
      const confirmSale = confirm('Activar modo venta? El sistema quedara bloqueado en el catalogo de la empresa hasta ingresar la clave.');

      if (!confirmSale) {
        changeSection('productos');
        return;
      }

      saleModeActive = true;
      appPage.classList.add('sale-mode');
      renderSaleModeCatalog();
    }

    function renderSaleModeCatalog() {
      const market = markets.find((item) => item.id === companyMarketId) || markets[0];
      const marketProducts = products.filter((product) => product.marketId === market.id);

      sectionTitle.textContent = 'Modo venta';
      sectionActions.innerHTML = `
        <button class="danger-button" type="button" onclick="requestExitSaleMode()">Salir del modo venta</button>
      `;

      dynamicContent.innerHTML = `
        <div class="sale-header-card">
          <div class="sale-header-info">
            <div class="market-logo">${market.logo}</div>
            <div>
              <h3 class="sale-title">${market.name}</h3>
              <p class="sale-description">${market.description}</p>
            </div>
          </div>

          <button class="danger-button" type="button" onclick="requestExitSaleMode()">Desbloquear</button>
        </div>

        <div class="sale-note">
          Catalogo de venta activo. Los usuarios pueden ver los productos disponibles, pero no pueden salir ni administrar el sistema sin la clave de la empresa.
        </div>

        ${marketProducts.length === 0 ? `
          <div class="empty-state">
            <h3>Sin productos</h3>
            <p>Esta empresa todavia no tiene productos publicados.</p>
          </div>
        ` : `
          <div class="product-grid">${marketProducts.map(createSaleProductCard).join('')}</div>
        `}
      `;
    }

    function createSaleProductCard(product) {
      return `
        <article class="product-card">
          <div class="product-image-box">
            <img class="product-image" src="${product.image}" alt="${product.name}">
          </div>

          <div class="product-info">
            <div>
              <h3 class="product-title">${product.name}</h3>
              <p class="product-description">${product.description}</p>

              <div class="product-meta">
                <span>$${product.price}</span>
                <span>${product.category}</span>
              </div>

              <div class="rating-row">
                <span>${getStars(product.rating)}</span>
                <strong>${product.rating}/5</strong>
              </div>

              <div class="tag-row">
                ${product.economical ? '<span class="tag">Economico</span>' : ''}
                ${product.recommended ? '<span class="tag">Recomendado</span>' : ''}
              </div>
            </div>
          </div>
        </article>
      `;
    }

    function requestExitSaleMode() {
      const password = prompt('Ingresa la clave de la empresa para salir del modo venta:');

      if (password === null) {
        return;
      }

      if (password === companyPassword) {
        saleModeActive = false;
        appPage.classList.remove('sale-mode');
        renderDashboard('empresa');
        changeSection('productos');
      } else {
        alert('Clave incorrecta. El modo venta sigue activo.');
        renderSaleModeCatalog();
      }
    }

    /* ========================================================= */
    /* FAVORITOS Y PERFIL */
    /* ========================================================= */

    function renderFavorites() {
      sectionTitle.textContent = 'Favoritos';
      const favorites = products.filter((product) => favoriteProducts.includes(product.id));

      dynamicContent.innerHTML = favorites.length === 0 ? `
        <div class="empty-state">
          <h3>Favoritos</h3>
          <p>Aun no tienes productos guardados. Ve a Productos y presiona Guardar.</p>
        </div>
      ` : `
        <div class="product-grid">${favorites.map(createProductCard).join('')}</div>
      `;
    }

    function renderProfile() {
      sectionTitle.textContent = 'Perfil';

      if (selectedRole === 'usuario') {
        dynamicContent.innerHTML = `
          <div class="panel-grid">
            <div class="panel">
              <h3>Perfil del usuario</h3>
              <p>Cuenta de demostracion para comprar, buscar mercados y guardar favoritos.</p>
              <div class="mini-stats">
                <div class="stat-card"><span class="stat-number">${favoriteProducts.length}</span><span class="stat-label">Favoritos</span></div>
                <div class="stat-card"><span class="stat-number">${products.length}</span><span class="stat-label">Productos visibles</span></div>
              </div>
            </div>

            <div class="panel">
              <h3>Preferencias</h3>
              <p>Esta zona puede conectarse luego a datos reales del usuario, preferencias, foto de perfil y metodos de contacto.</p>
            </div>
          </div>
        `;
      } else {
        const total = products.length;
        const recommended = products.filter((product) => product.recommended).length;
        const economical = products.filter((product) => product.economical).length;

        dynamicContent.innerHTML = `
          <div class="panel-grid">
            <div class="panel">
              <h3>Perfil de empresa</h3>
              <p>Panel para administrar productos publicados, categorias, precios y etiquetas de conjuntos.</p>
              <div class="mini-stats">
                <div class="stat-card"><span class="stat-number">${total}</span><span class="stat-label">Productos</span></div>
                <div class="stat-card"><span class="stat-number">${markets.length}</span><span class="stat-label">Mercados</span></div>
                <div class="stat-card"><span class="stat-number">${economical}</span><span class="stat-label">Economicos</span></div>
                <div class="stat-card"><span class="stat-number">${recommended}</span><span class="stat-label">Recomendados</span></div>
              </div>
            </div>

            <div class="panel">
              <h3>Herramientas</h3>
              <p>Usa la seccion Productos para crear, editar o eliminar productos. Los checks A y B alimentan los filtros por conjuntos.</p>
              <br>
              <p>El modo venta bloquea el sistema en el catalogo de la empresa. Para salir se debe escribir la misma clave usada al iniciar sesion como empresa.</p>
            </div>
          </div>
        `;
      }
    }

    /* ========================================================= */
    /* EVENTOS */
    /* ========================================================= */

    loginTypeButtons.forEach((button) => {
      button.addEventListener('click', () => selectLoginType(button.dataset.role));
    });

    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const correo = document.getElementById('emailInput').value.trim();
      const contrasena = document.getElementById('passwordInput').value.trim();
      const account = validarCuenta(correo, contrasena, selectedRole);

      if (!account) {
        alert('Correo, contrasena o tipo de cuenta incorrecto.');
        return;
      }

      startSession(account.tipo, account);
    });

    logoutButton.addEventListener('click', logout);

    loadData();