import { Menu } from '../menu/Menu';
import { TournamentManager } from './TournamentManager';
import { TournamentBracket, TournamentParticipant } from './TournamentBracket';
import { GameConfig } from '../utils/GameConfig';

export class TournamentController {
    private menu: Menu;
    private tournamentManager: TournamentManager | null = null;
    private isActive: boolean = false;

    constructor(menu: Menu) {
        this.menu = menu;
    }

    // Démarre un nouveau tournoi depuis le menu
    startTournament(participants: Array<{name: string, isAI: boolean}>): boolean {
        if (participants.length !== 4) {
            console.error("Tournament requires exactly 4 participants");
            return false;
        }

        // Créer le gestionnaire de tournoi
        this.tournamentManager = new TournamentManager(participants, this.menu);
        this.isActive = true;

        // Configurer les callbacks
        this.tournamentManager.setOnMatchComplete((match) => {
            this.onMatchComplete(match);
        });

        this.tournamentManager.setOnTournamentComplete((champion) => {
            this.onTournamentComplete(champion);
        });

        // SUPPRIMÉ : updateTournamentOverlay() qui causait le crash
        // this.updateTournamentOverlay();

        // Configurer le mode tournoi dans le menu
        this.menu.config.variant = 'tournament';
        
        console.log("Tournoi créé avec succès !");
        console.log("Premier match:", this.tournamentManager.getCurrentMatch());
        return true;
    }

    // Lance le prochain match
    async startNextMatch(): Promise<boolean> {
        if (!this.tournamentManager || !this.isActive) {
            console.error("No active tournament");
            return false;
        }

        const currentMatch = this.tournamentManager.getCurrentMatch();
        if (!currentMatch) {
            console.log("No more matches available");
            return false;
        }

        console.log(`🎮 Lancement du match: ${currentMatch.participant1?.name} vs ${currentMatch.participant2?.name}`);

        // Fermer l'overlay de tournoi - AVEC VÉRIFICATION
        try {
            if (this.menu.tournamentOverlay && this.menu.tournamentOverlay.isDisplayed) {
                this.menu.tournamentOverlay.hide();
            }
        } catch (error) {
            console.warn("Erreur lors de la fermeture de l'overlay:", error);
        }

        // Démarrer le match via le TournamentManager
        return await this.tournamentManager.startNextMatch();
    }

    // Met à jour l'overlay de tournoi avec les données actuelles - SÉCURISÉ
    private updateTournamentOverlay(): void {
        if (!this.tournamentManager) return;
        
        // Vérifier que l'overlay existe et est prêt
        if (!this.menu.tournamentOverlay) {
            console.warn("TournamentOverlay not ready yet");
            return;
        }

        try {
            const bracket = this.tournamentManager.getBracket();
            const matches = bracket.getMatches();
            const participants = bracket.getParticipants();

            console.log("Mise à jour de l'overlay avec:", { matches, participants });
            
            // Mettre à jour seulement si les éléments existent
            if (this.menu.tournamentOverlay.bracket) {
                this.updateBracketDisplay(matches, participants);
            }

            if (this.menu.tournamentOverlay.nextMatchDisplay) {
                this.updateNextMatchDisplay();
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'overlay:", error);
        }
    }

    // Met à jour l'affichage du bracket - SÉCURISÉ
    private updateBracketDisplay(matches: any[], participants: TournamentParticipant[]): void {
        try {
            const bracket = this.menu.tournamentOverlay.bracket;
            if (!bracket || !bracket.nameCells) return;
            
            console.log("Mise à jour du bracket...");
            // Logique de mise à jour ici si nécessaire
        } catch (error) {
            console.error("Erreur lors de la mise à jour du bracket:", error);
        }
    }

    // Met à jour l'affichage du prochain match - SÉCURISÉ
    private updateNextMatchDisplay(): void {
        try {
            const currentMatch = this.tournamentManager?.getCurrentMatch();
            if (!currentMatch) return;

            const display = this.menu.tournamentOverlay.nextMatchDisplay;
            if (!display) return;
            
            console.log("Mise à jour de l'affichage du prochain match...");
            // Logique de mise à jour ici si nécessaire
        } catch (error) {
            console.error("Erreur lors de la mise à jour du prochain match:", error);
        }
    }

    // Callback quand un match se termine
    private onMatchComplete(match: any): void {
        console.log(`Match terminé: ${match.winner?.name} a gagné !`);
        
        // Mettre à jour l'affichage de manière sécurisée
        try {
            this.updateTournamentOverlay();
            
            // Revenir à l'overlay de tournoi
            if (this.menu.tournamentOverlay && !this.menu.tournamentOverlay.isDisplayed) {
                this.menu.tournamentOverlay.show();
            }
        } catch (error) {
            console.error("Erreur dans onMatchComplete:", error);
        }
    }

    // Callback quand le tournoi se termine
    private onTournamentComplete(champion: TournamentParticipant): void {
        console.log(`🏆 Tournoi terminé ! Champion: ${champion.name}`);
        
        this.isActive = false;
        
        // Afficher le résultat final
        this.showTournamentResults(champion);
    }

    // Affiche les résultats finaux
    private showTournamentResults(champion: TournamentParticipant): void {
        console.log(`Félicitations à ${champion.name} !`);
        
        try {
            // Revenir à l'overlay de tournoi avec les résultats
            this.updateTournamentOverlay();
            if (this.menu.tournamentOverlay && !this.menu.tournamentOverlay.isDisplayed) {
                this.menu.tournamentOverlay.show();
            }
        } catch (error) {
            console.error("Erreur lors de l'affichage des résultats:", error);
        }
    }

    // Accesseurs
    getTournamentManager(): TournamentManager | null {
        return this.tournamentManager;
    }

    isActiveTournament(): boolean {
        return this.isActive;
    }

    getTournamentStatus(): string {
        return this.tournamentManager?.getTournamentStatus() || "Aucun tournoi actif";
    }
}