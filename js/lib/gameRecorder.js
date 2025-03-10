/**
 * Game Recorder - Hooks into game events to record decisions
 */
(function(){
	
	// Keep track of current data
	var currentMove = null;
	var currentRound = 0;
	
	// Subscribe to game events
	subscribe("iterated/cooperate", function(){
		currentMove = PD.COOPERATE;
	});

	subscribe("iterated/cheat", function(){
		currentMove = PD.CHEAT;
	});

	subscribe("iterated/TRIP", function(){
		currentMove = "TRIP";
	});
	
	subscribe("iterated/round/end", function(payoffs){
		// Only record if DataRecorder exists and we have a current move
		if(window.DataRecorder && currentMove) {
			var displayMove = currentMove;
			// For display purposes, show TRIP special case
			if(displayMove === "TRIP") displayMove = PD.CHEAT + " (TRIP)";
			
			// Record the data
			DataRecorder.recordRound(
				displayMove, 
				// We don't have direct access to opponent move, but can infer from payoffs
				getOpponentMoveFromPayoffs(currentMove, payoffs),
				payoffs
			);
			
			// Reset for next round
			currentMove = null;
			currentRound++;
		}
	});
	
	// Helper to infer opponent move based on payoffs and player move
	function getOpponentMoveFromPayoffs(playerMove, payoffs) {
		// Standardize player move
		if(playerMove === "TRIP") playerMove = PD.CHEAT;
		
		// Simple lookup based on game theory payoff matrix
		if(playerMove === PD.COOPERATE) {
			if(payoffs[0] === PD.PAYOFFS.R) return PD.COOPERATE; // Reward (both cooperate)
			if(payoffs[0] === PD.PAYOFFS.S) return PD.CHEAT;     // Sucker (player cooperates, opponent cheats)
		} else { // Player cheated
			if(payoffs[0] === PD.PAYOFFS.T) return PD.COOPERATE; // Temptation (player cheats, opponent cooperates)
			if(payoffs[0] === PD.PAYOFFS.P) return PD.CHEAT;     // Punishment (both cheat)
		}
		return "unknown"; // Fallback
	}
	
})();