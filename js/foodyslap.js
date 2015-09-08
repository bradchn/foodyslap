function document_ready() 
{
	$( '#content-wrapper' ).fadeIn("slow");
}

function disappear(element_id){
	document.getElementById(element_id).style.display = 'none';
}

function swipe_restaurant(swiped){
	if(swiped == true){
		$('#two').show();
		$('#one').hide();
		$('#three').show();
	}
	else{
		alert("chose this one!");
	}
	
}

function Card(name, categories, rating, opening, address, phone, url, id){
	this.name = name;
	this.categories = categories;
	this.rating = rating;
	this.opening = opening;
	this.address = address;
	this.phone = phone;
	this.id = id;
	this.html = document.createElement("div");
	this.html.id = this.id;
	this.html.className = "card_class";
	this.html.setAttribute("url", url);
	this.html.innerHTML = "<div class='innerCard'><div class='leftCol'> <h3 id='h'>" + this.name + 
		"</h3><p id='categories'>" + this.categories + "</p><p id ='opening'>" +
		 this.opening + "</p><p id = 'address'>" + this.address + 
		 "</p><p id='phone'>Phone Number:" + this.phone + 
		 "</p></div><div class='rightCol'><p id='rating'>" + this.rating +
		 "</p></div><div class='buttonContainer'><div class='actionButton openButton'" +
		 " onclick='openYelpPage();'>Open page</div><div class='actionButton dismissButton' " + 
		 "onclick='dismiss();'>Dismiss</div><div class='actionButton reloadButton' "+
		 "onclick='restoreCards();'>Reload Cards</div></div></div>";
}

var length = 0;

var slapCount = 0;

var dismiss = function(dirIsRight) { 
	console.log("slap");
	if (dirIsRight) {
		$("#" + slapCount).addClass("animateRight");
	} else {
		$("#" + slapCount).addClass("animateLeft");
	}

	slapCount++;
};

var openYelpPage = function() {

	if (slapCount < length) window.location = $("#" + slapCount).attr("url");

	console.log("thumbs up!");
};

var restoreCards = function() {
	$(".card_class").removeClass("animateRight");
	$(".card_class").removeClass("animateLeft");
	slapCount = 0;

	console.log("circle!");
};


function home_on_load() {

	GestureLib.slapCallback = dismiss;

	GestureLib.thumbsUpCallback = openYelpPage;

	GestureLib.circleCallback = restoreCards;

	getLocation();
}

function create_divs(data){
	$(".container").fadeIn(1000); 
	
	length = data.businesses.length;
	for(i = length-1; i >= 0; i--) {
		console.log("test");
		var name = data.businesses[i].name;
		var categories = data.businesses[i].categories;
		var rating = data.businesses[i].rating+" / 5.0";
		if(data.businesses[i].is_closed == false){
			var opening = "Open now!";
		}
		else{
			var opening = "Not open";
		}
		var address = data.businesses[i].location.display_address;
		var phone = data.businesses[i].display_phone;
		var url = data.businesses[i].url;

		var card = new Card(name, categories, rating, opening, address,phone,url, i);

		document.getElementById("template_card").appendChild(card.html);

	}
	//resize_text();
}

function resize_text(){
	$("#h").fitText(2, {minFontSize: '30px', maxFontSize: '70px' });
	$("#categories").fitText(1.4);
	$("#opening").fitText(1.1);
	$("#address").fitText(2.1);
	$("#phone").fitText(1);
}

function fade_to_main(){
	$("#content-wrapper").fadeOut(1000, redirectPage); 
}

function redirectPage() {
	window.location = "home.html";
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getPosition);
    } 
    else { 
        return "Geolocation is not supported by this browser.";
    }
}
function getPosition(position) {
    var lat = position.coords.latitude;
    var longit = position.coords.longitude;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET","foodThing.php?longit="+longit+"&latit="+lat,true)
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
            {
                create_divs(JSON.parse(xmlhttp.responseText)); 
            }
    }
    xmlhttp.send();
}