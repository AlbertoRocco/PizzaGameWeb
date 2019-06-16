/** Oggetto PizzaGameManager per la gestione del gioco */
var manager;

/** Gestione dell'evento generato al caricamento completato del DOM */
$(document).ready(function () {
    initGame();
});

// Gestione dell'evento click del pulsante per l'inizio del gioco
$("#btnStartGame").click(function () {
    startGame();
});

/** Gestione dell'evento click dei pulsanti per mangiare le pizze */
$(".btnEat").click(function () {
    var playerId = $(this).closest(".playerId").prop("id"); 
    eatPizzas(playerId);
});

/** Gestione dell'evento keypress dei controlli per l'inserimento del numero di pizze da mangiare */
$(".slctNrOfPizzasToEat").keypress(function (e) {
    if (e.which === 13) {
        var playerId = $(this).closest(".playerId").prop("id");
        eatPizzas(playerId);
    }
    // Blocco l'inserimento del carattere
    return false;
});

/** Effettua le operazioni di inizializzazione */
function initGame() {
    // Istanzio la classe di gestione del gioco, con la relativa configurazione
    var configuration = {
        numberOfPlayers: 2,
        minNrOfTotalPizzas: 10,
        maxNrOfTotalPizzas: 20,
        minNrOfPizzasToEat: 1,
        maxNrOfPizzasToEat: 3
    };
    manager = new PizzaGameManager(configuration);

    // Imposto il range del numero di pizze selezionabile
    $(".slctNrOfPizzasToEat").attr("min", configuration.minNrOfPizzasToEat);
    $(".slctNrOfPizzasToEat").attr("max", configuration.maxNrOfPizzasToEat);

    // Reset del gioco
    resetGame();
}

/** Effettua il reset del gioco */
function resetGame() {
    // Reset del gioco
    manager.resetGame();

    // Rimuovo il numero di pizze rimanenti
    $("#lblPizzasNr").html("Numero pizze: ");

    // Disabilito i giocatori
    setActivePlayer("player1", false);
    setActivePlayer("player2", false);

    // Metto il focus al pulsante per l'inizio del gioco
    $("#btnStartGame").focus();
}

/** Avvia il gioco */
function startGame() {
    // Se il gioco è già in corso chiedo all'utente se vuole ricominciarlo
    if (manager.isGameRunning) {
        if (!confirm("Il gioco non \u00E8 stato finito. Vuoi ricominciare ?")) {
            return;
        } 
    }

    // Reset del gioco
    resetGame();

    // Avvio il gioco
    manager.startGame();

    // Visualizzo il numero di pizze rimanenti
    showNumberOfPizzas();

    // Attivo il turno del 1° giocatore
    setActivePlayer("player1", true);
}

/**
 * Metodo per permettere al giocatore con l'id specificato di mangiare le pizze
 * @param {string} playerId Id del giocatore ("#player1" o "#player2")
 */
function eatPizzas(playerId) {
    if (!playerId.startsWith("#")) {
        playerId = "#" + playerId;
    }

    // Recupero il numero di pizze da mangiare selezionato dall'utente
    var nrOfPizzasToEat = $(playerId + " .slctNrOfPizzasToEat").val();

    // Mi assicuro che il numero di pizze scelto non sia superiore al numero di pizze rimasto
    if (nrOfPizzasToEat > manager.nrOfPizzasRemaining) {
        alert("Il numero di pizze da mangiare non pu\u00F2 essere superiore del numero di pizze rimaste");
        return;
    }

    // Mi assicuro che il numero di pizze scelto non sia uguale a quello scelto dall'ultimo giocatore
    if (nrOfPizzasToEat === manager.nrOfPizzasEatenByLastPlayer) {
        alert("Non \u00E8 possibile ripetere la scelta fatta in precedenza dall'avversario");
        return;
    }

    // Mangio le pizze e procedo con il turno del prossimo giocatore
    var result = manager.eatPizzas(nrOfPizzasToEat);

    // Se il giocatore ha perso il gioco è finito
    if (result.hasLost) {
        alert('Il giocatore "' + $(playerId + " .playerName").html() + '" ha perso!');
        resetGame();
        return;
    }

    // Visualizzo il numero di pizze rimanenti
    showNumberOfPizzas();

    // Disabilito il giocatore che ha appena giocato
    setActivePlayer(playerId, false);

    // Attivo il prossimo giocatore a cui tocca mangiare la pizza
    setActivePlayer("player" + manager.activePlayer, true);
    
    // Se il giocatore attuale non ha mosse valide è costretto a passare il turno:
    // mostro un messaggio all'utente
    if (!result.hasNextPlayerValidChoices) {
        alert("Il prossimo giocatore non ha scelte disponibili, \u00E8 costretto a passare il turno!");
    }
}

/** Visualizza il numero di pizze rimanenti */
function showNumberOfPizzas() {
    $("#lblPizzasNr").html("Numero pizze: " + manager.nrOfPizzasRemaining);
}

/**
 * Attiva o disattiva il giocatore con l'id specificato
 * @param {string} playerId Id del giocatore ("#player1" o "#player2")
 * @param {boolean} isActive Indica se attivare o disattivare il giocatore
 */
function setActivePlayer(playerId, isActive) {
    if (!playerId.startsWith("#")) {
        playerId = "#" + playerId;
    }

    if (isActive) {
        // Imposto il colore di sfondo verde per indicare che il giocatore è attivo
        $(playerId + " .player").css("background-color", "rgb(192, 255, 192)");
        $(playerId + " .playerName").css("background-color", "rgb(0, 192, 0)");

        // Abilito il pulsante per mangiare le pizze
        $(playerId + " .btnEat").attr("disabled", false);

        // Abilito il controllo per l'inserimento del numero di pizze da mangiare, metto il focus e valore 1!
        $(playerId + " .slctNrOfPizzasToEat").attr("disabled", false);
        $(playerId + " .slctNrOfPizzasToEat").focus();
        $(playerId + " .slctNrOfPizzasToEat").val(1);
    }
    else {
        // Imposto il colore di sfondo grigio per indicare che il giocatore non è attivo
        $(playerId + " .player").css("background-color", "silver");
        $(playerId + " .playerName").css("background-color", "gray");

        // Disabilito il pulsante per mangiare le pizze
        $(playerId + " .btnEat").attr("disabled", true);

        // Disabilito il controllo per l'inserimento del numero di pizze da mangiare
        $(playerId + " .slctNrOfPizzasToEat").attr("disabled", true);
    }
}
