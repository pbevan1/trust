/**
 * Data Recorder - Captures participant interactions
 * Simplified version for the trust game
 */
(function(exports){

	// Participant data
	var participantID = null;
	var sessionData = {
		id: null,
		timestamp: null,
		rounds: []
	};

	// Set participant ID
	exports.setParticipantID = function(id) {
		participantID = id;
		sessionData.id = id;
		sessionData.timestamp = Date.now();
		sessionData.rounds = [];
		
		// Store initial session info
		saveSessionData();
		
		return participantID;
	};

	// Record a round
	exports.recordRound = function(playerMove, opponentMove, payoffs) {
		if(!participantID) return; // Don't record if no participant ID
		
		// Safety check for payoffs
		if (!payoffs || typeof payoffs !== 'object') {
			payoffs = [0, 0]; // Default if missing
		}
		
		var roundData = {
			round: sessionData.rounds.length + 1,
			timestamp: Date.now(),
			playerMove: playerMove || "unknown",
			opponentMove: opponentMove || "unknown",
			playerPayoff: payoffs[0],
			opponentPayoff: payoffs[1]
		};
		
		console.log("Recording data:", roundData);
		
		sessionData.rounds.push(roundData);
		
		// Save after each round
		saveSessionData();
	};
	
	// Get all session data
	exports.getSessionData = function() {
		return sessionData;
	};
	
	// Export data as JSON string
	exports.exportData = function() {
		return JSON.stringify(sessionData, null, 2);
	};
	
	// FIXED: Hard-code the correct CSV structure
	exports.exportAllAsCSV = function() {
		try {
			// Create CSV header
			var csv = "participant_id,round,timestamp,player_move,opponent_move,player_payoff,opponent_payoff\n";
			
			// Get all participant IDs
			var sessions = exports.listSessions();
			
			// For each participant
			sessions.forEach(function(id) {
				try {
					// Get their data
					var data = localStorage.getItem('trust_session_' + id);
					if (!data) return;
					
					var sessionData = JSON.parse(data);
					if (!sessionData || !sessionData.rounds) return;
					
					// For each round they played
					sessionData.rounds.forEach(function(round) {
						// Format each field, handling nulls/undefined
						var line = [
							id || "",
							round.round || "",
							round.timestamp || "",
							round.playerMove || "unknown",
							round.opponentMove || "unknown",
							round.playerPayoff !== undefined ? round.playerPayoff : "",
							round.opponentPayoff !== undefined ? round.opponentPayoff : ""
						].join(",");
						
						// Add to CSV
						csv += line + "\n";
					});
				} catch (err) {
					console.error("Error processing participant data:", id, err);
				}
			});
			
			return csv;
		} catch (err) {
			console.error("Error generating CSV:", err);
			return "Error generating CSV";
		}
	};
	
	// Save data to localStorage
	function saveSessionData() {
		if(!participantID) return;
		
		try {
			// Store current session
			localStorage.setItem('trust_session_' + participantID, JSON.stringify(sessionData));
			
			// Update master list of sessions
			var sessions = JSON.parse(localStorage.getItem('trust_sessions') || '[]');
			if(!sessions.includes(participantID)) {
				sessions.push(participantID);
				localStorage.setItem('trust_sessions', JSON.stringify(sessions));
			}
		} catch(e) {
			console.error("Failed to save session data:", e);
		}
	}
	
	// Load existing session data if available
	exports.loadSessionData = function(id) {
		try {
			var data = localStorage.getItem('trust_session_' + id);
			if(data) {
				return JSON.parse(data);
			}
		} catch(e) {
			console.error("Failed to load session data:", e);
		}
		return null;
	};
	
	// Load active session
	exports.loadSession = function(id) {
		var data = exports.loadSessionData(id);
		if(data) {
			sessionData = data;
			participantID = id;
			return true;
		}
		return false;
	};
	
	// List all saved sessions
	exports.listSessions = function() {
		try {
			return JSON.parse(localStorage.getItem('trust_sessions') || '[]');
		} catch(e) {
			console.error("Failed to list sessions:", e);
			return [];
		}
	};
	
	// Clear all data (for testing)
	exports.clearAllData = function() {
		var sessions = exports.listSessions();
		sessions.forEach(function(id) {
			localStorage.removeItem('trust_session_' + id);
		});
		localStorage.removeItem('trust_sessions');
	};
	
})(window.DataRecorder = window.DataRecorder || {});