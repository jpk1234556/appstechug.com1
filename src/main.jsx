import React, { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, ChevronDown, Facebook, Instagram, Linkedin, Menu, Minus, Plus, Send, ShoppingBag, Trash2, Twitter, X } from 'lucide-react';
import { createOrder, deleteProduct, deleteService, getAdminOrders, getAdminProducts, getAdminServices, getAdminUsers, getCurrentProfile, getProducts, getServices, getSession, isAdmin, onAuthStateChange, saveProduct, saveService, signIn, signOut, signUp, subscribeToNewsletter, updateOrderStatus, updateUserAccount } from './lib/supabase';
import './styles.css';

const services = [
  ['01', 'Hotspot setup', 'Launch a dependable Wi-Fi business with the right network design, equipment, and configuration from day one.'],
  ['02', 'Network equipment', 'We source and install routers, access points, switches, and computers that are made to keep up.'],
  ['03', 'Technical support', 'Keep your customers connected with responsive maintenance, monitoring, and hands-on technical care.'],
];

const servicePackages = [
  { name: 'Basic hotspot', amount: 1000000, price: 'Ugx 1m', type: 'Hotspot setup', items: ['EAP 110 (outdoor / indoor)', 'Outdoor cable', 'RB 951', 'Captive portal, voucher and firewall setup'] },
  { name: 'Standard hotspot', amount: 2000000, price: 'Ugx 2m', type: 'Hotspot setup', items: ['EAP225 outdoor (2pcs)', 'Outdoor networking cable', 'L009 Series', 'Captive portal, voucher and firewall setup'] },
  { name: 'Premium hotspot', amount: 3500000, price: 'Ugx 3.5m', type: 'Hotspot setup', items: ['RG-RAP6262(G) / Unifi AC mesh (2pcs)', 'Outdoor networking cable', 'L009 Series and POE', 'AX1800 EAP610 ceiling mount if needed', 'Captive portal, voucher and firewall setup'] },
  { name: 'Starter backup', amount: 500000, price: 'Ugx 500,000', type: 'Backup power', items: ['2kVA UPS', 'Two 12V batteries', 'Complete wiring and installation', 'Surge and overload protection', 'Backup duration: 4-5 hours'] },
  { name: 'Standard backup', amount: 1000000, price: 'Ugx 1,000,000', type: 'Backup power', items: ['1 solar panel (>= 300W)', '1 deep-cycle battery', '1-2kVA inverter and charge controller', 'Cables, protections and full installation', 'Backup duration: 12-15 hours'] },
  { name: 'Polish backup', amount: 1500000, price: 'Ugx 1,500,000', type: 'Backup power', items: ['2 solar panels (>= 300W each)', '2 deep-cycle batteries', 'Inverter system and charge controller', 'All accessories and professional installation', 'Backup duration: 24 hours'] },
  { name: 'Duo Polish Hybrid', amount: 2000000, price: 'Ugx 2,000,000', type: 'Backup power', items: ['2 solar panels (>= 300W each)', 'Hybrid inverter (solar + grid + battery)', 'Smart charge controller', 'Battery bank (1-2 units depending on need)', 'Backup duration: 20-24 hours'] },
];

const faqs = [
  ['How do I get started with Appstech?', 'Book a free consultation and we will map the right equipment, coverage, and business model for your space.'],
  ['How long does setup take?', 'Most small and medium hotspot installations can be planned and brought online within a few working days.'],
  ['Which payment methods are accepted?', 'We accept mobile money, bank transfer, and other flexible payment options for clients across Uganda.'],
];

function formatPrice(amount) {
  return `Ugx ${Number(amount || 0).toLocaleString()}`;
}

