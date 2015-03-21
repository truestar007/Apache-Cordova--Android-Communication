function onLoad() {
	//alert("DEBUGGING: we are in the onBodyLoad() function");
	
	if (!window.openDatabase) {
		//alert('Databases are not supported in this browser.');
		return;
	}

	db = openDatabase(shortName, version, displayName,maxSize);
	db.transaction(function(tx){

		tx.executeSql( 'CREATE TABLE IF NOT EXISTS Event(EventId INTEGER NOT NULL PRIMARY KEY, EventName TEXT NOT NULL, FromDate TEXT NOT NULL, ToDate TEXT NOT NULL, EventVenue TEXT NOT NULL, EventDescription TEXT )', [],nullHandler,errorHandler);

		tx.executeSql( 'CREATE TABLE IF NOT EXISTS User(Active INTEGER NOT NULL)', [],nullHandler,errorHandler);

		tx.executeSql( 'CREATE TABLE IF NOT EXISTS FirstRun(FirstRunStatus INTEGER NOT NULL )', [],nullHandler,errorHandler);

	},errorHandler,successCallBack);

	document.addEventListener("deviceready", onDeviceReady, false);
}

function ListDBValues() {

	if (!window.openDatabase) {
		alert('Databases are not supported in this browser.');
		return;
	}
} 

var pictureSource; // picture source
var destinationType; // sets the format of returned value

//FOR DATABASE CONNECTIVITY
var db;
var shortName = 'ArtFixDB';
var version = '1.0';
var displayName = 'ArtFixDB';
var maxSize = 65535;
var check=false;
var activeInactive=false;

// this is called when an error happens in a transaction
function errorHandler(transaction, error) {
	alert('Error: ' + error.message + ' code: ' + error.code);
}

// this is called when a successful transaction happens
function successCallBack() {
	//alert("DEBUGGING: success");
}

//DATABASE NULL HANDLER
function nullHandler(){};

function onDeviceReady() {

	//GET IMEI NUMBER 
	/*
			//WRITE THIS LINE IN ONCREATE
					appView.addJavascriptInterface(this, "YourActivityName"); 
			 
			 //WRITE THIS FUNCTION AFTER ONCREATE
					@JavascriptInterface
					public String get_imei() {
						TelephonyManager telephonyManager = (TelephonyManager)getSystemService(Context.TELEPHONY_SERVICE);
						String imei = telephonyManager.getDeviceId();
						return imei;    
					}
	*/
	getIMEI();
	
	//GET and SET SharedPreferences
	/*
		@JavascriptInterface
	public String getSharedPreferences(){
	 
		SharedPreferences prefs = getSharedPreferences("TEST", MODE_PRIVATE); 
		
		  String name = prefs.getString("name", "No name defined");//"No name defined" is the default value.
		  return name;    
	}
	
	@JavascriptInterface
	public void setSharedPreferences(){
	 
		SharedPreferences.Editor editor = getSharedPreferences("TEST", MODE_PRIVATE).edit();
		 editor.putString("name", "KEVAL");
		editor.commit();
		return;
		
	}*/
	
	getSharedPreferencesValue();
	
	//OVERRIDE DEVICE BACK BUTTON
	document.addEventListener("backbutton", onBackKeyDown, false);
	
	//CHECK INTERNET CONNECTIVITY
	checkConnection();
	
	//SPLASH SCREEN
	navigator.splashscreen.hide();
	
	//CAMERA & IMAGE UPLOAD FUNCTION
	pictureSource = navigator.camera.PictureSourceType;
	destinationType = navigator.camera.DestinationType;

}

//DEVICE BACK PRESSED
function onBackKeyDown() {

	if (document.URL === "file:///android_asset/www/index.html#/homePage") {
		device.exitApp();
		
	} else if (document.URL === "file:///android_asset/www/index.html#/welcomePage") {
		menu.slideToggle();
		return;
		
	}else if (document.URL === "file:///android_asset/www/index.html#/galleryImagePage") {
		if(check){
			$(".zoom").fadeOut("slow");
			check=false;
		}else{
			history.back();
		}

	}  else {
		$('#headerRightItem').html('');
		history.back();
	}

}

