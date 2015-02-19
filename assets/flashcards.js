    var isFlipped = false; //boolean to set the state of the card
    var loadedXML; // the loaded xml data
    var frontSize = 0; 
    var backSize = 0;

	//Broswer detection
    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0; // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
    var isFirefox = typeof InstallTrigger !== 'undefined'; // Firefox 1.0+
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0; // At least Safari 3+: "[object HTMLElementConstructor]"
    var isChrome = !!window.chrome && !isOpera; // Chrome 1+
    var isIE = /*@cc_on!@*/ false || !!document.documentMode; // At least IE6
    var isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;


	//Load the XML, targetFile is the path to the XML file
    function loadFlashCard(targetFile) {

		//determine browser AJAX implementation
        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            var xmlhttp;
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        //wait for the xml to load, then call createFlashCard
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                loadedXML = xmlhttp.responseXML;
                createFlashCard(loadedXML);
            }
        }

        xmlhttp.open("GET", targetFile, false);
        xmlhttp.send();
    }

    window.onresize = function() {
        createFlashCard(loadedXML);
    }


    function createFlashCard(xmlData) {
		//read the XML data into variables
        var cardList = xmlData.getElementsByTagName('flashcard');
        var term = cardList[0].getElementsByTagName('term')[0].firstChild.wholeText;
        var definition = cardList[0].getElementsByTagName('definition')[0].firstChild.wholeText;
        var sidebarTextNode = cardList[0].getElementsByTagName('sidebar')[0].firstChild;
        var sidebarText;


		//if there is XML data for the sidebar...
        if (sidebarTextNode) {
            sidebarText = cardList[0].getElementsByTagName('sidebar')[0].firstChild.wholeText;
        }

        if (sidebarText === undefined) {
            //no sidebar content
            document.getElementById('ets_sidebar').style.display = 'none';
        } else {
            document.getElementById('ets_sidebar').innerHTML = sidebarText;
        }


        var cardText = document.getElementById('ets_cardText')



        //dynamically resize text to fit into flashcard
        var hSize;
        var vSize;
        var desired_width = 450;
        var desired_height = 400;

        var hResizer = document.getElementById('ets_textHSize');
        var vResizer = document.getElementById('ets_textVSize');
        hResizer.style.fontSize = 36 + 'px';
        vResizer.style.fontSize = 36 + 'px';

        if (!isFlipped) {
            hResizer.innerHTML = term;
            vResizer.innerHTML = term;
            cardText.innerHTML = term;
        } else {
            hResizer.innerHTML = definition;
            vResizer.innerHTML = definition;
            cardText.innerHTML = definition;
        }

        if (!isFlipped) {
            if (frontSize != 0) {
                cardText.style.fontSize = frontSize + 'px';
                return;
            }
        } else {
            if (backSize != 0) {
                cardText.style.fontSize = backSize + 'px';
                return;
            }
        }
		
		//resizing loop, continually checks if text is out of bounds and shrinks it until it is
        do {
            hSize = parseInt(window.getComputedStyle(hResizer, null).getPropertyValue('font-size'), 10);
            hResizer.style.fontSize = (hSize - 1) + 'px';
        } while (hResizer.scrollWidth > desired_width)

        document.getElementById('ets_textVSize').style.overflow = 'scroll';

        do {
            vSize = parseInt(window.getComputedStyle(vResizer, null).getPropertyValue('font-size'), 10);
            vResizer.style.fontSize = (vSize - 1) + 'px';
        } while (document.getElementById('ets_textVSize').scrollHeight > desired_height)

        document.getElementById('ets_textVSize').style.overflow = 'hidden';
        cardText.style.fontSize = vSize + 'px';

		//browser specific tweaks
        if (!isFlipped) {
            frontSize = vSize;

            if (isFirefox && isMac) {
                return;
            }

            if (!isMac && isChrome) {
                vSize--;
            }

            if (term.toString().indexOf("<img") != -1) {
                cardText.style.fontSize = (vSize - 2) + 'px';
                frontSize = vSize - 2;
            }

        } else {
            backSize = vSize;

            if (isFirefox && isMac) {
                return;
            }

            if (!isMac && isChrome) {
                vSize--;
            }

            if (definition.toString().indexOf("<img") != -1) {
                cardText.style.fontSize = (vSize - 2) + 'px';
                backSize = vSize - 2;
            }
        }
    }


	//flip the flashcard
    function flipCard() {
        isFlipped = !isFlipped;
        createFlashCard(loadedXML);

        var typeText = document.getElementById('ets_typeText');
        var clickText = document.getElementById('ets_clickText')

        if (!isFlipped) {
            typeText.innerHTML = 'Tapez votre réponse ci dessous.';
            clickText.innerHTML = 'Cliquez pour voir<br/> la bonne';
        } else {
            typeText.innerHTML = 'Comparez votre réponse à celle de la carte éclair et attribuez-vous une note.'
            clickText.innerHTML = '';
        }
    }
