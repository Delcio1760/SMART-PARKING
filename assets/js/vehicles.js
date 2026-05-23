    function renderVehicleCard(V){
      const card = document.createElement('div');
      card.className = 'vehicle-card';
      card.innerHTML = `
      <div></div>
      <div>${V.brand} ${V.model}</div>
      <div>${V.license_plate}</div>
      <div>${V.color} . ${V.vehicle_type}</div>`;
      return card;
    }

    async function loadVehicles(){
      const grid = document.getElementById('vehicles-list');
      grid.innerHTML = ''
      const res = await fetch('http://localhost:3000/users/me/vehicles',{
        headers:{'Authorization' : `Bearer ${token}`}
      });
      const vehicles = await res.json();

      if(vehicles.length === 0){
        grid.textContent = 'Nenhum veículo registado.';
        return;
      }
      vehicles.forEach(V => {grid.appendChild(renderVehicleCard(V))});
    }

// Submeter novo veículo
    document.getElementById('vehicle-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById('vehicle-msg');
    msgEl.textContent = '';

    const body = {
        license_plate: document.getElementById('v-plate').value.trim(),
        brand:         document.getElementById('v-brand').value.trim(),
        model:         document.getElementById('v-model').value.trim(),
        color:         document.getElementById('v-color').value.trim() || 'Não definido',
        vehicle_type:  document.getElementById('v-type').value
    };

    try {
        const res = await fetch('http://localhost:3000/users/me/vehicles', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
        });

        const data = await res.json();

        if (res.ok) {
        modal.classList.remove('open');
        document.getElementById('vehicle-form').reset();
        loadVehicles();
        } else {
        msgEl.style.color = 'var(--color-danger)';
        msgEl.textContent = data.error || 'Erro ao guardar.';
        }
    } catch (err) {
        msgEl.style.color = 'var(--color-danger)';
        msgEl.textContent = 'Erro ao ligar ao servidor.';
    }
    });