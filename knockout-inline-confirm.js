(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(["jquery", "knockout"], factory);
	} else {
		// Browser globals
		factory(jQuery, ko);
	}
}(this, function ($, ko) {
	ko.bindingHandlers.inlineConfirm = {
		init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
			var span = $('<span></span>').addClass('button__text');
			var progressBar = $("<div style='border-top: 2px solid'></div>");
			span.appendTo($(element));

			$(element).click(function () {
				var textValues = ko.utils.unwrapObservable(valueAccessor());
				var submitFunction = ko.utils.unwrapObservable(allBindingsAccessor().submitFunction);
				var showTimer = ko.utils.unwrapObservable(allBindingsAccessor().showTimer) || false;
				var timeOut = ko.utils.unwrapObservable(allBindingsAccessor().confirmTimeout) || 3000;
				var disabled = ko.utils.unwrapObservable(allBindingsAccessor().disable);

				if (!disabled) {
					var stepIndex = textValues.indexOf(span.text());
					if (stepIndex < textValues.length - 2) {
						element.resetTimer = setTimeout(function () {
							span.text(textValues[stepIndex]);
							//Remove the bootstrap danger class.
							$(element).removeClass("btn-danger");
							
							//Remove the progress bar.
							if (showTimer) {
								progressBar.remove();
							}
						}, timeOut);

						span.text(textValues[stepIndex + 1]);
						
						//Start progress bar.
						if (showTimer){
							var width = $(element).width();
							progressBar.width(width);
							progressBar.appendTo($(element));
							progressBar.animate({width: 0}, timeOut, "linear");
						}
						
						//Check if the element is bootstrapped. If so, add the bootstrap danger class.
						if ($(element).attr("class").toLowerCase().indexOf("btn-") >= 0) {
							$(element).addClass("btn-danger");
						}
					}
					else if (stepIndex === textValues.length - 2) {

						if (element.resetTimer) {
							clearTimeout(element.resetTimer);
							element.resetTimer = null;
						}

						$(element).addClass("is-busy");
						//Remove the bootstrap danger class.
						$(element).removeClass("btn-danger");
						
						//Stop the progress bar animation and remove it. 
						if(showTimer) {
							progressBar.stop(true, false);
							progressBar.remove();
						}
						
						span.text(textValues[textValues.length - 1]);

						if (submitFunction) {
							if (typeof (submitFunction) !== 'function') {
								throw new typeError('expected typeof "submitFunction" to be "function"');
							}
							submitFunction.call(ko.dataFor(this), ko.dataFor(this));
							//Reset the button after the function has finished executing.
							span.text(textValues[0]);
						}
					}
				}

				//let the click continue
				return !submitFunction && !disabled;
			});
		},
		update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
			var span = $(element).find('.button__text');
			span.text(ko.utils.unwrapObservable(valueAccessor())[0]);
			$(element).removeClass("is-busy");
		}
	};
}));
