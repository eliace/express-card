


Medic.LogoutBox = $.dino({
	dtype: 'box',
	cls: 'logout-box',
	items: [{
		dtype: 'text-item',
		cls: 'user-name',
		icon: 'silk-icon-user',
		data: loggedUser,
		content: {
			dataId: 'name'
		}
	}, {
		dtype: 'text-item',
		cls: 'user-logout',
		text: 'Выход',
		xicon: 'silk-icon-bullet-go',
		events: {
			'click': function() {
				$.get('/logout', function(){window.location.href='/';});
			}
		}		
	}]
/*	
	defaultItem: {
		width: 60
	},
	items: [{
		dtype: 'input',
		text: 'Логин'
	}, {
		dtype: 'password',
		text: 'Пароль'		
	}]
*/	
});
