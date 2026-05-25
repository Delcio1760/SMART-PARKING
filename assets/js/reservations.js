window.openReservationModal = openReservationModal;

async function openReservationModal(parkId){
  const park = parks.find(p => p.id === Number(parkId));
  if(!park) return;

  document.getElementById('reserve-park-id').value = park.id;
  document.getElementById('reserve-park-name').textContent = park.name;
  document.getElementById('reserve-date').value = new Date().toISOString().split('T')[0];

  // Limpar a seleção anterior
  document.getElementById('selected-spot-id').value = '';
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  // Apanhar os veiculos do utilizador
  const vehicleSelect = document.getElementById('reserve-vehicle');
  vehicleSelect.innerHTML= `<option value="">A carregar veiculos...</option>`;

  try{
    const vehicleRes = await fetch (`http://localhost:3000/users/me/vehicles`,{
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if(vehicleRes.ok){
      const vehicles = await vehicleRes.json();
      if(vehicles.length > 0){
        vehicleSelect.innerHTML = vehicles.map(v => `<option value="${v.id_vehicle || v.id}">${v.brand} ${v.model} (${v.license_plate})"</option>`).join('');

      }else{
        vehicleSelect.innerHTML = '<option value="none">Nenhum veículo registado</option>';
      }
    }
  }catch(err){
    console.error('Erro ao buscar veículos:', err)
    vehicleSelect.innerHTML = '<option value="none">Erro de ligação</option>';
  }

  // Carregar lugares deste parque especifico para o mapa visual 
  const spotsGrid = document.getElementById('spots-grid');
  spotsGrid.innerHTML = '<div style="grid-column: span 5; text-align: center;">A carregar mapa...</div>';

  try{
    const spotRes = await fetch(`http://localhost:3000/api/parks/${park.id}/spots`);
    if(spotRes.ok){
      const spots = await spotRes.json()
      spotsGrid.innerHTML = '' // Limpar o indicador de loading

      spots.forEach(spot => {
        const cell = document.createElement('div');
        cell.className = `spot-cell ${spot.status !== 'free' ? 'occupied' : ''}`;
        cell.textContent = spot.spot_number || spot.id_spot;
        cell.dataset.id = spot.id_spot || spot.id;

        // Evento do clique para selecionar o spot
        if(spot.status === 'free'){
          cell.addEventListener('click', () => {
            document.querySelectorAll('.spot-cell.selected').forEach(c=> c.classList.remove('selected')); //Desmarcar o lugar anteriormente selecionado
            // Marcar o novo
            cell.classList.add('selected');

            document.getElementById('selected-spot-id').value = cell.dataset.id;
          });

        }
        spotsGrid.appendChild(cell);
      });
    
    }else{
      spotsGrid.innerHTML = '<div style="grid-column: span 5; text-align: center; color: red;">Erro ao obter lugares.</div>';
    }
  }catch(err){
    console.error('Erro ao buscar lugares:', err);
    spotsGrid.innerHTML = '<div style="grid-column: span 5; text-align: center; color: red;">Erro de rede.</div>';
  }

  document.getElementById('modal-reserve').classList.add('active');

}

// Evento de submissão do formulário de reserva
document.getElementById('reserve-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const token = localStorage.getItem('token');
  const date = document.getElementById('reserve-date').value;
  const start_time = document.getElementById('reserve-start').value;
  const end_time = document.getElementById('reserve-end').value;
  const id_vehicle = document.getElementById('reserve-vehicle').value;
  const id_spot = document.getElementById('selected-spot-id').value; // Usar o ID do lugar selecionado manualmente!
  
  if (!date || !start_time || !end_time) {
    View.showToast('Por favor, preencha todos os campos', 'error');
    return;
  }

  if (!id_vehicle || id_vehicle === 'none' || id_vehicle === 'Nenhum veículo') {
    View.showToast('Por favor, selecione um veículo válido', 'error');
    return;
  }

  if (!id_spot) {
    View.showToast('Por favor, selecione um lugar livre no mapa', 'error');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id_spot,
        id_vehicle,
        date,
        start_time,
        end_time
      })
    });

    const data = await res.json();

    if (res.ok) {
      View.showToast('Reserva criada com sucesso!');
      document.getElementById('modal-reserve').classList.remove('active');
      
      //  Recarregar a página para atualizar o estado dos lugares
      setTimeout(() => { window.location.reload(); }, 1200);
    } else {
      View.showToast(data.error || 'Erro ao criar reserva', 'error');
    }
  } catch (err) {
    View.showToast('Erro ao criar reserva', 'error');
  }
});

// Fechar o modal ao clicar no botão de fechar            //Tinha esquecido de colocar algo para fechar o modal então decidi meter aqui embaixo
document.addEventListener('DOMContentLoaded', ()=> {
  
  document.getElementById('modal-reserve')?.addEventListener('click', (e)=>{
  if(e.target === document.getElementById('modal-reserve')){
    document.getElementById('modal-reserve').classList.remove('active');
  }
});
})

