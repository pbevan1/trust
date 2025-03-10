var slideshow, slideSelect;
window.onload = function(){

	// Check if redirected from participant page
	var currentParticipantID = localStorage.getItem('current_participant_id');
	if(!currentParticipantID) {
		// Redirect to participant entry if no ID
		window.location.href = 'participant.html';
		return;
	}

	// Initialize data recorder
	DataRecorder.setParticipantID(currentParticipantID);

	// PRELOADER
	Q.all([
		Loader.loadAssets(Loader.manifestPreload),
		Words.convert("words.html")
	]).then(function(){

		// CHANGE DOM
		document.body.removeChild($("#preloader"));
		$("#main").style.display = "block";
		$("#footer").style.display = "block";

		// Add participant ID display
		var participantBadge = document.createElement("div");
		participantBadge.id = "participant-badge";
		participantBadge.innerHTML = "Participant: " + currentParticipantID;
		participantBadge.style.position = "absolute";
		participantBadge.style.top = "10px";
		participantBadge.style.right = "10px";
		participantBadge.style.backgroundColor = "rgba(0,0,0,0.2)";
		participantBadge.style.color = "#fff";
		participantBadge.style.padding = "5px 10px";
		participantBadge.style.borderRadius = "5px";
		participantBadge.style.fontSize = "12px";
		document.body.appendChild(participantBadge);

		// Add export link
		var exportLink = document.createElement("a");
		exportLink.href = "export.html";
		exportLink.innerHTML = "Export Data";
		exportLink.style.position = "absolute";
		exportLink.style.bottom = "10px";
		exportLink.style.right = "10px";
		exportLink.style.color = "#999";
		exportLink.style.fontSize = "12px";
		exportLink.style.textDecoration = "none";
		exportLink.style.padding = "5px";
		document.body.appendChild(exportLink);

		// Slideshow
		slideshow = new Slideshow({
			dom: $("#slideshow"),
			slides: SLIDES
		});

		// Slide Select
		slideSelect = new SlideSelect({
			dom: $("#select"),
			slides: SLIDES
		});
		slideSelect.dom.style.display = "none";
		subscribe("start/game", function(){
			slideSelect.dom.style.display = "block";
			$("#translations").style.display = "none";

			// [FOR DEBUGGING]
			publish("slideshow/next");
			//publish("slideshow/scratch", ["credits"]);

		});

		// SOUND
		var _soundIsOn = true;
		$("#sound").onclick = function(){
			_soundIsOn = !_soundIsOn;
			Howler.mute(!_soundIsOn);
			$("#sound").setAttribute("sound", _soundIsOn?"on":"off");
		};

		// LOAD REAL THINGS
		Loader.loadAssets(
			Loader.manifest,
			function(){
				publish("preloader/done");
			},
			function(ratio){
				publish("preloader/progress", [ratio]);
			}
		);

		// First slide!
		slideshow.nextSlide();

	});

};