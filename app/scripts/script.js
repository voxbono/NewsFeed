$(function(){
	myNameSpace.myApp.init({
		wrapper : '.wrapper'
		// defaultView : views.renderCategory
	});
});

var myNameSpace = {};
myNameSpace.myApp = (function () {

	var feed = [];
	var $pluginWrapper;

	var settings = {
		url : "http://rexxars.com/playground/testfeed/?callback=myApp.callback",
		wrapper : 'body'
	}

	var helpers = {

		sortByDate : function (data) {

			var tempData = data;

			for(var i in tempData) {
				
				tempData[i].formattedDate = new Date(tempData[i].date + ' ' +tempData[i].time);
			}

			var sortedList = _.sortBy(tempData, 
				function (tempData) {

					return -tempData.formattedDate; 
				}
			);

			return sortedList;
		},

		sortByCategory : function (data) {

			var categories = {};

			for(var i in data) {

				var currentCategory = data[i].category ? data[i].category : 'Ukjent';

				if(!categories[currentCategory]) {

					categories[currentCategory] = new Array(data[i]);
				} 
				else {

					categories[currentCategory].push(data[i]);
				}
			}

			return categories;
		},

		getFeed : function()
		{
			$.ajax({
				type : 'get',
				dataType : 'jsonp',
				crossDomain : true,
				url : settings.url,
				success : settings.defaultView,
				error : function (e) {
					console.log(e.message);
				}
			})
		}
	}

	var views = {
		renderByDate : function (data) {

			var templateData = {items: helpers.sortByDate(data)};
			views.renderFeed(data, '#sortedByDateTemplate', '.dateSorting', templateData);
		},

		renderCategory : function (data) {

			var templateData = {categories: helpers.sortByCategory(data)};
			views.renderFeed(data, '#sortedByCategoryTemplate', '.categorySorting', templateData);
		},

		renderCompressed : function (data) {
			var templateData = {items: helpers.sortByDate(data)};
			views.renderFeed(data, '#compressedTemplate', '.compressedView', templateData);
		},

		renderFeed : function (data, templateId, buttonClass, templateData) {
			feed = data;
			$pluginWrapper.find('.active').removeClass('active');
			$pluginWrapper.find(buttonClass).addClass('active');
			var tmplMarkup = $(templateId).html();
			var compiledTmpl = _.template( tmplMarkup, templateData );
			$(compiledTmpl).appendTo('.pluginWrapper');
		},

		rendermenu : function() {

			var tmplMarkup = $('#menuTemplate').html();
			var compiledTmpl = _.template( tmplMarkup, {} );
			var $compiledTmpl = $( compiledTmpl );
			$compiledTmpl.appendTo( $(settings.wrapper) );

			$pluginWrapper = $('.pluginWrapper');

			$compiledTmpl
				.find('button')
				.on('click', function() {

					var $topNode = $('.pluginWrapper .topNode');

					if( $(this).hasClass('dateSorting') ) {

						$topNode.remove();
						views.renderByDate( feed );
					}
					else if( $(this).hasClass('categorySorting') ) {

						$topNode.remove();
						views.renderCategory(feed);
					}
					else if( $(this).hasClass('compressedView') ) {

						$topNode.remove();
						views.renderCompressed(feed);
					}
				});
		}
	}

	
	return {
		init : function(options) {

			settings.defaultView = views.renderByDate;

			// Override settings if provided
			for(var i in options)
			{
				if(settings[i]) {
					settings[i] = options[i];
				}
				else {
					throw '"' + i + '"' + ' is an illegal option.';
				}
			}

			views.rendermenu();
			helpers.getFeed();
		}
	}
})();