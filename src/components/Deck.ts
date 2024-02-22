import {CardRank, CardSuit} from "./enums";

class Deck {
    deck: Array<{ rank: CardRank, suit: CardSuit }>;

    constructor(numDecks = 6) {
        this.deck = [];
        this.initializeDeck(numDecks);
    }

    initializeDeck(numDecks: number) {
        for (let i = 0; i < numDecks; i++) {
            Object.values(CardSuit).forEach(suit => {
                Object.values(CardRank).filter(rank => !isNaN(Number(rank))).forEach(rank => {
                    this.deck.push({ rank: Number(rank), suit });
                });
            });
        }
    }

    shuffle() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealCard() {
        return this.deck.pop();
    }
}

export default Deck;