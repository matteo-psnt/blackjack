import exp from "node:constants";

export enum CardRank {
    Ace = 1,
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
    Six = 6,
    Seven = 7,
    Eight = 8,
    Nine = 9,
    Ten = 10,
    Jack = 11,
    Queen = 12,
    King = 13
}

export enum CardSuit {
    Clubs = "CLUB",
    Diamonds = "DIAMOND",
    Hearts = "HEART",
    Spades = "SPADE"
}

export enum GameState {
    Betting,
    Dealing,
    Animation,
    DealerCheck,
    Insurance,
    Play,
    DealerPlay,
    DealerDeal,
    Results,
    WrapUp
}

export enum PlayState {
    Blackjack,
    CanSplit,
    Split,
    Normal,
    Bust,
    Post,
    None
}

export enum HandState {
    Bust,
    Blackjack,
    Win,
    Push,
    Lose,
    None
}

export enum CardAnimation {
    SlideUp = 'slideUp',
    SlideDown = 'slideDown',
    SlideRight = 'slideRight',
    SlideLeft = 'slideLeft',
    SlideDownRight = 'slideDownRight',
    DoubleDown = 'doubleDown'
}