function checkConnection() {
	db.transaction(function(transaction) {

		transaction.executeSql('SELECT * FROM User;', [],	function(transaction, result) {
			if(result.rows.length==0){
				//alert("On First Load Of Application");
				transaction.executeSql('INSERT INTO User(Active) VALUES("11")',[], nullHandler,errorHandler);
			}
		},errorHandler);
	},errorHandler,nullHandler);
	
	var networkState = navigator.network.connection.type;

	var states = {};
	states[Connection.UNKNOWN] = 'Unknown connection';
	states[Connection.ETHERNET] = 'Ethernet connection';
	states[Connection.WIFI] = 'WiFi connection';
	states[Connection.CELL_2G] = 'Cell 2G connection';
	states[Connection.CELL_3G] = 'Cell 3G connection';
	states[Connection.CELL_4G] = 'Cell 4G connection';
	states[Connection.NONE] = 'No network connection';
	if (states[networkState] === 'No network connection') {
		//alert("Network State : " + states[networkState]);

		db.transaction(function(transaction) {
			transaction.executeSql('SELECT * FROM User;', [], function(transaction, result) {
				if (result != null && result.rows != null) {
					for (var i = 0; i < result.rows.length; i++) {
						var row = result.rows.item(i);
						//alert("Get the Initial Database Value: " + row.Active);
						if(row.Active == 11){
							alert("To activate the application please connect to internet");
							if (confirm('Application will close')) {
								device.exitApp();
							} else {
								device.exitApp();
							}
						}else if(row.Active == 0){
							activeInactive=true;
							$(".activeInactive").show();
						}
					}
				}
			},errorHandler);
		},errorHandler,nullHandler);


	} else {
		//FAR CALLING CONTROLLER METHOD USING AN ID POINTING TO A COMPONENT IN HTML
		//angular.element(document.getElementById('activeContentId')).scope().applicationStatus();
		
		//SIMPLE JQUERY AJAX CALL
		/*$.get("http://120.63.158.141:8080/ArtFix/services/vendor",function(data,status){
			alert("Data: " + data + "\nStatus: " + status);
		});*/

		//AJAX CALL
		$.ajax({
			url: 'http://120.63.158.141:8080/ArtFix/services/vendor',
			data: {
				format: 'json'
			},
			error: function() {
				//ListDBValues();
			},
			dataType: 'json',
			success: function(data) {
				AddValueToDB(data.value);
			},
			type: 'GET'
		});

	}

}

//-------  START  ------------DATABASE ENTRY WHEN INTERNET CONNECTION IS ON---------------------------
function AddValueToDB(value) {

	if (!window.openDatabase) {
		alert('Databases are not supported in this browser.');
		return;
	}

	// this is the section that actually inserts the values into the User table
	db.transaction(function(transaction) {

		transaction.executeSql('SELECT * FROM User;', [],	function(transaction, result) {
			if(result.rows.length==0){
				transaction.executeSql('INSERT INTO User(Active) VALUES("'+value+'")',[], nullHandler,errorHandler);
			}else{
				transaction.executeSql('UPDATE User SET Active="'+value+'"',[], nullHandler,errorHandler);
			}

		},errorHandler);
	},errorHandler,nullHandler);

	// this calls the function that will show what is in the User table in the database
	ListDBValues();

	return false;
} 


function ListDBValues() {

	if (!window.openDatabase) {
		alert('Databases are not supported in this browser.');
		return;
	}

	// this next section will select all the content from the User table and then go through it row by row
	// appending the UserId  FirstName  LastName to the  #lbUsers element on the page
	db.transaction(function(transaction) {
		transaction.executeSql('SELECT * FROM User;', [], function(transaction, result) {
			if (result != null && result.rows != null) {
				for (var i = 0; i < result.rows.length; i++) {
					var row = result.rows.item(i);
					alert("Get the Inserted Values From Database: " + row.Active);
					if(row.Active !== 1){
						activeInactive=true;
						$(".activeInactive").show();
					}
				}
			}
		},errorHandler);
	},errorHandler,nullHandler);

	return;

} 
//--------  END  -----------DATABASE ENTRY WHEN INTERNET CONNECTION IS ON---------------------------


// Called when a photo is successfully retrieved
function onPhotoDataSuccess(imageData) {
	// Uncomment to view the base64-encoded image data
	console.log(imageData);

	// Get image handle
	var smallImage = document.getElementById('smallImage');

	// Unhide image elements
	smallImage.style.display = 'block';

	// Show the captured photo The in-line CSS rules are used to resize the image
	smallImage.src = "data:image/jpeg;base64," + imageData;
}

// Called when a photo is successfully retrieved
function onPhotoURISuccess(imageURI) {
	// Uncomment to view the image file URI
	console.log(imageURI);

	// Get image handle
	var largeImage = document.getElementById('largeImage');

	// Unhide image elements
	largeImage.style.display = 'block';

	// Show the captured photo The in-line CSS rules are used to resize the image
	largeImage.src = imageURI;
}

// A button will call this function
function capturePhoto() {
	// Take picture using device camera and retrieve image as base64-encoded string
	navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
		quality : 50,
		destinationType : destinationType.DATA_URL
	});
}

// A button will call this function
function getPhoto(source) {

	// Retrieve image file location from specified source
	navigator.camera.getPicture(onPhotoURISuccess, onFail, {
		quality : 50,
		destinationType : destinationType.FILE_URI,
		sourceType : source
	});
}

// Called if something bad happens.
function onFail(message) {
	alert('Failed because: ' + message);
}

function getIMEI() {
	var imei=window.YourActivityName.get_imei();
	return imei;
}

function getSharedPreferencesValue() {
	var sharedPref = window.YourActivityName.getSharedPreferences();
	return sharedPref;
}



