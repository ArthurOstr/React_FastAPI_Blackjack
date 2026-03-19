import random


class Deck:
    def __init__(self):
        self.restart()

    # Taking 1 card from the deck
    def draw(self):
        card = random.choice(self.cards)
        self.cards.remove(card)
        return card

    # It seems I can look at cards in my deck
    def look_deck(self):
        return len(self.cards)

    # Shuffle the deck when needed
    def restart(self):
        suits = ["Clubs", "Diamonds", "Hearts", "Spades"]
        ranks = [
            "Jack",
            "Queen",
            "King",
            "Ace",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
        ]
        self.cards = [Card(rank, suit) for rank in ranks for suit in suits]

    def serialize(self):
        """
        Translating the RAM object into a string for the database
        Example output: "King_Hearts,2_Spades"
        """
        card_strings = []
        for card in self.cards:
            card_strings.append(f"{card.rank}_{card.suit}")

        return ",".join(card_strings)

    @classmethod
    def deserialize(cls, deck_string):
        """Builds a Deck from a database string"""
        # Way to build 52-card deck
        restored_deck = cls()

        restored_deck.cards = []

        if deck_string:
            saved_cards = deck_string.split(",")

            for item in saved_cards:
                rank, suit = item.split("_")
                restored_deck.cards.append(Card(rank, suit))

        return restored_deck


class Card:
    def __init__(self, rank, suit, visible=True):
        self.rank = rank
        self.suit = suit
        self.visible = visible

    # how does card looks like
    def show(self):
        if not self.visible:
            return "Hidden Card"
        else:
            return f"{self.rank} of {self.suit}"

    def flip(self):
        self.visible = not self.visible


class Hand:
    def __init__(self):
        self.cards = []
        self.stored_cards = []

    def __len__(self):
        return len(self.cards)

    # adding card to my hand
    def add_card(self, card):
        self.cards.append(card)

    def restart_hand(self):
        self.cards = []

    def remove_card(self):
        if not self.cards:
            print("Hand is empty, cannot remove card.")
            return

        removed_card = self.cards.pop(0)
        self.stored_cards.append(removed_card)

        print(f"Success removing {removed_card.show()} from the hand")

    def show_hand(self):
        return [card.show() for card in self.cards]

    def multiple_flip(self):
        for card in self.cards:
            if not card.visible:
                card.flip()

    def get_value(self):
        value = 0
        aces = 0
        for card in self.cards:
            if card.rank in ["Jack", "Queen", "King"]:
                value += 10
            elif card.rank == "Ace":
                aces += 1
                value += 11
            else:
                value += int(card.rank)
        while value > 21 and aces:
            value -= 10
            aces -= 1
        return value

    # It seems I can look at cards in my hand
    def look(self):
        return len(self.cards)

    def serialize(self):
        """Translates the Hand into a string for the db"""
        card_strings = []
        for card in self.cards:
            card_strings.append(f"{card.rank}_{card.suit}")
        return ",".join(card_strings)

    @classmethod
    def deserialize(cls, hand_stirng):
        """Builds a Hand object from a db string"""
        restored_hand = cls()

        if hand_stirng:
            saved_cards = hand_stirng.split(",")
            for item in saved_cards:
                if item == "Hidden":
                    continue
                rank, suit = item.split("_")
                # Rebuild the Card object and add it to the hand
                restored_hand.add_card(Card(rank, suit))

        return restored_hand


class Dealer:
    def __init__(self, deck):
        self.deck = deck
        self.hand = Hand()

    def deal_card(self, visible=True):
        card = self.deck.draw()
        card.visible = visible
        self.hand.add_card(card)

    def restart(self):
        self.hand = Hand()
        print("Dealer's hand is empty")

    def reveal(self):
        self.hand.multiple_flip()
        print("Dealer revealed his cards")


class Player:

    def __init__(self, balance=1000, win_count=0):
        self.hand = Hand()
        self.balance = balance
        self.current_bet = 0
        self.win_count = win_count

    def receive_card(self, card):
        self.hand.add_card(card)

    def place_bet(self, amount):
        if amount > self.balance:
            print("Bet exceeds available balance")
            return
        self.current_bet = amount
        self.balance -= amount

    def win_bet(self):
        self.balance += 2 * self.current_bet
        self.win_count += 1
        print(f"Player wins {self.current_bet * 2}!")

    def lose_bet(self):
        print(f"Player loses {self.current_bet}!")

    def push_bet(self):
        self.balance += self.current_bet
        print("It's a push! Bet returned to player.")

    # way to double bet
    def double_bet(self, deck):
        if self.balance >= self.current_bet:
            self.current_bet *= 2
            self.receive_card(deck)
            return True
        elif self.balance <= self.current_bet:
            return False
