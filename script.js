// Función principal que se ejecuta cuando el contenido del documento se ha cargado
document.addEventListener('DOMContentLoaded', () => {
    // Selección de elementos HTML relevantes por su ID
    const iniciarJuegoBtn = document.getElementById('iniciarJuegoBtn');
    const pelearBtn = document.getElementById('pelearBtn');
    const reiniciarJuegoBtn = document.getElementById('reiniciarJuegoBtn');
    const template = document.getElementById('template');
    const resultDiv = document.getElementById('result');
    const ataques = document.getElementById('atac');
  
    // Variables de estado del juego
    let personajes = [];
    let cartasJugador1 = [];
    let cartasJugador2 = [];
    let turnoJugador1 = true;
    let cartasSeleccionadas = [];
  
    // Inicialización de los botones y se ocultan dos de ellos al inicio
    pelearBtn.style.display = 'none';
    reiniciarJuegoBtn.style.display = 'none';
  
    // Event listeners para los botones
    pelearBtn.addEventListener('click', pelear);
    reiniciarJuegoBtn.addEventListener('click', reiniciarJuego);
  
    // Event listener para el botón de inicio del juego
    iniciarJuegoBtn.addEventListener('click', async () => {
        await cargarPersonajes();
        distribuirCartas();
  
        // Mostrar secciones de jugadores y habilitar botones relevantes
        document.getElementById('jugador1').style.display = 'flex';
        document.getElementById('jugador2').style.display = 'flex';
        pelearBtn.style.display = 'block';
        reiniciarJuegoBtn.style.display = 'block';
        iniciarJuegoBtn.style.display = 'none';
    });
  
    // Función asíncrona para cargar datos de personajes desde un archivo JSON
    async function cargarPersonajes() {
        const response = await fetch('characters.json');
        personajes = await response.json();
    }
  
    // Función para distribuir cartas de personajes a los jugadores
    function distribuirCartas() {
        // Limpieza del contenedor de resultados y selección de personajes disponibles
        resultDiv.innerHTML = '';
        const personajesParaDistribuir = [...personajes];
  
        // Iteración para cada jugador
        for (let jugador = 1; jugador <= 2; jugador++) {
            const cartasJugador = jugador === 1 ? cartasJugador1 : cartasJugador2;
            const cartasJugadorContainer = document.getElementById(`cartas-jugador${jugador}`);
  
            // Distribución de 5 cartas para cada jugador
            for (let i = 0; i < 5; i++) {
                if (personajesParaDistribuir.length > 0) {
                    // Selección aleatoria de un personaje
                    const randomIndex = Math.floor(Math.random() * personajesParaDistribuir.length);
                    const personaje = personajesParaDistribuir.splice(randomIndex, 1)[0];
  
                    // Clonación de la plantilla de carta y configuración de sus elementos
                    const card = template.content.cloneNode(true);
                    const cardElement = card.querySelector('.card');
                    cardElement.querySelector('#name').textContent = personaje.nom;
                    cardElement.querySelector('img').src = personaje.foto;
                    cardElement.querySelector('#stats').innerHTML = `Ataque: ${personaje.atac} <br> Defensa: ${personaje.defensa} <br> Velocidad: ${personaje.velocitat} <br> Salud: ${personaje.salut}`;
  
                    // Adjuntar evento de clic para seleccionar la carta
                    cardElement.addEventListener('click', () => seleccionarCarta(cardElement, personaje));
  
                    // Agregar la carta al contenedor del jugador
                    cartasJugadorContainer.appendChild(card);
                }
            }
        }
        // Mostrar contenedor de resultados
        resultDiv.classList.remove('hidden');
    }
  
    // Función para manejar la selección de cartas por parte de los jugadores
    function seleccionarCarta(marioCard, personaje) {
        if (cartasSeleccionadas.length < 2) {
            cartasSeleccionadas.push(personaje);
            marioCard.classList.add('selected');
            console.log("Personaje seleccionado:", personaje.nom);
  
            // Habilitar el botón de pelea cuando se han seleccionado dos cartas
            if (cartasSeleccionadas.length === 2) {
                pelearBtn.disabled = false;
            }
        }
    }

    function pelear() {
        // Inicialización y limpieza de elementos HTML para mostrar los ataques
        ataques.innerHTML = '';
        if (cartasSeleccionadas.length === 2) {
            // Obtención de las cartas seleccionadas para la pelea
            const carta1 = cartasSeleccionadas[0];
            const carta2 = cartasSeleccionadas[1];
    
            // Obtención de las velocidades de ambas cartas
            const velocidad1 = carta1.velocitat;
            const velocidad2 = carta2.velocitat;
    
            // Determinación del orden de ataque basado en la velocidad
            let atacante, defensor;
            if (velocidad1 > velocidad2) {
                atacante = carta1;
                defensor = carta2;
            } else {
                atacante = carta2;
                defensor = carta1;
            }
    
            // Obtención de estadísticas de atacante y defensor
            const statsAtacante = [atacante.atac, atacante.defensa, atacante.velocitat, atacante.salut];
            const statsDefensor = [defensor.atac, defensor.defensa, defensor.velocitat, defensor.salut];
    
            // Inicialización de puntos de salud para atacante y defensor
            let hpAtacante = statsAtacante[3];
            let hpDefensor = statsDefensor[3];
    
            // Mostrar información sobre la pelea en el contenedor de resultados
            resultDiv.innerHTML = `${atacante.nom} vs ${defensor.nom}<br>`;
    
            // Bucle para la pelea hasta que uno de los personajes quede sin salud
            while (hpAtacante > 0 && hpDefensor > 0) {
                // Turno de atacante
                const ataque = statsAtacante[0];
                const defensa = statsDefensor[1];

            // Lógica de daño basada en la comparación de ataque y defensa
            if (ataque > defensa) {
                const damage = ataque - defensa;
                hpDefensor -= damage;
                ataques.innerHTML += `🔴 ${atacante.nom} inflige ${damage} de daño a 🟢 ${defensor.nom}. ${defensor.nom} tiene ${hpDefensor} de salud.<br>`;
            } else {
                hpDefensor -= 10; // Reducción fija de 10 puntos de vida si
                ataques.innerHTML += `🔴 ${atacante.nom} inflige 10 de daño a 🟢 ${defensor.nom}. ${defensor.nom} tiene ${hpDefensor} de salud.<br>`;
            }

            // Cambiar el turno para el siguiente ataque
            [atacante, defensor] = [defensor, atacante];
            [hpAtacante, hpDefensor] = [hpDefensor, hpAtacante];
        }

        if (hpAtacante <= 0) {
            ocultarCartaDerrotada(atacante);
            resultDiv.innerHTML += `${defensor.nom} gana.<br> ${atacante.nom} ha sido derrotado.`;

            // Actualizar salud del ganador
            const ganador = defensor;
            ganador.salut = hpDefensor;
        } else if (hpDefensor <= 0) {
            ocultarCartaDerrotada(defensor);
            resultDiv.innerHTML += `${atacante.nom} gana.<br> ${defensor.nom} ha sido derrotado.`;

            // Actualizar salud del ganador
            const ganador = atacante;
            ganador.salut = hpAtacante;
        }

        ataques.classList.remove("hidden");
        ataques.classList.add("visible");

        resultDiv.classList.remove("hidden");
        resultDiv.classList.add("visible");

        // Mantener las cartas seleccionadas después de la pelea
        cartasSeleccionadas.forEach(carta => {
            const selectedCard = document.querySelector('.selected');
            if (selectedCard) {
                selectedCard.classList.remove('selected');
            }
        });

        cartasSeleccionadas = [];
        pelearBtn.disabled = true;

        // Actualizar la información de salud en el DOM
        actualizarSaludEnDOM();
    }
}


  function ocultarCartaDerrotada(carta) {
      const cartas = document.querySelectorAll('.card');
      cartas.forEach(card => {
          if (card.querySelector('#name').textContent === carta.nom) {
              card.style.display = 'none';
          }
      });
  }

  // Función para actualizar la información de salud en el DOM
  function actualizarSaludEnDOM() {
      personajes.forEach(personaje => {
          const cartas = document.querySelectorAll('.card');
          cartas.forEach(card => {
              if (card.querySelector('#name').textContent === personaje.nom) {
                  card.querySelector('#stats').innerHTML = `Ataque: ${personaje.atac} <br> Defensa: ${personaje.defensa} <br> Velocidad: ${personaje.velocitat} <br> Salud: ${personaje.salut}`;
              }
          });
      });
  }

  function reiniciarJuego() {
      location.reload(); // Recarga la página
  }


});
