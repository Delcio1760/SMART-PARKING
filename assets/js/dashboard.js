let parks = [];
    document.addEventListener('DOMContentLoaded', () => {

      const storedUser = localStorage.getItem('user');
      let user = null;
     

      try {
        user = storedUser ? JSON.parse(storedUser) : null;
      } catch (err) {
        console.error('Erro ao ler o user na localStorage:', err);
      }

      document.body.insertAdjacentHTML('afterbegin', View.renderNavbar(user));
      document.body.insertAdjacentHTML('beforeend', View.renderFooter());

      if (!user) {
        View.showPopup({
          title: 'Sessão expirada',
          message: 'Por favor, faça login novamente para continuar.',
          type: 'warning',
          redirect: 'login.html'
        });
        return;
      }

      const greetingEl = document.getElementById('user-greeting');

      if (greetingEl) {
        const firstName = user.name ? user.name.split(' ')[0] : 'Utilizador';
        greetingEl.textContent = `Olá, ${firstName}`;
      }

      // Mostrar botão "+ Adicionar parque" apenas para utilizador com role admin
      const addParkLink = document.getElementById('add-park-link');
      if (addParkLink) {
        if (user && user.role === 'admin') {
          addParkLink.style.display = 'inline';
        } else {
          addParkLink.style.display = 'none';
        }
      }

      let favoriteParks = [];
      let favoriteParkIds = new Set();

      async function loadFavorites() {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          const response = await fetch('http://localhost:3000/users/me/favorites', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            favoriteParks = await response.json();
            favoriteParkIds = new Set(favoriteParks.map(p => p.id));
          }
        } catch (err) {
          console.error('Erro ao carregar favoritos:', err);
        }
      }

      const renderCards = (containerId, list, isFavoriteList = false) => {
        const el = document.getElementById(containerId);
        if (!el) return;

        if (list.length === 0) {
          if (isFavoriteList) {
            el.innerHTML = `
              <div style="grid-column: 1 / -1; text-align: center; padding: var(--space-xl) var(--space-md); background: var(--color-surface-2); border-radius: var(--radius-lg); border: 1px dashed var(--color-border); color: var(--color-text-muted);">
                <span style="font-size: 1.8rem; display: block; margin-bottom: 8px;">☆</span>
                Ainda não tem parques favoritos. Clique na estrela de qualquer parque para o adicionar!
              </div>`;
          } else {
            el.innerHTML = `<p class="text-muted" style="grid-column: 1 / -1; text-align: center;">Nenhum parque encontrado.</p>`;
          }
          return;
        }

        el.innerHTML = list.map(p => View.renderParkCard(p, favoriteParkIds.has(p.id))).join('');
        setupCardClicks(el);
      };

      function setupCardClicks(container) {
        container.querySelectorAll('.btn-reserve').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();

            const id = Number(btn.dataset.id);
            const park = parks.find(p => p.id === id);

            if (park) {
              MapModule.focusPark(park);
            }

           window.openReservationModal(id);
          });
        });
      }

      // ── Filter Tags Logic ──────────────────────────────────────────────
      function updateFilterTags() {
        const tagsContainer = document.getElementById('filter-tags');
        if (!tagsContainer) return;
        
        const tags = [];
        
        const searchVal = document.getElementById('park-search')?.value.trim();
        if (searchVal) {
          tags.push({ label: `Pesquisa: "${searchVal}"`, filter: 'park-search' });
        }
        
        const cityVal = document.getElementById('city-filter')?.value;
        if (cityVal) {
          tags.push({ label: `Cidade: ${cityVal}`, filter: 'city-filter' });
        }
        
        const availVal = document.getElementById('availability-filter')?.value;
        if (availVal) {
          const availLabel = availVal === 'available' ? 'Com lugares' : 'Lotados';
          tags.push({ label: `Disponibilidade: ${availLabel}`, filter: 'availability-filter' });
        }
        
        const priceVal = parseFloat(document.getElementById('price-filter')?.value || 10);
        if (priceVal < 10) {
          tags.push({ label: `Preço máx: €${priceVal.toFixed(2)}/h`, filter: 'price-filter' });
        }
        
        tagsContainer.innerHTML = tags.map(t => `
          <div class="filter-tag" data-filter="${t.filter}">
            ${t.label}
            <span class="filter-tag-remove" data-filter="${t.filter}">✕</span>
          </div>
        `).join('');
        
        // Bind remove clicks
        tagsContainer.querySelectorAll('.filter-tag-remove').forEach(btn => {
          btn.addEventListener('click', () => {
            const filterId = btn.dataset.filter;
            const el = document.getElementById(filterId);
            if (el) {
              if (el.type === 'range') {
                el.value = el.max;
                document.getElementById('price-value').textContent = `€${parseFloat(el.max).toFixed(2)}`;
              } else if (el.tagName === 'SELECT') {
                el.value = '';
              } else {
                el.value = '';
              }
            }
            filterParks();
          });
        });
      }

      // ── Price Slider ──────────────────────────────────────────────────
      const priceSlider = document.getElementById('price-filter');
      const priceDisplay = document.getElementById('price-value');
      if (priceSlider && priceDisplay) {
        priceSlider.addEventListener('input', () => {
          priceDisplay.textContent = `€${parseFloat(priceSlider.value).toFixed(2)}`;
        });
      }

      async function loadParks() {
        try {
          await loadFavorites();

          const response = await fetch('http://localhost:3000/api/parks');

          if (!response.ok) {
            throw new Error('Erro HTTP: ' + response.status);
          }

          parks = await response.json();

          console.log('PARKS DA API:', parks);

          MapModule.init('park-map', parks, (parkId) => {
            window.openReservationModal(parkId);
          });

          // Init navbar search with park data
          View.initNavSearch(parks, (parkId) => {
            const park = parks.find(p => p.id === parkId);
            if (park) {
              MapModule.focusPark(park);
              window.openReservationModal(parkId);
            }
          });

          renderCards('favorite-parks', favoriteParks, true);
          renderCards('all-parks', parks);

          // ── Event Delegation para Estrela de Favoritos ──────────────────────
          const handleFavoriteToggle = async (e) => {
            const btn = e.target.closest('.btn-favorite');
            if (!btn) return;
            
            e.stopPropagation();
            e.preventDefault();

            const parkId = Number(btn.dataset.id);
            const token = localStorage.getItem('token');
            if (!token) return;

            const isCurrentlyFavorite = favoriteParkIds.has(parkId);

            try {
              if (isCurrentlyFavorite) {
                // Remover dos favoritos
                const res = await fetch(`http://localhost:3000/users/me/favorites/${parkId}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                  favoriteParkIds.delete(parkId);
                  favoriteParks = favoriteParks.filter(p => p.id !== parkId);
                  View.showToast('Parque removido dos favoritos', 'info');
                } else {
                  const errData = await res.json();
                  View.showToast(errData.error || 'Erro ao remover favorito', 'error');
                  return;
                }
              } else {
                // Adicionar aos favoritos
                const res = await fetch('http://localhost:3000/users/me/favorites', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ id_park: parkId })
                });
                if (res.ok) {
                  favoriteParkIds.add(parkId);
                  const parkObj = parks.find(p => p.id === parkId);
                  if (parkObj && !favoriteParks.some(p => p.id === parkId)) {
                    favoriteParks.push(parkObj);
                  }
                  View.showToast('Parque adicionado aos favoritos', 'success');
                } else {
                  const errData = await res.json();
                  View.showToast(errData.error || 'Erro ao adicionar favorito', 'error');
                  return;
                }
              }

              // Atualizar o estado visual de todos os botões correspondentes ao mesmo parque na página
              document.querySelectorAll(`.btn-favorite[data-id="${parkId}"]`).forEach(b => {
                const active = favoriteParkIds.has(parkId);
                if (active) {
                  b.classList.add('active');
                  b.textContent = '★';
                  b.title = 'Remover dos favoritos';
                } else {
                  b.classList.remove('active');
                  b.textContent = '☆';
                  b.title = 'Adicionar aos favoritos';
                }
              });

              // Re-renderizar a secção de favoritos
              renderCards('favorite-parks', favoriteParks, true);

            } catch (err) {
              console.error('Erro ao atualizar favorito:', err);
              View.showToast('Erro de ligação ao servidor', 'error');
            }
          };

          document.getElementById('favorite-parks')?.addEventListener('click', handleFavoriteToggle);
          document.getElementById('all-parks')?.addEventListener('click', handleFavoriteToggle);

          // Check if there was a selected park redirect from another page
          const redirectParkId = localStorage.getItem('selectedParkId');
          if (redirectParkId) {
            localStorage.removeItem('selectedParkId');
            const park = parks.find(p => p.id === Number(redirectParkId));
            if (park) {
              setTimeout(() => {
                MapModule.focusPark(park);
                window.openReservationModal(redirectParkId);
              }, 500);
            }
          }

        } catch (err) {
          console.error('Erro ao carregar parques:', err);
          View.showToast('Erro ao carregar parques', 'error');
        }
      }

      function filterParks() {
        const searchValue = document.getElementById('park-search')?.value.toLowerCase() || '';
        const cityValue = document.getElementById('city-filter')?.value || '';
        const availValue = document.getElementById('availability-filter')?.value || '';
        const priceValue = parseFloat(document.getElementById('price-filter')?.value || 10);

        const filtered = parks.filter(p => {
          const matchesSearch =
            p.name.toLowerCase().includes(searchValue) ||
            p.city.toLowerCase().includes(searchValue) ||
            p.address.toLowerCase().includes(searchValue);

          const matchesCity = cityValue === '' || p.city === cityValue;

          const matchesAvailability = 
            availValue === '' ||
            (availValue === 'available' && p.available > 0) ||
            (availValue === 'full' && p.available === 0);

          const matchesPrice = !p.price_per_hour || p.price_per_hour <= priceValue;

          return matchesSearch && matchesCity && matchesAvailability && matchesPrice;
        });

        MapModule.updateParks(filtered);
        renderCards('all-parks', filtered);
        
        // Update results count
        const countEl = document.getElementById('filter-results-count');
        if (countEl) {
          const hasFilters = searchValue || cityValue || availValue || priceValue < 10;
          countEl.innerHTML = hasFilters 
            ? `Mostrando <strong>${filtered.length}</strong> de <strong>${parks.length}</strong> parques`
            : '';
        }
        
        // Update filter tags
        updateFilterTags();
      }

      document.getElementById('park-search')?.addEventListener('input', filterParks);
      document.getElementById('city-filter')?.addEventListener('change', filterParks);
      document.getElementById('availability-filter')?.addEventListener('change', filterParks);
      document.getElementById('price-filter')?.addEventListener('input', filterParks);
      document.getElementById('btn-apply-filters')?.addEventListener('click', filterParks);
      
      // Clear all filters
      document.getElementById('btn-clear-filters')?.addEventListener('click', () => {
        document.getElementById('park-search').value = '';
        document.getElementById('city-filter').value = '';
        document.getElementById('availability-filter').value = '';
        document.getElementById('price-filter').value = '10';
        document.getElementById('price-value').textContent = '€10.00';
        filterParks();
      });

      loadParks();
      

    });