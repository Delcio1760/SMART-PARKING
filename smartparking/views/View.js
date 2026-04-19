/**
 * VIEW — Smart Parking
 * Responsável por renderizar HTML a partir de dados
 */

const View = (() => {

  // ── Navbar ─────────────────────────────────────────────────────────────
  const renderNavbar = (user, isAuthPage = false) => {
    const isLoggedIn = !!user;
    const isAdmin = user && user.role === 'admin';

    if (isAuthPage) {
      return `
      <nav class="navbar">
        <div class="navbar-inner">
          <a href="index.html" class="navbar-logo"><span class="text-accent">Smart</span> Parking</a>
          <div class="navbar-nav">
            <a href="index.html#sobre" class="nav-link">Sobre nós</a>
            <a href="register.html" class="nav-link">Registo</a>
            <a href="login.html" class="nav-link highlight">Login</a>
          </div>
        </div>
      </nav>`;
    }

    if (!isLoggedIn) {
      return `
      <nav class="navbar">
        <div class="navbar-inner">
          <a href="index.html" class="navbar-logo"><span class="text-accent">Smart</span> Parking</a>
          <div class="navbar-nav">
            <a href="index.html#sobre" class="nav-link">Sobre nós</a>
            <a href="register.html" class="nav-link">Registo</a>
            <a href="login.html" class="nav-link highlight">Login</a>
          </div>
          <div class="navbar-actions">
            <a href="login.html" class="btn btn-primary btn-sm">Entrar</a>
          </div>
        </div>
      </nav>`;
    }

    if (isAdmin) {
      return `
      <nav class="navbar">
        <div class="navbar-inner">
          <a href="index.html" class="navbar-logo"><span class="text-accent">Smart</span> Parking</a>
          <div class="navbar-nav">
            <a href="admin.html" class="nav-link">Dashboard</a>
            <a href="admin-parks.html" class="nav-link">Parques</a>
            <a href="admin-users.html" class="nav-link">Utilizadores</a>
            <a href="admin-reservations.html" class="nav-link">Reservas</a>
            <a href="admin-stats.html" class="nav-link">Estatísticas</a>
          </div>
          <div class="navbar-actions">
            <span class="text-muted" style="font-size:0.85rem">${user.name}</span>
            <button class="btn btn-ghost btn-sm" id="btn-logout">Sair</button>
          </div>
        </div>
      </nav>`;
    }

    return `
    <nav class="navbar">
      <div class="navbar-inner">
        <a href="index.html" class="navbar-logo"><span class="text-accent">Smart</span> Parking</a>
        <div class="navbar-nav">
          <a href="dashboard.html" class="nav-link">Início</a>
          <input type="text" class="form-input" placeholder="Procurar Parques..." style="width:220px;padding:0.4rem 0.9rem;font-size:0.85rem" id="nav-search">
          <a href="reservations.html" class="nav-link">Minhas reservas</a>
          <a href="profile.html" class="nav-link text-accent">Meu Perfil</a>
        </div>
        <div class="navbar-actions">
          <button class="btn btn-ghost btn-sm" id="btn-logout">Sair</button>
        </div>
      </div>
    </nav>`;
  };

  // ── Footer ─────────────────────────────────────────────────────────────
  const renderFooter = () => `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <div class="footer-logo"><span class="text-accent">Smart</span> Parking</div>
            <p class="footer-tagline">Estacionamento inteligente, rápido e sem complicações.</p>
            <p class="footer-tagline">Contacto: smartparking@email.com | +351 912 345 678</p>
          </div>
          <div>
            <div class="footer-heading">Navegação</div>
            <div class="footer-links">
              <a href="index.html">Início</a>
              <a href="index.html#sobre">Sobre Nós</a>
              <a href="register.html">Registo</a>
              <a href="login.html">Login</a>
            </div>
          </div>
          <div>
            <div class="footer-heading">Serviços</div>
            <div class="footer-links">
              <a href="dashboard.html">Parques</a>
              <a href="reservations.html">Reservas</a>
              <a href="profile.html">Perfil</a>
            </div>
          </div>
          <div>
            <div class="footer-heading">Legal</div>
            <div class="footer-links">
              <a href="#">Privacidade</a>
              <a href="#">Termos de Uso</a>
              <a href="#">RGPD</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 Smart Parking. Todos os direitos reservados.</span>
        </div>
      </div>
    </footer>`;

  // ── Park Card ──────────────────────────────────────────────────────────
  const renderParkCard = (park) => {
    const occupancy = Math.round(((park.capacity - park.available) / park.capacity) * 100);
    return `
    <div class="park-card" data-park-id="${park.id}">
      <img class="park-card-img" src="${park.img}" alt="${park.name}" loading="lazy">
      <div class="park-card-body">
        <div class="park-card-name">${park.name}</div>
        <div class="park-card-info">📍 ${park.city}</div>
        <div class="park-card-spots">${park.available} lugares disponíveis</div>
      </div>
      <div class="park-card-footer">
        <button class="btn btn-primary btn-sm btn-reserve" data-id="${park.id}">Agendar</button>
      </div>
    </div>`;
  };

  // ── Reservation Row ────────────────────────────────────────────────────
  const renderReservationRow = (r, showActions = false) => {
    const statusMap = {
      confirmed:  { label: 'Confirmada', cls: 'warning' },
      pending:    { label: 'Pendente',   cls: 'info' },
      completed:  { label: 'Concluída',  cls: 'neutral' },
      cancelled:  { label: 'Cancelada',  cls: 'danger' },
    };
    const s = statusMap[r.status] || statusMap.pending;
    return `
    <tr>
      <td>${r.park}</td>
      <td>${r.spot}</td>
      <td>${r.date}</td>
      <td>${r.start} – ${r.end}</td>
      <td><span class="badge badge-${s.cls}">${s.label}</span></td>
      <td>€${r.amount?.toFixed(2) ?? '-'}</td>
      ${showActions ? `<td>
        ${r.status === 'pending' || r.status === 'confirmed'
          ? `<button class="btn btn-danger btn-sm btn-cancel-res" data-id="${r.id}">Cancelar</button>`
          : `<span class="text-muted" style="font-size:0.8rem">—</span>`}
      </td>` : ''}
    </tr>`;
  };

  // ── User Row ───────────────────────────────────────────────────────────
  const renderUserRow = (u) => {
    const statusCls = u.status === 'active' ? 'success' : 'danger';
    const statusLabel = u.status === 'active' ? 'Ativo' : 'Bloqueado';
    return `
    <tr>
      <td>${u.id}</td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td><span class="badge badge-${statusCls}">${statusLabel}</span></td>
      <td>
        <button class="btn btn-ghost btn-sm btn-toggle-user" data-id="${u.id}" data-status="${u.status}">
          ${u.status === 'active' ? 'Bloquear' : 'Ativar'}
        </button>
      </td>
    </tr>`;
  };

  // ── Stars ──────────────────────────────────────────────────────────────
  const renderStars = (n) =>
    Array.from({length: 5}, (_, i) =>
      `<span style="color:${i < n ? 'var(--color-accent)' : 'var(--color-surface-3)'}">★</span>`
    ).join('');

  // ── Toast ──────────────────────────────────────────────────────────────
  const showToast = (message, type = 'info') => {
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const container = document.getElementById('toast-container') ||
      (() => {
        const el = document.createElement('div');
        el.id = 'toast-container';
        document.body.appendChild(el);
        return el;
      })();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || icons.info}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  };

  // ── Modal Helpers ──────────────────────────────────────────────────────
  const openModal = (id) => {
    document.getElementById(id)?.classList.add('active');
  };

  const closeModal = (id) => {
    document.getElementById(id)?.classList.remove('active');
  };

  // ── Stat Card ──────────────────────────────────────────────────────────
  const renderStatCard = (label, value, change, up = true) => `
    <div class="stat-card">
      <div class="stat-label">${label}</div>
      <div class="stat-value">${value}</div>
      ${change ? `<div class="stat-change ${up ? 'up' : 'down'}">${up ? '↑' : '↓'} ${change}</div>` : ''}
    </div>`;

  // ── Park Occupancy Row ─────────────────────────────────────────────────
  const renderParkOccupancy = (park, occupancy) => {
    const cls = occupancy >= 80 ? 'high' : occupancy >= 50 ? 'medium' : 'low';
    return `
    <div style="padding: var(--space-md) 0; border-bottom: 1px solid var(--color-border)">
      <div class="flex-between">
        <div>
          <div style="font-weight:600;font-size:0.9rem">${park.name}</div>
          <div style="font-size:0.8rem;color:var(--color-text-muted)">${park.city}</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:var(--font-display);font-size:1.3rem;font-weight:800;color:var(--color-accent)">${occupancy}%</div>
          <div style="font-size:0.75rem;color:var(--color-text-muted)">${park.capacity - park.available}/${park.capacity} lugares</div>
        </div>
      </div>
      <div class="progress-bar" style="margin-top:var(--space-sm)">
        <div class="progress-fill ${cls}" style="width:${occupancy}%"></div>
      </div>
    </div>`;
  };

  return {
    renderNavbar,
    renderFooter,
    renderParkCard,
    renderReservationRow,
    renderUserRow,
    renderStars,
    showToast,
    openModal,
    closeModal,
    renderStatCard,
    renderParkOccupancy,
  };

})();

window.View = View;
