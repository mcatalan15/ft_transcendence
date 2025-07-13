export interface TournamentParticipant {
    id: string;
    name: string;
    isAI: boolean;
    isEliminated: boolean;
}

export interface TournamentMatch {
    id: string;
    participant1: TournamentParticipant | null;
    participant2: TournamentParticipant | null;
    winner: TournamentParticipant | null;
    isCompleted: boolean;
    round: number; // 1 = demi-finale, 2 = finale
    score?: { player1: number; player2: number };
}

export class TournamentBracket {
    private participants: TournamentParticipant[] = [];
    private matches: TournamentMatch[] = [];
    
    constructor(participantNames: Array<{name: string, isAI: boolean}>) {
        if (participantNames.length !== 4) {
            throw new Error("Tournament must have exactly 4 participants");
        }
        
        this.initializeParticipants(participantNames);
        this.generateMatches();
    }
    
    private initializeParticipants(participantNames: Array<{name: string, isAI: boolean}>) {
        this.participants = participantNames.map((p, index) => ({
            id: `participant_${index}`,
            name: p.name,
            isAI: p.isAI,
            isEliminated: false
        }));
    }
    
    private generateMatches() {
        this.matches.push({
            id: 'semifinal_1',
            participant1: this.participants[0],
            participant2: this.participants[1],
            winner: null,
            isCompleted: false,
            round: 1
        });
        
        this.matches.push({
            id: 'semifinal_2',
            participant1: this.participants[2],
            participant2: this.participants[3],
            winner: null,
            isCompleted: false,
            round: 1
        });
        
        this.matches.push({
            id: 'final',
            participant1: null, // Winner of semifinal_1
            participant2: null, // Winner of semifinal_2
            winner: null,
            isCompleted: false,
            round: 2
        });
    }
    
    getCurrentMatch(): TournamentMatch | null {
        return this.matches.find(match => !match.isCompleted && match.participant1 && match.participant2) || null;
    }
    
    completeMatch(matchId: string, winnerId: string, score: {player1: number, player2: number}) {
        const match = this.matches.find(m => m.id === matchId);
        if (!match || match.isCompleted) return false;
        
        const winner = match.participant1?.id === winnerId ? match.participant1 : match.participant2;
        const loser = match.participant1?.id === winnerId ? match.participant2 : match.participant1;
        
        if (!winner || !loser) return false;
        
        match.winner = winner;
        match.isCompleted = true;
        match.score = score;
        loser.isEliminated = true;
        
        if (match.round === 1) {
            const final = this.matches.find(m => m.id === 'final');
            if (final) {
                if (!final.participant1) {
                    final.participant1 = winner;
                } else {
                    final.participant2 = winner;
                }
            }
        }
        
        return true;
    }
    
    getMatches(): TournamentMatch[] {
        return this.matches;
    }
    
    getParticipants(): TournamentParticipant[] {
        return this.participants;
    }
    
    isCompleted(): boolean {
        return this.matches.every(match => match.isCompleted);
    }
    
    getChampion(): TournamentParticipant | null {
        const final = this.matches.find(m => m.id === 'final');
        return final?.winner || null;
    }
}
