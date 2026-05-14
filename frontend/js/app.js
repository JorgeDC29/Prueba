import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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
    let authToken = localStorage.getItem('tiendaTechUid') || '';
    let authMode = 'login';

    const ADMIN_EMAILS = [
      "jorge.delacruz170705@gmail.com"
    ];

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
      return String(product.id_empresa || product.marketId || '');
    }

    function getCurrentCompanyId() {
      return String(currentAccount?.id_empresa || currentAccount?.marketId || companyMarketId || '');
    }

    function getCurrentUserName() {
      return currentAccount?.nombre || 'Sin nombre';
    }

    function getCurrentUserEmail() {
      return currentAccount?.correo || 'Sin correo';
    }

    function isAdminAccount() {
      return currentAccount?.correo && ADMIN_EMAILS.includes(currentAccount.correo.toLowerCase());
    }

    function normalizeUsername(username) {
      return String(username || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_');
    }

    function isEmail(value) {
      return String(value || '').includes('@');
    }

    function getCategoryIdByName(categoryName) {
      return categoryName || null;
    }

    function formatFirebaseDate(value) {
      if (!value) return new Date().toISOString().slice(0, 10);

      if (typeof value === 'string') return value.slice(0, 10);

      if (value.toDate) {
        return value.toDate().toISOString().slice(0, 10);
      }

      return new Date().toISOString().slice(0, 10);
    }

    function jsString(value) {
      return JSON.stringify(String(value));
    };

    /* ========================================================= */
    /* DATOS FIREBASE */
    /* ========================================================= */

    async function loadData() {
      try {
        const empresasSnapshot = await getDocs(collection(db, "empresas"));

        markets = empresasSnapshot.docs
          .map((empresaDoc) => {
            const empresa = empresaDoc.data();

            return {
              id: empresaDoc.id,
              id_empresa: empresaDoc.id,
              id_usuario: empresa.id_usuario || empresa.uid || empresaDoc.id,
              name: empresa.nombre_empresa || empresa.nombre || "Empresa sin nombre",
              nombre_empresa: empresa.nombre_empresa || empresa.nombre || "Empresa sin nombre",
              logo: empresa.logo || (empresa.nombre_empresa || empresa.nombre || "TT").slice(0, 2).toUpperCase(),
              description: empresa.descripcion || "Empresa registrada en Tienda Tech.",
              descripcion: empresa.descripcion || "Empresa registrada en Tienda Tech.",
              correo: empresa.correo || "",
              telefono: empresa.telefono || "",
              direccion: empresa.direccion || "",
              categoria_principal: empresa.categoria_principal || "",
              encargado: empresa.encargado || "",
              aprobado: empresa.aprobado === true,
              estado: empresa.estado || "pendiente"
            };
          })
          .filter((empresa) => {
            if (empresa.aprobado) return true;
            return currentAccount?.tipo_cuenta === "empresa" && String(currentAccount.id_empresa) === String(empresa.id_empresa);
          });

        const productosSnapshot = await getDocs(collection(db, "productos"));

        products = productosSnapshot.docs.map((productDoc) => {
          const product = productDoc.data();
          const precio = Number(product.precio || product.price || 0);
          const promedio = Number(product.calificacion_promedio_producto || product.estrellas || product.rating || 0);

          return {
            id: productDoc.id,
            id_producto: productDoc.id,
            marketId: product.id_empresa || product.marketId || "",
            id_empresa: product.id_empresa || product.marketId || "",
            category: product.nombre_categoria || product.category || "Sin categoria",
            id_categoria: product.id_categoria || product.category || null,
            name: product.nombre || product.name || "Producto sin nombre",
            nombre: product.nombre || product.name || "Producto sin nombre",
            description: product.descripcion || product.description || product.descripcion_corta || "Sin descripcion",
            descripcion: product.descripcion || product.description || product.descripcion_corta || "Sin descripcion",
            descripcion_corta: product.descripcion_corta || product.descripcion || product.description || "Sin descripcion",
            descripcion_completa: product.descripcion_completa || product.descripcion || product.description || "Sin descripcion",
            marca: product.marca || "",
            modelo: product.modelo || "",
            condicion: product.condicion || "nuevo",
            garantia: product.garantia || "",
            price: precio,
            precio: precio,
            image: product.imagen || product.image || baseImages[0],
            imagen: product.imagen || product.image || baseImages[0],
            rating: promedio,
            estrellas: promedio,
            total_calificaciones_producto: Number(product.total_calificaciones_producto || 0),
            stock: Number(product.stock || 0),
            estado: product.estado || "activo",
            date: formatFirebaseDate(product.fecha_publicacion || product.date),
            economical: precio < 30,
            recommended: promedio > 3,
            nombre_empresa: product.nombre_empresa || "Sin empresa"
          };
        });

        products.sort((a, b) => new Date(b.date) - new Date(a.date));
      } catch (error) {
        alert("No se pudieron cargar los datos desde Firebase.");
        markets = [];
        products = [];
      }
    }

    async function loadFavorites() {
      if (selectedRole !== "usuario" || !currentAccount?.id_usuario) {
        favoriteProducts = [];
        return;
      }

      try {
        const favoritosQuery = query(
          collection(db, "favoritos"),
          where("id_usuario", "==", currentAccount.id_usuario),
          where("estado", "==", "activo")
        );

        const favoritosSnapshot = await getDocs(favoritosQuery);

        favoriteProducts = favoritosSnapshot.docs.map((favoriteDoc) => {
          return favoriteDoc.data().id_producto;
        });
      } catch (error) {
        favoriteProducts = [];
      }
    }

    function saveAll() {
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
    const authTypeBox = document.getElementById('authTypeBox');
    const emailLabel = document.getElementById('emailLabel');
    const registerEmailLabel = document.getElementById('registerEmailLabel');
    const loginSubmit = document.getElementById('loginSubmit');
    const registerSubmit = document.getElementById('registerSubmit');
    const registerNameLabel = document.getElementById('registerNameLabel');
    const userRegisterFields = document.getElementById('userRegisterFields');
    const companyRegisterFields = document.getElementById('companyRegisterFields');
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

      emailLabel.textContent = 'Correo o nombre de usuario';
      loginSubmit.textContent = 'Iniciar sesion';

      if (role === 'usuario') {
        if (registerNameLabel) registerNameLabel.textContent = 'Nombre completo';
        if (registerEmailLabel) registerEmailLabel.textContent = 'Correo del usuario';
        if (registerSubmit) registerSubmit.textContent = 'Crear cuenta de usuario';
        if (userRegisterFields) userRegisterFields.classList.remove('hidden');
        if (companyRegisterFields) companyRegisterFields.classList.add('hidden');
      } else {
        if (registerNameLabel) registerNameLabel.textContent = 'Nombre de la empresa';
        if (registerEmailLabel) registerEmailLabel.textContent = 'Correo de la empresa';
        if (registerSubmit) registerSubmit.textContent = 'Crear cuenta de empresa';
        if (userRegisterFields) userRegisterFields.classList.add('hidden');
        if (companyRegisterFields) companyRegisterFields.classList.remove('hidden');
      }
    }

    function setAuthMode(mode) {
      authMode = mode;

      const isRegister = mode === 'register';

      loginForm.classList.toggle('hidden', isRegister);
      registerForm.classList.toggle('hidden', !isRegister);

      authTitle.textContent = isRegister ? 'Crear cuenta' : 'Inicio de sesion';
      authText.textContent = isRegister
        ? 'Elige si crearas una cuenta de usuario o empresa. Luego podras iniciar sesion con tu correo o nombre de usuario.'
        : 'Entra con tu correo o nombre de usuario. El sistema detectara automaticamente tu tipo de cuenta.';

      authHelpText.textContent = isRegister ? 'Ya tienes cuenta?' : 'No tienes cuenta?';
      toggleAuthButton.textContent = isRegister ? 'Iniciar sesion' : 'Crear cuenta';

      if (authTypeBox) {
        authTypeBox.classList.toggle('hidden', !isRegister);
      }

      selectLoginType(selectedRole);
    }

    async function startSession(role, account) {
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

      await loadData();

      if (role === 'usuario') {
        await loadFavorites();
      }

      renderDashboard(role);
      changeSection(role === 'usuario' ? 'inicio' : 'productos');
    }

    async function logout() {
      authToken = '';
      currentAccount = null;
      selectedRole = 'usuario';
      favoriteProducts = [];

      localStorage.removeItem('tiendaTechUid');
      localStorage.removeItem('tiendaTechUsuario');

      try {
        await signOut(auth);
      } catch (error) {
      }

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
      let options = role === 'usuario' ? [...userDashboardOptions] : [...companyDashboardOptions];

      if (isAdminAccount()) {
        options.push({
          name: 'Admin',
          section: 'admin',
          icon: 'admin_panel_settings'
        });
      }

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
      if (sectionName === 'admin') renderAdminSection();
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

      const activeProducts = products.filter((product) => product.estado !== "inhabilitado");

      const economicProducts = activeProducts
        .filter((product) => Number(product.price) < 30)
        .slice(0, 10);

      const recommendedProducts = activeProducts
        .filter((product) => Number(product.rating) > 3);

      const economicRecommendedProducts = activeProducts
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
        union: 'A U B: muestra productos con precio menor a $30, con promedio mayor a 3 estrellas o ambas cosas.',
        interseccion: 'A ∩ B: muestra productos con precio menor a $30 y promedio mayor a 3 estrellas.',
        complemento: 'A - B: muestra productos con precio menor a $30 que aun no son recomendados por calificacion.',
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
        <article class="product-card" onclick='showProductDetail(${jsString(productId)})'>
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
                ${product.estado === "inhabilitado" ? '<span class="tag">Inhabilitado</span>' : ''}
              </div>
            </div>

            <div class="card-actions">
              ${selectedRole === 'usuario' ? `
                <button class="small-button ${isFavorite ? 'active' : ''}" type="button" onclick='event.stopPropagation(); toggleFavorite(${jsString(productId)})'>${isFavorite ? 'Guardado' : 'Guardar'}</button>
              ` : activeSection === 'mis-productos' ? `
                <button class="small-button" type="button" onclick='event.stopPropagation(); showProductForm(${jsString(productId)})'>Editar</button>
                ${product.estado === "inhabilitado" ? `
                  <button class="small-button" type="button" onclick='event.stopPropagation(); enableProduct(${jsString(productId)})'>Reactivar</button>
                ` : `
                  <button class="small-button danger" type="button" onclick='event.stopPropagation(); disableProduct(${jsString(productId)})'>Inhabilitar</button>
                `}
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
          return String(product.name || product.nombre || '').toLowerCase().includes(term) ||
                 String(product.description || product.descripcion || '').toLowerCase().includes(term) ||
                 String(product.category || product.nombre_categoria || '').toLowerCase().includes(term);
        });
      }

      if (selectedCategory !== '') {
        filtered = filtered.filter((product) => (product.category || product.nombre_categoria) === selectedCategory);
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
              <option value="union" ${setOperation === 'union' ? 'selected' : ''}>Precio bajo o bien calificados</option>
              <option value="interseccion" ${setOperation === 'interseccion' ? 'selected' : ''}>Precio bajo y bien calificados</option>
              <option value="complemento" ${setOperation === 'complemento' ? 'selected' : ''}>Precio bajo sin recomendacion</option>
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

      const filteredProducts = getFilteredProducts().filter((product) => product.estado !== "inhabilitado");

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
      return [...new Set(products.map((product) => (product.category || product.nombre_categoria || 'Sin categoria')))].sort();
    }

    async function toggleFavorite(productId) {
      if (!currentAccount?.id_usuario || selectedRole !== "usuario") {
        alert("Debes iniciar sesion como usuario para guardar favoritos.");
        return;
      }

      try {
        const favoritosQuery = query(
          collection(db, "favoritos"),
          where("id_usuario", "==", currentAccount.id_usuario),
          where("id_producto", "==", productId),
          where("estado", "==", "activo")
        );

        const favoritosSnapshot = await getDocs(favoritosQuery);

        if (!favoritosSnapshot.empty) {
          const favoritoDoc = favoritosSnapshot.docs[0];
          await updateDoc(doc(db, "favoritos", favoritoDoc.id), {
            estado: "inactivo"
          });

          favoriteProducts = favoriteProducts.filter((id) => id !== productId);
        } else {
          await addDoc(collection(db, "favoritos"), {
            id_usuario: currentAccount.id_usuario,
            id_producto: productId,
            estado: "activo",
            fecha_guardado: serverTimestamp()
          });

          favoriteProducts.push(productId);
        }

        await loadFavorites();

        const activeSection = document.querySelector('.dashboard-item.active')?.dataset.section;

        if (activeSection === 'favoritos') renderFavorites();
        if (activeSection === 'productos') renderProductsSection();
        if (activeSection === 'inicio') renderHome();
      } catch (error) {
        alert("No se pudo actualizar favoritos en Firebase.");
      }
    }

    function renderMyProductsSection() {
      sectionTitle.textContent = 'Mis productos';

      const isApproved = currentAccount?.aprobado === true;

      sectionActions.innerHTML = isApproved
        ? `<button class="primary-button" type="button" onclick="showProductForm()">Agregar producto</button>`
        : '';

      const myCompanyId = getCurrentCompanyId();
      const myProducts = getFilteredProducts().filter((product) => {
        return getProductCompanyId(product) === myCompanyId;
      });

      const activeCount = myProducts.filter((product) => product.estado !== "inhabilitado").length;
      const inactiveCount = myProducts.filter((product) => product.estado === "inhabilitado").length;

      dynamicContent.innerHTML = `
        <div class="panel">
          <h3>Resumen de mis productos</h3>
          <div class="mini-stats">
            <div class="stat-card"><span class="stat-number">${activeCount}</span><span class="stat-label">Activos</span></div>
            <div class="stat-card"><span class="stat-number">${inactiveCount}</span><span class="stat-label">Inhabilitados</span></div>
          </div>
        </div>

        ${!isApproved ? `
          <div class="empty-state">
            <h3>Empresa pendiente de aprobacion</h3>
            <p>Tu correo ya puede estar verificado, pero tu empresa aun debe ser aprobada antes de publicar productos.</p>
          </div>
        ` : ''}

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

    async function getRatings(collectionName, fieldName, value) {
      try {
        const ratingsQuery = query(
          collection(db, collectionName),
          where(fieldName, "==", value),
          where("estado", "==", "activo")
        );

        const ratingsSnapshot = await getDocs(ratingsQuery);

        return ratingsSnapshot.docs.map((ratingDoc) => ({
          id: ratingDoc.id,
          ...ratingDoc.data()
        }));
      } catch (error) {
        return [];
      }
    }

    function getRatingAverage(ratings) {
      if (ratings.length === 0) {
        return {
          average: 0,
          total: 0
        };
      }

      const totalPoints = ratings.reduce((sum, rating) => sum + Number(rating.puntuacion || 0), 0);
      const average = Math.round(totalPoints / ratings.length);

      return {
        average,
        total: ratings.length
      };
    }

    function createRatingSummary(title, ratings) {
      const data = getRatingAverage(ratings);

      return `
        <div class="panel">
          <h3>${title}</h3>
          <div class="rating-row">
            <span>${getStars(data.average)}</span>
            <strong>${data.average || 0}/5</strong>
          </div>
          <p>${data.total} calificaciones registradas.</p>
        </div>
      `;
    }

    function createRatingForm(type, targetId) {
      if (selectedRole !== "usuario") {
        return `
          <div class="panel">
            <h3>Calificar</h3>
            <p>Solo las cuentas de usuario pueden calificar productos y empresas.</p>
          </div>
        `;
      }

      const title = type === "producto" ? "Calificar producto" : "Calificar empresa";
      const formId = type === "producto" ? "productRatingForm" : "companyRatingForm";
      const selectId = type === "producto" ? "productRatingSelect" : "companyRatingSelect";
      const commentId = type === "producto" ? "productRatingComment" : "companyRatingComment";

      return `
        <div class="panel">
          <h3>${title}</h3>
          <form id="${formId}" class="form-grid">
            <div class="form-group">
              <label class="form-label">Puntuacion</label>
              <select id="${selectId}" class="form-select">
                <option value="5">5 estrellas</option>
                <option value="4">4 estrellas</option>
                <option value="3">3 estrellas</option>
                <option value="2">2 estrellas</option>
                <option value="1">1 estrella</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Comentario opcional</label>
              <textarea id="${commentId}" class="form-textarea" placeholder="Escribe una opinion breve"></textarea>
            </div>

            <button class="primary-button" type="submit">Guardar calificacion</button>
          </form>
        </div>
      `;
    }

    async function showProductDetail(productId) {
      const product = products.find((item) => String(item.id || item.id_producto) === String(productId));

      if (!product) {
        sectionTitle.textContent = "Producto no encontrado";
        sectionActions.innerHTML = `<button class="secondary-button" type="button" onclick="changeSection('productos')">Volver</button>`;
        dynamicContent.innerHTML = `
          <div class="empty-state">
            <h3>No se encontro este producto</h3>
            <p>Actualiza la pagina o vuelve al catalogo.</p>
          </div>
        `;
        return;
      }

      const isOwnerCompany = selectedRole === "empresa" && getProductCompanyId(product) === getCurrentCompanyId();

      if (product.estado === "inhabilitado" && !isOwnerCompany) {
        sectionTitle.textContent = "Producto no disponible";
        sectionActions.innerHTML = `<button class="secondary-button" type="button" onclick="changeSection('productos')">Volver</button>`;
        dynamicContent.innerHTML = `
          <div class="empty-state">
            <h3>Producto no disponible</h3>
            <p>Este producto fue inhabilitado por la empresa.</p>
          </div>
        `;
        return;
      }

      const productRatings = await getRatings("calificaciones_productos", "id_producto", product.id || product.id_producto);
      const companyRatings = await getRatings("calificaciones_empresas", "id_empresa", getProductCompanyId(product));

      const productAverage = getRatingAverage(productRatings);
      const companyAverage = getRatingAverage(companyRatings);

      sectionTitle.textContent = product.name || product.nombre || "Detalle del producto";
      sectionActions.innerHTML = `<button class="secondary-button" type="button" onclick="changeSection('productos')">Volver</button>`;

      const isFavorite = favoriteProducts.includes(product.id || product.id_producto);

      dynamicContent.innerHTML = `
        <div class="panel-grid">
          <div class="panel">
            <div class="product-image-box">
              <img class="product-image" src="${product.image || product.imagen || baseImages[0]}" alt="${product.name || product.nombre}">
            </div>
          </div>

          <div class="panel">
            <h3>${product.name || product.nombre}</h3>
            <p>${product.descripcion_completa || product.description || product.descripcion || "Sin descripcion"}</p>

            <div class="product-meta">
              <span>$${product.price || product.precio}</span>
              <span>${product.category || product.nombre_categoria || "Sin categoria"}</span>
              <span>${product.estado === "inhabilitado" ? "Inhabilitado" : "Disponible"}</span>
            </div>

            <div class="rating-row">
              <span>${getStars(productAverage.average)}</span>
              <strong>${productAverage.average || 0}/5 producto</strong>
            </div>

            <div class="rating-row">
              <span>${getStars(companyAverage.average)}</span>
              <strong>${companyAverage.average || 0}/5 empresa</strong>
            </div>

            <br>

            <p><strong>Empresa:</strong> ${product.nombre_empresa || "Sin empresa"}</p>
            <p><strong>Marca:</strong> ${product.marca || "No indicada"}</p>
            <p><strong>Modelo:</strong> ${product.modelo || "No indicado"}</p>
            <p><strong>Condicion:</strong> ${product.condicion || "No indicada"}</p>
            <p><strong>Garantia:</strong> ${product.garantia || "No indicada"}</p>
            <p><strong>Stock:</strong> ${product.stock || 0}</p>
            <p><strong>Fecha:</strong> ${product.date || "Sin fecha"}</p>

            ${selectedRole === "usuario" ? `
              <br>
              <button class="small-button ${isFavorite ? 'active' : ''}" type="button" onclick='toggleFavorite(${jsString(product.id || product.id_producto)}).then(() => showProductDetail(${jsString(product.id || product.id_producto)}))'>
                ${isFavorite ? 'Quitar de favoritos' : 'Guardar favorito'}
              </button>
            ` : ''}
          </div>
        </div>

        <div class="panel-grid">
          ${createRatingSummary("Calificacion del producto", productRatings)}
          ${createRatingSummary("Calificacion de la empresa", companyRatings)}
        </div>

        <div class="panel-grid">
          ${createRatingForm("producto", product.id || product.id_producto)}
          ${createRatingForm("empresa", getProductCompanyId(product))}
        </div>

        <section class="home-product-section">
          <div class="home-product-header">
            <div>
              <h3>Opiniones del producto</h3>
              <p>Comentarios recientes de usuarios.</p>
            </div>
            <span>${productRatings.length} opiniones</span>
          </div>

          ${productRatings.length === 0 ? `
            <div class="empty-state">
              <h3>Sin opiniones</h3>
              <p>Aun no hay calificaciones para este producto.</p>
            </div>
          ` : `
            <div class="panel-grid">
              ${productRatings.slice(0, 6).map((rating) => `
                <div class="panel">
                  <div class="rating-row">
                    <span>${getStars(rating.puntuacion)}</span>
                    <strong>${rating.puntuacion}/5</strong>
                  </div>
                  <p>${rating.comentario || "Sin comentario."}</p>
                </div>
              `).join('')}
            </div>
          `}
        </section>
      `;

      const productRatingForm = document.getElementById("productRatingForm");
      const companyRatingForm = document.getElementById("companyRatingForm");

      if (productRatingForm) {
        productRatingForm.addEventListener("submit", async (event) => {
          event.preventDefault();

          await saveRating("calificaciones_productos", "id_producto", product.id || product.id_producto, {
            puntuacion: Number(document.getElementById("productRatingSelect").value),
            comentario: document.getElementById("productRatingComment").value.trim()
          });

          await showProductDetail(product.id || product.id_producto);
        });
      }

      if (companyRatingForm) {
        companyRatingForm.addEventListener("submit", async (event) => {
          event.preventDefault();

          await saveRating("calificaciones_empresas", "id_empresa", getProductCompanyId(product), {
            puntuacion: Number(document.getElementById("companyRatingSelect").value),
            comentario: document.getElementById("companyRatingComment").value.trim()
          });

          await showProductDetail(product.id || product.id_producto);
        });
      }
    }

    async function saveRating(collectionName, fieldName, targetId, data) {
      if (selectedRole !== "usuario" || !currentAccount?.id_usuario) {
        alert("Debes iniciar sesion como usuario para calificar.");
        return;
      }

      try {
        const ratingQuery = query(
          collection(db, collectionName),
          where("id_usuario", "==", currentAccount.id_usuario),
          where(fieldName, "==", targetId),
          where("estado", "==", "activo")
        );

        const ratingSnapshot = await getDocs(ratingQuery);

        const ratingData = {
          id_usuario: currentAccount.id_usuario,
          nombre_usuario: currentAccount.nombre_usuario || currentAccount.nombre || "Usuario",
          [fieldName]: targetId,
          puntuacion: data.puntuacion,
          comentario: data.comentario || "",
          estado: "activo",
          fecha: serverTimestamp()
        };

        if (!ratingSnapshot.empty) {
          await updateDoc(doc(db, collectionName, ratingSnapshot.docs[0].id), ratingData);
        } else {
          await addDoc(collection(db, collectionName), ratingData);
        }

        const updatedRatings = await getRatings(collectionName, fieldName, targetId);
        const updatedAverage = getRatingAverage(updatedRatings);

        if (collectionName === "calificaciones_productos") {
          await updateDoc(doc(db, "productos", targetId), {
            calificacion_promedio_producto: updatedAverage.average,
            total_calificaciones_producto: updatedAverage.total
          });
        }

        if (collectionName === "calificaciones_empresas") {
          await updateDoc(doc(db, "empresas", targetId), {
            calificacion_promedio_empresa: updatedAverage.average,
            total_calificaciones_empresa: updatedAverage.total
          });
        }

        await loadData();

        alert("Calificacion guardada correctamente.");
      } catch (error) {
        alert("No se pudo guardar la calificacion.");
      }
    }

    /* ========================================================= */
    /* FORMULARIO DE PRODUCTOS PARA EMPRESA */
    /* ========================================================= */

    function showProductForm(productId = null) {
      if (selectedRole === 'empresa' && currentAccount?.aprobado !== true) {
        alert('Tu empresa aun esta pendiente de aprobacion. No puedes publicar productos todavia.');
        renderMyProductsSection();
        return;
      }

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
              <label class="form-label">Nombre del producto</label>
              <input id="productName" class="form-input" type="text" value="${product ? (product.name || product.nombre) : ''}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Categoria</label>
              <select id="productCategory" class="form-select" required>
                ${['Tecnologia', 'Gaming', 'Audio', 'Oficina', 'Hogar', 'Comida', 'Ropa', 'Otros'].map((category) => `
                  <option value="${category}" ${product && (product.category || product.nombre_categoria) === category ? 'selected' : ''}>${category}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Precio</label>
              <input id="productPrice" class="form-input" type="number" min="0" step="0.01" value="${product ? (product.price || product.precio) : ''}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Stock disponible</label>
              <input id="productStock" class="form-input" type="number" min="0" value="${product ? (product.stock || 0) : 1}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Marca</label>
              <input id="productBrand" class="form-input" type="text" value="${product ? (product.marca || '') : ''}" placeholder="Ejemplo: Lenovo, Samsung, Logitech">
            </div>

            <div class="form-group">
              <label class="form-label">Modelo</label>
              <input id="productModel" class="form-input" type="text" value="${product ? (product.modelo || '') : ''}" placeholder="Modelo o referencia">
            </div>

            <div class="form-group">
              <label class="form-label">Condicion</label>
              <select id="productCondition" class="form-select">
                <option value="nuevo" ${product && product.condicion === 'nuevo' ? 'selected' : ''}>Nuevo</option>
                <option value="usado" ${product && product.condicion === 'usado' ? 'selected' : ''}>Usado</option>
                <option value="reacondicionado" ${product && product.condicion === 'reacondicionado' ? 'selected' : ''}>Reacondicionado</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Garantia</label>
              <input id="productWarranty" class="form-input" type="text" value="${product ? (product.garantia || '') : ''}" placeholder="Ejemplo: 30 dias, 6 meses, sin garantia">
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
              <label class="form-label">Descripcion corta</label>
              <textarea id="productShortDescription" class="form-textarea" placeholder="Resumen breve para la tarjeta">${product ? (product.descripcion_corta || product.description || product.descripcion || '') : ''}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Descripcion completa</label>
              <textarea id="productFullDescription" class="form-textarea" placeholder="Detalles completos del producto">${product ? (product.descripcion_completa || product.description || product.descripcion || '') : ''}</textarea>
            </div>

            <div class="panel">
              <h3>Clasificacion automatica</h3>
              <p>Economico se calcula solo si el precio es menor a $30.</p>
              <p>Recomendado se calcula solo cuando el promedio de calificaciones sea mayor a 3 estrellas.</p>
              <p>La empresa no puede elegir las estrellas; las calificaciones las dan los usuarios.</p>
            </div>

            <button class="primary-button" type="submit">${editing ? 'Guardar cambios' : 'Crear producto'}</button>
          </form>
        </div>
      `;

      document.getElementById('productForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const categoryName = document.getElementById('productCategory').value.trim();
        const companyId = getCurrentCompanyId();
        const companyName = currentAccount?.nombre_empresa || currentAccount?.nombre || "Mi empresa";
        const shortDescription = document.getElementById('productShortDescription').value.trim();
        const fullDescription = document.getElementById('productFullDescription').value.trim();

        const data = {
          id_empresa: companyId,
          id_categoria: getCategoryIdByName(categoryName),
          nombre_categoria: categoryName,
          nombre: document.getElementById('productName').value.trim(),
          descripcion: shortDescription || fullDescription || "Sin descripcion",
          descripcion_corta: shortDescription || "Sin descripcion",
          descripcion_completa: fullDescription || shortDescription || "Sin descripcion",
          precio: Number(document.getElementById('productPrice').value),
          imagen: document.getElementById('productImage').value.trim() || baseImages[0],
          stock: Number(document.getElementById('productStock').value),
          marca: document.getElementById('productBrand').value.trim(),
          modelo: document.getElementById('productModel').value.trim(),
          condicion: document.getElementById('productCondition').value,
          garantia: document.getElementById('productWarranty').value.trim(),
          estado: editing ? (product.estado || "activo") : "activo",
          nombre_empresa: companyName,
          fecha_publicacion: document.getElementById('productDate').value || new Date().toISOString().slice(0, 10)
        };

        if (!data.nombre || !data.precio) {
          alert('Debes escribir nombre y precio del producto.');
          return;
        }

        try {
          if (editing) {
            await updateDoc(doc(db, "productos", product.id || product.id_producto), data);
          } else {
            await addDoc(collection(db, "productos"), {
              ...data,
              creado_en: serverTimestamp()
            });
          }

          await loadData();
          changeSection('mis-productos');
        } catch (error) {
          alert('No se pudo guardar el producto en Firebase.');
        }
      });
    }

    function getNextProductId() {
      if (products.length === 0) return 1;
      return Math.max(...products.map((product) => product.id)) + 1;
    }

    async function disableProduct(productId) {
      const confirmDisable = confirm('Inhabilitar este producto? Dejare de aparecer publicamente, pero seguira en Mis productos.');

      if (!confirmDisable) return;

      try {
        const product = products.find((item) => (item.id || item.id_producto) === productId);

        if (!product || getProductCompanyId(product) !== getCurrentCompanyId()) {
          alert('No puedes inhabilitar productos de otra empresa.');
          return;
        }

        await updateDoc(doc(db, "productos", productId), {
          estado: "inhabilitado"
        });

        await loadData();
        renderMyProductsSection();
      } catch (error) {
        alert('No se pudo inhabilitar el producto en Firebase.');
      }
    }

    async function enableProduct(productId) {
      const confirmEnable = confirm('Reactivar este producto? Volvera a aparecer publicamente.');

      if (!confirmEnable) return;

      try {
        const product = products.find((item) => (item.id || item.id_producto) === productId);

        if (!product || getProductCompanyId(product) !== getCurrentCompanyId()) {
          alert('No puedes reactivar productos de otra empresa.');
          return;
        }

        await updateDoc(doc(db, "productos", productId), {
          estado: "activo"
        });

        await loadData();
        renderMyProductsSection();
      } catch (error) {
        alert('No se pudo reactivar el producto en Firebase.');
      }
    }

    async function deleteProduct(productId) {
      await disableProduct(productId);
    }

    /* ========================================================= */
    /* MERCADOS */
    /* ========================================================= */

    function createMarketCard(market) {
      const totalProducts = products.filter((product) => getProductCompanyId(product) === String(market.id) && product.estado !== "inhabilitado").length;

      return `
        <article class="market-card" onclick='showMarketCatalog(${jsString(market.id)})'>
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
      const market = markets.find((item) => String(item.id) === String(marketId));

      if (!market) {
        sectionTitle.textContent = 'Mercado no encontrado';
        sectionActions.innerHTML = `<button class="secondary-button" type="button" onclick="renderMarkets()">Volver</button>`;
        dynamicContent.innerHTML = `
          <div class="empty-state">
            <h3>No se encontro este mercado</h3>
            <p>Actualiza la pagina o vuelve a la seccion Mercados.</p>
          </div>
        `;
        return;
      }

      const marketProducts = products.filter((product) => getProductCompanyId(product) === String(marketId) && product.estado !== "inhabilitado");

      sectionTitle.textContent = market.name || market.nombre_empresa;
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
      if (selectedRole === 'empresa' && currentAccount?.aprobado !== true) {
        alert('Tu empresa aun esta pendiente de aprobacion. No puedes activar modo venta todavia.');
        changeSection('perfil');
        return;
      }

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
        return getProductCompanyId(product) === market.id && product.estado !== "inhabilitado";
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
      const productId = product.id || product.id_producto;

      return `
        <article class="product-card" onclick='showProductDetail(${jsString(productId)})'>
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
      const favorites = products.filter((product) => favoriteProducts.includes(product.id) && product.estado !== "inhabilitado");

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
              <p><strong>Correo:</strong> ${correo}</p>\n              <p><strong>Usuario:</strong> ${currentAccount?.nombre_usuario || 'No registrado'}</p>\n              <p><strong>Usuario:</strong> ${currentAccount?.nombre_usuario || 'No registrado'}</p>
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
    /* ADMINISTRACION */
    /* ========================================================= */

    async function renderAdminSection() {
      if (!isAdminAccount()) {
        sectionTitle.textContent = 'Acceso denegado';
        sectionActions.innerHTML = '';
        dynamicContent.innerHTML = `
          <div class="empty-state">
            <h3>No tienes permisos de administrador</h3>
            <p>Esta seccion solo esta disponible para cuentas autorizadas.</p>
          </div>
        `;
        return;
      }

      sectionTitle.textContent = 'Panel de administrador';
      sectionActions.innerHTML = `<button class="secondary-button" type="button" onclick="renderAdminSection()">Actualizar</button>`;

      try {
        const empresasSnapshot = await getDocs(collection(db, "empresas"));

        const empresas = empresasSnapshot.docs.map((empresaDoc) => ({
          id: empresaDoc.id,
          ...empresaDoc.data()
        }));

        const pendientes = empresas.filter((empresa) => empresa.aprobado !== true && empresa.estado !== "rechazada");
        const aprobadas = empresas.filter((empresa) => empresa.aprobado === true);
        const rechazadas = empresas.filter((empresa) => empresa.estado === "rechazada");

        dynamicContent.innerHTML = `
          <div class="panel-grid">
            <div class="panel">
              <h3>Resumen</h3>
              <div class="mini-stats">
                <div class="stat-card"><span class="stat-number">${pendientes.length}</span><span class="stat-label">Pendientes</span></div>
                <div class="stat-card"><span class="stat-number">${aprobadas.length}</span><span class="stat-label">Aprobadas</span></div>
                <div class="stat-card"><span class="stat-number">${rechazadas.length}</span><span class="stat-label">Rechazadas</span></div>
              </div>
            </div>

            <div class="panel">
              <h3>Funcion del admin</h3>
              <p>Desde aqui puedes aprobar empresas para que aparezcan en Mercados y puedan publicar productos.</p>
            </div>
          </div>

          <section class="home-product-section">
            <div class="home-product-header">
              <div>
                <h3>Empresas pendientes</h3>
                <p>Revisa los datos antes de aprobar una empresa.</p>
              </div>
              <span>${pendientes.length} pendientes</span>
            </div>

            ${pendientes.length === 0 ? `
              <div class="empty-state">
                <h3>Sin empresas pendientes</h3>
                <p>No hay solicitudes nuevas por aprobar.</p>
              </div>
            ` : `
              <div class="market-grid">
                ${pendientes.map((empresa) => createAdminCompanyCard(empresa)).join('')}
              </div>
            `}
          </section>
        `;
      } catch (error) {
        dynamicContent.innerHTML = `
          <div class="empty-state">
            <h3>Error al cargar empresas</h3>
            <p>No se pudo consultar Firestore.</p>
          </div>
        `;
      }
    }

    function createAdminCompanyCard(empresa) {
      return `
        <article class="market-card">
          <div>
            <div class="market-logo">${empresa.logo || (empresa.nombre_empresa || 'TT').slice(0, 2).toUpperCase()}</div>
            <h3 class="market-name">${empresa.nombre_empresa || empresa.nombre || 'Empresa sin nombre'}</h3>
            <p class="market-description">${empresa.descripcion || 'Sin descripcion registrada.'}</p>
            <p class="market-description"><strong>Correo:</strong> ${empresa.correo || 'Sin correo'}</p>
            <p class="market-description"><strong>Encargado:</strong> ${empresa.encargado || 'No indicado'}</p>
            <p class="market-description"><strong>Telefono:</strong> ${empresa.telefono || 'No indicado'}</p>
            <p class="market-description"><strong>Direccion:</strong> ${empresa.direccion || 'No indicada'}</p>
            <p class="market-description"><strong>Categoria:</strong> ${empresa.categoria_principal || 'No indicada'}</p>
          </div>

          <div class="card-actions">
            <button class="small-button" type="button" onclick='approveCompany(${jsString(empresa.id)})'>Aprobar</button>
            <button class="small-button danger" type="button" onclick='rejectCompany(${jsString(empresa.id)})'>Rechazar</button>
          </div>
        </article>
      `;
    }

    async function approveCompany(companyId) {
      if (!isAdminAccount()) {
        alert('No tienes permisos de administrador.');
        return;
      }

      const confirmApprove = confirm('Aprobar esta empresa? Podra aparecer en Mercados y publicar productos.');

      if (!confirmApprove) return;

      try {
        await updateDoc(doc(db, "empresas", companyId), {
          aprobado: true,
          estado: "aprobada",
          aprobado_por: currentAccount.correo,
          fecha_aprobacion: serverTimestamp()
        });

        alert('Empresa aprobada correctamente.');
        await loadData();
        renderAdminSection();
      } catch (error) {
        alert('No se pudo aprobar la empresa.');
      }
    }

    async function rejectCompany(companyId) {
      if (!isAdminAccount()) {
        alert('No tienes permisos de administrador.');
        return;
      }

      const confirmReject = confirm('Rechazar esta empresa? No aparecera en Mercados ni podra publicar.');

      if (!confirmReject) return;

      try {
        await updateDoc(doc(db, "empresas", companyId), {
          aprobado: false,
          estado: "rechazada",
          rechazado_por: currentAccount.correo,
          fecha_rechazo: serverTimestamp()
        });

        alert('Empresa rechazada correctamente.');
        await loadData();
        renderAdminSection();
      } catch (error) {
        alert('No se pudo rechazar la empresa.');
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
      const nombreUsuarioOriginal = document.getElementById('registerUsernameInput')?.value.trim() || '';
      const nombreUsuario = normalizeUsername(nombreUsuarioOriginal);
      const correo = document.getElementById('registerEmailInput').value.trim();
      const contrasena = document.getElementById('registerPasswordInput').value.trim();
      const confirmarContrasena = document.getElementById('registerPasswordConfirmInput')?.value.trim();
      const aceptoTerminos = document.getElementById('termsInput')?.checked;

      if (!nombre || !nombreUsuario || !correo || !contrasena || !confirmarContrasena) {
        alert('Debes completar todos los campos obligatorios.');
        return;
      }

      if (!/^[a-z0-9_]{3,20}$/.test(nombreUsuario)) {
        alert('El nombre de usuario solo puede tener letras, numeros y guion bajo. Debe tener entre 3 y 20 caracteres.');
        return;
      }

      if (contrasena !== confirmarContrasena) {
        alert('Las contrasenas no coinciden.');
        return;
      }

      if (!aceptoTerminos) {
        alert('Debes aceptar los terminos y condiciones.');
        return;
      }

      try {
        const usernameRef = doc(db, "usernames", nombreUsuario);
        const usernameSnap = await getDoc(usernameRef);

        if (usernameSnap.exists()) {
          alert('Ese nombre de usuario ya esta en uso.');
          return;
        }

        const credenciales = await createUserWithEmailAndPassword(auth, correo, contrasena);
        const uid = credenciales.user.uid;

        await sendEmailVerification(credenciales.user);

        const userData = {
          uid,
          id_usuario: uid,
          nombre,
          nombre_usuario: nombreUsuario,
          correo,
          tipo_cuenta: selectedRole,
          email_verificado: false,
          creado_en: serverTimestamp()
        };

        if (selectedRole === "usuario") {
          userData.ubicacion = document.getElementById('registerUserLocationInput')?.value.trim() || "";
        }

        await setDoc(doc(db, "usuarios", uid), userData);

        await setDoc(usernameRef, {
          uid,
          correo,
          nombre_usuario: nombreUsuario,
          tipo_cuenta: selectedRole,
          creado_en: serverTimestamp()
        });

        if (selectedRole === "empresa") {
          await setDoc(doc(db, "empresas", uid), {
            uid,
            id_usuario: uid,
            id_empresa: uid,
            nombre_empresa: nombre,
            nombre,
            nombre_usuario: nombreUsuario,
            correo,
            descripcion: document.getElementById('registerCompanyDescriptionInput')?.value.trim() || "Empresa registrada en Tienda Tech.",
            logo: nombre.slice(0, 2).toUpperCase(),
            telefono: document.getElementById('registerCompanyPhoneInput')?.value.trim() || "",
            direccion: document.getElementById('registerCompanyAddressInput')?.value.trim() || "",
            categoria_principal: document.getElementById('registerCompanyCategoryInput')?.value.trim() || "",
            encargado: document.getElementById('registerCompanyManagerInput')?.value.trim() || "",
            aprobado: false,
            estado: "pendiente",
            creado_en: serverTimestamp()
          });
        }

        await signOut(auth);

        alert('Cuenta creada correctamente. Te enviamos un correo de verificacion. Verifica tu correo antes de iniciar sesion.');

        await loadData();

        registerForm.reset();
        document.getElementById('emailInput').value = nombreUsuario;
        document.getElementById('passwordInput').value = '';

        setAuthMode('login');
      } catch (error) {
        alert('No se pudo crear la cuenta. Revisa si el correo ya esta registrado o si la contrasena tiene al menos 6 caracteres.');
      }
    });

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const identificador = document.getElementById('emailInput').value.trim();
      const contrasena = document.getElementById('passwordInput').value.trim();

      if (!identificador || !contrasena) {
        alert('Debes escribir correo o nombre de usuario y contrasena.');
        return;
      }

      try {
        let correoLogin = identificador;

        if (!isEmail(identificador)) {
          const username = normalizeUsername(identificador);
          const usernameSnap = await getDoc(doc(db, "usernames", username));

          if (usernameSnap.exists()) {
            correoLogin = usernameSnap.data().correo;
          } else {
            const usuariosQuery = query(
              collection(db, "usuarios"),
              where("nombre_usuario", "==", username)
            );

            const usuariosSnapshot = await getDocs(usuariosQuery);

            if (!usuariosSnapshot.empty) {
              correoLogin = usuariosSnapshot.docs[0].data().correo;
            } else {
              const empresasQuery = query(
                collection(db, "empresas"),
                where("nombre_usuario", "==", username)
              );

              const empresasSnapshot = await getDocs(empresasQuery);

              if (!empresasSnapshot.empty) {
                correoLogin = empresasSnapshot.docs[0].data().correo;
              } else {
                alert('No existe una cuenta con ese nombre de usuario.');
                return;
              }
            }
          }
        }

        const credenciales = await signInWithEmailAndPassword(auth, correoLogin, contrasena);
        const uid = credenciales.user.uid;

        if (!credenciales.user.emailVerified) {
          await sendEmailVerification(credenciales.user);
          await signOut(auth);
          alert('Debes verificar tu correo antes de iniciar sesion. Te enviamos nuevamente el correo de verificacion.');
          return;
        }

        const usuarioRef = doc(db, "usuarios", uid);
        const usuarioSnap = await getDoc(usuarioRef);

        if (!usuarioSnap.exists()) {
          await signOut(auth);
          alert('La cuenta existe en Firebase Auth, pero no tiene perfil en Firestore.');
          return;
        }

        await updateDoc(usuarioRef, {
          email_verificado: true
        });

        const usuario = usuarioSnap.data();

        let account = {
          uid,
          id_usuario: uid,
          nombre: usuario.nombre,
          nombre_usuario: usuario.nombre_usuario || '',
          correo: usuario.correo,
          tipo_cuenta: usuario.tipo_cuenta,
          email_verificado: true
        };

        if (usuario.tipo_cuenta === "empresa") {
          const empresaSnap = await getDoc(doc(db, "empresas", uid));

          if (empresaSnap.exists()) {
            const empresa = empresaSnap.data();

            account = {
              ...account,
              id_empresa: uid,
              nombre_empresa: empresa.nombre_empresa || usuario.nombre,
              marketId: uid,
              aprobado: empresa.aprobado === true,
              estado: empresa.estado || "pendiente",
              telefono: empresa.telefono || "",
              direccion: empresa.direccion || "",
              categoria_principal: empresa.categoria_principal || "",
              encargado: empresa.encargado || "",
              descripcion: empresa.descripcion || ""
            };
          } else {
            await signOut(auth);
            alert('Esta cuenta de empresa no tiene perfil de empresa.');
            return;
          }
        }

        selectedRole = account.tipo_cuenta;
        authToken = uid;
        currentAccount = account;

        localStorage.setItem('tiendaTechUid', uid);
        localStorage.setItem('tiendaTechUsuario', JSON.stringify(account));

        await startSession(account.tipo_cuenta, account);
      } catch (error) {
        alert('No se pudo iniciar sesion. Revisa correo/nombre de usuario y contrasena.');
      }
    });

    logoutButton.addEventListener('click', logout);


    Object.assign(window, {
      moveHeroSlide,
      toggleFavorite,
      showProductForm,
      deleteProduct,
      disableProduct,
      enableProduct,
      renderMarkets,
      showMarketCatalog,
      requestExitSaleMode,
      changeSection,
      renderFavorites,
      loadFavorites,
      showProductDetail,
      saveRating,
      renderAdminSection,
      approveCompany,
      rejectCompany
    });

    setAuthMode('login');
    loadData();
