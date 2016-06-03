if (!window.Utils) {
	
	window.Utils = {
			
		WIDTH_100: '724px',
		WIDTH_66: '504px',
		WIDTH_50: '352px',
		WIDTH_33: '200px',
		WIDTH_25: '180px',
		WIDTH_20: '140px',
					
		replaceAll: function(text, stringToFind, stringToReplace) {
			 var temp = text;
			 var index = temp.indexOf(stringToFind);
			 while(index != -1){
				 temp = temp.replace(stringToFind,stringToReplace);
				 index = temp.indexOf(stringToFind);
			 }
			 return temp;
		},
		
		setObjWidth: function (obj) {
			var width = "100%";
			if ( obj.width != null ) {
				if ( obj.width.toUpperCase().contains("$_WIDTH")) {
					switch(obj.width) {
						case "$_WIDTH_100": obj.width = Utils.WIDTH_100; break;
						case "$_WIDTH_66": obj.width = Utils.WIDTH_66; break;
						case "$_WIDTH_50": obj.width = Utils.WIDTH_50; break;
						case "$_WIDTH_33": obj.width = Utils.WIDTH_33; break;
					}
				}
				width = parseInt(obj.width.replace("px",""));
			}
			return width;
		},

		loadingPanel: function (id, height) {
			var h = '25px';
			if ( height ) h = height;
			document.getElementById(id).innerHTML = "<div class='loadingPanel' style='height:"+ h +"'><img src='http://fenixapps.fao.org/crowdprices/src/images/loading.gif'></div>";
		 },

		 emptyPanel: function(id) {
		 	 var h = '25px';
		 	 $('#' + id).empty();
		 	 document.getElementById(id).innerHTML = "<div class='emptyPanel' style='height:"+ h +"'>No values available for the current selection</div>";
		 }
		

			
	};
	
}
