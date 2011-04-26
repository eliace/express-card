

get '/users' do
	
	query = params[:query]
	
	case query
		when 'all'
			User.all.to_json(:only => [:id, :display_name, :login])
	end
	
end



put '/users' do
	
	json = JSON.parse(params[:_serialized])
	
	# здесь должна выполняться валидация полей
	json.delete 'password'
	
	User.create(json).to_json
	
end


post '/users/:id' do |id|
	
	json = JSON.parse(params[:_serialized])
	
	# здесь должна выполняться валидация полей
	json.delete 'password'
	
	User.update(id, json)
	
	JSON.generate json
end


post '/users/:id/password' do |id|
	d = Digest::SHA2.new
	User.update(id, {'password' => d.hexdigest(params[:password])})
end



delete '/users/:id' do |id|
	
	return if id == 1 #временный костыль, чтоб не удаляли системную учетку
	
	User.delete id
end