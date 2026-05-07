const form = document.getElementById('register-form');

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // Apanhar os dados postos no formulário
    const name = document.getElementById('reg-name').value.trim();
   const email = document.getElementById('reg-email').value.trim();
   const plate = document.getElementById('reg-plate').value.trim();
   const contact = document.getElementById('reg-contact').value.trim();
   const password = document.getElementById('reg-password').value.trim();
   const confirm = document.getElementById('reg-confirm').value.trim();

   //validar as passwords
    if (password !== confirm) {
         alert('Passwords do not match', 'error');
         return;
    }

    try{

        // Pedido A API para registar o utilizador
        const response = await fetch('http://locahost:3000/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name, email, password, contact, plate})
        });
        const data = await response.json();

        if(!response.ok){
            alert(data.error)
            return;
        }

        alert('Registro realizado com sucesso!')
        window.location.href = 'login.html';

    }catch(err){
        console.error('Error:', err);
        alert('Erro ao ligar o servidor.');
    }

})