function LoginView({ onClose, onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    if (form.password.length < 6) return setStatus('Password must be at least 6 characters.');
    setStatus('Working...');
    const result = mode === 'login' ? await signIn(form.email, form.password) : await signUp(form.email, form.password);
    if (!result.ok) return setStatus(result.message);
    setStatus(mode === 'login' ? 'You are signed in.' : 'Account created. Check your email if confirmation is enabled.');
    onAuthenticated();
  };

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <button className="auth-close" onClick={onClose} aria-label="Close login"><X /></button>
        <a className="logo auth-logo" href="#top"><strong>APPSTECH</strong><span>INTERNATIONAL</span><small>SALES | SERVICE | SOLUTIONS | SPARES</small></a>
        <p className="eyebrow">/ Customer account</p>
        <h1>{mode === 'login' ? 'Welcome back.' : 'Start your account.'}</h1>
        <p className="auth-copy">Save your details and keep track of your Appstech orders in one place.</p>
        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="auth-email">Email address</label>
          <input id="auth-email" required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <label htmlFor="auth-password">Password</label>
          <input id="auth-password" required type="password" minLength="6" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          <button className="button button-blue" type="submit">{mode === 'login' ? 'Sign in' : 'Create account'} <ArrowUpRight size={17} /></button>
          {status && <p className="form-status" role="status">{status}</p>}
        </form>
        <button className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setStatus(''); }}>
          {mode === 'login' ? 'Need an account? Create one' : 'Already have an account? Sign in'}
        </button>
      </div>
      <div className="auth-image">
        <div>
          <span className="eyebrow">Connected businesses start here</span>
          <h2>Make your connection <em>count.</em></h2>
        </div>
      </div>
    </div>
  );
}

