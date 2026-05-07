// Quando o botão de login for clicado, enviar os dados para o servidor
const loginButton = document.getElementsByClassName('btn btn-primary')[0];

loginButton.addEventListener('click', async (e) => {
  e.preventDefault();
  
  // Apanhar os dados do formulário de login
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  try{
    const response = await fetch('http://localhost:3000/users/login',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email,password})
    })
    const data = await response.json();
    if(!response.ok){
        alert(data.error)
        return;
    }
    // Se o login correr bem o user será redrecionado para a página de perfil
    alert('Seja bem-vindo!')
    window.location.href = 'profile.html';
 
  }catch(err){
    console.error('Error:', err);
    alert('Erro ao ligar o servidor.');
  }
});