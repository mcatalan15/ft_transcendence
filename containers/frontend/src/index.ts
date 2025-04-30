import * as GoogleSignInModule from "./auth/googleSignIn.js";

GoogleSignInModule.initializeGoogleSignIn((credential: string) => {
      
    fetch("/api/auth/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ credential })
  })
    .then(res => res.json())
    .then(data => {
    	console.log("Results of Google Sign-In:", data);

    })
    .catch(err => {
      console.error("Error signing in with Google:", err);
    });
});
	
const startGameBtn = document.getElementById("start-game") as HTMLButtonElement;

startGameBtn?.addEventListener("click", async () => {
  try {
    console.log("Loading Pong...");
    // Importation dynamique du fichier de jeu (pong.js)
    await import("./pong/pong.js");

	startGameBtn.style.display = "none";
	
    // Ici, vous pouvez ajouter toute logique supplémentaire après l'import du jeu
  } catch (error) {
    console.error("Error while importing the game:", error);
  }
});