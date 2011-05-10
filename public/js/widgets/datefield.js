


Dino.declare('Medic.widgets.DateField', 'Dino.widgets.TextField', {
	
	defaultOptions: {
		cls: 'dino-form-field',
		components: {
//			input: {
//				format: function(val) {return val}
//			},
      button: {
        role: 'actor',
        dtype: 'icon-button',
        icon: 'silk-icon-date',
        onAction: function() {
          this.parent.input.el.datepick('show');
        }
      }
//			'dropdown!': {
//				dtype: 'box'
//			}
		}
	},
	
	$afterBuild: function() {
		var self = this;
		this.input.el.datepick({
			defaultDate: new Date(),
//			showOnFocus: true,
			dateFormat: $.datepick.ISO_8601,
			onSelect: function(dates) {
				var date0 = dates[0];
				self.setValue($.datepick.formatDate($.datepick.ISO_8601, date0));
			}
		});
	},
	
//	showDropdown: function() {
//		this.input.el.datepick('show');
//	},
//	
//	hideDropdown: function() {
//		this.input.el.datepick('hide');
//	}
	
	
}, 'datefield');





Dino.declare('Medic.widgets.DateEditor', 'Dino.widgets.TextEditor', {
	
	defaultOptions: {
		dropdownOnFocus: true,
    components: {
      input: {
				readOnly: true,
				events: {
					'click': function(e, w) {
						w.el.datepick('show');
					}
				},
//        format: function(val){ return val; }
      },
      button: {
        dtype: 'action-icon',
        cls: 'silk-icon-date',
        onAction: function() {
          this.parent.input.el.datepick('show');
        }
      }
    },
    onCreated: function() {
      var self = this;
      
      this.input.el.datepick({
        dateFormat: $.datepick.ISO_8601, 
        showOnFocus: false, 
        onSelect: function(dates){
          var date = dates[0];
          self.setValue($.datepick.formatDate($.datepick.ISO_8601, date));
        }, 
        onClose: function(){
          if(self.parent) self.parent.stopEdit();
        }
      });              
    },
//    overrides: {
//      showDropdown: function() {
//        this.input.el.datepick('show');                
//      }
//    }
		
	}
	
}, 'date-editor');
