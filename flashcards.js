window.onload = function() {
	//question object
	var Question = function(question, choices, answer){
		this.question = question;
		this.choices = choices;
		this.answer = answer;
	}

	Question.prototype.checkAnswer = function(choice){
		return this.answer == choice;
	}


	//flashcard app handler
	var App = function(cards){
		this.score = 0;
    	this.cards = cards;
    	this.currentQuestionIndex = 0;
    	this.answered = 0;
	}

	App.prototype = {
	    renderHTML:function(data){
			var index = 0;
			var cardHtml = '';
			var indicators = '';
			data.forEach(function(element) {
				if(index == 0){
					var active = 'id="activeCard"';
					var current = 'id="currentIndicator"';
				}else{
					var active = '';
					var current = '';
				}
				var answer = element.answer;
				var question = element.question;
				var choices = element.choices;
				var choicesHtml = '';
				choices.forEach(function(c) {
					choicesHtml += '<a class="choice" href="#">'+c+'</a>';
				});
				cardHtml += '<div '+active+' class="pfc_card" data-status="not-flipped" data-answered="not-answered">';
			    cardHtml +=		'<div class="card pfc_q">';
			    cardHtml +=        '<div class="text"><h4>'+question+'</h4></div>';
			    cardHtml +=        '<div class="choices-container">'+choicesHtml+'</div>';
			    cardHtml +=      '</div>';
			    cardHtml +=      '<div class="card pfc_a">';
			    cardHtml +=      	'<div class="alert-wrong"><h2>Wrong</h2></div>';
			    cardHtml +=      	'<div class="alert-right"><h2>Correct</h2></div>';
			    cardHtml +=         '<div class="text"><p>'+answer+' is the correct answer.</p></div>';
			    cardHtml +=    '</div>';
			    cardHtml +='</div>';
			    indicators += '<li class="indicator" data-id="'+index+'" '+current+'></li>';
				index++;
			});
			document.getElementById('pfc_card_wrap').innerHTML = cardHtml;
			document.getElementById('nav').innerHTML = indicators;
	    },
	    totalCards:function() {
		    return this.cards.length;
		},
		getCurrentQuestion:function() {
		    return this.cards[this.currentQuestionIndex];
		},
		guess:function(answer) {
		    if(this.getCurrentQuestion().checkAnswer(answer)) {
		        this.score++;
		    }
		    this.answered++;
		    return this.getCurrentQuestion().checkAnswer(answer);
		},
		cardHandler:function(index) {
			if (index == 1) {
				if (this.currentQuestionIndex == this.cards.length-1) {
					this.currentQuestionIndex = 0;
					this.updateCardIndex(0);
				}else{
					this.currentQuestionIndex++;
					this.updateCardIndex(this.currentQuestionIndex++);
				}
			}else if(index == -1){
				if (this.currentQuestionIndex == 0) {
					this.currentQuestionIndex = this.cards.length-1
					this.updateCardIndex(this.cards.length-1);
				}else{
					this.currentQuestionIndex--;
					this.updateCardIndex(this.currentQuestionIndex--);
				}	
			}
			return this.currentQuestionIndex;
		},
		updateCardIndex:function(index){
			this.currentQuestionIndex = index;
			return this.currentQuestionIndex;
		},
		activeCard:function() {
			return this.currentQuestionIndex;
		},
		flipBtnHandler:function(bool) {
			if (bool) {
				document.getElementById('btn_flip').className = 'flip-btn active';
				document.getElementById('btn_inactive').className = 'flip-btn';
			}else{
				document.getElementById('btn_inactive').className = 'flip-btn active';
				document.getElementById('btn_flip').className = 'flip-btn';
			}
		},
		calculateScore:function(){
			var right = this.score;
			var total = this.cards.length;
			var percent = ((100/total)*right);
			return percent;
		},
		isOver:function(){
			if(this.answered == this.cards.length){
				return true;
			}else{
				return false;
			}
		},
		percentageAnswered:function(){
			var answered = this.answered;
			var total = this.cards.length;
			var percent = ((100/total)*answered);
			return percent;
		}
	}


	// app ui
	var appUI = {
		init:function(){
			this.testAnswer();
			this.next();
			this.prev();
			this.indicatorHandler();
			this.flipCard();
			this.numerical();
		},
    	testAnswer:function(){
    		var result;
			var choicePicked = document.getElementsByClassName('choice');
	    	var testAnswerFunction = function(e) {
	    		e.preventDefault();
	    		var status = document.getElementById('activeCard').getAttribute('data-answered');
	    		//allow question to only be answered once
	    		if (status == 'not-answered') {
	    			result = fcApp.guess(this.innerHTML);
	    			document.getElementById('activeCard').setAttribute('data-answered', 'answered');
	    			appUI.answerHandler(result);
	    		};
			};
			for (var i = 0; i < choicePicked.length; i++) {
			    choicePicked[i].addEventListener('click', testAnswerFunction, false);
			}
		},
		answerHandler:function(result){
			 if(result){
			 	document.getElementById('activeCard').className = 'pfc_card answered c';
			 	document.getElementById('currentIndicator').className = 'indicator r';
			 }else{
			 	document.getElementById('activeCard').className = 'pfc_card answered w';
			 	document.getElementById('currentIndicator').className = 'indicator w';
			 }
			 fcApp.flipBtnHandler(true);
			 var percent = fcApp.calculateScore();
			 document.getElementById('pfc_score').innerHTML = percent+'%';
			 var isOver = fcApp.isOver();
			 if (isOver) {
			 	document.getElementById('finalScore').innerHTML = 'Your final score is '+percent+'%';
			 	document.getElementById('finalScore').style.display = 'block';
			 }
			 var answered = fcApp.percentageAnswered();
			 var percentBar = document.getElementById('statusBar');
			 var tween = TweenMax.to(percentBar, .5, {width:answered+'%', ease:Linear.easeNone});
		},
		flipCard:function(allowed){
			document.getElementById('btn_flip').addEventListener('click', flipFunction, false);
			document.getElementById('btn_inactive').addEventListener('click', prev, false);
			function prev(e){
				e.preventDefault();
			}
			function flipFunction(e) {
				e.preventDefault();
			  	var activeCard = document.getElementById('activeCard');
			  	var cardStatus = activeCard.getAttribute('data-status');
			  	if(cardStatus == 'not-flipped'){
			  		var flip = TweenMax.to(activeCard, .5, {css:{transform:"rotateY(180deg)"}});
					activeCard.setAttribute('data-status', 'flipped');
			  	}else{
			  		var flip = TweenMax.to(activeCard, .5, {css:{transform:"rotateY(0deg)"}});
					activeCard.setAttribute('data-status', 'not-flipped');
			  	}
			}
		},
		next:function(){
			var next = document.getElementById('next');
			next.addEventListener('click',function(e){
				e.preventDefault();
				var newIndex = fcApp.cardHandler(1);
				var cards = document.getElementsByClassName('pfc_card');
				TweenMax.to(cards, .5, {
					css:{
						opacity:0, 
						left:-100 
					},
					onComplete:setNewCard
				});
				function setNewCard() {
				    var currentcard = document.getElementById('activeCard').setAttribute('id', '');
				    cards[newIndex].setAttribute('id', 'activeCard');
				    var answered = document.getElementById('activeCard').getAttribute('data-answered');
				    var oldIndicator = document.getElementById('currentIndicator').setAttribute('id','');
					var newIndicator = document.getElementsByClassName('indicator')[newIndex].setAttribute('id', 'currentIndicator');
					if (answered == 'answered') {
						fcApp.flipBtnHandler(true);
					}else{
						fcApp.flipBtnHandler(false);
					}
					appUI.numerical();
				    TweenMax.fromTo('#activeCard', .5,{
			    	    left: 200,
			    	    opacity: 0
			  		},{
			  			left: 60,
			    	    opacity: 1
					});
				}
			});
		},
		prev:function(){
			var prev = document.getElementById('prev');
			prev.addEventListener('click',function(e){
				e.preventDefault();
				var newIndex = fcApp.cardHandler(-1);
				var cards = document.getElementsByClassName('pfc_card');
				TweenMax.to(cards, .5, {
					css:{
						opacity:0, 
						left:100 
					},
					onComplete:setNewCard
				});
				function setNewCard() {
				    var currentcard = document.getElementById('activeCard').setAttribute('id', '');
				    cards[newIndex].setAttribute('id', 'activeCard');
				    var oldIndicator = document.getElementById('currentIndicator').setAttribute('id','');
					var newIndicator = document.getElementsByClassName('indicator')[newIndex].setAttribute('id', 'currentIndicator');
					var answered = document.getElementById('activeCard').getAttribute('data-answered');
					if (answered == 'answered') {
						fcApp.flipBtnHandler(true);
					}else{
						fcApp.flipBtnHandler(false);
					}
					appUI.numerical();
					appUI.flipCardStatus();
				    TweenMax.fromTo('#activeCard', .5,{
			    	    left: -100,
			    	    opacity: 0
			  		},{
			  			left: 60,
			    	    opacity: 1
					});
				}
			});
		},
		indicatorHandler:function(){
			var indicators = document.getElementsByClassName('indicator');
			for (var i = 0; i < indicators.length; i++) {
			    indicators[i].addEventListener('click', indicatorFunction, false);
			}
			function indicatorFunction(){
				var clickedIndicator = this.getAttribute('data-id');
				var activeCard = fcApp.activeCard();
				if (clickedIndicator != activeCard) {
					document.getElementById('currentIndicator').setAttribute('id','');
					var cards = document.getElementsByClassName('pfc_card');
					TweenMax.to(cards, .5, {
						css:{
							opacity:0, 
							left:100 
						},
						onComplete:setNewCard
					});
					function setNewCard() {
					    var currentcard = document.getElementById('activeCard').setAttribute('id', '');
					    cards[clickedIndicator].setAttribute('id', 'activeCard');
					    fcApp.updateCardIndex(clickedIndicator);
						var answered = document.getElementById('activeCard').getAttribute('data-answered');
						if (answered == 'answered') {
							fcApp.flipBtnHandler(true);
						}else{
							fcApp.flipBtnHandler(false);
						}
						appUI.numerical();
					    TweenMax.fromTo('#activeCard', .5,{
				    	    left: -50,
				    	    opacity: 0
				  		},{
				  			left: 60,
				    	    opacity: 1
						});
					}
					this.setAttribute('id','currentIndicator');
					appUI.flipCardStatus();
				};
			}
		},
		flipCardStatus:function(){
			var cards = document.getElementsByClassName('pfc_card');
			for (var i = 0; i < cards.length; i++) {
				console.log(cards[i]);
			    var flip = TweenMax.to(cards[i], .5, {css:{transform:"rotateX(0deg)"}});
			}
		},
		numerical:function(index){
			var index = fcApp.activeCard();
			var total = fcApp.totalCards();
			if(index){
				var index = parseFloat(index) + 1;
			}else{
				var index = 1;
			}
			var numerical = '<span id="cardIndex">'+index+'</span> out of ' + total;
			document.getElementById('numerical').innerHTML = numerical;
		}
    }

	// create questions
	var questions = [
		q1 = new Question(
			'In "The Mango", which market / store is Kramer banned from ?', 
			["John's Fruit Stand", "Mike's Fruit Stand", "Joe's Fruit Stand", "Tim's Fruite Stand"],
			"Joe's Fruit Stand"
		),
		q2 = new Question(
			'In "The Sniffing Accountant", Elaine is annoyed when her boyfriend, Jake, forgets to put what on a note he left for her ?', 
			["A Name", "An Exclamation Point", "A Time and Date", "A Question Mark"],
			"An Exclamation Point"
		),
		q3 = new Question(
			'In "The Bris", after Stan and Myra relieve Elaine and Jerry of there godparent duties, who do they choose to replace them ?', 
			["George", "Newman", "Uncle Leo", "Kramer"],
			"Kramer"
		),
		q4 = new Question(
			'In "The Lip Reader", which famous female tennis player is competing during Kramer\'s first time being a ball boy ?', 
			["Steffi Graf", "Mary Pierce", "Monica Seles", "Jennifer Capriati"],
			"Monica Seles"
		),
		q5 = new Question(
			'In "The Non-Fat Yogurt", what did George say he banged his elbow on, to make it have the spasms ?', 
			["A desk", "A door", "A table", "A kitchen counter"],
			"A desk"
		),
	]




	//create new FC app
	var fcApp = new App(questions);

	//call method to build html
	fcApp.renderHTML(questions);
	appUI.init();
}

