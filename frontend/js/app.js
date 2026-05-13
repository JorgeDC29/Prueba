    /* ========================================================= */
    /* ESTADO GENERAL */
    /* ========================================================= */

    const API_URL = 'http://localhost:3000/api';

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
    let authToken = localStorage.getItem('tiendaTechToken') || '';
    let authMode = 'login';

    const userDashboardOptions = [
      { name: 'Inicio', section: 'inicio', icon: 'home' },
      { name: 'Productos', section: 'productos', icon: 'inventory_2' },
      { name: 'Mercados', section: 'mercados', icon: 'storefront' },
      { name: 'Favoritos', section: 'favoritos', icon: 'favorite' },
      { name: 'Perfil', section: 'perfil', icon: 'person' }
    ];

    const companyDashboardOptions = [
      { name: 'Productos', section: 'productos', icon: 'inventory_2' },
      { name: 'Mis productos', section: 'mis-productos', icon: 'edit_square' },
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

    function getProductCompanyId(product) {
      return Number(product.id_empresa || product.marketId || 0);
    }

    function getCurrentCompanyId() {
      return Number(currentAccount?.id_empresa || currentAccount?.marketId || companyMarketId || 1);
    }

    function getCurrentUserName() {
      return currentAccount?.nombre || 'Sin nombre';
    }

    function getCurrentUserEmail() {
      return currentAccount?.correo || 'Sin correo';
    }

    function getCategoryIdByName(categoryName) {
      const categories = {
        Tecnologia: 1,
        Gaming: 2,
        Audio: 3,
        Oficina: 4,
        Hogar: 5
      };

      return categories[categoryName] || null;
    }

    function getAuthHeaders() {
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
    }

    /* ========================================================= */
    /* DATOS SIMULADOS Y LOCALSTORAGE */
    /* ========================================================= */

    async function loadData() {
      const savedFavorites = localStorage.getItem('tiendaTechFavoritos');

      favoriteProducts = savedFavorites ? JSON.parse(savedFavorites) : [];

      try {
        const empresasRespuesta = await fetch(`${API_URL}/empresas`);
        const empresasBD = await empresasRespuesta.json();

        if (!empresasRespuesta.ok) {
          throw new Error('Error al cargar empresas');
        }

        markets = empresasBD.map((empresa) => ({
          id: empresa.id_empresa,
          id_empresa: empresa.id_empresa,
          id_usuario: empresa.id_usuario,
          name: empresa.nombre_empresa,
          nombre_empresa: empresa.nombre_empresa,
          logo: empresa.logo || empresa.nombre_empresa.slice(0, 2).toUpperCase(),
          description: empresa.descripcion || 'Empresa registrada en Tienda Tech.',
          descripcion: empresa.descripcion || 'Empresa registrada en Tienda Tech.',
          correo: empresa.correo || '',
          telefono: empresa.telefono || '',
          direccion: empresa.direccion || ''
        }));

        const productosRespuesta = await fetch(`${API_URL}/productos`);
        const productosBD = await productosRespuesta.json();

        if (!productosRespuesta.ok) {
          throw new Error('Error al cargar productos');
        }

        products = productosBD.map((product) => ({
          id: product.id_producto,
          id_producto: product.id_producto,
          marketId: product.id_empresa,
          id_empresa: product.id_empresa,
          category: product.nombre_categoria || 'Sin categoria',
          id_categoria: product.id_categoria,
          name: product.nombre,
          nombre: product.nombre,
          description: product.descripcion || 'Sin descripcion',
          descripcion: product.descripcion || 'Sin descripcion',
          price: Number(product.precio),
          precio: Number(product.precio),
          image: product.imagen || baseImages[0],
          imagen: product.imagen || baseImages[0],
          rating: product.estrellas || 3,
          estrellas: product.estrellas || 3,
          stock: product.stock || 0,
          date: product.fecha_publicacion ? String(product.fecha_publicacion).slice(0, 10) : new Date().toISOString().slice(0, 10),
          economical: Number(product.precio) < 30,
          recommended: Number(product.estrellas || 3) > 3,
          nombre_empresa: product.nombre_empresa || 'Sin empresa'
        }));
      } catch (error) {
        alert('No se pudieron cargar los datos desde MySQL. Revisa que el backend este activo.');
        markets = [];
        products = [];
      }

      saveAll();
    }

    function saveAll() {
      localStorage.setItem('tiendaTechFavoritos', JSON.stringify(favoriteProducts));
    }

    /* ========================================================= */
    /* ELEMENTOS HTML */
    /* ========================================================= */

    const loginPage = document.getElementById('loginPage');
    const appPage = document.getElementById('appPage');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTitle = document.getElementById('authTitle');
    const authText = document.getElementById('authText');
    const authHelpText = document.getElementById('authHelpText');
    const toggleAuthButton = document.getElementById('toggleAuthButton');
    const emailLabel = document.getElementById('emailLabel');
    const registerEmailLabel = document.getElementById('registerEmailLabel');
    const loginSubmit = document.getElementById('loginSubmit');
    const registerSubmit = document.getElementById('registerSubmit');
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

        if (registerEmailLabel) registerEmailLabel.textContent = 'Correo del usuario';
        if (registerSubmit) registerSubmit.textContent = 'Crear cuenta de usuario';
      } else {
        emailLabel.textContent = 'Correo de la empresa';
        loginSubmit.textContent = 'Entrar como empresa';

        if (registerEmailLabel) registerEmailLabel.textContent = 'Correo de la empresa';
        if (registerSubmit) registerSubmit.textContent = 'Crear cuenta de empresa';
      }
    }

    function setAuthMode(mode) {
      authMode = mode;

      const isRegister = mode === 'register';

      loginForm.classList.toggle('hidden', isRegister);
      registerForm.classList.toggle('hidden', !isRegister);

      authTitle.textContent = isRegister ? 'Crear cuenta' : 'Inicio de sesion';
      authText.textContent = isRegister
        ? 'Crea una cuenta como usuario o empresa para empezar a usar Tienda Tech.'
        : 'Entra con tu cuenta para comprar, guardar favoritos o administrar productos como empresa.';

      authHelpText.textContent = isRegister ? 'Ya tienes cuenta?' : 'No tienes cuenta?';
      toggleAuthButton.textContent = isRegister ? 'Iniciar sesion' : 'Crear cuenta';

      selectLoginType(selectedRole);
    }

    function startSession(role, account) {
      currentAccount = account;
      selectedRole = role;
      loginPage.classList.add('hidden');
      appPage.classList.remove('hidden');

      saleModeActive = false;
      appPage.classList.remove('sale-mode');

      if (role === 'empresa') {
        companyPassword = document.getElementById('passwordInput').value || '1234';
        companyMarketId = account.id_empresa || account.marketId || 1;
      }

      sessionTypeText.textContent = role === 'usuario' ? 'Sesion: Usuario' : 'Sesion: Empresa';
      renderDashboard(role);
      changeSection(role === 'usuario' ? 'inicio' : 'productos');
    }

    function logout() {
      authToken = '';
      currentAccount = null;
      selectedRole = 'usuario';

      localStorage.removeItem('tiendaTechToken');
      localStorage.removeItem('tiendaTechUsuario');

      saleModeActive = false;
      appPage.classList.remove('sale-mode');
      appPage.classList.add('hidden');
      loginPage.classList.remove('hidden');
      sectionActions.innerHTML = '';

      document.getElementById('emailInput').value = '';
      document.getElementById('passwordInput').value = '';
      selectLoginType('usuario');
      setAuthMode('login');
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
      if (sectionName === 'mis-productos') renderMyProductsSection();
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
      const productId = product.id || product.id_producto;
      const isFavorite = favoriteProducts.includes(productId);
      const activeSection = document.querySelector('.dashboard-item.active')?.dataset.section;
      const market = markets.find((item) => item.id === product.marketId || item.id === product.id_empresa);
      const marketName = product.nombre_empresa || (market ? market.name : 'Sin mercado');

      return `
        <article class="product-card">
          <div class="product-image-box">
            <img class="product-image" src="${product.image || product.imagen || baseImages[0]}" alt="${product.name || product.nombre}">
          </div>

          <div class="product-info">
            <div>
              <h3 class="product-title">${product.name || product.nombre}</h3>
              <p class="product-description">${product.description || product.descripcion || 'Sin descripcion'}</p>

              <div class="product-meta">
                <span>$${product.price || product.precio}</span>
                <span>${product.category || product.nombre_categoria || 'Sin categoria'}</span>
              </div>

              <div class="rating-row">
                <span>${getStars(product.rating || product.estrellas)}</span>
                <strong>${product.rating || product.estrellas || 3}/5</strong>
              </div>

              <div class="tag-row">
                <span class="tag">${marketName}</span>
                ${product.economical ? '<span class="tag">Economico</span>' : ''}
                ${product.recommended ? '<span class="tag">Recomendado</span>' : ''}
              </div>
            </div>

            <div class="card-actions">
              ${selectedRole === 'usuario' ? `
                <button class="small-button ${isFavorite ? 'active' : ''}" type="button" onclick="toggleFavorite(${productId})">${isFavorite ? 'Guardado' : 'Guardar'}</button>
              ` : activeSection === 'mis-productos' ? `
                <button class="small-button" type="button" onclick="showProductForm(${productId})">Editar</button>
                <button class="small-button danger" type="button" onclick="deleteProduct(${productId})">Eliminar</button>
              ` : ''}
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

    function createProductToolbar() {
      return `
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
      `;
    }

    function activateProductToolbar(renderFunction) {
      const searchInput = document.getElementById('productSearchInput');
      const priceFilter = document.getElementById('priceFilter');
      const categoryFilter = document.getElementById('categoryFilter');
      const dateFilter = document.getElementById('dateFilter');
      const setFilter = document.getElementById('setFilter');

      if (!searchInput || !priceFilter || !categoryFilter || !dateFilter || !setFilter) return;

      searchInput.addEventListener('input', (event) => {
        productSearch = event.target.value;
        renderFunction();
      });

      priceFilter.addEventListener('change', (event) => {
        priceOrder = event.target.value;
        renderFunction();
      });

      categoryFilter.addEventListener('change', (event) => {
        selectedCategory = event.target.value;
        renderFunction();
      });

      dateFilter.addEventListener('change', (event) => {
        dateOrder = event.target.value;
        renderFunction();
      });

      setFilter.addEventListener('change', (event) => {
        setOperation = event.target.value;
        renderFunction();
      });
    }

    function renderProductsSection() {
      sectionTitle.textContent = 'Productos';
      sectionActions.innerHTML = '';

      const filteredProducts = getFilteredProducts();

      dynamicContent.innerHTML = `
        ${createProductToolbar()}

        ${filteredProducts.length === 0 ? `
          <div class="empty-state">
            <h3>Sin resultados</h3>
            <p>No hay productos que coincidan con los filtros seleccionados.</p>
          </div>
        ` : `
          <div class="product-grid">${filteredProducts.map(createProductCard).join('')}</div>
        `}
      `;

      activateProductToolbar(renderProductsSection);
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

    function renderMyProductsSection() {
      sectionTitle.textContent = 'Mis productos';
      sectionActions.innerHTML = `<button class="primary-button" type="button" onclick="showProductForm()">Agregar producto</button>`;

      const myCompanyId = getCurrentCompanyId();
      const myProducts = getFilteredProducts().filter((product) => {
        return getProductCompanyId(product) === myCompanyId;
      });

      dynamicContent.innerHTML = `
        ${createProductToolbar()}

        ${myProducts.length === 0 ? `
          <div class="empty-state">
            <h3>Sin productos</h3>
            <p>No hay productos de tu empresa que coincidan con la busqueda o los filtros seleccionados.</p>
          </div>
        ` : `
          <div class="product-grid">${myProducts.map(createProductCard).join('')}</div>
        `}
      `;

      activateProductToolbar(renderMyProductsSection);
    }

    /* ========================================================= */
    /* FORMULARIO DE PRODUCTOS PARA EMPRESA */
    /* ========================================================= */

    function showProductForm(productId = null) {
      const editing = productId !== null;
      const product = editing ? products.find((item) => (item.id || item.id_producto) === productId) : null;

      sectionTitle.textContent = editing ? 'Editar producto' : 'Agregar producto';
      sectionActions.innerHTML = `<button class="secondary-button" type="button" onclick="changeSection('productos')">Volver</button>`;

      dynamicContent.innerHTML = `
        <div class="panel">
          <h3>${editing ? 'Editar producto' : 'Nuevo producto'}</h3>
          <p>Completa los datos del producto. Los campos Economico y Recomendado alimentan los conjuntos A y B.</p>

          <form id="productForm" class="form-grid">
            <div class="form-group">
              <label class="form-label">Nombre</label>
              <input id="productName" class="form-input" type="text" value="${product ? (product.name || product.nombre) : ''}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Precio</label>
              <input id="productPrice" class="form-input" type="number" min="0" value="${product ? (product.price || product.precio) : ''}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Estrellas</label>
              <input id="productRating" class="form-input" type="number" min="1" max="5" value="${product ? (product.rating || product.estrellas || 3) : 3}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Categoria</label>
              <input id="productCategory" class="form-input" type="text" value="${product ? (product.category || product.nombre_categoria || '') : ''}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Empresa</label>
              <input class="form-input" type="text" value="${currentAccount?.nombre_empresa || currentAccount?.nombre || 'Mi empresa'}" disabled>
            </div>

            <div class="form-group">
              <label class="form-label">Fecha de publicacion</label>
              <input id="productDate" class="form-input" type="date" value="${product ? product.date : new Date().toISOString().slice(0, 10)}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Imagen URL</label>
              <input id="productImage" class="form-input" type="text" value="${product ? (product.image || product.imagen || baseImages[0]) : baseImages[0]}">
            </div>

            <div class="form-group">
              <label class="form-label">Descripcion</label>
              <textarea id="productDescription" class="form-textarea">${product ? (product.description || product.descripcion || '') : ''}</textarea>
            </div>

            <div class="form-group">
              <label class="checkbox-line">
                <input id="productEconomical" type="checkbox" ${product && (product.economical || Number(product.price || product.precio) < 30) ? 'checked' : ''}>
                Pertenece a A: Economico
              </label>

              <label class="checkbox-line">
                <input id="productRecommended" type="checkbox" ${product && (product.recommended || Number(product.rating || product.estrellas || 3) > 3) ? 'checked' : ''}>
                Pertenece a B: Recomendado
              </label>
            </div>

            <button class="primary-button" type="submit">${editing ? 'Guardar cambios' : 'Crear producto'}</button>
          </form>
        </div>
      `;

      document.getElementById('productForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const categoryName = document.getElementById('productCategory').value.trim();
        const data = {
          id_categoria: getCategoryIdByName(categoryName),
          nombre: document.getElementById('productName').value.trim(),
          descripcion: document.getElementById('productDescription').value.trim(),
          precio: Number(document.getElementById('productPrice').value),
          imagen: document.getElementById('productImage').value.trim() || baseImages[0],
          estrellas: Number(document.getElementById('productRating').value),
          stock: 1
        };

        if (!data.nombre || !data.precio) {
          alert('Debes escribir nombre y precio del producto.');
          return;
        }

        try {
          const url = editing
            ? `${API_URL}/productos/${product.id || product.id_producto}`
            : `${API_URL}/productos`;

          const respuesta = await fetch(url, {
            method: editing ? 'PUT' : 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
          });

          const resultado = await respuesta.json();

          if (!respuesta.ok) {
            alert(resultado.mensaje || 'No se pudo guardar el producto.');
            return;
          }

          await loadData();
          changeSection('mis-productos');
        } catch (error) {
          alert('No se pudo conectar con el backend. Revisa que npm run dev este activo.');
        }
      });
    }

    function getNextProductId() {
      if (products.length === 0) return 1;
      return Math.max(...products.map((product) => product.id)) + 1;
    }

    async function deleteProduct(productId) {
      const confirmDelete = confirm('Seguro que deseas eliminar este producto?');

      if (!confirmDelete) return;

      try {
        const respuesta = await fetch(`${API_URL}/productos/${productId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
          alert(resultado.mensaje || 'No se pudo eliminar el producto.');
          return;
        }

        favoriteProducts = favoriteProducts.filter((id) => id !== productId);

        await loadData();

        const activeSection = document.querySelector('.dashboard-item.active')?.dataset.section;
        if (activeSection === 'mis-productos') renderMyProductsSection();
        else renderProductsSection();
      } catch (error) {
        alert('No se pudo conectar con el backend. Revisa que npm run dev este activo.');
      }
    }

    /* ========================================================= */
    /* MERCADOS */
    /* ========================================================= */

    function createMarketCard(market) {
      const totalProducts = products.filter((product) => product.marketId === market.id).length;

      return `
        <article class="market-card" onclick="showMarketCatalog(${market.id})">
          <div>
            <div class="market-logo">${market.logo || 'TT'}</div>
            <h3 class="market-name">${market.name || market.nombre_empresa}</h3>
            <p class="market-description">${market.description || market.descripcion || 'Empresa registrada en Tienda Tech.'}</p>
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
      const marketProducts = products.filter((product) => getProductCompanyId(product) === marketId);

      sectionTitle.textContent = market.name;
      sectionActions.innerHTML = `<button class="secondary-button" type="button" onclick="renderMarkets()">Volver</button>`;

      dynamicContent.innerHTML = `
        <div class="catalog-header">
          <div class="catalog-header-top">
            <div class="market-logo">${market.logo || 'TT'}</div>
            <div>
              <h3 class="catalog-title">${market.name || market.nombre_empresa}</h3>
              <p class="catalog-description">${market.description || market.descripcion || 'Empresa registrada en Tienda Tech.'}</p>
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
      const marketProducts = getFilteredProducts().filter((product) => {
        return getProductCompanyId(product) === market.id;
      });

      sectionTitle.textContent = 'Modo venta';
      sectionActions.innerHTML = `
        <button class="danger-button" type="button" onclick="requestExitSaleMode()">Salir del modo venta</button>
      `;

      dynamicContent.innerHTML = `
        <div class="sale-header-card">
          <div class="sale-header-info">
            <div class="market-logo">${market.logo || 'TT'}</div>
            <div>
              <h3 class="sale-title">${market.name || market.nombre_empresa}</h3>
              <p class="sale-description">${market.description || market.descripcion || 'Empresa registrada en Tienda Tech.'}</p>
            </div>
          </div>

          <button class="danger-button" type="button" onclick="requestExitSaleMode()">Desbloquear</button>
        </div>

        <div class="sale-note">
          Catalogo de venta activo. Los usuarios pueden ver los productos disponibles, pero no pueden salir ni administrar el sistema sin la clave de la empresa.
        </div>

        ${createProductToolbar()}

        ${marketProducts.length === 0 ? `
          <div class="empty-state">
            <h3>Sin productos</h3>
            <p>No hay productos que coincidan con la busqueda o los filtros seleccionados.</p>
          </div>
        ` : `
          <div class="product-grid">${marketProducts.map(createSaleProductCard).join('')}</div>
        `}
      `;

      activateProductToolbar(renderSaleModeCatalog);
    }

    function createSaleProductCard(product) {
      return `
        <article class="product-card">
          <div class="product-image-box">
            <img class="product-image" src="${product.image || product.imagen || baseImages[0]}" alt="${product.name || product.nombre}">
          </div>

          <div class="product-info">
            <div>
              <h3 class="product-title">${product.name || product.nombre}</h3>
              <p class="product-description">${product.description || product.descripcion || 'Sin descripcion'}</p>

              <div class="product-meta">
                <span>$${product.price || product.precio}</span>
                <span>${product.category || product.nombre_categoria || 'Sin categoria'}</span>
              </div>

              <div class="rating-row">
                <span>${getStars(product.rating || product.estrellas)}</span>
                <strong>${product.rating || product.estrellas || 3}/5</strong>
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
      sectionActions.innerHTML = '';

      const nombre = getCurrentUserName();
      const correo = getCurrentUserEmail();
      const tipo = currentAccount?.tipo_cuenta || selectedRole;

      if (selectedRole === 'usuario') {
        dynamicContent.innerHTML = `
          <div class="panel-grid">
            <div class="panel">
              <h3>Perfil del usuario</h3>
              <p><strong>Nombre:</strong> ${nombre}</p>
              <p><strong>Correo:</strong> ${correo}</p>
              <p><strong>Tipo de cuenta:</strong> ${tipo}</p>

              <div class="mini-stats">
                <div class="stat-card"><span class="stat-number">${favoriteProducts.length}</span><span class="stat-label">Favoritos</span></div>
                <div class="stat-card"><span class="stat-number">${products.length}</span><span class="stat-label">Productos visibles</span></div>
              </div>
            </div>

            <div class="panel">
              <h3>Actividad</h3>
              <p>Aqui luego puedes mostrar compras, historial, preferencias, direcciones o configuracion del usuario.</p>
            </div>
          </div>
        `;
      } else {
        const myCompanyId = getCurrentCompanyId();
        const myProducts = products.filter((product) => getProductCompanyId(product) === myCompanyId);
        const recommended = myProducts.filter((product) => product.recommended).length;
        const economical = myProducts.filter((product) => product.economical).length;

        dynamicContent.innerHTML = `
          <div class="panel-grid">
            <div class="panel">
              <h3>Perfil de empresa</h3>
              <p><strong>Nombre:</strong> ${nombre}</p>
              <p><strong>Correo:</strong> ${correo}</p>
              <p><strong>Tipo de cuenta:</strong> ${tipo}</p>

              <div class="mini-stats">
                <div class="stat-card"><span class="stat-number">${myProducts.length}</span><span class="stat-label">Mis productos</span></div>
                <div class="stat-card"><span class="stat-number">${products.length}</span><span class="stat-label">Productos web</span></div>
                <div class="stat-card"><span class="stat-number">${economical}</span><span class="stat-label">Economicos</span></div>
                <div class="stat-card"><span class="stat-number">${recommended}</span><span class="stat-label">Recomendados</span></div>
              </div>
            </div>

            <div class="panel">
              <h3>Herramientas</h3>
              <p>Usa Productos para ver todo lo publicado en la web.</p>
              <br>
              <p>Usa Mis productos para agregar, editar o eliminar productos de tu empresa.</p>
              <br>
              <p>El modo venta bloquea el sistema en el catalogo de tu empresa hasta ingresar la clave.</p>
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

    toggleAuthButton.addEventListener('click', () => {
      setAuthMode(authMode === 'login' ? 'register' : 'login');
    });

    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const nombre = document.getElementById('registerNameInput').value.trim();
      const correo = document.getElementById('registerEmailInput').value.trim();
      const contrasena = document.getElementById('registerPasswordInput').value.trim();

      if (!nombre || !correo || !contrasena) {
        alert('Debes completar todos los campos.');
        return;
      }

      try {
        const respuesta = await fetch(`${API_URL}/auth/registrar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nombre,
            correo,
            contrasena,
            tipo_cuenta: selectedRole
          })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
          alert(resultado.mensaje || 'No se pudo crear la cuenta.');
          return;
        }

        alert('Cuenta creada correctamente. Ahora puedes iniciar sesion.');

        await loadData();

        registerForm.reset();
        document.getElementById('emailInput').value = correo;
        document.getElementById('passwordInput').value = '';

        setAuthMode('login');
      } catch (error) {
        alert('No se pudo conectar con el backend. Revisa que npm run dev este activo.');
      }
    });

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const correo = document.getElementById('emailInput').value.trim();
      const contrasena = document.getElementById('passwordInput').value.trim();

      if (!correo || !contrasena) {
        alert('Debes escribir correo y contrasena.');
        return;
      }

      try {
        const respuesta = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            correo,
            contrasena,
            tipo_cuenta: selectedRole
          })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
          alert(resultado.mensaje || 'No se pudo iniciar sesion.');
          return;
        }

        authToken = resultado.token;
        currentAccount = resultado.usuario;

        localStorage.setItem('tiendaTechToken', resultado.token);
        localStorage.setItem('tiendaTechUsuario', JSON.stringify(resultado.usuario));

        startSession(resultado.usuario.tipo_cuenta, resultado.usuario);
      } catch (error) {
        alert('No se pudo conectar con el backend. Revisa que npm run dev este activo.');
      }
    });

    logoutButton.addEventListener('click', logout);

    setAuthMode('login');
    loadData();