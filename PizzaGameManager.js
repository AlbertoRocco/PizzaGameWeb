function PizzaGameManager(configuration) {
    this.configuration = configuration;
    var that = this;

    /** Avvia il gioco */
    this.startGame = function () {
        // Reset del gioco
        this.resetGame();

        // Calcolo il numero random di pizze
        this.nrOfPizzasRemaining = Math.floor(Math.random() * (this.configuration.maxNrOfTotalPizzas - this.configuration.minNrOfTotalPizzas + 1)) + this.configuration.minNrOfTotalPizzas;

        // Attivo il turno del primo giocatore
        this.activePlayer = 1;

        // Indico che il gioco è in corso
        this.isGameRunning = true;
    };

    /** Reset del gioco */
    this.resetGame = function () {
        this.nrOfPizzasRemaining = 0;
        this.nrOfPizzasEatenByLastPlayer = 0;
        this.activePlayer = 0;
        this.isGameRunning = false;
    };

    /**
     * Permette al giocatore attivo di mangiare il numero di pizze specificato, 
     * dopodichè attiva il turno del giocatore successivo
     * @param {number} nrOfPizzasToEat Numero di pizze da mangiare
     */
    this.eatPizzas = function (nrOfPizzasToEat) {
        // Se viene chiamato questo metodo quando il gioco non è avviato significa che 
        // questa classe non viene utilizzata correttamente!
        if (!this.isGameRunning) {
            throw "Game is not running";
        }

        // Mi assicuro che il numero di pizze da mangiare sia entro il range consentito
        if (nrOfPizzasToEat < this.configuration.minNrOfPizzasToEat || nrOfPizzasToEat > this.configuration.maxNrOfPizzasToEat) {
            throw "Number of pizzas to eat must be greater than " + this.configuration.minNrOfPizzasToEat + " and lower than " + this.configuration.maxNrOfPizzasToEat;
        }

        // Mi assicuro che il numero di pizze da mangiare non sia maggiore del numero di pizze rimaste
        if (nrOfPizzasToEat > this.nrOfPizzasRemaining) {
            throw "Number of pizzas to eat must be lower or equal than the number of remaining pizzas";
        }

        // Il numero di pizze da mangiare non può essere uguale al numero di pizze
        // mangiato dall'ultimo giocatore che ha giocanto: se il numero di pizze mangiate
        // dall'ultimo giocatore è 0 significa che si è al primo turno oppure il giocatore
        // precedente ha dovuto saltare il turno!
        if (this.nrOfPizzasEatenByLastPlayer > 0 && nrOfPizzasToEat === this.nrOfPizzasEatenByLastPlayer) {
            throw "Number of pizzas to eat must be different from the number of pizzas eaten by last player";
        }

        // La prima pizza è quella avvelenata, per cui se il giocatore la mangia perde!
        if (this.nrOfPizzasRemaining - nrOfPizzasToEat === 0) {
            // Il giocatore ha perso
            this.resetGame();
            return {
                hasLost: true,
                hasNextPlayerValidChoices: true
            };
        }

        // Detraggo il numero di pizze mangiate
        this.nrOfPizzasRemaining -= nrOfPizzasToEat;

        // Attivo il turno del giocatore successivo
        this.activePlayer = getNextActivePlayer();

        // Salvo il riferimento al numero di pizze mangiato dal giocatore che ha appena giocato
        this.nrOfPizzasEatenByLastPlayer = nrOfPizzasToEat;

        // Verifico se il giocatore successivo non ha più mosse valide: in tal
        // caso è costretto a saltare il turno
        var hasNextPlayerValidChoices = hasPlayerValidChoices();
        if (!hasNextPlayerValidChoices) {
            this.activePlayer = getNextActivePlayer();
            this.nrOfPizzasEatenByLastPlayer = 0;
        }

        return {
            hasLost: false,
            hasNextPlayerValidChoices: hasNextPlayerValidChoices
        };
    };
    
    /** Restituisce il numero del prossimo giocatore a cui tocca giocare */
    function getNextActivePlayer() {
        // All'inizio del gioco è il turno del primo giocatore
        if (that.activePlayer <= 0)
            return 1;

        // Se ha appena giocato l'ultimo giocatore si riparte dal 1°
        if (that.activePlayer === that.configuration.numberOfPlayers)
            return 1;

        // è il turno del giocatore successivo
        return that.activePlayer + 1;
    };
    
    /** Indica se il giocatore attivo ha delle scelte possibili per poter mangiare le pizze */
    function hasPlayerValidChoices() {
        // Recupero il numero minimo di pizze che il può giocatore può mangiare
        var minNrOfPizzasToEat = that.nrOfPizzasEatenByLastPlayer != that.configuration.minNrOfPizzasToEat ? that.configuration.minNrOfPizzasToEat : that.configuration.minNrOfPizzasToEat + 1;

        // Se il numero minimo di pizze da poter mangiare è maggiore del numero 
        // di pizze rimanenti significa che il giocatore non ha più scelte disponibili
        var hasChoices = minNrOfPizzasToEat <= that.nrOfPizzasRemaining;
        return hasChoices;
    };
}
