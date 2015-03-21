# Cordova
This js is use to communicate with android function even you can store your data in shared Preference instead of saving in webSQL. 

As you can see in Given JS There is one function onLoad(){.....}.
so tis function is apply in body 
		//<html>
		//<head>
		//inject given js hear 
		//<head>
		//<body onLoad=''onLoad() ">
		//</body>
........................

For IMEI number Use get_imei but in this js it is declared in onDeviceReady so it will give you IMEI number onload
but when You using get-imei javaScript function You have to write some  line in android activity.
		//in javascript
			var imei=window.YourActivityName.get_imei();

		//In android
		//WRITE THIS LINE IN ONCREATE
		appView.addJavascriptInterface(this, "YourActivityName"); 
 		//WRITE THIS FUNCTION AFTER ONCREATE
		@JavascriptInterface
		public String get_imei() {
       		TelephonyManager telephonyManager =(TelephonyManager)getSystemService(Context.TELEPHONY_SERVICE);
		  String imei = telephonyManager.getDeviceId();
		 return imei;    
		}
........................
store Your data in webSql using  database connection and query  ,and it will create your datadbase in websql
but if you dont want to store data in websql then use getSharedPreferences() function.
	 	 
	 	 
	 	  //in javascript
			var sharedPref = window.YourActivityName.getSharedPreferences();

		//In android
		//GET and SET SharedPreferences
	
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
		
	}
	
You can Capture Images also
	
	

