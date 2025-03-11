/**
 * Game Recorder - Hooks into game events to record decisions
 * Only records data from the iterated/repeated game
 */
(function(){
	
	// Reference to the active iterated game
	var iteratedGame = null;
	
	// Current move and state tracking
	var currentMove = null;
	var currentRound = 0;
	var isIteratedGame = false;
	var currentSlideId = null;
	
	// Set up direct recording by monkey-patching the Iterated class
	var originalIterated = window.Iterated;
	if (originalIterated) {
		window.Iterated = function(config) {
			// Call the original constructor
			var instance = new originalIterated(config);
			
			// Store reference to this instance
			iteratedGame = instance;
			console.log("Created new Iterated instance:", instance.id);
			
			// Override playOneRound to record data
			var originalPlayOneRound = instance.playOneRound;
			instance.playOneRound = function(yourMove) {
				// Record the move
				currentMove = yourMove;
				
				// Call original method to get real game action
				return originalPlayOneRound.call(instance, yourMove);
			};
			
			// Return modified instance
			return instance;
		};
	}
	
	// Check if we're in the iterated game section
	subscribe("slideshow/slideChange", function(slideId) {
		console.log("Slide changed to:", slideId);
		currentSlideId = slideId;
		
		// Check if we're in the iterated (repeated) game
		isIteratedGame = slideId && slideId.indexOf("iterated") >= 0;
		console.log("Is iterated game:", isIteratedGame);
	});
	
	// Listen for round end, directly from PD logic
	subscribe("iterated/round/end", function(payoffs) {
		if (!isIteratedGame || !window.DataRecorder || !iteratedGame || !currentMove) {
			console.log("Skipping recording - missing required data");
			return;
		}
		
		try {
			// Get player move
			var displayMove = currentMove;
			if (displayMove === "TRIP") displayMove = PD.CHEAT + " (TRIP)";
			
			// Get opponent's move from the iterated game instance
			var opponentMove = iteratedGame.opponentLogic.lastMove;
			
			console.log("Recording round:", {
				playerMove: displayMove,
				opponentMove: opponentMove,
				payoffs: payoffs
			});
			
			// Record data
			DataRecorder.recordRound(
				displayMove,
				opponentMove || "unknown",
				payoffs
			);
			
			// Reset state
			currentMove = null;
			currentRound++;
		} catch (err) {
			console.error("Error recording game data:", err);
		}
	});
	
	// Backup recording approach - subscribe to basic move events
	subscribe("iterated/cooperate", function() {
		currentMove = PD.COOPERATE;
	});
	
	subscribe("iterated/cheat", function() {
		currentMove = PD.CHEAT;
	});
	
	subscribe("iterated/TRIP", function() {
		currentMove = "TRIP";
	});
	
	// Add direct recording to the iterated game, bypassing events entirely
	var checkInterval = setInterval(function() {
		if (window.Iterated && !window._patchedIterated) {
			console.log("Patching Iterated class");
			window._patchedIterated = true;
			
			// The actual patching is done at the top of this file
			
			clearInterval(checkInterval);
		}
	}, 500);
	
	// Debug function to check state
	window.checkGameRecorder = function() {
		console.log("Game recorder state:", {
			currentMove: currentMove,
			currentRound: currentRound,
			isIteratedGame: isIteratedGame,
			currentSlideId: currentSlideId,
			hasIteratedGame: !!iteratedGame
		});
		
		// Check session data
		if (window.DataRecorder) {
			var sessionData = DataRecorder.getSessionData();
			if (sessionData.rounds && sessionData.rounds.length > 0) {
				console.log("Last recorded round:", sessionData.rounds[sessionData.rounds.length - 1]);
			}
		}
		
		return "Recording status: " + (isIteratedGame ? "Active" : "Inactive");
	};
	
})();