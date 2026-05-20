import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence
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
    let selectedCategory = '';
    let priceRange = '';
    let minRating = '';
    let setOperation = 'todos';
    let statusFilter = '';
    let sortOrder = 'new';
    let companyPassword = '1234';
    let companyMarketId = 1;
    let saleModeActive = false;
    let authToken = localStorage.getItem('tiendaTechUid') || '';
    let authMode = 'login';

    const ADMIN_EMAILS = [
      "jorge.delacruz170705@gmail.com"
    ];

    const STORAGE_KEYS = {
      uid: 'tiendaTechUid',
      account: 'tiendaTechUsuario',
      lastSection: 'tiendaTechLastSection',
      filters: 'tiendaTechProductFilters',
      saleMode: 'tiendaTechSaleModeActive',
      salePin: 'tiendaTechSalePin'
    };

    let searchRenderTimer = null;
    let visibleProductsCount = 12;
    let visibleCompanyProductsCount = 12;
    let visibleMarketProductsCount = 12;
    let currentMarketCatalogId = null;
    let lastConnectionState = navigator.onLine;

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

    const PRODUCT_CATEGORIES = [
      'Tecnologia',
      'Computadoras',
      'Celulares',
      'Accesorios',
      'Gaming',
      'Audio',
      'Monitores',
      'Almacenamiento',
      'Oficina',
      'Hogar',
      'Comida',
      'Ropa',
      'Otros'
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

      if (typeof value === 'object' && value.seconds) {
        return new Date(value.seconds * 1000).toISOString().slice(0, 10);
      }

      return new Date().toISOString().slice(0, 10);
    }

    function jsString(value) {
      return JSON.stringify(String(value));
    };

    function safeParse(value, fallback = null) {
      try {
        return value ? JSON.parse(value) : fallback;
      } catch (error) {
        return fallback;
      }
    }

    function escapeHtml(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function money(value) {
      const number = Number(value || 0);
      return '$' + number.toLocaleString('es-PA', { maximumFractionDigits: 0 });
    }

    function getInitials(value) {
      const text = String(value || 'TT').trim();
      return text.split(/\s+/).slice(0, 2).map((word) => word[0] || '').join('').toUpperCase() || 'TT';
    }

    function notify(message, type = 'info') {
      let container = document.getElementById('toastContainer');

      if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.textContent = message;
      container.appendChild(toast);

      requestAnimationFrame(() => toast.classList.add('show'));

      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 260);
      }, 3600);
    }

    function getActiveProducts() {
      return products.filter((product) => product.estado !== 'inhabilitado');
    }

    function getCompanyProducts(companyId, includeInactive = false) {
      return products.filter((product) => {
        const sameCompany = String(getProductCompanyId(product)) === String(companyId);
        return sameCompany && (includeInactive || product.estado !== 'inhabilitado');
      });
    }

    function getAverageFromProducts(list) {
      const ratings = list.map((product) => Number(product.rating || product.estrellas || 0)).filter((rating) => rating > 0);
      if (!ratings.length) return 0;
      return Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length);
    }

    function createEmptyState(title, text, action = '') {
      return `
        <div class="empty-state polished-empty">
          <span class="material-symbols-outlined empty-icon">inventory_2</span>
          <h3>${title}</h3>
          <p>${text}</p>
          ${action}
        </div>
      `;
    }

    function saveSession(account) {
      if (!account?.uid) return;

      localStorage.setItem(STORAGE_KEYS.uid, account.uid);
      localStorage.setItem(STORAGE_KEYS.account, JSON.stringify(account));
    }

    function clearSessionStorage() {
      localStorage.removeItem(STORAGE_KEYS.uid);
      localStorage.removeItem(STORAGE_KEYS.account);
      localStorage.removeItem(STORAGE_KEYS.lastSection);
      localStorage.removeItem(STORAGE_KEYS.filters);
      localStorage.removeItem(STORAGE_KEYS.saleMode);
      localStorage.removeItem(STORAGE_KEYS.salePin);
    }

    function saveProductFilters() {
      const filters = {
        productSearch,
        selectedCategory,
        priceRange,
        minRating,
        setOperation,
        statusFilter,
        sortOrder
      };

      localStorage.setItem(STORAGE_KEYS.filters, JSON.stringify(filters));
    }

    function restoreProductFilters() {
      const filters = safeParse(localStorage.getItem(STORAGE_KEYS.filters), {});

      productSearch = filters.productSearch || '';
      selectedCategory = filters.selectedCategory || '';
      priceRange = filters.priceRange || '';
      minRating = filters.minRating || '';
      setOperation = 'todos';
      statusFilter = filters.statusFilter || '';
      sortOrder = filters.sortOrder || 'new';
    }

    function getSavedSection(role) {
      const section = localStorage.getItem(STORAGE_KEYS.lastSection);
      const allowedSections = role === 'usuario'
        ? ['inicio', 'productos', 'mercados', 'favoritos', 'perfil', 'admin']
        : ['productos', 'mis-productos', 'perfil', 'admin'];

      if (section && allowedSections.includes(section)) return section;
      return role === 'usuario' ? 'inicio' : 'productos';
    }

    function showLoading(message = 'Cargando informacion...') {
      dynamicContent.innerHTML = `
        <div class="loading-state">
          <div class="loader-ring"></div>
          <h3>${message}</h3>
          <p>Estamos preparando los datos de la pagina.</p>
        </div>
      `;
    }

    function showLoginScreen() {
      appPage.classList.add('hidden');
      loginPage.classList.remove('hidden');
      sectionActions.innerHTML = '';
      setAuthMode('login');
    }

    async function buildAccountFromUid(uid) {
      const usuarioSnap = await getDoc(doc(db, "usuarios", uid));

      if (!usuarioSnap.exists()) return null;

      const usuario = usuarioSnap.data();

      let account = {
        uid,
        id_usuario: uid,
        nombre: usuario.nombre || 'Sin nombre',
        nombre_usuario: usuario.nombre_usuario || '',
        correo: usuario.correo || auth.currentUser?.email || '',
        tipo_cuenta: usuario.tipo_cuenta || 'usuario',
        ubicacion: usuario.ubicacion || '',
        email_verificado: true,
        creado_en: usuario.creado_en || null
      };

      if (account.tipo_cuenta === 'empresa') {
        const empresaSnap = await getDoc(doc(db, "empresas", uid));

        if (!empresaSnap.exists()) return null;

        const empresa = empresaSnap.data();

        account = {
          ...account,
          id_empresa: uid,
          nombre_empresa: empresa.nombre_empresa || usuario.nombre || 'Empresa sin nombre',
          marketId: uid,
          aprobado: empresa.aprobado === true,
          estado: empresa.estado || 'pendiente',
          telefono: empresa.telefono || '',
          direccion: empresa.direccion || '',
          categoria_principal: empresa.categoria_principal || '',
          encargado: empresa.encargado || '',
          descripcion: empresa.descripcion || 'Empresa registrada en Tienda Tech.',
          logo: empresa.logo || (empresa.nombre_empresa || usuario.nombre || 'TT').slice(0, 2).toUpperCase(),
          creado_en: empresa.creado_en || usuario.creado_en || null
        };
      }

      return account;
    }

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
            nombre_empresa: product.nombre_empresa || "Sin empresa",
            en_oferta: product.en_oferta === true,
            destacado_venta: product.destacado_venta === true,
            oferta: product.oferta === true,
            promocion: product.promocion === true,
            descuento: Number(product.descuento || 0),
            precio_anterior: Number(product.precio_anterior || 0)
          };
        });

        products.sort((a, b) => new Date(b.date) - new Date(a.date));
      } catch (error) {
        notify('No se pudieron cargar los datos desde Firebase.', 'warning');
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
    const registerBackButton = document.getElementById('registerBackButton');
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
      loginPage.classList.toggle('register-mode', isRegister);
      registerBackButton?.classList.toggle('hidden', !isRegister);

      authTitle.textContent = isRegister ? 'Crear cuenta' : 'Inicio de sesion';
      authText.textContent = isRegister
        ? 'Completa tus datos. Puedes volver al inicio con el boton de la casa.'
        : 'Entra con tu correo o nombre de usuario.';

      authHelpText.textContent = isRegister ? 'Ya tienes cuenta?' : 'No tienes cuenta?';
      toggleAuthButton.textContent = isRegister ? 'Iniciar sesion' : 'Crear cuenta';

      if (authTypeBox) {
        authTypeBox.classList.toggle('hidden', !isRegister);
      }

      selectLoginType(selectedRole);
    }

    async function startSession(role, account, options = {}) {
      const restoreLastSection = options.restoreLastSection !== false;

      currentAccount = account;
      selectedRole = role;
      authToken = account?.uid || authToken;

      saveSession(account);
      restoreProductFilters();

      loginPage.classList.add('hidden');
      appPage.classList.remove('hidden');
      showLoading('Cargando tu sesion...');

      visibleProductsCount = 12;
      visibleCompanyProductsCount = 12;
      visibleMarketProductsCount = 12;

      saleModeActive = localStorage.getItem(STORAGE_KEYS.saleMode) === 'true' && role === 'empresa';
      appPage.classList.toggle('sale-mode', saleModeActive);

      if (role === 'empresa') {
        const passwordInputValue = document.getElementById('passwordInput')?.value;
        const savedSalePin = localStorage.getItem(STORAGE_KEYS.salePin);
        companyPassword = savedSalePin || passwordInputValue || companyPassword || '1234';
        companyMarketId = account.id_empresa || account.marketId || 1;
      }

      sessionTypeText.textContent = role === 'usuario' ? `Sesion: ${account.nombre || 'Usuario'}` : `Empresa: ${account.nombre_empresa || account.nombre || 'Empresa'}`;

      await loadData();

      if (role === 'usuario') {
        await loadFavorites();
      }

      renderDashboard(role);
      changeSection(restoreLastSection ? getSavedSection(role) : (role === 'usuario' ? 'inicio' : 'productos'), { skipSave: true });
    }

    async function logout() {
      authToken = '';
      currentAccount = null;
      selectedRole = 'usuario';
      favoriteProducts = [];

      clearSessionStorage();

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

    function changeSection(sectionName, options = {}) {
      if (!options.skipSave) {
        localStorage.setItem(STORAGE_KEYS.lastSection, sectionName);
      }

      if (saleModeActive) {
        setActiveDashboardItem('venta');
        renderSaleModeCatalog();
        return;
      }

      setActiveDashboardItem(sectionName);
      sectionActions.innerHTML = '';

      if (sectionName !== 'productos' && sectionName !== 'mis-productos' && sectionName !== 'venta') {
        saveProductFilters();
      }

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
      sectionActions.innerHTML = '';

      const activeProducts = products.filter((product) => product.estado !== 'inhabilitado');
      const approvedMarkets = markets.filter((market) => market.aprobado !== false);
      const economicProducts = activeProducts
        .filter((product) => getProductPrice(product) < 30)
        .sort((a, b) => getProductPrice(a) - getProductPrice(b))
        .slice(0, 8);
      const recommendedProducts = activeProducts
        .filter((product) => getProductRatingValue(product) >= 4 || product.recommended)
        .sort((a, b) => getProductRatingValue(b) - getProductRatingValue(a))
        .slice(0, 8);
      const latestProducts = [...activeProducts]
        .sort((a, b) => new Date(b.fecha_publicacion || b.date || 0) - new Date(a.fecha_publicacion || a.date || 0))
        .slice(0, 8);
      const valueProducts = activeProducts
        .filter((product) => getProductPrice(product) < 30 && (getProductRatingValue(product) >= 3 || product.recommended))
        .slice(0, 8);
      const featuredMarkets = getFeaturedMarkets(4);

      dynamicContent.innerHTML = `
        <div class="home-layout product-home">
          <section class="product-hero">
            <div class="product-hero-copy">
              <span class="section-kicker">Marketplace inteligente</span>
              <h2>Encuentra productos utiles sin perder tiempo entre filtros confusos.</h2>
              <p>Compara precios, revisa mercados verificados, guarda favoritos y entra directo a las mejores opciones.</p>
              <div class="hero-action-row">
                <button class="primary-button" type="button" onclick="changeSection('productos')">Explorar productos</button>
                <button class="secondary-button" type="button" onclick="changeSection('mercados')">Ver mercados</button>
              </div>
            </div>
            <div class="hero-search-card">
              <label class="form-label" for="homeSearchInput">Busqueda rapida</label>
              <div class="home-search-box">
                <span class="material-symbols-outlined">search</span>
                <input id="homeSearchInput" type="text" placeholder="Laptop, teclado, audifonos, mercado...">
              </div>
              <p>Busca rapido y abre el catalogo con ese resultado.</p>
            </div>
          </section>

          <section class="insight-grid">
            ${createInsightCard('inventory_2', 'Productos activos', activeProducts.length, 'Disponibles para usuarios')}
            ${createInsightCard('storefront', 'Mercados visibles', approvedMarkets.length || markets.length, 'Empresas registradas')}
            ${createInsightCard('sell', 'Buen precio', economicProducts.length, 'Precios bajos')}
            ${createInsightCard('star', 'Mejor valorados', recommendedProducts.length, 'Segun calificaciones')}
          </section>

          <section class="home-split-grid">
            <div class="panel spotlight-panel">
              <div class="home-product-header">
                <div>
                  <h3>Mercados destacados</h3>
                  <p>Empresas con catalogo activo dentro del portal.</p>
                </div>
                <button class="small-button" type="button" onclick="changeSection('mercados')">Ver todos</button>
              </div>
              <div class="mini-market-list">
                ${featuredMarkets.length ? featuredMarkets.map(createMiniMarketCard).join('') : createEmptyState('Sin mercados', 'Aun no hay empresas aprobadas para destacar.')}
              </div>
            </div>

            <div class="panel decision-panel">
              <h3>Como usar Tienda Tech</h3>
              <div class="decision-steps">
                <div><span>1</span><p>Busca o filtra por categoria, precio y valoracion.</p></div>
                <div><span>2</span><p>Abre el producto para revisar detalles, garantia y empresa.</p></div>
                <div><span>3</span><p>Guarda favoritos o entra al mercado para comparar mas opciones.</p></div>
              </div>
            </div>
          </section>

          ${createHomeProductSection('Mejor valorados', 'Productos mejor valorados por los usuarios.', recommendedProducts)}
          ${createHomeProductSection('Precio conveniente', 'Opciones de bajo costo para compras rapidas.', economicProducts)}
          ${createHomeProductSection('Buen valor', 'Buen precio y buena valoracion en un solo lugar.', valueProducts)}
          ${createHomeProductSection('Agregados recientemente', 'Ultimos productos publicados.', latestProducts)}
        </div>
      `;

      const homeSearchInput = document.getElementById('homeSearchInput');
      if (homeSearchInput) {
        homeSearchInput.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            productSearch = homeSearchInput.value.trim();
            visibleProductsCount = 12;
            saveProductFilters();
            changeSection('productos');
          }
        });
      }
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
        todos: 'Mostrando todos los productos disponibles.',
        union: 'Mostrando productos economicos o bien calificados.',
        interseccion: 'Mostrando productos con buen precio y buena calificacion.',
        complemento: 'Mostrando productos economicos por descubrir.',
        diferencia: 'Mostrando productos con una ventaja destacada.'
      };

      return descriptions[setOperation];
    }


    function getProductTitle(product) {
      return product.name || product.nombre || 'Producto sin nombre';
    }

    function getProductPrice(product) {
      return Number(product.price || product.precio || 0);
    }

    function getProductRatingValue(product) {
      return Number(product.rating || product.estrellas || product.promedio_calificacion || 0);
    }

    function getProductShortDescription(product) {
      return product.descripcion_corta || product.description || product.descripcion || 'Sin descripcion registrada.';
    }

    function getProductLongDescription(product) {
      return product.descripcion_completa || product.descripcion_corta || product.description || product.descripcion || 'Este producto aun no tiene una descripcion completa.';
    }

    function getMarketNameByProduct(product) {
      const productCompanyId = String(getProductCompanyId(product));
      const market = markets.find((item) => String(item.id) === productCompanyId || String(item.id_empresa) === productCompanyId || String(item.marketId) === productCompanyId);
      return product.nombre_empresa || market?.nombre_empresa || market?.name || 'Mercado no indicado';
    }

    function getProductTrustNotes(product) {
      const notes = [];
      if (product.economical || getProductPrice(product) < 30) notes.push('Buen precio');
      if (product.recommended || getProductRatingValue(product) > 3) notes.push('Bien valorado');
      if (Number(product.stock || 0) > 0) notes.push('Disponible');
      if (product.garantia) notes.push('Con garantia');
      return notes;
    }

    function isOfferProduct(product) {
      return product.en_oferta === true || product.destacado_venta === true || product.oferta === true || product.promocion === true || Number(product.descuento || 0) > 0 || Number(product.precio_anterior || 0) > getProductPrice(product);
    }

    function createInsightCard(icon, label, value, helper) {
      return `
        <article class="insight-card">
          <span class="material-symbols-outlined">${icon}</span>
          <div>
            <strong>${value}</strong>
            <p>${label}</p>
            ${helper ? `<small>${helper}</small>` : ''}
          </div>
        </article>
      `;
    }

    function createSectionIntro(kicker, title, text, actionHtml = '') {
      return `
        <section class="section-intro">
          <div>
            <span class="section-kicker">${kicker}</span>
            <h2>${title}</h2>
            <p>${text}</p>
          </div>
          ${actionHtml ? `<div class="section-intro-actions">${actionHtml}</div>` : ''}
        </section>
      `;
    }

    function getFeaturedMarkets(limit = 4) {
      return markets
        .map((market) => {
          const marketProducts = products.filter((product) => getProductCompanyId(product) === String(market.id) && product.estado !== 'inhabilitado');
          return { ...market, totalProductosVisibles: marketProducts.length, promedio: getAverageFromProducts(marketProducts) };
        })
        .sort((a, b) => Number(b.totalProductosVisibles || 0) - Number(a.totalProductosVisibles || 0))
        .slice(0, limit);
    }

    function createMiniMarketCard(market) {
      return `
        <article class="mini-market-card" onclick='showMarketCatalog(${jsString(market.id)})'>
          <div class="market-logo small">${market.logo || getInitials(market.name || market.nombre_empresa || 'TT')}</div>
          <div>
            <strong>${market.name || market.nombre_empresa || 'Mercado'}</strong>
            <p>${market.categoria_principal || 'Categoria general'} · ${market.totalProductosVisibles || 0} productos</p>
          </div>
          <span class="material-symbols-outlined">chevron_right</span>
        </article>
      `;
    }

    /* ========================================================= */
    /* PRODUCTOS */
    /* ========================================================= */

    function createProductCard(product) {
      const productId = product.id || product.id_producto;
      const isFavorite = favoriteProducts.includes(productId);
      const activeSection = document.querySelector('.dashboard-item.active')?.dataset.section;
      const title = getProductTitle(product);
      const price = getProductPrice(product);
      const rating = getProductRatingValue(product);
      const marketName = getMarketNameByProduct(product);
      const trustNotes = getProductTrustNotes(product);
      const stock = Number(product.stock || 0);
      const statusLabel = product.estado === 'inhabilitado' ? 'Inhabilitado' : (stock <= 0 ? 'Sin stock' : 'Disponible');

      return `
        <article class="product-card upgraded-card" onclick='showProductDetail(${jsString(productId)})'>
          <div class="product-image-box">
            <img class="product-image" src="${product.image || product.imagen || baseImages[0]}" alt="${title}" loading="lazy" decoding="async">
            <span class="floating-price">${money(price)}</span>
            <span class="stock-badge ${stock <= 0 ? 'danger' : ''}">${statusLabel}</span>
          </div>

          <div class="product-info">
            <div>
              <div class="product-title-row">
                <h3 class="product-title">${title}</h3>
                <span class="rating-chip"><span class="material-symbols-outlined">star</span>${rating || 0}</span>
              </div>
              <p class="product-description">${getProductShortDescription(product)}</p>

              <div class="product-meta refined-meta">
                <span>${product.category || product.nombre_categoria || 'Sin categoria'}</span>
                <span>${product.marca || 'Marca no indicada'}</span>
              </div>

              <div class="tag-row">
                <span class="tag market-tag">${marketName}</span>
                ${trustNotes.slice(0, 3).map((note) => `<span class="tag">${note}</span>`).join('')}
                ${product.estado === 'inhabilitado' ? '<span class="tag danger-tag">Inhabilitado</span>' : ''}
              </div>
            </div>

            <div class="card-actions">
              <button class="small-button ghost" type="button" onclick='event.stopPropagation(); showProductDetail(${jsString(productId)})'>Ver detalle</button>
              ${selectedRole === 'usuario' ? `
                <button class="small-button ${isFavorite ? 'active' : ''}" type="button" onclick='event.stopPropagation(); toggleFavorite(${jsString(productId)})'>${isFavorite ? 'Guardado' : 'Guardar'}</button>
              ` : activeSection === 'mis-productos' ? `
                <button class="small-button" type="button" onclick='event.stopPropagation(); showProductForm(${jsString(productId)})'>Editar</button>
                ${product.estado === 'inhabilitado' ? `
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
      const activeSection = document.querySelector('.dashboard-item.active')?.dataset.section;

      if (productSearch.trim() !== '') {
        const term = productSearch.toLowerCase();

        filtered = filtered.filter((product) => {
          return String(product.name || product.nombre || '').toLowerCase().includes(term) ||
                 String(product.description || product.descripcion || '').toLowerCase().includes(term) ||
                 String(product.descripcion_completa || '').toLowerCase().includes(term) ||
                 String(product.category || product.nombre_categoria || '').toLowerCase().includes(term) ||
                 String(product.marca || '').toLowerCase().includes(term) ||
                 String(product.modelo || '').toLowerCase().includes(term) ||
                 String(product.nombre_empresa || '').toLowerCase().includes(term);
        });
      }

      if (selectedCategory !== '') {
        filtered = filtered.filter((product) => {
          return (product.category || product.nombre_categoria) === selectedCategory;
        });
      }

      if (priceRange === 'under30') {
        filtered = filtered.filter((product) => Number(product.price || product.precio) < 30);
      }

      if (priceRange === '30to100') {
        filtered = filtered.filter((product) => {
          const price = Number(product.price || product.precio);
          return price >= 30 && price <= 100;
        });
      }

      if (priceRange === '100to300') {
        filtered = filtered.filter((product) => {
          const price = Number(product.price || product.precio);
          return price > 100 && price <= 300;
        });
      }

      if (priceRange === 'over300') {
        filtered = filtered.filter((product) => Number(product.price || product.precio) > 300);
      }

      if (minRating !== '' && activeSection !== 'mis-productos' && activeSection !== 'venta') {
        filtered = filtered.filter((product) => Number(product.rating || product.estrellas || 0) >= Number(minRating));
      }

      if (statusFilter !== '' && activeSection === 'mis-productos') {
        filtered = filtered.filter((product) => {
          if (statusFilter === 'activo') return product.estado !== 'inhabilitado';
          if (statusFilter === 'inhabilitado') return product.estado === 'inhabilitado';
          return true;
        });
      }

      if (sortOrder === 'new') {
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      }

      if (sortOrder === 'old') {
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      }

      if (sortOrder === 'priceAsc') {
        filtered.sort((a, b) => Number(a.price || a.precio) - Number(b.price || b.precio));
      }

      if (sortOrder === 'priceDesc') {
        filtered.sort((a, b) => Number(b.price || b.precio) - Number(a.price || a.precio));
      }

      if (sortOrder === 'ratingDesc') {
        filtered.sort((a, b) => Number(b.rating || b.estrellas || 0) - Number(a.rating || a.estrellas || 0));
      }

      if (sortOrder === 'nameAsc') {
        filtered.sort((a, b) => String(a.name || a.nombre || '').localeCompare(String(b.name || b.nombre || '')));
      }

      if (setOperation && setOperation !== 'todos') {
        filtered = filtered.filter((product) => {
          const economical = product.economical || getProductPrice(product) < 30;
          const recommended = product.recommended || getProductRatingValue(product) > 3;

          if (setOperation === 'union') return economical || recommended;
          if (setOperation === 'interseccion') return economical && recommended;
          if (setOperation === 'complemento') return economical && !recommended;
          if (setOperation === 'diferencia') return economical !== recommended;
          return true;
        });
      }

      return filtered;
    }

    function createProductToolbar() {
      const activeSection = document.querySelector('.dashboard-item.active')?.dataset.section;
      const isMyProducts = activeSection === 'mis-productos';
      const isSaleMode = activeSection === 'venta';
      const isStoreView = activeSection === 'mercados';

      return `
        <div class="toolbar smart-toolbar">
          <div class="toolbar-main-row">
            <div class="search-field-wrap">
              <span class="material-symbols-outlined">search</span>
              <input id="productSearchInput" class="search-input" type="text" placeholder="Buscar producto, marca, modelo o empresa..." value="${productSearch}">
            </div>
            <button id="resetFiltersButton" class="secondary-button compact" type="button">Limpiar</button>
          </div>

          <div class="filter-row advanced-filter-row">
            <select id="categoryFilter" class="filter-select">
              <option value="">Todas las categorias</option>
              ${getCategories().map((category) => `<option value="${category}" ${selectedCategory === category ? 'selected' : ''}>${category}</option>`).join('')}
            </select>

            <select id="priceRangeFilter" class="filter-select">
              <option value="">Todos los precios</option>
              <option value="under30" ${priceRange === 'under30' ? 'selected' : ''}>Precios bajos</option>
              <option value="30to100" ${priceRange === '30to100' ? 'selected' : ''}>$30 - $100</option>
              <option value="100to300" ${priceRange === '100to300' ? 'selected' : ''}>$100 - $300</option>
              <option value="over300" ${priceRange === 'over300' ? 'selected' : ''}>Mas de $300</option>
            </select>

            ${!isMyProducts && !isSaleMode ? `
              <select id="ratingFilter" class="filter-select">
                <option value="">Cualquier calificacion</option>
                <option value="4" ${minRating === '4' ? 'selected' : ''}>4 estrellas o mas</option>
                <option value="3" ${minRating === '3' ? 'selected' : ''}>3 estrellas o mas</option>
              </select>
            ` : ''}

            ${isMyProducts ? `
              <select id="statusFilter" class="filter-select">
                <option value="">Todos los estados</option>
                <option value="activo" ${statusFilter === 'activo' ? 'selected' : ''}>Activos</option>
                <option value="inhabilitado" ${statusFilter === 'inhabilitado' ? 'selected' : ''}>Inhabilitados</option>
              </select>
            ` : ''}

            ${!isSaleMode ? `
              <select id="sortFilter" class="filter-select">
                <option value="new" ${sortOrder === 'new' ? 'selected' : ''}>Mas recientes</option>
                <option value="old" ${sortOrder === 'old' ? 'selected' : ''}>Mas antiguos</option>
                <option value="priceAsc" ${sortOrder === 'priceAsc' ? 'selected' : ''}>Menor precio</option>
                <option value="priceDesc" ${sortOrder === 'priceDesc' ? 'selected' : ''}>Mayor precio</option>
                <option value="ratingDesc" ${sortOrder === 'ratingDesc' ? 'selected' : ''}>Mejor calificados</option>
                <option value="nameAsc" ${sortOrder === 'nameAsc' ? 'selected' : ''}>Nombre A-Z</option>
              </select>
            ` : ''}
          </div>
        </div>
      `;
    }

    function activateProductToolbar(renderFunction) {
      const searchInput = document.getElementById('productSearchInput');
      const categoryFilter = document.getElementById('categoryFilter');
      const priceRangeFilter = document.getElementById('priceRangeFilter');
      const ratingFilter = document.getElementById('ratingFilter');
      const statusFilterElement = document.getElementById('statusFilter');
      const sortFilter = document.getElementById('sortFilter');
      const resetFiltersButton = document.getElementById('resetFiltersButton');
      const quickFilters = document.querySelectorAll('.quick-filter');


      quickFilters.forEach((button) => {
        button.addEventListener('click', () => {
          setOperation = button.dataset.set || 'todos';
          saveProductFilters();
          visibleProductsCount = 12;
          renderFunction();
        });
      });

      if (searchInput) {
        searchInput.addEventListener('input', (event) => {
          productSearch = event.target.value;
          saveProductFilters();

          clearTimeout(searchRenderTimer);
          searchRenderTimer = setTimeout(() => renderFunction(), 180);
        });
      }

      if (categoryFilter) {
        categoryFilter.addEventListener('change', (event) => {
          selectedCategory = event.target.value;
          saveProductFilters();
          renderFunction();
        });
      }

      if (priceRangeFilter) {
        priceRangeFilter.addEventListener('change', (event) => {
          priceRange = event.target.value;
          saveProductFilters();
          renderFunction();
        });
      }

      if (ratingFilter) {
        ratingFilter.addEventListener('change', (event) => {
          minRating = event.target.value;
          saveProductFilters();
          renderFunction();
        });
      }

      if (statusFilterElement) {
        statusFilterElement.addEventListener('change', (event) => {
          statusFilter = event.target.value;
          saveProductFilters();
          renderFunction();
        });
      }

      if (sortFilter) {
        sortFilter.addEventListener('change', (event) => {
          sortOrder = event.target.value;
          saveProductFilters();
          renderFunction();
        });
      }

      if (resetFiltersButton) {
        resetFiltersButton.addEventListener('click', () => {
          resetProductFilters();
          visibleProductsCount = 12;
          visibleCompanyProductsCount = 12;
          visibleMarketProductsCount = 12;
          renderFunction();
        });
      }
    }

    function resetProductFilters() {
      productSearch = '';
      selectedCategory = '';
      priceRange = '';
      minRating = '';
      setOperation = 'todos';
      statusFilter = '';
      sortOrder = 'new';
      saveProductFilters();
    }

    function renderProductsSection() {
      sectionTitle.textContent = 'Productos';
      sectionActions.innerHTML = '';

      const filteredProducts = getFilteredProducts().filter((product) => product.estado !== 'inhabilitado');
      const visibleProducts = filteredProducts.slice(0, visibleProductsCount);
      const remaining = Math.max(filteredProducts.length - visibleProducts.length, 0);
      const averageVisible = getAverageFromProducts(filteredProducts);
      const intro = createSectionIntro(
        'Catalogo',
        'Encuentra lo que necesitas mas rapido.',
        'Explora productos por categoria, precio y valoracion.',
        `<button class="secondary-button" type="button" onclick="changeSection('mercados')">Comparar por mercado</button>`
      );

      dynamicContent.innerHTML = `
        ${intro}
        ${createProductToolbar()}
        <div class="results-summary refined-summary">
          <span><strong>${filteredProducts.length}</strong> productos encontrados</span>
          <span>Mostrando ${visibleProducts.length}</span>
        </div>

        ${filteredProducts.length === 0 ? createEmptyState('Sin resultados', 'No encontramos productos con esos filtros. Limpia la busqueda o prueba otra categoria.', `<button class="primary-button" type="button" onclick="resetProductFilters(); renderProductsSection();">Limpiar filtros</button>`) : `
          <div class="product-grid upgraded-grid">${visibleProducts.map(createProductCard).join('')}</div>
          ${remaining > 0 ? `<div class="load-more-box"><button class="primary-button" type="button" onclick="loadMoreProducts('productos')">Ver ${Math.min(12, remaining)} productos mas</button></div>` : ''}
        `}
      `;

      activateProductToolbar(renderProductsSection);
    }

    function loadMoreProducts(sectionName) {
      if (sectionName === 'productos') {
        visibleProductsCount += 12;
        renderProductsSection();
        return;
      }

      if (sectionName === 'mis-productos') {
        visibleCompanyProductsCount += 12;
        renderMyProductsSection();
        return;
      }

      if (sectionName === 'mercado') {
        visibleMarketProductsCount += 12;
        showMarketCatalog(currentMarketCatalogId);
      }
    }

    function getCategories() {
      return PRODUCT_CATEGORIES;
    }

    async function toggleFavorite(productId) {
      if (!currentAccount?.id_usuario || selectedRole !== "usuario") {
        notify('Debes iniciar sesion como usuario para guardar favoritos.', 'warning');
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
        notify('No se pudo actualizar favoritos en Firebase.', 'warning');
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

      const visibleMyProducts = myProducts.slice(0, visibleCompanyProductsCount);
      const remaining = Math.max(myProducts.length - visibleMyProducts.length, 0);

      dynamicContent.innerHTML = `
        <div class="panel">
          <h3>Resumen de mis productos</h3>
          <div class="mini-stats">
            <div class="stat-card"><span class="stat-number">${activeCount}</span><span class="stat-label">Activos</span></div>
            <div class="stat-card"><span class="stat-number">${inactiveCount}</span><span class="stat-label">Inhabilitados</span></div>
            <div class="stat-card"><span class="stat-number">${myProducts.length}</span><span class="stat-label">Filtrados</span></div>
          </div>
        </div>

        ${!isApproved ? createEmptyState('Empresa pendiente de aprobacion', 'Tu correo ya puede estar verificado, pero tu empresa aun debe ser aprobada antes de publicar productos.') : ''}

        ${createProductToolbar()}

        ${myProducts.length === 0 ? createEmptyState('Sin productos', 'No hay productos de tu empresa que coincidan con la busqueda o los filtros seleccionados.') : `
          <div class="product-grid">${visibleMyProducts.map(createProductCard).join('')}</div>
          ${remaining > 0 ? `<div class="load-more-box"><button class="primary-button" type="button" onclick="loadMoreProducts('mis-productos')">Ver ${Math.min(12, remaining)} productos mas</button></div>` : ''}
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
      localStorage.setItem(STORAGE_KEYS.lastSection, 'productos');
      const product = products.find((item) => String(item.id || item.id_producto) === String(productId));

      if (!product) {
        sectionTitle.textContent = 'Producto no encontrado';
        sectionActions.innerHTML = `<button class="secondary-button" type="button" onclick="changeSection('productos')">Volver</button>`;
        dynamicContent.innerHTML = createEmptyState('No se encontro este producto', 'Actualiza la pagina o vuelve al catalogo.');
        return;
      }

      const isOwnerCompany = selectedRole === 'empresa' && getProductCompanyId(product) === getCurrentCompanyId();

      if (product.estado === 'inhabilitado' && !isOwnerCompany) {
        sectionTitle.textContent = 'Producto no disponible';
        sectionActions.innerHTML = `<button class="secondary-button" type="button" onclick="changeSection('productos')">Volver</button>`;
        dynamicContent.innerHTML = createEmptyState('Producto no disponible', 'Este producto fue inhabilitado por la empresa.');
        return;
      }

      const productRatings = await getRatings('calificaciones_productos', 'id_producto', product.id || product.id_producto);
      const companyRatings = await getRatings('calificaciones_empresas', 'id_empresa', getProductCompanyId(product));
      const productAverage = getRatingAverage(productRatings);
      const companyAverage = getRatingAverage(companyRatings);
      const isFavorite = favoriteProducts.includes(product.id || product.id_producto);
      const relatedProducts = products
        .filter((item) => String(item.id || item.id_producto) !== String(product.id || product.id_producto))
        .filter((item) => item.estado !== 'inhabilitado')
        .filter((item) => item.nombre_categoria === product.nombre_categoria || getProductCompanyId(item) === getProductCompanyId(product))
        .slice(0, 4);
      const trustNotes = getProductTrustNotes(product);

      sectionTitle.textContent = getProductTitle(product);
      sectionActions.innerHTML = `<button class="secondary-button" type="button" onclick="changeSection('productos')">Volver al catalogo</button>`;

      dynamicContent.innerHTML = `
        <section class="product-detail-hero">
          <div class="detail-image-panel">
            <img class="detail-product-image" src="${product.image || product.imagen || baseImages[0]}" alt="${getProductTitle(product)}" loading="lazy" decoding="async">
          </div>

          <div class="detail-info-panel panel">
            <span class="section-kicker">${product.nombre_categoria || product.category || 'Producto'}</span>
            <h2>${getProductTitle(product)}</h2>
            <p>${getProductLongDescription(product)}</p>

            <div class="detail-price-row">
              <strong>${money(getProductPrice(product))}</strong>
              <span class="status-pill ${product.estado === 'inhabilitado' ? 'danger' : 'active'}">${product.estado === 'inhabilitado' ? 'Inhabilitado' : 'Disponible'}</span>
            </div>

            <div class="detail-rating-grid">
              <div>${getStars(productAverage.average)}<strong>${productAverage.average || 0}/5</strong><span>Producto</span></div>
              <div>${getStars(companyAverage.average)}<strong>${companyAverage.average || 0}/5</strong><span>Empresa</span></div>
              <div><strong>${product.stock || 0}</strong><span>Stock</span></div>
            </div>

            <div class="tag-row">
              <span class="tag market-tag">${getMarketNameByProduct(product)}</span>
              ${trustNotes.map((note) => `<span class="tag">${note}</span>`).join('')}
            </div>

            <div class="detail-actions">
              ${selectedRole === 'usuario' ? `<button class="primary-button ${isFavorite ? 'active' : ''}" type="button" onclick='toggleFavorite(${jsString(product.id || product.id_producto)}).then(() => showProductDetail(${jsString(product.id || product.id_producto)}))'>${isFavorite ? 'Quitar de favoritos' : 'Guardar favorito'}</button>` : ''}
              <button class="secondary-button" type="button" onclick='showMarketCatalog(${jsString(getProductCompanyId(product))})'>Ver mercado</button>
            </div>
          </div>
        </section>

        <section class="panel-grid detail-specs-grid">
          <div class="panel">
            <h3>Datos importantes</h3>
            <div class="info-list">
              <p><strong>Empresa:</strong> ${getMarketNameByProduct(product)}</p>
              <p><strong>Marca:</strong> ${product.marca || 'No indicada'}</p>
              <p><strong>Modelo:</strong> ${product.modelo || 'No indicado'}</p>
              <p><strong>Condicion:</strong> ${product.condicion || 'No indicada'}</p>
              <p><strong>Garantia:</strong> ${product.garantia || 'No indicada'}</p>
              <p><strong>Fecha:</strong> ${product.fecha_publicacion || product.date || 'Sin fecha'}</p>
            </div>
          </div>
          <div class="panel">
            <h3>Compra rapida</h3>
            <div class="decision-steps compact">
              <div><span>${getProductPrice(product) < 30 ? '✓' : '•'}</span><p>${getProductPrice(product) < 30 ? 'Precio conveniente' : 'Precio regular'}</p></div>
              <div><span>${getProductRatingValue(product) > 3 ? '✓' : '•'}</span><p>${getProductRatingValue(product) > 3 ? 'Bien valorado' : 'Sin valoracion destacada'}</p></div>
              <div><span>${Number(product.stock || 0) > 0 ? '✓' : '•'}</span><p>${Number(product.stock || 0) > 0 ? 'Disponible' : 'Sin stock'}</p></div>
            </div>
          </div>
        </section>

        <div class="panel-grid">
          ${createRatingSummary('Calificacion del producto', productRatings)}
          ${createRatingSummary('Calificacion de la empresa', companyRatings)}
        </div>

        <div class="panel-grid">
          ${createRatingForm('producto', product.id || product.id_producto)}
          ${createRatingForm('empresa', getProductCompanyId(product))}
        </div>

        <section class="home-product-section">
          <div class="home-product-header">
            <div>
              <h3>Opiniones del producto</h3>
              <p>Comentarios recientes de usuarios.</p>
            </div>
            <span>${productRatings.length} opiniones</span>
          </div>

          ${productRatings.length === 0 ? createEmptyState('Sin opiniones', 'Aun no hay calificaciones para este producto.') : `
            <div class="panel-grid">
              ${productRatings.slice(0, 6).map((rating) => `
                <div class="panel">
                  <div class="rating-row">
                    <span>${getStars(rating.puntuacion)}</span>
                    <strong>${rating.puntuacion}/5</strong>
                  </div>
                  <p>${rating.comentario || 'Sin comentario.'}</p>
                </div>
              `).join('')}
            </div>
          `}
        </section>

        ${relatedProducts.length ? createHomeProductSection('Tambien podria interesarte', 'Productos de la misma categoria o mercado.', relatedProducts) : ''}
      `;

      const productRatingForm = document.getElementById('productRatingForm');
      const companyRatingForm = document.getElementById('companyRatingForm');

      if (productRatingForm) {
        productRatingForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          await saveRating('calificaciones_productos', 'id_producto', product.id || product.id_producto, {
            puntuacion: Number(document.getElementById('productRatingSelect').value),
            comentario: document.getElementById('productRatingComment').value.trim()
          });
          await showProductDetail(product.id || product.id_producto);
        });
      }

      if (companyRatingForm) {
        companyRatingForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          await saveRating('calificaciones_empresas', 'id_empresa', getProductCompanyId(product), {
            puntuacion: Number(document.getElementById('companyRatingSelect').value),
            comentario: document.getElementById('companyRatingComment').value.trim()
          });
          await showProductDetail(product.id || product.id_producto);
        });
      }
    }

    async function saveRating(collectionName, fieldName, targetId, data) {
      if (selectedRole !== "usuario" || !currentAccount?.id_usuario) {
        notify('Debes iniciar sesion como usuario para calificar.', 'warning');
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

        notify('Calificacion guardada correctamente.', 'success');
      } catch (error) {
        notify('No se pudo guardar la calificacion.', 'warning');
      }
    }

    /* ========================================================= */
    /* FORMULARIO DE PRODUCTOS PARA EMPRESA */
    /* ========================================================= */

    function showProductForm(productId = null) {
      if (selectedRole === 'empresa' && currentAccount?.aprobado !== true) {
        notify('Tu empresa aun esta pendiente de aprobacion. No puedes publicar productos todavia.', 'warning');
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
          <p>Agrega la informacion del producto. Los productos activos aparecen automaticamente; si lo inhabilitas, se ocultan del catalogo.</p>

          <form id="productForm" class="form-grid">
            <div class="form-group">
              <label class="form-label">Nombre del producto</label>
              <input id="productName" class="form-input" type="text" value="${product ? (product.name || product.nombre) : ''}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Categoria</label>
              <select id="productCategory" class="form-select" required>
                ${PRODUCT_CATEGORIES.map((category) => `
                  <option value="${category}" ${product && (product.category || product.nombre_categoria) === category ? 'selected' : ''}>${category}</option>
                `).join('')}
              </select>
              <small class="field-hint">Las categorias estan fijas para mantener los filtros ordenados.</small>
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

            <label class="checkbox-line form-group full offer-control">
              <input id="productOffer" type="checkbox" ${product && isOfferProduct(product) ? 'checked' : ''}>
              <span>
                <strong>Marcar como oferta destacada</strong>
                <small>Se mostrara en la seccion de ofertas del modo venta. Si no lo marcas, quedara en productos generales.</small>
              </span>
            </label>

            <div class="panel compact-note">
              <h3>Visibilidad</h3>
              <p>No hay que marcar si aparece en catalogo: todo producto activo aparece automaticamente. Para ocultarlo, usa Inhabilitar desde Mis productos.</p>
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
          en_oferta: document.getElementById('productOffer').checked,
          destacado_venta: document.getElementById('productOffer').checked,
          estado: editing ? (product.estado || "activo") : "activo",
          nombre_empresa: companyName,
          fecha_publicacion: document.getElementById('productDate').value || new Date().toISOString().slice(0, 10)
        };

        if (!data.nombre || !data.precio) {
          notify('Debes escribir nombre y precio del producto.', 'warning');
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
          notify('No se pudo guardar el producto en Firebase.', 'warning');
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
          notify('No puedes inhabilitar productos de otra empresa.', 'warning');
          return;
        }

        await updateDoc(doc(db, "productos", productId), {
          estado: "inhabilitado"
        });

        await loadData();
        renderMyProductsSection();
      } catch (error) {
        notify('No se pudo inhabilitar el producto en Firebase.', 'warning');
      }
    }

    async function enableProduct(productId) {
      const confirmEnable = confirm('Reactivar este producto? Volvera a aparecer publicamente.');

      if (!confirmEnable) return;

      try {
        const product = products.find((item) => (item.id || item.id_producto) === productId);

        if (!product || getProductCompanyId(product) !== getCurrentCompanyId()) {
          notify('No puedes reactivar productos de otra empresa.', 'warning');
          return;
        }

        await updateDoc(doc(db, "productos", productId), {
          estado: "activo"
        });

        await loadData();
        renderMyProductsSection();
      } catch (error) {
        notify('No se pudo reactivar el producto en Firebase.', 'warning');
      }
    }

    async function deleteProduct(productId) {
      await disableProduct(productId);
    }

    /* ========================================================= */
    /* MERCADOS */
    /* ========================================================= */

    function createMarketCard(market) {
      const totalProducts = products.filter((product) => getProductCompanyId(product) === String(market.id) && product.estado !== 'inhabilitado').length;
      const marketProducts = products.filter((product) => getProductCompanyId(product) === String(market.id) && product.estado !== 'inhabilitado');
      const average = getAverageFromProducts(marketProducts);
      const description = market.description || market.descripcion || 'Empresa registrada en Tienda Tech.';

      return `
        <article class="market-card upgraded-market-card" onclick='showMarketCatalog(${jsString(market.id)})'>
          <div class="market-card-header">
            <div class="market-logo">${market.logo || getInitials(market.name || market.nombre_empresa || 'TT')}</div>
            <span class="status-pill active">Verificada</span>
          </div>
          <div>
            <h3 class="market-name">${market.name || market.nombre_empresa}</h3>
            <p class="market-description">${description}</p>
            <div class="tag-row">
              <span class="tag">${market.categoria_principal || 'Categoria general'}</span>
              <span class="tag">${average || 0}/5 ★</span>
            </div>
          </div>
          <div class="market-footer">
            <span>${totalProducts} productos disponibles</span>
            <span class="material-symbols-outlined">arrow_forward</span>
          </div>
        </article>
      `;
    }

    function renderMarkets() {
      sectionTitle.textContent = 'Mercados';
      sectionActions.innerHTML = '';
      const intro = createSectionIntro('Empresas', 'Elige el mercado antes de elegir el producto.', 'Revisa el catalogo, la categoria y los datos principales de cada empresa.');
      dynamicContent.innerHTML = `
        ${intro}
        ${markets.length === 0 ? createEmptyState('Sin mercados', 'Todavia no hay empresas aprobadas o visibles en la plataforma.') : `<div class="market-grid upgraded-market-grid">${markets.map(createMarketCard).join('')}</div>`}
      `;
    }

    function showMarketCatalog(marketId) {
      currentMarketCatalogId = marketId;
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
      const visibleMarketProducts = marketProducts.slice(0, visibleMarketProductsCount);
      const remaining = Math.max(marketProducts.length - visibleMarketProducts.length, 0);
      const marketAverage = getAverageFromProducts(marketProducts);

      sectionTitle.textContent = market.name || market.nombre_empresa;
      sectionActions.innerHTML = `<button class="secondary-button" type="button" onclick="renderMarkets()">Volver</button>`;

      dynamicContent.innerHTML = `
        <div class="catalog-header premium-catalog">
          <div class="catalog-header-top">
            <div class="market-logo">${market.logo || getInitials(market.name || market.nombre_empresa)}</div>
            <div>
              <span class="status-pill active">Empresa verificada</span>
              <h3 class="catalog-title">${market.name || market.nombre_empresa}</h3>
              <p class="catalog-description">${market.description || market.descripcion || 'Empresa registrada en Tienda Tech.'}</p>
            </div>
          </div>
          <div class="market-profile-grid">
            <div><strong>${marketProducts.length}</strong><span>Productos</span></div>
            <div><strong>${marketAverage || 0}</strong><span>Calificacion promedio</span></div>
            <div><strong>${market.categoria_principal || 'General'}</strong><span>Categoria</span></div>
            <div><strong>${market.telefono || 'No indicado'}</strong><span>Telefono</span></div>
            <div><strong>${market.direccion || 'No indicada'}</strong><span>Direccion</span></div>
            <div><strong>${market.correo || 'Sin correo'}</strong><span>Correo</span></div>
          </div>
        </div>

        ${marketProducts.length === 0 ? createEmptyState('Sin productos', 'Este mercado todavia no tiene productos publicados.') : `
          <div class="product-grid">${visibleMarketProducts.map(createProductCard).join('')}</div>
          ${remaining > 0 ? `<div class="load-more-box"><button class="primary-button" type="button" onclick="loadMoreProducts('mercado')">Ver ${Math.min(12, remaining)} productos mas</button></div>` : ''}
        `}
      `;
    }

    /* ========================================================= */
    /* MODO VENTA */
    /* ========================================================= */

    function startSaleMode() {
      if (selectedRole === 'empresa' && currentAccount?.aprobado !== true) {
        notify('Tu empresa aun esta pendiente de aprobacion. No puedes activar modo venta todavia.', 'warning');
        changeSection('perfil');
        return;
      }

      const confirmSale = confirm('Activar modo venta? El sistema quedara bloqueado en el catalogo de la empresa hasta ingresar la clave.');

      if (!confirmSale) {
        changeSection('productos');
        return;
      }

      const salePin = prompt('Crea o confirma una clave de salida para el modo venta. Minimo 4 caracteres:');

      if (!salePin || salePin.trim().length < 4) {
        notify('El modo venta necesita una clave de salida de minimo 4 caracteres.', 'warning');
        changeSection('productos');
        return;
      }

      companyPassword = salePin.trim();
      localStorage.setItem(STORAGE_KEYS.salePin, companyPassword);
      saleModeActive = true;
      localStorage.setItem(STORAGE_KEYS.saleMode, 'true');
      appPage.classList.add('sale-mode');
      renderSaleModeCatalog();
    }

    function renderSaleModeCatalog() {
      const market = markets.find((item) => item.id === companyMarketId) || markets[0];
      const marketProducts = getFilteredProducts().filter((product) => {
        return getProductCompanyId(product) === market.id && product.estado !== "inhabilitado";
      });
      const offerProducts = marketProducts.filter(isOfferProduct);
      const generalProducts = marketProducts.filter((product) => !isOfferProduct(product));

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
          Catalogo de venta activo. Usa la clave de la empresa para salir.
        </div>

        ${createProductToolbar()}

        ${marketProducts.length === 0 ? `
          <div class="empty-state">
            <h3>Sin productos</h3>
            <p>No hay productos que coincidan con la busqueda o los filtros seleccionados.</p>
          </div>
        ` : `
          ${offerProducts.length > 0 ? `
            <section class="sale-product-section">
              <div class="sale-section-heading">
                <div>
                  <span class="section-kicker">Ofertas</span>
                  <h3>Productos en oferta</h3>
                </div>
                <small>${offerProducts.length} producto${offerProducts.length === 1 ? '' : 's'}</small>
              </div>
              <div class="product-grid sale-offer-grid">${offerProducts.map((product) => createSaleProductCard(product, true)).join('')}</div>
            </section>
          ` : ''}

          <section class="sale-product-section">
            <div class="sale-section-heading">
              <div>
                <span class="section-kicker">Catalogo</span>
                <h3>Productos generales</h3>
              </div>
              <small>${generalProducts.length} producto${generalProducts.length === 1 ? '' : 's'}</small>
            </div>
            ${generalProducts.length === 0 ? `
              <div class="empty-state compact-empty">
                <h3>Sin productos generales</h3>
                <p>Todos los productos activos estan en la seccion de ofertas.</p>
              </div>
            ` : `<div class="product-grid">${generalProducts.map((product) => createSaleProductCard(product, false)).join('')}</div>`}
          </section>
        `}
      `;

      activateProductToolbar(renderSaleModeCatalog);
    }

    function createSaleProductCard(product, highlightedOffer = false) {
      const productId = product.id || product.id_producto;
      const offerClass = highlightedOffer ? ' sale-offer-card' : '';

      return `
        <article class="product-card sale-product-card${offerClass}" onclick='showProductDetail(${jsString(productId)})'>
          ${highlightedOffer ? '<div class="sale-offer-ribbon"><span class="material-symbols-outlined">local_offer</span> Oferta destacada</div>' : ''}
          <div class="product-image-box">
            <img class="product-image" src="${product.image || product.imagen || baseImages[0]}" alt="${product.name || product.nombre}" loading="lazy" decoding="async">
          </div>

          <div class="product-info">
            <div>
              <h3 class="product-title">${product.name || product.nombre}</h3>
              <p class="product-description">${product.description || product.descripcion || 'Sin descripcion'}</p>

              <div class="product-meta">
                <span>${money(product.price || product.precio)}</span>
                <span>${product.category || product.nombre_categoria || 'Sin categoria'}</span>
              </div>

              <div class="rating-row">
                <span>${getStars(product.rating || product.estrellas)}</span>
                <strong>${product.rating || product.estrellas || 3}/5</strong>
              </div>

              <div class="tag-row">
                ${isOfferProduct(product) ? '<span class="tag offer-tag">Oferta</span>' : ''}
                ${product.economical ? '<span class="tag">Buen precio</span>' : ''}
                ${product.recommended ? '<span class="tag">Bien valorado</span>' : ''}
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
        localStorage.removeItem(STORAGE_KEYS.saleMode);
        appPage.classList.remove('sale-mode');
        renderDashboard('empresa');
        changeSection('productos');
      } else {
        notify('Clave incorrecta. El modo venta sigue activo.', 'warning');
        renderSaleModeCatalog();
      }
    }

    /* ========================================================= */
    /* FAVORITOS Y PERFIL */
    /* ========================================================= */

    function renderFavorites() {
      sectionTitle.textContent = 'Favoritos';
      const favorites = products.filter((product) => favoriteProducts.includes(product.id || product.id_producto) && product.estado !== "inhabilitado");

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
      sectionActions.innerHTML = `<button class="secondary-button" type="button" onclick="changeSection('perfil')">Actualizar</button><button class="primary-button" type="button" onclick="showProfileEditor()">Editar perfil</button>`;

      const nombre = getCurrentUserName();
      const correo = getCurrentUserEmail();
      const tipo = currentAccount?.tipo_cuenta || selectedRole;
      const fechaRegistro = formatFirebaseDate(currentAccount?.creado_en);
      const activeProducts = products.filter((product) => product.estado !== "inhabilitado");

      if (selectedRole === 'usuario') {
        const ratedProducts = products.filter((product) => Number(product.total_calificaciones_producto || 0) > 0).length;
        const favoriteVisible = activeProducts.filter((product) => favoriteProducts.includes(product.id || product.id_producto)).length;

        dynamicContent.innerHTML = `
          <div class="profile-hero panel">
            <div class="profile-avatar">${(nombre || 'U').slice(0, 2).toUpperCase()}</div>
            <div>
              <span class="status-pill active">Cuenta de usuario</span>
              <h3>${nombre}</h3>
              <p>${currentAccount?.nombre_usuario ? '@' + currentAccount.nombre_usuario : 'Usuario sin alias'} · ${correo}</p>
            </div>
          </div>

          <div class="panel-grid">
            <div class="panel">
              <h3>Informacion personal</h3>
              <div class="info-list">
                <p><strong>Nombre:</strong> ${nombre}</p>
                <p><strong>Usuario:</strong> ${currentAccount?.nombre_usuario || 'No registrado'}</p>
                <p><strong>Correo:</strong> ${correo}</p>
                <p><strong>Zona:</strong> ${currentAccount?.ubicacion || 'No indicada'}</p>
                <p><strong>Tipo de cuenta:</strong> ${tipo}</p>
                <p><strong>Registro:</strong> ${fechaRegistro}</p>
              </div>
            </div>

            <div class="panel">
              <h3>Actividad</h3>
              <div class="mini-stats">
                <div class="stat-card"><span class="stat-number">${favoriteProducts.length}</span><span class="stat-label">Favoritos guardados</span></div>
                <div class="stat-card"><span class="stat-number">${favoriteVisible}</span><span class="stat-label">Favoritos visibles</span></div>
                <div class="stat-card"><span class="stat-number">${activeProducts.length}</span><span class="stat-label">Productos disponibles</span></div>
                <div class="stat-card"><span class="stat-number">${ratedProducts}</span><span class="stat-label">Productos con resenas</span></div>
              </div>
            </div>
          </div>

          <div class="panel">
            <h3>Preferencias y recomendaciones</h3>
            <p>El sistema usa tus favoritos y calificaciones para que luego puedas construir recomendaciones mas precisas. Por ahora puedes explorar productos, guardar favoritos y revisar mercados aprobados.</p>
          </div>
        `;
      } else {
        const myCompanyId = getCurrentCompanyId();
        const myProducts = products.filter((product) => getProductCompanyId(product) === myCompanyId);
        const activeCount = myProducts.filter((product) => product.estado !== "inhabilitado").length;
        const inactiveCount = myProducts.filter((product) => product.estado === "inhabilitado").length;
        const recommended = myProducts.filter((product) => product.recommended).length;
        const economical = myProducts.filter((product) => product.economical).length;
        const ratingValues = myProducts.map((product) => Number(product.rating || product.estrellas || 0)).filter((rating) => rating > 0);
        const averageRating = ratingValues.length ? Math.round(ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length) : 0;
        const approvalText = currentAccount?.aprobado ? 'Aprobada' : (currentAccount?.estado === 'rechazada' ? 'Rechazada' : 'Pendiente de aprobacion');
        const approvalClass = currentAccount?.aprobado ? 'active' : (currentAccount?.estado === 'rechazada' ? 'danger' : 'pending');

        dynamicContent.innerHTML = `
          <div class="profile-hero panel">
            <div class="profile-avatar company-avatar">${(currentAccount?.logo || nombre || 'TT').slice(0, 2).toUpperCase()}</div>
            <div>
              <span class="status-pill ${approvalClass}">${approvalText}</span>
              <h3>${currentAccount?.nombre_empresa || nombre}</h3>
              <p>${currentAccount?.categoria_principal || 'Categoria no indicada'} · ${correo}</p>
            </div>
          </div>

          <div class="panel-grid">
            <div class="panel">
              <h3>Informacion de la empresa</h3>
              <div class="info-list">
                <p><strong>Nombre:</strong> ${currentAccount?.nombre_empresa || nombre}</p>
                <p><strong>Usuario:</strong> ${currentAccount?.nombre_usuario || 'No registrado'}</p>
                <p><strong>Encargado:</strong> ${currentAccount?.encargado || 'No indicado'}</p>
                <p><strong>Telefono:</strong> ${currentAccount?.telefono || 'No indicado'}</p>
                <p><strong>Direccion:</strong> ${currentAccount?.direccion || 'No indicada'}</p>
                <p><strong>Registro:</strong> ${fechaRegistro}</p>
              </div>
            </div>

            <div class="panel">
              <h3>Resumen del catalogo</h3>
              <div class="mini-stats">
                <div class="stat-card"><span class="stat-number">${myProducts.length}</span><span class="stat-label">Total</span></div>
                <div class="stat-card"><span class="stat-number">${activeCount}</span><span class="stat-label">Activos</span></div>
                <div class="stat-card"><span class="stat-number">${inactiveCount}</span><span class="stat-label">Inactivos</span></div>
                <div class="stat-card"><span class="stat-number">${economical}</span><span class="stat-label">Buen precio</span></div>
                <div class="stat-card"><span class="stat-number">${recommended}</span><span class="stat-label">Bien valorados</span></div>
                <div class="stat-card"><span class="stat-number">${averageRating || '0'}</span><span class="stat-label">Calificacion promedio</span></div>
              </div>
            </div>
          </div>

          <div class="panel">
            <h3>Presentacion</h3>
            <p>${currentAccount?.descripcion || 'Agrega una presentacion breve para tus clientes.'}</p>
          </div>

          <div class="panel">
            <h3>Accesos utiles</h3>
            <p>Administra tu catalogo desde <strong>Mis productos</strong>. Los clientes solo veran productos activos.</p><p>Activa <strong>Modo venta</strong> cuando quieras mostrar tu catalogo en una pantalla de tienda.</p>
          </div>
        `;
      }
    }


    function showProfileEditor() {
      sectionTitle.textContent = 'Editar perfil';
      sectionActions.innerHTML = `<button class="secondary-button" type="button" onclick="renderProfile()">Cancelar</button>`;

      const isCompany = selectedRole === 'empresa';

      dynamicContent.innerHTML = `
        <div class="panel profile-editor">
          <h3>${isCompany ? 'Datos de la empresa' : 'Datos del usuario'}</h3>
          <p>Actualiza la informacion visible en tu perfil. Los cambios se guardan en Firestore y en la sesion local.</p>

          <form id="profileEditForm" class="form-grid">
            <div class="form-group">
              <label class="form-label">${isCompany ? 'Nombre de la empresa' : 'Nombre completo'}</label>
              <input id="profileNameInput" class="form-input" type="text" value="${escapeHtml(isCompany ? (currentAccount?.nombre_empresa || currentAccount?.nombre || '') : (currentAccount?.nombre || ''))}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Nombre de usuario</label>
              <input class="form-input" type="text" value="${escapeHtml(currentAccount?.nombre_usuario || '')}" disabled>
            </div>

            <div class="form-group">
              <label class="form-label">Correo</label>
              <input class="form-input" type="email" value="${escapeHtml(currentAccount?.correo || '')}" disabled>
            </div>

            ${isCompany ? `
              <div class="form-group">
                <label class="form-label">Encargado</label>
                <input id="profileManagerInput" class="form-input" type="text" value="${escapeHtml(currentAccount?.encargado || '')}">
              </div>

              <div class="form-group">
                <label class="form-label">Telefono</label>
                <input id="profilePhoneInput" class="form-input" type="text" value="${escapeHtml(currentAccount?.telefono || '')}">
              </div>

              <div class="form-group">
                <label class="form-label">Direccion o zona</label>
                <input id="profileAddressInput" class="form-input" type="text" value="${escapeHtml(currentAccount?.direccion || '')}">
              </div>

              <div class="form-group">
                <label class="form-label">Categoria principal</label>
                <input id="profileCategoryInput" class="form-input" type="text" value="${escapeHtml(currentAccount?.categoria_principal || '')}">
              </div>

              <div class="form-group full">
                <label class="form-label">Descripcion publica</label>
                <textarea id="profileDescriptionInput" class="form-textarea" placeholder="Cuenta que vendes y donde atiendes.">${escapeHtml(currentAccount?.descripcion || '')}</textarea>
              </div>
            ` : `
              <div class="form-group">
                <label class="form-label">Provincia o zona</label>
                <input id="profileLocationInput" class="form-input" type="text" value="${escapeHtml(currentAccount?.ubicacion || '')}">
              </div>
            `}

            <div class="form-actions full">
              <button class="primary-button" type="submit">Guardar cambios</button>
              <button class="secondary-button" type="button" onclick="renderProfile()">Cancelar</button>
            </div>
          </form>
        </div>
      `;

      document.getElementById('profileEditForm').addEventListener('submit', saveProfileChanges);
    }

    async function saveProfileChanges(event) {
      event.preventDefault();

      if (!currentAccount?.uid) {
        notify('No hay una sesion activa.', 'warning');
        return;
      }

      const name = document.getElementById('profileNameInput')?.value.trim();

      if (!name) {
        notify('El nombre no puede quedar vacio.', 'warning');
        return;
      }

      try {
        const userUpdate = {
          nombre: name,
          actualizado_en: serverTimestamp()
        };

        if (selectedRole === 'usuario') {
          userUpdate.ubicacion = document.getElementById('profileLocationInput')?.value.trim() || '';
        }

        await updateDoc(doc(db, 'usuarios', currentAccount.uid), userUpdate);

        currentAccount = {
          ...currentAccount,
          nombre: name,
          ...userUpdate
        };

        if (selectedRole === 'empresa') {
          const companyUpdate = {
            nombre_empresa: name,
            nombre: name,
            encargado: document.getElementById('profileManagerInput')?.value.trim() || '',
            telefono: document.getElementById('profilePhoneInput')?.value.trim() || '',
            direccion: document.getElementById('profileAddressInput')?.value.trim() || '',
            categoria_principal: document.getElementById('profileCategoryInput')?.value.trim() || '',
            descripcion: document.getElementById('profileDescriptionInput')?.value.trim() || 'Empresa registrada en Tienda Tech.',
            actualizado_en: serverTimestamp()
          };

          await updateDoc(doc(db, 'empresas', currentAccount.uid), companyUpdate);

          currentAccount = {
            ...currentAccount,
            ...companyUpdate,
            nombre_empresa: companyUpdate.nombre_empresa
          };
        }

        saveSession(currentAccount);
        await loadData();
        notify('Perfil actualizado correctamente.', 'success');
        renderProfile();
      } catch (error) {
        notify('No se pudo actualizar el perfil.', 'warning');
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
        notify('No tienes permisos de administrador.', 'warning');
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

        notify('Empresa aprobada correctamente.', 'success');
        await loadData();
        renderAdminSection();
      } catch (error) {
        notify('No se pudo aprobar la empresa.', 'warning');
      }
    }

    async function rejectCompany(companyId) {
      if (!isAdminAccount()) {
        notify('No tienes permisos de administrador.', 'warning');
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

        notify('Empresa rechazada correctamente.', 'success');
        await loadData();
        renderAdminSection();
      } catch (error) {
        notify('No se pudo rechazar la empresa.', 'warning');
      }
    }

    function updateNetworkBadge() {
      const online = navigator.onLine;
      let badge = document.getElementById('networkBadge');

      if (online) {
        if (badge) badge.remove();
      } else {
        if (!badge) {
          badge = document.createElement('div');
          badge.id = 'networkBadge';
          badge.className = 'network-badge offline';
          badge.setAttribute('role', 'status');
          badge.setAttribute('aria-live', 'polite');
          document.body.appendChild(badge);
        }

        badge.textContent = 'Sin conexion';
      }

      if (online !== lastConnectionState) {
        notify(online ? 'Conexion recuperada.' : 'Estas sin conexion. Se usara cache cuando sea posible.', online ? 'success' : 'warning');
        lastConnectionState = online;
      }
    }

    function registerServiceWorker() {
      if (!('serviceWorker' in navigator)) return;

      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }

    async function initSessionWatcher() {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
      }

      showLoginScreen();
      updateNetworkBadge();
      window.addEventListener('online', updateNetworkBadge);
      window.addEventListener('offline', updateNetworkBadge);

      onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
          currentAccount = null;
          authToken = '';
          await loadData();
          showLoginScreen();
          return;
        }

        if (!firebaseUser.emailVerified) {
          await signOut(auth);
          showLoginScreen();
          return;
        }

        if (currentAccount?.uid === firebaseUser.uid && !appPage.classList.contains('hidden')) {
          return;
        }

        try {
          const account = await buildAccountFromUid(firebaseUser.uid);

          if (!account) {
            clearSessionStorage();
            await signOut(auth);
            showLoginScreen();
            notify('Tu cuenta existe, pero no tiene perfil guardado en Firestore.', 'warning');
            return;
          }

          await updateDoc(doc(db, "usuarios", firebaseUser.uid), {
            email_verificado: true
          });

          await startSession(account.tipo_cuenta, account, { restoreLastSection: true });
        } catch (error) {
          const cachedAccount = safeParse(localStorage.getItem(STORAGE_KEYS.account), null);

          if (cachedAccount?.uid === firebaseUser.uid) {
            await startSession(cachedAccount.tipo_cuenta, cachedAccount, { restoreLastSection: true });
            return;
          }

          showLoginScreen();
          notify('No se pudo restaurar la sesion. Inicia sesion nuevamente.', 'warning');
        }
      });
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

    registerBackButton?.addEventListener('click', () => {
      setAuthMode('login');
      loginForm.reset();
      document.getElementById('emailInput')?.focus();
    });

    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      registerSubmit.disabled = true;

      const nombre = document.getElementById('registerNameInput').value.trim();
      const nombreUsuarioOriginal = document.getElementById('registerUsernameInput')?.value.trim() || '';
      const nombreUsuario = normalizeUsername(nombreUsuarioOriginal);
      const correo = document.getElementById('registerEmailInput').value.trim();
      const contrasena = document.getElementById('registerPasswordInput').value.trim();
      const confirmarContrasena = document.getElementById('registerPasswordConfirmInput')?.value.trim();
      const aceptoTerminos = document.getElementById('termsInput')?.checked;

      if (!nombre || !nombreUsuario || !correo || !contrasena || !confirmarContrasena) {
        notify('Debes completar todos los campos obligatorios.', 'warning');
        registerSubmit.disabled = false;
        return;
      }

      if (!/^[a-z0-9._-]{3,24}$/.test(nombreUsuario)) {
        notify('El nombre de usuario solo puede tener letras, numeros, punto, guion o guion bajo. Debe tener entre 3 y 24 caracteres.', 'warning');
        registerSubmit.disabled = false;
        return;
      }

      if (contrasena !== confirmarContrasena) {
        notify('Las contrasenas no coinciden.', 'warning');
        registerSubmit.disabled = false;
        return;
      }

      if (!aceptoTerminos) {
        notify('Debes aceptar los terminos y condiciones.', 'warning');
        registerSubmit.disabled = false;
        return;
      }

      try {
        const usernameRef = doc(db, "usernames", nombreUsuario);
        const usernameSnap = await getDoc(usernameRef);

        if (usernameSnap.exists()) {
          notify('Ese nombre de usuario ya esta en uso.', 'warning');
          registerSubmit.disabled = false;
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

        notify('Cuenta creada correctamente. Te enviamos un correo de verificacion. Verifica tu correo antes de iniciar sesion.', 'success');

        await loadData();

        registerForm.reset();
        document.getElementById('emailInput').value = nombreUsuario;
        document.getElementById('passwordInput').value = '';

        setAuthMode('login');
        registerSubmit.disabled = false;
      } catch (error) {
        registerSubmit.disabled = false;
        notify('No se pudo crear la cuenta. Revisa si el correo ya esta registrado o si la contrasena tiene al menos 6 caracteres.', 'warning');
      }
    });

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      loginSubmit.disabled = true;

      const identificador = document.getElementById('emailInput').value.trim();
      const contrasena = document.getElementById('passwordInput').value.trim();

      if (!identificador || !contrasena) {
        notify('Debes escribir correo o nombre de usuario y contrasena.', 'warning');
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
                notify('No existe una cuenta con ese nombre de usuario.', 'warning');
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
          notify('Debes verificar tu correo antes de iniciar sesion. Te enviamos nuevamente el correo de verificacion.', 'warning');
          return;
        }

        const usuarioRef = doc(db, "usuarios", uid);
        const usuarioSnap = await getDoc(usuarioRef);

        if (!usuarioSnap.exists()) {
          await signOut(auth);
          notify('La cuenta existe en Firebase Auth, pero no tiene perfil en Firestore.', 'warning');
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
            notify('Esta cuenta de empresa no tiene perfil de empresa.', 'warning');
            return;
          }
        }

        selectedRole = account.tipo_cuenta;
        authToken = uid;
        currentAccount = account;

        saveSession(account);

        await startSession(account.tipo_cuenta, account, { restoreLastSection: false });
        loginSubmit.disabled = false;
      } catch (error) {
        loginSubmit.disabled = false;
        notify('No se pudo iniciar sesion. Revisa correo/nombre de usuario y contrasena.', 'warning');
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
      renderProductsSection,
      resetProductFilters,
      loadMoreProducts,
      showProfileEditor,
      saveProfileChanges,
      approveCompany,
      rejectCompany
    });

    registerServiceWorker();
    initSessionWatcher();