function AdminView({ onClose }) {
  const [view, setView] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [productForm, setProductForm] = useState({ id: null, name: '', amount: '', type: 'Product', category: 'General', description: '', image_url: '', stock: 0, is_active: true });
  const [productImage, setProductImage] = useState(null);
  const [status, setStatus] = useState('Loading data...');

  useEffect(() => {
    Promise.all([getAdminOrders(), getAdminUsers(), getAdminProducts(), getAdminServices()]).then(([ordersResult, usersResult, productsResult, servicesResult]) => {
      if (!ordersResult.ok) return setStatus(ordersResult.message);
      if (!usersResult.ok) return setStatus(usersResult.message);
      if (!productsResult.ok) return setStatus(productsResult.message);
      if (!servicesResult.ok) return setStatus(servicesResult.message);
      setOrders(ordersResult.orders || []);
      setUsers(usersResult.users || []);
      setProducts(productsResult.products || []);
      setServices(servicesResult.services || []);
      setStatus('');
    });
  }, []);

  const changeStatus = async (orderId, nextStatus) => {
    const result = await updateOrderStatus(orderId, nextStatus);
    if (!result.ok) return setStatus(result.message);
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status: nextStatus } : order));
  };

  const changeUser = async (userId, changes) => {
    const result = await updateUserAccount(userId, changes);
    if (!result.ok) return setStatus(result.message);
    setUsers((current) => current.map((user) => user.user_id === userId ? { ...user, ...changes } : user));
  };

  const editProduct = (product) => {
    setProductForm({
      id: product.id,
      name: product.name || '',
      amount: product.amount || '',
      type: product.type || 'Product',
      category: product.category || 'General',
      description: product.description || '',
      image_url: product.image_url || '',
      stock: product.stock ?? 0,
      is_active: product.is_active !== false,
    });
    setProductImage(null);
  };

  const submitProduct = async (event) => {
    event.preventDefault();
    setStatus('Saving product...');
    const result = await saveProduct({
      ...productForm,
      stock: Number(productForm.stock || 0),
      category: productForm.category || 'General',
    }, productImage);
    if (!result.ok) return setStatus(result.message);
    setProducts((current) => productForm.id ? current.map((item) => item.id === result.product.id ? result.product : item) : [result.product, ...current]);
    setProductForm({ id: null, name: '', amount: '', type: 'Product', category: 'General', description: '', image_url: '', stock: 0, is_active: true });
    setProductImage(null);
    setStatus('Product saved.');
  };

  const removeProduct = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    const result = await deleteProduct(productId);
    if (!result.ok) return setStatus(result.message);
    setProducts((current) => current.filter((product) => product.id !== productId));
  };

  const saveServicePackage = async (service) => {
    const result = await saveService(service);
    if (!result.ok) return setStatus(result.message);
    setServices((current) => service.id ? current.map((item) => item.id === result.service.id ? result.service : item) : [result.service, ...current]);
  };

  const removeServicePackage = async (serviceId) => {
    if (!window.confirm('Delete this service package?')) return;
    const result = await deleteService(serviceId);
    if (!result.ok) return setStatus(result.message);
    setServices((current) => current.filter((service) => service.id !== serviceId));
  };

  return (
    <div className="admin-screen">
      <div className="admin-header">
        <div>
          <span className="eyebrow">/ Operations</span>
          <h1>{view === 'orders' ? 'Order desk.' : view === 'users' ? 'User accounts.' : view === 'services' ? 'Service packages.' : 'Product catalog.'}</h1>
          <p>{view === 'orders' ? 'Review customer requests and keep delivery status moving.' : view === 'users' ? 'Control roles and access for every registered account.' : view === 'services' ? 'Manage service packages and their prices independently.' : 'Add physical products, update prices, and manage stock.'}</p>
        </div>
        <button className="close-cart" onClick={onClose} aria-label="Close admin dashboard"><X /></button>
      </div>

      <div className="admin-tabs">
        <button className={view === 'orders' ? 'active' : ''} onClick={() => setView('orders')}>Orders <span>{orders.length}</span></button>
        <button className={view === 'products' ? 'active' : ''} onClick={() => setView('products')}>Products <span>{products.length}</span></button>
        <button className={view === 'services' ? 'active' : ''} onClick={() => setView('services')}>Services <span>{services.length}</span></button>
        <button className={view === 'users' ? 'active' : ''} onClick={() => setView('users')}>Users <span>{users.length}</span></button>
      </div>

      <div className="admin-content">
        {status && <p className="admin-status">{status}</p>}

        {view === 'orders' && (
          <>
            {orders.map((order) => (
              <article className="admin-order" key={order.id}>
                <div className="admin-order-main">
                  <div>
                    <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                    <h2>{order.customer_name}</h2>
                    <p>{order.customer_email} • {order.customer_phone}</p>
                  </div>
                  <strong>{formatPrice(order.total_amount)}</strong>
                </div>
                <div className="admin-order-items">
                  {(order.order_items || []).map((item) => (
                    <span key={`${order.id}-${item.product_name}`}>{item.product_name} × {item.quantity}</span>
                  ))}
                </div>
                <div className="admin-order-footer">
                  <span className={`order-status ${order.status === 'cancelled' ? 'status-cancelled' : ''}`}>{order.status}</span>
                  <select value={order.status || 'requested'} onChange={(event) => changeStatus(order.id, event.target.value)}>
                    <option value="requested">Requested</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </article>
            ))}
          </>
        )}

        {view === 'products' && (
          <>
            <form className="product-form" onSubmit={submitProduct}>
              <h2>{productForm.id ? 'Edit product' : 'Add product'}</h2>
              <div className="product-form-grid">
                <input required placeholder="Product name" value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} />
                <input required type="number" min="1" placeholder="Price in Ugx" value={productForm.amount} onChange={(event) => setProductForm({ ...productForm, amount: event.target.value })} />
                <input placeholder="Category" value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} />
                <input required type="number" min="0" placeholder="Stock" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: Number(event.target.value) || 0 })} />
                <input placeholder="Image URL (optional)" value={productForm.image_url} onChange={(event) => setProductForm({ ...productForm, image_url: event.target.value })} />
                <input placeholder="Product type" value={productForm.type} onChange={(event) => setProductForm({ ...productForm, type: event.target.value })} />
                <textarea placeholder="Product description" value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} />
                <label className="toggle-row">
                  <input type="checkbox" checked={productForm.is_active} onChange={(event) => setProductForm({ ...productForm, is_active: event.target.checked })} />
                  Active listing
                </label>
                <div className="product-form-actions">
                  <button className="button button-blue" type="submit">{productForm.id ? 'Save changes' : 'Create product'}</button>
                  {productForm.id && <button type="button" className="cancel-button" onClick={() => setProductForm({ id: null, name: '', amount: '', type: 'Product', category: 'General', description: '', image_url: '', stock: 0, is_active: true })}>Cancel</button>}
                </div>
              </div>
              <input type="file" accept="image/*" onChange={(event) => setProductImage(event.target.files?.[0] || null)} />
            </form>

            <div className="product-admin-grid">
              {products.map((product) => (
                <article className="admin-product" key={product.id}>
                  {product.image_url ? <img src={product.image_url} alt={product.name} /> : <div className="admin-product-placeholder">No image</div>}
                  <div className="admin-product-body">
                    <span className="order-date">{product.category || 'General'}</span>
                    <h2>{product.name}</h2>
                    <strong>{formatPrice(product.amount)}</strong>
                    <p>{product.description}</p>
                    <div className="admin-product-meta">
                      <span>Stock: {product.stock ?? 0}</span>
                      <span>{product.is_active ? 'Live' : 'Draft'}</span>
                    </div>
                    <div className="admin-product-actions">
                      <button className="edit-product" onClick={() => editProduct(product)}>Edit</button>
                      <button className="delete-product" onClick={() => removeProduct(product.id)}>Delete</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {view === 'services' && (
          <>
            {services.map((service) => (
              <div className="admin-service" key={service.id}>
                <div className="admin-service-main">
                  <div>
                    <span className="order-date">{service.type}</span>
                    <h2>{service.name}</h2>
                    <p>{service.description}</p>
                  </div>
                  <strong>{formatPrice(service.amount)}</strong>
                </div>
                <div className="admin-order-footer">
                  <span className="order-status">{service.is_active ? 'Active' : 'Hidden'}</span>
                  <div className="admin-user-controls">
                    <button className="edit-product" onClick={() => saveServicePackage({ ...service, is_active: !service.is_active })}>Toggle</button>
                    <button className="delete-product" onClick={() => removeServicePackage(service.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {view === 'users' && (
          <>
            {users.map((user) => (
              <div className="admin-user" key={user.user_id}>
                <div>
                  <span className="order-date">{user.status}</span>
                  <h2>{user.email}</h2>
                  <p>{user.user_id}</p>
                </div>
                <div className="admin-user-controls">
                  <select value={user.role || 'customer'} onChange={(event) => changeUser(user.user_id, { role: event.target.value })}>
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                  <select value={user.status || 'active'} onChange={(event) => changeUser(user.user_id, { status: event.target.value })}>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);
  const [email, setEmail] = useState('');
  const [contactStatus, setContactStatus] = useState('');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [orderStatus, setOrderStatus] = useState('');
  const [storeProducts, setStoreProducts] = useState([]);
  const [storeServices, setStoreServices] = useState(servicePackages);
  const [authOpen, setAuthOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    getSession().then(setSession);
    return onAuthStateChange(setSession);
  }, []);

  useEffect(() => {
    if (!session) return setAdmin(false);
    getCurrentProfile().then((profile) => {
      if (profile?.status === 'suspended') {
        signOut();
        setSession(null);
        return;
      }
      isAdmin().then(setAdmin);
    });
  }, [session]);

  useEffect(() => {
    Promise.all([getProducts(), getServices()]).then(([productsResult, servicesResult]) => {
      if (productsResult.ok) {
        setStoreProducts(productsResult.products.map((product) => ({
          ...product,
          price: formatPrice(product.amount),
          items: product.description ? product.description.split('\n').filter(Boolean) : [],
          stock: product.stock ?? 0,
        })));
      }
      if (servicesResult.ok && servicesResult.services.length) {
        setStoreServices(servicesResult.services.map((service) => ({
          ...service,
          price: formatPrice(service.amount),
          items: service.description ? service.description.split('\n').filter(Boolean) : [],
        })));
      }
    });
  }, []);

  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((total, item) => total + Number(item.amount || 0) * item.quantity, 0), [cart]);

  const addToCart = (pack) => {
    setCart((current) => {
      const existing = current.find((item) => item.name === pack.name && item.type === pack.type);
      if (existing) {
        const nextQuantity = existing.quantity + 1;
        if (pack.stock !== undefined && nextQuantity > pack.stock) return current;
        return current.map((item) => item.name === pack.name && item.type === pack.type ? { ...item, quantity: nextQuantity } : item);
      }
      if (pack.stock !== undefined && pack.stock <= 0) return current;
      return [...current, { ...pack, quantity: 1, amount: Number(pack.amount || 0), price: formatPrice(pack.amount || 0) }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (name, change) => setCart((current) => current.flatMap((item) => {
    if (item.name !== name) return [item];
    const nextQuantity = item.quantity + change;
    return nextQuantity > 0 ? [{ ...item, quantity: nextQuantity }] : [];
  }));

  const submitOrder = async (event) => {
    event.preventDefault();
    if (!cart.length) return setOrderStatus('Add a package before sending your request.');
    setOrderStatus('Sending request...');
    const result = await createOrder(customer, cart, cartTotal);
    if (!result.ok) return setOrderStatus(result.message);
    setOrderStatus('Request received. We will contact you to confirm delivery and payment.');
    setCart([]);
    setCustomer({ name: '', email: '', phone: '' });
  };

  const submitContact = async (event) => {
    event.preventDefault();
    if (!email.includes('@')) return setContactStatus('Please enter a valid email.');
    setContactStatus('Sending...');
    const result = await subscribeToNewsletter(email);
    if (!result.ok) return setContactStatus(result.message);
    setContactStatus('Thanks. You are on the list.');
    setEmail('');
  };

  return (
    <div className="site-shell">
      <div className="utility-bar"><div className="utility-inner"><span>Sales <i>|</i> Service <i>|</i> Solution <i>|</i> Spare</span><div className="socials"><a href="#footer" aria-label="Facebook"><Facebook size={15} /></a><a href="#footer" aria-label="Twitter"><Twitter size={15} /></a><a href="#footer" aria-label="LinkedIn"><Linkedin size={15} /></a><a href="#footer" aria-label="Instagram"><Instagram size={15} /></a></div></div></div>
      <header className="header">
        <a className="logo" href="#top" aria-label="Appstech home"><strong>APPSTECH</strong><span>INTERNATIONAL</span><small>SALES | SERVICE | SOLUTIONS | SPARES</small></a>
        <nav className={menuOpen ? 'nav nav-open' : 'nav'}>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
          <a href="#shop" onClick={() => setMenuOpen(false)}>Shop</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
          <a className="nav-cta" href="#contact" onClick={() => setMenuOpen(false)}>Talk to us <ArrowUpRight size={16} /></a>
        </nav>
        <div className="header-actions">
          {admin && <button className="account-button" onClick={() => setAdminOpen(true)}>Admin</button>}
          {session ? <button className="account-button" onClick={signOut} aria-label="Sign out">Sign out</button> : <button className="account-button" onClick={() => setAuthOpen(true)}>Log in</button>}
          <button className="cart-button" onClick={() => setCartOpen(true)} aria-label={`Open cart with ${cartCount} items`}><ShoppingBag size={20} /><span>{cartCount}</span></button>
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      {authOpen && <LoginView onClose={() => setAuthOpen(false)} onAuthenticated={() => setAuthOpen(false)} />}
      {adminOpen && <AdminView onClose={() => setAdminOpen(false)} />}

      <main id="top">
        <section className="hero">
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="eyebrow">Reliable connectivity. Real opportunity.</p>
            <h1>Turn internet connectivity <em>into a business.</em></h1>
            <p className="hero-copy">We provide everything you need to build and operate a successful Wi-Fi hotspot business, from network setup and equipment to user management and technical support.</p>
            <div className="hero-actions">
              <a className="button button-light" href="#contact">Free consultation <ArrowUpRight size={18} /></a>
              <a className="text-link" href="#services">Explore services <ArrowUpRight size={18} /></a>
            </div>
          </div>
          <div className="hero-note"><span>01</span><span>Connectivity built for growth</span></div>
        </section>

        <section className="partner-strip"><span>Trusted technology for ambitious operators</span><div className="partner-logos"><b>DELL</b><b>hp</b><b>Lenovo</b><b>TOSHIBA</b></div></section>

        <section className="intro section" id="about">
          <div className="section-label">/ Who we are</div>
          <div className="intro-grid">
            <h2>Make your connection <em>count.</em></h2>
            <div>
              <p className="lead">The internet is more than a utility. With the right tools and support, it becomes a reliable source of income, access, and possibility.</p>
              <p>Appstech International helps individuals and businesses turn internet connectivity into a profitable opportunity. We make the technical side clear, practical, and ready for the real world.</p>
              <a className="arrow-link" href="#contact">Meet Appstech <ArrowUpRight size={18} /></a>
            </div>
          </div>
        </section>

        <section className="services section" id="services">
          <div className="section-label">/ What we do</div>
          <div className="section-heading">
            <h2>Everything you need to <em>stay connected.</em></h2>
            <p>From your first access point to your hundredth customer, we are in your corner.</p>
          </div>
          <div className="service-grid">{services.map(([number, title, text]) => <article className="service-card" key={number}><span className="service-number">{number}</span><h3>{title}</h3><p>{text}</p><a href="#contact" aria-label={`Learn more about ${title}`}><ArrowUpRight size={20} /></a></article>)}</div>
        </section>

        <section className="pricing section" id="pricing">
          <div className="section-label">/ Services</div>
          <div className="section-heading">
            <h2>Choose the right <em>service package.</em></h2>
            <p>Service pricing is managed independently from physical products. Add a package to your request and we will confirm installation and payment.</p>
          </div>
          <div className="pricing-grid">{storeServices.map((pack, index) => <article className={`price-card ${index === 1 ? 'featured' : ''}`} key={pack.id || pack.name}><div className="price-card-top"><span>{pack.type}</span><span>0{index + 1}</span></div><h3>{pack.name}</h3><ul>{pack.items.map((item) => <li key={item}>{item}</li>)}</ul><div className="price-bottom"><strong>{pack.price}</strong><button className="add-button" onClick={() => addToCart({ ...pack, amount: Number(pack.amount || 0), stock: pack.stock ?? Infinity })} aria-label={`Add ${pack.name} to cart`}><Plus size={19} /> Add</button></div></article>)}</div>
        </section>

        {storeProducts.length > 0 && (
          <section className="product-catalog section" id="shop">
            <div className="section-label">/ Products</div>
            <div className="section-heading">
              <h2>Equipment for <em>the work ahead.</em></h2>
              <p>Physical products and equipment are managed separately from service packages.</p>
            </div>
            <div className="product-store-grid">
              {storeProducts.map((product) => (
                <article className="store-product" key={product.id}>
                  <img src={product.image_url || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'} alt={product.name} />
                  <div>
                    <span className="order-date">{product.category || product.type || 'Product'}</span>
                    <h3>{product.name}</h3>
                    <strong>{product.price}</strong>
                    <small className="stock-tag">{product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}</small>
                    <button className="add-button" onClick={() => addToCart(product)} disabled={Number(product.stock || 0) <= 0}>Add to cart</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="proof" id="proof">
          <div className="proof-photo" />
          <div className="proof-content">
            <div className="section-label">/ The Appstech difference</div>
            <h2>Technology that works as hard as <em>you do.</em></h2>
            <p>Reliable service should feel simple. We combine quality hardware with practical setup and ongoing support so you can focus on your customers.</p>
            <div className="stats">
              <div><strong>150<span>+</span></strong><small>Businesses supported</small></div>
              <div><strong>24<span>/7</span></strong><small>Technical confidence</small></div>
              <div><strong>10<span>yr</span></strong><small>Of local expertise</small></div>
            </div>
          </div>
        </section>

        <section className="testimonials section">
          <div className="section-label">/ In their words</div>
          <div className="testimonial-grid">
            <div>
              <h2>Built with people, <em>not just systems.</em></h2>
              <a className="arrow-link" href="#contact">Start a conversation <ArrowUpRight size={18} /></a>
            </div>
            <blockquote>
              <span className="quote-mark">“</span>
              <p>Appstech helped us move from a slow, unreliable setup to a network our customers can trust. The difference is clear every single day.</p>
              <footer><span className="avatar">AM</span><span><strong>Andrew M.</strong><small>Hotspot operator, Kampala</small></span></footer>
            </blockquote>
          </div>
        </section>

        <section className="faq section" id="faq">
          <div className="section-label">/ Good to know</div>
          <div className="faq-grid">
            <h2>Questions, <em>answered.</em></h2>
            <div>{faqs.map(([question, answer], index) => <div className={`faq-item ${activeFaq === index ? 'active' : ''}`} key={question}><button onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}><span>{question}</span><ChevronDown size={20} /></button>{activeFaq === index && <p>{answer}</p>}</div>)}</div>
          </div>
        </section>

        <section className="cta" id="contact">
          <div>
            <p className="eyebrow">Ready when you are</p>
            <h2>Let's make your<br /><em>connection count.</em></h2>
          </div>
          <form onSubmit={submitContact}>
            <label htmlFor="email">Get useful updates and offers</label>
            <div className="input-row"><input id="email" type="email" placeholder="Your email address" value={email} onChange={(event) => setEmail(event.target.value)} /><button aria-label="Subscribe"><Send size={18} /></button></div>
            {contactStatus && <p className="form-status" role="status">{contactStatus}</p>}
          </form>
        </section>
      </main>

      {cartOpen && (
        <aside className="cart-drawer" aria-label="Shopping cart">
          <div className="cart-header">
            <div>
              <span className="section-label">/ Your request</span>
              <h2>Cart <span>{cartCount}</span></h2>
            </div>
            <button className="close-cart" onClick={() => setCartOpen(false)} aria-label="Close cart"><X /></button>
          </div>

          {cart.length === 0 ? (
            <p className="empty-cart">Your cart is empty. Add a package to get started.</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div className="cart-item" key={`${item.name}-${item.type}`}>
                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.price || formatPrice(item.amount)}</small>
                      <small className="stock-tag">{item.stock !== undefined && item.stock !== Infinity ? `${item.stock} left` : 'Custom order'}</small>
                    </div>
                    <div className="quantity">
                      <button onClick={() => updateQuantity(item.name, -1)} aria-label={`Remove one ${item.name}`}><Minus size={14} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.name, 1)} aria-label={`Add one ${item.name}`}><Plus size={14} /></button>
                      <button className="remove-item" onClick={() => setCart((current) => current.filter((entry) => !(entry.name === item.name && entry.type === item.type)))} aria-label={`Remove ${item.name}`}><Trash2 size={15} /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-total">
                <span>Estimated total</span>
                <strong>Ugx {cartTotal.toLocaleString()}</strong>
              </div>

              <form className="checkout-form" onSubmit={submitOrder}>
                <input required placeholder="Your name" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} />
                <input required type="email" placeholder="Email address" value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} />
                <input required type="tel" placeholder="Phone number" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} />
                <button className="button button-blue" type="submit">Send order request <ArrowUpRight size={17} /></button>
                {orderStatus && <p className="form-status" role="status">{orderStatus}</p>}
              </form>
            </>
          )}
        </aside>
      )}

      <footer className="footer" id="footer">
        <div className="footer-brand">
          <a className="logo" href="#top"><strong>APPSTECH</strong><span>INTERNATIONAL</span><small>SALES | SERVICE | SOLUTIONS | SPARES</small></a>
          <p>Fast, reliable internet solutions for businesses ready to grow.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <a href="#about">About us</a>
          <a href="#services">Our services</a>
          <a href="#proof">Why Appstech</a>
        </div>
        <div>
          <h4>Contact</h4>
          <a href="mailto:hello@appstechug.com">hello@appstechug.com</a>
          <a href="tel:+256700170685">+256 700 170685</a>
          <span>Kampala, Uganda</span>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Appstech International</span>
          <span>Built for better connections.</span>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
