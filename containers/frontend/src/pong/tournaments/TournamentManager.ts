import { TournamentBracket, TournamentParticipant, TournamentMatch } from './TournamentBracket';
import { PongGame } from '../engine/Game';
import { GameConfig } from '../utils/GameConfig';
import { gameManager } from '../../utils/GameManager';

export class TournamentManager {
    private bracket: TournamentBracket;
    private currentGame: PongGame | null = null;
    private onMatchComplete: ((match: TournamentMatch) => void) | null = null;
    private onTournamentComplete: ((champion: TournamentParticipant) => void) | null = null;
    private menu: any; // Référence au menu pour accéder à app et language

    constructor(participants: Array<{name: string, isAI: boolean}>, menu: any) {
        this.bracket = new TournamentBracket(participants);
        this.menu = menu;
    }

    // Callbacks pour l'interface utilisateur
    setOnMatchComplete(callback: (match: TournamentMatch) => void) {
        this.onMatchComplete = callback;
    }

    setOnTournamentComplete(callback: (champion: TournamentParticipant) => void) {
        this.onTournamentComplete = callback;
    }

    // Démarre le prochain match disponible
    async startNextMatch(): Promise<boolean> {
        const nextMatch = this.bracket.getCurrentMatch();
        if (!nextMatch) {
            console.log("Aucun match disponible");
            return false;
        }

        console.log(`Démarrage du match: ${nextMatch.participant1?.name} vs ${nextMatch.participant2?.name}`);
        
        // Configuration selon votre format GameConfig existant
        const gameConfig: GameConfig = {
            mode: 'local',
            variant: 'tournament',
            classicMode: this.menu.config.classicMode || false,
            filters: this.menu.config.filters || true,
            
            players: [
                {
                    name: nextMatch.participant1?.name || "Player 1",
                    type: nextMatch.participant1?.isAI ? 'ai' : 'human',
                    side: 'left'
                },
                {
                    name: nextMatch.participant2?.name || "Player 2",
                    type: nextMatch.participant2?.isAI ? 'ai' : 'human',
                    side: 'right'
                }
            ],
            
            tournament: {
                matchId: nextMatch.id,
                round: nextMatch.round,
                roundName: nextMatch.round === 1 ? "Demi-finale" : "Finale"
            }
        };

        // CORRIGÉ : Utiliser la même méthode que dans MenuButtonSystem.handleReadyClick()
        console.log('Preparing to start tournament match...');
        
        // Clean up menu first
        this.menu.cleanup();
        
        // Deregister menu from GameManager
        gameManager.destroyGame(this.menu.app.view.id);

        console.log('Creating new tournament game with config:', gameConfig);
        
        // Créer le jeu avec les bons paramètres (app, config, language)
        this.currentGame = new PongGame(this.menu.app, gameConfig, this.menu.language);
        
        // Register new game with GameManager
        gameManager.registerGame(this.menu.app.view.id, this.currentGame, undefined, this.menu.app);
        
        // Initialiser le jeu
        this.currentGame.init();
        
        return true;
    }

    // Gère la fin d'un match
    private handleMatchEnd(match: TournamentMatch, result: any) {
        if (!match.participant1 || !match.participant2) return;

        // Déterminer le gagnant basé sur le score
        const player1Score = result.player1Score || 0;
        const player2Score = result.player2Score || 0;
        const winnerId = player1Score > player2Score ? match.participant1.id : match.participant2.id;

        // Enregistrer le résultat dans le bracket
        const success = this.bracket.completeMatch(match.id, winnerId, {
            player1: player1Score,
            player2: player2Score
        });

        if (success) {
            console.log(`Match terminé: ${match.participant1.name} ${player1Score}-${player2Score} ${match.participant2.name}`);
            
            // Callback pour l'interface
            if (this.onMatchComplete) {
                this.onMatchComplete(match);
            }

            // Vérifier si le tournoi est terminé
            if (this.bracket.isCompleted()) {
                const champion = this.bracket.getChampion();
                if (champion && this.onTournamentComplete) {
                    this.onTournamentComplete(champion);
                }
            }
        }

        this.currentGame = null;
    }

    // Méthodes pour récupérer l'état du tournoi
    getBracket(): TournamentBracket {
        return this.bracket;
    }

    getCurrentMatch(): TournamentMatch | null {
        return this.bracket.getCurrentMatch();
    }

    isMatchInProgress(): boolean {
        return this.currentGame !== null;
    }

    getTournamentStatus(): string {
        if (this.bracket.isCompleted()) {
            const champion = this.bracket.getChampion();
            return `Tournoi terminé! Champion: ${champion?.name}`;
        }
        
        const currentMatch = this.getCurrentMatch();
        if (currentMatch) {
            const roundName = currentMatch.round === 1 ? "Demi-finale" : "Finale";
            return `${roundName}: ${currentMatch.participant1?.name} vs ${currentMatch.participant2?.name}`;
        }
        
        return "En attente du prochain match";
    }

    // Pour débugger - affiche l'état complet
    printTournamentState() {
        console.log("=== État du Tournoi ===");
        const matches = this.bracket.getMatches();
        matches.forEach(match => {
            const status = match.isCompleted ? 
                `✓ ${match.winner?.name} gagne (${match.score?.player1}-${match.score?.player2})` : 
                "En attente";
            console.log(`${match.id}: ${match.participant1?.name || "TBD"} vs ${match.participant2?.name || "TBD"} - ${status}`);
        });
    }
}